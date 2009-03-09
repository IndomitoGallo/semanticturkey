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

function startup1() {
	_printToJSConsole("startup");
	gBrowser = document.getElementById('content');
	var doc = gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex).contentDocument;
	findText2(doc);
}

// var regex = new RegExp("[ a-z0-9]*[+]*[0-9]+[.]*[0-9]+[.]*[0-9]+[.]*[0-9]+[
// a-z0-9]*");

function findText2(doc) {
	var childNodes = doc.childNodes;
	// var regex = new RegExp("[ a-z0-9]*12:[ a-z0-9]*");
	// var regex = new RegExp("[ a-z0-9]*06[ a-z0-9]*");
	var regex = new RegExp("[ a-z0-9]*Roma[ a-z0-9]*");
	// var regex = new RegExp("[
	// a-z0-9]*[+]*[0-9]+[.]*[0-9]{4,}[.]*[0-9]+[.]*[0-9]+[ a-z0-9]*");
	for (var i = 0; i < childNodes.length; i++) {
		// _printToJSConsole("name: " + childNodes[i].nodeName);
		if (childNodes[i].nodeType == 1) {
			findText2(childNodes[i]);
		}
		if (childNodes[i].nodeType == 3) {
			_printToJSConsole("value: " + childNodes[i].nodeValue);
			var tokens = childNodes[i].nodeValue.split(' ');
			for (var j = 0; j < tokens.length; j++) {
				if (tokens[j] != null) {
					if (regex.test(tokens[j])) {
						// _printToJSConsole("nodeValue: " +
						// childNodes[i].nodeValue);
						var temp = childNodes[i].nodeValue.split(tokens[j]);

						// _printToJSConsole("length: " + temp.length);

						var parentNode = childNodes[i].parentNode;
						parentNode.removeChild(childNodes[i]);

						var textNode1 = document.createTextNode(temp[0]);
						parentNode.appendChild(textNode1);

						var newSpan = document.createElement("div");
						newSpan
								.setAttribute("style",
										"background-color:yellow");

						var textNode2 = document.createTextNode(tokens[j]);
						newSpan.appendChild(textNode2);

						parentNode.appendChild(newSpan);

						if (temp[1] != null) {
							var textNode3 = document.createTextNode(temp[1]);
							parentNode.appendChild(textNode3);
						}

						var k = 2;
						if (k < temp.length) {
							while (k < temp.length) {
								_printToJSConsole("temp: " + temp[k]);
								var newSpan = document.createElement("div");
								newSpan.setAttribute("style",
										"background-color:yellow");

								var textNode2 = document
										.createTextNode(tokens[j]);
								newSpan.appendChild(textNode2);

								parentNode.appendChild(newSpan)

								var textNode = document.createTextNode(temp[k]);
								parentNode.appendChild(textNode);

								k++;
							}
						}
					}
				}
			}
		}
	}
}
