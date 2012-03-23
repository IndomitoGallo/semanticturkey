var art_semanticturkey = {};

art_semanticturkey.init = function(event) {
	var conceptTree = document.getElementById("conceptTree");
	conceptTree.conceptScheme = window.arguments[0].conceptScheme;
};

art_semanticturkey.onAccept = function(event) {
	var conceptTree = document.getElementById("conceptTree");
	
	var out = {};
	out.selectedConcept = conceptTree.selectedConcept;
	window.arguments[0].out = out;
};

window.addEventListener("load", art_semanticturkey.init, true);
window.addEventListener("dialogaccept", art_semanticturkey.onAccept, true);
