import Usuarios from '../models/Usuarios.js'
import bcrypt from 'bcrypt';

class usuarioService {
    async Create(nome, email, senha, imagem) {
        try {
            const hash = await bcrypt.hash(senha, 10);
            const novoUsuario = await Usuarios.create({
                nome,
                email,
                senha: hash,
                imagem,
            });
            return novoUsuario;
        } catch (error) {
            console.log("Erro ao criar o usuário: ", error)
            throw error;
        }
    }

    async getOne(email) {
        try {
            const usuario = await Usuarios.findOne({ where: { email }});
            return usuario;
        } catch (error) {
            console.log("Erro ao buscar o email do usuário: ", error)
        }
    }

    async getById(id) {
        try {
            const usuario = await Usuarios.findByPk(id);

            if(!usuario) {
                console.log(`Usuário com a id ${id} não encontrado!`)
            }

            return usuario;
        } catch (error) {
            console.log("Erro ao buscar usuário por ID:", error)
        }
    }

    async update(id, {nome, email, senha, imagem}) {
        try {
            const [atualizado] = await Usuarios.update(
                {
                    nome, 
                    email,
                    senha,
                    imagem,
                },
                {where: {id_usuario: id}}
            )

            if (!atualizado) {
                console.log(`Usuário com a id ${id} não encontrado`);
                return false;
            }
            return true;
        } catch(error) {
            console.log("Erro ao atualizar usuário: ", error)
            throw error;
        }
    }

    async delete(id) {
        try {
            const usuario = await Usuarios.findByPk(id);

            if(!usuario) {
                console.log(`Usuário com a id ${id} não encontrado`);
            }
                console.log(`Usuário com a id ${id} foi excluído com sucesso!`)

            await usuario.destroy();
        } catch(error) {
            console.log("Erro ao deleter usuário: ",error)
        }
    }
}

export default new usuarioService();