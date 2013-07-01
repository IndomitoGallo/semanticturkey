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

if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};

Components.utils.import("resource://stservices/SERVICE_Individual.jsm",
		art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/AnnotationManager.jsm", art_semanticturkey);

window.onload = function() {
	document.getElementById("cancel").addEventListener("click", art_semanticturkey.onClose, true);

	document.getElementById("web-link-copy").addEventListener("command", art_semanticturkey.copyWebLink, true);

	var instanceName = window.arguments[0].instanceName;

	try {
		var defaultAnnotationFamily = art_semanticturkey.annotation.AnnotationManager.getDefaultFamily();
		
		if (typeof defaultAnnotationFamily.getAnnotatedContentResources != "undefined") {
			var annotatedContentResources = defaultAnnotationFamily.getAnnotatedContentResources(instanceName);
			art_semanticturkey.getWebLinks_RESPONSE(annotatedContentResources);
		}

	
	} catch(e) {
		alert(e.name + ":" + e.message);
	}
};

/**
 * @author NScarpato ATurbati
 * @date 09-10-2009
 * @description manage getBookmarks response and populate webLinks list
 */
art_semanticturkey.getWebLinks_RESPONSE = function(annotatedContentResources) {
	var rowsBox = document.getElementById("rowsBoxWebLink");
	for (var i = 0; i < annotatedContentResources.length; i++) {
		var linkTitle = annotatedContentResources[i].title;
		var linkUrl = annotatedContentResources[i].value;

		var row = document.createElement("row");

		var label = document.createElement("label");
		label.setAttribute("value", linkTitle);
		label.setAttribute("href", linkUrl);
		label.setAttribute("class", "text-link");
		label.setAttribute("context", "web-link-context-menu");

		row.appendChild(label);

		rowsBox.appendChild(row);
	}
};


/**
 * @author NScarpato ATurbati
 * @date 09-10-2009 close window
 */
art_semanticturkey.onClose = function() {
	close();
};

art_semanticturkey.copyWebLink = function(event) {
	var element = document.popupNode;
	
	var url = element.getAttribute("href");
	
    const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].  
    getService(Components.interfaces.nsIClipboardHelper);  
    gClipboardHelper.copyString(url);  
};

// *********** register request handler method (they need to be registered after
// the declaration of function )***********************

art_semanticturkey.HttpMgr.addRequestHandler(
		art_semanticturkey.STRequests.Page.getBookmarksRequest,
		art_semanticturkey.getBookmarks_RESPONSE);