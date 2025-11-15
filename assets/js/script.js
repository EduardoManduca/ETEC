const botaoAumentar = document.getElementById("aumentar-texto");
const botaoDiminuir = document.getElementById("diminuir-texto");

let nivel = 0;
const maxNivel = 3;
const minNivel = -3;
const incremento = 0.2;
const tamanhosOriginais = new Map();

//==========================
// TEMA ESCURO / CLARO
//==========================

function toggleTheme() {
  const darkModeAtivo = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", darkModeAtivo ? "dark" : "light");

  document.querySelectorAll(".card, .item, table, input, textarea").forEach(el => {
    el.classList.toggle("dark-element", darkModeAtivo);
  });
}

// ==========================
// Guarda tamanhos originais de fonte
// ==========================

function guardarTamanhosOriginais() {
  document.querySelectorAll("body *").forEach(el => {
    if (!tamanhosOriginais.has(el)) {
      const size = parseFloat(window.getComputedStyle(el).fontSize);
      if (!isNaN(size)) tamanhosOriginais.set(el, size);
    }
  });
}

// ==========================
// Atualiza tamanhos de fonte
// ========================== 

function atualizarTamanhos() {
  tamanhosOriginais.forEach((tamanhoOriginal, el) => {
    const novoTamanho = tamanhoOriginal * (1 + incremento * nivel);
    el.style.fontSize = `${novoTamanho}px`;
  });
}

//==========================
// PESQUISA EM LISTA
//==========================

function search() {
  const inputEl = document.getElementById("searchInput");
  const termo = inputEl ? inputEl.value.toLowerCase() : "";
  const items = document.querySelectorAll(".item");

  items.forEach(it => {
    const texto = it.textContent.toLowerCase();
    it.style.display = texto.includes(termo) ? "" : "none";
  });
}

//==========================
// ADIÇÃO DE LINHA NA TABELA
//==========================

function addTableRow() {
  const material = document.getElementById("nome-material");
  const quantidade = document.getElementById("quantidade-material");
  const tabela = document.getElementById("estoque");

  if (!tabela) return alert("Tabela de estoque não encontrada.");
  if (!material.value || !quantidade.value) {
    alert("❌ Por favor, preencha ambos os campos.");
    return;
  }

  const novaLinha = tabela.insertRow();
  novaLinha.insertCell().textContent = material.value;
  novaLinha.insertCell().textContent = quantidade.value;
  material.value = "";
  quantidade.value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme"); // Recupera tema salvo
  if (savedTheme === "dark") document.body.classList.add("dark-mode");

  // Guarda tamanhos originais após renderizar
  requestAnimationFrame(() => guardarTamanhosOriginais());

  // ===========================
  // Evento: aumentar texto
  // ===========================

  if (botaoAumentar) {
    botaoAumentar.addEventListener("click", () => {
      if (nivel < maxNivel) {
        nivel++;
        atualizarTamanhos();
      }
    });
  }

  // ===========================
  // Evento: diminuir texto
  // ===========================

  if (botaoDiminuir) {
    botaoDiminuir.addEventListener("click", () => {
      if (nivel > minNivel) {
        nivel--;
        atualizarTamanhos();
      }
    });
  }
});
