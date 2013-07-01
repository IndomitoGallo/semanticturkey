/*
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 * 
 * The Original Code is SemanticTurkey.
 * 
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2007.
 * All Rights Reserved.
 * 
 * SemanticTurkey was developed by the Artificial Intelligence Research Group
 * (art.uniroma2.it) at the University of Roma Tor Vergata (ART) Current
 * information about SemanticTurkey can be obtained at
 * http://semanticturkey.uniroma2.it
 * 
 */
if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};
/*
 * This is the function that actually highlights a text string by adding HTML
 * tags before and after all occurrences of the search term. You can pass your
 * own tags if you'd like, or if the highlightStartTag or highlightEndTag
 * parameters are omitted or are empty strings then the default <font> tags will
 * be used.
 */
art_semanticturkey.doHighlight= function(bodyText, searchTerm, highlightStartTag, highlightEndTag) {
	// the highlightStartTag and highlightEndTag parameters are optional
	if ((!highlightStartTag) || (!highlightEndTag)) {
		highlightStartTag = "<font style='color:blue; background-color:yellow;'>";
		highlightEndTag = "</font>";
	}

	// find all occurences of the search term in the given text,
	// and add some "highlight" tags to them (we're not using a
	// regular expression search, because we want to filter out
	// matches that occur within HTML tags and script blocks, so
	// we have to do a little extra validation)
	var newText = "";
	var i = -1;
	var lcSearchTerm = searchTerm.toLowerCase();
	var lcBodyText = bodyText.toLowerCase();

	while (bodyText.length > 0) {
		i = lcBodyText.indexOf(lcSearchTerm, i + 1);
		if (i < 0) {
			newText += bodyText;
			bodyText = "";
		} else {
			// skip anything inside an HTML tag
			if (bodyText.lastIndexOf(">", i) >= bodyText.lastIndexOf("<", i)) {
				// skip anything inside a <script> block
				if (lcBodyText.lastIndexOf("/script>", i) >= lcBodyText
						.lastIndexOf("<script", i)) {
					newText += bodyText.substring(0, i) + highlightStartTag
							+ bodyText.substr(i, searchTerm.length)
							+ highlightEndTag;
					bodyText = bodyText.substr(i + searchTerm.length);
					lcBodyText = bodyText.toLowerCase();
					i = -1;
				}
			}
		}
	}

	return newText;
};

/*
 * This is sort of a wrapper function to the doHighlight function.
 * It takes the searchText that you pass, optionally splits it into
 * separate words, and transforms the text on the current web page.
 * Only the "searchText" parameter is required; all other parameters
 * are optional and can be omitted.
 */
art_semanticturkey.highlightSearchTerms= function(searchText, treatAsPhrase, warnOnFailure,
		highlightStartTag, highlightEndTag) {
	// if the treatAsPhrase parameter is true, then we should search for
	// the entire phrase that was entered; otherwise, we will split the
	// search string so that each word is searched for and highlighted
	// individually
	var searchArray;
	if (treatAsPhrase) {
		searchArray = [searchText];
	} else {
		searchArray = searchText.split(" ");
	}
	// NScarpato
	var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1']
			.getService(Components.interfaces.nsIWindowMediator);
	var topWindowOfType = windowManager
			.getMostRecentWindow("navigator:browser");
	var tabWin = topWindowOfType.gBrowser.selectedBrowser.currentURI.spec;
	var contentDocument = topWindowOfType.gBrowser.selectedBrowser.contentDocument;

	if (!contentDocument.body
			|| typeof(contentDocument.body.innerHTML) == "undefined") {
		if (warnOnFailure) {
			alert("Sorry, for some reason the text of this page is unavailable. Searching will not work.");
		}
		return false;
	}

	var bodyText = contentDocument.body.innerHTML;
	for (var i = 0; i < searchArray.length; i++) {
		bodyText = art_semanticturkey.doHighlight(bodyText, searchArray[i], highlightStartTag,
				highlightEndTag);
	}

	contentDocument.body.innerHTML = bodyText;
	return true;
};
