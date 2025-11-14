function converterHorarioParaMinutos(horarioStr) {
    try {
        if (!horarioStr || typeof horarioStr !== "string" || !horarioStr.includes(":")) {
            throw new Error("Formato de horário inválido ou nulo");
        }
        const [horas, minutos] = horarioStr.split(":").map(Number);
        if (isNaN(horas) || isNaN(minutos)) {
            throw new Error("Componentes do horário não são números");
        }
        return horas * 60 + minutos;
    } catch (e) {
        console.warn(`Aviso: Falha ao converter horário "${horarioStr}". ${e.message}`);
        return -1;
    }
}

module.exports = { converterHorarioParaMinutos };