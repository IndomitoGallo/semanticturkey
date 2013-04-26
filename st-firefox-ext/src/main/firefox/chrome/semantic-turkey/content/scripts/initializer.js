Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Preferences.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Annotation.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_RangeAnnotation.jsm", art_semanticturkey);

Components.utils.import("resource://stmodules/AnnotationManager.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/AnnotationCommons.jsm", art_semanticturkey);

art_semanticturkey.JavaFirefoxSTBridge.initialize = function() {
	try {
		/*
		 * Get a Foo component
		 */
		var semTurkeyBridge = art_semanticturkey.JavaFirefoxSTBridge.getSemanticTurkey();

		/*
		 * Initialize it. The trick is to get past its IDL interface and right
		 * into its Javascript implementation, so that we can pass it the
		 * LiveConnect "java" object, which it will then use to load its JARs.
		 * Note that XPCOM Javascript code is not given LiveConnect by default.
		 */

		if (!semTurkeyBridge.wrappedJSObject.initialize(
				art_semanticturkey.JavaFirefoxSTBridge._packageLoader, true)) {
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
			prompts
					.alert(
							null,
							"Semantic Turkey Initialization Error",
							"Hi, there appears to be a problem with the xpcom bridge between mozilla and java.\n"
									+ "maybe this is not related to Semantic Turkey, and that something is wrong in the configuration of your host.\n\n"
									+ "Please give a look at this page:\n"
									+ "http://semanticturkey.uniroma2.it/documentation/#requirements\n"
									+ "and check if you need to change anything in your configuration.\n\n"
									+ "The following exception has been thrown:\n"
									+ semTurkeyBridge.wrappedJSObject.error);
		}
		// art_semanticturkey.evtMgr.fireEvent("st_started");
		
		art_semanticturkey.registerAnnotationFamilies();
	} catch (e) {
		art_semanticturkey.JavaFirefoxSTBridge._fail(e);
		art_semanticturkey.Logger.printException(e);
	}
	art_semanticturkey.ST_started.setStatus();
};

art_semanticturkey.registerAnnotationFamilies = function() {
	try {
		// // Bookmarking family
		var bookmarking = art_semanticturkey.annotation.AnnotationManager
				.createFamily("it.uniroma2.art.semanticturkey.annotation.bookmarking");
		bookmarking.setName("bookmarking");
		bookmarking.setDescription("Bookmarking family");

		// Bind conventional functions
		bookmarking.checkAnnotationsForContent = art_semanticturkey.annotation.bookmarking.checkAnnotationsForContent;
		bookmarking.getAnnotationsForContent = art_semanticturkey.STRequests.Annotation.getPageAnnotations;
		bookmarking.deleteAnnotation = art_semanticturkey.STRequests.Annotation.removeAnnotation;
		bookmarking.annotation2ranges = art_semanticturkey.annotation.bookmarking.annotation2ranges;
		bookmarking.furtherAnn = art_semanticturkey.annotation.bookmarking.furtherAnn;
		bookmarking.getAnnotatedContentResources = art_semanticturkey.STRequests.Annotation.getAnnotatedContentResources;

		// Register default handlers
		art_semanticturkey.annotation.commons.registerCommonHandlers(bookmarking);

		// Range annotation family
		var rangeannotation = art_semanticturkey.annotation.AnnotationManager
				.createFamily("it.uniroma2.art.semanticturkey.annotation.rangeannotation");
		rangeannotation.setName("range annotation");
		rangeannotation.setDescription("Range annotation family");

		// Bind conventional functions
		rangeannotation.checkAnnotationsForContent = art_semanticturkey.annotation.rangeannotation.checkAnnotationsForContent;
		rangeannotation.getAnnotationsForContent = art_semanticturkey.STRequests.RangeAnnotation.getPageAnnotations;
		rangeannotation.deleteAnnotation = art_semanticturkey.STRequests.RangeAnnotation.deleteAnnotation;
		rangeannotation.annotation2ranges = art_semanticturkey.annotation.rangeannotation.annotation2ranges;
		rangeannotation.furtherAnn = art_semanticturkey.annotation.rangeannotation.furtherAnn;
		rangeannotation.getAnnotatedContentResources = art_semanticturkey.STRequests.RangeAnnotation.getAnnotatedContentResources;
		
		// Register default handlers
		art_semanticturkey.annotation.commons.registerCommonHandlers(rangeannotation);
	} catch (e) {
		// TODO change this code with a unique object (module) to be invoked for
		// alerting the user
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
		prompts.alert(null, "Annotation Extension Point Initialization Error",
				"an error occurred during initialization of the Annotation Component:\n"
				// + e.getMessage());
				+ e.toString());
	}
};

// // Conventional functions for the bookmarking annotation family (BEGIN)
art_semanticturkey.annotation.bookmarking = {};

art_semanticturkey.annotation.bookmarking.checkAnnotationsForContent = function(contentId) {
	var responseXML = art_semanticturkey.STRequests.Annotation.chkAnnotation(contentId);
	var reply = responseXML.getElementsByTagName('reply')[0];
	var act = reply.getAttribute("status");
	return act == "ok";
};

// art_semanticturkey.annotation.bookmarking.getAnnotationsForContent =
// art_semanticturkey.STRequests.Annotation.getPageAnnotations;

// art_semanticturkey.annotation.bookmarking.deleteAnnotation =
// art_semanticturkey.STRequests.Annotation.removeAnnotation;

art_semanticturkey.annotation.bookmarking.annotation2ranges = function(document, annotation) {
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
	var finder = Components.classes["@mozilla.org/embedcomp/rangefind;1"].createInstance().QueryInterface(
			Components.interfaces.nsIFind);

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
	var responseXML = art_semanticturkey.STRequests.Annotation.createFurtherAnnotation(resource.getURI(),
			selection.toString(), doc.documentURI, doc.title);
};

// //Conventional functions for the bookmarking annotation family (END)

// //Conventional functions for the range annotation family (BEGIN)
art_semanticturkey.annotation.rangeannotation = {};

art_semanticturkey.annotation.rangeannotation.checkAnnotationsForContent = function(contentId) {
	var responseXML = art_semanticturkey.STRequests.RangeAnnotation.chkAnnotation(contentId);
	var reply = responseXML.getElementsByTagName('reply')[0];
	var act = reply.getAttribute("status");
	return act == "ok";
};

// art_semanticturkey.annotation.rangeannotation.getAnnotationsForContent =
// art_semanticturkey.STRequests.RangeAnnotation.getPageAnnotations;

// art_semanticturkey.annotation.rangeannotation.deleteAnnotation =
// art_semanticturkey.STRequests.RangeAnnotation.removeAnnotation;

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

// //Conventional functions for the range annotation family (END)

// art_semanticturkey.JavaFirefoxSTBridge.initialize();
