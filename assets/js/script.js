function logincheck() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    const correctUsername = 'admin';
    const correctPassword = 'password123';
    const correctTecnico = 'tecnico'


    if (username === correctUsername && password === correctPassword) {
        errorMessage.style.display = 'none';
        window.location.href = '/pages/index.html';
    } else if (username === correctTecnico && password === correctPassword) {
        errorMessage.style.display = 'none'
        window.location.href = '/pages/pages_tecnico/menu_tecnico.html'
    } else {
        errorMessage.style.display = 'block';
    }
}
// função dark mode
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } 
    else if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
    }
});