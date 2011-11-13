if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};
Components.utils.import("resource://stservices/SERVICE_Administration.jsm",
		art_semanticturkey);

window.onload = function(){
	document.getElementById("mirrorBtn").addEventListener("click", art_semanticturkey.chooseFile, true);
	document.getElementById("updateFile").addEventListener("click", art_semanticturkey.onLocalFileAccept, true);
	document.getElementById("cancel").addEventListener("click", art_semanticturkey.cancel, true);
};


art_semanticturkey.onLocalFileAccept = function() {
	var baseURI_FilePair = window.arguments[0].baseURI_FilePair;
	var updateFilePath = document.getElementById("srcLocalFile").value;
	if(updateFilePath == null || updateFilePath == "")
		return
	try{
		var responseXML = art_semanticturkey.STRequests.Administration.updateOntMirrorEntry(
				baseURI_FilePair.baseURI,
				baseURI_FilePair.file,
				"lf",
				updateFilePath);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
	close();
};


art_semanticturkey.cancel = function(){
	close();
};