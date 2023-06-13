const express = require("express");
const projectController = require("../controllers/projectController");
const controllerHandler = require("../helpers/controllerHandler");
const router = express.Router();

router.get("/", controllerHandler(projectController.getAllProjects));
router.get("/:id", controllerHandler(projectController.getOneProject));

router.post("/", controllerHandler(projectController.addOneProject));

router.put("/:id", controllerHandler(projectController.editOneProject));

router.delete("/:id", controllerHandler(projectController.deleteOneProject));

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
 *         created_at: "2023-06-06T19:08:42.845Z"
 *         updated_at: "2023-06-07T08:08:42.845Z"
 */

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: The projects managing API
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
 *       404:
 *         description: The project was not found
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
 *        description: Server error
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
 *      404:
 *        description: The project was not found
 *      500:
 *        description: Something went wrong
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
 *         description: The project has been updated
 *       404:
 *         description: The project was not found
 */
