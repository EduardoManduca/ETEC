const protocolo = "http://";
const baseURL = "localhost:5000";

let estoqueCache = null;

//==========================
// Função para ler itens das caixas de resumo (Equipamentos, Reagentes, Materiais)
//==========================

function getItemsFromSummaryBox(boxId) {
  const box = document.querySelector(boxId);
  if (!box) return [];

  const items = [];
  const summaryItems = box.querySelectorAll('.summary-item');

  summaryItems.forEach(item => {
    const text = item.querySelector('span').textContent;
    const match = text.match(/^(.+?)\s*\(x\s*(\d+)(?:\s*([^)]+))?\)$/i);

    if (match && match[1] && match[2]) {
      items.push({
        nome: match[1].trim(),
        quantidade: parseInt(match[2], 10),
        unidade: match[3] ? match[3].trim() : ''
      });
    }
  });

  return items;
}

//==========================
// Mostrar aviso (toast)
//==========================

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


async function carregarEstoque() {
  if (estoqueCache) return estoqueCache;
  try {
    const res = await fetch(`${protocolo}${baseURL}/estoque`);
    if (!res.ok) throw new Error('Falha ao buscar estoque');
    estoqueCache = await res.json();
    return estoqueCache;
  } catch (err) {
    console.error("Erro ao carregar estoque:", err);
    mostrarToast("Erro ao carregar itens do estoque.", "erro");
    return null;
  }
}

function removerSugestoesExistentes() {
  const oldBox = document.querySelector('.sugestao-box');
  if (oldBox) oldBox.remove();
}

/**
 * @param {HTMLInputElement} inputElement
 * @param {string} tipo 
 */
async function mostrarSugestoes(inputElement, tipo) {
  removerSugestoesExistentes();

  if (!estoqueCache) {
    await carregarEstoque();
  }
  if (!estoqueCache) return;

  const listaDeItens = estoqueCache[tipo] || [];
  const filtro = inputElement.value.toLowerCase();

  const itensFiltrados = listaDeItens.filter(item =>
    item.nome.toLowerCase().includes(filtro) && item.quantidade > 0
  );

  const sugestaoBox = document.createElement('div');
  sugestaoBox.className = 'sugestao-box';


  const rect = inputElement.getBoundingClientRect();
  sugestaoBox.style.left = `${rect.left + window.scrollX}px`;
  sugestaoBox.style.top = `${rect.bottom + window.scrollY}px`;
  sugestaoBox.style.width = `${rect.width}px`;

  if (itensFiltrados.length === 0) {
    sugestaoBox.innerHTML = `<div class="sugestao-item-none">Nenhum item disponível encontrado.</div>`;
  } else {
    itensFiltrados.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'sugestao-item';
      itemDiv.textContent = `${item.nome} (Disponível: ${item.quantidade} ${item.unidade || ''})`;

      itemDiv.addEventListener('mousedown', (e) => {
        e.preventDefault();
        inputElement.value = item.nome;
        removerSugestoesExistentes(); // Fecha a caixa

        const qtdInput = inputElement.closest('.item-box').querySelector('.form-input-text:nth-of-type(2)');
        if (qtdInput) qtdInput.focus();
      });
      sugestaoBox.appendChild(itemDiv);
    });
  }
  document.body.appendChild(sugestaoBox);
}

//==========================
// Carregar kits do banco (somente autorizados)
//==========================

