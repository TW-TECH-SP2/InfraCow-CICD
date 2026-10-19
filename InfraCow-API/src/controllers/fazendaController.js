import fazendaService from "../services/fazendaService.js"

const registrarFazenda = async (req,res) =>{
    try{
        const {nome_fazenda, rua, bairro, cidade, CEP, numero}= req.body || {}
        const id_usuario = req.usuarioLogado?.id
        const imagem = req.file ? req.file.filename: null 
        

        if(!nome_fazenda || !rua || !bairro || !cidade || !CEP || !numero || !id_usuario){
            return res.status(400).json({error: "Campos Obrigatorios Não Respondidos"})
        }
       const novaFazenda =  await fazendaService.create({ nome_fazenda, rua, bairro, cidade, CEP, numero, id_usuario, imagem })
        return res.status(201).json({ message: `Fazenda ${nome_fazenda} criada com sucesso`,fazenda : novaFazenda}) 


    }catch(error){
        console.log("Erro ao registrar fazenda: ", error)
        return res.status(500).json({ error: "Erro Interno de Servidor"})
    }
}

const deletarFazenda = async (req,res) =>{
    try {
        const {id} = req.params
        const id_usuario = req.usuarioLogado?.id
        const apagado = await fazendaService.delete(id, id_usuario)
        if(apagado){
            return res.status(204).json({message: `Fazenda ${id} Deletado Com Sucesso`})
        }
        else{
            return res.status(400).json({message: "Não Foi Possivel Deletar a Fazenda"})
        }
    } catch(error){
        console.log("Erro ao deletar a fazenda: ", error)
        return res.status(500).json({error: "PROBLEMAS DE SERVIDOR"})}
    
}

const atualizarFazenda = async (req,res) =>{
    try {
        const {id} = req.params;
        const {nome_fazenda, rua, bairro, cidade, CEP, numero} = req.body || {}
        const id_usuario = req.usuarioLogado?.id
        const imagem = req.file ? req.file.filename : undefined
        const atualizado = await fazendaService.update(id, id_usuario, { nome_fazenda, rua, bairro, cidade, CEP, numero, imagem })
        if(atualizado){
            return res.status(200).json({message:`${nome_fazenda} foi atualizada com sucesso`})
        }
        else{
            return res.status(404).json({message:"FAZENDA NAO ENCONTRADA"})
        }
    }
    catch(error){
        console.log("Erro ao atualizar fazenda: ",error)
        return res.status(500).json({error:"PROBLEMA COM SERVIDOR"})
        
    }
}

const buscarTodasFazendas = async (req,res) =>{
    try{
        const id_usuario = req.usuarioLogado?.id
        const fazendas =  await fazendaService.getAll(id_usuario)
        if(fazendas){
            return res.status(200).json({ fazendas:fazendas})
        }
        else{
            return res.status(404).json({
                message: "Nenhuma Fazenda Encontrada Para Esse Usuario"})
        }
    }
    catch(error)
    {
        console.log("Erro ao buscar fazenda", error)
        return res.status(500).json({error: "PROBLEMA COM SERVIDOR"})
    }
}

const buscarFazendaPorID = async (req,res) =>{
   try{ 
    const {id}= req.params
    const id_usuario = req.usuarioLogado?.id
    if(!id){
        return res.status(400).json({message:"ID invalido"})
    }
    const fazenda = await fazendaService.getOne(id,id_usuario)
    if(fazenda){
        return res.status(200).json({ fazenda : fazenda})
    }
    else{
        return res.status(404).json({message:"Fazenda Nao Encontrada"})
    }
}
catch(error){
    console.log("Erro ao buscar fazenda específica ".error)
    return res.status(500).json({error:"PROBLEMA COM SERVIDOR"})
}
}

export default { registrarFazenda, deletarFazenda, atualizarFazenda, buscarTodasFazendas, buscarFazendaPorID};