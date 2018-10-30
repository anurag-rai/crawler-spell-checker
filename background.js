var ports = {};

chrome.runtime.onConnect.addListener(function(port) {
    if (port.name == "fromcontent") {
        ports['fromcontent'] = port;
        port.onMessage.addListener(function(msg) {
            // console.log(" ]]  Background.js : Msg: ", msg);
            // if (msg.joke == "Knock knock") {
            //     port.postMessage({
            //         question: "Who's there?"
            //     });
            // } else if (msg.action == "Add") {
            //     // ports['frompopup'].postMessage({action: "store"});
            // }
            if ( msg.action == "Add" ) {
              ports['frompopup'].postMessage({action: "store", key: msg.key, value: msg.value});
            }
        });
    } else if (port.name == "frompopup") {
      ports['frompopup'] = port;
    }
});