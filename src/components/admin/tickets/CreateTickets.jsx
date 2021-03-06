import React, { Component, useState, useEffect, useRef } from 'react';
import { Row, Col, Container, Accordion, Card, Button, Form, Overlay } from 'react-bootstrap';
import '../../../styles/CreateTicketStyle.css';
import AssignTicketToProjectModal from '../../modal/AssignTicketToProjectModal';
import moment from 'moment';

/* 
    how to connect to database:
    1. psql -d bugtrackerdb -U me
*/

class CreateTickets extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedProject: {},
            selectedPriority: {},
            selectedType: {},
            ticketTitle: '',
            ticketDescription: '',
            creator: 'Michael Chung',
            newPriorityBox: <> </>,
            newTypeBox: <> </>,
            projectSelected: false,
            prioritySelected: false,
            typeSelected: false,
            titleEntered: false,
            descEntered: false,
            showAlert: false,
            project_id: 0,
            sideActions: [
                {
                    title: 'Project',
                    description: 'Select a project',
                    color: '#17a2b8',
                    backgroundColor: '#ffffff',
                    textColor: 'black',
                    iconClass: 'fas fa-exclamation',
                    subIconClass: 'fas fa-plus-circle float-right'
                },
                {
                    title: 'Priority',
                    description: 'Select a priority',
                    color: '#17a2b8',
                    backgroundColor: '#ffffff',
                    textColor: 'black',
                    iconClass: 'fas fa-exclamation',
                    subIconClass: 'fas fa-chevron-down float-right',
                    selectOptions: [
                        {
                            title: 'Low',
                            color: '#ffc107',
                            iconClass: 'fas fa-angle-up'
                        },
                        {
                            title: 'Medium',
                            color: '#fd7e14',
                            iconClass: 'fas fa-angle-double-up'
                        },
                        {
                            title: 'High',
                            color: '#dc3545',
                            iconClass: 'fas fa-exclamation-triangle'
                        },
                    ]
                },
                {
                    title: 'Type',
                    description: 'Select a type',
                    color: '#17a2b8',
                    backgroundColor: '#ffffff',
                    textColor: 'black',
                    iconClass: 'fas fa-exclamation',
                    subIconClass: 'fas fa-chevron-down float-right',
                    selectOptions: [
                        {
                            title: 'Feature',
                            color: '#28a745',
                            iconClass: 'fas fa-hand-paper'
                        },
                        {
                            title: 'UI',
                            color: '#ffc107',
                            iconClass: 'fas fa-mouse-pointer'
                        },
                        {
                            title: 'Server',
                            color: '#fd7e14',
                            iconClass: 'fas fa-server'
                        },
                        {
                            title: 'Bug',
                            color: '#dc3545',
                            iconClass: 'fas fa-bug'
                        }
                    ]
                }
            ],
            formActions: [
                {
                    title: 'Cancel'
                },
                {
                    title: 'Submit'
                }
            ]
        }
    }

    // Saves the selected project into state, and awaits submit to insert this into the db 
    setSelectedProject = (project) => {
        this.setState({
            selectedProject: project,
            project_id: project.project_id,
            projectSelected: true
        })
    }

    setSelectedPriority = (priority, selectedSubAction) => {
        this.setState({
            selectedPriority: priority,
            prioritySelected: true,
            newPriorityBox: selectedSubAction
        })
    }

    setSelectedType = (type, selectedSubAction) => {
        this.setState({
            selectedType: type,
            typeSelected: true,
            newTypeBox: selectedSubAction
        })
    }

    setEnteredTitle = (isValid) => {
        if (isValid) {
            this.setState({
                titleEntered: true
            })
        } else {
            this.setState({
                titleEntered: false
            })
        }
    }

    setEnteredDesc = (isValid) => {
        if (isValid) {
            this.setState({
                descEntered: true
            })
        } else {
            this.setState({
                descEntered: false
            })
        }
    }

    checkFields = () => {
        const {
            projectSelected,
            prioritySelected,
            typeSelected,
            titleEntered,
            descEntered
        } = this.state;

        if (!projectSelected || !prioritySelected || !typeSelected || !titleEntered || !descEntered) {
            this.setState({
                showAlert: true
            })
            return false;
        } else {
            this.setState({
                showAlert: false
            })
            return true;
        }
    }

    handleTitleChange = (event) => {
        this.setState({
            ticketTitle: event.target.value
        })

        if (!event.target.value) {
            this.setEnteredTitle(false);
        } else {
            this.setEnteredTitle(true);
        }
    }

    handleDescriptionChange = (event) => {
        this.setState({
            ticketDescription: event.target.value
        })

        if (!event.target.value) {
            this.setEnteredDesc(false);
        } else {
            this.setEnteredDesc(true);
        }
    }

    // Handles the redirect onClick
    handleRedirect = (path) => {
        this.props.history.push(path);
    }

    handleSubmit = (event) => {
        event.preventDefault();

        let unformattedCreatedDate = moment().format();
        let unformattedLastUpdated = moment().format();

        let createdDate = unformattedCreatedDate.substr(0, 10);
        let lastUpdated = unformattedLastUpdated.substr(0, 10);
        let createdTime = unformattedCreatedDate.substr(11, 8);
        let lastUpdatedTime = unformattedLastUpdated.substr(11, 8);

        let { selectedProject,
            selectedPriority,
            selectedType,
            ticketTitle,
            ticketDescription,
            creator,
            project_id
        } = this.state;

        let data = {
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
        }

        if (this.checkFields()) {
            // Insert the ticket data to the db
            fetch(process.env.REACT_APP_BASEURL + `/tickets/create`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            })
                .then((data) => {
                    console.log('Success: ', data);
                })
                .then(() => {
                    // Get new ticket's ID and then redirect to it after submitting
                    fetch(process.env.REACT_APP_BASEURL + '/tickets/newest')
                        .then((response) => {
                            return response.json();
                        })
                        .then((data) => {
                            this.handleRedirect(`/admin/tickets/details/${data[0].ticket_id}`);
                        })
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } else {
            this.checkFields();
        }
    }

    render() {

        return (
            <Container className='all-tickets-container'>
                <Row className='tickets-title'>
                    <Col xs={6} sm={6} md={6} lg={6}>
                        <h1>Create Ticket</h1>
                    </Col>
                </Row>
                {/* SIDE ACTIONS */}
                <Row>
                    <Col xs={3} sm={3} md={3} lg={3} className='cursor-pointer'>
                        {
                            this.state.sideActions.map((action, key) => {
                                return (
                                    <SideActions
                                        sideActions={action}
                                        projectSelected={this.state.projectSelected}
                                        prioritySelected={this.state.prioritySelected}
                                        typeSelected={this.state.typeSelected}
                                        selectedProject={this.state.selectedProject}
                                        setSelectedProject={this.setSelectedProject}
                                        setSelectedPriority={this.setSelectedPriority}
                                        setSelectedType={this.setSelectedType}
                                        newPriorityBox={this.state.newPriorityBox}
                                        newTypeBox={this.state.newTypeBox}
                                        showAlert={this.state.showAlert}
                                        key={key}
                                    />
                                )
                            })
                        }

                    </Col>
                    {/* TICKET DETAILS */}
                    <Col xs={9} sm={9} md={9} lg={9}>
                        <TicketDetails
                            showAlert={this.state.showAlert}
                            checkFields={this.checkFields}
                            handleTitleChange={this.handleTitleChange}
                            handleDescriptionChange={this.handleDescriptionChange}
                            ticketTitle={this.state.ticketTitle}
                            ticketDescription={this.state.ticketDescription}
                            titleEntered={this.state.titleEntered}
                            descEntered={this.state.descEntered}

                            handleSubmit={this.handleSubmit}
                            handleRedirect={this.handleRedirect}
                            setEnteredTitle={this.setEnteredTitle}
                            setEnteredDesc={this.setEnteredDesc}
                        />
                    </Col>
                </Row>
            </Container>
        );
    }
}

