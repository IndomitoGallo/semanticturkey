if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};

window.onload = function() {
	// NScarpato 04/12/2008
	var langsPrefsEntry = "extensions.semturkey.annotprops.langs";
	var defaultLangPref = "extensions.semturkey.annotprops.defaultlang";
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
	var langList = prefs.getCharPref(langsPrefsEntry).split(",");
	langList.sort();
	var langMenupopup = document.getElementById("languages");
	var langMenuitem = document.createElement("menuitem");
	for ( var i = 0; i < langList.length; i++) {
		langMenuitem.setAttribute("label", langList[i]);
		langMenuitem.setAttribute("id", langList[i]);
		langMenupopup.appendChild(langMenuitem);
		langMenuitem = document.createElement("menuitem");
	}
	var menu = document.getElementById("menu");
	var defaultLang = prefs.getCharPref(defaultLangPref);
	menu.selectedItem = document.getElementById(defaultLang);
	document.getElementById("addSynonym").addEventListener("click",
			art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("click",
			art_semanticturkey.onClose, true);
	document.getElementById("synonym").focus();
};

art_semanticturkey.onAccept = function() {
	var resourceName = window.arguments[0].name;
	var parentWindow = window.arguments[0].parentWindow;
	var textbox = document.getElementById("synonym");
	var menu = document.getElementById("menu");
	try{
		parentWindow.art_semanticturkey.STRequests.Synonyms.addSynonyms(
				resourceName, menu.selectedItem.label,
				textbox.value);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
	close();
};

art_semanticturkey.onClose = function() {
	close();
};