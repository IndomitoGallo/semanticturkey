var EXPORTED_SYMBOLS = ["CommandBroker", "MenuPopupTrackerAdapter", "ToolbarTrackerAdapter"];

Components.utils.import("resource://stmodules/Logger.jsm");
Components.utils.import("resource://stmodules/Preferences.jsm");

var CommandBroker = (function(){
	var broker = {};
	
	var topics = {};
	
	broker.offerCommand = function(topicName, command) {		
		if (typeof topics[topicName] == "undefined") {
			topics[topicName] = {commands : [], trackers : []};
		}
		
		var topic = topics[topicName];
		var trackers = topic.trackers;
		
		if (topic.commands.indexOf(command) == -1) {
			topic.commands.push(command);
			
			for (var i = 0 ; i < trackers.length ; i++) {
				trackers[i].commandOffered(command);
			}
		}	
	};
	
	broker.withdrawCommand = function(command) {
		for(topicName in topics) {
			var topic = topics[topicName];
			
			if (topic.commands.indexOf(command) != -1) {
				topic.trackers.commandWithdrawn(command);
				topic.commands = topic.commands.filter(function(e){return e != command;});
			}
		}
	};
	
	broker.registerTracker = function(tracker) {
		if (typeof topics[tracker.topicName] == "undefined") {
			topics[tracker.topicName] = {commands : [], trackers : []};
		}
		
		var topic = topics[tracker.topicName];
				
		topic.trackers.push(tracker);
		
		for (var i = 0 ; i < topic.commands.length ; i++) {
			tracker.commandOffered(topic.commands[i]);
		}
		
		return tracker;
	};
	
	broker.unregisterTracker = function(tracker) {
		if (typeof topics[tracker.topicName] == "undefined") {
			return;
		}
		
		var topic = topics[tracker.topicName];
				
		topic.trackers = topic.trackers.filter(function(e){return e != tracker;});
		
		return tracker;
	};
	
	return broker;
})();

/*
 * A command is an object with the following properties/methods:
 * - do()
 * - image
 * - label
 * - tooltiptext
 */
 

function MenuPopupTrackerAdapter(topicName, host, menupopup, isGlobalScope) {
	this.topicName = topicName;
		
	var document = menupopup.ownerDocument;
	
	var listeners = [];
	
	if (typeof isGlobalScope == "undefined") {
		isGlobalScope = false;
	}
		
	this.notifyStateChanged = function(state) {
		for (var i = 0 ; i < listeners.length ; i++) {		
			var l = listeners[i];
			
			var enabled = l(state);
			
			if (!enabled && state.indexOf("itemSelected") != -1 && isGlobalScope) {
				var state2 = state.filter(function(e){return e != "itemSelected";});
				
				var enabled2 = l(state2);
				
				if (!enabled2) {
					l(state);
				}
			}
		}
	};
	
	if (typeof host._addStateChangedListener != "undefined") {
		host._addStateChangedListener(this.notifyStateChanged);	
	}
	
	this.commandOffered = function(command) {
		
		var newButton = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menuitem");
		
		if (typeof command.label != "undefined") {
			newButton.setAttribute("label", command.label);
		}

		if (typeof command.image != "undefined") {
			newButton.setAttribute("image", command.image);
		}
		
		if (typeof command.do != "undefined") {
			newButton.addEventListener("command", function(event){
				command.do(host);
			},false);
		}
		
		menupopup.appendChild(newButton);
		
		var l = function (state) {
				var enabled = true;
				
				enabled = enabled && (state.indexOf("powerOn") != -1);

				if (typeof command.checkEnabled != "undefined") {
					enabled = enabled && command.checkEnabled(state);
				}
				
				newButton.setAttribute("disabled", enabled ? "false" : "true");	
				
				return enabled;		
			};
		
		
		listeners.push(l);
		
		if (typeof host._getState != "undefined") {
			l(host._getState());
		}
	};
	
	this.commandWithdrawn = function(command) {
	
	};
};

