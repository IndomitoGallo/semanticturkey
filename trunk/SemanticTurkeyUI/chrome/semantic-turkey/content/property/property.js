if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};
Components.utils.import("resource://stservices/SERVICE_Property.jsm",
		art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Synonyms.jsm",
		art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_OntoSearch.jsm", 
		art_semanticturkey);
Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);


art_semanticturkey.eventsPropertyPanel = new function(){
	var arrayEvent = new Array();
	
	this.registerEvent = function(eventId, eventObj) {
		art_semanticturkey.evtMgr.registerForEvent(eventId, eventObj);
		if (arrayEvent[eventId] == undefined) {
			arrayEvent[eventId] = new Array;
		}
		arrayEvent[eventId].push(eventObj);
	}
	this.deregisterAllEvent = function(){
		for ( var id in arrayEvent) {
			for(var i=0; i<arrayEvent[id].length; ++i){
				art_semanticturkey.evtMgr.deregisterForEvent(id, arrayEvent[id][i]);
			}
		}
	}
}

window.onload = function() {
	var projectIsNull = art_semanticturkey.CurrentProject.isNull();
	if(projectIsNull == false){
		art_semanticturkey.populatePropertyTree();
	}else{
		var st_startedobj = new art_semanticturkey.createSTStartedObj();
		art_semanticturkey.eventsPropertyPanel.registerEvent("projectOpened",st_startedobj);
	}
	art_semanticturkey.associateOntologySearchEventsOnGraphicElements("property");
};

window.onunload = function(){
	art_semanticturkey.eventsPropertyPanel.deregisterAllEvent();
}

art_semanticturkey.getPropertiesTree_RESPONSE = function(responseElement) {
	var node = document.getElementById('rootPropertyTreeChildren');
	var dataElement = responseElement.getElementsByTagName('data')[0];
	var propertyList = dataElement.childNodes;
	for ( var i = 0; i < propertyList.length; i++) {
		if (propertyList[i].nodeType == 1) {
			art_semanticturkey.parsingProperties(propertyList[i], node, true);
		}
	}
};


art_semanticturkey.removeProperty_RESPONSE = function(responseElement) {
	var myTree = document.getElementById("propertiesTree");
	var childList = myTree.getElementsByTagName("treeitem");
	var resourceElement = responseElement.getElementsByTagName('Resource')[0];
	var removedPropertyName = resourceElement.getAttribute("name");
	for ( var i = 0; i < childList.length; i++) {
		art_semanticturkey.checkAndRemoveProp(removedPropertyName, childList[i]);
	}

};
art_semanticturkey.checkAndRemoveProp = function(removedPropertyName, node) {
	var propertyName = node.getAttribute("propertyName");
	if (propertyName == removedPropertyName) {
		var parentNode = node.parentNode;
		parentNode.removeChild(node);
		if (parentNode.childNodes.length == 0) {
			parentNode.parentNode.setAttribute("container", false);
			parentNode.parentNode.removeChild(parentNode);
		}
	}
};


art_semanticturkey.addProperty_RESPONSE = function(responseElement) {
	
	var myTree = document.getElementById("propertiesTree");
	
	
		var newPropName = responseElement.getElementsByTagName("property")[0].getAttribute("name");
		var propType = responseElement.getElementsByTagName("property")[0].getAttribute("type");
		var superPropName = responseElement.getElementsByTagName("superProperty")[0].getAttribute("name");
		if (superPropName == "") {  // add root property
			var node = document.getElementById('rootPropertyTreeChildren'); // myTree.getElementsByTagName('treechildren')[0]; 
			var tr = document.createElement("treerow");
			var tc = document.createElement("treecell");
			tc.setAttribute("label", newPropName);
			tc.setAttribute("deleteForbidden", "false");
			tr.setAttribute("properties", propType.substring(4));
			tc.setAttribute("properties", propType.substring(4));
			tc.setAttribute("type", propType);
			tc.setAttribute("isRootNode", true);
			//tr.setAttribute("properties", "base" + propType.substring(4));
			//tc.setAttribute("properties", "base" + propType.substring(4));
			tr.appendChild(tc);
			var ti = document.createElement("treeitem");
			ti.setAttribute("propertyName", newPropName); 
			ti.appendChild(tr);
			var tch = document.createElement("treechildren");
			ti.appendChild(tch);
			node.appendChild(ti);
			
		} else { // add sub property
			var tr = document.createElement("treerow");
			var tc = document.createElement("treecell");
			var ti = document.createElement("treeitem");
			tc.setAttribute("label", newPropName);
			tc.setAttribute("deleteForbidden", "false");
			tc.setAttribute("numInst", "0");
			tc.setAttribute("isRootNode", false);
			tc.setAttribute("properties", propType.substring(4));
			tc.setAttribute("type", propType);
			tr.setAttribute("properties", propType.substring(4));

			tr.appendChild(tc);
			ti.setAttribute('container', 'false');
			ti.setAttribute('open', 'false');
			ti.setAttribute("propertyName", newPropName); 
			ti.appendChild(tr);
			var treecellNodes;
			treecellNodes = myTree.getElementsByTagName("treecell");
			var targetNode = null;
			for ( var i = 0; i < treecellNodes.length; i++) {
				if (treecellNodes[i].getAttribute("label") == superPropName) {
					targetNode = treecellNodes[i].parentNode.parentNode;
					break;
				}
			}
			var treechildren = targetNode.getElementsByTagName('treechildren')[0];
			if (treechildren == null) {
				treechildren = document.createElement("treechildren");
				targetNode.appendChild(treechildren);
			}
			targetNode.setAttribute("container", true);
			targetNode.setAttribute("open", true);

			treechildren.appendChild(ti);
		}
};
art_semanticturkey.createSTStartedObj = function() {
	this.fireEvent = function(eventId, st_startedobj) {
		art_semanticturkey.populatePropertyTree();
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("st_started", this);
	};
};
art_semanticturkey.populatePropertyTree = function() {
	document.getElementById("createObjectProperty").disabled = false;
	document.getElementById("createDatatypeProperty").disabled = false;
	document.getElementById("createAnnotationProperty").disabled = false;
	document.getElementById("createSubProperty").disabled = false;
	document.getElementById("removeProperty").disabled = false;
	var responseXML;
	try{
		if (window.arguments != null) {
			var instanceQName = window.arguments[0].subjectInstanceName;
			var method = "templateandvalued";
			responseXML = art_semanticturkey.STRequests.Property.getPropertiesTree(instanceQName,
					method);
		} else {
			responseXML = art_semanticturkey.STRequests.Property.getPropertyTree();
		}
		art_semanticturkey.getPropertiesTree_RESPONSE(responseXML);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
};
