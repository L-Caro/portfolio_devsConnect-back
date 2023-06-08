FOREIGN KEY (ClientID)
        REFERENCES Clients (ClientID)
        ON DELETE CASCADE

A foreign key with cascade delete means that if a record in the parent table is deleted, then the corresponding records in the child table will automatically be deleted. This is called a cascade delete in SQL Server.

DELETE CASCADE: When we create a foreign key using this option, it deletes the referencing rows in the child table when the referenced row is deleted in the parent table which has a primary key.

# Pug

app.set('view engine', 'pug'); is used while setting the view engine. This will set the view template type.
Pug est un moteur de templates implémenté en JavaScript qui permet de générer dynamiquement du HTML
<https://pugjs.org/api/getting-started.html?ref=blog.ippon.fr>

# Architecture
`index.js` à la racine : fichier d'init de l'API
dossier app :
    - `index.js` à la racine : config de base du dossier app --> dispatche dans les différents éléments
    - routers : `index.js` regroupe la config de tous les routers pour dispatcher à chaque router
    - controllers : `projectController` --> récupérer tous les projets
    - dataMappers : `database.js` --> client (pool)

# dataMapper

```js
const pool = require('./database');

const dataMapper = {

    // une méthode, c'est une fonction défini dans un objet
    findAllProjects: async () => { 
    //async pour indiquer à JS qu'il va lire du code asynchrone
    // async renvoie toujours une promise
  
         const result = await client.query("SELECT * FROM projects"); 
         // await : met en pause la suite tant que la data n'a pas été récupérée
         // .query concerne toujours une fonction asynchrone
         
         return result.rows; // renvoie une promise {} de data (pending) jusqu'à ce qu'on ait récupéré les données
    
    } 
};

module.exports = dataMapper;
```

# Controlleur

```js
const client = require('../services/dbClient');
const dataMapper = require('../services/dataMapper');

// On crée une méthode pour chaque action
const controller = {
    try { //try - catch pour la gestion des résultats et des erreurs en cas de promise
    // async renvoie toujours une promise
    // try - catch dans le controller car c'est lui qui gère la construction de notre vue, pas dataMapper
    
     list: async (req, res) => { //async - await
       
            const result = await dataMapper.getAllProjects(); 
            // on veut récupérer les datas de projects (getData) qui sont dans dataMapper
            // tant que c'est pas fait, on ne passe pas à la suite (grace à await), mais seulement dans le scope de la fonction try
            // on ne passe pas à res.render mais on passe à error
            
            res.render("projects", { projects: result });
   // .rows (et tout ce qui touche aux datas pures) passe dans dataMapper
       
       } catch (error) {
            res.status(500).send('Aucune datas')
       
        return data;
        },
    }
};
    
module.exports = controller;
```


