if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);

window.onload = function(){
	
	
	document.getElementById("addImport").addEventListener("click",
			art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("click",
			art_semanticturkey.cancel, true);
};


art_semanticturkey.onAccept = function() { 
	var prefix = document.getElementById("prefix").value; 	 
 	var ns = document.getElementById("namespace").value; 
 	
 	if(art_semanticturkey.checkPrefixEditable(prefix) == false)
 		return;
 	
 	try{
	    var responseXML = window.arguments[0].parentWindow.art_semanticturkey.STRequests.Metadata.setNSPrefixMapping(
				prefix, ns);
		window.arguments[0].parentWindow.art_semanticturkey.setNSPrefixMapping_RESPONSE(responseXML, prefix, ns);
 	}
 	catch (e) {
		alert(e.name + ": " + e.message);
	}
	close();	
};
  
art_semanticturkey.cancel = function() {
	close();
}