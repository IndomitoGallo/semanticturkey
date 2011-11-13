if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Projects.jsm",
		art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);

window.onload = function(){
	document.getElementById("saveProject").addEventListener("command", art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("command", art_semanticturkey.cancel, true);
	
	document.getElementById("textSave").value = "Save project "+window.arguments[0].projectName;
};



art_semanticturkey.onAccept = function() {
	window.arguments[0].save = true;
	close();
};


art_semanticturkey.cancel = function() {
	close();
};

