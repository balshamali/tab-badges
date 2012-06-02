Chrome Extension: Tab Badges for Chrome Tabs
============================================

Description
-----------
This extension adds number badges to tabs when CTRL-ALT is pressed.
Tabs a great resource that let you have all your pages consolidated into one window. However, tabs get tedious to navigate when there are a lot open. This extension will add number badges to the tabs' title as such: " {#} - original_title ". The purpose of the number badges is to easily identify the index of the tab you would like to navigate to by using keyboard shortcuts, such as CMD-# on MAC and CTRL-# on WINDOWS. 

To use this extension: from the chrome web store
------------------------------------------------
1. Download the extension. (search for tab badges)
2. Open a couple of tabs and navigate to web pages.
3. Click on the badge icon next to the address bar to enable tab badges.
4. Press CTRL-ALT while on any of the tabs to toggle state of badges on all tabs.
5. Click on the badge icon next to the address bar to disable tab badges if you want to disable CTRL-ALT to toggle badge state.
Tab badge states can be toggled. If you press CTRL-ALT while the badges are not visible, they will be displayed. If the badges are visible, they will be hidden. 
Note: This extension only works on tabs that have a web page loaded (so if you create a new tab but do not navigate to a website, CTRL-ALT will not show badges on that page).
Also make sure to close the open tabs before downloading the extension to have badges show up on them :)

To use this extension: from the source code
-------------------------------------------
1. Download the source code.
2. Go to chrome address bar and type in: `chrome://extensions`
3. Click on 'Load Unpacked Extension'
4. Navigate to the source directory and choose ok. The extension will be loaded.

Further development
-----------------------------
Please let me know if you would like to add anything to this extension! I would be glad to help out. Feel free to email me at biscim@gmail.com

Improvements
------------

Version 1.1 :
The badge state is disabled initially as indicated by a red badge color. To enable click on the extension, changing its color to the original black badge. Then the alt-ctrl keys are activated to toggle between badged and unbadged tab titles. Remember, to activate click on the *extension* (the black badge next to the address bar). To disable re-click on the extension.

Version 1.2 :
Bug Fix: When multiple instances of browser windows are open, turning the extension off/on may or may not disable/enable the keyboard shortcut (ctrl-alt) to show/hide badges in other windows. Now, if the extension is off or on, all browser windows will have the same behavior.

Additions to consider
---------------------

1. Make tab badges persistent as you refresh pages and open new pages.
