'use strict';

const ffmpeg = require('fluent-ffmpeg');
const ffmpeg_static = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

/**
 * Checks whether the mime type should be accepted.
 * Only audio files are accepted.
 * @param mimeType
 * @returns {*|boolean}
 */
function isValidMimeType(mimeType) {
    return mimeType.startsWith("audio");
}

/**
 * Converts an audio file to the LINEAR16 format.
 * @param filePathIn input file path
 * @param filePathOut output file path
 * @returns {Promise}
 */
async function convertToLinear16(filePathIn, filePathOut) {
    return new Promise((resolve, reject) => {
        try {
            ffmpeg()
                .setFfmpegPath(ffmpeg_static.path)
                .input(filePathIn)
                .outputOptions([
                    '-f wav', //s16le
                    '-acodec pcm_s16le',
                    '-vn',
                    '-ac 1',
                    '-ar 16k',
                    '-map_metadata -1'
                ])
                .save(filePathOut)
                .on('end', () => resolve(filePathOut));
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Converts an audio file to LINEAR16.
 * @param fileObject MULTER file object
 * @returns {Promise<string>} converted audio path
 */
async function convertAudioFileToLinear16(fileObject) {
    // only accept audio files
    if (!isValidMimeType(fileObject.mimetype)) {
        throw "Invalid file type: " + fileObject.mimetype;
    }

    let receivedAudioPath = fileObject.path;
    let receivedAudioName = fileObject.filename;
    let convertedAudioPath = path.join(fileObject.destination, receivedAudioName + "c");

    await convertToLinear16(receivedAudioPath, convertedAudioPath);

    await deleteFile(receivedAudioPath);

    return convertedAudioPath;
}

/**
 * Converts an audio file to a LINEAR16 type BASE64 encoded string.
 * @param fileObject MULTER file object
 * @returns {Promise<string>} BASE64 string
 */
async function convertAudioFileToBase64(fileObject) {
    let convertedAudioPath = await convertAudioFileToLinear16(fileObject);

    let file = await fs.promises.readFile(convertedAudioPath);
    let base64 = file.toString('base64');

    await deleteFile(convertedAudioPath);

    return base64;
}

/**
 * Deletes a file.
 * @param filePath
 * @returns {Promise<void>}
 */
async function deleteFile(filePath) {
    await fs.promises.unlink(filePath);
}

exports.convertAudioFileToBase64 = convertAudioFileToBase64
exports.convertAudioFileToLinear16 = convertAudioFileToLinear16
exports.deleteFile = deleteFile
exports.isValidMimeType = isValidMimeType