if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};
window.onload = function() {
	document.getElementById("createIndividual").addEventListener("click",
			art_semanticturkey.onAccept, true);
	document.getElementById("IndividualName").addEventListener("command",
			art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("click",
			art_semanticturkey.onClose, true);
			
	document.getElementById("IndividualName").focus();
};

art_semanticturkey.onAccept = function() {
	var instanceName = document.getElementById("IndividualName").value;
	var clsName = window.arguments[0].name;
	var parentWindow = window.arguments[0].parentWindow;
	try {
		var responseXML = parentWindow.art_semanticturkey.STRequests.Cls.addIndividual(
			clsName, instanceName);
		parentWindow.art_semanticturkey.createInstance_RESPONSE(responseXML);
		close();
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.onClose = function() {
	close();
};
