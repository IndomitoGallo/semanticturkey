Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Preferences.jsm",
		art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Annotation.jsm",
		art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_RangeAnnotation.jsm",
		art_semanticturkey);

Components.utils.import("resource://stmodules/AnnotationManager.jsm",
		art_semanticturkey);
Components.utils.import("resource://stmodules/AnnotationCommons.jsm",
		art_semanticturkey);

// // Conventional functions for the bookmarking annotation family (BEGIN)
art_semanticturkey.annotation.bookmarking = {};

art_semanticturkey.annotation.bookmarking.checkAnnotationsForContent = function(
		contentId) {
	var responseXML = art_semanticturkey.STRequests.Annotation
			.chkAnnotation(contentId);
	var reply = responseXML.getElementsByTagName('reply')[0];
	var act = reply.getAttribute("status");
	return act == "ok";
};

// art_semanticturkey.annotation.bookmarking.getAnnotationsForContent =
// art_semanticturkey.STRequests.Annotation.getPageAnnotations;

// art_semanticturkey.annotation.bookmarking.deleteAnnotation =
// art_semanticturkey.STRequests.Annotation.removeAnnotation;

art_semanticturkey.annotation.bookmarking.annotation2ranges = function(
		document, annotation) {
	// Adapted from chrome://global/content/bindings/findbar.xml#findbar
	var aWord = annotation.value;
	var ranges = [];

	var searchRange = document.createRange();
	searchRange.selectNodeContents(document.documentElement);

	var startPt = searchRange.cloneRange();
	startPt.collapse(true);

	var endPt = searchRange.cloneRange();
	endPt.collapse(false);

	var retRange = null;
	var finder = Components.classes["@mozilla.org/embedcomp/rangefind;1"]
			.createInstance().QueryInterface(Components.interfaces.nsIFind);

	finder.caseSensitive = false;

	while ((retRange = finder.Find(aWord, searchRange, startPt, endPt))) {
		startPt = retRange.cloneRange();
		startPt.collapse(false);

		ranges.push(retRange);
	}

	return ranges;

};

art_semanticturkey.annotation.bookmarking.furtherAnn = function(event) {
	var resource = event.resource;
	var doc = event.document;
	var selection = event.selection;
	var responseXML = art_semanticturkey.STRequests.Annotation
			.createFurtherAnnotation(resource.getURI(), selection.toString(),
					doc.documentURI, doc.title);
};

// //Conventional functions for the bookmarking annotation family (END)

