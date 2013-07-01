var art_semanticturkey = {};

art_semanticturkey.init = function(event) {
	var conceptTree = document.getElementById("conceptTree");
	conceptTree.conceptScheme = window.arguments[0].conceptScheme;
	conceptTree.hidetoolbar = typeof window.arguments[0].hidetoolbar == "undefined" ? true : window.arguments[0].hidetoolbar;
	conceptTree.hideheading = typeof window.arguments[0].hideheading == "undefined" ? true : window.arguments[0].hideheading;
	conceptTree.mutable = typeof window.arguments[0].mutable == "undefined" ? false : window.arguments[0].mutable;
	document.getElementById("conceptTreeDialog").getButton("accept").focus();
};

art_semanticturkey.onAccept = function(event) {
	var conceptTree = document.getElementById("conceptTree");
	
	var out = {};
	out.selectedConcept = conceptTree.selectedConcept;
	window.arguments[0].out = out;
};

window.addEventListener("load", art_semanticturkey.init, true);
window.addEventListener("dialogaccept", art_semanticturkey.onAccept, true);
