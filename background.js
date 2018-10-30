var ports = {};

chrome.runtime.onConnect.addListener(function(port) {
    if (port.name == "fromcontent") {
        ports['fromcontent'] = port;
        port.onMessage.addListener(function(msg) {
            if (msg.action == "Add") {
                ports['frompopup'].postMessage({
                    action: "store",
                    key: msg.key,
                    value: msg.value
                });
            }
        });
    } else if (port.name == "frompopup") {
        ports['frompopup'] = port;
    }
});