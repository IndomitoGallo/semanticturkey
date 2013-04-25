EXPORTED_SYMBOLS = [ "annotation" ];

Components.utils.import("resource://gre/modules/Services.jsm");

Components.utils.import("resource://stservices/SERVICE_Projects.jsm");
Components.utils.import("resource://stservices/SERVICE_Cls.jsm");
Components.utils.import("resource://stservices/SERVICE_SKOS.jsm");

Components.utils.import("resource://stmodules/Logger.jsm");
Components.utils.import("resource://stmodules/AnnotationManager.jsm");
Components.utils.import("resource://stmodules/Preferences.jsm");

if (typeof annotation == "undefined") {
	var annotation = {};
}

annotation.commons = {};

/*
 * Common event handlers. They are assumed to be invoked in the context of a
 * family i.e. this instanceof Family). The family is assumed to have the
 * function furtherAnn(event) for the creation of a new annotation of the
 * resource in the event.
 */

annotation.commons.handlers = {};

// Creates an annotation for the given resource and content. This common handler
// depends on the availability of conventional function "furtherAnn".
annotation.commons.handlers.furtherAnn = function(event) {
	this.furtherAnn(event);
};

// Handles the loading of a content into a tab. This common handler depends on
// the availability of conventional function "checkAnnotationsForContent".
annotation.commons.handlers.contentLoaded = function(event) {
	var contentId = event.document.documentURI;

	if (typeof this.checkAnnotationsForContent != "undefined") {
		var act = this.checkAnnotationsForContent(contentId);
		event.document.setUserData("stAnnotationsExist", "" + act, null);
	}
};

// Sets the value for a property. This common handler depends on the
// availability
// of the common function "furtherAnn".
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

	// A Browser Window: needed for accessing eventObjects and rangy (because
	// they are not modules)
	var window = Services.wm.getMostRecentWindow("navigator:browser");

	window.openDialog("chrome://semantic-turkey/content/class/annotator/annotator.xul", "_blank",
			"modal=yes,resizable,centerscreen", parameters);
};

// Creates a narrower (sub)concept. This common handler depends on the
// availability
// of the common function "furtherAnn".
annotation.commons.handlers.createNarrowerConcept = function(event) {
	var resource = event.resource;
	var doc = event.document;
	var selection = event.selection;

	var conceptScheme;

	if (typeof event.skos != "undefined" && typeof event.skos.conceptScheme != "undefined") {
		conceptScheme = event.skos.conceptScheme;
	} else {
		conceptScheme = STRequests.Projects.getProjectProperty("skos.selected_scheme", null)
				.getElementsByTagName("property")[0].getAttribute("value");
	}

	var language = Preferences.get("extensions.semturkey.annotprops.defaultlang", "en");

	var conceptResource = STRequests.SKOS.createConcept(selection.toString(), resource.getURI(),
			conceptScheme, selection.toString(), language);

	var event2 = Object.create(event);
	event2.resource = conceptResource;
	this.furtherAnn(event2);
};

// Creates an instance. This common handler depends on the availability
// of the common function "furtherAnn".
annotation.commons.handlers.createInstance = function(event) {
	var response1 = STRequests.Cls.addIndividual(event.resource.getURI(), event.selection.toString());
	var event2 = Object.create(event);
	event2.resource = response1.instance;

	this.furtherAnn(event2);
};

/*
 * Common conventional functions. They are assumed to be invoked in the context
 * of a family i.e. this instanceof Family).
 * 
 * A concrete family is assumed to provide just the following conventional
 * functions.
 * 
 * checkAnnotationsForContent: to check the existence of any annotation for the
 * given content resource
 * 
 * getAnnotationsForContent: to retrieve the annotations for a content resource
 * 
 * deleteAnnotation: to delete an annotation
 * 
 * annotation2ranges: to produce DOM ranges for the presentation of a Web
 * annotation
 * 
 * furtherAnn: to create a further annotation
 * 
 * Other conventional functions are suitably implemented by the framework.
 */
annotation.commons.conventions = {};

