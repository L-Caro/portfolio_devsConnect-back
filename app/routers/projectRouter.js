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

router.put("/:projectId/user/:userId", authorize('accept', 'projectHasUser'), controllerHandler(projectController.updateUserToProject));

router.delete("/:projectId/user/:userId", authorize('remove', 'projectHasUser'), controllerHandler(projectController.deleteUserToProject));


module.exports = router;

// Doc Swagger
/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: API routes for the Projects
 */

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
 *         availability:
 *           type: boolean
 *           description: The project availability
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
 *               pseudo:
 *                 type: string  
 *               availability:
 *                 type: boolean
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
 *         availability: TRUE
 *         user_id: 2
 *         tags: [{id: 2, name: Javascript}, {id: 3, name: HTML}, {id: 4, name: CSS}]
 *         users: [{id: 4, pseudo: Bipbip, availability: true}, {id: 2, pseudo: Lulu, availability: false}, {id: 3, pseudo: Pilou, availability: true}]
 *         created_at: "2023-06-06T19:08:42.845Z"
 *         updated_at: "2023-06-07T08:08:42.845Z"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Project POST and PUT:
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
 *         availability:
 *           type: boolean
 *           description: The project availability
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
 *           description: Array with all tags id of the project
 *         users:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *           description: Array of objects for the users id of the project
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
 *         availability: TRUE
 *         user_id: 2
 *         tags: [ 2, 3, 4 ]
 *         users: [ 4, 2, 3 ]
 *         created_at: "2023-06-06T19:08:42.845Z"
 *         updated_at: "2023-06-07T08:08:42.845Z"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Project permissions:
 *       type: object
 *       required:
 *         - user_id
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the project
 *         user_id:
 *           type: integer
 *           description: The auto-generated id of the project's creator
 *       example:
 *         id: 1
 *         user_id: 2
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
 *                 $ref: '#/components/schemas/Project POST and PUT'
 *       204:
 *         description: The project was not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/projects:
 *  post:
 *    summary: Create a new project - connected user
 *    tags: [Projects]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Project POST and PUT'
 *    responses:
 *      200:
 *        description: The project has been successfully created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Project POST and PUT'
 *      500:
 *        description: Internal Server Error
 */

/**
 * @swagger
 * /api/projects/:projectId/user/:userId:
 *  post:
 *    summary: Permission to add a user to a project
 *    tags: [Projects]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Project permissions'
 *    responses:
 *      200:
 *        description: Permission granted to add a user to a project
 *      500:
 *        description: Internal Server Error
 */

/**
 * @swagger
 * /api/projects/:projectId/user/:userId:
 *  put:
 *    summary: Permission to update the status of a user in a project
 *    tags: [Projects]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Project permissions'
 *    responses:
 *      200:
 *        description: Permission granted to update the status of a user in a project
 *      500:
 *        description: Internal Server Error
 */

/**
 * @swagger
 * /api/projects/:projectId/user/:userId:
 *  delete:
 *    summary: Permission to delete a user in a project
 *    tags: [Projects]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Project permissions'
 *    responses:
 *      200:
 *        description: Permission granted to delete a user in a project
 *      500:
 *        description: Internal Server Error
 */

/**
 * @swagger
 * /api/projects/{id}:
 *  put:
 *    summary: Update the project by its id - permission needed
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
 *            $ref: '#/components/schemas/Project POST and PUT'
 *    responses:
 *      200:
 *        description: The project has been updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Project POST and PUT'
 *      204:
 *        description: The project was not found
 *      500:
 *        description: Internal Server Error
 */

/**
 * @swagger
 * /api/projects/{id}:
 *  delete:
 *     summary: Delete the project by its id - permission needed
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
