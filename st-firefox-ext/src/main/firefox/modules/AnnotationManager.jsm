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
			parameters.parentWindow = parentWindow;
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

	self.addSelectionOverResourceHandler = function(label, messageTemplate, body, precondition) {
		return addEventHandler("selectionOverResource", label, messageTemplate, body, precondition);
	};

	self.addResourceOverContentHandler = function(label, messageTemplate, body, precondition) {
		return addEventHandler("resourceOverContent", label, messageTemplate, body, precondition);
	};

	self.addContentLoadedHandler = function(label, body, precondition) {
		return addEventHandler("contentLoaded", label, null, body, precondition);
	};

	var addEventHandler = function(eventName, label, messageTemplate, body, precondition) {
		var handler = new annotation.EventHandler(label, messageTemplate, body, precondition);
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

annotation.EventHandler = function(label, messageTemplate, body, defaultPreconditionSpec) {
	var enabled = true;
	var precondition;
	var preconditionRestrictionSpec = "";
	
	var self = this;

	if (typeof defaultPreconditionSpec == "undefined") {
		defaultPreconditionSpec = "Role.Any";
	}
	
	var preconditionSpec = defaultPreconditionSpec;

	try {
		precondition = parsePrecondition(defaultPreconditionSpec);
	} catch(e) {
		precondition = annotation.Role.Any;
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
	
	this.getDefaultPreconditionSpec = function() {
		return defaultPreconditionSpec;
	};
	
	this.getPreconditionSpec = function() {
		return preconditionSpec;
	};
	
	this.getPreconditionRestrictionSpec = function() {
		return preconditionRestrictionSpec;
	};
	
	this.setPreconditionRestrictionSpec = function(spec) {
		spec = spec.trim();
		
		preconditionRestrictionSpec = spec;
		
		if (spec == "") {
			preconditionSpec = defaultPreconditionSpec;
		} else {
			preconditionSpec = defaultPreconditionSpec + " and (" + spec + ")";
		}
	
		try {
			precondition = parsePrecondition(preconditionSpec);
		} catch(e) {
			precondition = annotation.Role.Any;
		}
	};
	
	this.getMessageTemplate = function() {
		return messageTemplate;
	};
}

annotation.Preconditions = {};
annotation.Preconditions.Role = {
	Any : function(event) {
		return true;
	},
	Undetermined : function(event) {
		return event.resource.getRole() == "undetermined";
	},
	Cls : function(event) {
		return event.resource.getRole() == "cls";
	},
	Individual : function(event) {
		return event.resource.getRole() == "individual";
	},
	Property : function(event) {
		return event.resource.getRole() == "property";
	},
	ObjectProperty : function(event) {
		return event.resource.getRole() == "objectProperty";
	},
	DatatypeProperty : function(event) {
		return event.resource.getRole() == "datatypeProperty";
	},
	AnnotationProperty : function(event) {
		return event.resource.getRole() == "annotationProperty";
	},
	OntologyProperty : function(event) {
		return event.resource.getRole() == "ontologyProperty";
	},
	Ontology : function(event) {
		return event.resource.getRole() == "ontology";
	},
	DataRange : function(event) {
		return event.resource.getRole() == "dataRange";
	},
	Concept : function(event) {
		return event.resource.getRole() == "concept";
	},
	ConceptScheme : function(event) {
		return event.resource.getRole() == "conceptScheme";
	},
	XLabel : function(event) {
		return event.resource.getRole() == "xLabel";
	}
};
annotation.Preconditions.True = function(event) {
	return true;
};
annotation.Preconditions.False = function(event) {
	return false;
};

function parsePrecondition(expression, debug) {
    function getPreconditionObject(atom) {
        var components = atom.split(".");
        
        var obj = annotation.Preconditions;
        
        for (var i = 0 ; i < components.length ; i++) {
            var key = components[i];
            
            if (key == "") return null;
            
            if (typeof obj[key] != "undefined") {
                obj = obj[key];
            } else {
                return null;
            }
        }
        
        if (typeof obj != "function") {
            return null;
        } else {
            return obj;
        }
    }
    
    function tokenize(expression) {
        const WS = new RegExp("^[\\x20\\x09\\x0D\\x0A]+");
		const ATOM = new RegExp("^[A-Za-z\\.]+");
		const punct = /^(\(|\)|and|or|not)/;
		
        var input = [];

        while (expression != "") {
            var consumed = expression.match(WS);
            
            if (consumed != null) {
                expression = expression.substring(consumed[0].length);
                continue;
            }
            
            var consumedAtom  = expression.match(ATOM);
            var consumedPunct = expression.match(punct);

            if (consumedAtom != null) {
            	if (consumedPunct != null) {
            		if (consumedPunct[0].length >= consumedAtom[0].length) {
            			consumed = consumedPunct;
            		} else {
            			consumed = consumedAtom;
            		}
            	} else {
            		consumed = consumedAtom;
            	}
            } else {
            	consumed = consumedPunct;
            }
            
            if (consumed != null) {
                expression = expression.substring(consumed[0].length);
                input.push(consumed[0]);
                continue;
            }
                        
            if (consumed == null) {
                throw new Error("Cannot parse the input");
            }
        }
        
        return input;
    }
    
    debug = debug || false;
    
    var prio_table = {};
    prio_table["("] = 0;
    prio_table["or"] = 1;
    prio_table["and"] = 2;
    prio_table["not"] = 3;
    prio_table[")"] = 0;

    var ops = {};
    ops["or"] = function(a1, a2) {
        return function(event) {
            return a1(event) || a2(event);
        }
    };
    ops["and"] = function(a1, a2) {
        return function(event) {
            return a1(event) && a2(event);
        }
    };
    ops["not"] = function(a1) {
        return function(event) {
            return !a1(event);
        }
    };

    var valueStack = [];
    var opStack = [];

    var valueExpected = true;  // expect a primary, ie. atom, not, (
    
    var input = tokenize(expression);
    
    for (var i = 0 ; i < input.length ; i++) {        
        var token = input[i];

        
        var prio = prio_table[token];
        
        if (typeof prio == "undefined") { // terminal
            if (!valueExpected) throw new Error("Operand expected, but operator " + token.quote() + " given");
            
            var tokenObj = getPreconditionObject(token);
            if (tokenObj == null) throw new Error("Unexisting atom " + token.quote());
            
            if (debug) {
                valueStack.push(token);
            } else {     
                valueStack.push(getPreconditionObject(token));
            }
            valueExpected = false;
        } else {
            if (valueExpected && token != "(" && token != "not") {
                throw new Error("Operand expected, but " + token.quote() + " given");
            } else if (!valueExpected && (token == "(" || token == "not")) {
                throw new Error("Operator expected, but " + token.quote() + " given");
            }
            
            if (token != "(") {
                while (opStack.length > 0) {
                    var top_op = opStack[opStack.length - 1];
                    var top_prio = prio_table[top_op];
                    
                    var isLeftAssociative = top_op != "not";
                    var isBinary = top_op != "not";
                    
                    if (top_op == "(") {
                        break;
                    }
                    
                    if (top_prio > prio || (top_prio == prio && isLeftAssociative)) {
                        if (isBinary) {
                            var v2 = valueStack.pop();
                            var v1 = valueStack.pop();
                            
                            var op = opStack.pop();
                            
                            if (debug) {
                                valueStack.push("(" + v1 + " " + op + " " + v2 + ")");
                            } else {
                                valueStack.push(ops[op](v1, v2));
                            }
                        } else {
                            var v = valueStack.pop();
                            var op = opStack.pop();
                            
                            if (debug) {
                                valueStack.push("(" + op + " " + v + ")");
                            } else {
                                valueStack.push(ops[op](v));
                            }
                        }                    
                    } else {
                        break;
                    }
                }
            }
            
            if (token == ")") {
                if (opStack.length == 0 || opStack[opStack.length - 1] != "(") {
                 throw new Error("Unmatched \")\"");
                }
                opStack.pop();
                valueExpected = false;
            } else {
                valueExpected = true;
                opStack.push(token);
            }
        }
    }
    
    if (valueExpected && opStack.length > 0) {
        throw new Error("Operand expected, but end of expression reached");
    }
    
    while (opStack.length > 0) {
        var top_op = opStack.pop();
        var isBinary = top_op != "not";
        
        if (top_op == "(") {
            throw new Error("Unmatched \"(\"");
        }
        
        if (isBinary) {
            var v2 = valueStack.pop();
            var v1 = valueStack.pop();
            
            if (debug) {
                valueStack.push("(" + v1 + " " + top_op + " " + v2 + ")");
            } else {
                valueStack.push(ops[top_op](v1, v2));
            }
        } else {
            var v = valueStack.pop();
            
            if (debug) {
                valueStack.push("(" + top_op + " " + v + ")");
            } else {
                valueStack.push(ops[top_op](v));
            }
        }                    
    }
    
    if (valueStack.length > 1) {
        throw new Error("Parsing failure");
    }
    
    return valueStack[0] || (debug ? "True" : annotation.Preconditions.True);
}

annotation.testHook = {};
annotation.testHook.parsePrecondition = parsePrecondition;