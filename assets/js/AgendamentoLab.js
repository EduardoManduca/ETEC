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
