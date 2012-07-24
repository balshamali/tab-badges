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
    alt_key: false
};
// This keeps track if we are waiting for a response from the background page
// since state is a little messed up when we send multiple events at once.
// To avoid a race condition.
var g_modifying = false;

// ================================================================================== //
// =============================== EVENT LISTENERS ================================== // 
// ================================================================================== //

function onKeyDown(e) {
    var key = e.which;
    if ((key !== g_CTRL_KEY && key !== g_ALT_KEY) || 
        (key === g_CTRL_KEY && badges_extension_keys.ctrl_key === true) ||
        (key === g_ALT_KEY  && badges_extension_keys.alt_key  === true)) {
            return; 
    }
    
    var forceRename = setKeyState(e.which, true);
    show_or_hide_badges(false, forceRename);
};
document.onkeydown = onKeyDown;

function onKeyUp(e)
{
    var forceRename = setKeyState(e.which, false, forceRename);
    show_or_hide_badges(false, true, forceRename);  
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
            // Reset g_modifying.
            // To avoid a race condition that will set back to the original state put
            // it in a setTimeout.
            setTimeout(function() {
                g_modifying = false;
            }, 350);
        }
        else
        {
            console.log("ERROR! Please email biscim@gmail.com to fix!!! -- ", request);
        }
    }
);

// ================================================================================== //
// =================================== UTILITIES ==================================== // 
// ================================================================================== //

function setKeyState(key, state)
{
    var forceRename = false;
    if (g_CTRL_KEY == key)
    {
        badges_extension_keys.ctrl_key = state;
        forceRename = true;
    }
    if (g_ALT_KEY == key)
        badges_extension_keys.alt_key = state;

    return forceRename;
}

function show_or_hide_badges(newTab, forceRename)
{
    // A little optimization: Only send a request if keys.ctrl_key or keys.alt_key
    // is true and we are not in the middle of a request. 'forceRename' will force
    // a send to the client when we have a ctrl-remove key (see setKeyState for more
    // details).
    if ((badges_extension_keys.ctrl_key || badges_extension_keys.alt_key || newTab || forceRename) && !g_modifying)
    {
        g_modifying = true;
        // Make sure we reset g_modifying in cases where it gets stuck (for example, this can happen when we keep
        // pressing on the ctrl key and then end up opening a new tab by pressing T).
        setTimeout(function() { g_modifying = false; }, 350);
        // console.log(newTab, "newTab", badges_extension_keys, "keys");
        chrome.extension.sendRequest({keys:badges_extension_keys, newTab:newTab});
    }
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
// Thus, we can execute show_or_hide_badges() immediately. I have tested this recently
// with opening a new tab pointing to www.google.com and it does *not* work. Seems like
// google.com is not executing the content script on load; or maybe they are doing something
// funny with their event handling logic? The tab renames after an extra tab is opened
// and navigated to a valid url (very strange).
// console.log("showing badges on new tab");
show_or_hide_badges(true, false);