async function carregarKits() {
  const kitsContainer = document.querySelector("#kits-container");

  try {
    const res = await fetch(`${protocolo}${baseURL}/kits`);
    const kits = await res.json();

    const kitsAutorizados = kits.filter(kit => kit.status === "autorizado");

    if (kitsAutorizados.length === 0) {
      const p = document.createElement("p");
      p.textContent = "Não há nenhum kit disponível para uso.";
      kitsContainer.appendChild(p);
    }

    kitsAutorizados.forEach(kit => {
      const kitElemento = document.createElement("div");
      kitElemento.classList.add("kit-elemento");
      kitElemento.innerHTML = kit.nomeKit;
      kitsContainer.appendChild(kitElemento);

      let isKitSelecionado = kitElemento.classList.contains("kit-selecionado");

      kitElemento.addEventListener("mouseover", () => {
        if (!isKitSelecionado) {
          kitElemento.style.backgroundColor = "var(--cinza-hover)";
          kitElemento.style.cursor = "pointer";
        }
      });

      kitElemento.addEventListener("mouseout", () => {
        kitElemento.style.backgroundColor = "white";
        kitElemento.style.cursor = "default";
      });

      kitElemento.addEventListener("click", () => {

        if (!isKitSelecionado) {
          kitElemento.style.backgroundColor = "white";
          kitElemento.style.cursor = "default";
          kitElemento.classList.add("kit-selecionado");
          isKitSelecionado = true;

          const kitCabecalho = document.createElement("h3");
          kitCabecalho.style.marginTop = "10px";
          kitCabecalho.textContent = "Informações do kit:";
          kitElemento.appendChild(kitCabecalho);

          const kitAtributos = ["reagentes", "vidrarias", "materiais"]
          kitAtributos.forEach(atributo => {

            const atributoElemento = document.createElement("div");
            atributoElemento.style.marginTop = "5px";
            atributoElemento.classList.add(kit-atributo);
            kitElemento.appendChild(atributoElemento);

            const atributoCabecalho = document.createElement("h4");
            atributoCabecalho.textContent = atributo;
            atributoElemento.appendChild(atributoCabecalho);

            kit[atributo].forEach(atributoItem => {
              const atributoItemElemento = document.createElement("p");
              atributoItemElemento.style.marginTop = "0px"
              atributoItemElemento.style.marginLeft = "5px"
              atributoItemElemento.textContent = `${atributoItem.nome} (${atributoItem.quantidade} ${atributoItem.unidade})`;
              atributoElemento.appendChild(atributoItemElemento);
            });

          });

          const botaoAdicionar = criarBotaoKit("Adicionar", "black", "#333", async () => {
            const subselecaoKitElemento = document.querySelector("#kits");
            kitAdicionadoElemento = document.createElement("div");
            kitAdicionadoElemento.classList.add("kit-adicionado");
            subselecaoKitElemento.appendChild(kitAdicionadoElemento);
            
            const kitNomeElemento = document.createElement("h3");
            kitNomeElemento.textContent = kit.nomeKit;
            const botaoDevolverKit = document.createElement("span");
            botaoDevolverKit.classList.add("remover-kit-btn");
            botaoDevolverKit.textContent = "X";
            kitNomeElemento.appendChild(botaoDevolverKit);

            botaoDevolverKit.addEventListener("click", () => {
              kitAdicionadoElemento.remove();
              kitElemento.style.display = "block";
              kitElemento.innerHTML = kit.nomeKit;
              kitElemento.classList.remove("kit-selecionado");
              isKitSelecionado = false;
            });
            
            kitAdicionadoElemento.appendChild(kitNomeElemento);

            kitAtributos.forEach(atributo => {
              const atributoCabecalhoElemento = document.createElement("h4");
              atributoCabecalhoElemento.textContent = `${atributo}`;
              kitAdicionadoElemento.appendChild(atributoCabecalhoElemento);

            kit[atributo].forEach(atributoItem => {
              const atributoItemElemento = document.createElement("div");
              atributoItemElemento.classList.add("summary-item");

              const atributoItemTexto = document.createElement("span");
              const unidadeParte = atributoItem.unidade ? ` ${atributoItem.unidade}` : '';
              atributoItemTexto.textContent = `${atributoItem.nome} (x${atributoItem.quantidade}${unidadeParte})`;
              atributoItemElemento.appendChild(atributoItemTexto);

              kitAdicionadoElemento.appendChild(atributoItemElemento);
            });
            });

            kitElemento.style.display = "none";
          });

          const botaoCancelar = criarBotaoKit("Cancelar", "var(--vermelho-base)", "var(--vermelho-escuro-10)", (evento) => {
            kitElemento.innerHTML = kit.nomeKit;
            kitElemento.classList.remove("kit-selecionado");
            isKitSelecionado = false;
            evento.stopPropagation();
          });

          const botoesContainer = document.createElement('div');
          botoesContainer.style.display = 'flex';
          botoesContainer.style.gap = '10px';
          botoesContainer.style.marginTop = '10px';
          botaoAdicionar.style.width = 'calc(50% - 5px)';
          botaoCancelar.style.width = 'calc(50% - 5px)';

          botoesContainer.appendChild(botaoAdicionar);
          botoesContainer.appendChild(botaoCancelar);
          kitElemento.appendChild(botoesContainer);

        }

      });
    });

  } catch (err) {
    console.error("Erro ao carregar kits:", err);
    const p = document.createElement("p");
    p.textContent = "Não foi possível carregar os kits disponíveis. Verifique sua conexão e tente recarregar a página.";
    kitsContainer.appendChild(p);
  }
}
// ========================================================
// Função para instanciar os botões de kits selecionados
// ========================================================

