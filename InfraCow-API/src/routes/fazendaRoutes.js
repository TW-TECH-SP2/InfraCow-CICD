import express from 'express'
import fazendaController from '../controllers/fazendaController.js'
import Auth from '../middlewares/Auth.js'
import upload from '../middlewares/upload.js'

const fazendaRoutes = express.Router();

/**
 * @swagger
 * /fazendas:
 *   get:
 *     summary: Listar todas as fazendas do usuário
 *     tags: [Fazenda]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de fazendas
 *       401:
 *         description: Token inválido
 */
fazendaRoutes.get("/fazendas", Auth.Autorization, fazendaController.buscarTodasFazendas);

/**
 * @swagger
 * /fazendas:
 *   post:
 *     summary: Criar nova fazenda
 *     tags: [Fazenda]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nome_fazenda
 *               - rua
 *               - bairro
 *               - cidade
 *               - CEP
 *               - numero
 *             properties:
 *               nome_fazenda:
 *                 type: string
 *               rua:
 *                 type: string
 *               bairro:
 *                 type: string
 *               cidade:
 *                 type: string
 *               CEP:
 *                 type: string
 *               numero:
 *                 type: string
 *               imagem:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Fazenda criada com sucesso
 *       400:
 *         description: Campos obrigatórios faltando
 */
fazendaRoutes.post("/fazendas", Auth.Autorization, upload.single('imagem'), fazendaController.registrarFazenda);

/**
 * @swagger
 * /fazendas/{id}:
 *   delete:
 *     summary: Deletar fazenda
 *     tags: [Fazenda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Fazenda deletada com sucesso
 *       404:
 *         description: Fazenda não encontrada
 */
fazendaRoutes.delete("/fazendas/:id", Auth.Autorization, fazendaController.deletarFazenda);

/**
 * @swagger
 * /fazendas/{id}:
 *   put:
 *     summary: Atualizar fazenda
 *     tags: [Fazenda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nome_fazenda:
 *                 type: string
 *               rua:
 *                 type: string
 *               bairro:
 *                 type: string
 *               cidade:
 *                 type: string
 *               CEP:
 *                 type: string
 *               numero:
 *                 type: string
 *               imagem:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Fazenda atualizada com sucesso
 *       404:
 *         description: Fazenda não encontrada
 */
fazendaRoutes.put("/fazendas/:id", Auth.Autorization, upload.single('imagem'), fazendaController.atualizarFazenda);

/**
 * @swagger
 * /fazendas/{id}:
 *   get:
 *     summary: Buscar fazenda por ID
 *     tags: [Fazenda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados da fazenda
 *       404:
 *         description: Fazenda não encontrada
 */
fazendaRoutes.get("/fazendas/:id", Auth.Autorization, fazendaController.buscarFazendaPorID);

export default fazendaRoutes;