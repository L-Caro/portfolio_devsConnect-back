@baseUrl = http://localhost:3000

GET {{baseUrl}}/api/projects

GET {{baseUrl}}/api/projects/3

GET {{baseUrl}}/api/users

GET {{baseUrl}}/api/users/3

POST {{baseUrl}}/api/users
Content-Type: application/json

{
    "email": "jo@olck.io",
    "password": "secret",
    "name": "Mangeot",
    "firstname": "Pierre",
    "pseudo": "Pierrot",
    "description": "Lorem ipsum blabla",
    "availability": true,
    "tags": [
        {
          "id": 2,
          "name": "Javascript"
        },
        {
          "id": 3,
          "name": "HTML"
        },
        {
          "id": 6,
          "name": "SQL"
        }
      ]
}

POST {{baseUrl}}/api/projects
Content-Type: application/json

{
  "id": 1,
  "title": "Biscoc O",
  "description": "Lorem ipsum blabla",
  "availibility": true,
  "user_id": 2,
  "tags": [
    {
      "id": 2,
      "name": "Javascript"
    },
    {
      "id": 3,
      "name": "HTML"
    },
    {
      "id": 4,
      "name": "CSS"
    }
  ],
  "users": [
    {
      "id": 4,
      "name": "Caro"
    },
    {
      "id": 2,
      "name": "Mangeot"
    },
    {
      "id": 3,
      "name": "Danglot"
    }
  ],
  "created_at": "2023-06-06T19:08:42.845Z",
  "updated_at": "2023-06-07T08:08:42.845Z"
}

PUT {{baseUrl}}/api/users/3
Content-Type: application/json

{
    "name": "Danglot",
    "firstname": "Clément",
    "pseudo": "Panoramix",
    "email": "pano@ramix.ga",
    "description": "Grande hutte à la sortie du village",
    "availability": true,
    "projects": [
      {
        "id": 1,
        "title": "Biscoc O",
        "description": "Lorem ipsum blabla",
        "availability": true
      }
    ],
    "tags": [
      {
        "id": 2,
        "name": "Javascript"
      },
      {
        "id": 3,
        "name": "HTML"
      },
      {
        "id": 6,
        "name": "SQL"
      }
    ]
}
