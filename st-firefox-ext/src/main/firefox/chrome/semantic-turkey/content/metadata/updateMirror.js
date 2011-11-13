if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};
Components.utils.import("resource://stservices/SERVICE_Administration.jsm",
		art_semanticturkey);

window.onload = function(){
	document.getElementById("accept").addEventListener("click", art_semanticturkey.updateMirror, true);
	document.getElementById("cancel").addEventListener("click", art_semanticturkey.cancel, true);
};


art_semanticturkey.updateMirror = function() {
	var baseURI_FilePair = window.arguments[0].baseURI_FilePair;
	var updateOptionList = document.getElementById("updateMirrorOption");
	var selectedUpdateId = updateOptionList.selectedItem.getAttribute("id");
	var responseXML;
	if (selectedUpdateId == "web") {
		try{
			responseXML = art_semanticturkey.STRequests.Administration.updateOntMirrorEntry(
					baseURI_FilePair.baseURI, 
					baseURI_FilePair.file,
					"wbu");
		}
		catch (e) {
			alert(e.name + ": " + e.message);
		}
		close();
	} else if (selectedUpdateId == "alt") {
		var newMirrorFilePath = "none";
		while (!art_semanticturkey.isUrl(newMirrorFilePath)) {
			newMirrorFilePath = prompt("Insert alternative uri:", "",
					"Update Mirror");
			if (newMirrorFilePath == null) {
				break;
			}
		}
		if (newMirrorFilePath != null) {
			try{
				responseXML = art_semanticturkey.STRequests.Administration.updateOntMirrorEntry(
						baseURI_FilePair.baseURI,
						baseURI_FilePair.file,
						"walturl",
						newMirrorFilePath);
			}
			catch (e) {
				alert(e.name + ": " + e.message);
			}
		}
		close();
	} else if (selectedUpdateId == "local") {
		parameters = new Object();
		parameters.baseURI_FilePair = baseURI_FilePair;
		window
				.openDialog(
						"chrome://semantic-turkey/content/metadata/updateMirrorFromLocalFile.xul",
						"_blank", "modal=yes,resizable,centerscreen",
						parameters);
	}
	close();
};

art_semanticturkey.cancel = function() {
	close();
};