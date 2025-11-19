const protocolo = "http://";
const baseURL = "localhost:5000";

// NOVO Bloco: Variável para guardar o estoque em cache
let estoqueCache = null;

//==========================
// Função para ler itens das caixas de resumo (Equipamentos, Reagentes, Materiais)
//==========================

function getItemsFromSummaryBox(boxId) {
  // ... (Seu código original, sem alterações)
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

//==========================
// Mostrar aviso (toast)
//==========================

function mostrarToast(mensagem, tipo = "sucesso") {
  // ... (Seu código original, sem alterações)
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

// NOVO Bloco: Funções para carregar estoque e exibir sugestões

/**
 * Busca o estoque da API e armazena em cache
 */
async function carregarEstoque() {
  if (estoqueCache) return estoqueCache; // Retorna do cache se já tiver
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

/**
 * Remove qualquer caixa de sugestão que esteja aberta
 */
function removerSugestoesExistentes() {
  const oldBox = document.querySelector('.sugestao-box');
  if (oldBox) oldBox.remove();
}

/**
 * @param {HTMLInputElement} inputElement O campo <input> que o usuário clicou
 * @param {string} tipo O tipo de item ('reagentes' e 'vidrarias')
 */
async function mostrarSugestoes(inputElement, tipo) {
  removerSugestoesExistentes(); // Fecha caixas antigas

  // Garante que o estoque esteja carregado
  if (!estoqueCache) {
    await carregarEstoque();
  }
  if (!estoqueCache) return; // Se falhou ao carregar, para aqui

  // Pega a lista de itens correta (ex: estoqueCache.reagentes)
  const listaDeItens = estoqueCache[tipo] || [];
  const filtro = inputElement.value.toLowerCase();

  // Filtra os itens
  const itensFiltrados = listaDeItens.filter(item =>
    item.nome.toLowerCase().includes(filtro) && item.quantidade > 0
  );

  const sugestaoBox = document.createElement('div');
  sugestaoBox.className = 'sugestao-box';

  // Calcula a posição da caixa de sugestões
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
      // Exibe o nome, quantidade disponível e unidade
      itemDiv.textContent = `${item.nome} (Disponível: ${item.quantidade} ${item.unidade || ''})`;

      // Usamos 'mousedown' que dispara antes do 'blur' do input
      itemDiv.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Impede que o input perca o foco antes da hora
        inputElement.value = item.nome; // Preenche o input
        removerSugestoesExistentes(); // Fecha a caixa

        // Opcional: Foca no campo de quantidade
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
            atributoElemento.class = "kit-atributo";
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

          const botaoAdicionar = criarBotaoKit("Adicionar", "var(--concluido)", "var(--verde-base)", () => {});

          const botaoCancelar = criarBotaoKit("Cancelar", "var(--vermelho-base)", "var(--vermelho-escuro-10)", (evento) => {
            kitElemento.innerHTML = kit.nomeKit;
            kitElemento.classList.remove("kit-selecionado");
            isKitSelecionado = false;
            evento.stopPropagation();
          });

          [botaoAdicionar, botaoCancelar].forEach(b => {
            kitElemento.appendChild(b);
          });

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
  carregarKits(); // Carrega os kits disponíveis ao abrir a página
  carregarEstoque(); // Carrega o estoque em cache assim que a página abre

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
          return; // Impede a adição
        } else if (!itemEstoque) {
          mostrarToast(`Aviso: Item '${nome}' não parece estar no estoque.`, 'erro');
        }
      }


      const tipo = itemBox.querySelector('h3').textContent.toLowerCase();
      let destinationBox;
      if (tipo === 'reagentes') destinationBox = document.querySelector('#reagente');
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

document.getElementById("btn-lab-conf").addEventListener("click", async (event) => {
  event.preventDefault(); // Previne o envio padrão do formulário

  const userId = localStorage.getItem("userId");
  if (!userId) {
    mostrarToast("❌ Faça login antes de agendar.", "erro");
    return;
  }

  const laboratorio = document.querySelector("#laboratorio-div select").value;
  const dataStr = document.querySelector('input[name="Data"]').value;
  const horario = document.querySelector('input[name="datetime"]').value;
  const kitSelecionado = document.querySelector("#select-kit").value;

  const reagentes = getItemsFromSummaryBox('#reagente');
  const vidrarias = getItemsFromSummaryBox('#vidrarias');
  const materiais = getItemsFromSummaryBox('#materiais')
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
    materiais,
    usuario: userId
  };
  // Envia a requisição para a API
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