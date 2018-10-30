// By default, Chrome injects content scripts after the DOM is complete.
var port = chrome.runtime.connect({
    name: "fromcontent"
});

port.onMessage.addListener(function(msg) {
    console.log(" ]] Content.js received message on port. Message: ", msg);
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "startCrawlerAndSpellCheck") {
            startCrawlAndSpellCheck();
        }
    }
);

var masterLinks = {};
var wrongWords = {};

var checkValue = function(value) {
    return masterLinks[value] === true;
};

function validateHyperlink(link) {
    if (!checkValue(link) && link !== "" && ((/^http/.test(link)) || (/^\//.test(link)) || (/^file/.test(link)))) {
        return true;
    }
    return false;
}

function startCrawlAndSpellCheck(event) {
    masterLinks = {};
    wrongWords = {};
    var firstLinks = populateFirstLinks();
    solve(firstLinks);
}

function populateFirstLinks() {
    var links = [];
    $("a").each(function() {
        if (validateHyperlink(this.href)) {
            masterLinks[this.href] = true;
            links.push(this.href);
        }
    });
    return links;
}

function solve(links) {
    getPages(links, 1);
}

function getPages(hyperlinks, level) {
    if (level <= 2) {
        var numberOfLinks = hyperlinks.length;
        for (var i = 0; i < numberOfLinks; i++) {
            $.get(hyperlinks[i], function(response) {
                spellCheck($(response).text());
                var newLinks = getLinksFromPage(response);
                getPages(newLinks, level + 1);
            });
        }
    }
}

function getLinksFromPage(page) {
    var links = [];
    $(page).find("a").each(function() {
        if (validateHyperlink(this.href)) {
            masterLinks[this.href] = true;
            links.push(this.href);
        }
    });
    return links.slice(0, 4);	//shallow copy
}

function spellCheck(page) {
    var r = /([a-zA-Z]+)/g;
    var words = page.match(r);
    var queries = createQueriesFromWords(words);
    checkSpelling(queries);
}

function createQueriesFromWords(words) {
    const limit = 1000;
    var length = words.length;
    if (length < 1) {
        return [];
    }
    var queries = [];
    var currentLength = words[0].length;
    var currentQuery = words[0];
    for (var i = 1; i < length; i++) {
        var wordLength = words[i].length;
        if ((currentLength + wordLength) > limit) {
            queries.push(currentQuery);
            currentQuery = words[i];
            currentLength = 0;
        } else {
            currentQuery += " " + words[i];
        }
        currentLength += words[i].length;
    }
    queries.push(currentQuery);
    return queries;
}

// given an array of words, checks spelling
function checkSpelling(words) {
    jQuery.ajaxSetup({
        async: true
    });
    var arrayLength = words.length;
    for (var i = 0; i < arrayLength; i++) {
        var url = "https://montanaflynn-spellcheck.p.mashape.com/check/?text=" + words[i];
        $.ajax({
            url: url,
            headers: {
                'X-Mashape-Key': 'hDfsEEqDv3mshzPZjtCLOOkShOWEp137R4XjsnreB38IHnFhkL',
                'Accept': 'application/json'
            },
            method: 'GET',
            success: function(data, textStatus, xhr) {
                if (xhr.status === 200) {
                    populateError(data);
                }
            },
            error: function(jqXHR, exception) {
                if (jqXHR.status === 0) {
                    console.log('Not connected.\n Verify Network.');
                } else if (jqXHR.status == 404) {
                    console.log('Requested page not found. [404]');
                } else if (jqXHR.status == 500) {
                    console.log('Internal Server Error [500].');
                } else if (exception === 'parsererror') {
                    console.log('Requested JSON parse failed.');
                } else if (exception === 'timeout') {
                    console.log('Time out error.');
                } else if (exception === 'abort') {
                    console.log('Ajax request aborted.');
                } else {
                    console.log('Uncaught Error.\n' + jqXHR.responseText);
                }
            }
        })
    }
}

function populateError(data) {
    var keys = Object.keys(data['corrections']);
    var numberOfKeys = keys.length;
    for (var i = 0; i < numberOfKeys; i++) {
        wrongWords[keys[i]] = data['corrections'][keys[i]][0];
        port.postMessage({
            action: "Add",
            key: keys[i],
            value: data['corrections'][keys[i]][0]
        });
    }
}