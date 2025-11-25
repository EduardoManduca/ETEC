async function logincheck() {
    const login = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("errorMessage");

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

        if (!resposta.ok) {
            mostrarErro(resultado.error || "Erro no login.");
            return;
        }

        if (resultado.usuario && resultado.usuario._id) {
            localStorage.setItem("userId", resultado.usuario._id);
            const rememberEl = document.getElementById('remember');
            try {
                if (rememberEl && rememberEl.checked) {
                    localStorage.setItem('rememberedUsername', login);
                } else {
                    localStorage.removeItem('rememberedUsername');
                }
            } catch (e) {
                console.warn('Erro ao acessar localStorage para lembrar usuário', e);
            }
        } else {
            mostrarErro("Usuário inválido recebido do servidor.");
            return;
        }

        mostrarSucesso(resultado.message);

        const funcao = resultado.usuario.funcao;
        setTimeout(() => {
            if (funcao === "admin" || funcao === "administrador") {
                window.location.href = "/pages/pages_admin/TelaAdministrador.html";
            } else if (funcao === "professor") {
                window.location.href = "/pages/pages_professor/TelaProfessor.html";
            } else if (funcao === "tecnico") {
                window.location.href = "/pages/pages_tecnico/TelaTecnico.html";
            } else {
                window.location.href = "telalogin.html";
            }
        }, 3000); // Aguarda 3 segundos antes de redirecionar

    } catch (err) {
        mostrarErro("Erro ao conectar com o servidor.");
        console.error(err);
    }

    // ==================================================
    // Funções para mostrar mensagens de erro e sucesso
    // ==================================================

    function mostrarErro(msg) {
        errorMessage.style.display = "block";

        // Marca como erro e remove classes de sucesso
        errorMessage.classList.remove("sucesso");
        errorMessage.classList.add("erro");

        errorMessage.style.background = "#f8d7da"; // vermelho claro
        errorMessage.style.color = "#721c24";      // vermelho escuro
        errorMessage.style.border = "1px solid #f5c6cb";

        errorMessage.textContent = msg;

        errorMessage.classList.add("show", "shake");
        setTimeout(() => errorMessage.classList.remove('shake'), 700);

        setTimeout(() => {
            errorMessage.classList.remove("show");
            errorMessage.style.display = "none";
        }, 5000);
    }


    function mostrarSucesso(msg) {
        errorMessage.style.display = "block";
        errorMessage.classList.remove("erro");
        errorMessage.classList.remove("shake");
        errorMessage.classList.add("sucesso");

        errorMessage.style.background = "#d4edda";
        errorMessage.style.color = "#155724";
        errorMessage.style.border = "1px solid #c3e6cb";

        errorMessage.textContent = msg;

        errorMessage.classList.add("show");
        setTimeout(() => {
            errorMessage.classList.remove("show");
            errorMessage.style.display = "none";
        }, 3000);
    }

}

document.addEventListener('DOMContentLoaded', () => {
    try {
        const remembered = localStorage.getItem('rememberedUsername');
        if (remembered) {
            const input = document.getElementById('username');
            const rememberEl = document.getElementById('remember');
            if (input) input.value = remembered;
            if (rememberEl) rememberEl.checked = true;
        }
    } catch (e) {
        console.warn('Erro ao ler rememberedUsername', e);
    }
});
