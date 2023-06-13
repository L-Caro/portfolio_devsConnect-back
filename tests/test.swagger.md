## TODO : Créer un modele réutilisable pour les paramètres :
pour les routes post, put, delete

```js
 /**
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 
 */
```

## Route POST

```js
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
```
ERREUR 
Not all input has been taken into account at your final specification.
Here's the report: 


 Error in ./app/routers/projectRouter.js :
YAMLSyntaxError: All collection items must start at the same column at line 13, column 8:

       required: true
       ^^^^^^^^^^^^^^…

YAMLSemanticError: Nested mappings are not allowed in compact mappings at line 13, column 18:

       required: true
                 ^^^^…

YAMLSemanticError: Implicit map keys need to be on a single line at line 13, column 18:

       required: true
                 ^^^^…
## Route DELETE
{
  "status": "error",
  "statusCode": 500,
  "message": "update or delete on table \"project\" violates foreign key constraint \"project_has_tag_project_id_fkey\" on table \"project_has_tag\""
}
