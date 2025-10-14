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

// 1. Função para alternar entre tema claro e escuro
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');

    // Salvar a preferência do usuário no localStorage
    if (body.classList.contains('dark-mode')) {
        // Se ativou o modo escuro
        localStorage.setItem('theme', 'dark');
    } else {
        // Se desativou (voltou para o modo claro)
        localStorage.setItem('theme', 'light');
    }
}

// 2. Aplicar o tema salvo ao carregar a página
document.addEventListener('DOMContentLoaded', (event) => {
    // Tenta obter a preferência salva
    const savedTheme = localStorage.getItem('theme');

    // Se a preferência for 'dark', aplica a classe 'dark-mode'
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } 
    // Opcional: Se a preferência for 'light' ou não existir, garante que a classe 'dark-mode' não esteja lá
    else if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
    }
});