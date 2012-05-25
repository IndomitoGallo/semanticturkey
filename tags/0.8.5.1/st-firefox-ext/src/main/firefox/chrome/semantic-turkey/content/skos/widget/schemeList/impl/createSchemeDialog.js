if (typeof art_semanticturkey == "undefined") {
	var art_semanticturkey = {};
}

art_semanticturkey.ondialogaccept = function() {
	var schemeName = document.getElementById("schemeName");
	var prefLabel = document.getElementById("prefLabel");
	
	window.arguments[0].wrappedJSObject.out = {name : schemeName.value, prefLabel : prefLabel.value};
	
	return  true;
}

art_semanticturkey.ondialogcancel = function() {
	return true;
}

window.addEventListener("dialogaccept", art_semanticturkey.ondialogaccept, true);
window.addEventListener("dialogcancel", art_semanticturkey.ondialogcancel, true);