// background.js

// ================================================================================== //
// =============================== GLOBAL VARIABLES ================================= // 
// ================================================================================== //

var g_badgesOn = false;
var g_extensionClicked = false;

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
    // chrome.extension.getBackgroundPage().console.log("enableOrDisable called")
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

// ================================================================================== //
// =============================== EVENT LISTENERS ================================== // 
// ================================================================================== //

// This will toggle the state of the extension on/off. It will not disconnect
// from the document.onkeyup and document.onkeydown events since it is unneccessary.
chrome.browserAction.onClicked.addListener(
    function(tab) {
        g_extensionClicked = g_extensionClicked ? false : true;
        g_badgesOn = g_extensionClicked;
        var setIconPath = g_extensionClicked ? "images/icon.png" : "images/off.png";

        chrome.browserAction.setIcon({
            path: setIconPath
        });
        // chrome.extension.getBackgroundPage().console.log("enabling or disabling based on: ", g_extensionClicked);
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
                                                                         // This is because if we have badges and open a new tab
                                                                         // then disable the extension the first window's state
                                                                         // will be governed by the new g_extensionClicked variable.
                sendResponse({on:g_badgesOn});
            });
        }
        else if (request.newTab)
        {
            // New tab connected - show badge based on g_extensionClicked
            if (g_extensionClicked)
            {
                chrome.tabs.getCurrent(function(currentTab) {
                    sendResponse({on:false});
                });
            }
        }
        else if (request.show)
        {
            g_badgesOn = request.show;
            // Can't query chrome.tabs.getCurrent since it will return undefined from
            // background pages.
            enableOrDisable();
        }
        else
        {
            // Send true (to hide badges) if the response is unknown.
            g_badgesOn = false;
            enableOrDisable();
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

// TODO :
// add support for moving tabs out of pages, and putting tabs into the 
// window