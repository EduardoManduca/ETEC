const protocolo = "http://"
const baseURL = "localhost:5000"

function escaparRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removerAcentuacao(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

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

function exibirResultados(container, correspondencias) {
  container.innerHTML = "";
  correspondencias.forEach(c => {
    const p = document.createElement("p");
    p.textContent = c.item;
    container.appendChild(p);

    p.addEventListener("click", () => {
      const tipo = c.tipo;
      adicionarItem(c);
    });
  });
}

function adicionarItem(item) {
  const tipo = item.tipo;
  const container = document.getElementById(`${tipo}`);
  let novoItem = document.createElement("p");
  novoItem.innerHTML = item.item;
  container.appendChild(novoItem);
}


// Esta função provavelmente vai ser removida, mas a lógica dela pode ser reimplementada
function adicionarItemAntigo(tipo) {

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

const searchVidraria = document.querySelector("#search-vidraria");
const materiaisResultado = document.querySelector("#materiais-resultados");

searchVidraria.addEventListener("input", async () => {
  try {
    const itensEndpoint = "/itens"
    const URLCompleta = `${protocolo}${baseURL}${itensEndpoint}`
    const itens = (await axios.get(URLCompleta)).data
    
    const searchValor = removerAcentuacao(escaparRegex(searchVidraria.value));
    const regex = new RegExp(searchValor, "i");

    const correspondencias = itens.filter(item => (regex.test(removerAcentuacao(item.item)) && item.tipo === "vidraria"));
    exibirResultados(materiaisResultado, correspondencias);

  } catch (err) {
    console.log(err)
  }
});

// searchVidraria.addEventListener("blur", () => {
//   materiaisResultado.innerHTML = ""
// });

document.getElementById("btn-lab-conf").addEventListener("click", async () => {
  const laboratorio = document.querySelector("#laboratorio-div select").value;
  const dataStr = document.querySelector('input[name="Data"]').value;
  const dataObj = new Date(dataStr + "T00:00:00");
  const horario = document.querySelector('input[name="datetime"]').value;
  const kit = document.querySelectorAll("#laboratorio-div select")[1].value;

  const materiais = [...document.querySelectorAll("#materiais input:checked")].map(i => i.value);
  const reagentes = [...document.querySelectorAll("#reagentes input:checked")].map(i => i.value);

  const userId = localStorage.getItem("userId");
  if (!userId) {
    mostrarToast("❌ Usuário não logado. Faça login antes de agendar.", "erro");
    return;
  }

  if (!laboratorio || !dataObj || !horario || !kit) {
    mostrarToast("❌ Você deve preencher todos os campos antes de fazer um agendamento.", "erro");
    return;
  }

  const agendamento = { laboratorio, data: dataObj, horario, kit, materiais, reagentes, usuario: userId };

  try {
    const res = await fetch("http://localhost:5000/agendamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(agendamento)
    });

    const dataRes = await res.json().catch(() => ({}));

    if (res.ok) {
      mostrarToast("✅ Agendamento realizado com sucesso!", "sucesso");
    } else {
      console.error("Erro ao salvar agendamento:", dataRes);
      mostrarToast(`❌ Erro ao salvar o agendamento. (${res.status})`, "erro");
    }

  } catch (err) {
    mostrarToast("❌ Falha na conexão com o servidor.", "erro");
    console.error("Erro de conexão:", err);
  }
});
