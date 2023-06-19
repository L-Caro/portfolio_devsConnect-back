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

## Les routes


## Les méthodes

### Tokens

`generateAccessToken(ip, user)` {
- quand on se connecte, on génère un token
- on stocke les infos de l'utilisateur dans le token (ip, email, id, statut loggé, pseudo)
- on définit la durée de validité du token
},

`generateRefreshToken(id)` {
- générer un refresh token
},

`authorize(permission, section)` {
- section = project or user
- retrieve token
- check ip consistency
- check for create project
- check for modify or delete project
- if forbidden --> error
},

`isValidRefreshToken(token)` {
- get token from db
- check if token is valid
},

`getTokenUser(token)` {
- token may have expired
- ignore expiration
- get user from email
},

### Users

`setRefreshToken = async(id, token)` => {
- mettre à jour le refresh token
},

`getRefreshToken = async(id)` => {
- récupérer le refresh token
},

`findAllUsers = async ()` => {
- récupère tous les utilisateurs
},

`findOneUser = async(id)` => {
- récupérer un utilisateur par son id
},

`findUserByEmail = async(email)` => {
- récupérer un utilisateur par son mail
},

`removeOneUser = async(id)` => {
- supprimer un utilisateur
},

`createOneUser = async(name, firstname, email, pseudo, password, description, availability, tags)` => {
- crée un nouvel utilisateur
- récupère les tags et les ajoute à l'utilisateur
},

`updateOneUser = async (userId, userUpdate)` => {
- mettre à jour un utilisateur
- si tags à modifier
  - supprime les tags du projet actuel qui n'ont pas été reçus pour mise à jour
  - ajoute les tags reçus qui ne sont pas dans le projet actuel
- si projets à modifier
  - update le statut is_active de l'utilisateur dans le projet
},
