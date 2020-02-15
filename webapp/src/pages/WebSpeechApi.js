import React from 'react';
import {Button, Dropdown, Form, Grid, Icon, Message} from "semantic-ui-react";
import SpeechRecognition from "react-speech-recognition";
import PageComponent from "../components/PageComponent";

const speechOptions = {
    autoStart: false
}

class WebSpeechApi extends React.Component {
    constructor(props) {
        super(props);
        this.state = {language: "de-de"};
    }

    render() {
        const languages = [
            {
                key: 'de',
                text: 'German',
                value: 'de-de',
                flag: 'de'
            },
            {
                key: 'en',
                text: 'English',
                value: 'en-us',
                flag: 'us'
            }
        ]
        const {transcript, resetTranscript, browserSupportsSpeechRecognition, startListening, stopListening, recognition, listening} = this.props

        // set the requested language
        if (browserSupportsSpeechRecognition && recognition != null) {
            recognition.lang = this.state.language;
        }

        return (
            <PageComponent title="Web Speech API">
                <Message icon hidden={browserSupportsSpeechRecognition}>
                    <Icon name='exclamation circle'/>
                    <Message.Content>
                        <Message.Header>An error occured</Message.Header>
                        Your browser doesn't support speech recognition
                    </Message.Content>
                </Message>

                <Grid columns='equal' stackable divided centered textAlign={"center"}>
                    <Grid.Row>
                        <Grid.Column>
                            <Form>
                                <Form.TextArea readOnly placeholder="Your spoken text will be displayed here" value={transcript}/>
                            </Form>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            {!listening &&
                            <Button hidden icon="play" content="Start Listening" fluid onClick={startListening}/>}
                            {listening && <Button icon="pause" content="Stop Listening" fluid onClick={stopListening}/>}
                        </Grid.Column>
                        <Grid.Column>
                            <Button fluid onClick={resetTranscript}>
                                Reset Text
                            </Button>
                        </Grid.Column>
                        <Grid.Column>
                            <Dropdown default placeholder='Change the language' value={this.state.language} selection
                                      fluid
                                      onChange={(e, data) => this.setState({language: data.value})}
                                      options={languages}/>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </PageComponent>
        );
    }
}

export default SpeechRecognition(speechOptions)(WebSpeechApi);
