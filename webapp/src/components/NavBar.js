import React from 'react';
import logo from '../logo.svg';
import {BrowserRouter as Router, NavLink, Route} from "react-router-dom";
import {Container, Menu} from "semantic-ui-react";
import WebSpeechApi from "../pages/WebSpeechApi";
import Home from "../pages/Home";
import SpeechServices from "../pages/SpeechServices";
import MultipleSpeechServices from "../pages/MultipleSpeechServices";

class NavBar extends React.Component {
    state = {}

    render() {
        return (
            <Container>
                <Router>
                    <Menu stackable>
                        <Menu.Item>
                            <img src={logo} alt="Logo" />
                        </Menu.Item>

                        <Menu.Item
                            as={NavLink}
                            name='home'
                            exact to='/'>
                            Home
                        </Menu.Item>

                        <Menu.Item
                            as={NavLink}
                            name='webspeechapi'
                            to='webspeechapi'>
                            WebSpeech API
                        </Menu.Item>

                        <Menu.Item
                            as={NavLink}
                            name='speechservices'
                            to='speechservices'>
                            Speech Services
                        </Menu.Item>

                        <Menu.Item
                            as={NavLink}
                            name='multiple-speechservices'
                            to='multiple-speechservices'>
                            Multiple Speech Services
                        </Menu.Item>
                    </Menu>

                    <Route exact path="/" component={Home} />
                    <Route path="/webspeechapi" component={WebSpeechApi} />
                    <Route path="/speechservices" component={SpeechServices} />
                    <Route path="/multiple-speechservices" component={MultipleSpeechServices} />
                </Router>
            </Container>
        );
    }
}

export default NavBar;
