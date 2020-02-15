import React from 'react';
import PageComponent from "../components/PageComponent";
import SpeechToText from "../components/SpeechToText";

class SpeechServices extends React.Component {
    render() {
        return (
            <PageComponent title="Speech Services">
                <SpeechToText/>
            </PageComponent>
        );
    }
}

export default SpeechServices;
