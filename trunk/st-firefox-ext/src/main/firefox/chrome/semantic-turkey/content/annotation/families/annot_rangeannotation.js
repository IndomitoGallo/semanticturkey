Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Preferences.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Annotation.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_RangeAnnotation.jsm", art_semanticturkey);

Components.utils.import("resource://stmodules/AnnotationManager.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/AnnotationCommons.jsm", art_semanticturkey);

// Conventional functions for the range annotation family (BEGIN)
art_semanticturkey.annotation.rangeannotation = {};

art_semanticturkey.annotation.rangeannotation.checkAnnotationsForContent = function(contentId) {
	var responseXML = art_semanticturkey.STRequests.RangeAnnotation.chkAnnotation(contentId);
	var reply = responseXML.getElementsByTagName('reply')[0];
	var act = reply.getAttribute("status");
	return act == "ok";
};

art_semanticturkey.annotation.rangeannotation.annotation2ranges = function(document, annotation) {
	var xptrService = Components.classes["@mozilla.org/xpointer-service;1"].getService();
	xptrService = xptrService.QueryInterface(Components.interfaces.nsIXPointerService);
	return [ xptrService.parseXPointerToRange(annotation.range, document) ];
};

art_semanticturkey.annotation.rangeannotation.furtherAnn = function(event) {
	var xptrService = Components.classes["@mozilla.org/xpointer-service;1"].getService();
	xptrService = xptrService.QueryInterface(Components.interfaces.nsIXPointerService);

	var resource = event.resource;
	var doc = event.document;
	var selection = event.selection;
	var xptrString = xptrService.createXPointerFromSelection(window._content.getSelection(),
			window._content.document);
	var responseXML = art_semanticturkey.STRequests.RangeAnnotation.addAnnotation(resource.getURI(),
			selection.toString(), doc.documentURI, doc.title, xptrString);
};