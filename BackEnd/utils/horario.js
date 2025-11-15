function converterHorarioParaMinutos(horarioStr) {
    try {
        if (!horarioStr || typeof horarioStr !== "string" || !horarioStr.includes(":")) {
            throw new Error("Formato de horário inválido ou nulo"); // Exemplo esperado: "14:30"
        }
        const [horas, minutos] = horarioStr.split(":").map(Number);
        if (isNaN(horas) || isNaN(minutos)) { // Verifica se a conversão para número foi bem-sucedida
            throw new Error("Componentes do horário não são números");
        }
        return horas * 60 + minutos; // Retorna o total de minutos
    } catch (e) {
        console.warn(`Aviso: Falha ao converter horário "${horarioStr}". ${e.message}`);
        return -1; // Indica falha na conversão sem travar o programa.
    }
}

module.exports = { converterHorarioParaMinutos };