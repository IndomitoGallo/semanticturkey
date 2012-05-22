if (typeof art_semanticturkey == "undefined") {
	var art_semanticturkey = {};
}

Components.utils.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);

art_semanticturkey.init = function(event) {
	window.removeEventListener("load", art_semanticturkey.init, false);

	var stEventArray = new art_semanticturkey.eventListenerArrayClass()
	
	stEventArray.addEventListenerToArrayAndRegister("projectClosed", function(eventId, projectClosedObj) {
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
	    .getInterface(Components.interfaces.nsIWebNavigation)
	    .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
	    .rootTreeItem
	    .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
	    .getInterface(Components.interfaces.nsIDOMWindow);

		mainWindow.toggleSidebar();
	}, null);
	
	window.addEventListener("unload", function(event){
		try {
		stEventArray.deregisterAllListener();
		} catch(e) {
			alert(e.name + ":" + e.message);
		}
	}, false);
};

window.addEventListener("load", art_semanticturkey.init, false);