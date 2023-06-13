@baseUrl = http://localhost:3000

GET {{baseUrl}}/api/projects

GET {{baseUrl}}/api/projects/3

GET {{baseUrl}}/api/users

GET {{baseUrl}}/api/users/3

POST {{baseUrl}}/api/users
Content-Type: application/json

{
    "name": "test1",
    "firstname": "firstname1",
    "email": "email1",
    "pseudo": "pseudo1",
    "password": "password1",
    "description": "description1",
    "availability": "false"
}

POST {{baseUrl}}/api/projects
Content-Type: application/json

{
    "title": "title1",
    "description": "description1",
    "availability": "true",
    "user_id": "3"
}

PUT {{baseUrl}}/api/users/3
Content-Type: application/json

{
    "description": "ceci est un test",
    "availability": false
}
