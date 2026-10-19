import Fazendas from "../models/Fazendas.js";
import animalService from "../services/animalService.js"

const registrarAnimal = async (req, res) => {
    try {
        const { nome_animal, codigo, genero, tipo, raca, peso, idade, id_fazenda } = req.body || {};
        const id_usuario = req.usuarioLogado?.id;
        const imagem = req.file ? req.file.filename : null;

        if (!nome_animal || genero == null || tipo == null || raca == null || peso == null || idade == null || id_fazenda == null) {
            return res.status(400).json({ error: "Campos Obrigatorios Não Respondidos"});
        }

        const fazenda = await Fazendas.findOne({ where: {id_fazenda, id_usuario}});

        if(!fazenda) {
            return res.status(403).json({ error: "Sem permissão para adicionar animais nessa fazenda"})
        }

        const criarAnimal = await animalService.create({nome_animal, codigo, genero, tipo, raca, peso, idade, id_fazenda, imagem,});
        return res.status(201).json({ messagem: "Animal registrado com sucesso!", animal: criarAnimal});
    } catch (error) {
        console.log("Erro ao criar animal: " ,error);
        return res.status(500).json({ error: "Erro interno"})
    }
}

const deletarAnimal = async (req, res) => {
    try {
        const {id} = req.params
        const id_usuario = req.usuarioLogado?.id
        
        const resultado = await animalService.delete(id, id_usuario);
        
        if(resultado.sucesso) {
            return res.status(200).json({ 
                message: "Animal e medições deletados com sucesso.", 
                deletedMedicoes: resultado.totalMedicoes,
                deletedAnimalId: resultado.id_animal
            });
        }
        
        if(resultado.tipo === 'nao_encontrado') {
            return res.status(403).json({ error: "Animal não encontrado ou você não tem permissão para deletá-lo" });
        }
        
        return res.status(500).json({ error: resultado.mensagem || "Erro ao deletar animal" });
    } catch (error) {
        console.log("Erro ao deletar animal: ", error);
        return res.status(500).json({ error: "Erro interno"});
    }
}

const atualizarAnimal = async (req, res) => {
    try {
        const {id} = req.params;
        const id_usuario = req.usuarioLogado?.id;
        const imagem = req.file ? req.file.filename : undefined;
        const { nome_animal, codigo, genero, tipo, raca, peso, idade } = req.body || {};
        const atualizado = await animalService.update( id, id_usuario, {nome_animal, codigo, genero, tipo, raca, peso, idade, imagem});
        if (atualizado) {
            return res.status(200).json({ mensagem: `${nome_animal} atualizado com sucesso!`});
        } else {
            return res.status(404).json({ error: "Animal não encontrado"});
        }
    } catch (error) {
        console.log("Erro ao atualizar animal: ", error);
        res.status(500).json({ error: "Erro interno"})
    }
}

const buscarTodosAnimais = async (req, res) => {
    try {
        const id_usuario = req.usuarioLogado?.id
        const animais = await animalService.getAll(id_usuario);
        if(animais) {
            return res.status(200).json({ animais:animais})
        } else {
            return res.status(404).json({ error: "Nenhuma Fazenda Encontrada Para Esse Usuário"})
        }
    } catch (error) {
        console.log("Erro ao buscar animais:", error);
        return res.status(500).json({error: "Erro interno"})
    }
}

const buscarAnimalPorID = async (req, res) => {
    try {
        const {id} = req.params
        const id_usuario = req.usuarioLogado?.id
        const animal = await animalService.getOne(id, id_usuario)
        if(animal) {
            return res.status(200).json({ animal: animal})
        } else {
            return res.status(404).json({ error: "Animal não encontrado"})
        }

    } catch (error) {
        console.log("Erro ao buscar animal específico", error);
        return res.status(500).json({ error: "Erro interno"})
    }
}

export default { registrarAnimal, deletarAnimal, atualizarAnimal, buscarTodosAnimais, buscarAnimalPorID};