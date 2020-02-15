var express = require('express');
var router = express.Router();
var multer = require('multer');
var asyncHandler = require('express-async-handler');
const fs = require('fs');
const audioConvert = require('../tools/audioConvert')

var upload = multer({storage: multer.diskStorage({})});

/* POST Watson Speech To Text */
router.post('/', upload.single("audio"), asyncHandler(async (req, res, next) => {
    try {
        // convert uploaded file to linear16 format
        let path = await audioConvert.convertAudioFileToLinear16(req.file);

        // run watson speech to text
        let text = await speechToText(path, req.body.lang || "de-DE");

        // delete the uploaded file
        await audioConvert.deleteFile(path);

        res.json({"text": text, "success": true});
    } catch (e) {
        console.log(e);
        res.json({"text": "", "success": false});
    }
}));

async function speechToText(filename, language) {
    const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
    const { IamAuthenticator } = require('ibm-watson/auth');

    // create STT object
    const speechToText = new SpeechToTextV1({
        authenticator: new IamAuthenticator({ apikey: process.env.WATSON_API_KEY }),
        url: process.env.WATSON_URL
    });

    // set paramters
    const params = {
        audio: fs.createReadStream(filename),
        contentType: 'audio/l16; rate=16000',
        model: language + '_BroadbandModel'
    };

    // recognize
    let response = await speechToText.recognize(params);

    // get all result sentences
    let strings = response.result.results.map(result => result.alternatives[0].transcript);
    return strings.join(" ");
}

module.exports = router;
