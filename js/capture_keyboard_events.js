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
    show_or_hide_badges();
};
document.onkeydown = onKeyDown;

function onKeyUp(e)
{
    setKeyState(e.which, false);
    show_or_hide_badges();  
}
document.onkeyup = onKeyUp;

chrome.extension.onRequest.addListener(
    function(request, sender) {
        if (request.title)
            // This is done because of a bug in which there needs to be 
            // some delay in setting the title to something else.
            setTimeout(function() {
                changeTitle(request);
            }, 500);
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

function show_or_hide_badges()
{
    if (badges_extension_keys.ctrl_key == true && badges_extension_keys.shift_key == true)
    {   
        chrome.extension.sendRequest({getBadgeState:true}, function(response) {
            g_badges = response.on;
            console.log(response.on);
            do_show_or_hide_badges();
        });
     }
}

function do_show_or_hide_badges()
{
    if (!g_badges)
        show_badges();
    else
        hide_badges();
}

function show_badges()
{
    chrome.extension.sendRequest({state:false, show:true});
}

function hide_badges()
{
    chrome.extension.sendRequest({state:false, show:false});
}

function changeTitle(request)
{
    document.title = request.title;
}