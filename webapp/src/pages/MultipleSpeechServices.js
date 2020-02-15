import React from 'react';
import PageComponent from "../components/PageComponent";
import MultiSpeechToText from "../components/MultiSpeechToText";

class MultipleSpeechServices extends React.Component {
    render() {
        return (
            <PageComponent title="Multiple Speech Services">
                <MultiSpeechToText/>
            </PageComponent>
        );
    }
}

export default MultipleSpeechServices;
