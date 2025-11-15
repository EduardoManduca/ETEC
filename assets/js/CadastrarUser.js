document.querySelector(".login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    //==========================
    // Coletar dados do formulário
    //==========================

    const login = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const funcao = document.getElementById("dropdown-cadastro").value;

    //==========================
    // Selecionar elementos de feedback visual
    //==========================

    const mensagem = document.getElementById("cadastrar-check");
    const texto = mensagem.querySelector(".texto");
    const barra = mensagem.querySelector(".tempo-barra");

    try {

        //==========================
        // Enviar requisição ao backend
        //==========================

        const resposta = await fetch("http://localhost:5000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login, password, funcao })
        });

        const resultado = await resposta.json();

        //==========================
        // Exibir resultado do cadastro
        //==========================

        if (resposta.ok) {
            texto.innerHTML = resultado.message || "✅ Usuário cadastrado com sucesso!";
            mensagem.className = "cadastrar-check sucesso";
        } else {
            texto.innerHTML = resultado.error || "❌ Erro ao cadastrar usuário.";
            mensagem.className = "cadastrar-check erro";
        }

        //==========================
        // Mostrar mensagem com animação da barra
        //==========================

        mensagem.style.display = "block";
        mensagem.style.opacity = "1";
        barra.style.animation = "none";
        void barra.offsetWidth; // reinicia animação
        barra.style.animation = "esvaziar 5s linear forwards";


        //==========================
        // Ocultar mensagem após 5 segundos
        //==========================
        
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
        texto.textContent = "❌ Erro de conexão com o servidor.";
        mensagem.className = "cadastrar-check erro";
        mensagem.style.display = "block";
        barra.style.animation = "none";
        void barra.offsetWidth;
        barra.style.animation = "esvaziar 5s linear forwards";

        setTimeout(() => {
            mensagem.style.opacity = "0";
            setTimeout(() => {
                mensagem.style.display = "none";
                texto.innerHTML = "";
                barra.style.animation = "none";
            }, 400);
        }, 5000);
    }
});
