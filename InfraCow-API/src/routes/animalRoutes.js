import express from 'express'
import animalController from '../controllers/animalController.js'
import Auth from '../middlewares/Auth.js'
import upload from '../middlewares/upload.js'

const animalRoutes = express.Router();

/**
 * @swagger
 * /animais:
 *   get:
 *     summary: Listar todos os animais
 *     tags: [Animal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de animais
 */
animalRoutes.get("/animais", Auth.Autorization, animalController.buscarTodosAnimais);

/**
 * @swagger
 * /animais:
 *   post:
 *     summary: Registrar novo animal
 *     tags: [Animal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nome_animal:
 *                 type: string
 *               codigo:
 *                 type: string
 *               genero:
 *                 type: string
 *               tipo:
 *                 type: string
 *               raca:
 *                 type: string
 *               peso:
 *                 type: number
 *               idade:
 *                 type: integer
 *               id_fazenda:
 *                 type: integer
 *               imagem:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Animal registrado com sucesso
 */
animalRoutes.post("/animais", Auth.Autorization, upload.single('imagem'), animalController.registrarAnimal);

/**
 * @swagger
 * /animais/{id}:
 *   delete:
 *     summary: Deletar animal
 *     tags: [Animal]
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
 *         description: Animal deletado
 */
animalRoutes.delete("/animais/:id", Auth.Autorization, animalController.deletarAnimal);

/**
 * @swagger
 * /animais/{id}:
 *   put:
 *     summary: Atualizar animal
 *     tags: [Animal]
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
 *               nome_animal:
 *                 type: string
 *               codigo:
 *                 type: string
 *               genero:
 *                 type: string
 *               tipo:
 *                 type: string
 *               raca:
 *                 type: string
 *               peso:
 *                 type: number
 *               idade:
 *                 type: integer
 *               imagem:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Animal atualizado
 */
animalRoutes.put("/animais/:id", Auth.Autorization, upload.single('imagem'), animalController.atualizarAnimal);

/**
 * @swagger
 * /animais/{id}:
 *   get:
 *     summary: Buscar animal por ID
 *     tags: [Animal]
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
 *         description: Dados do animal
 */
animalRoutes.get("/animais/:id", Auth.Autorization, animalController.buscarAnimalPorID);

export default animalRoutes;