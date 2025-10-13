function logincheck() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    const correctUsername = 'admin';
    const correctPassword = 'password123';

    if (username === correctUsername && password === correctPassword) {
        errorMessage.style.display = 'none';
        window.location.href = '/pages/index.html';
    } else {
        errorMessage.style.display = 'block';
    }
}
