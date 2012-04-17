if (typeof art_semanticturkey == "undefined") {
	var art_semanticturkey = {};
}

Components.utils.import("resource://stservices/SERVICE_Projects.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);

art_semanticturkey.init = function() {
	var conceptTree = document.getElementById("conceptTree");
	
	conceptTree.conceptScheme = art_semanticturkey.STRequests.Projects.getProjectProperty("skos.selected_scheme", null).getElementsByTagName("property")[0].getAttribute("value");		
	
	conceptTree._view.canDrop = function(index, orientation, dataTransfer) {
		if (index != -1 && orientation == 0) {
			return true;
		}
	};
		
	conceptTree._view.drop = function(index, orientation, dataTransfer) {
		if (index == -1 || orientation != 0) {
			return;
		}
		
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefBranch);
		var defaultAnnotFun = prefs
		.getCharPref("extensions.semturkey.extpt.annotate");
		var annComponent = Components.classes["@art.uniroma2.it/semanticturkeyannotation;1"]
		.getService(Components.interfaces.nsISemanticTurkeyAnnotation);

		var AnnotFunctionList = annComponent.wrappedJSObject.getList();

		if (AnnotFunctionList[defaultAnnotFun] != null) {
			//get the function of the selected family for the event drag'n'drop over instance
			var FunctionOI = AnnotFunctionList[defaultAnnotFun].getfunctions("dragDropOverInstance");
			var count=0;
			
			//check how much function are present and enabled
			for(var j=0; j<FunctionOI.length;j++)
				if(FunctionOI[j].isEnabled()){
					count++;
				}
		
			var event = {target : 
                {
                    tagName : "listitem",
                    getAttribute : function(attrName) {
                    	if (attrName == "label") {
                    		return conceptTree._view.visibleRows2[index].id;
                    	}
                    	
                    	return "";
                    }
                 }
            };	// no event to pass
			
			event.skos = {};
			event.skos.selectedScheme = conceptTree.conceptScheme;
			
			//if no functions alert the user
			if(count == 0)
				alert("No registered or enabled functions for this event");
			//if 1 function is present and enabled execute
			else if (count == 1) {
				var fun = FunctionOI[index].getfunct();
				fun(event, window);
			}
			//open the choice menu
			else {
				var parameters = new Object();
				parameters.event = event;
				parameters.parentWindow = window;
				
				window.openDialog(
						"chrome://semantic-turkey/content/DragDrop/dragDropOverInstance.xul",
						"_blank", "modal=yes,resizable,centerscreen",
						parameters);
			}
		} else {
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
			prompts.alert(null, defaultAnnotFun
					+ " annotation type not registered ", defaultAnnotFun
					+ " not registered annotation type reset to bookmarking");
			prefs.setCharPref("extensions.semturkey.extpt.annotate", "bookmarking");
		}
	};
	
	var stEventArray = new art_semanticturkey.eventListenerArrayClass();
	
	stEventArray.addEventListenerToArrayAndRegister("projectPropertySet", function(eventId, projectPropertySetObj) {
		if (projectPropertySetObj.getPropName() == "skos.selected_scheme") {
			conceptTree.conceptScheme = projectPropertySetObj.getPropValue();
		}
	}, null);

	window.addEventListener("unload", function(e){
		stEventArray.deregisterAllListener();		
	}, false);
}

window.addEventListener("load", art_semanticturkey.init, false);