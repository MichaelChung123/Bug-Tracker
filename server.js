require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')
const path = require('path')
const port = process.env.PORT || 8080
const cors = require('cors')

// app.use(express.static(path.join(__dirname, 'build')));

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.use(cors())

app.get('/', (request, response) => {
    response.json({
        info: 'Node.js, Express, and Postgres API'
    });
});

app.get('/admin/tickets/all', db.getTickets);
app.get('/admin/dashboard', db.getDashboardContent);

app.post('/admin/projects/create', db.createProject);
app.get('/admin/projects/details/:id', db.getProjectByID);
app.get('/admin/projects/details/tickets/:id', db.getTicketsByProjectID);
app.get('/admin/projects/details/users/:id', db.getUsersByProjectID);
app.get('/admin/users/all', db.getUsers);
app.get('/projects/active/tickets', db.getActiveTickets);

app.post('/admin/projects/details/select/user/:id', db.assignUserToProject);
app.get('/admin/user/:id', db.getUserByID);
app.put('/admin/projects/details/deselect/user/:id', db.deleteUserFromProject);

app.get('/projects/all', db.getAllProjects);
app.post('/tickets/create', db.createTicket);

app.get('/admin/tickets/details/:id', db.getTicketByID);
app.post('/edit/ticket/:id', db.editTicket);
app.get('/tickets/newest', db.getNewestTicketID);

app.post('/ticket/details/priority/:id', db.updatePriority);
app.post('/ticket/details/type/:id', db.updateType);
app.get('/ticket/details/comments/:id', db.getCommentsByID);
app.post('/ticket/details/comment/add/:id', db.addComment);
app.post('/ticket/details/comment/edit/:comment_id', db.editComment);
app.post('/ticket/details/comments/delete/:id', db.deleteCommentByID);
app.post('/ticket/details/upload/attachment/:id', db.uploadFile);

app.post('/admin/projects/edit/:id', db.editProject);
app.get('/admin/projects/newest', db.getNewestProjectID);

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
})