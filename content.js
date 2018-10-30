// By default, Chrome injects content scripts after the DOM is complete.

// var firstHref = $("a");
// console.log(" >> ", firstHref);

// console.log(" >>>> The first link on the site is: " , firstHref);
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      startCrawlAndSpellCheck();
    }
  }
);

var masterLinks = {};

// var level1hyperlinks = {};
// var level2hyperlinks = {};

// var level1pages = [];

var wrongWords = {};

var checkValue = function(value){
  return masterLinks[value] === true;
};

// var checkValue = function(value){
//   return level1hyperlinks[value] === true;
// };

// var checkValue2 = function(value){
//   return level2hyperlinks[value] === true;
// };

function populateFirstLinks() {
	console.log("Populating first links ... ");
	var links = [];
   $("a").each(function () {
   		// if ( !checkValue(this.href) && this.href !== "" && /^http/.test(this.href)) {
   		if ( !checkValue(this.href) && this.href !== "") {
     	 	masterLinks[this.href] = true;
     	 	links.push(this.href);
      	}
   });
   return links;
}

// async function getPages(level) {
// 	if ( level === 1 ) {
// 		await getPagesFromLinks(level1hyperlinks);
// 	}else if ( level === 2 ) {
// 		await getPagesFromLinks(level2hyperlinks);
// 	}
// }

// // param:
// // hyperlinks = { link1 : true, link2 : true .... }
// function getPagesFromLinks(hyperlinks) {
// 	var keys = Object.keys(hyperlinks);
// 	console.log(" Keys: " , keys);
// 	var arrayLength = keys.length;
// 	jQuery.ajaxSetup({async:false});
// 	for (var i = 0; i < arrayLength; i++) {
// 	    $.get(keys[i], function(response) {
// 		  // console.log("Nested: ", response);
// 		  // console.log($(response).text());
// 		  // getText($(response).text());
// 		  level1pages.push(response);
// 		});	
// 	}
// 	// console.log("Pages: ", pages);
// 	// for ( key in keys ) {
// 	// 	$.get(key, function(response) {
// 	// 	  console.log("Nested: ", response);
// 	// 	});	
// 	// }
// }

// // param:
// // pages = [page1, page2, page3]
// function getLinksFromPages(pages) {
// 	console.log("Getting links from pages: ")
// 	var arrayLength = pages.length;
// 	for (var i = 0; i < arrayLength; i++) {
// 		console.log("Page: ", pages[i]);
// 	    // level2hyperlinks = get 'a' from each page
// 	    console.log(" $Page : ", $(pages[i]) );
// 	 //    var xmlString = $(pages[i])
// 		//   , parser = new DOMParser()
// 		//   , doc = parser.parseFromString(xmlString, "text/html");
// 		// // doc.firstChild // => <div id="foo">...
// 		// // doc.firstChild.firstChild
// 	 //    console.log(" HREFS: ", doc.getElementById("a"));
// 	 	console.log(" HREFS: ", $(pages[i]).find("a").each(function() {
// 	   		// if ( !checkValue(this.href) && this.href !== "" && /^http/.test(this.href)) {
// 	   		if ( !checkValue2(this.href) && this.href !== "") {
// 	     	 	level2hyperlinks[this.href] = true;
// 	      	}
// 	 	}));
// 	}
// }

// given an array of words, checks spelling
function checkSpelling(words) {
	jQuery.ajaxSetup({async:true});
	var arrayLength = words.length;
	for (var i = 0; i < arrayLength; i++) {
		console.log("Spell check request for : ", words[i] );
		var url = "https://montanaflynn-spellcheck.p.mashape.com/check/?text=" + words[i];
		$.ajax({
			url : url,
			headers: {
				'X-Mashape-Key': 'hDfsEEqDv3mshzPZjtCLOOkShOWEp137R4XjsnreB38IHnFhkL',
				'Accept': 'application/json'
			},
			method: 'GET',
			success: function(data, textStatus, xhr) {
		        if ( xhr.status === 200 ) {
		        	console.log("Data: ", data);
		        	populateError(data);
		        }
		    },
		    error: function(jqXHR, exception) {
	            if (jqXHR.status === 0) {
	                console.log('Not connect.\n Verify Network.');
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
	console.log("Keys: ", keys);
	var numberOfKeys = keys.length;
	for ( var i = 0; i < numberOfKeys; i++ ) {
		console.log("Key: ", keys[i]);
		wrongWords[keys[i]] = data['corrections'][keys[i]][0];
		console.log("Wrong words: ", wrongWords);
	}
}
// // get words from the page text and checks spelling
// function getText(currentPageText) {
// 	console.log("Current page: ", currentPageText);
// 	// var html = currentPage;
// 	// var usingHtmlPage = currentPage.getElementById("paragraph").innerHTML;
// 	// var x = $('p').text();
// 	// console.log("p tags: ", x);
// 	// console.log("using html: ", usingHtmlPage);
// 	var r = /([a-zA-Z]+)/g;
// 	var parsed = currentPageText.match(r);
// 	console.log(parsed);
// 	checkSpelling(parsed);
// }

function solve(links) {
	getPages(links, 1);
}

function getPages(hyperlinks, level) {
	if ( level <= 2 ) {
		console.log("Currently parsing level: ", level);
		var numberOfLinks = hyperlinks.length;
		// jQuery.ajaxSetup({async:false});
		for (var i = 0; i < numberOfLinks; i++) {
		    $.get(hyperlinks[i], function(response) {
				spellCheck($(response).text());
				var newLinks = getLinksFromPage(response);
				getPages(newLinks, level+1);
			});	
		}
	}
}

function spellCheck(page) {
	var r = /([a-zA-Z]+)/g;
	var words = page.match(r);
	console.log(words);
	var queries = createQueriesFromWords(words);
	console.log("Queries: ", queries);
	checkSpelling(queries);
}

function getLinksFromPage(page) {
	var links = [];
	$(page).find("a").each(function() {
	   	// if ( !checkValue(this.href) && this.href !== "" && /^http/.test(this.href)) {
	   	if ( !checkValue(this.href) && this.href !== "") {
	     	masterLinks[this.href] = true;
	     	links.push(this.href);
	    }
	});
	console.log("New Links: ", links);
	return links;
}

function createQueriesFromWords(words) {
	const limit = 1000;
	var length = words.length;
	if ( length < 1 ) {
		return [];
	}
	var queries = [];
	var currentLength = words[0].length;
	var currentQuery = words[0];
	for ( var i = 1; i < length; i++ ) {
		var wordLength = words[i].length;
		if ( (currentLength + wordLength) > limit ) {
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

function startCrawlAndSpellCheck(event) {
	// console.log(">>> TRIGGERED: ");
	masterLinks = {};
	wrongWords = {};
	var firstLinks = populateFirstLinks();
	// console.log("First Links: ", firstLinks);
	// console.log("Master Links: ", masterLinks);

	solve(firstLinks);
}
// // get all links (second level) in the first page
// getAllLinks();

// getPages(1).then(function whenOk() {
// 	console.log("level1pages: " ,level1pages);
// 	getLinksFromPages(level1pages);
// 	console.log("level2links : ", level2hyperlinks);
// });

// // spell checks on the home page
// // getText($('html').text());


// console.log(" >> " , level1hyperlinks);
// console.log("Document: ", document);
// document.getElementById('trigger').addEventListener('click', triggered);