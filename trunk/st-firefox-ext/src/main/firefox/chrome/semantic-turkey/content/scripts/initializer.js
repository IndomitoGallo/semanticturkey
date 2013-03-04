Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Individual.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_SKOS.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Preferences.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Projects.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Annotation.jsm", art_semanticturkey);

art_semanticturkey.JavaFirefoxSTBridge.initialize = function() {
	try {
		/*
		 * Get a Foo component
		 */
		var semTurkeyBridge = art_semanticturkey.JavaFirefoxSTBridge
				.getSemanticTurkey();

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

art_semanticturkey.annotationRegister = function() {
	try {
		// initializes the annotation extension point, registering the
		// "bookmarking" service (the default one)
		var annComponent = Components.classes["@art.uniroma2.it/semanticturkeyannotation;1"]
		.getService(Components.interfaces.nsISemanticTurkeyAnnotation);
		
		// initialize family object
		var family = new annComponent.wrappedJSObject.Family("bookmarking");
		
		// initialize function object

		var furtherAnn = new annComponent.wrappedJSObject.functionObject(art_semanticturkey.furtherAnn,"Further annotation");
		var valueForProp = new annComponent.wrappedJSObject.functionObject(art_semanticturkey.valueForProperty,"Value for property");
		var createConcept = new annComponent.wrappedJSObject.functionObject(art_semanticturkey.createConcept,"Create a concept");
		var createInstance = new annComponent.wrappedJSObject.functionObject(art_semanticturkey.createInstance,"Create instance");
		var highlightAnnotations = new annComponent.wrappedJSObject.functionObject(art_semanticturkey.highlightAnnotations,"Highlight annotations");

		// add function to family
		family.addfunction("selectionOverResource", furtherAnn);
		family.addfunction("selectionOverResource", valueForProp);
		family.addfunction("selectionOverResource", createConcept);
		family.addfunction("selectionOverResource", createInstance);
		family.addfunction("highlightAnnotations",highlightAnnotations);

		// register bookmarking annotation family
		annComponent.wrappedJSObject.register(family);
		
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

art_semanticturkey.furtherAnn = function(event) {
	var resource = event.resource;
	var doc = event.document;
	var selection = event.selection;
	try {
		var responseXML = art_semanticturkey.STRequests.Annotation.createFurtherAnnotation(resource, selection.toString(), doc.documentURI, doc.title);
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.valueForProperty = function(event) {
	var parameters = {};
	parameters.event = event;
	parameters.subject = event.resource;
	parameters.object = event.selection.toString();
	parameters.lexicalization = event.selection.toString();
	parameters.urlPage = event.document.documentURI;
	parameters.title = event.document.title;
//	parameters.subjectInstanceName = listItem.getAttribute("label");
//	parameters.parentClsName = listItem.getAttribute("parentCls");
//	parameters.objectInstanceName = str;
//	parameters.urlPage = tabWin;
//	parameters.title = title;
//	parameters.tree = list;
//	parameters.parentWindow = parentWindow;
//	parameters.panelTree = document.getElementById("classesTree");
	parameters.functors = {};
	
	if (typeof event.skos != "undefined") {
		parameters.skos = Object.create(event.skos);
	}

	parameters.functors.addAnnotation = function(p) {				
		return art_semanticturkey.STRequests.Annotation.addAnnotation(p.urlPage, p.subject, p.lexicalization,p.title);
	};
	
	parameters.functors.relateAndAnnotateBindAnnot = function(p) {
		return art_semanticturkey.STRequests.Annotation.relateAndAnnotateBindAnnot(
				p.subject,
				p.predicate,
				p.object,
				p.urlPage,
				p.title,
				p.lexicalization);
	};
	
	window
			.openDialog(
					"chrome://semantic-turkey/content/class/annotator/annotator.xul",
					"_blank", "modal=yes,resizable,centerscreen",
					parameters);
};

art_semanticturkey.createConcept = function(event) {
	var resource = event.resource;
	var doc = event.document;
	var selection = event.selection;

	var conceptScheme;
	
	if (typeof event.skos != "undefined" && typeof event.skos.conceptScheme != "undefined") {
		conceptScheme = event.skos.conceptScheme;
	} else {
		conceptScheme = art_semanticturkey.STRequests.Projects.getProjectProperty("skos.selected_scheme", null).getElementsByTagName("property")[0].getAttribute("value");
	}
	
	var language = art_semanticturkey.Preferences.get("extensions.semturkey.annotprops.defaultlang" ,"en");
			
	try {
		var conceptResource = art_semanticturkey.STRequests.SKOS.createConcept(selection.toString(), resource, conceptScheme, selection.toString(), language);
		
		art_semanticturkey.STRequests.Annotation
			.createFurtherAnnotation(
				conceptResource.getURI(),
				selection.toString(),
				doc.documentURI,
				doc.title);		
	} catch(e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.createInstance = function(event) {
	try {		
		art_semanticturkey.STRequests.Annotation
			.createAndAnnotate(
				event.resource,
				event.selection.toString(),
				event.document.documentURI,
				event.document.title);		
	} catch(e) {
		alert(e.name + ": " + e.message);
	}
	
//	try {
//	var responseArray = parentWindow.art_semanticturkey.STRequests.Annotation
//			.createAndAnnotate(trecell.parentNode.parentNode
//							.getAttribute("className"), str,
//					tabWin, title);
//} catch (e) {
//	alert(e.name + ": " + e.message);
//}
//
//if(responseArray != null){
//	var tree = parentWindow.document.getElementById("classesTree");
//	parentWindow.art_semanticturkey.classDragDrop_RESPONSE(responseArray,tree,true,event);
//}
};

art_semanticturkey.highlightAnnotations = function() {
	// NScarpato add highlith for all occurence of annotations
	var url = gBrowser.selectedBrowser.currentURI.spec;
	try {
		var responseXML = art_semanticturkey.STRequests.Annotation
				.getPageAnnotations(url);
		art_semanticturkey.getPageAnnotations_RESPONSE(responseXML);
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.getPageAnnotations_RESPONSE = function(responseElement) {
	var annotations = responseElement.getElementsByTagName('Annotation');
	for (var i = 0; i < annotations.length; i++) {
		var valueToHighlight = annotations[i].getAttribute("value");
		highlightStartTag = "<font style='color:blue; background-color:yellow;'>";
		highlightEndTag = "</font>";
		art_semanticturkey.highlightSearchTerms(valueToHighlight, true, true,
				highlightStartTag, highlightEndTag);
	}
};

art_semanticturkey.annotationRegister();
// art_semanticturkey.JavaFirefoxSTBridge.initialize();