function ToolbarTrackerAdapter(topicName, host, toolbar, isGlobalScope) {
	this.topicName = topicName;
	
	var document = toolbar.ownerDocument;

	var listeners = [];

	if (typeof isGlobalScope == "undefined") {
		isGlobalScope = false;
	}

	this.notifyStateChanged = function(state) {
		for (var i = 0 ; i < listeners.length ; i++) {
			var l = listeners[i];
			
			var enabled = l(state);
			
			if (!enabled && state.indexOf("itemSelected") != -1 && isGlobalScope) {
				var state2 = state.filter(function(e){return e != "itemSelected";});
				
				var enabled2 = l(state2);
				
				if (!enabled2) {
					l(state);
				}
			}
		}
	};
	
	if (typeof host._addStateChangedListener != "undefined") {
		host._addStateChangedListener(this.notifyStateChanged);	
	}
	
	this.commandOffered = function(command) {
		
		var newButton = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "toolbarbutton");
		
		if (typeof command.label != "undefined") {
			newButton.setAttribute("tooltip", command.label);
		}
		
		if (typeof command.tooltiptext != "undefined") {
			newButton.setAttribute("tooltiptext", command.tooltiptext);
		}
		
		if (typeof command.image != "undefined") {
			newButton.setAttribute("image", command.image);
		}
		
		if (typeof command.do != "undefined") {
			newButton.addEventListener("command", function(event){
				command.do(host);
			},false);
		}
		
		toolbar.appendChild(newButton);
		
		var l = function (state) {
				var enabled = true;
				
				enabled = enabled && (state.indexOf("powerOn") != -1);

				if (typeof command.checkEnabled != "undefined") {
					enabled = enabled && command.checkEnabled(state);
				}
				
				newButton.disabled =  !enabled;
				
				return enabled;		
			};
		
		listeners.push(l);
			
		if (typeof host._getState != "undefined") {
			l(host._getState());
		}	
	};
	
	this.commandWithdrawn = function(command) {
	
	};
};


Components.utils.import("resource://stservices/SERVICE_SKOS.jsm");

CommandBroker.offerCommand("skos:concept*edit",
	{
		label : "Create Top Concept",
		tooltiptext : "Create Top Concept",
		image : "chrome://semantic-turkey/skin/images/skosC_create.png",
		do : function(host) {

			try{
				var obj = {};
				obj.wrappedJSObject = obj;

				var windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
				                     .getService(Components.interfaces.nsIWindowMediator);                  
                var pWin = windowMediator.getMostRecentWindow("navigator:browser");
				
				var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
				                   .getService(Components.interfaces.nsIWindowWatcher);
				var win = ww.openWindow(pWin, "chrome://semantic-turkey/content/skos/widget/conceptTree/impl/createConceptDialog.xul", "dlg", "modal", obj);
								
				if (obj.out == null) return;
				
				var prefLabel = obj.out.prefLabel.valueOf();
				var prefLabelLanguage = obj.out.prefLabel.language;
				
				prefLabel = prefLabel.trim();
				
				if (prefLabel == "") {
					prefLabel = null;
					prefLabelLanguage = null;
				}
				
				var language = null;
				
				if (Preferences.get("extensions.semturkey.skos.humanReadable", false)) {
					language = Preferences.get("extensions.semturkey.annotprops.defaultlang", "en");
				}
				
				var responseXML=STRequests.SKOS.createConcept(obj.out.name, null, host.conceptScheme, prefLabel, prefLabelLanguage, language);
			}catch (e) {
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
				prompts.alert(null,"Exception", e.name + ": " + e.message);
			}
		},
		checkEnabled : function(state) {
	        	if (state.indexOf("mutable") == -1) {
				return false;
			}
			
			if (state.indexOf("itemSelected") != -1) {
				return false;
			}
			
			return true;
		}
	}
);

CommandBroker.offerCommand("skos:concept*edit",
	{
		label : "Create Narrower Concept",
		tooltiptext : "Create Narrower Concept",
		image : "chrome://semantic-turkey/skin/images/skosC_addNarrower.png",
		do : function(host) {
			var conceptQName = host.selectedConcept;
			
			if (conceptQName == null) return;

			try{
				var obj = {};
				obj.wrappedJSObject = obj;
				
				var windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
				                     .getService(Components.interfaces.nsIWindowMediator);                  
                var pWin = windowMediator.getMostRecentWindow("navigator:browser");
				
				var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
				                   .getService(Components.interfaces.nsIWindowWatcher);
                
				var win = ww.openWindow(pWin, "chrome://semantic-turkey/content/skos/widget/conceptTree/impl/createConceptDialog.xul", "dlg", "modal", obj);				
				
				if (obj.out == null) return;
				
				var prefLabel = obj.out.prefLabel.valueOf();
				var prefLabelLanguage = obj.out.prefLabel.language;
				
				prefLabel = prefLabel.trim();
				
				if (prefLabel == "") {
					prefLabel = null;
					prefLabelLanguage = null;
				}
				
				var language = null;
				
				if (Preferences.get("extensions.semturkey.skos.humanReadable", false)) {
					language = Preferences.get("extensions.semturkey.annotprops.defaultlang", "en");
				}
				
				var responseXML=STRequests.SKOS.createConcept(obj.out.name, conceptQName, host.conceptScheme, prefLabel, prefLabelLanguage, language);
			}catch (e) {
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
				prompts.alert(null,"Exception", e.name + ": " + e.message);
			}
		},
		checkEnabled : function(state) {
	        	if (state.indexOf("mutable") == -1) {
				return false;
			}
			
			if (state.indexOf("itemSelected") == -1) {
				return false;
			}
			
			return true;
		}
	}
);