function criarBotaoKit(rotulo, cor, corHover, aoClicar) {
  const botaoKit = document.createElement("button");
  botaoKit.classList.add("botao-kit");
  botaoKit.textContent = `${rotulo}`;
  botaoKit.style.backgroundColor = `${cor}`

  botaoKit.style.display = 'l';
  botaoKit.style.width = '100%';
  botaoKit.style.boxSizing = 'border-box';
  botaoKit.style.color = 'white';

  botaoKit.addEventListener("mouseover", () => {
    botaoKit.style.backgroundColor = `${corHover}`;
  });

  botaoKit.addEventListener("mouseout", () => {
    botaoKit.style.backgroundColor = `${cor}`;
  });

  botaoKit.addEventListener("click", aoClicar)

  return botaoKit;
}

//==========================
// Adicionar e remover itens
//==========================

document.addEventListener('DOMContentLoaded', () => {
  carregarKits();
  carregarEstoque();

  document.querySelectorAll('.item-box').forEach(itemBox => {
    const nomeInput = itemBox.querySelector('.form-input-text:nth-of-type(1)');
    const tipoH3 = itemBox.querySelector('h3');

    const tipo = tipoH3.textContent.toLowerCase(); // 'reagentes', 'vidrarias' ou 'materiais'


    nomeInput.addEventListener('focus', () => {
      mostrarSugestoes(nomeInput, tipo);
    });

    nomeInput.addEventListener('input', () => {
      mostrarSugestoes(nomeInput, tipo);
    });

    nomeInput.addEventListener('blur', () => {
      setTimeout(() => {
        removerSugestoesExistentes();
      }, 200);
    });
  });


  //==========================
  // Adicionar itens
  //==========================

  document.querySelectorAll('.btn-add').forEach(button => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const itemBox = event.target.closest('.item-box');
      const inputs = itemBox.querySelectorAll(".form-input-text");
      const nomeInput = inputs[0];
      const qtdInput = inputs[1];

      const nome = nomeInput.value.trim();
      const quantidade = qtdInput.value.trim();

      if (!nome || !quantidade || isNaN(quantidade) || parseInt(quantidade) <= 0) {
        mostrarToast('Preencha nome e quantidade válidos.', 'erro');
        return;
      }

      // ===================================================================
      // Verifica se a quantidade pedida é maior que a disponível
      // ===================================================================

      if (estoqueCache) {
        const tipo = itemBox.querySelector('h3').textContent.toLowerCase();
        const itemEstoque = estoqueCache[tipo]?.find(i => i.nome.toLowerCase() === nome.toLowerCase());

        if (itemEstoque && parseInt(quantidade) > itemEstoque.quantidade) {
          mostrarToast(`Erro: Só existem ${itemEstoque.quantidade} unidades de '${nome}' no estoque.`, 'erro');
          return;
        } else if (!itemEstoque) {
          mostrarToast(`Aviso: Item '${nome}' não parece estar no estoque.`, 'erro');
        }
      }


      const tipo = itemBox.querySelector('h3').textContent.toLowerCase();
      let destinationBox;
      if (tipo === 'reagentes') destinationBox = document.querySelector('#reagentes');
      else if (tipo === 'vidrarias') destinationBox = document.querySelector('#vidrarias');
      else if (tipo === 'materiais') destinationBox = document.querySelector('#materiais')
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

  //==========================
  // Limpar inputs
  //==========================

  document.querySelectorAll('.btn-remove').forEach(button => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const itemBox = event.target.closest('.item-box');
      itemBox.querySelectorAll('.form-input-text').forEach(input => input.value = '');
    });
  });
});

