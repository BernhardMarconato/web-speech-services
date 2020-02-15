import config from "../config/main.config";
import {audioToRest} from "../helper/restHelper";

export class SpeechWebService {
    constructor(name, id, url) {
        this.serviceName = name;
        this.id = id;
        this.uploadUrl = url;
    }
}

export class WsSpeechWebService extends SpeechWebService {
    openSocket(language, callback) {
        this.webSocket = new WebSocket(this.uploadUrl + '?lang=' + language);
        this.webSocket.onmessage = (message) => callback(message.data);
    }

    async transcribe(audio) {
        if (this.webSocket != null && this.webSocket.readyState === WebSocket.OPEN) {
            this.webSocket.binaryType = "blob";
            console.log("send_ws")
            this.webSocket.send(audio);
        }
    }

    async endTranscription() {
        if (this.webSocket != null && this.webSocket.readyState === WebSocket.OPEN) {
            console.log("final")
            this.webSocket.send("end");
        }
    }

    closeSocket() {
        if (this.webSocket != null && this.webSocket.readyState === WebSocket.OPEN) {
            this.webSocket.close();
        }
    }
}

export class RestSpeechWebService extends SpeechWebService {
    async transcribe(audio, language) {
        return await audioToRest(this.uploadUrl, audio, language);
    }
}

export var speechWebServices = [
    new RestSpeechWebService(
        "Google",
        "google",
        config.REST_URL + "google"),
    new WsSpeechWebService(
        "Google Websocket",
        "google_ws",
        config.WS_URL + "google/stream"),
    new RestSpeechWebService(
        "Microsoft",
        "microsoft",
        config.REST_URL + "microsoft"),
    new WsSpeechWebService(
        "Microsoft Websocket",
        "microsoft_ws",
        config.WS_URL + "microsoft/stream"),
    new RestSpeechWebService(
        "IBM Watson",
        "watson",
        config.REST_URL + "watson"),
    new RestSpeechWebService(
        "DeepSpeech",
        "deepspeech",
        config.REST_URL + "deepspeech")
];

export var languages = [
    {
        text: 'German',
        value: 'de-DE',
        flag: 'de'
    },
    {
        text: 'English',
        value: 'en-US',
        flag: 'us'
    }
];