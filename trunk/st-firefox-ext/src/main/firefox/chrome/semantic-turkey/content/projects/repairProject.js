if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Projects.jsm",
		art_semanticturkey);

window.onload = function(){
	document.getElementById("repairProject").addEventListener("command", art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("command", art_semanticturkey.cancel, true);
	
	var issue = window.arguments[0].issue;
	var projectName = window.arguments[0].projectName;
	var text = "The project "+ projectName+" has the following issue:\n\n"+issue+"\n\n"+
			"Semantic Turkey can try to repair the project by guessing the proper"+
			" setting.\nDo you want ST to repair it?"
	document.getElementById("textAreaIssue").value = text;
};

art_semanticturkey.onAccept = function() {
	art_semanticturkey.DisabledAllButton(true);
	try{
		var projectName = window.arguments[0].projectName;
		//window.arguments[0].parentWindow.art_semanticturkey.closeProject();
		var responseXML = art_semanticturkey.STRequests.Projects.repairProject(
				projectName);
		art_semanticturkey.repairProject_RESPONSE(responseXML, projectName);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
		art_semanticturkey.DisabledAllButton(false);
	}
};

art_semanticturkey.repairProject_RESPONSE = function(responseElement, projectName){
	close();
};

art_semanticturkey.cancel = function() {
	close();
};

art_semanticturkey.DisabledAllButton = function(disabled){
	document.getElementById("repairProject").disabled = disabled;
	document.getElementById("cancel").disabled = disabled;
};