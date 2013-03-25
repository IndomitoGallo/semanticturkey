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
	} catch (e) {
		art_semanticturkey.JavaFirefoxSTBridge._fail(e);
		art_semanticturkey.Logger.printException(e);
	}
	art_semanticturkey.ST_started.setStatus();
};

art_semanticturkey.registerAnnotationFamilies = function() {
	try {
		// Bookmarking family
		var bookmarking = art_semanticturkey.annotation.AnnotationManager
				.getFamily("it.uniroma2.art.semanticturkey.annotation.bookmarking", true);
		bookmarking.setName("bookmarking");
		bookmarking.setDescription("Bookmarking family");
		// Bind conventional functions
		bookmarking.checkAnnotationsForContent = function(contentId) {
			var responseXML = art_semanticturkey.STRequests.Annotation.chkAnnotation(contentId);
			var reply = responseXML.getElementsByTagName('reply')[0];
			var act = reply.getAttribute("status");
			return act == "ok";
		};
		bookmarking.getAnnotationsForContent = function(contentId) {
			return art_semanticturkey.STRequests.Annotation.getPageAnnotations(contentId);
		};
		bookmarking.decorateContent = function(annotations) {
			for ( var i = 0; i < annotations.length; i++) {
				var valueToHighlight = annotations[i].value;
				highlightStartTag = "<font style='color:blue; background-color:yellow;'>";
				highlightEndTag = "</font>";
				art_semanticturkey.highlightSearchTerms(valueToHighlight, true, true, highlightStartTag,
						highlightEndTag);
			}
		};
		bookmarking.furtherAnn = function(event) {
			var resource = event.resource;
			var doc = event.document;
			var selection = event.selection;
			try {
				var responseXML = art_semanticturkey.STRequests.Annotation.createFurtherAnnotation(resource.getURI(),
						selection.toString(), doc.documentURI, doc.title);
			} catch (e) {
				alert(e.name + ": " + e.message);
			}
		};
		// Register default handlers
		art_semanticturkey.annotation.commons.registerCommonHandlers(bookmarking);
		
		var xptrService = Components.classes["@mozilla.org/xpointer-service;1"].getService();
		xptrService = xptrService.QueryInterface(Components.interfaces.nsIXPointerService);
		
		// Range annotation family
		var rangeannotation = art_semanticturkey.annotation.AnnotationManager
				.getFamily("it.uniroma2.art.semanticturkey.annotation.rangeannotation", true);
		rangeannotation.setName("range annotation");
		rangeannotation.setDescription("Range annotation family");
		// Bind conventional functions
		rangeannotation.checkAnnotationsForContent = function(contentId) {
			var responseXML = art_semanticturkey.STRequests.Annotation.chkAnnotation(contentId);
			var reply = responseXML.getElementsByTagName('reply')[0];
			var act = reply.getAttribute("status");
			return act == "ok";
		};
		rangeannotation.getAnnotationsForContent = function(contentId) {
			return art_semanticturkey.STRequests.RangeAnnotation.getPageAnnotations(contentId);
		};
		rangeannotation.decorateContent = function(document, annotations) {
			var mozIJSSubScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
            .getService(Components.interfaces.mozIJSSubScriptLoader);
			mozIJSSubScriptLoader.loadSubScript("chrome://semantic-turkey/content/scripts/temp.js?time=" + new Date().getTime());
			temp(document, annotations, this.deleteAnnotation.bind(this));
		};
		rangeannotation.deleteAnnotation = art_semanticturkey.STRequests.RangeAnnotation.deleteAnnotation;
		rangeannotation.furtherAnn = function(event) {
			var resource = event.resource;
			var doc = event.document;
			var selection = event.selection;
			try {
				var xptrString = xptrService.createXPointerFromSelection(
						window._content.getSelection(), window._content.document);
				var responseXML = art_semanticturkey.STRequests.RangeAnnotation.addAnnotation(resource.getURI(),
						selection.toString(), doc.documentURI, doc.title, xptrString);
			} catch (e) {
				alert(e.name + ": " + e.message);
			}
		};
		
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

art_semanticturkey.registerAnnotationFamilies();
// art_semanticturkey.JavaFirefoxSTBridge.initialize();
