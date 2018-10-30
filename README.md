# Crawler Spell Checker

A <b>chrome extention</b> that crawls web-pages up to two levels deep and spell-checks each site giving a result of misspelled words and its best suggestion using an external API.

## Installation

1. Download the source code.

2. Open `chrome://extensions/` in a tab.

3. Switch to `developer mode` in the top-right corner.

4. Click on `Load unpacked`and select the project directory downloaded in step 1.
5. `Spelling checking crawler 1.0` should now be listed as an extension.

## Usage

You should see a blue water droplet icon in the Chrome toolbar.

Please read limitations before using the extension.

For ease of use, please test the plugin using the HTML files provided in the source code. The HTML files have an inherent link to themselves and misspelled words.

Load the `1-a.html` file into the browser and start the plugin and click on "Trigger Crawl and Spell Check" button


## Limitations

1. Spell-check is implemented using an <b>external API</b> hence sometimes results can be <b>slow</b>, and sometimes results are not guaranteed to arrive. (Handled by sending multiple word queries to the API. Restricted by the limit of query parameter length)
2. Crawling can hog memory since it has to `GET` the web-page. (Handled by enforcing a limit on the number of links per page)
3. Words for the spell check are derived from the `.text()` property of the DOM. If the words on the page are created dynamically or are populated in a non-static approach, the words will also consist of HTML and Javascript keywords which are not handled while parsing.

## Architecture

Ports are opened for duplex communication and message passing.

`popup.js` has a port connection with `background.js`.

`content.js` has a port connection with `background.js` to pass messages to `popup`.

The button on `popup` will trigger the crawl and spell check on `content`. The whole architecture is <b> asynchronus</b> and the result table in the `popup` will be <b> dynamically populated</b> when the results arrive from the API.

