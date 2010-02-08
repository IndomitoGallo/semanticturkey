if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Projects.jsm",
		art_semanticturkey);

window.onload = function(){
	document.getElementById("dirBtn").addEventListener("click", art_semanticturkey.saveFile, true);
	document.getElementById("exportProject").addEventListener("click", art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("click", art_semanticturkey.cancel, true);
	
	document.getElementById("fileName").focus();
};


art_semanticturkey.onAccept = function() {
	art_semanticturkey.DisabledAllButton(true);
	var dir = document.getElementById("destDir").value;
	var fileName = document.getElementById("fileName").value;
	if((dir == "") || (fileName == "")){
		alert("Please specify a directory and a file name");
		art_semanticturkey.DisabledAllButton(false);
		return;
	}
	try{
		var file = dir+"/"+fileName;
		art_semanticturkey.STRequests.Projects.exportProject(file);
		close();
	}
	catch (e) {
		alert(e.name + ": " + e.message);
		art_semanticturkey.DisabledAllButton(false);
	}
};

art_semanticturkey.cancel = function() {
	close();
};

art_semanticturkey.DisabledAllButton = function(disabled){
	document.getElementById("exportProject").disabled = disabled;
	document.getElementById("cancel").disabled = disabled;
	document.getElementById("dirBtn").disabled = disabled;
};