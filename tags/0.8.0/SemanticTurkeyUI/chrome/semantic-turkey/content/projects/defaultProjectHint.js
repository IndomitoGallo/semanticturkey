if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Preferences.jsm", art_semanticturkey);

window.onload = function(){
	document.getElementById("ok").addEventListener("command", art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("command", art_semanticturkey.cancel, true);
	document.getElementById("hintCheckBox").addEventListener("command", art_semanticturkey.changeHint, true);
	
	var projectName = window.arguments[0].projectName;
	var text = "You are about to set the project "+projectName+" as the dafult project. "+
			"This means that the next time you start ST this project will be loaded by dafault. "+
			"You can always set another project as the default one by doing the same thig you just did. "+
			"Do you wish to continue?"
	document.getElementById("textAreaIssue").value = text;
};

art_semanticturkey.onAccept = function() {
	window.arguments[0].defaultProjectSet = true;
	close();
};

art_semanticturkey.cancel = function() {
	close();
};

art_semanticturkey.changeHint = function(){
	var checked = document.getElementById("hintCheckBox").checked;
	art_semanticturkey.Preferences.set("extensions.semturkey.hints.defaultProject", checked); 
}

art_semanticturkey.DisabledAllButton = function(disabled){
	document.getElementById("repairProject").disabled = disabled;
	document.getElementById("cancel").disabled = disabled;
};