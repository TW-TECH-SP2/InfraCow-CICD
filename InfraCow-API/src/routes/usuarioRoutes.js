import express from 'express'
import usuarioController from '../controllers/usuarioController.js'
import Auth from '../middlewares/Auth.js'
import upload from '../middlewares/upload.js'

const usuarioRoutes = express.Router();

/**
 * @swagger
 * /usuario:
 *   post:
 *     summary: Criar novo usuário
 *     tags: [Usuário]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               imagem:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Campos obrigatórios faltando
 *       500:
 *         description: Erro interno do servidor
 */
usuarioRoutes.post("/usuario", usuarioController.criarUsuario);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autenticar usuário
 *     tags: [Usuário]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nome:
 *                       type: string
 *                     email:
 *                       type: string
 *                     imagem:
 *                       type: string
 *                       nullable: true
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno do servidor
 */
usuarioRoutes.post("/login", usuarioController.loginUsuario);

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Buscar usuário logado
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Token inválido ou expirado
 *       500:
 *         description: Erro interno do servidor
 */
usuarioRoutes.get("/usuarios", Auth.Autorization, usuarioController.getUsuarioLogado);

/**
 * @swagger
 * /perfil:
 *   put:
 *     summary: Atualizar perfil do usuário
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               imagem:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
usuarioRoutes.put("/perfil", Auth.Autorization, upload.fields([{ name: 'imagem', maxCount: 1 }, { name: 'foto', maxCount: 1 }]), usuarioController.updateUsuario);

export default usuarioRoutes;