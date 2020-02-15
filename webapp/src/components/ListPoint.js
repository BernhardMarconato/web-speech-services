import React from 'react';
import {List} from "semantic-ui-react";

class ListPoint extends React.Component {
    render() {
        return (
            <List.Item as={"a"} href={this.props.link}>
                <List.Content>
                    <List.Header>{this.props.title}</List.Header>
                    {this.props.description}
                </List.Content>
            </List.Item>
        );
    }
}

export default ListPoint;
