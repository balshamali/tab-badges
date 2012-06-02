// background.js

// ================================================================================== //
// =============================== GLOBAL VARIABLES ================================= // 
// ================================================================================== //

var g_badgesOn = false;
var g_extensionClicked = false;

// ================================================================================== //
// =============================== EVENT LISTENERS ================================== // 
// ================================================================================== //

// This will toggle the state of the extension by disconnecting to the 
// event onkeyup and onkeydown.
chrome.browserAction.onClicked.addListener(
    function(tab) {
        g_extensionClicked = g_extensionClicked ? false : true;
        g_badgesOn = g_extensionClicked;
        var setIconPath = g_extensionClicked ? "images/icon.png" : "images/off.png";

        chrome.browserAction.setIcon({
            path: setIconPath
        });
        enableOrDisable();
});


chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) { 
        // The setTabs request is necesary because the query functions are asynchronous
        // and thus the user, from capture_keyboard_events.js, should set the tabs and
        // get whether the tabs, any of which, has badges. This will allow the user
        // upon receiving the response from badges.js to show/hide the badges by the
        // setting the appropriate request.show element to true/false.
        if (request.getBadgeState)
        {
            chrome.tabs.query({windowId:chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
                var g_badgesOn = badges_on(tabs) || !g_extensionClicked; // Added !g_extensionClicked to make sure
                                                                         // that all browser instances will be in sync.
                sendResponse({on:g_badgesOn});
            });
        }
        else
        {
            g_badgesOn = request.show;
            chrome.tabs.query({windowId:chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
                for (var i = 0; i < tabs.length; ++i)
                {
                    var index = i + 1;
                    var new_title = getOriginal(tabs[i].title);
                    if (request.show)
                        new_title = "{" + index + "} - " + new_title;
                    chrome.tabs.sendRequest(tabs[i].id, {title:new_title});
                }
            });
        }
    });

chrome.tabs.onMoved.addListener(function(tabId, moveInfo)
    {
        chrome.tabs.query({windowId:chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
            // reset all the tab titles because of the inconsistency between
            // MAC and WINDOWS in which 
            //      WINDOWS: each move triggers an onMoved event
            //          MAC: only one onMoved event is triggered at the end
            //               of the move (so if you move from tab 6 to 1, only
            //               one onMoved is trigger, but in WINDOWS there are
            //               5 events that are triggered.
            for (var i = 0; i < tabs.length; ++i)
            {
                var index = i + 1;
                var new_title = getOriginal(tabs[i].title);
                if (g_badgesOn)
                    new_title = "{" + index + "} - " + new_title;
                chrome.tabs.sendRequest(tabs[i].id, {title:new_title});
            }
        });
    });

// ================================================================================== //
// =================================== UTILITIES ==================================== // 
// ================================================================================== //

function badges_on(tabs)
{
    for (var i = 0; i < tabs.length; ++i)
    {
        if (tabs[i].title != getOriginal(tabs[i].title))
            return true;
    }
    return false;
}

function getOriginal(title)
{
    if (title.match(/^\{\d*\} - /))
        return title.substr(6);
    return title;
}

function enableOrDisable()
{
    chrome.tabs.query({windowId:chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
        for (var i = 0; i < tabs.length; ++i)
        {
            var index = i + 1;
            var new_title = getOriginal(tabs[i].title);
            if (g_badgesOn)
                new_title = "{" + index + "} - " + new_title;
            chrome.tabs.sendRequest(tabs[i].id, {title:new_title, onBadge:g_badgesOn});
        }
    });
}

// add support for moving tabs out of pages, adding new tabs, and putting tabs into the 
// window
