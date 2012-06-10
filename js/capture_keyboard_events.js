// capture_keyboard_events.js

// This is injected into all urls to capture keyboard events
// and send a message to badges_background.js (the background running
// script) to display badges on the tabs.

// ================================================================================== //
// =============================== GLOBAL VARIABLES ================================= // 
// ================================================================================== //

var g_CTRL_KEY = 17;
var g_ALT_KEY = 18;
var badges_extension_keys = {
    ctrl_key: false,
    shift_key: false
};
var g_badges = false;

// ================================================================================== //
// =============================== EVENT LISTENERS ================================== // 
// ================================================================================== //

function onKeyDown(e) {
    setKeyState(e.which, true);
    show_or_hide_badges(false, true);
};
document.onkeydown = onKeyDown;

function onKeyUp(e)
{
    setKeyState(e.which, false);
    show_or_hide_badges(false, true);  
}

document.onkeyup = onKeyUp;

chrome.extension.onRequest.addListener(
    function(request, sender) {
        // console.log("received request: ", request)
        if (request.title)
        {
            // This is done because of a bug in which there needs to be 
            // some delay in setting the title to something else.
            // console.log("setting timeout to change title to %s", request.title);
            setTimeout(function() {
                changeTitle(request);
            }, 500);
        }
        else
            console.log("ERROR! Please email biscim@gmail.com to fix!!! -- ", request);

        // Now check if the badge extension has been clicked to turn off the 
        // connections to the keyup and keydown or viceversa. 
        /* Adding this will cause issues with multiple browser instances!
        if (request.onBadge != undefined)
        {
            if (request.onBadge)
            {
                document.onkeyup = onKeyUp;
                document.onkeydown = onKeyDown;
            }
            else
            {
                document.onkeyup = null;
                document.onkeydown = null;
            }
        }
        */
    }
);

// ================================================================================== //
// =================================== UTILITIES ==================================== // 
// ================================================================================== //

function setKeyState(key, state)
{
    if (g_CTRL_KEY == key)
        badges_extension_keys.ctrl_key = state;
    if (g_ALT_KEY == key)
        badges_extension_keys.shift_key = state;
}

function show_or_hide_badges(newTab, allTabs)
{
    // The request to send to the background script - 'badges.js'.
    var request = {};
    if (newTab)
        request.newTab = true;
    else if (badges_extension_keys.ctrl_key == true && badges_extension_keys.shift_key == true)
        request.getBadgeState = true;
    else
        return;

    // Send the request and show or hide badges based on the response. 
    // console.log("sending newtab message, ", request)
    chrome.extension.sendRequest(request, function(response) {
        // console.log("got response ", response);
        g_badges = response.on;
        do_show_or_hide_badges(allTabs);
    });
}

function do_show_or_hide_badges(allTabs)
{
    if (!g_badges)
        show_badges(allTabs);
    else
        hide_badges(allTabs);
}

function show_badges(allTabs)
{
    // console.log("show_badges, allTabs: ", allTabs)
    chrome.extension.sendRequest({show:true, allTabs:allTabs}, function(response){
        // console.log("response from show_badges method: ", response);
        setTimeout(function() {
            changeTitle(request);
        }, 500);
    });
}

function hide_badges(allTabs)
{
    // console.log("hide_badges")
    chrome.extension.sendRequest({show:false, allTabs:allTabs});
}

function changeTitle(request)
{
    document.title = request.title;
}

// ================================================================================== //
// =============================== INITALIZATION ==================================== // 
// ================================================================================== //

// Dont' need to listen to document.onready or window.onload since these events
// are fired before the content script 'capture_keyboard_events.js' is loaded.
// Thus, we can execute do_show_or_hide_badges() immediately.
show_or_hide_badges(true, false);