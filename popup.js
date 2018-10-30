// 'use strict';

function triggered(event) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	    var activeTab = tabs[0];
	    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
	  });
}

document.getElementById('trigger').addEventListener('click', triggered);