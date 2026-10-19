import notificacaoService from "../services/notificacaoService.js";

const registrarNotificacao = async (req, res) => {
    try {
        const { id_animal, id_medicao, perigo } = req.body || {};
        const id_usuario = req.usuarioLogado?.id;

        if (id_animal == null || id_medicao == null || perigo == null) {
            return res.status(400).json({ error: "Campos obrigatórios não respondidos" });
        }

        const perigoNormalizado = perigo === true || perigo === 'true' || perigo === 1 || perigo === '1';

        const notificacao = await notificacaoService.create({
            id_animal,
            id_medicao,
            perigo: perigoNormalizado,
            id_usuario,
        });

        if (!notificacao) {
            return res.status(404).json({ error: "Animal, medição ou fazenda não encontrada" });
        }

        return res.status(201).json({ message: "Notificação criada com sucesso", notificacao });
    } catch (error) {
        console.log("Erro ao criar notificação:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};

const deletarNotificacao = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuarioLogado?.id;

        if (!id) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const apagado = await notificacaoService.delete(id, id_usuario);

        if (apagado) {
            return res.status(200).json({ message: "Notificação deletada com sucesso" });
        }

        return res.status(404).json({ error: "Notificação não encontrada ou sem permissão" });
    } catch (error) {
        console.log("Erro ao deletar notificação:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};

const buscarTodasNotificacoes = async (req, res) => {
    try {
        const id_usuario = req.usuarioLogado?.id;
        const notificacoes = await notificacaoService.getAll(id_usuario);

        if (notificacoes.length > 0) {
            return res.status(200).json({ notificacoes });
        }

        return res.status(404).json({ message: "Nenhuma notificação encontrada" });
    } catch (error) {
        console.log("Erro ao buscar notificações:", error);
        return res.status(500).json({ error: "Erro interno" });
    }
};

export default { registrarNotificacao, deletarNotificacao, buscarTodasNotificacoes };