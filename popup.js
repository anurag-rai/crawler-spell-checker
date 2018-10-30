// 'use strict';

var port = chrome.runtime.connect({
    name: "frompopup"
});

port.onMessage.addListener(function(msg) {
    if (msg.action == 'store') {
        addToTable(msg.key, msg.value);
    }
});

function triggered(event) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
            "message": "startCrawlerAndSpellCheck"
        });
    });
}

function addToTable(key, value) {
    var table = document.getElementById("resultTable");
    var row = table.insertRow(1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = key;
    cell2.innerHTML = value;
}


document.getElementById('trigger').addEventListener('click', triggered);