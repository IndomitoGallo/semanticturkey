EXPORTED_SYMBOLS = [ "annotation" ];

Components.utils.import("resource://stservices/SERVICE_Projects.jsm");
Components.utils.import("resource://stservices/SERVICE_Cls.jsm");
Components.utils.import("resource://stservices/SERVICE_SKOS.jsm");

Components.utils.import("resource://stmodules/AnnotationManager.jsm");


if (typeof annotation == "undefined") {
	var annotation = {};
}

annotation.commons = {};

/*
 * Common event handlers. They are assumed to be invoked in the context of a family
 * i.e. this instanceof Family). The family is assumed to have the function furtherAnn(event) for the creation
 * of a new annotation of the resource in the event.
 */

annotation.commons.handlers = {};
annotation.commons.handlers.furtherAnn = function(event) {
	this.furtherAnn(event);
};

annotation.commons.handlers.valueForProperty = function(event) {
	var parameters = {};
	parameters.event = event;
	parameters.subject = event.resource.getURI();
	parameters.object = event.selection.toString();
	parameters.lexicalization = event.selection.toString();
	parameters.functors = {};

	if (typeof event.skos != "undefined") {
		parameters.skos = Object.create(event.skos);
	}

	parameters.functors.addAnnotation = this.furtherAnn.bind(this);

	window.openDialog("chrome://semantic-turkey/content/class/annotator/annotator.xul", "_blank",
			"modal=yes,resizable,centerscreen", parameters);
};

annotation.commons.handlers.createNarrowerConcept = function(event) {
	var resource = event.resource;
	var doc = event.document;
	var selection = event.selection;

	var conceptScheme;

	if (typeof event.skos != "undefined" && typeof event.skos.conceptScheme != "undefined") {
		conceptScheme = event.skos.conceptScheme;
	} else {
		conceptScheme = STRequests.Projects.getProjectProperty("skos.selected_scheme",
				null).getElementsByTagName("property")[0].getAttribute("value");
	}

	var language = art_semanticturkey.Preferences.get("extensions.semturkey.annotprops.defaultlang", "en");

	try {
		var conceptResource = STRequests.SKOS.createConcept(selection.toString(), resource
				.getURI(), conceptScheme, selection.toString(), language);

		var event2 = Object.create(event);
		event2.resource = conceptResource;
		this.furtherAnn(event2);
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};

annotation.commons.handlers.createInstance = function(event) {
	try {
		var response1 = STRequests.Cls.addIndividual(event.resource.getURI(),
				event.selection.toString());
		var event2 = Object.create(event);
		event2.resource = response1.instance;

		this.furtherAnn(event2);
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};

annotation.commons.registerCommonHandlers = function(family) {
		family.addSelectionOverResourceHandler("Create instance", annotation.commons.handlers.createInstance,
				annotation.Preconditions.Role.Cls);
		family.addSelectionOverResourceHandler("Create narrower concept", annotation.commons.handlers.createNarrowerConcept,
				annotation.Preconditions.Role.Concept);
		family.addSelectionOverResourceHandler("Value for property", 
			annotation.commons.handlers.valueForProperty);
		family.addSelectionOverResourceHandler("Further annotation", annotation.commons.handlers.furtherAnn);
};