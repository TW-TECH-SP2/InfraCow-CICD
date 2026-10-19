import express from 'express';
import notificacaoController from '../controllers/notificacaoController.js';
import Auth from '../middlewares/Auth.js';

const notificacaoRoutes = express.Router();

/**
 * @swagger
 * /notificacoes:
 *   get:
 *     summary: Listar notificações do usuário
 *     tags: [Notificação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificações
 */
notificacaoRoutes.get('/notificacoes', Auth.Autorization, notificacaoController.buscarTodasNotificacoes);

/**
 * @swagger
 * /notificacoes:
 *   post:
 *     summary: Criar notificação
 *     tags: [Notificação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_animal:
 *                 type: integer
 *               id_medicao:
 *                 type: integer
 *               perigo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Notificação criada com sucesso
 */
notificacaoRoutes.post('/notificacoes', Auth.Autorization, notificacaoController.registrarNotificacao);

/**
 * @swagger
 * /notificacoes/{id}:
 *   delete:
 *     summary: Deletar notificação
 *     tags: [Notificação]
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
 *         description: Notificação deletada com sucesso
 */
notificacaoRoutes.delete('/notificacoes/:id', Auth.Autorization, notificacaoController.deletarNotificacao);

export default notificacaoRoutes;