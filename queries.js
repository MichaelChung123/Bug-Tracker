const {
    Client
} = require('pg');
const multer = require('multer');
const cors = require('cors');

// const client = new client({
//     user: 'me',
//     host: 'localhost',
//     database: 'bugtrackerdb',
//     password: 'password',
//     port: 5432,
// })

const client = process.env.PGDATABASE ? new Client() :
    new Client({
        connectionString: process.env.HEROKU_POSTGRESQL_OLIVE_URL,
        ssl: true
    })

client.connect();

const getTickets = (req, res) => {
    client.query('SELECT * FROM tickets ORDER BY lastupdated ASC', (error, results) => {
        if (error) {
            throw error
        }
        res.json(results.rows)
    })
}

const getDashboardContent = (req, res) => {
    client.query(`
    (SELECT COUNT(*) AS count_ptu FROM projects)
    UNION ALL
    (SELECT COUNT(*) AS count_tickets FROM tickets)
    UNION ALL
    (SELECT COUNT(*) AS count_users FROM users)`,
        (error, results) => {
            if (error) {
                throw error
            }
            res.json(results.rows);
        })
}

const createProject = (request, response) => {
    const {
        title,
        description
    } = request.body;

    client.query(`INSERT INTO projects (title, description) VALUES ('${title}', '${description}')`,
        (error, results) => {
            if (error) {
                throw error
            }

            response.status(201).send(`Project Added: ${results}`)
        });
}

const getProjectByID = (request, response) => {
    const id = parseInt(request.params.id);

    client.query(`SELECT * FROM projects WHERE project_id=${id}`, (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}


const getUsersByProjectID = (request, response) => {
    const project_id = parseInt(request.params.id);

    client.query(
        `
            SELECT firstname, lastname, role, users.user_id
            FROM user_project
            JOIN users ON users.user_id = user_project.user_id
            JOIN projects ON projects.project_id = user_project.project_id
            WHERE user_project.project_id=${project_id};
        `, (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        })
}

const getTicketsByProjectID = (request, response) => {
    const id = parseInt(request.params.id);

    client.query(`SELECT * from tickets WHERE project_id=${id}`, (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getUsers = (request, response) => {
    client.query('SELECT * FROM users ORDER BY role ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.json(results.rows)
    })
}

const assignUserToProject = (request, response) => {
    const {
        user_id,
        project_id
    } = request.body;

    client.query(`
        INSERT INTO user_project (user_id, project_id)
        SELECT  users.user_id AS user_id,
                projects.project_id AS project_id
        FROM users CROSS JOIN projects 
        WHERE user_id=${user_id} AND projects.project_id=${project_id};`,
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(results.rows);
        })
}

const getUserByID = (request, response) => {
    const {
        user_id
    } = request.body;

    client.query(`SELECT * FROM users WHERE user_id=${user_id}`, (error, results) => {
        if (error) {
            throw error
        }
        response.json(results.rows)
    })
}

const deleteUserFromProject = (request, response) => {
    const {
        user_id,
        project_id
    } = request.body;

    client.query(
        `
            DELETE FROM user_project 
            WHERE user_id=${user_id} AND project_id=${project_id};
        `, (error, results) => {
            if (error) {
                throw error
            }

            response.status(201).send(results.rows);
        })
}

const getAllProjects = (request, response) => {
    client.query(`SELECT * FROM projects`, (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(results.rows);
    })
}

const getActiveTickets = (request, response) => {
    client.query(`
    SELECT projects.*, 
        (SELECT COUNT(*) 
        FROM tickets 
        WHERE tickets.project_id = projects.project_id) AS activeTickets 
        FROM projects
    `, (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(results.rows);
    })
}

const createTicket = (request, response) => {
    const {
        selectedProject,
        selectedPriority,
        selectedType,
        ticketTitle,
        ticketDescription,
        creator,
        lastUpdated,
        createdDate,
        createdTime,
        lastUpdatedTime,
        project_id
    } = request.body;

    client.query(`
    INSERT INTO tickets (ticket_id, title, creator, priority, type, status, lastupdated, createddate, project_id, description, createdtime, lastupdatedtime) 
    VALUES ( DEFAULT, '${ticketTitle}', '${creator}', '${selectedPriority}', '${selectedType}', 'Open', '${lastUpdated}', '${createdDate}', ${project_id}, '${ticketDescription}', '${createdTime}', '${lastUpdatedTime}')`,
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`Ticket Added: ${results}`)
        });
}

const getTicketByID = (request, response) => {
    const id = parseInt(request.params.id);

    client.query(`SELECT * FROM tickets WHERE ticket_id=${id}`, (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getNewestTicketID = (request, response) => {
    client.query(`
    SELECT ticket_id
    FROM tickets 
    WHERE ticket_id = (SELECT MAX(ticket_id) FROM tickets)`,
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        })
}


const editTicket = (request, response) => {
    const {
        editTitleVal,
        editDescVal,
        lastUpdated,
        lastUpdatedTime
    } = request.body;

    const id = parseInt(request.params.id);

    client.query(`
        UPDATE tickets
        SET title='${editTitleVal}',
        description='${editDescVal}',
        lastupdated='${lastUpdated}',
        lastupdatedtime='${lastUpdatedTime}'
        WHERE ticket_id=${id}`,
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).json(`Ticket edited with ID: ${id}`)
        });
}


const updatePriority = (req, res) => {
    const {
        selectedPriority,
        lastUpdated,
        lastUpdatedTime
    } = req.body;

    const id = parseInt(req.params.id);

    client.query(`
        UPDATE tickets
        SET priority='${selectedPriority}',
        lastupdated='${lastUpdated}',
        lastupdatedtime='${lastUpdatedTime}'
        WHERE ticket_id=${id}
    `,
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(201).json(`Ticket Priority Updated to: ${selectedPriority}`)
        })
}

