// ***** Constantes e variáveis *****
const reagentesValor = document.getElementById('reagentes').value;




const botaoAumentar = document.getElementById("aumentar-texto");
const botaoDiminuir = document.getElementById("diminuir-texto");
const body = document.body;

let nivel = 0; // nível atual (0 = normal)
const maxNivel = 3; // até 3 aumentos
const minNivel = -3; // até 3 reduções
const incremento = 1; // % por nível

// Tamanho original do texto
const tamanhoOriginal = parseFloat(
  window.getComputedStyle(body).fontSize
);


// ***** Funções *****

  tamanhosOriginais.forEach((tamanhoOriginal, el) => {
// ***** Constantes e variáveis *****
// If there's an element with id 'reagentes', safely read its value.
let reagentesValor = null;
const reagentesEl = document.getElementById('reagentes');
if (reagentesEl) reagentesValor = reagentesEl.value;

// Login / auth
function logincheck() {
  const usernameEl = document.getElementById('username');
  const passwordEl = document.getElementById('password');
  const errorMessage = document.getElementById('errorMessage');

  const username = usernameEl ? usernameEl.value : '';
  const password = passwordEl ? passwordEl.value : '';

  const correctUsername = 'admin';
  const correctPassword = 'password123';
  const correctTecnico = 'tecnico';

  // Prefer explicit professor path for admin user, tecnico for technician
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

// função dark mode
function toggleTheme() {
  const body = document.body;
  body.classList.toggle('dark-mode');

  if (body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
}

document.addEventListener('DOMContentLoaded', (event) => {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (savedTheme === 'light') {
    document.body.classList.remove('dark-mode');
  }

  // Initialize font scaling originals after DOM loads
  guardarTamanhosOriginais();
});

// ***** Texto: Aumentar / Diminuir *****
const botaoAumentar = document.getElementById("aumentar-texto");
const botaoDiminuir = document.getElementById("diminuir-texto");

let nivel = 0; // nível atual
const maxNivel = 3;
const minNivel = -3;
const incremento = 0.3; // fraction per level (30%)

// Guarda os tamanhos originais em um Map para cada elemento
const tamanhosOriginais = new Map();

function guardarTamanhosOriginais() {
  const todosElementos = document.querySelectorAll("*");
  todosElementos.forEach(el => {
    const style = window.getComputedStyle(el);
    // Pega o font-size atual (em px) e guarda; fallback to 16
    const size = parseFloat(style.fontSize) || 16;
    tamanhosOriginais.set(el, size);
  });
}

function atualizarTamanhos() {
  tamanhosOriginais.forEach((tamanhoOriginal, el) => {
    const novoTamanho = tamanhoOriginal * (1 + incremento * nivel);
    el.style.fontSize = novoTamanho + "px";
  });
}

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

// Small helpers used elsewhere in the project
function search() {
  const inputEl = document.getElementById('searchInput');
  const input = inputEl ? inputEl.value.toLowerCase() : '';
  const items = document.querySelectorAll('.item');
  // Placeholder: actual filtering behavior can be implemented where needed
  items.forEach(it => {
    const text = it.textContent || '';
    it.style.display = text.toLowerCase().includes(input) ? '' : 'none';
  });
}

function addTableRow() {
  const tabela = document.getElementById("estoque");
  if (!tabela) return;
  const novaLinha = tabela.insertRow();
  const novaCelula = novaLinha.insertCell();
  novaCelula.innerHTML = "Novo valor";
}

