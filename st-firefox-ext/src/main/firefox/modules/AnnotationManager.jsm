EXPORTED_SYMBOLS = [ "annotation" ];

Components.utils.import("resource://stmodules/Logger.jsm");

if (typeof annotation == "undefined") {
	var annotation = {};
}

annotation.AnnotationManager = (function() {
	var self = {};

	var families = {};

	self.getFamily = function(familyId, creationAllowed) {
		Logger.debug("Requested family \"" + familyId + "\"");

		var family = families[familyId];
		
		if (typeof family == "undefined" && creationAllowed) {
			family = families[familyId] = new annotation.Family(familyId);
			Logger.debug("Created new family");
		}
		
		return family;
	};
	
	self.getFamilies = function() {
		return families;
	};
	
	self.handleEvent = function(parentWindow, event, fallback) {	
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
		                      .getService(Components.interfaces.nsIPrefBranch);
		var familyId = prefs.getCharPref("extensions.semturkey.extpt.annotate");
		
		if (typeof families[familyId] != "undefined") {
			var family = families[familyId];
			var handlers = getSuitableHandlers(familyId, event);

			if (handlers.length == 0) {
				if (typeof fallback != "undefined") {
					fallback(event);
				} else {
					parentWindow.alert("No registered or enabled functions for this event");
				}
			} else if (handlers.length == 1) {
				var fun = handlers[0].getBody();
				fun.call(family, event, parentWindow);
			} else {
					var parameters = {};
					parameters.event = event;
					parameters.family = family;
					parameters.handlers = handlers;
					var win = parentWindow.openDialog("chrome://semantic-turkey/content/annotation/functionPicker/functionPicker.xul", "dlg", "modal=yes,resizable,centerscreen", parameters);			
			}
		} else {
			if (typeof fallback != "undefined") {
				fallback(event);
			} else {
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
		                                .getService(Components.interfaces.nsIPromptService);
				prompts.alert(null, familyName
						+ " annotation family not registered ", familyName
						+ " not registered annotation type reset to bookmarking");
				prefs.setCharPref("extensions.semturkey.extpt.annotate", "bookmarking");
			}
		}
	};
	
	var getSuitableHandlers = function(familyId, event) {
		var family = families[familyId];
		var eventHandlerMap = family.getEventHandlerMap();
		var candidateHandlers = eventHandlerMap[event.name];
		
		var result = [];
		
		for (var i = 0 ; i < candidateHandlers.length ; i++) {
			var handler = candidateHandlers[i];
			
			if (handler.isEnabled() && handler.getPrecondition()(event)) {
				result.push(handler);
			}
		}
		
		return result;
	};
	
	return self;
})();

// Handlers and functions are meant to be invoked in the scope of a family, i.e. this instanceof Family
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
