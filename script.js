logincheck = () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'admin' && password === 'password123') {
        alert('Login bem-sucedido!');
        window.location.href = 'tela_Inicial.html'; // Redireciona para a página inicial
    }else {
        alert('Nome de usuário ou senha incorretos. Tente novamente.');
    }}