async function logincheck() {
    const login = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("errorMessage");

    // Reset do erro antes de tentar login
    errorMessage.style.display = "none";
    errorMessage.textContent = "";

    if (!login || !password) {
        mostrarErro("Login e senha são obrigatórios.");
        return;
    }

    try {
        const resposta = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login, password })
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            mostrarSucesso(resultado.message || "✅ Login bem-sucedido!");

            // Redireciona conforme função
            const funcao = resultado.usuario.funcao;
            if (funcao === "admin" || funcao === "administrador") {
                window.location.href = "/pages/pages_admin/TelaAdministrador.html";
            } else if (funcao === "professor") {
                window.location.href = "/pages/pages_professor/TelaProfessor.html";
            } else if (funcao === "tecnico") {
                window.location.href = "/pages/pages_tecnico/TelaTecnico.html";
            } else {
                window.location.href = "telalogin.html";
            }
        } else {
            mostrarErro(resultado.error || "Erro no login.");
        }
    } catch (err) {
        mostrarErro("Erro ao conectar com o servidor.");
        console.error(err);
    }

    // Estilo da mensagem de texto após tentativa de login incorreta
    function mostrarErro(msg) {
        errorMessage.style.display = "block";
        errorMessage.style.color = "#f32a2a";
        errorMessage.textContent = msg;
        errorMessage.classList.add("show");
        setTimeout(() => {
            errorMessage.classList.remove("show");
            errorMessage.style.display = "none";
        }, 5000);
    }
    // Estilo da mensagem de texto após tentativa de login correta
    function mostrarSucesso(msg) {
        errorMessage.style.display = "block";
        errorMessage.style.color = "#388E3C";
        errorMessage.textContent = msg;
        errorMessage.classList.add("show");
        setTimeout(() => {
            errorMessage.classList.remove("show");
            errorMessage.style.display = "none";
        }, 3000);
    }
}