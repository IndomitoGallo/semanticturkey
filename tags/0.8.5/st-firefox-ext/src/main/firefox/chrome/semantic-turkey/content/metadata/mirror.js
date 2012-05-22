
if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};
Components.utils.import("resource://stservices/SERVICE_Administration.jsm",
		art_semanticturkey);

window.onload = function(){
	
	document.getElementById("close").addEventListener("click", art_semanticturkey.close, true);
	document.getElementById("delItem").addEventListener("command", art_semanticturkey.deleteMirrorEntry, true);
	document.getElementById("upItem").addEventListener("command", art_semanticturkey.updateMirrorEntry, true);
	
	
	art_semanticturkey.populateMirrorPanel();
};

art_semanticturkey.populateMirrorPanel = function() {
	try{
		var responseXML = art_semanticturkey.STRequests.Administration.getOntologyMirror();
		art_semanticturkey.getOntologyMirror_RESPONSE(responseXML);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
};




art_semanticturkey.deleteMirrorEntry = function() {
	var baseURI_FilePair = art_semanticturkey.getMirrorEntry();
	if(baseURI_FilePair == null) {
		alert("Please select a mirror file to delete");
		return;
	}
	try{
		var responseXML = art_semanticturkey.STRequests.Administration.deleteOntMirrorEntry(
				baseURI_FilePair.baseURI, 
				baseURI_FilePair.file);
		art_semanticturkey.deleteOntMirrorEntry_RESPONSE(responseXML, baseURI_FilePair.baseURI, baseURI_FilePair.file);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.deleteOntMirrorEntry_RESPONSE = function(responseElement, baseuri, file){
	var treeChildren = document.getElementById("MirrorTreeChildren");
	var treeItems = document.getElementsByTagName("treeitem");
	for(var i=0; i<treeItems.length; ++i){
		var treecellUriLabel = treeItems[i].getElementsByTagName("treecell")[0].getAttribute("label");
		var treecellFileLabel = treeItems[i].getElementsByTagName("treecell")[1].getAttribute("label");
		if((baseuri == treecellUriLabel) && ( file == treecellFileLabel)){
			treeItems[i].parentNode.removeChild(treeItems[i]);
		}
	}
};

art_semanticturkey.updateMirrorEntry = function() {
	var baseURI_FilePair = art_semanticturkey.getMirrorEntry();
	if(baseURI_FilePair == null) {
		alert("Please select a mirror file to delete");
		return;
	}
	var parameters = new Object();
	parameters.baseURI_FilePair = baseURI_FilePair;
	window.openDialog("chrome://semantic-turkey/content/metadata/updateMirror.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
	
};


art_semanticturkey.getMirrorEntry = function() {
	var tree = document.getElementById("mirrorTree");
	try {
		currentelement = tree.treeBoxObject.view
				.getItemAtIndex(tree.currentIndex);
	} catch (e) {
		return null;
	}
	var result = new Object();
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var baseURI = treecell.getAttribute("label");
	var treecell1 = treerow.getElementsByTagName('treecell')[1];
	var file = treecell1.getAttribute("label");
	result.baseURI = baseURI;
	result.file = file;
	return result;
};


art_semanticturkey.close = function() {
	close();
};