const updateType = (req, res) => {
    const {
        selectedType,
        lastUpdated,
        lastUpdatedTime
    } = req.body;

    const id = parseInt(req.params.id);

    client.query(`
        UPDATE tickets
        SET type='${selectedType}',
        lastupdated='${lastUpdated}',
        lastupdatedtime='${lastUpdatedTime}'
        WHERE ticket_id=${id}
    `,
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(201).json(`Ticket Type Updated to: ${selectedType}`)
        })
}

const getCommentsByID = (request, response) => {
    const id = parseInt(request.params.id);

    client.query(`SELECT * FROM comments WHERE ticket_id=${id} ORDER BY createdtime ASC`,
        (error, results) => {
            if (error) {
                throw error
            }
            response.json(results.rows)
        })
}

const addComment = (request, response) => {
    const id = parseInt(request.params.id);

    const {
        creator,
        text,
        newDate,
        newTime
    } = request.body;

    client.query(`
        INSERT INTO comments (creator, createddate, createdtime, ticket_id, text, user_id, lastupdatedtime, lastupdated)
        VALUES ('${creator}', '${newDate}', '${newTime}', '${id}', '${text}', 1, '${newTime}', '${newDate}')`,
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).json(`Comment Added to Ticket ID: ${id}`)
        })
}

const editComment = (request, response) => {
    const comment_id = request.params.comment_id;
    const editedComment = request.body.text;

    client.query(`
        UPDATE comments
        SET text='${editedComment}'
        WHERE comment_id=${comment_id}
    `,
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).json(`Comment edited with ID: ${comment_id}`)
        })
}

const deleteCommentByID = (request, response) => {
    const id = parseInt(request.params.id);

    client.query(`
        DELETE FROM comments
        WHERE comment_id=${id}
    `,
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).json(`Comment deleted with ID: ${id}`)
        })
}

const uploadFile = (req, res) => {
    let id = req.params.id;

    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public')
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname)
        }
    })

    let upload = multer({
        storage: storage
    }).array('file')

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }

        return res.status(200).send(req.file)
    })
}

const editProject = (req, res) => {
    let id = parseInt(req.params.id);
    const {
        title,
        description
    } = req.body;

    client.query(`
        UPDATE projects
        SET title='${title}',
        description='${description}'
        WHERE project_id=${id}
    `,
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(201).json(`Project edited`)
        })
}

const getNewestProjectID = (request, response) => {
    client.query(`
        SELECT project_id 
        FROM projects 
        WHERE project_id = (SELECT MAX(project_id) FROM projects)`,
        (error, results) => {
            if (error) {
                throw error
            }
            response.json(results.rows)
        })
}



module.exports = {
    getTickets,
    getDashboardContent,
    createProject,
    getProjectByID,
    getUsersByProjectID,
    getTicketsByProjectID,
    getNewestTicketID,
    getUsers,
    assignUserToProject,
    getUserByID,
    deleteUserFromProject,
    getAllProjects,
    getActiveTickets,
    createTicket,
    getTicketByID,
    editTicket,
    updatePriority,
    updateType,
    getCommentsByID,
    addComment,
    editComment,
    deleteCommentByID,
    uploadFile,
    editProject,
    getNewestProjectID
}
