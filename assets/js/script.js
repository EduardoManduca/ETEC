// ***** Constantes e variáveis *****
const reagentesEl = document.getElementById('reagentes');
const reagentesValor = reagentesEl ? reagentesEl.value : null;
const botaoAumentar = document.getElementById("aumentar-texto");
const botaoDiminuir = document.getElementById("diminuir-texto");

let nivel = 0; // nível atual
const maxNivel = 3;
const minNivel = -3;
const incremento = 0.3; // 30%

// Guarda tamanhos originais
const tamanhosOriginais = new Map();


// ***** Funções *****

// Login
function logincheck() {
  const usernameEl = document.getElementById('username');
  const passwordEl = document.getElementById('password');
  const errorMessage = document.getElementById('errorMessage');

  const username = usernameEl ? usernameEl.value : '';
  const password = passwordEl ? passwordEl.value : '';

  const correctUsername = 'admin';
  const correctPassword = 'password123';
  const correctTecnico = 'tecnico';

  if (username === correctUsername && password === correctPassword) {
    if (errorMessage) errorMessage.style.display = 'none';
    window.location.href = '/pages/pages_professor/TelaProfessor.html';
  } else if (username === correctTecnico && password === correctPassword) {
    if (errorMessage) errorMessage.style.display = 'none';
    window.location.href = '/pages/pages_tecnico/menu_tecnico.html';
  } else {
    if (errorMessage) errorMessage.style.display = 'block';
  }
}


// Tema escuro
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}


// Guardar tamanhos originais
function guardarTamanhosOriginais() {
  const todosElementos = document.querySelectorAll("*");
  todosElementos.forEach(el => {
    const style = window.getComputedStyle(el);
    const size = parseFloat(style.fontSize) || 16;
    tamanhosOriginais.set(el, size);
  });
}


// Atualizar tamanhos de fonte
function atualizarTamanhos() {
  tamanhosOriginais.forEach((tamanhoOriginal, el) => {
    const novoTamanho = tamanhoOriginal * (1 + incremento * nivel);
    el.style.fontSize = novoTamanho + "px";
  });
}


// Pesquisar em lista
function search() {
  const inputEl = document.getElementById('searchInput');
  const input = inputEl ? inputEl.value.toLowerCase() : '';
  const items = document.querySelectorAll('.item');

  items.forEach(it => {
    const text = it.textContent || '';
    it.style.display = text.toLowerCase().includes(input) ? '' : 'none';
  });
}


// Adicionar linha à tabela
function addTableRow() {
  const tabela = document.getElementById("estoque");
  if (!tabela) return;
  const novaLinha = tabela.insertRow();
  const novaCelula = novaLinha.insertCell();
  novaCelula.innerHTML = "Novo valor";
}


// ***** Eventos *****
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') document.body.classList.add('dark-mode');

  guardarTamanhosOriginais();

  if (botaoAumentar) {
    botaoAumentar.addEventListener("click", () => {
      if (nivel < maxNivel) {
        nivel++;
        atualizarTamanhos();
      }
    });
  }

  if (botaoDiminuir) {
    botaoDiminuir.addEventListener("click", () => {
      if (nivel > minNivel) {
        nivel--;
        atualizarTamanhos();
      }
    });
  }
});

// Agendamento Lab
function adicionarItem(tipo) {

  let inputCampo = document.getElementById(`search-${tipo}`);
  let inputValor = inputCampo.value.trim();

  if (inputValor) {
    
    inputCampo.value = "";
    
    let itemListaSelecao = document.getElementById(`${tipo}`);
    let novoItem = document.createElement("p");
    novoItem.innerHTML = inputValor;
    itemListaSelecao.appendChild(novoItem);

  } else {

    let itemAviso = document.querySelector(`#${tipo}-header > .aviso`);
    itemAviso.classList.add("exibir");
    itemAviso.classList.remove("esconder");

    setTimeout(() => {
      itemAviso.classList.add("esconder");
      itemAviso.classList.remove("exibir");
    }, 5000);
    
  }
}
