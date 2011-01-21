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

/**
 * @author NScarpato 21/04/2008 manageInput
 */
art_semanticturkey.manageInput = function(type, txbox) {
	var isurl = art_semanticturkey.isUrl(txbox.value);
	if (isurl == true) {
		txbox.style.color = 'blue';
	} else {
		txbox.style.color = 'red';
	}
};

art_semanticturkey.isUrl = function(s) {
	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	return regexp.test(s);
};
/**
 * @author NScarpato 21/04/2008 Checks if a string ends with the specified
 *         substring or char
 * @param str
 *            the sub string or char to check for.
 * @returns true if the string ends with the sub string or char, otherwise
 *          false.
 */

art_semanticturkey.stringEndsWith = function(string, str){
	var offset = string.length - str.length;
	return offset >= 0 && string.lastIndexOf(str) === offset;
};


/**
 * @author NScarpato
 * @date 19-12-2008
 * @param url:
 *            string that represent the selected url
 * @description open selected url in a new tab
 */
art_semanticturkey.openUrl = function(url) {
	var win = Components.classes['@mozilla.org/appshell/window-mediator;1']
			.getService(Components.interfaces.nsIWindowMediator)
			.getMostRecentWindow('navigator:browser');
	win.openUILinkIn(url, "tab");
};
