import React from 'react';
import {Header, Segment} from "semantic-ui-react";

class PageComponent extends React.Component {
    render() {
        return (
            <Segment>
                <Header as='h1' dividing>{this.props.title}</Header>
                {this.props.children}
            </Segment>
        );
    }
}

export default PageComponent;
