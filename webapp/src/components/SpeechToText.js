import React from 'react';
import {Button, Dropdown, Grid} from "semantic-ui-react";
import FileButton from "./FileButton";
import MicrophoneRecorder from "../helper/microphone";
import {languages, speechWebServices, WsSpeechWebService} from "../services/SpeechWebService";
import TranscriptArea from "./TranscriptArea";

class SpeechToText extends React.Component {
    constructor(props) {
        super(props);

        this.services = speechWebServices.map(service => ({text: service.serviceName, value: service.id}));
        this.selectedSpeechService = speechWebServices[0];

        this.state = {
            record: false,
            language: "de-DE",
            waiting: false,
            service: this.selectedSpeechService.id,
            duration: NaN
        }

        this.setTranscription = this.setTranscription.bind(this);
        this.setSpeechService = this.setSpeechService.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.onData = this.onData.bind(this);
        this.uploadBlob = this.uploadBlob.bind(this);
    }

    setSpeechService(serviceId) {
        this.selectedSpeechService = speechWebServices.find((item) => item.id === serviceId);
        this.setState({service: serviceId});
    }

    startRecording() {
        if (this.state.record) return;
        this.setTranscription("");

        try {
            if (this.selectedSpeechService instanceof WsSpeechWebService) {
                this.selectedSpeechService.openSocket(this.state.language, this.setTranscription);
                this.microphoneRecorder = new MicrophoneRecorder(2048);
            }
            else {
                this.microphoneRecorder = new MicrophoneRecorder();
            }

            this.microphoneRecorder.onData = this.onData;
            this.setState({record: true});
        }
        catch {

        }
    }

    async stopRecording() {
        if (!this.state.record) return;

        let blob = await this.microphoneRecorder.stop();

        if (this.selectedSpeechService instanceof WsSpeechWebService) {
            await this.selectedSpeechService.endTranscription();
        }
        else {
            await this.uploadBlob(blob);
        }
        this.setState({record: false});
    }

    async uploadBlob(blob) {
        this.setState({waiting: true});

        let t = performance.now()
        let transcript = await this.selectedSpeechService.transcribe(blob, this.state.language);
        let tend = performance.now()

        this.setTranscription(transcript);
        this.setState({waiting: false});
        this.setState({duration: tend - t});
    }

    onData(recordedBlob) {
        if (this.selectedSpeechService instanceof WsSpeechWebService) {
            this.selectedSpeechService.transcribe(recordedBlob);
        }
    }

    setTranscription(text) {
        this.setState({transcript: text});
    }

    render() {
        return (
            <Grid columns='equal' stackable divided centered textAlign={"center"}>
                <Grid.Row>
                    <TranscriptArea waiting={this.state.waiting} transcript={this.state.transcript} service={this.selectedSpeechService.serviceName} duration={this.state.duration} />
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        {!this.state.record &&
                        <Button autoFocus hidden icon="play" content="Start Listening" fluid
                                onClick={this.startRecording}/>}
                        {this.state.record &&
                        <Button autoFocus icon="pause" content="Stop Listening" fluid onClick={this.stopRecording}/>}
                    </Grid.Column>
                    <Grid.Column>
                        <FileButton onSelect={this.uploadBlob} fluid icon={"upload"} content={"Upload Audio File"} accept={"audio/*"}/>
                    </Grid.Column>
                    <Grid.Column>
                        <Button fluid onClick={() => this.setState({transcript: ""})}>
                            Clear Text
                        </Button>
                    </Grid.Column>
                    <Grid.Column>
                        <Dropdown default placeholder='Choose the service' value={this.state.service} selection
                                  fluid
                                  onChange={(e, data) => this.setSpeechService(data.value)}
                                  options={this.services}/>
                    </Grid.Column>
                    <Grid.Column>
                        <Dropdown default placeholder='Change the language' value={this.state.language} selection
                                  fluid
                                  onChange={(e, data) => this.setState({language: data.value})}
                                  options={languages}/>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

export default SpeechToText;
