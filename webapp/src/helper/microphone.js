const MediaStreamRecorder = require('msr');

class MicrophoneRecorder {
    constructor(bufferSize = 60 * 60 * 10000) {
        this.bufferSize = bufferSize;
        this.onData = this.onData.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.onMediaSuccess = this.onMediaSuccess.bind(this);

        try {
            navigator.mediaDevices.getUserMedia({audio: true})
                .then(this.onMediaSuccess);
        }
        catch (err) {
            console.log("Error when requesting audio permissions: ", err);
            alert("Your browser doesn't support microphone recording.");
            throw err;
        }
    }

    mediaRecorder = null;
    arrayOfBlobs = [];
    stream = null;
    bufferSize = 60 * 60 * 10000

    onMediaSuccess(stream) {
        this.stream = stream;
        this.mediaRecorder = new MediaStreamRecorder(stream);
        this.mediaRecorder.mimeType = 'audio/wav'; // check this line for audio/wav
        this.mediaRecorder.audioChannels = 1;
        this.mediaRecorder.ondataavailable = (blob) => {
            this.onData(blob);
            this.arrayOfBlobs.push(blob)
        };

        this.mediaRecorder.start(this.bufferSize);
    }

    onData(blob) {
        // to be overridden
    }

    start(timeSlice) {
        if (this.mediaRecorder != null) {
            this.mediaRecorder.start(timeSlice || 3000);
        }
    }

    async stop() {
        if (this.mediaRecorder != null) {
            this.mediaRecorder.stop();

            var tracks = this.stream.getTracks();
            tracks.forEach(function(track){
                track.stop();
            });
            this.stream = null;

            let singleBlob = await concatenateBlobsAsync(this.arrayOfBlobs, 'audio/wav');
            this.arrayOfBlobs = [];
            console.log(singleBlob)
            return singleBlob;
        }
    }
}

function concatenateBlobsAsync(blobs, type) {
    return new Promise((resolve, reject) => {
        concatenateBlobs(blobs, type,(successResponse) => {
            resolve(successResponse);
        }, (errorResponse) => {
            reject(errorResponse)
        });
    });
}

function concatenateBlobs(blobs, type, callback, error) {
    var buffers = [];
    var index = 0;

    function readAsArrayBuffer() {
        if (!blobs[index]) {
            return concatenateBuffers();
        }
        var reader = new FileReader();
        reader.onload = function(event) {
            buffers.push(event.target.result);
            index++;
            readAsArrayBuffer();
        };
        reader.readAsArrayBuffer(blobs[index]);
    }

    readAsArrayBuffer();

    function concatenateBuffers() {
        var byteLength = 0;
        buffers.forEach(function(buffer) {
            byteLength += buffer.byteLength;
        });

        var tmp = new Uint16Array(byteLength);
        var lastOffset = 0;
        buffers.forEach(function(buffer) {
            // BYTES_PER_ELEMENT == 2 for Uint16Array
            var reusableByteLength = buffer.byteLength;
            if (reusableByteLength % 2 !== 0) {
                buffer = buffer.slice(0, reusableByteLength - 1)
            }
            tmp.set(new Uint16Array(buffer), lastOffset);
            lastOffset += reusableByteLength;
        });

        var blob = new Blob([tmp.buffer], {
            type: type
        });

        callback(blob);
    }
};

export default MicrophoneRecorder;