var contextMenuItem = {
    "id": "summarize",
    "title": "Summarize",
    "contexts": ["selection"]
};

browser.storage.local.set({ 'summaryIn': 'window', 'summaryOf': 'text', 'tts': true });

browser.contextMenus.create(contextMenuItem);

//When the context menu option is clicked
browser.contextMenus.onClicked.addListener(function (clickData) {

    //Get user preferences from local storage 
    browser.storage.local.get(['summaryIn', 'summaryOf', 'tts'], function (preferences) {
        var summaryIn = preferences.summaryIn;
        var summaryOf = preferences.summaryOf;
        var tts = preferences.tts;


        if (clickData.menuItemId == "summarize") {
            var summary;
            //when user preference is to get summary of whole page
            if (preferences.summaryOf == 'page') {
                //get current tab id
                browser.tabs.query({
                    active: true,
                    lastFocusedWindow: true
                }, function (tabs) {
                    var tab = tabs[0].id;
                    //send message to the curret tab to read all the text and store it in localstorage 
                    browser.tabs.sendMessage(tab, "readAllText", function (response) {
                        //get text all the text of current tab from the local storage
                        browser.storage.local.get('allText', function (data) {
                            //summarize the text
                            summary = summarizeText(data.allText);
                            //show the summary
                            showSummary(summary, clickData, preferences);
                            //if user has text to speech enabled
                            if (preferences.tts) {
                                var synth = window.speechSynthesis;
                                var utterThis = new SpeechSynthesisUtterance(summary);
                                synth.speak(utterThis);
                            }
                        });
                    });

                });

            }
            else {
                //get the selectedData in summary
                summary = summarizeText(clickData.selectionText);
                showSummary(summary, clickData, preferences);
                //if user has text to speech enabled
                if (preferences.tts) {
                    var synth = window.speechSynthesis;
                    var utterThis = new SpeechSynthesisUtterance(summary);
                    synth.speak(utterThis);
                }
            }

        }

    });
});

function showSummary(summary, clickData, preferences) {
    //if the summarization is successful
    if (clickData.menuItemId == "summarize" && summary) {
        //user preference is show in new window
        if (preferences.summaryIn === 'window') {
            var createData = {
                "url": 'summary.html',
                "type": "popup",
                "top": 5,
                "left": 5,
                "width": screen.availWidth / 2,
                "height": parseInt(2 * (screen.availHeight / 3))
            };
            //add summary to the local storage
            browser.storage.local.set({ 'summary': summary });
            //create the new overlay window         
            browser.windows.create(createData);
        }
        else { //user preference is show in a notification box
            //create the notification option
            var notifOptions = {
                type: 'basic',
                iconUrl: browser.runtime.getURL('icons/sum24.svg'),
                title: 'Summarized!',
                message: summary
            };
            //create the notification
            browser.notifications.create('summarizeNotif', notifOptions);
        }
    }
}

//Summarizes text
function summarizeText(text) {
    //Summarization library used from https://github.com/wkallhof/js-summarize. Thanks to wkallhof! 
    var summary = "";
    var summarizer = new JsSummarize(
        {
            returnCount: 3
        });
    var summaryArr = summarizer.summarize("", text);
    summaryArr.forEach(function (sentence) {
        summary += ("<li>" + sentence + "</li>");
    });
    return summary;
}