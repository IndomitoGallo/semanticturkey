if (typeof art_semanticturkey == "undefined") {
	var art_semanticturkey = {};
}
Components.utils.import("resource://stmodules/Logger.jsm");

Components.utils.import("resource://stservices/SERVICE_RangeAnnotation.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);

function temp(document, annotations, deleteAnnotation) {
	var panels = [];
	var ids = [];
	var tags = [];
	var xptrService = Components.classes["@mozilla.org/xpointer-service;1"].getService();
	xptrService = xptrService.QueryInterface(Components.interfaces.nsIXPointerService);

	var stEventArray = new art_semanticturkey.eventListenerArrayClass();
	
	stEventArray.addEventListenerToArrayAndRegister("rangeAnnotationDeleted", function(eventId, rangeAnnotationDeletedObj) {
		var index = ids.indexOf(rangeAnnotationDeletedObj.getId());
		
		if (index == -1) return;
		
		panels[index].parentNode.removeChild(panels[index]);
		
		try {
			while (tags[index].hasChildNodes()) {
				var n = tags[index].firstChild;
				tags[index].removeChild(n);
				tags[index].parentNode.insertBefore(n, tags[index]);
			}
		} catch(e) {
			alert("" + e.lineNumber);
		}
		tags[index].parentNode.removeChild(tags[index]);
		ids.slice(index, 1);
		panels.slice(index, 1);
		tags.slice(index, 1);
	}, null);

	
	for (var i = 0; i < annotations.length; i++) {
		let ann = annotations[i];
		let range = xptrService.parseXPointerToRange(ann.range, document);
		let surroundTag = document.createElement("font");
		surroundTag.setAttribute("style","color:blue; background-color:yellow;cursor:pointer !important");
		range.surroundContents(surroundTag);
		
		let panel = window.document.createElement("panel");
		window.document.documentElement.appendChild(panel);

		panels.push(panel);
		ids.push(ann.id);
		tags.push(surroundTag);
		
		if (typeof deleteAnnotation != "undefined" && typeof ann.id != "undefined") {
			let b = window.document.createElement("button");
			b.setAttribute("image", "moz-icon://stock/gtk-close?size=menu");
			b.setAttribute("tooltiptext", "Delete Annotation");
			panel.appendChild(b);
			b.addEventListener("command", function() {deleteAnnotation(ann.id);}, false);
	
			surroundTag.addEventListener("click", function(event) {
				event.preventDefault();
				panel.openPopup(surroundTag, "after_pointer", 0, 0, true, false);
			}, true);
		}

	}
	
	document.defaultView.addEventListener("unload", function(){
		for (var i = 0 ; i < panels.length ; i++) {
			var pan = panels[i];
			pan.parentNode.removeChild(pan);
		}
	}, false);
}