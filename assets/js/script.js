function logincheck() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    const correctUsername = 'admin';
    const correctPassword = 'password123';
    const correctTecnico = 'tecnico'


    if (username === correctUsername && password === correctPassword) {
        errorMessage.style.display = 'none';
        window.location.href = '/pages/pages_professor/TelaProfessor.html';
    } else if (username === correctTecnico && password === correctPassword) {
        errorMessage.style.display = 'none'
        window.location.href = '/pages/pages_tecnico/menu_tecnico.html'
    } else {
        errorMessage.style.display = 'block';
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
    } 
    else if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
    }
});

const botaoAumentar = document.getElementById("aumentar-texto");
const botaoDiminuir = document.getElementById("diminuir-texto");

let nivel = 0; // nível atual
const maxNivel = 3;
const minNivel = -3;
const incremento = 0.3;

// Guarda os tamanhos originais em um Map para cada elemento
const tamanhosOriginais = new Map();

function guardarTamanhosOriginais() {
  const todosElementos = document.querySelectorAll("*");
  todosElementos.forEach(el => {
    const style = window.getComputedStyle(el);
    // Pega o font-size atual (em px) e guarda
    tamanhosOriginais.set(el, parseFloat(style.fontSize));
  });
}

function atualizarTamanhos() {
  tamanhosOriginais.forEach((tamanhoOriginal, el) => {
    const novoTamanho = tamanhoOriginal * (1 + incremento * nivel);
    el.style.fontSize = novoTamanho + "px";
  });
}

botaoAumentar.addEventListener("click", () => {
  if (nivel < maxNivel) {
    nivel++;
    atualizarTamanhos();
  }
});

botaoDiminuir.addEventListener("click", () => {
  if (nivel > minNivel) {
    nivel--;
    atualizarTamanhos();
  }
});

// Inicializa a captura dos tamanhos originais ao carregar a página
guardarTamanhosOriginais();