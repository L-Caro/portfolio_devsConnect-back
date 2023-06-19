// Importez les modules nécessaires pour les tests
const client = require('./database');
const dataMapper = require('./dataMapper');

// Créez un mock pour la fonction client.query
jest.mock('./database', () => ({
  query: jest.fn(),
}));

describe('createOneUser', () => {
  it('should create a new user and add tags', async () => {
    // Mock des résultats attendus de la requête de l'utilisateur
    const userQueryResult = {
      rows: [{ id: 1, name: 'John', firstname: 'Doe' }],
    };
    // Configurez le mock pour la requête de l'utilisateur
    client.query.mockResolvedValueOnce(userQueryResult);

    // Mock des résultats attendus de la requête des tags
    const tagQueryResult = {
      rows: [{ id: 1, name: 'Tag 1' }, { id: 2, name: 'Tag 2' }],
    };
    // Configurez le mock pour la requête des tags
    client.query.mockResolvedValueOnce(tagQueryResult);

    // Données d'entrée pour la fonction createOneUser
    const name = 'John';
    const firstname = 'Doe';
    const email = 'john.doe@example.com';
    const pseudo = 'johndoe';
    const password = 'password123';
    const description = 'Lorem ipsum';
    const availability = true;
    const tags = [1, 2];

    // Appelez la fonction createOneUser
    const result = await dataMapper.createOneUser(
      name,
      firstname,
      email,
      pseudo,
      password,
      description,
      availability,
      tags
    );

    // Vérifiez si la fonction client.query a été appelée avec les bons arguments pour la requête utilisateur
    expect(client.query).toHaveBeenCalledWith({
      text: `INSERT INTO "user" (name, firstname, email, pseudo, password, description, availability) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      values: [name, firstname, email, pseudo, password, description, availability],
    });

    // Vérifiez si la fonction client.query a été appelée avec les bons arguments pour chaque requête de tag
    expect(client.query).toHaveBeenNthCalledWith(2, {
      text: `INSERT INTO "user_has_tag" ("user_id", "tag_id") VALUES ($1, $2) RETURNING *`,
      values: [1, 1],
    });
    expect(client.query).toHaveBeenNthCalledWith(3, {
      text: `INSERT INTO "user_has_tag" ("user_id", "tag_id") VALUES ($1, $2) RETURNING *`,
      values: [1, 2],
    });

    // Vérifiez si le résultat de la fonction est correct
    expect(result).toEqual({ id: 1, name: 'John', firstname: 'Doe' });
  });
});
