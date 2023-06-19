const client = require('./database');
const ApiError = require('../errors/apiError.js');

const dataMapper = {

  async setRefreshToken(id, token) {
    const preparedQuery = {
      text: 'UPDATE "user" set "refresh_token" = $2 WHERE "id" = $1 RETURNING *',
      values: [id, token],
    };
    const results = await client.query(preparedQuery);
    return results.rows;
  },

  async findUserByEmail(email) {
    const preparedQuery = {
      text: `SELECT * FROM "user"
             WHERE "email" = $1`,
      values: [email],
    };

    const results = await client.query(preparedQuery);
    return results.rows[0];
  },

  async findProjectOwner(projectId) {
    const preparedQuery = {
      text: `SELECT "project"."user_id" FROM "project"
             WHERE "project"."id" = $1`,
      values: [projectId],
    };

    const results = await client.query(preparedQuery);
    return results.rows[0].user_id;
  },

/// --- PROJECT

  // methode listee en arrow pour tester different coding style avec requetes sql pour tous les projets
  findAllProjects: async () => {
    const results = await client.query(`
    SELECT
      "project"."id",
      "project"."title",
      "project"."description",
      "project"."availability",
      "project"."user_id",
      (
        SELECT json_agg(json_build_object('id', "tag"."id", 'name', "tag"."name"))
        FROM (
          SELECT DISTINCT "tag"."id", "tag"."name"
          FROM "tag"
          INNER JOIN "project_has_tag" ON "tag"."id" = "project_has_tag"."tag_id"
          WHERE "project_has_tag"."project_id" = "project"."id"
        ) AS "tag"
      ) AS "tags",
      (
        SELECT json_agg(json_build_object('id', "user"."id", 'pseudo', "user"."pseudo", 'is_active', "user"."is_active"))
        FROM (
          SELECT DISTINCT "user"."id", "user"."pseudo", "project_has_user"."is_active"
          FROM "user"
          INNER JOIN "project_has_user" ON "user"."id" = "project_has_user"."user_id"
          WHERE "project_has_user"."project_id" = "project"."id"
        )AS "user"
      ) AS "users"
    FROM "project"
    GROUP BY
      "project"."id";
    `);
    return results.rows; 
  },

  //methode pour recuperer un seul projet a partir de l'id recu en parametre
  async findOneProject (id){
    const preparedQuery = {
      text: `SELECT
      "project"."id",
      "project"."title",
      "project"."description",
      "project"."availability",
      "project"."user_id",
      (  
          SELECT "user"."pseudo"
          FROM "user"
          WHERE "user"."id" = "project"."user_id"
      ) AS user_pseudo,
      (
          SELECT json_agg(json_build_object('tag_id', "tag"."id", 'tag_name', "tag"."name"))
          FROM (
              SELECT DISTINCT ON ("tag"."id") "tag"."id", "tag"."name"
              FROM "tag"
              INNER JOIN "project_has_tag" ON "project_has_tag"."tag_id" = "tag"."id"
              WHERE "project_has_tag"."project_id" = "project"."id"
              ORDER BY "tag"."id"
          ) AS "tag"
      ) AS "tags",
      (
          SELECT json_agg(json_build_object('user_id', "user"."id", 'pseudo', "user"."pseudo", 'is_active', "user"."is_active"))
          FROM (
              SELECT DISTINCT ON ("user"."id") "user"."id", "user"."pseudo", "project_has_user"."is_active"
              FROM "user"
              INNER JOIN "project_has_user" ON "project_has_user"."user_id" = "user"."id"
              WHERE "project_has_user"."project_id" = "project"."id"
              ORDER BY "user"."id"
          ) AS "user"
      ) AS "users"
  FROM
      "project"
  WHERE
      "project"."id" = $1;`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('Project not found', { statusCode: 204 });
    }
    return results.rows[0]; 
  },

  async removeOneProject (id){
    const preparedQuery = {
      text: `DELETE FROM "project" WHERE "id" = $1 RETURNING *`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('Project already deleted', { statusCode: 204 });
    }
    return results.rows[0];
  },

  async createOneProject(title, description, availability, user_id, tags) {
    const preparedProjectQuery= {
       text: `INSERT INTO "project" ("title", "description", "availability", "user_id") VALUES ($1, $2, $3, $4) RETURNING *`,
       values: [title, description, availability, user_id]
    }
    const projectResults = await client.query(preparedProjectQuery);
    const project = await projectResults.rows[0];
    
    if (tags){
    const addTagsToProject = tags.map(async (tagId) => {
      const preparedTagQuery = {
          text: `INSERT INTO "project_has_tag" ("project_id", "tag_id") VALUES ($1, $2) RETURNING *`,
          values: [project.id, tagId],
        };
    
    const tagResults = await client.query(preparedTagQuery);
    return tagResults.rows[0];
    });

    await Promise.all(addTagsToProject);
  }

  // il faut ajouter une relation project_has_user

    return project;
  },

  /* Je veux mettre à jour les champs title, description, availability, 
  avec les tags qui lui sont associés, ayant une relation project/tag dans la table project_has_tag
  et les users qui lui sont associés, ayant une relation project/user dans la table project_has_user
  et je veux que ça me renvoie le projet avec les tags et les users mis à jour */
 
  //projectUpdate = {title, description, availability, tags, users}
  async updateOneProject(projectId, projectUpdate) {

    const currentProject = await dataMapper.findOneProject(projectId);  //on recupere le project en cours pour recuperer les tableaux tags et users
    if (!currentProject) {
      throw new ApiError('Project not found', { statusCode: 204 });
    }

    for (const tag of currentProject.tags) { //je parcours le tableau des tags du projet en cours
      const tagToUpdate = projectUpdate.tags.find(upToDateTag => upToDateTag.id === tag.tag_id); //je verifie si le tag existe dans les tags reçus
      if (!tagToUpdate) { //vérifie si tagToUpdate est faux ou non défini 
          await dataMapper.deleteProjectHasTag(projectId, tag.tag_id); //je le supprime
      }
    }
    for(const tag of projectUpdate.tags) { //je parcours le tableau des tags reçus
      const tagToUpdate = currentProject.tags.find(existingTag => existingTag.tag_id === tag.id); //je verifie si le tag existe dans le projet actuel
        if(!tagToUpdate) { // s'il n'existe pas dans le currentProject
          await dataMapper.createProjectHasTag(projectId, tag.id); //je le crée
        } 
    }

    // je veux vérifier si le statut is_active de la table project_has_user est le meme que celui du user reçu
    // si il est different je veux le mettre à jour

    for(const user of projectUpdate.users) { //je parcours le tableau des users du projet a jour
      const currentUser = currentProject.users.find(existingUser => existingUser.user_id === user.id); //je récupère les users du projet actuel et je verifie s'ils existent dans le projet actuel
      //console.log(currentUser);
      if (user.is_active !== currentUser.is_active){ // je verifie si le booleen est different et si c'est le cas j'update
        await dataMapper.updateProjectHasUser(projectId, user.id); //je mets à jour le user
      }
    }  
    //TODO voir en cas d'ajout ou suppression d'user concomitant a l'update
    // actuellement, la length du tableau des users du projet doit être la même que celle du tableau des users modifiés
    
    const preparedQuery = { //je mets à jour le projet
        text: `UPDATE "project" 
        SET title = COALESCE($1, title), 
          description = COALESCE($2, description), 
          availability = COALESCE($3, availability)
        WHERE id=$4 RETURNING *`, 
        values: [projectUpdate.title, projectUpdate.description, projectUpdate.availability, projectId],
      };

    const results = await client.query(preparedQuery); 
    const project = await results.rows[0];

    return project;
  },

/// --- USER

  findAllUsers: async () => {
    const preparedQuery ={
      text: `SELECT
        "user"."id",
        "user"."name",
        "user"."firstname",
        "user"."pseudo",
        "user"."description",
        "user"."availability",
        "user"."created_at",
        "user"."updated_at",
        (
          SELECT json_agg(json_build_object('id', "project"."id", 'title', "project"."title"))
          FROM (
            SELECT DISTINCT "project"."id", "project"."title"
            FROM "project"
            INNER JOIN "project_has_user" ON "project"."id" = "project_has_user"."project_id"
            WHERE "project_has_user"."user_id" = "user"."id"
          )AS "project"
        ) AS "projects",
        (
          SELECT json_agg(json_build_object('id', "tag"."id", 'name', "tag"."name"))
          FROM (
            SELECT DISTINCT "tag"."id", "tag"."name"
            FROM "tag"
            INNER JOIN "user_has_tag" ON "tag"."id" = "user_has_tag"."tag_id"
            WHERE "user_has_tag"."user_id" = "user"."id"
          ) AS "tag"
        )AS "tags"
      FROM "user"`};
    const results = await client.query(preparedQuery);
    return results.rows; 
  },

  async findOneUser (id){
    const preparedQuery = {
      text: `SELECT
      "user"."id",
      "user"."name",
      "user"."firstname",
      "user"."pseudo",
      "user"."email",
      "user"."description",
      "user"."availability",
      "user"."created_at",
      "user"."updated_at",
      (
        SELECT json_agg(json_build_object('id', "project"."id", 'title', "project"."title", 'description', "project"."description", 'availability', "project"."availability"))
        FROM (
          SELECT DISTINCT "project"."id", "project"."title", "project"."description", "project"."availability"
          FROM "project"
          INNER JOIN "project_has_user" ON "project"."id" = "project_has_user"."project_id"
          WHERE "project_has_user"."user_id" = "user"."id"
        )AS "project"
      ) AS "projects",
      (
        SELECT json_agg(json_build_object('id', "tag"."id", 'name', "tag"."name"))
        FROM (
          SELECT DISTINCT "tag"."id", "tag"."name"
          FROM "tag"
          INNER JOIN "user_has_tag" ON "tag"."id" = "user_has_tag"."tag_id"
          WHERE "user_has_tag"."user_id" = "user"."id"
        ) AS "tag"
      )AS "tags"
    FROM "user"
    WHERE "id" = $1`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('User not found', { statusCode: 204 });
    }
    return results.rows[0]; 
  },

  async removeOneUser (id){
    const preparedQuery = {
      text: `DELETE FROM "user" WHERE "id" = $1 RETURNING *`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('User already deleted', { statusCode: 204 });
    }
    return results.rows[0];
  },

  // name, firstname, email, pseudo, hashedPWD, description, availability, tags);
  async createOneUser(name, firstname, email, pseudo, password, description, availability, tags) {
    const preparedUserQuery = {
      text: `INSERT INTO "user" ("name", "firstname", "email", "pseudo", "password", "description", "availability") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      values: [name, firstname, email, pseudo, password, description, availability],
    };
  
    const userResult = await client.query(preparedUserQuery);
    const user = userResult.rows[0];
  
    const addTagsToUser = tags.map(async (tag) => {
      const tagId = tag.id;
      const preparedTagQuery = {
        text: `INSERT INTO "user_has_tag" ("user_id", "tag_id") VALUES ($1, $2) RETURNING *`,
        values: [user.id, tagId],
      };
  
      const tagResult = await client.query(preparedTagQuery);
      return tagResult.rows[0];
    });
  
  // Fonction native : attendre que toutes les opérations asynchrones se terminent
    await Promise.all(addTagsToUser);
  
    return user; // Tableau des résultats des opérations asynchrones
  },

  /* Je veux mettre à jour les champs name, firstname, email, pseudo, password, description, availability,  
  avec les tags qui lui sont associés, ayant une relation user/tag dans la table user_has_tag
  et les users qui lui sont associés, ayant une relation project/user dans la table project_has_user
  et je veux que ça me renvoie le projet avec les tags et les users mis à jour */
 
  async updateOneUser(userId, userUpdate) {

    const currentUser = await dataMapper.findOneUser(userId);  //on recupere le user actuel pour recuperer les tableaux tags et projects
    if (!currentUser) {
      throw new ApiError('User not found', { statusCode: 204 });
    }

    const currentUserTags = currentUser.tags || [];
    for (const tag of currentUserTags) { //je parcours le tableau des tags du user actuel
      const tagToUpdate = userUpdate.tags.find(upToDateTag => upToDateTag.id === tag.tag_id); //je verifie si le tag existe dans les tags reçus
      if (!tagToUpdate) { //vérifie si tagToUpdate est faux ou non défini 
        console.log('deleting tag');
          await dataMapper.deleteUserHasTag(userId, tag.id); //je le supprime
      }
    }
    for(const tag of userUpdate.tags) { //je parcours le tableau des tags reçus
      const tagToUpdate = currentUserTags.find(existingTag => existingTag.tag_id === tag.id); //je verifie si le tag existe dans le user actuel
        if(!tagToUpdate) { // s'il n'existe pas dans le currentUser
          console.log('creating tag');
          await dataMapper.createUserHasTag(userId, tag.id); //je le crée
        } 
    }

    // je veux vérifier si le statut is_active de la table project_has_user est le meme que celui du user reçu
    // si il est different je veux le mettre à jour

    for(const project of userUpdate.projects) { //je parcours le tableau des projects du user a jour
      const currentProject = currentUser.projects.find(existingProject => existingProject.id === project.id); //je récupère les users du projet actuel et je verifie s'ils existent dans le projet actuel
      if (project.is_active !== currentUser.projects.is_active){ // je verifie si le booleen est different et si c'est le cas j'update
        await dataMapper.updateProjectHasUser(userId, project.id); //je mets à jour le user
      }
    }  
    //TODO voir en cas d'ajout ou suppression d'user concomitant a l'update
    // actuellement, la length du tableau des users du projet doit être la même que celle du tableau des users modifiés
    
    const preparedQuery = { //je mets à jour le projet
        text: `UPDATE "user"
        SET "name" = COALESCE($1, "name"), 
           "firstname" = COALESCE($2, "firstname"), 
           "email" = COALESCE($3, "email"), 
           "pseudo" = COALESCE($4, "pseudo"), 
           "password" = COALESCE($5, "password"), 
           "description" = COALESCE($6, "description"), 
           "availability" = COALESCE($7, "availability")
        WHERE "id"=$8 
        RETURNING "name", "firstname", "email", "pseudo", "description", "availability"`, 
        values: [userUpdate.name, userUpdate.firstname, userUpdate.email, userUpdate.pseudo, userUpdate.password, userUpdate.description, userUpdate.availability, userId],
      };

    const results = await client.query(preparedQuery); 
    const user = await results.rows[0];

    return user;
  },

  async findAllTags(){
      const allTags = await client.query(`SELECT * FROM "tag"`);
      if (!allTags.rows) {
        throw new ApiError('Tags not found', { statusCode: 204 });
      }
      return results.rows; 
  },

  //methode pour recuperer un tag en fonction de l'id recue en parametre
  async findOneTag (id){
    const preparedQuery = {
      text: `SELECT * FROM "tag" WHERE "id" = $1`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('Tag not found', { statusCode: 204 });
    }
    return results.rows[0]; 
  }, 

// --------- PROJECT_HAS_USER

/* Je veux ajouter un user à un project */

  async createProjectHasUser (projectID, userID) {
    const preparedQuery = {
      text: `INSERT INTO "project_has_user" ("project_id", "user_id") VALUES ($1, $2) RETURNING *`,
      values: [projectID, userID],
    };
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('Relation not found', { statusCode: 204 });
    }
    return results.rows[0]; 
  },

  /* Je veux modifier le statut d'un user dans un projet en modifiant le boolean is active */

  async updateProjectHasUser (projectID, userID) {
    const result = await client.query(`UPDATE "project_has_user" 
      SET "is_active" = NOT"is_active"
      WHERE "project_has_user"."project_id" = ${projectID} 
      AND "project_has_user"."user_id" = ${userID} 
      RETURNING *`
    );
    if (!result.rows[0]) {
      throw new ApiError('Relation not found', { statusCode: 204 });
    }
    return result.rows[0]; 
  },

  /* Je veux retirer un user d'un project */

  async deleteProjectHasUser (projectID, userID) {
    const preparedQuery = {
      text: `DELETE FROM "project_has_user" ("project_id", "user_id") VALUES ($1, $2) RETURNING *`,
      values: [projectID, userID],
    };
    const result = await client.query(preparedQuery);
    if (!result.rows[0]) {
      throw new ApiError('Relation not found', { statusCode: 204 });
    }
    return result.rows[0];
  },
  
// --------- PROJECT_HAS_TAG

  /* Je veux ajouter un tag à un project */

  async createProjectHasTag (projectId, tagId) {
    const preparedQuery = {
      text: `INSERT INTO "project_has_tag" ("project_id", "tag_id") VALUES ($1, $2) RETURNING *`,
      values: [projectId, tagId],
    };
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('Relation not found', { statusCode: 204 });
    }
    return results.rows[0]; 
  },

  /* Je veux retirer un tag d'un project */
  
  async deleteProjectHasTag (projectId, tagId) {
    const preparedQuery = {
      text: `DELETE FROM "project_has_tag" WHERE "project_id" = $1 AND "tag_id" = $2 RETURNING *`,
      values: [projectId, tagId],
    };
    const result = await client.query(preparedQuery);
    if (!result.rows[0]) {
      throw new ApiError('Relation not found', { statusCode: 204 });
    }
    return result.rows[0];
  },

  // --------- USER_HAS_TAG

  /* Je veux ajouter un tag à un user */

  async createUserHasTag (userId, tagId) {
    const preparedQuery = {
      text: `INSERT INTO "user_has_tag" ("user_id", "tag_id") VALUES ($1, $2) RETURNING *`,
      values: [userId, tagId],
    };
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('Relation not found', { statusCode: 204 });
    }
    return results.rows[0]; 
  },

  /* Je veux retirer un tag d'un user */
  
  async deleteUserHasTag (userId, tagId) {
    const preparedQuery = {
      text: `DELETE FROM "user_has_tag" WHERE "user_id" = $1 AND "tag_id" = $2 RETURNING *`,
      values: [userId, tagId],
    };
    const result = await client.query(preparedQuery);
    if (!result.rows[0]) {
      throw new ApiError('Relation not found', { statusCode: 204 });
    }
    return result.rows[0];
  }

};

module.exports = dataMapper;