const AlertOverlay = ({ showAlert, target, title }) => {
    return (
        <Overlay target={target.current} show={showAlert} placement="top-end">
            {({
                placement,
                scheduleUpdate,
                arrowProps,
                outOfBoundaries,
                show: _show,
                ...props
            }) => (
                    <div
                        {...props}
                        style={{
                            backgroundColor: 'rgba(255, 100, 100, 0.85)',
                            padding: '2px 10px',
                            color: 'white',
                            borderRadius: 3,
                            ...props.style,
                        }}
                    >
                        Please select a {title}
                    </div>
                )}
        </Overlay>
    )
}

const SideActions = ({ sideActions, setSelectedProject, setSelectedPriority, setSelectedType, projectSelected, selectedProject, prioritySelected, typeSelected, newPriorityBox, newTypeBox, showAlert }) => {
    const [projects, setProjects] = useState([]);
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const target = useRef(null);

    const {
        title,
        description,
        color,
        iconClass,
        selectOptions } = sideActions;

    useEffect(() => {
        // Fetch all projects
        fetch(process.env.REACT_APP_BASEURL + '/projects/all')
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                setProjects(data);
            })
    }, []);

    if (!sideActions.selectOptions) {
        return (
            <>
                {
                    !projectSelected ?
                        <>
                            <Row ref={target} onClick={handleShow} className='ptu-box side-action-box'>
                                <Col xs={3} sm={3} md={3} lg={3} style={{ backgroundColor: color }} className='ptu-icon'>
                                    <i className={iconClass} />
                                </Col>
                                <Col xs={9} sm={9} md={9} lg={9} className='ptu-info'>
                                    {title}
                                    <br />
                                    {description}
                                </Col>
                            </Row>
                            <AlertOverlay
                                target={target}
                                showAlert={showAlert}
                                title={sideActions.title}
                            />
                        </>
                        :
                        <Row style={{ backgroundColor: '#007bff', color: '#ffffff' }} onClick={handleShow} className='ptu-box side-action-box'>
                            <Col xs={3} sm={3} md={3} lg={3} style={{ backgroundColor: color }} className='ptu-icon'>
                                <i className='fas fa-check' />
                            </Col>
                            <Col xs={9} sm={9} md={9} lg={9} className='ptu-info'>
                                {title}
                                <br />
                                {selectedProject.title}
                            </Col>
                        </Row>
                }
                <AssignTicketToProjectModal
                    projects={projects}
                    setSelectedProject={setSelectedProject}
                    sideActions={sideActions}
                    projectSelected={projectSelected}
                    selectedProject={selectedProject}
                    target={target}
                    show={show}
                    handleClose={handleClose}
                />
            </>
        )
    } else if (sideActions.title === 'Priority') {
        return (
            <>
                <Accordion>
                    {
                        prioritySelected ?
                            newPriorityBox
                            :
                            <>
                                <Accordion.Toggle ref={target} as={Row} eventKey="0" className='ptu-box side-action-box'>
                                    <Col xs={3} sm={3} md={3} lg={3} style={{ backgroundColor: color }} className='ptu-icon'>
                                        <i className={iconClass} />
                                    </Col>
                                    <Col xs={9} sm={9} md={9} lg={9} className='ptu-info'>
                                        {sideActions.title}
                                        <br />
                                        {description}
                                    </Col>
                                </Accordion.Toggle>
                                <AlertOverlay
                                    target={target}
                                    showAlert={showAlert}
                                    title={sideActions.title}
                                />
                            </>
                    }
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            {
                                selectOptions.map((option, key) => {
                                    let { title, color, iconClass } = option;

                                    let newPriorityBox = <></>;
                                    let newTypeBox = <></>;

                                    let selectedSubAction =
                                        <Accordion.Toggle onClick={sideActions.title === 'Priority' ? () => setSelectedPriority(title, newPriorityBox) : () => setSelectedType(title, newTypeBox)} key={key} as={Row} eventKey="0" className='ptu-box side-action-box'>
                                            <Col xs={3} sm={3} md={3} lg={3} style={{ backgroundColor: color }} className='ptu-icon'>
                                                <i className={iconClass} />
                                            </Col>
                                            <Col xs={9} sm={9} md={9} lg={9} className='ptu-info'>
                                                {title}
                                            </Col>
                                        </Accordion.Toggle>

                                    if (sideActions.title === 'Priority') {
                                        newPriorityBox = selectedSubAction;
                                    } else if (sideActions.title === 'Type') {
                                        newTypeBox = selectedSubAction;
                                    }

                                    return selectedSubAction;
                                })
                            }
                        </Card.Body>
                    </Accordion.Collapse>
                </Accordion>
            </>
        );
    } else if (sideActions.title === 'Type') {
        return (
            <>
                <Accordion>
                    {
                        typeSelected ?
                            newTypeBox
                            :
                            <>
                                <Accordion.Toggle ref={target} as={Row} eventKey="0" className='ptu-box side-action-box'>
                                    <Col xs={3} sm={3} md={3} lg={3} style={{ backgroundColor: color }} className='ptu-icon'>
                                        <i className={iconClass} />
                                    </Col>
                                    <Col xs={9} sm={9} md={9} lg={9} className='ptu-info'>
                                        {sideActions.title}
                                        <br />
                                        {description}
                                    </Col>
                                </Accordion.Toggle>
                                <AlertOverlay
                                    target={target}
                                    showAlert={showAlert}
                                    title={sideActions.title}
                                />
                            </>
                    }
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            {
                                selectOptions.map((option, key) => {
                                    let { title, color, iconClass } = option;

                                    let newPriorityBox = <></>;
                                    let newTypeBox = <></>;

                                    let selectedSubAction =
                                        <Accordion.Toggle onClick={sideActions.title === 'Priority' ? () => setSelectedPriority(title, newPriorityBox) : () => setSelectedType(title, newTypeBox)} key={key} as={Row} eventKey="0" className='ptu-box side-action-box'>
                                            <Col xs={3} sm={3} md={3} lg={3} style={{ backgroundColor: color }} className='ptu-icon'>
                                                <i className={iconClass} />
                                            </Col>
                                            <Col xs={9} sm={9} md={9} lg={9} className='ptu-info'>
                                                {title}
                                            </Col>
                                        </Accordion.Toggle>

                                    if (sideActions.title === 'Priority') {
                                        newPriorityBox = selectedSubAction;
                                    } else if (sideActions.title === 'Type') {
                                        newTypeBox = selectedSubAction;
                                    }

                                    return selectedSubAction;
                                })
                            }
                        </Card.Body>
                    </Accordion.Collapse>
                </Accordion>
            </>
        )
    }
}


