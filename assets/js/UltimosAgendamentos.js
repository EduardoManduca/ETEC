document.addEventListener("DOMContentLoaded", async () => {
  const corpoTabela = document.querySelector(".container-tabela table tbody");

  function atualizarBotaoStatus(botao, status) {
    if (status === "Aceito") {
      botao.textContent = "Recusar";
      botao.style.backgroundColor = "#333"; // verde
      botao.style.color = "#fff";
    } else {
      botao.textContent = "Aprovar";
      botao.style.backgroundColor = "#3ACF1F"; 
      botao.style.color = "#fff";
    }
  }

  function atualizarCorStatus(td, status) {
    if (status === "Aceito") {
      td.style.color = "#4CAF50";
      td.style.fontWeight = "bold";
    } else {
      td.style.color = "#f44336";
      td.style.fontWeight = "bold";
    }
  }

  try {
    const res = await fetch("http://localhost:5000/agendamentos");
    const agendamentos = await res.json();
    corpoTabela.innerHTML = "";

    if (!agendamentos.length) {
      corpoTabela.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nenhum agendamento recente.</td></tr>`;
      return;
    }

    agendamentos.forEach(a => {
      const tr = document.createElement("tr");
      const dataAgendamento = new Date(a.data);
      const dataFormatada = dataAgendamento.toLocaleDateString("pt-BR");
      const horaFormatada = a.horario || "—";
      const statusAtual = a.status || "Pendente";

      tr.innerHTML = `
        <td>${a.usuario?.login || "Não Logado"}</td>
        <td>${a.laboratorio || "—"}</td>
        <td>${dataFormatada}</td>
        <td>${horaFormatada}</td>
        <td class="status">${statusAtual}</td>
        <td>
          <button class="btn-aprov" data-id="${a._id}">Aprovar</button>
          <button class="btn-excluir" data-id="${a._id}">Excluir</button>
        </td>
      `;

      // Aplica cor inicial e nome do botão
      const statusTd = tr.querySelector(".status");
      const btnAprov = tr.querySelector(".btn-aprov");
      atualizarCorStatus(statusTd, statusAtual);
      atualizarBotaoStatus(btnAprov, statusAtual);

      corpoTabela.appendChild(tr);
    });

    // EVENTO PARA ATUALIZAR STATUS OU EXCLUIR
    corpoTabela.addEventListener("click", async (e) => {
      const tr = e.target.closest("tr");
      const id = e.target.getAttribute("data-id");

      // --- ALTERAR STATUS ---
      if(e.target.classList.contains("btn-aprov")) {
        const statusTd = tr.querySelector(".status");
        const botao = tr.querySelector(".btn-aprov");
        const novoStatus = statusTd.textContent === "Pendente" ? "Aceito" : "Pendente";

        try {
          const resposta = await fetch(`http://localhost:5000/agendamentos/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: novoStatus })
          });

          if(resposta.ok) {
            statusTd.textContent = novoStatus;
            atualizarCorStatus(statusTd, novoStatus);
            atualizarBotaoStatus(botao, novoStatus);
          } else {
            let erro;
            try { erro = await resposta.json(); } catch (_) { erro = { error: "Erro não retornou JSON" }; }
            alert("Erro ao atualizar: " + (erro.error || "Erro desconhecido"));
          }
        } catch (err) {
          console.error("Erro ao atualizar", err);
          alert("Erro na conexão ao servidor");
        }
      }

      // --- EXCLUIR AGENDAMENTO ---
      if(e.target.classList.contains("btn-excluir")) {
        if (confirm("Tem certeza que deseja excluir este agendamento?")) {
          try {
            const resposta = await fetch(`http://localhost:5000/agendamentos/${id}`, {
              method: "DELETE"
            });

            if (resposta.ok) {
              tr.remove();
              alert("Agendamento excluído com sucesso!");
            } else {
              let erro;
              try { erro = await resposta.json(); } catch (_) { erro = { error: "Erro não retornou JSON" }; }
              alert("Erro ao excluir: " + (erro.error || "Erro desconhecido"));
            }
          } catch (err) {
            console.error("Erro ao excluir:", err);
            alert("Erro na conexão com o servidor.");
          }
        }
      }
    });

  } catch (err) {
    console.error("Erro ao carregar agendamentos:", err);
    corpoTabela.innerHTML = `<tr><td colspan="6" style="text-align:center;">Erro ao carregar agendamentos.</td></tr>`;
  }
});
