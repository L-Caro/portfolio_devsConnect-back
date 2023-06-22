const express = require('express');
const userController = require('../controllers/userController');
const controllerHandler = require('../helpers/controllerHandler');
const { authorize } = require('../auth');

const router = express.Router();

router.get('/:id', controllerHandler(userController.getOneUser)); 
router.get('/', controllerHandler(userController.getAllUsers)); 

router.put('/:id', authorize('modify', 'user'), controllerHandler(userController.editOneUser));

router.delete('/:id', authorize('delete', 'user'), controllerHandler(userController.deleteOneUser)); 

module.exports = router;

// Doc Swagger
/**
* @swagger
* components:
*   schemas:
*     Users:
*       type: object
*       required:
*         - name
*         - firstname
*         - email
*         - pseudo
*         - password
*         - description
*         - availability
*       properties:
*         id:
*           type: integer
*           description: The auto-generated id of the user
*         name:
*           type: string
*           description: The user name
*         firstname:
*           type: string
*           description: The user firstname
*         email:
*           type: string
*           description: The user email
*         pseudo:
*           type: string
*           description: The user pseudo
*         password:
*           type: string
*           description: The user password
*         description:
*           type: string
*           description: The user pseudo
*         availability: 
*           type: boolean
*           description: The user availability
*         tags:
*           type: array
*           items:
*             type: object
*             properties:
*               id:
*                 type: integer
*               name:
*                 type: string  
*           description: Array with all tags of the user
*         projects:
*           type: array
*           items:
*             type: object
*             properties:
*               id:
*                 type: integer
*               name:
*                 type: string  
*           description: Array of objects for the projects of the user
*         created_at: 
*           type: timestamp
*           description: The auto-generated time of the user's creation
*         updated_at: 
*           type: timestamp
*           description: The auto-generated time of the user's update
*       example:
*         id: 1
*         name: Captain
*         firstname: Haddock
*         email: captain@gmail.com
*         pseudo: Moussaillon
*         password: harengs1234
*         description: Vieux loup de mer
*         availability: true
*         tags: [{id: 1, name: Java}]
*         projects: [{id: 1, name: DevsConnect}]
*         created_at: "2023-06-06T19:08:42.845Z"
*         updated_at: "2023-06-07T08:08:42.845Z"
*/

/**
* @swagger
* tags:
*   name: Users
*   description: API routes for the Users
*/

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Returns the list of all the Users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Users'
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/users/{id}:
 *  get:
 *     summary: Get one project
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: The user description by id
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Users'
 *       204:
 *         description: The User was not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/users:
 *  post:
 *    summary: Create a new User
 *    tags: [Users]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Users'
 *    responses:
 *      200:
 *        description: The user has been successfully created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Users'
 *      500:
 *        description: Internal Server Error
 */

/**
 * @swagger
 * /api/users/{id}:
 *  put:
 *    summary: Update the user
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The user id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Users'
 *    responses:
 *      200:
 *        description: The user has been updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Users'
 *      204:
 *        description: The user was not found
 *      500:
 *        description: Internal Server Error
 */

/**
 * @swagger
 * /api/users/{id}:
 *  delete:
 *     summary: Delete the User by its id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: The user has been updated
 *       204:
 *         description: The user was not found
 *       500:
 *        description: Vous ne pouvez pas supprimer votre profil avant de supprimer vos projets
 */
