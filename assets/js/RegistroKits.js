async function carregarKits() {
    try {
        const response = await fetch("http://localhost:5000/kits");
        const kits = await response.json();

        console.log("Kits recebidos:", kits);

        const tabela = document.querySelector("#tabela-kits-materiais tbody");
        tabela.innerHTML = "";

        if (!kits || !kits.length) {
            tabela.innerHTML = "<tr><td colspan='7' style='text-align: center; vertical-align: middle;'>Nenhum kit cadastrado.</td></tr>";
            return;
        }

        kits.forEach(kit => {
            const linha = document.createElement("tr");

            const reagentes = kit.reagentes?.length
                ? kit.reagentes.map(r => `${r.nome} (${r.quantidade}${r.unidade || ''})`).join(", ")
                : "-";

            const materiais = kit.materiais?.length
                ? kit.materiais.map(m => `${m.nome} (${m.quantidade}${m.unidade || ''})`).join(", ")
                : "-";

            const vidrarias = kit.vidrarias?.length
                ? kit.vidrarias.map(v => `${v.nome} (${v.quantidade}${v.unidade || ''})`).join(", ")
                : "-";

            const usuarioSolicitante = kit.usuario && kit.usuario.login ? kit.usuario.login : "Desconhecido";

            const statusClass = kit.status === "autorizado" ? "autorizado" : "solicitado";
            const statusText = kit.status === "autorizado" ? "Reprovar" : "Autorizar";
            const statusIcon = kit.status === "autorizado" ? '<i class="fa fa-times"></i>' : '<i class="fa fa-check"></i>';

            const statusBtn = `<button class="btn-status ${statusClass}" onclick="alterarStatus('${kit._id}', '${kit.status}', this)">${statusIcon} ${statusText}</button>`;

            linha.innerHTML = `
                <td>${usuarioSolicitante}</td>
                <td>${kit.nomeKit}</td>
                <td>${materiais}</td> 
                <td>${reagentes}</td>
                <td>${vidrarias}</td> 
                <td>${kit.observacoes || "-"}</td>
                <td class="coluna-acoes">
                ${statusBtn}
    <button class="btn-excluir" onclick="excluirKit('${kit._id}')">
        <i class="fa fa-trash" aria-hidden="true"></i> Excluir
    </button>
</td>

            `;

            tabela.appendChild(linha);
        });

    } catch (err) {
        console.error("Erro ao carregar kits:", err);
        const tabela = document.querySelector("#tabela-kits-materiais tbody");
        tabela.innerHTML = "<tr><td colspan='7' style='text-align:center;'>Erro ao carregar kits.</td></tr>";
    }
}
// =====================
// Alterar status do kit (Autorizar/Reprovar)
// =====================

async function alterarStatus(id, statusAtual, btn) {
    const novoStatus = statusAtual === "autorizado" ? "solicitado" : "autorizado";

    try {
        const resp = await fetch(`http://localhost:5000/kits/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: novoStatus })
        });

        if (resp.ok) {
            btn.classList.remove("autorizado", "solicitado");
            btn.classList.add(novoStatus);
            const newIcon = novoStatus === "autorizado" ? '<i class="fa fa-times" aria-hidden="true"></i>' : '<i class="fa fa-check" aria-hidden="true"></i>';
            const newText = novoStatus === "autorizado" ? 'Reprovar' : 'Autorizar';
            btn.innerHTML = `${newIcon} ${newText}`;
            btn.setAttribute("onclick", `alterarStatus('${id}', '${novoStatus}', this)`);
        } else {
            const err = await resp.json();
            alert("Erro ao alterar status: " + (err.error || "Tente novamente"));
        }
    } catch (err) {
        console.error(err);
        alert("Erro ao alterar status do kit");
    }
}

// =====================
// Excluir kit
// =====================

async function excluirKit(id) {
    if (!confirm("Tem certeza que deseja excluir este kit?")) return;

    try {
        const resp = await fetch(`http://localhost:5000/kits/${id}`, { method: "DELETE" });
        if (resp.ok) {
            alert("Kit excluído com sucesso!");
            carregarKits();
        } else {
            alert("Erro ao excluir kit.");
        }
    } catch (err) {
        console.error(err);
        alert("Erro ao excluir kit.");
    }
}

carregarKits();