document.getElementById("btn-kit-sol").addEventListener("click", async () => {
    e.preventDefault();

    const nome = document.getElementById("nome-kit").value;
    const materiais = [...document.querySelectorAll("#materiais-kit input:search]")].map(i => i.value);
    const quantMat = [...document.querySelectorAll("#num-mat input[type='number']")].map(i => i.value);
    const equipamentos = [...document.querySelectorAll("#equip-kit input:search")].map(i => i.value);
    const quantEquip = [...document.querySelectorAll("#num-equip input[type='number']")].map(i => i.value);
    const observacoes = document.getElementById("obs-kit").value;
    const kitData = {
        nome,
        materiais: materiais.map((mat, index) => ({ item: mat, quantidade: quantMat[index] })),
        equipamentos: equipamentos.map((equip, index) => ({ item: equip, quantidade: quantEquip[index] })),
        observacoes
    }
    try {
        const resposta = await fetch("http://localhost:5000/kits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(kitData)
        })
        const resultado = await resposta.json();
        if (resposta.ok) {
            alert("✅ Kit solicitado com sucesso!");
        } else {
            alert("❌ Erro ao solicitar o kit: " + (resultado.error || "Erro desconhecido."));
        }
        mensagem.style.display = "block";
        mensagem.style.opacity = "1";
        barra.style.animation = "none";
        void barra.offsetWidth; // reinicia a animação da barra
        barra.style.animation = "esvaziar 5s linear forwards";

        // Intervalo da mensagem de status
        setTimeout(() => {
            mensagem.style.opacity = "0";
            setTimeout(() => {
                mensagem.style.display = "none";
                texto.innerHTML = "";
                barra.style.animation = "none";
            }, 400);
        }, 5000);

    } catch (err) {
        console.error("Erro ao enviar a requisição:", err);
        alert("❌ Erro de conexão com o servidor.");
        mensagem.className = "cadastrar-check erro";
        mensagem.style.display = "block";

        barra.style.animation = "none";
        void barra.offsetWidth;
        barra.style.animation = "esvaziar 5s linear forwards";

        // Intervalo da mensagem de status
        setTimeout(() => {
            mensagem.style.opacity = "0";
            setTimeout(() => {
                mensagem.style.display = "none";
                texto.innerHTML = "";
                barra.style.animation = "none";
            }, 400);
        }, 5000);
    }
})