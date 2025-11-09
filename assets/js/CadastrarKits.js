const reagentesContainer = document.getElementById("reagentes-container");
const materiaisContainer = document.getElementById("materiais-container");
const equipamentosContainer = document.getElementById("equipamentos-container");

let estoqueReagentes = [];
let estoqueMateriais = [];
let estoqueEquipamentos = [];

//==========================
// Carregar estoque do backend
//==========================

async function carregarEstoque() {
    try {
        const resp = await fetch("http://localhost:5000/estoque");
        const estoque = await resp.json();

        estoqueReagentes = estoque.reagentes || [];
        estoqueMateriais = estoque.materiais || [];
        estoqueEquipamentos = estoque.equipamentos || [];
    } catch (err) {
        console.error("Erro ao carregar estoque:", err);
        alert("Não foi possível carregar o estoque!");
    }
}
carregarEstoque();

//==========================
// Criar itens do formulário
//==========================

function criarItem(container, estoque, classeNome, classeQtd, nome = "", qtd = 1) {
    const div = document.createElement("div");
    div.classList.add("item");

    const select = document.createElement("select");
    select.classList.add(classeNome);
    select.innerHTML = `<option value="">-- Selecione --</option>` +
        estoque.map(e => `<option value="${e.nome}">${e.nome} (${e.quantidade} ${e.unidade})</option>`).join("");

    select.value = nome;

    const inputQtd = document.createElement("input");
    inputQtd.type = "number";
    inputQtd.min = 1;
    inputQtd.value = qtd;
    inputQtd.classList.add(classeQtd);

    const btnRemover = document.createElement("button");
    btnRemover.type = "button";
    btnRemover.classList.add("remove-btn");
    btnRemover.textContent = "Remover";
    btnRemover.addEventListener("click", () => div.remove());

    div.appendChild(select);
    div.appendChild(inputQtd);
    div.appendChild(btnRemover);

    container.appendChild(div);
}

//==========================
// Funções específicas para reagentes, materiais e equipamentos
//==========================

function criarReagenteItem(nome, qtd) { criarItem(reagentesContainer, estoqueReagentes, "reagente-nome", "reagente-qtd", nome, qtd); }
function criarMaterialItem(nome, qtd) { criarItem(materiaisContainer, estoqueMateriais, "material-nome", "material-qtd", nome, qtd); }
function criarEquipamentoItem(nome, qtd) { criarItem(equipamentosContainer, estoqueEquipamentos, "equip-nome", "equip-qtd", nome, qtd); }

//==========================
// Eventos de adicionar itens
//==========================

document.getElementById("add-reagente").addEventListener("click", () => criarReagenteItem());
document.getElementById("add-material").addEventListener("click", () => criarMaterialItem());
document.getElementById("add-equip").addEventListener("click", () => criarEquipamentoItem());

//==========================
// Limpar formulário
//==========================

document.getElementById("btn-kit-limpar").addEventListener("click", () => {
    document.querySelectorAll("input, textarea").forEach(i => i.value = "");
    reagentesContainer.innerHTML = "";
    materiaisContainer.innerHTML = "";
    equipamentosContainer.innerHTML = "";
});

//==========================
// Solicitar Kit
//==========================

document.getElementById("btn-kit-sol").addEventListener("click", async () => {
    const nomeKit = document.getElementById("nome-kit").value.trim();
    const observacoes = document.getElementById("obs-kit").value.trim();

    //==========================
    // Coletar itens do formulário
    //==========================

    function coletarItens(seletorNome, seletorQtd) {
        return [...document.querySelectorAll(seletorNome)]
            .map((el, i) => {
                const nome = el.value.trim();
                const qtd = Number(document.querySelectorAll(seletorQtd)[i].value);
                if (!nome || qtd <= 0) return null;
                return { nome, quantidade: qtd };
            })
            .filter(e => e !== null);
    }

    const reagentes = coletarItens(".reagente-nome", ".reagente-qtd");
    const materiais = coletarItens(".material-nome", ".material-qtd");
    const equipamentos = coletarItens(".equip-nome", ".equip-qtd");

    if (!nomeKit) return alert("Digite o nome do kit!");
    if (reagentes.length + materiais.length + equipamentos.length === 0)
        return alert("Adicione pelo menos um item ao kit!");

    //==========================
    // Verificar estoque disponível
    //==========================

    function verificarEstoque(itens, estoque, tipo) {
        for (const i of itens) {
            const est = estoque.find(e => e.nome === i.nome);
            if (!est) return alert(`O ${tipo} ${i.nome} não existe no estoque.`);
            if (i.quantidade > est.quantidade)
                return alert(`Não há ${tipo} suficiente para ${i.nome}. Estoque: ${est.quantidade}`);
        }
    }

    verificarEstoque(reagentes, estoqueReagentes, "reagente");
    verificarEstoque(materiais, estoqueMateriais, "material");
    verificarEstoque(equipamentos, estoqueEquipamentos, "equipamento");

    //==========================
    // Remover duplicados dentro de cada tipo
    //==========================

    const reagentesUnicos = reagentes.reduce((acc, item) => {
        if (!acc.find(i => i.nome.toLowerCase() === item.nome.toLowerCase())) acc.push(item);
        return acc;
    }, []);
    const materiaisUnicos = materiais.reduce((acc, item) => {
        if (!acc.find(i => i.nome.toLowerCase() === item.nome.toLowerCase())) acc.push(item);
        return acc;
    }, []);
    const equipamentosUnicos = equipamentos.reduce((acc, item) => {
        if (!acc.find(i => i.nome.toLowerCase() === item.nome.toLowerCase())) acc.push(item);
        return acc;
    }, []);

    //==========================
    // Preparar dados para envio
    //==========================

    const data = {
        nomeKit,
        reagentes: reagentesUnicos,
        materiais: materiaisUnicos,
        equipamentos: equipamentosUnicos,
        observacoes
    };

    //==========================
    // Enviar para backend
    //==========================

    try {
        const resp = await fetch("http://localhost:5000/kits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (resp.ok) {
            alert("✅ Kit criado com sucesso!");
            document.getElementById("btn-kit-limpar").click();
            await carregarEstoque(); // Atualiza estoque
        } else {
            const erro = await resp.json();
            alert("❌ Erro ao criar kit: " + (erro.error || "verifique o servidor"));
        }
    } catch (err) {
        console.error("Erro:", err);
        alert("Erro ao conectar com o servidor!");
    }
});
