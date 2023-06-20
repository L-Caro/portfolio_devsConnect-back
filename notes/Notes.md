# Opérateurs ?., ?? et ||

## Opérateur `?.` (opérateur d'accès conditionnel)

L'opérateur `?.` permet d'accéder aux propriétés d'un objet de manière sécurisée en évitant une erreur si l'objet est null ou undefined. Cet opérateur vérifie si l'objet avant le `?.` existe et est défini. Si c'est le cas, l'expression se poursuit et renvoie la valeur de la propriété. Sinon, l'expression renvoie undefined sans générer d'erreur.

## Opérateur `??` (opérateur de coalescence nulle)

L'opérateur `??` permet de fournir une valeur de substitution ou une valeur par défaut lorsque l'opérande de gauche est null ou undefined. Si l'opérande de gauche est null ou undefined, l'opérateur `??` renvoie l'opérande de droite. Sinon, il renvoie l'opérande de gauche.

## Opérateur `||` (opérateur logique OR)

Il est utilisé pour évaluer des expressions booléennes et renvoie la première valeur qui peut être évaluée à `true`.

- Si l'opérande de gauche peut être converti en `true`, l'opérateur renvoie cet opérande de gauche.
- Si l'opérande de gauche peut être converti en `false`, l'opérateur renvoie l'opérande de droite.
- Si l'opérande de gauche est une valeur différente de `false`, `null`, `undefined`, `0`, `NaN` ou une chaîne de caractères vide (`''`), il est considéré comme une valeur véridique (`truthy`) et l'opérateur renvoie cette valeur de gauche.
- Si l'opérande de gauche est `false`, `null`, `undefined`, `0`, `NaN` ou une chaîne de caractères vide (`''`), il est considéré comme une valeur fausse (`falsy`) et l'opérateur renvoie l'opérande de droite.

## Exemple de la méthode updateOneUser

`currentProject.tags?.filter(tag => !projectUpdate.tags?.includes(tag.tag_id))`

`currentProject.tags?.` : Si `currentProject.tags` est null ou undefined, cela renvoie immédiatement undefined, et la suite de l'expression n'est pas évaluée.

`filter(tag => !projectUpdate.tags?.includes(tag.tag_id))` : Si `currentProject.tags` existe, cette partie de l'expression filtre les tags qui ne sont pas inclus dans `projectUpdate.tags`. L'opérateur `?.` est utilisé avec `projectUpdate.tags` pour vérifier si `projectUpdate.tags` est null ou undefined. Si c'est le cas, l'expression renvoie également undefined, et la fonction de filtre n'est pas appelée.

`|| []` : Si l'expression précédente (`currentProject.tags?.filter(...)`) renvoie undefined, cela signifie que `currentProject.tags` était null ou undefined, ce qui implique qu'il n'y a pas de tags à supprimer. Dans ce cas, l'opérateur `||` est utilisé pour fournir un tableau vide `[]` comme valeur par défaut. Cela garantit que `tagsToDelete` est toujours un tableau et peut être utilisé par la suite dans la boucle `for`.

# Destructuration d'un tableau

```js
const projectResults = await client.query(preparedProjectQuery);
const project = await projectResults.rows[0];
  ```

devient 

```js
const [project] = (await client.query(preparedProjectQuery)).rows;
```

La déstructuration `[project]` permet d'extraire le premier élément de `rows` directement dans la variable `project`.

# ON DELETE CASCADE

FOREIGN KEY (ClientId)
        REFERENCES Clients (ClientId)
        ON DELETE CASCADE

A foreign key with cascade delete means that if a record in the parent table is deleted, then the corresponding records in the child table will automatically be deleted. This is called a cascade delete in SQL Server.

DELETE CASCADE: When we create a foreign key using this option, it deletes the referencing rows in the child table when the referenced row is deleted in the parent table which has a primary key.

# Architecture

`index.js` à la racine : fichier d'init de l'API
dossier app :
    - `index.js` à la racine : config de base du dossier app --> dispatche dans les différents éléments
    - routers : `index.js` regroupe la config de tous les routers pour dispatcher à chaque router
    - controllers : `projectController` --> récupérer tous les projets
    - dataMappers : `database.js` --> client (pool)
