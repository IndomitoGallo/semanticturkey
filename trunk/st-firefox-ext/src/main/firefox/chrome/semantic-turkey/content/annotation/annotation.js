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

/*******************************************************************************
 * 
 * this file contains functions related to the "highlighter", that is the two
 * events: 1) when a page is open, if it contains annotations, then the
 * highlighter is shown 2) when the user clicks on the highlighter, annotations
 * are shown on the page
 * 
 */

if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/SemTurkeyHTTP.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Annotation.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/AnnotationManager.jsm", art_semanticturkey);

/**
 * this function checks if "annotation checking" is enabled, and in affirmative
 * case, checks it there are annotations if there are annotations available in
 * the page
 * 
 * @param event
 * 
 * @return
 */
art_semanticturkey.contentLoadedHook = function(event) {
	try {
		var projectIsNull = art_semanticturkey.CurrentProject.isNull();

		if (projectIsNull == false) {
			var event2 = {
				name : "contentLoaded",
				document : gBrowser.contentDocument
			};
			art_semanticturkey.annotation.AnnotationManager.handleEvent(window, event2);
			art_semanticturkey.checkAnnotationsForContent_RESPONSE(event2.document);
		}
	} catch (e) {
		alert(e.message);
	}
};

art_semanticturkey.tabSelectHook = function(event) {
	art_semanticturkey.checkAnnotationsForContent_RESPONSE(gBrowser.contentDocument);
};

art_semanticturkey.checkAnnotationsForContent_RESPONSE = function(doc) {
	var projectIsNull = art_semanticturkey.CurrentProject.isNull();
	
	if (projectIsNull == false && (doc.getUserData("stAnnotationsExist") == "true")) {
		var statusIcon = document.getElementById("status-bar-annotation");
		statusIcon.collapsed = false;
	} else {
		var statusIcon = document.getElementById("status-bar-annotation");
		statusIcon.collapsed = true;
	}
};

art_semanticturkey.viewAnnotationOnPage = function() {
	try {
		var defaultFamily = art_semanticturkey.annotation.AnnotationManager.getDefaultFamily();

		var contentId = gBrowser.selectedBrowser.currentURI.spec;

		if (typeof defaultFamily.getAnnotationsForContent != "undefined") {
			var annotations = defaultFamily.getAnnotationsForContent(contentId);

			if (typeof defaultFamily.decorateContent != "undefined") {
				defaultFamily.decorateContent(gBrowser.contentDocument, annotations);
			} else {
				throw new Error("Missing function decorateContent in family \"" + defaultFamily.getLabel()
						+ "\"");
			}
		} else {
			throw new Error("Missing function getAnnotationsForContent in family \""
					+ defaultFamily.getLabel() + "\"");
		}
	} catch (e) {
		alert(e.message);
	}
};

// Adding an event for the changing of a tab
gBrowser.tabContainer.addEventListener("TabSelect", art_semanticturkey.tabSelectHook, false);

// adding an event for loading of the loading of the page in a tab of the
// browser
gBrowser.addEventListener("load", art_semanticturkey.contentLoadedHook, true);

// TODO check this error
// adding an event for the loading of a project // FF 4.0 says: Error:
// art_semanticturkey.eventListener is not a constructor Sourcefile:
// chrome://semantic-turkey/content/annotation/annotation.js Row: 100
// art_semanticturkey.eventListenerForAnnotationObject = new
// art_semanticturkey.eventListener("projectOpened",
// art_semanticturkey.chkAnnotation, null);
// just guessing based on: http://www.quirksmode.org/js/events_advanced.html

// art_semanticturkey.eventListenerForAnnotationObject = new
// art_semanticturkey.eventListener("projectOpened",
// art_semanticturkey.chkAnnotation, null);

