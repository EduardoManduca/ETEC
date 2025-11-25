document.addEventListener("DOMContentLoaded", () => {
    // Seleção do modal e inputs
    const modal = document.getElementById("modal-editar");
    const inputId = document.getElementById("usuario-id");
    const inputLogin = document.getElementById("usuario-login");
    const inputFuncao = document.getElementById("usuario-funcao");
    const inputSenha = document.getElementById("usuario-senha");
    const btnSalvar = document.getElementById("salvar-usuario");
    const btnFechar = document.getElementById("fechar-modal");

    // ==============================
    // Abre modal preenchendo campos
    // ==============================
    function abrirModal(usuario) {
        inputId.value = usuario._id;
        inputLogin.value = usuario.login;
        inputFuncao.value = usuario.funcao;
        inputSenha.value = "";
        modal.style.display = "flex";
    }

    // ================
    // Fecha modal
    // ================

    btnFechar.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", (event) => {
        if (event.target === modal) modal.style.display = "none";
    });

    // ==============================
    // Salva alterações do usuário
    // ==============================

    btnSalvar.addEventListener("click", async () => {
        const id = inputId.value;
        const login = inputLogin.value.trim();
        const funcao = inputFuncao.value;
        const password = inputSenha.value;

        if (!login || !funcao) return alert("Login e função são obrigatórios!");

        try {
            await fetch(`http://localhost:5000/usuarios/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ login, funcao, password })
            });
            modal.style.display = "none";
            carregarUsuarios();
        } catch (err) {
            console.error("Erro ao atualizar usuário:", err);
            alert("Erro ao atualizar usuário. Veja o console.");
        }
    });

    // ================================
    // Carregar usuários na tabela
    // ================================

    async function carregarUsuarios() {
        try {
            const resposta = await fetch("http://localhost:5000/usuarios");
            const usuarios = await resposta.json();
            console.log("Usuários recebidos:", usuarios);

            const tbody = document.querySelector("#RegistroUsuario tbody");
            tbody.innerHTML = "";

            usuarios.forEach(u => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${u.login}</td>
                    <td>${u.funcao}</td>
                    <td>
                        <button class="btn-editar">Editar</button>
                        <button class="btn-excluir">Excluir</button>
                    </td>
                `;
                tbody.appendChild(tr);

                tr.querySelector(".btn-editar").addEventListener("click", () => abrirModal(u));              // Editar usuário: abre modal preenchido
                tr.querySelector(".btn-excluir").addEventListener("click", () => excluirUsuario(u._id));     // Excluir usuário
            });
        } catch (err) {
            console.error("Erro ao carregar usuários:", err);
        }
    }

    // ==============================
    // Excluir usuário
    // ==============================
    async function excluirUsuario(id) {
        if (!confirm("Deseja realmente excluir este usuário?")) return;
        try {
            await fetch(`http://localhost:5000/usuarios/${id}`, { method: "DELETE" });
            carregarUsuarios();
        } catch (err) {
            console.error("Erro ao excluir usuário:", err);
        }
    }

    carregarUsuarios();
});
