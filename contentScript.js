browser.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {
    console.log(message);
    if (message === "readAllText") {
        var text = document.body.innerText;
        browser.storage.local.set({ 'allText': text });
    }
}