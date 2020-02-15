import React from 'react';
import {Button, Dropdown, Grid} from "semantic-ui-react";
import FileButton from "./FileButton";
import MicrophoneRecorder from "../helper/microphone";
import {languages, RestSpeechWebService, speechWebServices} from "../services/SpeechWebService";
import TranscriptArea from "./TranscriptArea";

class MultiSpeechToText extends React.Component {
    constructor(props) {
        super(props);

        this.services = speechWebServices.filter(service => service instanceof RestSpeechWebService);

        let state = {
            record: false,
            language: "de-DE",
            disabled: false
        };

        this.services.map(service => state["waiting_" + service.id] = false);
        this.services.map(service => state["transcript_" + service.id] = "");
        this.services.map(service => state["duration_" + service.id] = NaN);

        this.state = state;

        this.setTranscription = this.setTranscription.bind(this);
        this.setWaiting = this.setWaiting.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.uploadBlob = this.uploadBlob.bind(this);
    }

    startRecording() {
        if (this.state.record) return;
        this.services.map(service => this.setTranscription(service.id, ""));

        this.microphoneRecorder = new MicrophoneRecorder();
        this.setState({record: true});
    }

    async stopRecording() {
        if (!this.state.record) return;

        let blob = await this.microphoneRecorder.stop();
        await this.uploadBlob(blob)

        this.setState({record: false});
    }

    setTranscription(id, text) {
        console.log("setting: " + id + text);
        this.setState({["transcript_" + id]: text});
    }

    setWaiting(id, waiting) {
        this.setState({["waiting_" + id]: waiting});
    }

    setDuration(id, duration) {
        this.setState({["duration_" + id]: duration});
    }

    async uploadBlob(blob) {
        this.setState({disabled : true});
        await Promise.all(this.services.map(async (service) => {
            this.setWaiting(service.id, true);

            let t = performance.now()
            let transcript = await service.transcribe(blob, this.state.language);
            let tend = performance.now()

            this.setTranscription(service.id, transcript);
            this.setDuration(service.id, tend - t);
            this.setWaiting(service.id, false);
        }));
        this.setState({disabled : false});
    }

    render() {
        return (
            <Grid columns='equal' stackable divided centered textAlign={"center"}>
                {this.services.map((object, i) => <Grid.Row key={i}>
                    <TranscriptArea duration={this.state["duration_" + object.id]} waiting={this.state["waiting_" + object.id]} transcript={this.state["transcript_" + object.id]} service={object.serviceName} />
                </Grid.Row>)}

                <Grid.Row>
                    <Grid.Column>
                        {!this.state.record &&
                        <Button disabled={this.state.disabled} autoFocus hidden icon="play" content="Start Listening" fluid
                                onClick={this.startRecording}/>}
                        {this.state.record &&
                        <Button disabled={this.state.disabled} autoFocus icon="pause" content="Stop Listening" fluid onClick={this.stopRecording}/>}
                    </Grid.Column>
                    <Grid.Column>
                        <FileButton disabled={this.state.disabled} onSelect={this.uploadBlob} fluid icon={"upload"} content={"Upload Audio File"} accept={"audio/**"}/>
                    </Grid.Column>
                    <Grid.Column>
                        <Button disabled={this.state.disabled} fluid onClick={() => this.setState({transcript: ""})}>
                            Clear Text
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
        );
    }


}

export default MultiSpeechToText;