// Decorates a content resource with annotations attached to it. This
// conventional functions depends on the availability of the conventional
// function "annotation2ranges"
annotation.commons.conventions.decorateContent = function(document, annotations) {
	// A Browser Window: needed for accessing eventObjects and rangy (because
	// they are not modules)
	var window = Services.wm.getMostRecentWindow("navigator:browser");

	// Local variable bound to this object for the use within inner functions
	var self = this;

	// Add CSS style, if not already there
	var stStyleElement = document.getElementById("st-style-element");

	if (stStyleElement == null) {
		var stStyleElement = document.createElement("style");
		stStyleElement.setAttribute("id", "st-style-element");
		stStyleElement.type = "text/css";
		stStyleElement.innerHTML = ".st-annotation { background-color: yellow; cursor: pointer; }";
		document.body.appendChild(stStyleElement);

		// This is the first time the document is highlighted

		// Set the event handler for the click
		document.addEventListener("click", function(e) {
			if (e.target.classList.contains("st-annotation")) {
				e.preventDefault(); // to avoid that a click on a link causes
				// the change of page
				var ann = e.target.stAnnotation;

				if (typeof ann != "undefined" && typeof self.deleteAnnotation != "undefined"
						&& typeof ann.id != "undefined") {
					var panel = window.document.createElement("panel");
					var b = window.document.createElement("button");
					b.setAttribute("label", "Delete Annotation");
					panel.appendChild(b);
					b.addEventListener("command", function() {
						try {
							self.deleteAnnotation(ann.id);
						} catch (e) {
							alert(e);
						}
						panel.hidePopup();
					}, false);

					panel.onpopuphidden = function(e) {
						e.target.parentNode.removeChild(e.target);
					};
					window.document.documentElement.appendChild(panel);
					panel.openPopup(e.target, "after_pointer", 0, 0, true, false);
				}
			}
		}, true);

		// Register an event handler for the unload, in order to deregister ST
		// event handlers
		document.addEventListener("unload", function(event) {
			if (typeof event.target.stEventArray != "undefined") {
				event.target.stEventArray.deregisterAllListener();
			}
		}, false);
	}

	// Deregister previous event listeners, if any.
	if (typeof document.stEventArray != "undefined") {
		document.stEventArray.deregisterAllListener();
		document.stEventArray = undefined;
	}

	// Initialize rangy
	window.rangy.init();

	// Delete previous annotations
	var bodyRange = window.rangy.createRange();
	bodyRange.selectNode(document.body);
	var cssApplier = window.rangy.createCssClassApplier("st-annotation", {
		normalize : false
	});
	cssApplier.undoToRange(bodyRange);
	bodyRange.detach();

	// Highlight annotations
	for ( var i = 0; i < annotations.length; i++) {
		var ann = annotations[i];
		// Get DOM ranges for i-th annotations
		var ranges = this.annotation2ranges(document, ann);

		// Highlight each range
		for ( var k = 0; k < ranges.length; k++) {
			var range = ranges[k];

			var range2 = window.rangy.createRangyRange(document);
			range2.setStart(range.startContainer, range.startOffset);
			range2.setEnd(range.endContainer, range.endOffset);

			var cssApplier = window.rangy.createCssClassApplier("st-annotation", {
				normalize : false,
				elementProperties : {
					stAnnotation : ann,
				}
			});

			cssApplier.applyToRange(range2);

			range.detach();
			range2.detach();
		}
	}

	// Register listeners for the deletion of annotations
	document.stEventArray = new window.art_semanticturkey.eventListenerArrayClass();

	document.stEventArray.addEventListenerToArrayAndRegister("annotationDeleted", function(eventId,
			rangeAnnotationDeletedObj) {
		try {
			var ann = null;

			annotations.filter(function(ann) { // There should be at most one
				// annotation for the deleted ID
				return ann.id == rangeAnnotationDeletedObj.getId();
			}).forEach(function(ann) { // Process those annotations
				self.annotation2ranges(document, ann).forEach(function(range) {
					var rangyRange = window.rangy.createRangyRange();
					rangyRange.setStart(range.startContainer, range.startOffset);
					rangyRange.setEnd(range.endContainer, range.endOffset);

					var cssApplier = window.rangy.createCssClassApplier("st-annotation", {
						normalize : false
					});

					cssApplier.undoToRange(rangyRange);
					rangyRange.detach();
					range.detach();
				});
			});
		} catch (e) {
			alert(e.message + ":" + e.lineNumber);
		}
	}, null);
};

annotation.commons.registerCommonHandlers = function(family) {
	family.addContentLoadedHandler("Default handler", annotation.commons.handlers.contentLoaded);
	family.addSelectionOverResourceHandler("Create instance", annotation.commons.handlers.createInstance,
			annotation.Preconditions.Role.Cls);
	family.addSelectionOverResourceHandler("Create narrower concept",
			annotation.commons.handlers.createNarrowerConcept, annotation.Preconditions.Role.Concept);
	family
			.addSelectionOverResourceHandler("Value for property",
					annotation.commons.handlers.valueForProperty);
	family.addSelectionOverResourceHandler("Further annotation", annotation.commons.handlers.furtherAnn);

	family.decorateContent = annotation.commons.conventions.decorateContent;
};