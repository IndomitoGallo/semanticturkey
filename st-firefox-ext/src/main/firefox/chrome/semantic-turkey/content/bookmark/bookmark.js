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

/*************************************************************************************************************
 * 
 * this file contains functions related to the bookmarks, that is the two events: 1) when a page is open,
 * if it has topics, then the bookmark icon is shown 2) when the user clicks on the bookmark icon,
 * bookmarks are shown.
 * 
 */

if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Annotation.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Preferences.jsm", art_semanticturkey);


art_semanticturkey.chkBookmarks = function(event) {
	var projectIsNull = art_semanticturkey.CurrentProject.isNull();
	var chkAnn = art_semanticturkey.Preferences.get("extensions.semturkey.bookmark.checkBookmark", true);
	if (projectIsNull == false && chkAnn == true) {
		var url = gBrowser.selectedBrowser.currentURI.spec;
		try {
			var responseXML = art_semanticturkey.STRequests.Annotation.chkBookmarks(url);
			art_semanticturkey.checkBookmarks_RESPONSE(responseXML);
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
};


art_semanticturkey.checkBookmarks_RESPONSE = function(responseElement) {
	var act = responseElement.getElementsByTagName('value')[0].textContent.trim() == "true" ? true : false;

	var statusIcon = document.getElementById("status-bar-bookmark");
	statusIcon.collapsed = !act;
};

art_semanticturkey.openBookmarksDialog = function() {
	var parameters = {};
	parameters.url = gBrowser.selectedBrowser.currentURI.spec;
		
	window.openDialog(
			"chrome://semantic-turkey/content/bookmark/bookmark-dialog.xul",
			"_blank", "modal=yes,resizable,centerscreen,width=400,height=300",
			parameters);

};

// Adding an event for the changing of a tab
gBrowser.tabContainer.addEventListener("TabSelect", art_semanticturkey.chkBookmarks, false);

// adding an event for loading of the loading of the page in a tab of the browser
gBrowser.addEventListener("load", art_semanticturkey.chkBookmarks, true);
