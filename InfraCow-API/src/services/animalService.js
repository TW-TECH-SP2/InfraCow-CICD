import Animais from '../models/Animais.js'
import Fazendas from '../models/Fazendas.js'
import Medicoes from '../models/Medicoes.js'
import Notificacoes from '../models/Notificacoes.js'
import connection from '../database/dabase-config.js'

class animalService {
    async getAll(id_usuario) {
        try {
            const animais = await Animais.findAll();
            const animaisFiltrados = [];
            for (const animal of animais) {
                const fazenda = await Fazendas.findOne({
                    where: { id_fazenda: animal.id_fazenda, id_usuario }
                });
                if (fazenda) {
                    animaisFiltrados.push(animal);
                }
            }
            return animaisFiltrados;
        } catch (error) {
            console.log("Erro ao buscar todos os animais: ", error);
            return [];
        }
    }

    async create({nome_animal, codigo, genero, tipo, raca, peso, idade, id_fazenda, imagem,}) {
        try {
            const novoAnimal = await Animais.create({
                nome_animal, codigo, genero, tipo, raca, peso, idade, id_fazenda, imagem,
            });
            return novoAnimal;
        } catch (error) {
            console.log("Erro ao criar o animal: ", error)
        }
    }

    async delete(id, id_usuario) {
        try {
            const resultado = await connection.transaction(async (transaction) => {
                const animal = await Animais.findOne({ where: { id_animal: id }, transaction });
                if (!animal) return { sucesso: false, tipo: 'nao_encontrado' };

                const fazenda = await Fazendas.findOne({ where: { id_fazenda: animal.id_fazenda, id_usuario }, transaction });
                if (!fazenda) return { sucesso: false, tipo: 'nao_encontrado' };

                // deletar notificações que referenciam o animal/medições
                const totalNotificacoes = await Notificacoes.destroy({ where: { id_animal: id }, transaction });

                // deletar medições
                const totalMedicoes = await Medicoes.destroy({ where: { id_animal: id }, transaction });

                // deletar animal
                await animal.destroy({ transaction });

                return { sucesso: true, totalMedicoes, totalNotificacoes, id_animal: id };
            });
            return resultado;
        } catch (error) {
            console.log("Erro ao deleter o animal: ", error)
            return { sucesso: false, tipo: 'erro', mensagem: error.message };
        }
    }

    async update(id, id_usuario, {nome_animal, codigo, genero, tipo, raca, peso, idade, imagem}) {
        try {
            const animal = await Animais.findOne({
                where: { id_animal: id },
            });
            if(!animal) {
                return false;
            }
            const fazenda = await Fazendas.findOne({
                where: { id_fazenda: animal.id_fazenda, id_usuario },
            });
            if(!fazenda) {
                return false;
            }
            await animal.update({nome_animal, codigo, genero, tipo, raca, peso, idade, imagem})
            return true;
        } catch (error) {
            console.log("Erro ao atualizar o animal: ", error)
            return false;
        }
    }

    async getOne(id, id_usuario) {
        try {
            const animal = await Animais.findOne({
                where: {id_animal: id},
            })
            if(!animal) {
                return null;
            }
            const fazenda = await Fazendas.findOne({
                where: { id_fazenda: animal.id_fazenda, id_usuario },
            });
            if(!fazenda) {
                return null;
            }
            return animal;
        } catch (error) {
            console.log("Erro ao buscar esse animal: ", error)
            return null;
        }
    }

    async getByFazendaId(id_fazenda, id_usuario) {
        try {
            const fazenda = await Fazendas.findOne({
                where: { id_fazenda, id_usuario }
            });
            if (!fazenda) {
                return [];
            }
            const animais = await Animais.findAll({
                where: {id_fazenda},
            });
            const resultado = [];
            for (const animal of animais) {
                const ultimaMedicao = await Medicoes.findOne({
                    where: { id_animal: animal.id_animal },
                    order: [["datahora", "DESC"]],
                });
                resultado.push({
                    id: animal.id_animal,
                    nome_animal: animal.nome_animal,
                    genero: animal.genero || "-",
                    temperatura: ultimaMedicao?.temp ?? 0,
                });
            }
            return resultado;
        } catch (error) {
            console.log("Erro ao buscar animais por fazenda", error);
            return [];
        }
    }
}

export default new animalService();
