import React from 'react';
import PageComponent from "../components/PageComponent";
import {Header, List} from "semantic-ui-react";
import ListPoint from "../components/ListPoint";

function Home() {
    return (
        <PageComponent title={"Speech to Text in React"}>
            <Header as={"h2"}>Some speech services available</Header>

            <List selection verticalAlign='middle'>
                <ListPoint title={"JavaScript Web Speech API"} description={""} link={"/webspeechapi"} />
                <ListPoint title={"Google Cloud Speech-to-Text"} description={""} link={"https://cloud.google.com/speech-to-text/"} />
                <ListPoint title={"Microsoft Azure Text-to-speech"} description={""} link={"https://azure.microsoft.com/en-us/services/cognitive-services/speech-to-text/"} />
                <ListPoint title={"IBM Watson Speech to Text"} description={""} link={"https://speech-to-text-demo.ng.bluemix.net/"} />
                <ListPoint title={"Julius"} description={"open source, old/known, no German, offline"} link={"https://github.com/julius-speech/julius"} />
                <ListPoint title={"Mozilla Common Voice/DeepSpeech"} description={"still in development, english only"} link={"https://github.com/mozilla/DeepSpeech"} />
                <ListPoint title={"Pocketsphinx.js"} description={"open source, offline"} link={"https://syl22-00.github.io/pocketsphinx.js/"} />
                <ListPoint title={"Annyang"} description={"implementation of Web Speech API"} link={"https://www.talater.com/annyang/"} />
            </List>
        </PageComponent>
    );
}

export default Home;
