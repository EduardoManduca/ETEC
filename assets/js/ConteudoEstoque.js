async function carregarEstoque() {
    const tabela = document.querySelector("#tabela-estoque tbody");
    tabela.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Carregando...</td></tr>";

    try {
        const resposta = await fetch("http://localhost:5000/estoque");
        if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);

        const dados = await resposta.json();
        const linhas = [];

        //==========================
        // Tipos de itens no estoque
        //==========================

        const tipos = ["reagentes", "materiais", "vidrarias"];
        let temItens = false;

        tipos.forEach(tipo => {
            const lista = Array.isArray(dados[tipo]) ? dados[tipo] : [];
            if (lista.length) temItens = true;

            lista.forEach(item => {
                const nome = item.nome ?? "-";
                const quantidade = item.quantidade ?? 0;
                const data = item.atualizadoEm
                    ? new Date(item.atualizadoEm).toLocaleDateString("pt-BR")
                    : (dados.atualizadoEm
                        ? new Date(dados.atualizadoEm).toLocaleDateString("pt-BR")
                        : "-");

                linhas.push(`
    <tr>
        <td>${nome}</td>
        <td>${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</td>
        <td>${quantidade} ${item.unidade || ""}</td>
        <td>${data}</td>
    </tr>
`);
            });
        });

        if (!temItens) {
            tabela.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Nenhum item no estoque.</td></tr>";
            return;
        }

        tabela.innerHTML = linhas.join("");
    } catch (erro) {
        console.error("Erro ao carregar estoque:", erro);
        tabela.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Erro ao carregar dados.</td></tr>";
    }
}

//==========================
// Filtro local sem recarregar do servidor
//==========================

document.addEventListener("input", (e) => {
    if (e.target.id === "filtro") {
        const filtro = e.target.value.toLowerCase().trim();
        const linhas = document.querySelectorAll("#tabela-estoque tbody tr");

        linhas.forEach(linha => {
            const texto = linha.textContent.toLowerCase();
            linha.style.display = texto.includes(filtro) ? "" : "none";
        });
    }
});

carregarEstoque();

document.addEventListener("DOMContentLoaded", () => {
    const campoFiltro = document.getElementById("filtro");
    const botoesFiltro = document.querySelectorAll(".btn-filtro");
    const tabela = document.querySelector("#tabela-estoque tbody");

    let tipoSelecionado = "todos";

    //==========================
    // Normaliza strings para comparação
    //==========================

    function normalizar(texto = "") {
        return texto
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    //==========================
    // Dicionário de sinônimos para tipos
    //==========================

    const sinonimos = {
        todos: ["todos", ""],
        reagente: ["reagente", "reagentes"],
        material: ["material", "materiais"],
        vidrarias: ["vidraria", "vidrarias"]
    };

    //==========================
    // Checa se o tipo da célula bate com o filtro
    //==========================

    function tipoBate(tipoCelula, tipoFiltro) {
        const t = normalizar(tipoCelula);
        const variantes = sinonimos[normalizar(tipoFiltro)] || [normalizar(tipoFiltro)];
        return variantes.some(v => t === v || t.includes(v) || v.includes(t));
    }

    //==========================
    // Função de filtragem da tabela
    //==========================

    function filtrarTabela() {
        const texto = normalizar(campoFiltro.value);
        const linhas = tabela.querySelectorAll("tr");

        linhas.forEach(linha => {
            const nome = normalizar(linha.cells[0]?.textContent || "");
            const tipo = normalizar(linha.cells[1]?.textContent || "");

            const condicaoTexto = nome.includes(texto);
            const condicaoTipo =
                tipoSelecionado === "todos" ||
                tipoBate(tipo, tipoSelecionado);

            linha.style.display = condicaoTexto && condicaoTipo ? "" : "none";
        });
    }

    //==========================
    // Eventos de filtro
    //==========================

    campoFiltro.addEventListener("input", filtrarTabela);

    botoesFiltro.forEach(botao => {
        botao.addEventListener("click", () => {
            botoesFiltro.forEach(b => b.classList.remove("ativo"));
            botao.classList.add("ativo");
            tipoSelecionado = botao.getAttribute("data-tipo") || "todos";
            filtrarTabela();
        });
    });

    //==========================
    // Observa alterações na tabela e aplica filtro
    //==========================

    const observer = new MutationObserver(filtrarTabela);
    observer.observe(tabela, { childList: true, subtree: false });

    filtrarTabela();
});
