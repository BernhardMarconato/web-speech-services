import React from 'react';
import {Form, Grid, Header, Loader} from "semantic-ui-react";

class TranscriptArea extends React.Component {
    render() {
        return (
            <Grid.Column>
                <Header as={"h3"}>
                    {this.props.service}
                    <Header.Subheader>
                        {"Execution duration: " + (this.props.duration ? this.props.duration.toFixed(0) + " ms" : "")}
                    </Header.Subheader>
                </Header>

                <Form>
                    <div>
                        <Loader active={this.props.waiting}/>
                        <Form.TextArea readOnly placeholder="Your spoken text will be displayed here"
                                       value={this.props.transcript} onClick={this.toClipboard} ref={this.textArea}/>
                    </div>
                </Form>
            </Grid.Column>
        );
    }

    toClipboard = e => {
        if (this.props.transcript != null) {
            console.log("copied")
            e.target.select();
            document.execCommand('copy');
        }
    }
}

export default TranscriptArea;
