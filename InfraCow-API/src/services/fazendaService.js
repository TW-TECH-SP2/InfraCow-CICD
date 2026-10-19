import connection from "../database/dabase-config.js";
import Animais from "../models/Animais.js";
import Fazendas from "../models/Fazendas.js";

class fazendaService {
    async getAll(id_usuario) {
        try {
            return await Fazendas.findAll({ where: { id_usuario }});
        } catch(error) {
            console.log("Erro ao buscar fazenda", error)
        }
    }

    async create({nome_fazenda, rua, bairro, cidade, CEP, numero, id_usuario, imagem}) {
        try {
            const novaFazenda = await Fazendas.create({
                nome_fazenda,
                rua,
                bairro,
                cidade,
                CEP,
                numero,
                id_usuario,
                imagem,
            });
            return novaFazenda;
        } catch(error) {
            console.log("Erro ao criar fazenda: ", error);
        }
    }

    async delete(id, id_usuario) {
        try {
            const resultado = await connection.transaction(async (transaction) => {
                const fazenda = await Fazendas.findOne({
                    where: { id_fazenda: id, id_usuario },
                    transaction,
                });

                if (!fazenda) {
                    return 0;
                }

                await Animais.destroy({
                    where: { id_fazenda: id },
                    transaction,
                });

                return await Fazendas.destroy({
                    where: { id_fazenda: id, id_usuario },
                    transaction,
                });
            });

            if (!resultado) {
                console.log(`Fazenda com a id ${id} não encontrada`)
                return false;
            }
            console.log(`Fazenda com a id ${id} foi excluída com sucesso!`)
            return true;
        } catch(error) {
            console.log("Erro ao excluir fazenda: ", error);
            return false;
        }
    }

    async update(id, id_usuario, {nome_fazenda, rua, bairro, cidade, CEP, numero, imagem}) {
        try {
            const [atualizado] = await Fazendas.update(
                {
                    nome_fazenda,
                    rua,
                    bairro,
                    cidade,
                    CEP,
                    numero,
                    imagem
                },
                { where: { id_fazenda: id, id_usuario } }
            )

            if(!atualizado) {
                console.log(`Fazenda com a id ${id} não encontrada`)
                return false;
            }

            console.log(`Dados da fazenda com a id ${id} alterados com sucesso!`)
            return true;
        } catch (error) {
            console.log("Erro ao atualizar fazenda",error)
            return false;
        }
    }

    async getOne(id, id_usuario) {
        try {
            console.log(`Buscando fazenda ID: ${id} para usuário ${id_usuario}`)

            const fazenda = await Fazendas.findOne({ where: { id_fazenda: id, id_usuario } })

            if(!fazenda) {
                console.log(`Fazenda com a id ${id} não foi encontrada`)
            }

            return fazenda;
        } catch (error) {
            console.log("Erro ao buscar essa fazenda ",error)
        }
    }
}

export default new fazendaService();