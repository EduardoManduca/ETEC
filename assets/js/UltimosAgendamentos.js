document.addEventListener("DOMContentLoaded", async () => {

  const corpoTabela = document.querySelector(".container-tabela table tbody");

  try {
    //==========================
    // Buscar agendamentos do backend
    //==========================

    const res = await fetch("http://localhost:5000/agendamentos");
    const agendamentos = await res.json();
    corpoTabela.innerHTML = "";

    //==========================
    // Verificar se há agendamentos
    //==========================
    if (!agendamentos.length) {
      corpoTabela.innerHTML = `<tr class="empty-row"><td colspan="5" style="text-align:center;">Nenhum agendamento recente.</td></tr>`;
      return;
    }

    //==========================
    // Popular tabela com agendamentos
    //==========================

    agendamentos.forEach(a => {
      const tr = document.createElement("tr");
      const dataAgendamento = new Date(a.data);
      const dataFormatada = dataAgendamento.toLocaleDateString("pt-BR", { timeZone: 'UTC' });
      const horaFormatada = a.horario || "—";

      tr.innerHTML = `
        <td>${a.usuario?.login || "Não Logado"}</td>
        <td>${a.laboratorio || "—"}</td>
        <td>${dataFormatada}</td>
        <td>${horaFormatada}</td>
        <td class="acoes">
          <button class="btn-excluir" data-id="${a._id}">Excluir</button>
        </td>
      `;

      corpoTabela.appendChild(tr);
    });

    //==========================
    // Evento para excluir agendamento
    //==========================

    corpoTabela.addEventListener("click", async (e) => {
      const tr = e.target.closest("tr");
      if (!tr || tr.classList.contains('empty-row')) return;

      const id = e.target.getAttribute("data-id");
      if (!id) return;

      if (e.target.classList.contains("btn-excluir")) {
        if (confirm("Tem certeza que deseja excluir este agendamento?")) {
          try {
            const resposta = await fetch(`http://localhost:5000/agendamentos/${id}`, {
              method: "DELETE"
            });

            if (resposta.ok) {
              tr.remove();
              alert("Agendamento excluído com sucesso!");

              //==========================
              // Verifica se tabela ficou vazia
              //==========================

              if (corpoTabela.children.length === 0) {
                corpoTabela.innerHTML = `<tr class="empty-row"><td colspan="5" style="text-align:center;">Nenhum agendamento recente.</td></tr>`;
              }
            } else {
              let erro;
              try { erro = await resposta.json(); } catch (_) { erro = { error: "Erro desconhecido" }; }
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
    corpoTabela.innerHTML = `<tr class="empty-row"><td colspan="5" style="text-align:center;">Erro ao carregar agendamentos.</td></tr>`;
  }
});
