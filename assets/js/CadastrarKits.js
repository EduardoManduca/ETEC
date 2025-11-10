const reagentesContainer = document.getElementById("reagentes-container");
const materiaisContainer = document.getElementById("materiais-container");
const vidrariasContainer = document.getElementById("vidrarias-container");

//==========================
// Variáveis de estoque
//==========================

let estoqueReagentes = [];
let estoqueMateriais = [];
let estoqueVidrarias = []; // CORRIGIDO: Usando 'vidrarias'

//==========================
// Carregar estoque do backend
//==========================

async function carregarEstoque() {
    try {
        const resp = await fetch("http://localhost:5000/estoque");
        const estoque = await resp.json();

        estoqueReagentes = estoque.reagentes || [];
        estoqueMateriais = estoque.materiais || [];
        estoqueVidrarias = estoque.vidrarias || []; // CORRIGIDO: Busca 'vidrarias'
    } catch (err) {
        console.error("Erro ao carregar estoque:", err);
        alert("Não foi possível carregar o estoque!");
    }
}
carregarEstoque();

//==========================
// Atualizar painel lateral (mostra o que está sendo montado)
//==========================

function atualizarPainelLateralKit() {
    const listaMateriais = document.getElementById("lista-materiais");
    const listaReagentes = document.getElementById("lista-reagentes");
    const listaVidrarias = document.getElementById("lista-vidrarias");

    const materiais = [...document.querySelectorAll(".material-nome")].map((el, i) => {
        const qtd = document.querySelectorAll(".material-qtd")[i].value || 0;
        const nome = el.value || "—";
        const unidade = el.selectedOptions[0]?.dataset.unidade || "";
        return `${nome} (${qtd} ${unidade})`;
    });

    const reagentes = [...document.querySelectorAll(".reagente-nome")].map((el, i) => {
        const qtd = document.querySelectorAll(".reagente-qtd")[i].value || 0;
        const nome = el.value || "—";
        const unidade = el.selectedOptions[0]?.dataset.unidade || "";
        return `${nome} (${qtd} ${unidade})`;
    });

    // CORRIGIDO: Vidrarias
    const vidrarias = [...document.querySelectorAll(".vidraria-nome")].map((el, i) => {
        const qtd = document.querySelectorAll(".vidraria-qtd")[i].value || 0;
        const nome = el.value || "—";
        const unidade = el.selectedOptions[0]?.dataset.unidade || "";
        return `${nome} (${qtd} ${unidade})`;
    });

    listaMateriais.innerHTML = materiais.filter(m => !m.startsWith("—")).map(m => `<li>${m}</li>`).join("");
    listaReagentes.innerHTML = reagentes.filter(r => !r.startsWith("—")).map(r => `<li>${r}</li>`).join("");
    listaVidrarias.innerHTML = vidrarias.filter(v => !v.startsWith("—")).map(v => `<li>${v}</li>`).join("");
}

//==========================
// Criar itens do formulário
//==========================

function criarItem(container, estoque, classeNome, classeQtd, nome = "", qtd = 1) {
    const div = document.createElement("div");
    div.classList.add("item");

    const select = document.createElement("select");
    select.classList.add(classeNome);
    select.innerHTML =
        `<option value="">-- Selecione --</option>` +
        estoque
            .map(
                e =>
                    `<option value="${e.nome}" data-unidade="${e.unidade}">
            ${e.nome} (${e.quantidade} ${e.unidade})
          </option>`
            )
            .join("");
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

    select.addEventListener("change", atualizarPainelLateralKit);
    inputQtd.addEventListener("input", atualizarPainelLateralKit);
    btnRemover.addEventListener("click", () => {
        div.remove();
        atualizarPainelLateralKit();
    });

    div.appendChild(select);
    div.appendChild(inputQtd);
    div.appendChild(btnRemover);
    container.appendChild(div);

    atualizarPainelLateralKit();
}

//==========================
// Criadores específicos
//==========================

function criarReagenteItem(nome, qtd) {
    criarItem(reagentesContainer, estoqueReagentes, "reagente-nome", "reagente-qtd", nome, qtd);
}
function criarMaterialItem(nome, qtd) {
    criarItem(materiaisContainer, estoqueMateriais, "material-nome", "material-qtd", nome, qtd);
}
// CORRIGIDO: Função para Vidrarias
function criarVidrariaItem(nome, qtd) {
    criarItem(vidrariasContainer, estoqueVidrarias, "vidraria-nome", "vidraria-qtd", nome, qtd);
}

//==========================
// Eventos de adicionar itens
//==========================

document.getElementById("add-reagente").addEventListener("click", () => criarReagenteItem());
document.getElementById("add-material").addEventListener("click", () => criarMaterialItem());
// CORRIGIDO: Chama a função correta para Vidrarias
document.getElementById("add-equip").addEventListener("click", () => criarVidrariaItem());

//==========================
// Limpar formulário
//==========================

document.getElementById("btn-kit-limpar").addEventListener("click", () => {
    document.querySelectorAll("input, textarea").forEach(i => (i.value = ""));
    reagentesContainer.innerHTML = "";
    materiaisContainer.innerHTML = "";
    vidrariasContainer.innerHTML = "";
    atualizarPainelLateralKit();
});

//==========================
// Criar kit
//==========================

document.getElementById("btn-kit-sol").addEventListener("click", async () => {
    const nomeKit = document.getElementById("nome-kit").value.trim();
    const observacoes = document.getElementById("obs-kit").value.trim();
    // NOVO: Coleta o ID do usuário logado
    const userId = localStorage.getItem("userId");

    if (!userId) return alert("❌ Faça login antes de cadastrar um kit!");
    if (!nomeKit) return alert("Digite o nome do kit!");

    function coletarItens(selNome, selQtd) {
        return [...document.querySelectorAll(selNome)]
            .map((el, i) => {
                const nome = el.value.trim();
                const qtd = Number(document.querySelectorAll(selQtd)[i].value);
                const unidade = el.selectedOptions[0]?.dataset.unidade || "";
                if (!nome || qtd <= 0) return null;
                return { nome, unidade, quantidade: qtd };
            })
            .filter(Boolean);
    }

    const reagentes = coletarItens(".reagente-nome", ".reagente-qtd");
    const materiais = coletarItens(".material-nome", ".material-qtd");
    // CORRIGIDO: Coleta Vidrarias
    const vidrarias = coletarItens(".vidraria-nome", ".vidraria-qtd");

    if (reagentes.length + materiais.length + vidrarias.length === 0)
        return alert("Adicione pelo menos um item ao kit!");

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
    // CORRIGIDO: Verifica estoque de Vidrarias
    verificarEstoque(vidrarias, estoqueVidrarias, "vidraria");

    const data = {
        nomeKit,
        reagentes,
        materiais,
        vidrarias,
        observacoes,
        usuario: userId
    };

    try {
        const resp = await fetch("http://localhost:5000/kits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (resp.ok) {
            alert("✅ Kit criado com sucesso!");
            document.getElementById("btn-kit-limpar").click();
            await carregarEstoque();
        } else {
            const erro = await resp.json();
            alert("❌ Erro ao criar kit: " + (erro.error || "verifique o servidor"));
        }
    } catch (err) {
        console.error("Erro:", err);
        alert("Erro ao conectar com o servidor!");
    }
});