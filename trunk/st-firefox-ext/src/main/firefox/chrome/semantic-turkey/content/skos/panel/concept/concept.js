if (typeof art_semanticturkey == "undefined") {
	var art_semanticturkey = {};
}

Components.utils.import("resource://stservices/SERVICE_Projects.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_SKOS.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ARTResources.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/AnnotationManager.jsm", art_semanticturkey);

art_semanticturkey.init = function() {
	var conceptTree = document.getElementById("conceptTree");
	
	conceptTree.conceptScheme = art_semanticturkey.STRequests.Projects.getProjectProperty("skos.selected_scheme", null).getElementsByTagName("property")[0].getAttribute("value");		
	
	conceptTree._view.canDrop = function(index, orientation, dataTransfer) {
		if (index != -1 && orientation == 0) {
			if (dataTransfer.types.contains("application/skos.concept")) {
					var droppedConcept = dataTransfer.getData("application/skos.concept");
					var targetNode = conceptTree._view.getRow(index).id;
					
					if (droppedConcept == targetNode) {
						return false;
					}
			}
			
			return true;
		}
	};
	
	conceptTree.addEventListener("dragstart", function(event){
		event.dataTransfer.setData("application/skos.concept", conceptTree.selectedConcept);
	}, false);
	
	conceptTree._view.drop = function(index, orientation, dataTransfer) {
		if (index == -1 || orientation != 0) {
			return;
		}
		
		if (dataTransfer.types.contains("application/skos.concept")) {
			try {
				var droppedConcept = dataTransfer.getData("application/skos.concept");
				var targetNode = conceptTree._view.getRow(index).id;
				
//				if (droppedConcept == targetNode) {
//					return;
//				}
				
				art_semanticturkey.STRequests.SKOS.addBroaderConcept(droppedConcept, targetNode);
			} catch (e) {
				alert(e.name + ": " + e.message);
			}
			
			return;
		}
		
		var selectedRange = dataTransfer.mozSourceNode.ownerDocument.getSelection().getRangeAt(0);

		var event = {};
		event.name = "selectionOverResource";
		event.resource = new art_semanticturkey.ARTURIResource(
				conceptTree._view.visibleRows2[index].record.label,
				"concept",
				conceptTree._view.visibleRows2[index].record.uri);
		event.selection = selectedRange;
		event.document = dataTransfer.mozSourceNode.ownerDocument;
		event.skos = {};
		event.skos.selectedScheme = conceptTree.conceptScheme;

		art_semanticturkey.annotation.AnnotationManager.handleEvent(window, event);
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