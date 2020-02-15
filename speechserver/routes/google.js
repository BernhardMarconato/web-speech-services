var express = require('express');
var router = express.Router();
var multer = require('multer');
var asyncHandler = require('express-async-handler');
var fs = require('fs');
var audioConvert = require('../tools/audioConvert')
var WebSocket = require('ws');

var upload = multer({storage: multer.diskStorage({})});

/* POST Google Speech To Text */
router.post('/', upload.single("audio"), asyncHandler(async (req, res, next) => {
    try {
        // Google wants BASE64 encoded audio
        let transcription = await speechToText(req.file, req.body.lang);

        res.json({"text": transcription, "success": true});
    } catch (e) {
        console.log(e);
        res.json({"text": "", "success": false});
    }
}));

async function speechToText(file, language) {
    // Google wants BASE64 encoded audio
    let base64 = await audioConvert.convertAudioFileToBase64(file);
    let request = createGoogleRequest(base64, language || "de-DE");

    // start recognition
    const speech = require('@google-cloud/speech');
    const client = new speech.SpeechClient();
    const [response] = await client.recognize(request);

    return response.results
        .map(result => result.alternatives[0].transcript)
        .join(' ');
}

function createGoogleRequest(base64Audio, language) {
    const audio = {
        content: base64Audio,
    };
    const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: language,
        enableAutomaticPunctuation: true
    };
    const request = {
        audio: audio,
        config: config,
    };
    return request;
}

/* WebSocket Google Speech To Text */
router.ws('/stream', function(ws, req) {
    console.log("New Google WebSocket");
    const speech = require('@google-cloud/speech');
    const client = new speech.SpeechClient();

    const request = {
        interimResults: true,
        config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 44100,
            languageCode: req.query.lang || "en-US",
        }
    };

    // Create a recognize stream
    const recognizeStream = client
        .streamingRecognize(request)
        .on('error', console.error)
        .on('data', data => {
            console.log("Google WebSocket Output");

            // get transcripted text
            let text = data.results[0] && data.results[0].alternatives[0]
                    ? data.results[0].alternatives[0].transcript
                    : "";

            // if websocket is open, send it out
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(text);
            }
        });

    // on WebSocket close
    ws.on('close', function clear() {
        console.log("Google WebSocket Closed");
        recognizeStream.end();
    });

    // on new microphone input
    ws.on('message', async function(msg) {
        console.log("Google WebSocket Input");
        try {

            if (msg === "end") {
                recognizeStream.end();
                ws.close();
            }
            else {
                // directly write to stream
                // microphone input needs to be in linear16 format
                recognizeStream.write(msg);
            }
        } catch (e) {
            console.log(e);
        }
    });
});

module.exports = router;
