const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 8080
const db = require('./queries')
const path = require('path');

app.use(express.static(path.join(__dirname, 'build')));

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.get('/ping', function (req, res) {
    res.json([
        {id: 1, payload: "PONG"}
    ]);
});

app.get('/', (request, response) => {
    response.json({
        info: 'Node.js, Express, and Postgres API'
    });
});

app.get('/users', db.getUsers)
app.get('/users/:id', db.getUserById)
app.post('/users', db.createUser)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
})