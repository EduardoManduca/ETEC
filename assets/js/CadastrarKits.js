const reagentesContainer = document.getElementById("reagentes-container");
const materiaisContainer = document.getElementById("materiais-container");
const vidrariasContainer = document.getElementById("vidrarias-container");

let estoqueReagentes = [];
let estoqueMateriais = [];
let estoqueVidrarias = [];

// ==========================
// Carregar Estoque
// ==========================

async function carregarEstoque() {
    try {
        const resp = await fetch("http://localhost:5000/estoque");
        const estoque = await resp.json();
        estoqueReagentes = estoque.reagentes || [];
        estoqueMateriais = estoque.materiais || [];
        estoqueVidrarias = estoque.vidrarias || [];
    } catch (err) {
        console.error("Erro ao carregar estoque:", err);
        alert("Não foi possível carregar o estoque!");
    }
}
carregarEstoque();

// ==========================
// Atualizar Painel Lateral
// ==========================

function atualizarPainelLateralKit() {
    const renderizar = (selInput, selQtd, selUnid, idLista) => {
        const nomes = [...document.querySelectorAll(selInput)];
        const qtds = [...document.querySelectorAll(selQtd)];
        const unids = [...document.querySelectorAll(selUnid)];
        const ul = document.getElementById(idLista);

        const html = nomes.map((input, i) => {
            if (!input.value) return null;
            return `<li><strong>${input.value}</strong>: ${qtds[i].value} ${unids[i].textContent}</li>`;
        }).filter(Boolean);

        ul.innerHTML = html.length ? html.join("") : "<li style='color:#999;'>Nenhum</li>";
    };

    renderizar(".reagente-input", ".reagente-qtd", ".reagente-unidade", "lista-reagentes");
    renderizar(".material-input", ".material-qtd", ".material-unidade", "lista-materiais");
    renderizar(".vidraria-input", ".vidraria-qtd", ".vidraria-unidade", "lista-vidrarias");
}

// ==========================
// Criar Item
// ==========================

function criarItem(container, listaEstoque, classeInput, classeQtd, classeUnidade) {
    const divRow = document.createElement("div");
    divRow.classList.add("kit-item-grid");

    const inputWrapper = document.createElement("div");
    inputWrapper.classList.add("input-wrapper");

    const inputNome = document.createElement("input");
    inputNome.type = "text";
    inputNome.placeholder = "Clique para buscar...";
    inputNome.classList.add(classeInput);
    inputNome.autocomplete = "off";

    const listaSugestoes = document.createElement("div");
    listaSugestoes.classList.add("sugestoes-lista");

    const inputQtd = document.createElement("input");
    inputQtd.type = "number";
    inputQtd.min = "1";
    inputQtd.value = "1";
    inputQtd.classList.add(classeQtd);

    const spanUnidade = document.createElement("span");
    spanUnidade.classList.add("item-unidade", classeUnidade);
    spanUnidade.textContent = "-";

    const btnRemover = document.createElement("button");
    btnRemover.type = "button";
    btnRemover.classList.add("btn-remove-icon");
    btnRemover.innerHTML = "Excluir";
    btnRemover.style.fontSize = "0.9rem";

    // ================================
    // Montar Estrutura
    // ================================

    inputWrapper.appendChild(inputNome);
    inputWrapper.appendChild(listaSugestoes);
    divRow.appendChild(inputWrapper);
    divRow.appendChild(inputQtd);
    divRow.appendChild(spanUnidade);
    divRow.appendChild(btnRemover);
    container.appendChild(divRow);

    // ================================
    // Renderizar Sugestões
    // ================================

    const renderizarSugestoes = () => {
        const termo = inputNome.value.toLowerCase().trim();
        listaSugestoes.innerHTML = "";

        let itensParaMostrar = [];


        // =================================
        // Filtrar sugestões
        // =================================

        if (termo === "") {
            itensParaMostrar = listaEstoque.slice(0, 5);
        } else {
            itensParaMostrar = listaEstoque.filter(item =>
                item.nome.toLowerCase().includes(termo)
            );
        }

        if (itensParaMostrar.length > 0) {
            listaSugestoes.style.display = "block";

            if (termo === "") {
                const header = document.createElement("div");
                header.style.cssText = "padding:5px 10px; font-size:0.75rem; color:#999; background:#f9f9f9;";
                header.textContent = "Sugestões:";
                listaSugestoes.appendChild(header);
            }

            itensParaMostrar.forEach(item => {
                const divItem = document.createElement("div");
                divItem.classList.add("sugestoes-item");
                divItem.innerHTML = `<span>${item.nome}</span> <span class="qtd-info">(${item.quantidade} ${item.unidade})</span>`;

                // =================================
                // Selecionar sugestão
                // =================================

                divItem.addEventListener("click", (e) => {
                    e.stopPropagation();
                    inputNome.value = item.nome;
                    spanUnidade.textContent = item.unidade;
                    listaSugestoes.style.display = "none";

                    if (parseInt(inputQtd.value) > item.quantidade) {
                        inputQtd.style.borderColor = "red";
                    } else {
                        inputQtd.style.borderColor = "#ccc";
                    }
                    atualizarPainelLateralKit();
                });
                listaSugestoes.appendChild(divItem);
            });
        } else {
            listaSugestoes.style.display = "none";
        }
    };


    // ================================
    // Eventos
    // ================================

    inputNome.addEventListener("click", renderizarSugestoes);
    inputNome.addEventListener("focus", renderizarSugestoes);
    inputNome.addEventListener("input", renderizarSugestoes);

    document.addEventListener("click", (e) => {
        if (!inputWrapper.contains(e.target)) {
            listaSugestoes.style.display = "none";
        }
    });

    inputQtd.addEventListener("input", atualizarPainelLateralKit);
    btnRemover.addEventListener("click", () => {
        divRow.remove();
        atualizarPainelLateralKit();
    });

    inputNome.focus();
}

