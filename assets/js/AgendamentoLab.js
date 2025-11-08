const protocolo = "http://";
const baseURL = "localhost:5000";

// =========================================================================
//  Lê os itens das caixas de resumo (Vidrarias, Reagentes, Materiais)
// =========================================================================
function getItemsFromSummaryBox(boxId) {
  const box = document.querySelector(boxId);
  if (!box) return [];

  const items = [];
  const summaryItems = box.querySelectorAll('.summary-item');

  summaryItems.forEach(item => {
    const text = item.querySelector('span').textContent;
    const match = text.match(/(.+) \(x(\d+)\)/);

    if (match && match[1] && match[2]) {
      items.push({
        nome: match[1].trim(),
        quantidade: parseInt(match[2], 10)
      });
    }
  });

  return items;
}

// =========================================================================
// MOSTRAR AVISO (TOAST)
// =========================================================================
function mostrarToast(mensagem, tipo = "sucesso") {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.classList.add(tipo === "erro" ? "toast-erro" : "toast-sucesso");
  toast.textContent = mensagem;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}

// =========================================================================
// CARREGAR KITS DO BANCO
// =========================================================================
async function carregarKits() {
  const selectKit = document.querySelector("#select-kit");
  if (!selectKit) return;

  try {
    const res = await fetch(`${protocolo}${baseURL}/kits`);
    const kits = await res.json();

    selectKit.innerHTML = `<option value="">Selecione um kit</option>`;

    kits.forEach(kit => {
      const option = document.createElement("option");
      option.value = kit._id;  
      option.textContent = kit.nomeKit;
      selectKit.appendChild(option);
    });

  } catch (err) {
    console.error("Erro ao carregar kits:", err);
  }
}

// =========================================================================
//  ADICIONAR ITENS Adicionar e Remover 
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  carregarKits();

  // Adicionar itens
  document.querySelectorAll('.btn-add').forEach(button => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const itemBox = event.target.closest('.item-box');
      const nomeInput = itemBox.querySelector('.form-input-text:nth-of-type(1)');
      const qtdInput = itemBox.querySelector('.form-input-text:nth-of-type(2)');

      const nome = nomeInput.value.trim();
      const quantidade = qtdInput.value.trim();

      if (!nome || !quantidade || isNaN(quantidade) || parseInt(quantidade) <= 0) {
        mostrarToast('Preencha nome e quantidade válidos.', 'erro');
        return;
      }

      const tipo = itemBox.querySelector('h3').textContent.toLowerCase();
      let destinationBox;
      if (tipo === 'vidrarias') destinationBox = document.querySelector('#vidraria');
      else if (tipo === 'reagentes') destinationBox = document.querySelector('#reagente');
      else if (tipo === 'materiais') destinationBox = document.querySelector('#materiais');
      else return;

      const itemElement = document.createElement('div');
      itemElement.className = 'summary-item';
      itemElement.innerHTML = `
        <span>${nome} (x${quantidade})</span>
        <button class="btn-remove-item" title="Remover item">x</button>
      `;

      destinationBox.appendChild(itemElement);
      nomeInput.value = '';
      qtdInput.value = '';

      itemElement.querySelector('.btn-remove-item').addEventListener('click', () => {
        itemElement.remove();
      });
    });
  });

  // Limpar inputs
  document.querySelectorAll('.btn-remove').forEach(button => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const itemBox = event.target.closest('.item-box');
      itemBox.querySelectorAll('.form-input-text').forEach(input => input.value = '');
    });
  });
});

// =========================================================================
// ENVIAR AGENDAMENTO
// =========================================================================
document.getElementById("btn-lab-conf").addEventListener("click", async (event) => {
  event.preventDefault();

  const userId = localStorage.getItem("userId");
  if (!userId) {
    mostrarToast("❌ Faça login antes de agendar.", "erro");
    return;
  }

  const laboratorio = document.querySelector("#laboratorio-div select").value;
  const dataStr = document.querySelector('input[name="Data"]').value;
  const horario = document.querySelector('input[name="datetime"]').value;
  const kitSelecionado = document.querySelector("#select-kit").value;

  const vidrarias = getItemsFromSummaryBox('#vidraria');
  const reagentes = getItemsFromSummaryBox('#reagente');
  const materiais = getItemsFromSummaryBox('#materiais');

  if (!laboratorio || !dataStr || !horario) {
    mostrarToast("❌ Preencha Laboratório, Data e Horário.", "erro");
    return;
  }

  if (vidrarias.length === 0 && reagentes.length === 0 && materiais.length === 0 && !kitSelecionado) {
    mostrarToast("❌ Adicione ao menos um item ou selecione um kit.", "erro");
    return;
  }

  const agendamento = {
    laboratorio,
    data: new Date(dataStr + "T00:00:00"),
    horario,
    kit: kitSelecionado || "",
    vidrarias,
    reagentes,
    materiais,
    usuario: userId
  };

  try {
    const res = await fetch(`${protocolo}${baseURL}/agendamentos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(agendamento)
    });

    if (res.ok) {
      const dataRes = await res.json().catch(() => ({}));
      mostrarToast(dataRes.message || "✅ Agendamento realizado com sucesso!", "sucesso");
      setTimeout(() => window.location.reload(), 2000);
    } else {
      const dataRes = await res.json().catch(() => ({ error: "Erro desconhecido" }));
      mostrarToast(`❌ ${dataRes.error}`, "erro");
    }

  } catch (err) {
    mostrarToast("❌ Falha na conexão com o servidor.", "erro");
    console.error("Erro de conexão:", err);
  }
});
