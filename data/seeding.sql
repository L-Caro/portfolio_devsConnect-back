-- SQLBook: Code
BEGIN;

TRUNCATE "user", "project", "tag", "project_has_tag", "user_has_tag", "project_has_user" RESTART IDENTITY;

INSERT INTO "user" (name, firstname, email, pseudo, password, description, availability) VALUES
('Gandji', 'Elyette', 'numero@bis.eg', 'Numérobis', '$2b$10$/tjXc178bCzCqH8512QWeucDeWQN62.oDuaikIDTAQha8nkDa7A7i', 'Dernière pyramide à gauche', true),
('Mangeot', 'Pierre', 'amon@bofis.eg', 'Amonbofis', '$2b$10$/tjXc178bCzCqH8512QWeucDeWQN62.oDuaikIDTAQha8nkDa7A7i', 'Première pyramide à droite', false),
('Danglot', 'Clément', 'pano@ramix.ga', 'Panoramix', '$2b$10$/tjXc178bCzCqH8512QWeucDeWQN62.oDuaikIDTAQha8nkDa7A7i', 'Grande hutte à la sortie du village', true),
('Caro', 'Lionel', 'ide@fix.ga', 'Idefix', '$2b$10$/tjXc178bCzCqH8512QWeucDeWQN62.oDuaikIDTAQha8nkDa7A7i', 'Le plus grand flair de la Gaule', false);


INSERT INTO "project" (title, description, availability, user_id) VALUES 
('Biscoc O', 'Lorem ipsum blabla', TRUE, 2),
('Larric O', 'Lorem ipsum blabla', TRUE, 1),
('O secour', 'Lorem ipsum blabla', FALSE, 2),
('O linclusive', 'Lorem ipsum blabla', TRUE, 3),
('Label O', 'Lorem ipsum blabla', FALSE, 1),
('T O b O gant', 'Lorem ipsum blabla', TRUE, 2);

INSERT INTO "tag" (name) VALUES
('Java'), ('Javascript'), ('HTML'), ('CSS'), ('React'), ('SQL');

INSERT INTO "project_has_tag" (project_id, tag_id) VALUES
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

INSERT INTO "user_has_tag" (user_id, tag_id) VALUES
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

INSERT INTO "project_has_user" (project_id, user_id, is_active) VALUES
(1, 1, true),
(1, 3, false),
(2, 2, false),
(2, 4, true),
(3, 2, false),
(4, 4, true);
    
COMMIT;
