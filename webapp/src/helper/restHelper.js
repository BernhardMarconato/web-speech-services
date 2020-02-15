export async function audioToRest(url, audioBlob, language) {
    let fd = new FormData();
    fd.set('audio', audioBlob, 'audio.file');
    fd.append('lang', language);

    try {
        let response = await fetch(url, {
            method: 'POST',
            body: fd
        })

        console.log(response);
        let json = await response.json();
        return json.text;
    }
    catch (e) {
        console.log(e);
        return "";
    }
}