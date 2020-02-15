var express = require('express');
var router = express.Router();
var multer = require('multer');
var asyncHandler = require('express-async-handler');
var fs = require('fs');
var audioConvert = require('../tools/audioConvert')
const sdk = require("microsoft-cognitiveservices-speech-sdk");

var upload = multer({storage: multer.diskStorage({})});

/* POST Microsoft Speech To Text */
router.post('/', upload.single("audio"), asyncHandler(async (req, res, next) => {
    try {
        // convert uploaded file to linear16 format
        let path = await audioConvert.convertAudioFileToLinear16(req.file);

        // run microsoft speech to text
        let text = await speechToText(path, req.body.lang || "de-DE");

        // delete the uploaded file
        await audioConvert.deleteFile(path);

        res.json({"text": text, "success": true});
    } catch (e) {
        console.log(e);
        res.json({"text": "", "success": false});
    }
}));

/* WebSocket Microsoft Speech To Text */
router.ws('/stream', function(ws, req) {
    console.log("New Microsoft WebSocket");
    try {
        const subscriptionKey = process.env.MICROSOFT_API_KEY;
        const serviceRegion = "westeurope";

        // create the push stream we need for the speech sdk.
        var pushStream = sdk.AudioInputStream.createPushStream();

        // now create the audio-config pointing to our stream and
        // the speech config specifying the language.
        var audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
        var speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
        speechConfig.speechRecognitionLanguage = req.query.lang || "de-DE";

        // create the speech recognizer.
        var recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
        recognizer.recognizing = (s, e) => {
            console.log("New Microsoft Recognizing");
            ws.send(e.result.text);
        }
        recognizer.recognized = (s, e) => {
            console.log("New Microsoft Recognized");
            ws.send(e.result.text);
        }
        recognizer.canceled = (s, e) => {
            console.log("Microsoft WebSocket Close");
            ws.close();
        }

        recognizer.startContinuousRecognitionAsync(() => {
        }, () => {
        });
    }
    catch (e) {
        console.log(e)
    }

    // on WebSocket close
    ws.on('close', function clear() {
        console.log("Microsoft WebSocket Closed");
        pushStream.close();
    });

    // on new input
    ws.on('message', async function(msg) {
        try {
            console.log("Microsoft WebSocket Input");
            if (msg === "end") {
                pushStream.close();
            }
            else {
                pushStream.write(msg);
            }
        } catch (e) {
            console.log(e);
        }
    });
});

async function speechToText(filename, language) {
    const subscriptionKey = process.env.MICROSOFT_API_KEY;
    const serviceRegion = "westeurope";

    // create the push stream we need for the speech sdk.
    var pushStream = sdk.AudioInputStream.createPushStream();

    // now create the audio-config pointing to our stream and
    // the speech config specifying the language.
    var audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    var speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
    speechConfig.speechRecognitionLanguage = language || "de-DE";

    // create the speech recognizer.
    var recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    // The event recognized signals that a final recognition result is received.
    // This is the final event that a phrase has been recognized.
    // For continuous recognition, you will get one recognized event for each phrase recognized.
    // save recognized text in a list
    let recognizedAudio = [];
    recognizer.recognized = function (s, e) {
        // Indicates that recognizable speech was not detected, and that recognition is done.
        if (e.result.reason === sdk.ResultReason.NoMatch) {
            var noMatchDetail = sdk.NoMatchDetails.fromResult(e.result);
            console.log("\r\n(recognized)  Reason: " + sdk.ResultReason[e.result.reason] + " NoMatchReason: " + sdk.NoMatchReason[noMatchDetail.reason]);
        } else {
            recognizedAudio.push(e.result.text);
        }
    };

    // The event signals that the service has stopped processing speech.
    // https://docs.microsoft.com/javascript/api/microsoft-cognitiveservices-speech-sdk/speechrecognitioncanceledeventargs?view=azure-node-latest
    // This can happen for two broad classes of reasons.
    // 1. An error is encountered.
    //    In this case the .errorDetails property will contain a textual representation of the error.
    // 2. Speech was detected to have ended.
    //    This can be caused by the end of the specified file being reached, or ~20 seconds of silence from a microphone input.
    let canceledPromise = new Promise((resolve, reject) => {
        recognizer.canceled = function (s, e) {
            resolve(e);
        };
    });

    // start the recognizer and wait for a result.
    recognizer.startContinuousRecognitionAsync(() => {},
        function (err) {
            recognizer.close();
            recognizer = undefined;
        });

    // open the file and push it to the push stream.
    fs.createReadStream(filename).on('data', function(arrayBuffer) {
        pushStream.write(arrayBuffer.slice());
    }).on('end', async function() {
        pushStream.close();
    });

    // wait for recognition to finish
    let success = await canceledPromise;
    if (success.reason === sdk.CancellationReason.Error) {
        return success.errorDetails;
    };

    return recognizedAudio.join(" ");
}

module.exports = router;