//==========================
// Enviar agendamento
//==========================

const btnConfirm = document.getElementById("btn-lab-conf");
btnConfirm.addEventListener("click", async (event) => {
  event.preventDefault();

  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      mostrarToast("❌ Faça login antes de agendar.", "erro");
      return;
    }

    const res = await fetch(`${protocolo}${baseURL}/usuarios/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (!data.exists) {
      throw new Error("Usuário inválido");
    }

    const laboratorioEl = document.querySelector("#laboratorio-div select");
    const dataEl = document.querySelector('input[name="Data"]');
    const horarioEl = document.querySelector('input[name="datetime"]');
    const kitEl = document.querySelector("#select-kit");

    const laboratorio = laboratorioEl ? laboratorioEl.value : '';
    const dataStr = dataEl ? dataEl.value : '';
    const horario = horarioEl ? horarioEl.value : '';
    const kitSelecionado = kitEl ? kitEl.value : '';

    const reagentes = getItemsFromSummaryBox('#reagentes');
    const vidrarias = getItemsFromSummaryBox('#vidrarias');
    const materiais = getItemsFromSummaryBox('#materiais');

    if (!laboratorio || !dataStr || !horario) {
      mostrarToast("❌ Preencha Laboratório, Data e Horário.", "erro");
      return;
    }

    if (materiais.length === 0 && reagentes.length === 0 && vidrarias.length === 0 && !kitSelecionado) {
      mostrarToast("❌ Adicione ao menos um item ou selecione um kit.", "erro");
      return;
    }

    const agendamento = {
      laboratorio,
      data: new Date(dataStr + "T00:00:00"),
      horario,
      kit: kitSelecionado || "",
      reagentes,
      vidrarias,
      materiais,
      usuario: userId
    };

    // ==========================
    // Enviar agendamento ao servidor
    // ==========================
    
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
        mostrarToast(`❌ ${dataRes.error || dataRes.message}`, "erro");
      }

    } catch (err) {
      mostrarToast("❌ Falha na conexão com o servidor.", "erro");
      console.error("Erro de conexão:", err);
    }

  } catch (err) {
    switch (err.message) {
      case "Usuário inválido":
        mostrarToast("❌ Login inválido.", "erro");
        break;
      default:
      mostrarToast('Erro interno ao processar o agendamento.', 'erro');
    }
  }
});

const btnCancel = document.getElementById('btn-lab-cancelar');
if (btnCancel) {
  btnCancel.addEventListener('click', (event) => {
    event.preventDefault();
    const formContainer = document.getElementById('formulario');
    if (formContainer) formContainer.querySelectorAll('input, select, textarea').forEach(i => i.value = '');

    document.querySelectorAll('#reagentes, #vidrarias, #materiais').forEach(box => box.innerHTML = '');

    const btnRemoveKit = document.getElementById('btn-remover-kit');
    if (btnRemoveKit) btnRemoveKit.click();
  });
} else {
  console.warn('Botão #btn-lab-cancelar não encontrado no DOM.');
}