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

function examplePageLoad(event) {
	if (event.originalTarget instanceof HTMLDocument) {
		if (event.originalTarget.defaultView.frameElement) {
			// var doc = event.originalTarget;
			doc = event.originalTarget;
			while (doc.defaultView.frameElement) {
				doc = doc.defaultView.frameElement.ownerDocument;
			}
			// Frame within a tab was loaded. doc is the root document of the
			// frameset
		} else {
			// var doc = event.originalTarget;
			doc = event.originalTarget;
			var list = doc.getElementsByTagName("div");
			// findText(doc);

			// httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=annotation&urlPage="
			// + ciao, false);

			_printToJSConsole("doc: "
					+ gBrowser.selectedBrowser.currentURI.spec);
			_printToJSConsole("list: " + list.length);

			var url = gBrowser.selectedBrowser.currentURI.spec;
			//url = url.replace("&", "%26");
			httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=annotation&request=chkAnnotations&urlPage="
					+ encodeURIComponent(url));
		}
	}
}

var annotations;

var doc;

function getCurrentDocument() {
	return doc;
}

function getannotations() {
	return annotations;
}

gBrowser = document.getElementById('content');

// During initialisation
gBrowser.addEventListener("load", examplePageLoad, true);

function active(act) {
	var statusIcon = document.getElementById("status-bar-sample-1");
	if (act == "yes") {
		statusIcon.collapsed = false;
	} else {
		statusIcon.collapsed = true;
	}
}

function viewAnnotationOnPage() {
	/*_printToJSConsole("viewAnnotationOnPage");
	// NScarpato add highlith for all occurence of annotations
	// findTextannotation(currentdoc, annotationValue);
	var url = gBrowser.selectedBrowser.currentURI.spec;
	url = url.replace("&", "%26");
	httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=annotation&request=getPageAnnotations&urlPage="
			+ encodeURIComponent(url));*/
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
		var defaultAnnotFun = prefs.getCharPref("extensions.semturkey.extpt.annotate");
		var annComponent = Components.classes["@art.info.uniroma2.it/semanticturkeyannotation;1"]
			.getService(Components.interfaces.nsISemanticTurkeyAnnotation);
		AnnotFunctionList=annComponent.wrappedJSObject.getList();
		if( AnnotFunctionList[defaultAnnotFun] != null){
			AnnotFunctionList[defaultAnnotFun][1]();
		}else{
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
			prompts.alert(null,defaultAnnotFun+" annotation type not registered ",defaultAnnotFun+" not registered annotation type reset to bookmarking");
			prefs.setCharPref("extensions.semturkey.extpt.annotate","bookmarking");
		}
		
}

// When no longer needed
// gBrowser.removeEventListener("load", examplePageLoad, true);

/*
 * function findText(doc) { var childNodes = doc.childNodes; var regex = new
 * RegExp("[ a-z0-9]*sufficiente[ a-z0-9]*"); for (var i = 0; i <
 * childNodes.length; i++) { //_printToJSConsole("name: " +
 * childNodes[i].nodeName); if (childNodes[i].nodeType == 1) {
 * findText(childNodes[i]); } if (childNodes[i].nodeType == 3) {
 * //_printToJSConsole("value: " + childNodes[i].nodeValue); if
 * (regex.test(childNodes[i].nodeValue)) { _printToJSConsole("YYYYYYYYYEEEES!");
 * //childNodes[i].nodeValue = var temp =
 * childNodes[i].nodeValue.split("sufficiente"); var parentNode =
 * childNodes[i].parentNode; _printToJSConsole("temp0: " + temp[0] + "****");
 * _printToJSConsole("temp1 " + temp[1]); parentNode.removeChild(childNodes[i]);
 * var newSpan = document.createElement("div"); newSpan.setAttribute("style",
 * "background-color:yellow"); var textNode1 = document.createTextNode(temp[0]);
 * var textNode2 = document.createTextNode(temp[1]); var textNode3 =
 * document.createTextNode("sufficiente"); parentNode.appendChild(textNode1);
 * newSpan.appendChild(textNode3); parentNode.appendChild(newSpan);
 * parentNode.appendChild(textNode2);
 * 
 * //parentNode.setAttribute("style", "background-color:yellow");
 * //_printToJSConsole("parentNode: " + parentNode.nodeName);
 * //parentNode.setAttribute("class", "sfondo"); } } } }
 */

function findTextannotation(doc, annotation) {
	var childNodes = doc.childNodes;
	// var regex = new RegExp("[ a-z0-9]*12:[ a-z0-9]*");
	// var regex = new RegExp("[ a-z0-9]*06[ a-z0-9]*");
	var regex = new RegExp("[ a-z0-9]*" + annotation + "[ a-z0-9]*");
	// var regex = new RegExp("[
	// a-z0-9]*[+]*[0-9]+[.]*[0-9]{4,}[.]*[0-9]+[.]*[0-9]+[ a-z0-9]*");
	for (var i = 0; i < childNodes.length; i++) {
		// _printToJSConsole("name: " + childNodes[i].nodeName);
		if (childNodes[i].nodeType == 1) {
			findTextannotation(childNodes[i], annotation);
		}
		if (childNodes[i].nodeType == 3) {
			// _printToJSConsole("value: " + childNodes[i].nodeValue);
			var tokens = childNodes[i].nodeValue.split(' ');
			for (var j = 0; j < tokens.length; j++) {
				if (tokens[j] != null) {
					if (regex.test(tokens[j])) {
						_printToJSConsole("nodeValue: "
								+ childNodes[i].nodeValue);
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
