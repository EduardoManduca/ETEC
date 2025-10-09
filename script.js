logincheck = () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'password123') {
        openModal('success-modal'); // modal de login bem succedido.

        setTimeout(() => {
            window.location.href = 'tela_Inicial.html';
        }, 3000); // Redirecionar paraa tela inicial após 3 segundos.
    } else {
        openModal('error-modal'); // modal de login após login incorreto.
    }
}

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}