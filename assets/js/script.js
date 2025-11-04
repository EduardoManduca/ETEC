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
  const material = document.getElementById("nome-material");
  const quantidade = document.getElementById("quantidade-material");
  const tabela = document.getElementById("estoque");
  if (!tabela) return;
  if (!material.value || !quantidade.value) {
    alert("❌ Por favor, preencha ambos os campos.");
    return;
  };
  const novaLinha = tabela.insertRow();
  const novaCelula = novaLinha.insertCell();
  novaCelula.innerHTML = material.value;
  const novaCelula2 = novaLinha.insertCell();
  novaCelula2.innerHTML = quantidade.value;
  material.value = "";
  quantidade.value = "";
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
