const express = require("express");
const projectController = require("../controllers/projectController");
const controllerHandler = require("../helpers/controllerHandler");
const { authorize } = require('../auth');
const router = express.Router();

router.get("/", controllerHandler(projectController.getAllProjects));
router.get("/:id", controllerHandler(projectController.getOneProject));

router.post("/", authorize('create', 'project'), controllerHandler(projectController.addOneProject));

router.put("/:id", authorize('modify', 'project'), controllerHandler(projectController.editOneProject));

router.delete("/:id", authorize('delete', 'project'), controllerHandler(projectController.deleteOneProject));


//ajouter les verifications d'autorisations a auth/index.js
router.post("/:projectId/user/:userId", authorize('add', 'projectHasUser'), controllerHandler(projectController.addUserToProject));

router.put("/:projectId/user/:userId", authorize('accept', 'projectHasUSer'), controllerHandler(projectController.updateUserToProject));

router.delete("/:projectId/user/:userId", authorize('remove', 'projectHasUser'), controllerHandler(projectController.deleteUserToProject));


module.exports = router;

// Doc Swagger
/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - user_id
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the project
 *         title:
 *           type: string
 *           description: The project title
 *         description:
 *           type: string
 *           description: The project description
 *         availibility:
 *           type: boolean
 *           description: The project availibility
 *         user_id:
 *           type: integer
 *           description: The auto-generated id of the project's creator
 *         tags:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string  
 *           description: Array with all tags of the project
 *         users:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string  
 *           description: Array of objects for the users of the project
 *         created_at:
 *           type: timestamp
 *           description: The auto-generated time of the project's creation
 *         updated_at:
 *           type: timestamp
 *           description: The auto-generated time of the project's update
 *       example:
 *         id: 1
 *         title: Biscoc O
 *         description: Lorem ipsum blabla
 *         availibility: TRUE
 *         user_id: 2
 *         tags: [{id: 2, name: Javascript}, {id: 3, name: HTML}, {id: 4, name: CSS}]
 *         users: [{id: 4, name: Caro}, {id: 2, name: Mangeot}, {id: 3, name: Danglot}]
 *         created_at: "2023-06-06T19:08:42.845Z"
 *         updated_at: "2023-06-07T08:08:42.845Z"
 */

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: API routes for the Projects
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Returns the list of all the projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: The list of the projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/projects/{id}:
 *  get:
 *     summary: Get the project by id
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The project id
 *     responses:
 *       200:
 *         description: The project description by id
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       204:
 *         description: The project was not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/projects:
 *  post:
 *    summary: Create a new project
 *    tags: [Projects]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Project'
 *    responses:
 *      200:
 *        description: The project has been successfully created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Project'
 *      500:
 *        description: Internal Server Error
 */

/**
 * @swagger
 * /api/projects/{id}:
 *  put:
 *    summary: Update the project by its id
 *    tags: [Projects]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The project id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Project'
 *    responses:
 *      200:
 *        description: The project has been updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Project'
 *      204:
 *        description: The project was not found
 *      500:
 *        description: Internal Server Error
 */

/**
 * @swagger
 * /api/projects/{id}:
 *  delete:
 *     summary: Update the project by its id
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The project id
 *     responses:
 *       200:
 *         description: The project has been deleted successfully
 *       204:
 *         description: The project was not found
 *       500:
 *         description: Internal Server Error
 */
