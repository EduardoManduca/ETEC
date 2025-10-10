function logincheck() {
    const username = document.getElementById('username').value;
    const senha = document.getElementById('password').value;

    if (username === 'admin' && senha === 'password123') {
        openModal('success-modal');
        setTimeout(() => {
            window.location.href = 'tela_Inicial.html';
        }, 3000);
    } else {
        openModal('error-modal');
    }
}