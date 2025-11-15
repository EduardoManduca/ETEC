document.addEventListener("DOMContentLoaded", () => {
    const btnTopo = document.getElementById("btnTopo");
    const footer = document.getElementById("footer");

    if (!btnTopo || !footer) return;

    //==========================
    // Mostrar ou esconder botão ao rolar a página
    //==========================

    window.addEventListener("scroll", () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const footerTop = footer.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        // Exibe o botão se o scroll passar de 100px
        btnTopo.style.display = scrollTop > 100 ? "block" : "none";

        //==========================
        // Evitar que o botão passe sobre o footer
        //==========================

        if (footerTop < windowHeight + 25) {
            btnTopo.style.bottom = `${windowHeight - footerTop + 25}px`;
            btnTopo.style.animation = "quicar 1.5s infinite"; // Animação de quicar 1.5s
        } else {
            btnTopo.style.bottom = '25px';
            btnTopo.style.animation = "none";
        }
    });

    //==========================
    // Rolagem para o topo ao clicar no botão
    //==========================

    btnTopo.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});
