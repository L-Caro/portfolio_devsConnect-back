const { fakerFR } = require('@faker-js/faker');
const db = require('../app/dataMappers/database');

const NB_USERS = 200;
const NB_PROJECTS = 40;
const faker = fakerFR;
const tags = ['Java', 'Javascript', 'HTML', 'CSS', 'React', 'SQL', 'Python', 'C', 'C#', 'PHP', 'Go', 'Jest', 'Joi', 'React', 'GraphQL', 'Faker', 'TypeScript', 'Bootstrap', 'Angular', 'Rust'];

async function restartDB() {
  await db.query('TRUNCATE "user", "project", "tag", "project_has_tag", "user_has_tag", "project_has_user" RESTART IDENTITY CASCADE;')
};

function generateUser(nbUsers) {
  const users = [];
  for (let i = 0; i < nbUsers; i++) {
    const user = {
      name: faker.person.lastName(),
      firstname: faker.person.firstName(),
      pseudo: faker.internet.userName(),
      email: faker.internet.email(),
      password: '$2b$10$3i3kHi8MZDpmLW1icHax5u69KOvYOgIWkFkz1dKgKOlE64sRQCRZ.',
      description: faker.person.bio(),
      availability: faker.datatype.boolean(),
    };
    users.push(user);
  }
  return users;
}

async function insertUsers(users) {
  const usersValues = users.map((user) => `(
    '${user.name}',
    '${user.firstname}',
    '${user.email}',
    '${user.pseudo}',
    '${user.password}',
    '${user.description}',
    '${user.availability}'    
  )`);

  const queryStr = `
    INSERT INTO "user"
    (
      "name",
      "firstname",
      "email",
      "pseudo",
      "password",
      "description",
      "availability"
    )
    VALUES
    ${usersValues}
    RETURNING id
  `;
  const result = await db.query(queryStr);
  return result.rows;
}

function generateProject(nbProjects) { 
  const projects = [];
  for (let i = 0; i < nbProjects; i++) {
    const project = {
      title: faker.company.name(),
      description: faker.company.buzzPhrase(),
      availability: faker.datatype.boolean(),
      user_id: faker.number.int({min: 1, max: NB_USERS})
    };
    projects.push(project);
  }
  return projects;
}

async function insertProjects(projects) {
  const projectsValues = projects.map((project) => `(
    '${project.title}',
    '${project.description}',
    '${project.availability}',
    '${project.user_id}'    
  )`);

  const queryStr = `
    INSERT INTO "project"
    (
      "title",
      "description",
      "availibility",
      "user_id"
    )
    VALUES
    ${projectsValues}
    RETURNING id
  `;
  const result = await db.query(queryStr);
  return result.rows;
}

async function insertTags(tags) {
  const queryStr = `
    INSERT INTO "tags"
      (
        "name"
      )
      VALUES
      ${tags}
      RETURNING id
    `;
  const result = await db.query(queryStr);
  return result.rows;
}

//restartDB();
//const users = generateUser(NB_USERS);
//insertUsers(users);
//const projects = generateProject(NB_PROJECTS);
//insertProjects(projects);
//insertTags();


//console.log(projects);
