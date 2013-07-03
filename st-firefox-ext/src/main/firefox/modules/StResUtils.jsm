Components.utils.import("resource://stmodules/Logger.jsm");
Components.utils.import("resource://stmodules/ARTResources.jsm");

EXPORTED_SYMBOLS = [ "STResUtils" ];

var STResUtils = new Object();

function getImageSrc(rdfRes, operation) {
	// check the information contained inside the rdfRes, to decide the right
	// src
	var src="";

	if (rdfRes instanceof ARTURIResource) {
		var role = rdfRes.getRole();
		var explicit = rdfRes.explicit;
		if (typeof operation == "undefined") {
			if (role == "concept") {
				if (explicit == "false" || explicit == false)
					src = "chrome://semantic-turkey/skin/images/skosConcept_imported.png";
				else
					src = "chrome://semantic-turkey/skin/images/skosConcept20x20.png";
			} else if (role == "individual") {
				if (explicit == "false" || explicit == false)
					src = "chrome://semantic-turkey/skin/images/individual_noexpl.png";
				else
					src = "chrome://semantic-turkey/skin/images/individual20x20.png";
			} else if (role == "cls") {
				if (explicit == "false" || explicit == false)
					src = "chrome://semantic-turkey/skin/images/class_imported.png";
				else
					src = "chrome://semantic-turkey/skin/images/class20x20.png";
			}
		} else if(operation == "remove"){
			if (role == "concept") {
				src = "chrome://semantic-turkey/skin/images/skosConcept20x20.png";
			} else if (role == "individual") {
				src = "chrome://semantic-turkey/skin/images/individual20x20.png";
			} else if (role == "cls") {
				src = "chrome://semantic-turkey/skin/images/class20x20.png";
			}
		}

	} else if (rdfRes instanceof ARTLiteral) {
		var lang = rdfRes.getLang();
		if(typeof lang != "undefined" && lang != null && lang != "" ){
			src = "chrome://semantic-turkey/skin/images/flags/"+lang+".gif";
		}

	} else { // rdfRes instanceof ARTBNode

	}

	return src;
};

STResUtils.getImageSrc = getImageSrc;
