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

## Fausse route POST du front

```js
async postUsers(req, res) {
    // Récupérer les données envoyées dans le corps de la requête
    const { email, password } = req.body;

    // Vérifier les informations d'identification
    const user = await dataMapper.findUserByEmail(email);

    if (user && user.password === password) {
      // Connexion réussie
      console.log("Connexion réussie");
      res.json({
        success: true,
        message: "Connexion réussie",
        pseudo: user.pseudo,
        logged: true,
      });
    } else {
      console.log("Identifiants invalides");
      // Identifiants invalides
      res.json({
        success: false,
        message: "Identifiants invalides",
        logged: false,
      });
    }
  },
```

