document.addEventListener("DOMContentLoaded", () => {
    const btnTopo = document.getElementById("btnTopo");
    const footer = document.getElementById("footer");

    if (!btnTopo || !footer) return; // evita erros

    // Mostrar ou esconder botão ao rolar
    window.addEventListener("scroll", () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const footerTop = footer.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        btnTopo.style.display = scrollTop > 100 ? "block" : "none"; // pode ajustar para 100px

        // Evitar passar do footer
        if (footerTop < windowHeight + 25) {
            btnTopo.style.bottom = `${windowHeight - footerTop + 25}px`;
            btnTopo.style.animation = "quicar 1.5s infinite";

        } else {
            btnTopo.style.bottom = '25px';
            btnTopo.style.animation = "none";
        }
    });

    // Rolar suavemente para o topo
    btnTopo.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});
