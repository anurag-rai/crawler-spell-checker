// 'use strict';

// function calculate(event) {
//   let minutes = parseFloat(event.target.value);
//   chrome.browserAction.setBadgeText({text: 'ON'});
//   chrome.alarms.create({delayInMinutes: minutes});
//   chrome.storage.sync.set({minutes: minutes});
//   window.close();
// }

// function clearAlarm() {
//   chrome.browserAction.setBadgeText({text: ''});
//   chrome.alarms.clearAll();
//   window.close();
// }

// //An Alarm delay of less than the minimum 1 minute will fire
// // in approximately 1 minute incriments if released
// document.getElementById('trigger').addEventListener('click', setAlarm);

function triggered(event) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	    var activeTab = tabs[0];
	    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
	  });
}

document.getElementById('trigger').addEventListener('click', triggered);