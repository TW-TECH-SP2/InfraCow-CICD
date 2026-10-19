import express from 'express'
import medicoesController from '../controllers/medicoesController.js'
import Auth from '../middlewares/Auth.js'

const medicoesRoutes = express.Router();

/**
 * @swagger
 * /medicoes:
 *   get:
 *     summary: Listar todas as medições
 *     tags: [Medição]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de medições
 */
medicoesRoutes.get("/medicoes", Auth.Autorization, medicoesController.buscarTodasMedicoes);

/**
 * @swagger
 * /medicoes:
 *   post:
 *     summary: Registrar nova medição
 *     tags: [Medição]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               temp:
 *                 type: number
 *               datahora:
 *                 type: string
 *               id_animal:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Medição registrada com sucesso
 */
medicoesRoutes.post("/medicoes", Auth.Autorization, medicoesController.registrarMedicao);

/**
 * @swagger
 * /medicoes/{id}:
 *   delete:
 *     summary: Deletar medição
 *     tags: [Medição]
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
 *         description: Medição deletada
 */
medicoesRoutes.delete("/medicoes/:id", Auth.Autorization, medicoesController.deletarMedicao);

/**
 * @swagger
 * /medicoes/{id}:
 *   put:
 *     summary: Atualizar medição
 *     tags: [Medição]
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
 *         description: Medição atualizada
 */
medicoesRoutes.put("/medicoes/:id", Auth.Autorization, medicoesController.atualizarMedicao);

/**
 * @swagger
 * /medicoes/{id}:
 *   get:
 *     summary: Buscar medição por ID
 *     tags: [Medição]
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
 *         description: Dados da medição
 */
medicoesRoutes.get("/medicoes/:id", Auth.Autorization, medicoesController.buscarMedicaoPorID);

export default medicoesRoutes;