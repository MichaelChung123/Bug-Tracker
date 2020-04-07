import React, { Component, useState, useEffect } from 'react';
import moment from 'moment';
import { ListGroup, Row, Col, Container, Accordion, Card, Button, Table, Form, FormControl, Pagination } from 'react-bootstrap';
// import '../../../styles/TicketDetailstyle.css';
import AssignUsersModal from '../../../modal/AssignUsersModal';
import SideActions from './SideActions';
import UploadModal from '../../../modal/UploadModal';
import DownloadModal from '../../../modal/DownloadModal';
import EditTicketModal from '../../../modal/EditTicketModal';
import TicketComments from './TicketComments';

/* 
    how to connect to database:
    1. psql -d bugtrackerdb -U me
*/

class TicketDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ticketTitle: '',
            priority: '',
            type: '',
            status: '',
            lastUpdated: '',
            description: '',
            selectedPriorityBox: <></>,
            selectedTypeBox: <></>,
            prioritySelected: false,
            typeSelected: false,
            selectedPriority: '',
            selectedType: '',
            attachment: '',
            editTitleVal: '',
            editDescVal: '',
            show: false,
            sideActions: [
                {
                    title: 'Priority',
                    subOptions: [
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
                        }
                    ]
                },
                {
                    title: 'Type',
                    subOptions: [
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
            ]
        }
    }

    handleActionSelect = (title, actionValue, selectedAction) => {
        const id = this.props.appProps.match.params.id;

        if (title === "Priority") {
            const data = {
                selectedPriority: actionValue
            }

            fetch(`/ticket/details/priority/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });


            this.setState({
                selectedPriorityBox: selectedAction,
                selectedPriority: actionValue,
                prioritySelected: true
            })
        } else if (title === "Type") {
            const data = {
                selectedType: actionValue
            }

            fetch(`/ticket/details/type/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            
            this.setState({
                selectedTypeBox: selectedAction,
                selectedType: actionValue,
                typeSelected: true
            })
        }
    }

    handleUpload = (e) => {
        let file = e.target.files[0];

        this.setState({
            attachment: file
        })
    }

    handleAttachmentSubmit = (e) => {
        e.preventDefault();
        console.log('submitting attachment');

        let formData = new FormData();
        formData.append('myFile', this.state.attachment);

        console.log('attachment: ', this.state.attachment);

        for (var key of formData.entries()) {
            console.log(key[0] + ', ' + key[1]);
        }

        fetch('/upload/attachment', {
            method: 'POST',
            body: formData
        })
            .then((response) => {
                response.json();
            })
            .then((data) => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    handleClose = () => {
        this.setState({
            show: false
        })
    }

    handleOpen = () => {
        this.setState({
            show: true
        })
    }

    handleEditTitle = (e) => {
        this.setState({
            editTitleVal: e.target.value
        })
    }

    handleEditDesc = (e) => {
        this.setState({
            editDescVal: e.target.value
        })
    }

    handleEditSubmit = (e) => {
        console.log('Submitting');
        e.preventDefault();

        let unformattedLastUpdated = moment().format();
        let lastUpdated = unformattedLastUpdated.substr(0, 10);
        let lastUpdatedTime = unformattedLastUpdated.substr(11, 8);

        this.setState({
            ticketTitle: this.state.editTitleVal,
            description: this.state.editDescVal
        })

        const id = this.props.appProps.match.params.id;

        let data = {
            editTitleVal: this.state.editTitleVal,
            editDescVal: this.state.editDescVal,
            lastUpdated: lastUpdated,
            lastUpdatedTime: lastUpdatedTime
        }

        // Edit title and description values in db
        fetch(`/edit/ticket/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    componentDidMount() {
        const id = this.props.appProps.match.params.id;

        // Gets all info about specific ticket from tickets table
        fetch(`/admin/tickets/details/${id}`)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                let { title,
                    priority,
                    type,
                    status,
                    lastupdated,
                    description } = data[0];

                this.setState({
                    ticketTitle: title,
                    priority,
                    type,
                    status,
                    lastUpdated: lastupdated,
                    description
                })
            })
    }

    render() {
        return (
            <Container className='all-tickets-container'>
                <Row className='tickets-title'>
                    <Col xs={6} sm={6} md={6} lg={6}>
                        <h1>{this.state.ticketTitle}</h1>
                    </Col>
                </Row>
                {/* SIDE ACTIONS */}
                <Row>
                    <Col xs={3} sm={3} md={3} lg={3}>
                        {
                            this.state.sideActions.map((action, key) => {
                                return (
                                    <SideActions
                                        action={action}
                                        priority={this.state.priority}
                                        type={this.state.type}
                                        selectedPriorityBox={this.state.selectedPriorityBox}
                                        selectedTypeBox={this.state.selectedTypeBox}
                                        prioritySelected={this.state.prioritySelected}
                                        typeSelected={this.state.typeSelected}
                                        editTitleVal={this.state.editTitleVal}
                                        editDescVal={this.state.editDescVal}

                                        handleActionSelect={this.handleActionSelect}
                                        key={key}
                                    />
                                );
                            })
                        }

                        {/* ADD ATTACHMENT FORM */}
                        {/* <Form onSubmit={this.handleAttachmentSubmit}>
                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Attachments:</Form.Label>
                                <Form.Control type="file" placeholder="files" onChange={this.handleUpload} />
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                        </Form> */}

                        <br />

                        {/* EDIT TICKET BLOCK */}
                        <Row onClick={this.handleOpen} className='ptu-box side-action-box'>
                            <Col xs='auto' sm='auto' md='auto' lg='auto' style={{ backgroundColor: '#dc3545' }} className='ptu-icon'>
                                <i className='fas fa-edit' />
                            </Col>
                            <Col xs='auto' sm='auto' md='auto' lg='auto' className='ptu-info'>
                                Edit Ticket
                            </Col>
                        </Row>
                        <EditTicketModal
                            show={this.state.show}
                            ticketTitle={this.state.ticketTitle}
                            description={this.state.description}
                            editTitleVal={this.state.editTitleVal}
                            editDescVal={this.state.editDescVal}

                            handleShow={this.handleShow}
                            handleClose={this.handleClose}
                            handleEditTitle={this.handleEditTitle}
                            handleEditDesc={this.handleEditDesc}
                            handleEditSubmit={this.handleEditSubmit}
                        />
                    </Col>
                    {/* TICKET MAIN BODY */}
                    <Col xs={9} sm={9} md={9} lg={9}>
                        <TicketComments
                            description={this.state.description}
                            id={this.props.appProps.match.params.id}
                        />
                    </Col>
                </Row>
            </Container>
        );
    }
}


export default TicketDetails;