const baseURL = "http://localhost:5000";

async function carregarEstoque() {
    const conteudo = document.getElementById("conteudo-estoque");
    conteudo.innerHTML = "<p>Carregando estoque...</p>";

    try {
        const res = await fetch(`${baseURL}/estoque`);
        if (!res.ok) throw new Error("Erro ao carregar estoque");
        const estoque = await res.json();
        conteudo.innerHTML = "";

        //==========================
        // Loop para reagentes, vidrarias e materiais
        //==========================

        // MODIFICADO: Adicionado "materiais"
        ["reagentes", "vidrarias", "materiais"].forEach(tipo => {
            const secao = document.createElement("div");
            secao.className = "secao-estoque";

            //==========================
            // Cabeçalho com título e busca
            //==========================

            const cabecalho = document.createElement("div");
            cabecalho.className = "cabecalho-estoque";

            const titulo = document.createElement("h2");
            titulo.className = "subtitulo-estoque";
            titulo.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);

            const containerBusca = document.createElement("div");
            containerBusca.className = "container-busca";
            containerBusca.innerHTML = `
                <input type="text" class="input-busca-estoque" id="search-${tipo}" placeholder="Buscar ${tipo}...">
                <img src="/images/lupa.png" class="icone-busca" alt="Buscar">
            `;

            //==========================
            // Formulário para adicionar novo item
            //==========================

            const form = document.createElement("div");
            form.className = "form-adicionar";
            form.innerHTML = `
                <input type="text" id="novoItem-${tipo}" placeholder="Nome do item">
                <input type="number" id="novaQtd-${tipo}" placeholder="Quantidade" min="0">
                <select id="novaUnidade-${tipo}">
                    <option value="">Unidade...</option>
                    <option value="g">g</option>
                    <option value="mg">mg</option>
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="mL">mL</option>
                    <option value="un">un</option>
                    <option value="caixa">caixa</option>
                    <option value="frasco">frasco</option>
                </select>
                <button class="btn-salvar" onclick="adicionarItem('${tipo}')">Adicionar</button>
            `;

            cabecalho.appendChild(titulo);
            cabecalho.appendChild(containerBusca);
            cabecalho.appendChild(form);
            secao.appendChild(cabecalho);

            //==========================
            // Tabela de itens do estoque
            //==========================

            const tabela = document.createElement("table");
            tabela.className = "tabela-estoque";
            tabela.id = `tabela-${tipo}`;
            tabela.innerHTML = `
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantidade</th>
                        <th>Unidade</th>
                        <th>Gerenciamento do Estoque</th>
                    </tr>
                </thead>
                <tbody>
                    ${(estoque[tipo] || []).map(i => `
                        <tr>
                            <td>${i.nome}</td>
                            <td><input class="input-qtd" type="number" value="${i.quantidade}" min="0" id="${tipo}-${i.nome}"></td>
                            <td>${i.unidade || "-"}</td>
                            <td>
                                <button class="btn-salvar" onclick="atualizarQuantidade('${tipo}','${i.nome}')">Salvar</button>
                                <button class="btn-excluir" onclick="excluirItem('${tipo}','${i.nome}')">Excluir</button>
                            </td>
                        </tr>`).join("")}
                </tbody>
            `;
            secao.appendChild(tabela);
            conteudo.appendChild(secao);

            ativarBusca(tipo);
        });

    } catch (err) {
        conteudo.innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
}

//==========================
// Função para filtrar itens da tabela por busca
//==========================

function ativarBusca(tipo) {
    // ... (código original sem alteração)
    const searchInput = document.getElementById(`search-${tipo}`);
    const tabela = document.getElementById(`tabela-${tipo}`);

    searchInput.addEventListener("input", () => {
        const filtro = searchInput.value.toLowerCase();
        tabela.querySelectorAll("tbody tr").forEach(linha => {
            const texto = linha.textContent.toLowerCase();
            linha.style.display = texto.includes(filtro) ? "" : "none";
        });
    });
}

//==========================
// Excluir item do estoque
//==========================

async function excluirItem(tipo, nome) {
    // ... (código original sem alteração)
    if (!confirm(`Tem certeza que deseja excluir "${nome}" do estoque de ${tipo}?`)) return;

    try {
        const res = await fetch(`${baseURL}/estoque/${tipo}/${encodeURIComponent(nome)}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao excluir item");
        alert(`✅ Item "${nome}" excluído do estoque de ${tipo}.`);
        carregarEstoque();
    } catch (err) {
        alert("Erro: " + err.message);
    }
}

//==========================
// Adicionar novo item ao estoque
//==========================

async function adicionarItem(tipo) {
    // ... (código original sem alteração)
    const itemInput = document.getElementById(`novoItem-${tipo}`);
    const qtdInput = document.getElementById(`novaQtd-${tipo}`);
    const unidadeInput = document.getElementById(`novaUnidade-${tipo}`);

    const nome = itemInput.value.trim();
    const quantidade = Number(qtdInput.value);
    const unidade = unidadeInput.value;

    if (!nome || isNaN(quantidade) || quantidade < 0 || !unidade) {
        alert("Preencha nome, quantidade e unidade válidos.");
        return;
    }

    try {
        const res = await fetch(`${baseURL}/estoque/${tipo}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, quantidade, unidade })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao adicionar item");
        alert(`✅ Item "${nome}" adicionado ao estoque de ${tipo}.`);
        carregarEstoque();
    } catch (err) {
        alert("Erro: " + err.message);
    }
}

//==========================
// Atualizar quantidade de um item existente
//==========================

async function atualizarQuantidade(tipo, nome) {
    // ... (código original sem alteração)
    const input = document.getElementById(`${tipo}-${nome}`);
    const quantidade = Number(input.value);

    if (isNaN(quantidade) || quantidade < 0) {
        alert("Quantidade inválida.");
        return;
    }

    try {
        const res = await fetch(`${baseURL}/estoque/${tipo}/${encodeURIComponent(nome)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantidade })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao atualizar");
        alert(`✅ Quantidade de "${nome}" atualizada para ${quantidade}`);
        carregarEstoque();
    } catch (err) {
        alert("Erro: " + err.message);
    }
}
carregarEstoque();