CommandBroker.offerCommand("skos:concept*edit",
	{
		label : "Delete Concept",
		tooltiptext : "Delete Concept",
		image : "chrome://semantic-turkey/skin/images/skosC_delete.png",
		do : function(host) {
			var conceptQName = host.selectedConcept;
			
			if (conceptQName == null) return;
			
			try{
				var responseXML=STRequests.SKOS.deleteConcept(conceptQName);
				
				if (responseXML.isFail()) {
					var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
					prompts.alert(null, "Deletion failed", responseXML.getMsg());
				}
			}catch (e) {
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
				prompts.alert(null,"Exception", e.name + ": " + e.message);
			}
		},
		checkEnabled : function(state) {
	        	if (state.indexOf("mutable") == -1) {
				return false;
			}
			
			if (state.indexOf("itemSelected") == -1) {
				return false;
			}
			
			return true;
		}
	}
);

//CommandBroker.offerCommand("skos:concept*edit",
//	{
//		label : "Schemes...",
//		tooltiptext : "Manages the concept schemes this concept belongs to",
//		image : "",
//		do : function(host) {
//				var obj = {};
//				obj.wrappedJSObject = obj;
//				
//				var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
//				                   .getService(Components.interfaces.nsIWindowWatcher);
//				var win = ww.openWindow(null, "chrome://semantic-turkey/content/skos/widget/conceptTree/impl/manageSchemesDialog.xul", "dlg", "modal", obj);
//								
//				if (obj.out == null) return;
//		}
//	}
//);

CommandBroker.offerCommand("skos:scheme*edit",
	{
		label : "Create Concept Scheme",
		tooltiptext : "Create Concept Scheme",
		image : "chrome://semantic-turkey/skin/images/skosScheme_create.png",
		do : function(host) {

			try{
				var obj = {};
				obj.wrappedJSObject = obj;

				var windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
				                     .getService(Components.interfaces.nsIWindowMediator);                  
                var pWin = windowMediator.getMostRecentWindow("navigator:browser");
                			
				var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
				                   .getService(Components.interfaces.nsIWindowWatcher);
				var win = ww.openWindow(pWin, "chrome://semantic-turkey/content/skos/widget/schemeList/impl/createSchemeDialog.xul", "dlg", "modal", obj);
								
				if (obj.out == null) return;
				
				var prefLabel = obj.out.prefLabel.valueOf();
				var prefLabelLanguage = obj.out.prefLabel.language;
				
				prefLabel = prefLabel.trim();
				
				if (prefLabel == "") {
					prefLabel = null;
					prefLabelLanguage = null;
				}
				
				var language = null;
				
				if (Preferences.get("extensions.semturkey.skos.humanReadable", false)) {
					language = Preferences.get("extensions.semturkey.annotprops.defaultlang", "en");
				}

				
				var responseXML=STRequests.SKOS.createScheme(obj.out.name, prefLabel, prefLabelLanguage, language);
			}catch (e) {
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
				prompts.alert(null,"Exception", e.name + ": " + e.message);
			}
		},
		checkEnabled : function(state) {
	        	if (state.indexOf("mutable") == -1) {
				return false;
			}
			
			if (state.indexOf("itemSelected") != -1) {
				return false;
			}
			
			return true;
		}
	}
);

CommandBroker.offerCommand("skos:scheme*edit",
	{
		label : "Delete Concept Scheme",
		tooltiptext : "Delete Concept Scheme",
		image : "chrome://semantic-turkey/skin/images/skosScheme_delete.png",
		do : function(host) {

			try{
				var scheme = host.selectedScheme;
				
				// First try. If the operation produced dangling concepts, it would be aborted.
				var responseXML=STRequests.SKOS.deleteScheme(scheme);
								
				if (responseXML.isFail()) {
 					var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
					
					var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +  
            		            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING  +  
					            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;
 				
					var button = prompts.confirmEx(null, "User confirmation", "The operation could produce dangling concepts, because the scheme is not empty.\nWhat do you want to do?",  
                               flags, "Cancel", "Delete dandling concepts", "Retain dangling concepts", null, {value : false});
                               
                    			if (button == 0) return;
                    
 					var responseXML=STRequests.SKOS.deleteScheme(scheme, (button == 1));                   
  				}
  				
  				if (Preferences.get("extensions.semturkey.skos.selected_scheme", "").trim() == scheme.trim()) {
  					Preferences.set("extensions.semturkey.skos.selected_scheme", "");
  					Logger.debug("Removed selected scheme: " + scheme + "now: \"" + Preferences.get("extensions.semturkey.skos.selected_scheme", "").trim() +"\"");
  				}
			}catch (e) {
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
				prompts.alert(null,"Exception", e.name + ": " + e.message);
			}
		},
		checkEnabled : function(state) {
	        	if (state.indexOf("mutable") == -1) {
				return false;
			}
			
			if (state.indexOf("itemSelected") == -1) {
				return false;
			}
			
			return true;
		}
	}
);
