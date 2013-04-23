EXPORTED_SYMBOLS = [ "annotation" ];

Components.utils.import("resource://stmodules/Logger.jsm");
Components.utils.import("resource://stmodules/Preferences.jsm");

if (typeof annotation == "undefined") {
	var annotation = {};
}

annotation.AnnotationManager = (function() {
	var self = {};

	var families = {};
	
	self.createFamily = function(familyId) {
		if (typeof families[familyId] == "undefined") {
			var family = new annotation.Family(familyId);
			families[familyId] = family;
			return family;
		} else {
			throw new Error("Cannot create family \"" + familyId
					+ "\". A family with that name already exists");
		}
	};

	self.getFamily = function(familyId) {

		var family = families[familyId];

		if (typeof family == "undefined") {
			throw new Error("Family \"" + familyId + "\" does not exist");
		}
		
		return family;
	};

	self.getFamilies = function() {
		return families;
	};
	
	self.getDefaultFamily = function() {
		var defaultFamilyId = Preferences.get("extensions.semturkey.extpt.annotate");

		if (typeof defaultFamilyId == "undefined") {
			throw new Error("No default annotation family has been set");
		}
		
		var family = families[defaultFamilyId];
		
		if (typeof family == "undefined") {
			throw new Error("Default family \"" + defaultFamilyId + "\" has not been registered");
		}
		
		return family;
	};

	self.handleEvent = function(parentWindow, event, fallback) {
		var family = self.getDefaultFamily();

		var handlers = getSuitableHandlers(family, event);

		if (handlers.length == 0) {
			throw new Error("No registered or enabled functions for this event");			
		} else if (handlers.length == 1) {
			var fun = handlers[0].getBody();
			fun.call(family, event, parentWindow);
		} else {
			var parameters = {};
			parameters.event = event;
			parameters.family = family;
			parameters.handlers = handlers;
			var win = parentWindow.openDialog(
					"chrome://semantic-turkey/content/annotation/functionPicker/functionPicker.xul",
					"dlg", "modal=yes,resizable,centerscreen", parameters);
		}
	};

	var getSuitableHandlers = function(family, event) {
		var eventHandlerMap = family.getEventHandlerMap();
		var candidateHandlers = eventHandlerMap[event.name];

		var result = [];

		for ( var i = 0; i < candidateHandlers.length; i++) {
			var handler = candidateHandlers[i];

			if (handler.isEnabled() && handler.getPrecondition()(event)) {
				result.push(handler);
			}
		}

		return result;
	};

	return self;
})();

// Handlers and functions are meant to be invoked in the scope of a family, i.e.
// this instanceof Family
annotation.Family = function(familyId) {
	var self = {};

	var name;
	var description;

	self.getLabel = function() {
		return familyId;
	};

	self.setName = function(name) {
		self.name = name;
	};

	self.getName = function() {
		return self.name;
	};

	self.setDescription = function(description) {
		self.description = description;
	};

	self.getDescription = function() {
		return self.description;
	};

	var eventHandlerMap = {};
	eventHandlerMap["selectionOverResource"] = [];
	eventHandlerMap["resourceOverContent"] = [];
	eventHandlerMap["contentLoaded"] = [];

	self.addSelectionOverResourceHandler = function(label, body, precondition) {
		return addEventHandler("selectionOverResource", label, body, precondition);
	};

	self.addResourceOverContentHandler = function(label, body, precondition) {
		return addEventHandler("resourceOverContent", label, body, precondition);
	};

	self.addContentLoadedHandler = function(label, body, precondition) {
		return addEventHandler("contentLoaded", label, body, precondition);
	};

	var addEventHandler = function(eventName, label, body, precondition) {
		var handler = new annotation.EventHandler(label, body, precondition);
		eventHandlerMap[eventName].push(handler);
		return handler;
	};

	self.removeEventHandler = function(eventName, handler) {
		eventHandlerMap[eventName] = eventHandlerMap[eventName].splice(eventHandlerMap[eventName]
				.indexOf(handler), 1);
	};

	self.getEventHandlerMap = function() {
		return eventHandlerMap;
	};

	self.checkAnnotationsForContent = undefined;

	self.getAnnotationsForContent = undefined;

	self.getAnnotationsForResource = undefined;

	self.decorateContent = undefined;

	self.deleteAnnotation = undefined;

	self.furtherAnn = undefined;

	return self;
};

annotation.EventHandler = function(label, body, precondition) {
	var enabled = true;

	var self = this;

	if (typeof precondition == "undefined") {
		var precondition = annotation.Preconditions.Role.Any;
	}

	this.getLabel = function() {
		return label;
	};

	this.isEnabled = function() {
		return enabled;
	};

	this.setEnabled = function(isEnabled) {
		enabled = isEnabled;
	};

	this.getBody = function() {
		return body;
	};

	this.getPrecondition = function() {
		return precondition;
	};
}

annotation.Preconditions = {};
annotation.Preconditions.Role = {
	Cls : function(event) {
		return event.resource.getRole() == "cls";
	},
	Concept : function(event) {
		return event.resource.getRole() == "concept";
	},
	Any : function(event) {
		return true;
	}
};
