# Using Speech Services through a server

The server will run on `localhost:5000` by default.

## ENV file
For the web services to work you need to create accounts at Google, Microsoft and IBM.
They will provide API keys you need to store in your server.

For that, create an `.env` file in this directory, containing the necessary API keys in the following form:

```
GOOGLE_APPLICATION_CREDENTIALS="..."
MICROSOFT_API_KEY="..."
WATSON_API_KEY="..."
WATSON_URL="..."
```

## DeepSpeech
This code has been designed to work with Windows and WSL. If you want to use DeepSpeech,
install WSL and there DeepSpeech according to the instructions at https://github.com/mozilla/DeepSpeech.

Used DeepSpeech version is 0.5.1, used German speech model is from https://github.com/AASHISHAG/deepspeech-german.

The Node.js server will run a bash script via WSL that will invoke DeepSpeech.
You can find an example file at `run_deepspeech_single.sh`.
You may have to change its contents depending on your folder structure.


