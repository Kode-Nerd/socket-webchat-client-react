import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Container, Row, Col, Card, InputGroup, FormControl, Button } from 'react-bootstrap';
import * as _ from 'lodash';

import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from './config/api';

function App() {
  const [interactions, setInteractions] = useState([]);
  const [text, setText] = useState('');
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState({
    event: false,
    user: null
  });
  const [userTyping, setUserTyping] = useState(false);

  const sendMessage = (event) => {
    event.preventDefault();
    
    if (!text) {
      return;
    }

    typingOff();
    
    socket.emit('message', text);
    setText('');
  }

  const typingOff = () => {
    if (userTyping) {
      setUserTyping(false);
      socket.emit('typing', false);
    }
  }

  const typingOn = () => {
    if (!userTyping) {
      setUserTyping(true);
      socket.emit('typing', true);
    }
  }

  const delayedTypingOff = _.debounce(typingOff, 5000, { trailing: true }) 

  const handleChange = (event) => {
    typingOn();

    delayedTypingOff();
    
    setText(event.target.value);
  }
  
  const scrollToEnd = () => {
    const id = interactions.length - 1;
    const el = document.getElementById('' + id);
    const elTyping = document.getElementById('app-typing');
    const appContainer = document.getElementById('app-container');
    if (!!el) {
      appContainer.scrollTo(0, el.offsetTop);
    }
    if (!!elTyping) {
      appContainer.scrollTo(0, elTyping.offsetTop);
    }
  }

  useEffect(() => {
    const NODE_ENV = process.env.NODE_ENV;
    const socketInstance = io(`${api[NODE_ENV].baseURL}/socket`);
    
    setSocket(socketInstance);
    
    socketInstance.on('message', (object) => {
      setInteractions(i => [...i, object]);
    })
    socketInstance.on('typing', (object) => {
      setTyping(object);
    })
    
    return () => {
      socket.disconnect();
    }
  }, [])

  useEffect(() => {
    scrollToEnd();
  }, [interactions.length, typing])

  return (
    <div className="App">
      <div className="App-header">
        <img src={logo} alt="logo" className="App-logo" />
        <h1>{process.env.REACT_APP_WEBSITE_NAME}</h1>
      </div>
      <div id="app-container" className="App-container">
        <Container>
          {
            interactions.map((item, index) => {
              if (item.type === 'text') {
                if (item.sender === socket.id) {
                  return (
                    <Row id={index} key={index} className="mt-3">
                      <Col md={{ span: 5, offset: 7 }}>
                        <Card bg="info">
                          <Card.Body>
                            <Card.Subtitle className="mb-2 text-muted">
                              {item.sender}
                            </Card.Subtitle>
                            <Card.Text>
                              {item.text}
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>    
                    </Row>
                  )
                } else {
                  return (
                    <Row id={index} key={index} className="mt-3">
                      <Col md={5}>
                        <Card>
                          <Card.Body>
                            <Card.Subtitle className="mb-2 text-muted">
                              {item.sender}
                            </Card.Subtitle>
                            <Card.Text>
                              {item.text}
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  )
                }
              }
              if (item.type === 'event') {
                return (
                  <Row id={index} key={index} className="justify-content-md-center mt-3">
                    <Card bg="secondary" text="white">
                      <Card.Text className="mx-3">
                        {item.user} {item.event}
                      </Card.Text>
                    </Card>
                  </Row>
                )
              }
            })
          }
          {
            typing.event &&
            <Row id="app-typing" className="mt-3">
              {typing.user} is typing...
            </Row>
          }       
        </Container>
      </div>
      <div className="App-footer">
        <Container fluid>
          <form onSubmit={sendMessage}>
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Write your message here"
                aria-label="Write your message here"
                aria-describedby="basic-addon2"
                value={text}
                onChange={handleChange}
                onBlur={typingOff}
              />
              <InputGroup.Append>
                <Button onClick={sendMessage}>Send</Button>
              </InputGroup.Append>
            </InputGroup>
          </form>
        </Container>
      </div>
    </div>
  );
}

export default App;
