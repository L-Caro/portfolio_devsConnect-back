## Mise en place API DevsConnect

### Creation de la DB

devsconnect

### Installation de sqitch pour les migrations

- sqitch deploy
- sqitch verify
- commande seeding

(en cas de probleme sur la DB sqitch revert et recommencer)

### Yarn

- yarn install

### Lancement

- npx nodemon

## Les routes et les méthodes

### Users et authentifications (JWT)

`GET /api/users`
  --> `findAllUsers = async ()` : récupère tous les utilisateurs

`GET /api/users/:id`
  --> `findOneUser = async(id)` : récupère un utilisateur par son id

`DELETE /api/users/:id`
  --> `removeOneUser = async(id)` : supprime un utilisateur

`POST /signin`
--> `async register(req, res)`
  - récupère password non hashé (envoi du front) et mail
  - hash avec bcrypt
--> `createOneUser = async(name, firstname, email, pseudo, password, description, availability, tags)`
  - crée un nouvel utilisateur
  - récupère les tags et les ajoute à l'utilisateur

`POST /login`
--> `findUserByEmail = async(email)`
  - récupère un utilisateur par son mail
  - compare les passwords hashé et non hashé

`PUT /api/users/:id`
--> `updateOneUser = async (userId, userUpdate)`
  - mettre à jour un utilisateur
  - si tags associés à modifier
    - supprime les tags du projet actuel qui n'ont pas été reçus pour mise à jour
    - ajoute les tags reçus qui ne sont pas dans le projet actuel
  - si projets associés à modifier
    - update le statut is_active de l'utilisateur dans le projet

### Projects

`GET /api/projects`
--> `findAllProjects = async ()`
  - récupère tous les projets
  - avec users et tags

`GET /api/projects/:id`
--> `findOneProject = async(id)`
  - récupère un projet par son id
  - avec users et tags

`POST /api/projects`
--> `createOneProject = async(title, description, availability, user_id, tags)`
  - crée un nouvel projet 
  - récupère les tags et les ajoute à l'utilisateur

`DELETE /api/projects/:id`
--> `removeOneProject = async(id)`
  - supprime un projet

`PUT /api/projects/:id`
--> `updateOneProject = async (projectId, projectUpdate)`
  - mettre à jour un projet
  - si tags à modifier
  - supprime les tags du projet actuel qui n'ont pas été reçus pour mise à jour
  - ajoute les tags reçus qui ne sont pas dans le projet actuel
--> `findProjectOwner = async(projectId)`
  - récupère un projet via son propriétaire
  - utilisé pour les permissions :
  - accepter ou refuser un utilisateur dans un projet
  - modifier ou supprimer un projet

### Tags

`GET /api/tags`
--> `findAllTags = async ()` : récupère tous les utilisateurs

`GET /api/tags/:id`
--> `findOneTag = async(id)` : récupère un utilisateur par son id

Pas de `DELETE` : amélioration v2 uniquement pour les admins

### User has Tag

`createUserHasTag = async(userId, tagId)`

`deleteUserHasTag = async(userId, tagId)`

--> utilisés pour la modification d’un utilisateur

### Project has Tag

`createProjectHasTag = async(projectId, tagId)`

`deleteProjectHasTag = async(projectId, tagId)`

--> utilisés pour la modification d’un projet

### Project has User

`createProjectHasUser = async(projectId, userId)`
--> utilisé pour la création d’un projet
--> crée la relation entre un utilisateur et un projet

`updateProjectHasUser = async(projectId, userId)`
--> utilisé pour la modification du statut is_active du membre d’un projet
--> crée ou supprime la relation

`deleteProjectHasUser = async(projectId, userId)`
--> supprime la relation

## Permissions : middleware authorize

`authorize(permission, section) { // section = project or user`

`POST api/projects` : créer un projet

`DELETE or PUT api/projects/:id` : modifier ou supprimer un projet

`POST, PUT or DELETE api/projects/:projectId/user/:userId`
- ajouter ou supprimer un utilisateur dans un projet
- accepter ou refuser un utilisateur dans un projet

`PUT api/users/:id` : modifier ou supprimer un utilisateur
