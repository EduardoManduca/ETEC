// Referências dos containers
const materiaisContainer = document.getElementById("materiais-container");
const equipamentosContainer = document.getElementById("equipamentos-container");

// ➕ Adicionar Material
document.getElementById("add-material").addEventListener("click", () => {
    const div = document.createElement("div");
    div.classList.add("item");
    div.innerHTML = `
      <input type="text" placeholder="Material" class="material-nome">
      <input type="number" placeholder="Qtd" class="material-qtd" min="1">
      <button type="button" class="remove-btn">Remover</button>
    `;
    div.querySelector(".remove-btn").addEventListener("click", () => div.remove());
    materiaisContainer.appendChild(div);
});

// ➕ Adicionar Equipamento
document.getElementById("add-equip").addEventListener("click", () => {
    const div = document.createElement("div");
    div.classList.add("item");
    div.innerHTML = `
      <input type="text" placeholder="Equipamento" class="equip-nome">
      <input type="number" placeholder="Qtd" class="equip-qtd" min="1">
      <button type="button" class="remove-btn">Remover</button>
    `;
    div.querySelector(".remove-btn").addEventListener("click", () => div.remove());
    equipamentosContainer.appendChild(div);
});

document.getElementById("btn-kit-limpar").addEventListener("click", () => {
    document.querySelectorAll("input, textarea").forEach((i) => (i.value = ""));
    materiaisContainer.innerHTML = "";
    equipamentosContainer.innerHTML = "";
});

document.getElementById("btn-kit-sol").addEventListener("click", async () => {
    const nomeKit = document.getElementById("nome-kit").value.trim();
    const observacoes = document.getElementById("obs-kit").value.trim();

    const materiais = [...document.querySelectorAll(".material-nome")].map((el, i) => ({
        item: el.value.trim(),
        quantidade: Number(document.querySelectorAll(".material-qtd")[i].value),
    }));

    const equipamentos = [...document.querySelectorAll(".equip-nome")].map((el, i) => ({
        item: el.value.trim(),
        quantidade: Number(document.querySelectorAll(".equip-qtd")[i].value),
    }));

    // ⚠️ Validação
    if (!nomeKit) return alert("Digite o nome do kit!");
    if (materiais.some((m) => !m.item || m.quantidade <= 0))
        return alert("Preencha todos os materiais corretamente!");
    if (equipamentos.some((e) => !e.item || e.quantidade <= 0))
        return alert("Preencha todos os equipamentos corretamente!");

    const data = { nomeKit, materiais, equipamentos, observacoes };

    try {
        const resp = await fetch("http://localhost:5000/kits", {  // <-- porta 5000
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });


        if (resp.ok) {
            alert("✅ Kit criado com sucesso!");
            document.getElementById("btn-kit-limpar").click();
        } else {
            const erro = await resp.json();
            alert("❌ Erro ao criar kit: " + (erro.error || "verifique o servidor"));
        }
    } catch (err) {
        console.error("Erro:", err);
        alert("Erro ao conectar com o servidor!");
    }
});
