

if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Administration.jsm",
		art_semanticturkey);

window.onload = function(){
	document.getElementById("selectMirror").addEventListener("click", art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("click", art_semanticturkey.cancel, true);
	
	art_semanticturkey.populateImportMirrorPanel();
};

art_semanticturkey.populateImportMirrorPanel = function() {
	try{
		var responseXML = art_semanticturkey.STRequests.Administration.getOntologyMirror();
		art_semanticturkey.getOntologyMirror_RESPONSE(responseXML);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
};

/**
 * onAccept
 * 
 * @param {bool}
 */
art_semanticturkey.onAccept = function() {
	var tree = document.getElementById('mirrorTree');
	try {
		var currentelement = tree.treeBoxObject.view
				.getItemAtIndex(tree.currentIndex);
	} catch (e) {
		alert("No mirror selected, please select one");
		return;
	}
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	treeCells = treerow.getElementsByTagName("treecell");
	var labelURI = treeCells[0].getAttribute("label");
	var labelNS = treeCells[1].getAttribute("label");
	var parentWindow = window.arguments[0].parentWindow;
	try{
		var responseXML = parentWindow.art_semanticturkey.STRequests.Metadata.addFromOntologyMirror(labelURI, labelNS);
		parentWindow.art_semanticturkey.addFromOntologyMirror_RESPONSE(responseXML);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
	close();
};


art_semanticturkey.cancel = function() {
	close();
}