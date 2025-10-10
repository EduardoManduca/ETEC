function logincheck() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'password123') {
        document.getElementById('success-modal').style.display = 'block';

        setTimeout(() => {
            window.location.href = '/pages/index.html';
        }, 3000);
    } else {
        // Mostra modal de erro
        document.getElementById('error-modal').style.display = 'block';
    }
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function ErrorReport() {
    // error
}
