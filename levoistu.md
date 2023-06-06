```sql


BEGIN;

TRUNCATE "user", "project", "tag", "project_has_tag", "user_has_tag", "project_has_user" RESTART IDENTITY;

INSERT INTO user(name, firstname, email, pseudo, password, description, availability) VALUES
('Gandji', 'Elyette', 'numero@bis.eg', 'Numérobis', '$2b$10$Btz1P5F51OMGfvuuL1wh7.kdwyEYXdzCSGpbLg1BAlx91GvwFGlXm', 'Dernière pyramide à gauche', true),
('Mangeot', 'Pierre', 'amon@bofis.eg', 'Amonbofis', '$2b$10$XBG4JD2apNQs1S97bXlL/.7jd95ylW6h4ZFnP1dAE10RaqsaSd8De', 'Première pyramide à droite', false),
('Danglot', 'Clément', 'pano@ramix.ga', 'Panoramix', '$2b$10$g8NKBH9OrxoUt.2jMJ.V3eyH7lN6EbVk7THcG3bAsUCtd.iKuqtnK', 'Grande hutte à la sortie du village', true),
('Caro', 'Lionel', 'ide@fix.ga', 'Idefix', '$2b$10$g8NKBH9558J.V3eyH7lN6EbVk7THcG3bAsUCtd.iwdtnK', 'Le plus grand flair de la Gaule', false);


INSERT INTO project(title, description, availability, user_id) VALUES 
('Biscoc O', 'Lorem ipsum blabla', TRUE, 2),
('Larric O', 'Lorem ipsum blabla', TRUE, 1),
('O secour', 'Lorem ipsum blabla', FALSE, 2),
('O linclusive', 'Lorem ipsum blabla', TRUE, 3),
('Label O', 'Lorem ipsum blabla', FALSE, 1),
('T O b O gant', 'Lorem ipsum blabla', TRUE, 2);

INSERT INTO tag(name) VALUES
('Java'), ('Javascript'), ('HTML'), ('CSS'), ('React'), ('SQL');

INSERT INTO project_has_tag(project_id, tag_id) VALUES
(1, 1),
(1, 3),
(1, 6),
(2, 2),
(2, 4),
(3, 2),
(4, 2),
(5, 1),
(5, 2),
(5, 3),
(5, 5),
(5, 6);

INSERT INTO user_has_tag(user_id, tag_id) VALUES
(1, 1),
(1, 3),
(1, 6),
(2, 2),
(2, 4),
(3, 2),
(4, 4),
(4, 1),
(4, 2),
(4, 3),
(4, 5),
(4, 6);

INSERT INTO project_has_user(project_id, user_id, is_active) VALUES
(1, 1, true),
(1, 3, false),
(1, 6, true),
(2, 2, false),
(2, 4, true),
(3, 2, false),
(4, 4, true);
    
COMMIT;




-------



SELECT * FROM "user", "project", "tag", "project_has_tag", "user_has_tag", "project_has_user" WHERE false;


-- suppression des tables dans l'ordre des dependances
DROP TABLE IF EXISTS "project_has_user", "user_has_tag", "project_has_tag", "tag", "project", "user";






DROP TABLE IF EXISTS "user", "project", "tag", "project_has_tag", "user_has_tag", "project_has_user";

CREATE TABLE "user" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" VARCHAR(64) NOT NULL,
    "firstname" VARCHAR(64) NOT NULL, 
    "email" VARCHAR(64) NOT NULL,
    "pseudo" VARCHAR(64) NOT NULL,
    "description" TEXT NOT NULL,
    "availability" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ,
    CHECK ("email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE "project" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "title" VARCHAR(64) NOT NULL,
    "description" TEXT NOT NULL,
    "availability" BOOLEAN NOT NULL DEFAULT FALSE,
    "user_id" INT NOT NULL REFERENCES "user" ("id"),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "tag" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" VARCHAR(64) NOT NULL,
    "availability" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "project_has_tag" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "project_id" INT NOT NULL REFERENCES "project" ("id"),
    "tag_id" INT NOT NULL REFERENCES "tag" ("id"),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "user_has_tag" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES "user" ("id"),
    "tag_id" INT NOT NULL REFERENCES "tag" ("id"),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "project_has_user" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "project_id" INT NOT NULL REFERENCES "project" ("id"),
    "user_id" INT NOT NULL REFERENCES "user" ("id"),
    "is_active" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ
);

```
