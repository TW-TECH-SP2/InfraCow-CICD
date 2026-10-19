import medicaoService from "../services/medicaoService.js";
import notificacaoService from "../services/notificacaoService.js";

const registrarMedicao = async (req, res) => {
    try {
        const { temp, datahora, id_animal } = req.body || {};
        const id_usuario = req.usuarioLogado?.id;

        if (temp === undefined || !datahora || id_animal == null) {
            return res.status(400).json({ message: "CAMPOS OBRIGATORIOS NAO INSERIDOS" });
        }

        const novaMedicao = await medicaoService.create({ temp, datahora, id_animal });

        if (!novaMedicao) {
            return res.status(500).json({ message: "Erro ao registrar medição" });
        }

        const perigo = Number(novaMedicao.temp) <= 34 || Number(novaMedicao.temp) >= 38.7;

        try {
            const notificacao = await notificacaoService.create({
                id_animal: novaMedicao.id_animal,
                id_medicao: novaMedicao.id_medicao,
                perigo,
                id_usuario,
            });

            if (!notificacao) {
                console.log("Notificação não foi criada, mas a medição foi salva com sucesso.");
            }
        } catch (erroNotificacao) {
            console.log("Falha ao criar notificação automática:", erroNotificacao);
        }

        return res.status(201).json({ message: "Medição registrada com sucesso", medicao: novaMedicao });
    } catch (error) {
        console.log("Erro ao registrar medição: ", error);
        return res.status(500).json({ message: "Erro interno" });
    }
};

const deletarMedicao = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "ID inválido" });

        const deletado = await medicaoService.delete(id);

        if (deletado) {
            return res.status(204).json({ message: `Medição com id ${id} deletada com sucesso` });
        }

        return res.status(404).json({ message: "Medição não encontrada" });
    } catch (error) {
        console.log("Erro ao deletar medição: ", error);
        return res.status(500).json({ message: "Erro interno" });
    }
};

const atualizarMedicao = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "ID inválido" });

        const { temp, datahora, id_animal } = req.body;
        const atualizado = await medicaoService.update(id, { temp, datahora, id_animal });

        if (atualizado) {
            return res.status(200).json({ message: "Medição atualizada com sucesso" });
        }

        return res.status(404).json({ message: "Medição não encontrada" });
    } catch (error) {
        console.log("Erro ao atualizar medição: ", error);
        return res.status(500).json({ message: "Erro interno" });
    }
};

const buscarTodasMedicoes = async (req, res) => {
    try {
        const medicoes = await medicaoService.getAll();
        if (medicoes && medicoes.length > 0) {
            return res.status(200).json({ medicoes });
        }

        return res.status(404).json({ message: "Nenhuma medição encontrada" });
    } catch (error) {
        console.log("Erro ao buscar medições: ", error);
        return res.status(500).json({ message: "Erro interno" });
    }
};

const buscarMedicaoPorID = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "ID inválido" });

        const medicao = await medicaoService.getOne(id);
        if (medicao) {
            return res.status(200).json({ medicao });
        }

        return res.status(404).json({ message: "Medição não encontrada" });
    } catch (error) {
        console.log("Erro ao buscar medição específica: ", error);
        return res.status(500).json({ message: "Erro interno" });
    }
};

export default { registrarMedicao, deletarMedicao, atualizarMedicao, buscarTodasMedicoes, buscarMedicaoPorID };