// ==============================
// Botões de Adicionar e Limpar
// ==============================

document.getElementById("add-reagente").addEventListener("click", () =>
    criarItem(reagentesContainer, estoqueReagentes, "reagente-input", "reagente-qtd", "reagente-unidade"));

document.getElementById("add-material").addEventListener("click", () =>
    criarItem(materiaisContainer, estoqueMateriais, "material-input", "material-qtd", "material-unidade"));

document.getElementById("add-equip").addEventListener("click", () =>
    criarItem(vidrariasContainer, estoqueVidrarias, "vidraria-input", "vidraria-qtd", "vidraria-unidade"));

document.getElementById("btn-kit-limpar").addEventListener("click", () => {
    document.getElementById("nome-kit").value = "";
    document.getElementById("obs-kit").value = "";
    reagentesContainer.innerHTML = "";
    materiaisContainer.innerHTML = "";
    vidrariasContainer.innerHTML = "";
    atualizarPainelLateralKit();
});

// ==========================
// Enviar Kit
// ==========================

document.getElementById("btn-kit-sol").addEventListener("click", async () => {
    const nomeKit = document.getElementById("nome-kit").value.trim();
    const observacoes = document.getElementById("obs-kit").value.trim();
    const userId = localStorage.getItem("userId");

    if (!userId) return alert("❌ Faça login antes!");
    if (!nomeKit) return alert("Digite o nome do kit!");

    const coletar = (sNome, sQtd, sUnid) => [...document.querySelectorAll(sNome)].map((el, i) => {
        const nome = el.value.trim();
        const qtd = Number(document.querySelectorAll(sQtd)[i].value);
        const unid = document.querySelectorAll(sUnid)[i].textContent;
        return (nome && qtd > 0) ? { nome, unidade: (unid === "-" ? "" : unid), quantidade: qtd } : null;
    }).filter(Boolean);

    const reagentes = coletar(".reagente-input", ".reagente-qtd", ".reagente-unidade");
    const materiais = coletar(".material-input", ".material-qtd", ".material-unidade");
    const vidrarias = coletar(".vidraria-input", ".vidraria-qtd", ".vidraria-unidade");

    if (reagentes.length + materiais.length + vidrarias.length === 0)
        return alert("Adicione pelo menos um item!");

    const verificar = (itens, estoque, tipo) => {
        for (const item of itens) {
            const est = estoque.find(e => e.nome === item.nome);
            if (!est) return `Item "${item.nome}" não encontrado no estoque de ${tipo}.`;
            if (item.quantidade > est.quantidade) return `Estoque insuficiente para "${item.nome}". Disponível: ${est.quantidade}`;
        }
        return null;
    };

    const erro = verificar(reagentes, estoqueReagentes, "reagentes") ||
        verificar(materiais, estoqueMateriais, "materiais") ||
        verificar(vidrarias, estoqueVidrarias, "vidrarias");

    if (erro) return alert("⚠️ " + erro);

    try {
        const resp = await fetch("http://localhost:5000/kits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nomeKit, reagentes, materiais, vidrarias, observacoes, usuario: userId }),
        });

        if (resp.ok) {
            alert("✅ Kit criado com sucesso!");
            document.getElementById("btn-kit-limpar").click();
            carregarEstoque();
        } else {
            const errData = await resp.json();
            alert("Erro: " + errData.error);
        }
    } catch (e) {
        console.error(e);
        alert("Erro de conexão!");
    }
});