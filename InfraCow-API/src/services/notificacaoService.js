import Fazendas from "../models/Fazendas.js";
import Animais from "../models/Animais.js";
import Medicoes from "../models/Medicoes.js";
import Notificacoes from "../models/Notificacoes.js";

const formatarDataHora = (dataReferencia) => {
    if (!dataReferencia) {
        return {
            dia: null,
            mes: null,
            hora: null,
            dia_semana: null,
        };
    }

    const data = new Date(dataReferencia);

    return {
        dia: String(data.getDate()).padStart(2, '0'),
        mes: String(data.getMonth() + 1).padStart(2, '0'),
        hora: `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`,
        dia_semana: data.toLocaleDateString('pt-BR', { weekday: 'long' }),
    };
};

const montarResposta = (notificacao, animal, medicao) => {
    const dataReferencia = medicao?.datahora || notificacao.createdAt;
    const partesData = formatarDataHora(dataReferencia);

    return {
        id_notificacao: notificacao.id_notificacao,
        id_animal: notificacao.id_animal,
        id_medicao: notificacao.id_medicao,
        perigo: notificacao.perigo,
        texto: notificacao.perigo
            ? `Alerta de temperatura em ${animal?.nome_animal || 'animal'}`
            : `Leitura normal em ${animal?.nome_animal || 'animal'}`,
        temperatura: medicao?.temp ?? null,
        imagem: animal?.imagem ?? null,
        nome_animal: animal?.nome_animal ?? null,
        datahora: dataReferencia,
        ...partesData,
    };
};

class notificacaoService {
    async getAll(id_usuario) {
        try {
            const notificacoes = await Notificacoes.findAll({
                order: [['createdAt', 'DESC']],
            });

            const notificacoesDoUsuario = [];

            for (const notificacao of notificacoes) {
                const animal = await Animais.findOne({
                    where: { id_animal: notificacao.id_animal },
                });

                if (!animal) {
                    continue;
                }

                const fazenda = await Fazendas.findOne({
                    where: { id_fazenda: animal.id_fazenda, id_usuario },
                });

                if (!fazenda) {
                    continue;
                }

                const medicao = await Medicoes.findOne({
                    where: {
                        id_medicao: notificacao.id_medicao,
                        id_animal: notificacao.id_animal,
                    },
                });

                notificacoesDoUsuario.push(montarResposta(notificacao, animal, medicao));
            }

            return notificacoesDoUsuario;
        } catch (error) {
            console.log("Erro ao buscar notificações", error);
            return [];
        }
    }

    async create({ id_animal, id_medicao, perigo, id_usuario }) {
        try {
            const animal = await Animais.findOne({
                where: { id_animal },
            });

            if (!animal) {
                return null;
            }

            const fazenda = await Fazendas.findOne({
                where: { id_fazenda: animal.id_fazenda, id_usuario },
            });

            if (!fazenda) {
                return null;
            }

            const medicao = await Medicoes.findOne({
                where: {
                    id_medicao,
                    id_animal,
                },
            });

            if (!medicao) {
                return null;
            }

            const novaNotificacao = await Notificacoes.create({
                id_animal,
                id_medicao,
                perigo,
            });

            return montarResposta(novaNotificacao, animal, medicao);
        } catch (error) {
            console.log("Erro ao criar notificação", error);
            return null;
        }
    }

    async delete(id, id_usuario) {
        try {
            const notificacao = await Notificacoes.findOne({
                where: { id_notificacao: id },
            });

            if (!notificacao) {
                return false;
            }

            const animal = await Animais.findOne({
                where: { id_animal: notificacao.id_animal },
            });

            if (!animal) {
                return false;
            }

            const fazenda = await Fazendas.findOne({
                where: { id_fazenda: animal.id_fazenda, id_usuario },
            });

            if (!fazenda) {
                return false;
            }

            await notificacao.destroy();
            return true;
        } catch (error) {
            console.log("Erro ao excluir notificação", error);
            return false;
        }
    }
}

export default new notificacaoService();