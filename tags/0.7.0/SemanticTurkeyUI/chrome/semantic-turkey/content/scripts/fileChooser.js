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
/** NScarpato 04/10/2007 File che implementa un file chooser */
netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
art_semanticturkey.chooseFile = function() {
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"]
			.createInstance(nsIFilePicker);
	fp.init(window, "Select a File", nsIFilePicker.modeOpen);
	var res = fp.show();
	if (res == nsIFilePicker.returnOK) {
		var txbox = document.getElementById("srcLocalFile");
		//txbox.setAttribute("value", fp.file.path);
		txbox.value = fp.file.path;
	}
};

art_semanticturkey.saveFile = function() {
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"]
			.createInstance(nsIFilePicker);
	fp.init(window, "Select a Directory", nsIFilePicker.modeGetFolder);
	var res = fp.show();
	if (res == nsIFilePicker.returnOK) {
		var txbox = document.getElementById("destDir");
		//txbox.setAttribute("value", fp.file.path);
		txbox.value = fp.file.path;
	}
};