const TicketDetails = ({ showAlert, checkFields, handleTitleChange, handleDescriptionChange, ticketTitle, ticketDescription, handleSubmit, handleRedirect, titleEntered, descEntered, setEnteredTitle, setEnteredDesc }) => {
    const target = useRef(null);
    const target2 = useRef(null);

    return (
        <Accordion defaultActiveKey="0">
            <Card>
                <Card.Header className='cursor-pointer'>
                    <Accordion.Toggle as={Card.Title} variant="link" eventKey="0">
                        Demo Admin
                    </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                    <Card.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Title</Form.Label>
                                <Form.Control ref={target} value={ticketTitle} onChange={handleTitleChange} placeholder="Enter Title" />
                                {
                                    !titleEntered ?
                                        <>
                                            <AlertOverlay
                                                showAlert={showAlert}
                                                target={target}
                                                title={'Title'}
                                            />
                                        </>
                                        :
                                        <>
                                        </>
                                }
                            </Form.Group>

                            <Form.Group controlId="exampleForm.ControlTextarea1">
                                <Form.Label>Description</Form.Label>
                                <Form.Control ref={target2} value={ticketDescription} onChange={handleDescriptionChange} as="textarea" placeholder="Enter Description" />
                                {
                                    !descEntered ?
                                        <>
                                            <AlertOverlay
                                                showAlert={showAlert}
                                                target={target2}
                                                title={'Description'}
                                            />
                                        </>
                                        :
                                        <>
                                        </>
                                }
                            </Form.Group>
                            <Button type='submit'>
                                Submit
                            </Button>
                        </Form>

                    </Card.Body>
                </Accordion.Collapse>
            </Card>

            <Card>
            </Card>
        </Accordion>
    )
}

export default CreateTickets;
