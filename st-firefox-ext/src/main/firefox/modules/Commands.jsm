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
				topic.trackers.commandWithdrawed(command);
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
 

function MenuPopupTrackerAdapter(topicName, host, menupopup) {
	this.topicName = topicName;
	
	var document = menupopup.ownerDocument;
	
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
	};
	
	this.commandWithdrawed = function(command) {
	
	};
};

function ToolbarTrackerAdapter(topicName, host, toolbar) {
	this.topicName = topicName;
	
	var document = toolbar.ownerDocument;
	
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
	};
	
	this.commandWithdrawed = function(command) {
	
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
				
				var responseXML=STRequests.SKOS.createConcept(obj.out.name, null, host.conceptScheme, obj.out.prefLabel.valueOf(), obj.out.prefLabel.language);
			}catch (e) {
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
				prompts.alert(null,"Exception", e.name + ": " + e.message);
			}
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
				
				var responseXML=STRequests.SKOS.createConcept(obj.out.name, conceptQName, host.conceptScheme, obj.out.prefLabel.valueOf(), obj.out.prefLabel.language);
			}catch (e) {
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
				prompts.alert(null,"Exception", e.name + ": " + e.message);
			}
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
				
				var responseXML=STRequests.SKOS.createScheme(obj.out.name, obj.out.prefLabel.valueOf(), obj.out.prefLabel.language);
			}catch (e) {
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
				prompts.alert(null,"Exception", e.name + ": " + e.message);
			}
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
				// First try. If the operation produced dangling concepts, it would be aborted.
				var responseXML=STRequests.SKOS.deleteScheme(host.selectedScheme);
								
				if (responseXML.isFail()) {
 					var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
					
					var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +  
            		            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING  +  
					            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;
 				
					var button = prompts.confirmEx(null, "User confirmation", "The operation could produce dangling concepts, because the scheme is not empty.\nWhat do you want to do?",  
                               flags, "Cancel", "Delete dandling concepts", "Retain dangling concepts", null, {value : false});
                               
                    if (button == 0) return;
                    
 					var responseXML=STRequests.SKOS.deleteScheme(host.selectedScheme, (button == 1));                   
  				}
			}catch (e) {
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
				prompts.alert(null,"Exception", e.name + ": " + e.message);
			}
		}
	}
);
