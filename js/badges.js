// background.js

// ================================================================================== //
// =============================== GLOBAL VARIABLES ================================= // 
// ================================================================================== //

var g_badgesType = {
    PERSISTENT: 0, // Toggle badge state when ctrl-alt clicked and keep persistent.
    TEMPORARY: 1,  // Bring up badges when ctrl is pressed and stays pressed.
    NONE: 2,       // Disable badges.
    MAX: 3         // For reference.
}
var g_extensionClicked = getBadgeState();

// ================================================================================== //
// =================================== UTILITIES ==================================== // 
// ================================================================================== //

function storeBadgeState(state) {
    if (typeof(localStorage) == 'undefined' ) {
        console.log('Can\'t store badge state for next session. Your browser does not support HTML5 localStorage. Try upgrading.');
    } else {
        try {
            localStorage.setItem("badgeState", state);
        } catch (e) {
            if (e == QUOTA_EXCEEDED_ERR) {
                //data wasn’t successfully saved due to quota exceed so throw an error
                console.log('Local Storage quota exceeded! - contact biscim@gmail.com.');
            }
        }
    }
}

function getBadgeState() {
    var state = g_badgesType.NONE
    if (typeof(localStorage) == 'undefined' ) {
        console.log('Can\'t get badge state. Your browser does not support HTML5 localStorage. Try upgrading.');
    } else {
        state = localStorage.getItem("badgeState") || g_badgesType.NONE;
        // console.log("state is ", state);
    }

    return state;
}

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

function enableOrDisable(keys, newTab)
{
    chrome.tabs.query({windowId:chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
        var show_badge = badges_on(tabs);
        switch (g_extensionClicked)
        {
            case g_badgesType.PERSISTENT:
            {
                // console.log(keys, "persistent");
                if (true === keys.ctrl_key && true === keys.alt_key)
                    show_badge = !show_badge;
                break;
            }
            case g_badgesType.TEMPORARY:
            {
                // console.log(keys, "temporary");
                if (keys.ctrl_key == show_badge)
                    return; // avoid changing the state and sending a message if we don't have to
                else if (keys.ctrl_key)
                    show_badge = true;
                else
                    show_badge = false;
                break;
            }
            case g_badgesType.NONE:
            default:
                // console.log(keys, "none");
                return; // return if we don't know what state we're in
                        // This should never be reached.
                break;
        }

        // console.log(show_badge, "show_badge");
        for (var i = 0; i < tabs.length; ++i)
        {
            var index = i + 1;
            var new_title = getOriginal(tabs[i].title);
            if (show_badge)
                new_title = "{" + index + "} - " + new_title;
            chrome.tabs.sendRequest(tabs[i].id, {title:new_title});
        }
        g_modifying = false;
    });
}

// ================================================================================== //
// =============================== EVENT LISTENERS ================================== // 
// ================================================================================== //

// This will toggle the state of the extension on/off. It will not disconnect
// from the document.onkeyup and document.onkeydown events since it is unneccessary.
chrome.browserAction.onClicked.addListener(
    function(tab) {
        g_extensionClicked = (g_extensionClicked + 1 < g_badgesType.MAX) ? g_extensionClicked + 1 : g_badgesType.PERSISTENT;
        // Store the badgeState on the window's localStorage so that we can persist the state of
        // the user for the next time he opens Chrome.
        storeBadgeState(g_extensionClicked);
        var setIconPath = "images/off.png";
        var keys = {};
        switch (g_extensionClicked)
        {
            case g_badgesType.PERSISTENT:
                setIconPath = "images/icon.png";
                keys = {ctrl_key:true, alt_key:true};
                break;
            case g_badgesType.TEMPORARY:
                setIconPath = "images/temporary.png";
                break;
            case g_badgesType.NONE:
            default:
                setIconPath = "images/off.png";
                break;
        }
        chrome.browserAction.setIcon({
            path: setIconPath
        });
        enableOrDisable(keys, false);
    });

chrome.extension.onRequest.addListener(
    function(request, sender) {
        enableOrDisable(request.keys, request.newTab);
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
            var show_badge = badges_on(tabs)
            for (var i = 0; i < tabs.length; ++i)
            {
                var index = i + 1;
                var new_title = getOriginal(tabs[i].title);
                if (show_badge)
                    new_title = "{" + index + "} - " + new_title;
                chrome.tabs.sendRequest(tabs[i].id, {title:new_title});
            }
        });
    });

// TODO :
// add support for moving tabs out of pages, and putting tabs into the 
// window