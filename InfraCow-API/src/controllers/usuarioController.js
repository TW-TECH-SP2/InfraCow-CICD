import usuarioService from "../services/usuarioService.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWTSecret = process.env.JWT_SECRET || process.env.JWTSecret;

const criarUsuario = async (req, res) => {
  try {
    let { nome, email, senha, imagem } = req.body;

    if(!imagem) {
      imagem = "Null"
    }

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios" });
    }

    const novoUsuario = await usuarioService.Create(nome, email, senha, imagem);
    return res.status(201).json({ message: `Usuário ${nome} criado com sucesso!`});
  } catch (error) {
    console.log("Erro ao criar o usuário: ", error);
    return res.status(500).json({ error: "Erro interno ao criar usuário" });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "E-mail e senha obrigatórios" });
    }

    const usuario = await usuarioService.getOne(email);

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado!" });
    }

    const senhaBanco = await bcrypt.compare(senha, usuario.senha);

    if (!senhaBanco) {
      return res.status(401).json({ error: "Crendenciais inválidas" });
    }

    const usuarioId = usuario.id_usuario ?? usuario.id;

    const token = jwt.sign(
      { id: usuarioId, id_usuario: usuarioId, email: usuario.email },
      JWTSecret,
      { expiresIn: "24h" }
    );

    return res.status(200).json({ 
      token,
      usuario: {
        id: usuarioId,
        nome: usuario.nome,
        email: usuario.email,
        imagem: usuario.imagem,
      }
     });
  } catch (error) {
    console.log("Erro no login", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const getUsuarioLogado = async (req, res) => {
  try {
    const userId = req.usuarioLogado.id;
    const usuario = await usuarioService.getById(userId);

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado!" });
    }

    const { senha, ...dadosUsuario } = usuario.dataValues;
    return res.status(200).json({ usuario: dadosUsuario });
  } catch (error) {
    console.log("Erro ao buscar usuário logado: ", error);
    return res.status(500).json({ error: "Erro interno ao buscar usuário" });
  }
};

const updateUsuario = async (req, res) => {
  try {
    const userId = req.usuarioLogado.id;

    const { nome, email, senha } = req.body || {};
    const imagem =
      req.files?.imagem?.[0]?.filename ||
      req.files?.foto?.[0]?.filename ||
      req.file?.filename;

    const usuario = await usuarioService.getById(userId);

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado!" });
    }

    if (email) {
      const emailExistente = await usuarioService.getOne(email);
      const emailExistenteId = emailExistente?.id_usuario ?? emailExistente?.id;

      if (emailExistente && emailExistenteId != userId) {
        return res.status(400).json({ error: "E-mail já está em uso"})
      }
    }

    const dadosAtualizados = {
      nome: nome || usuario.nome,
      email: email || usuario.email,
    };

    if (imagem) {
      dadosAtualizados.imagem = imagem;
    }

    if (senha) {
      dadosAtualizados.senha = await bcrypt.hash(senha, 10);
    }

    await usuarioService.update(userId, dadosAtualizados);

    const usuarioAtualizado = await usuarioService.getById(userId);
    const { senha: _senha, ...dadosUsuario } = usuarioAtualizado.dataValues;

    return res.status(200).json({ message: "Usuário atualizado com sucesso!", usuario: dadosUsuario });

  } catch (error) {
    console.log("Erro ao atualizar usuário: ", error);
    
    return res.status(500).json({ error: "Erro interno ao atualizar usuário" });
  }
};

export default {
  criarUsuario,
  loginUsuario,
  getUsuarioLogado,
  updateUsuario,
  JWTSecret,
};