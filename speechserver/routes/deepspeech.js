var express = require('express');
var router = express.Router();
var multer = require('multer');
var asyncHandler = require('express-async-handler');
var audioConvert = require('../tools/audioConvert')

var upload = multer({storage: multer.diskStorage({})});

/* POST DeepSpeech Speech To Text */
router.post('/', upload.single("audio"), asyncHandler(async (req, res, next) => {
    try {
        // convert uploaded file to linear16 format
        let path = await audioConvert.convertAudioFileToLinear16(req.file);

        // run DeepSpeech speech to text
        let text = await speechToText(path);

        // delete the uploaded file
        await audioConvert.deleteFile(path);

        res.json({"text": text, "success": true});
    } catch (e) {
        console.log(e);
        res.json({"text": "", "success": false});
    }
}));

async function speechToText(filename) {
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);

    // DeepSpeech only runs on Linux
    // Start DeepSpeech via WSL bash
    async function startProcess(command) {
        const { stdout, stderr } = await exec(command);
        return [stdout, stderr]
    }

    // get the Linux path for the audio file
    let pathOutput = await startProcess(`wsl wslpath "${filename}"`);
    let linuxPath = pathOutput[0].trim();

    // run deepspeech in WSL Linux
    // requires to have a DeepSpeech script in the Linux home directory
    let dsOutput = await startProcess(`bash -c "cd ~ && ./run_deepspeech_single.sh ${linuxPath}"`);
    let dssOutput = dsOutput[0].trim()

    // get last line of DeepSpeech output
    let lastNewLine = dssOutput.lastIndexOf("\n");
    if (lastNewLine > 0) {
        return dssOutput.substring(lastNewLine + 1);
    }
    return "";
}

module.exports = router;
