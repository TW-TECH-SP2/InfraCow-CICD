import Medicoes from "../models/Medicoes.js";

class MedicaoService {
    async getAll() {
        try {
            return await Medicoes.findAll();
        } catch (error) {
            console.log("Erro ao buscar medições", error)
        }
    }

    async create({ temp, datahora, id_animal}) {
        try {
            const novaMedicao = await Medicoes.create({
                temp,
                datahora,
                id_animal,
            })

            return novaMedicao;
        } catch (error) {
            console.log("Erro ao criar medição", error)
        }
    }

    async delete(id) {
        try {
            const deletado = await Medicoes.destroy({ where: { id_medicao: id }})

            if(!deletado) {
                console.log(`Medição com a id ${id} não encontrada`)
                return false;
            } else {
                console.log(`Medição com a id ${id} foi deletada`)
                return true;
            }
        } catch (error) {
            console.log("Erro ao deleter medição", error)
            return false;
        }
    }

    async update(id, { temp, datahora, id_animal}) {
        try {
            const atualizado = await Medicoes.update(
                {temp, datahora, id_animal},
                {where: {id_medicao: id} }
            );

            if(!atualizado[0]) {
                console.log(`Medição com a id ${id} não foi encontrada`)
                return false;
            } else {
                console.log(`Medição com a id ${id} atualizada com sucesso`);
                return true;
            }
        } catch (error) {
            console.log("Erro ao atualizar medição", error)
            return false;
        }
    }

    async getOne(id) {
        try {
            console.log("Buscando medição com ID: ", id);

            const medicao = await Medicoes.findOne({ where: {id_medicao: id} })

            if(!medicao) {
                console.log(`Medição com a id ${id} não foi encontrada`)
            }
            return medicao;
        } catch (error) {
            console.log("Erro ao buscar essa medição", error)
            return null;
        }
    }
}

export default new MedicaoService;