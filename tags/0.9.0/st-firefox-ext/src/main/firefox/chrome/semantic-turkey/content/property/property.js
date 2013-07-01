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


art_semanticturkey.eventListenerPropertyArrayObject = null;



window.onload = function() {
	var projectIsNull = art_semanticturkey.CurrentProject.isNull();
	if(projectIsNull == false){
		art_semanticturkey.populatePropertyTree();
	}else{
		art_semanticturkey.eventListenerPropertyArrayObject = new art_semanticturkey.eventListenerArrayClass();
		art_semanticturkey.eventListenerPropertyArrayObject.addEventListenerToArrayAndRegister("projectOpened", art_semanticturkey.populatePropertyTree, null);
	}
	art_semanticturkey.associateOntologySearchEventsOnGraphicElements("property");
};

window.onunload = function(){
	art_semanticturkey.eventListenerPropertyArrayObject.deregisterAllListener();
};

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


art_semanticturkey.removeProperty_RESPONSE = function(responseURI) {
	var myTree = document.getElementById("propertiesTree");
	var childList = myTree.getElementsByTagName("treeitem");
	for ( var i = 0; i < childList.length; i++) {
		art_semanticturkey.checkAndRemoveProp(responseURI.getShow(), childList[i]);
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


art_semanticturkey.addProperty_RESPONSE = function(responseArray) {
	// This is a contingency path to translate from the new roles returned by the addProperty service to the
	// old roles used by the property panel
	const role2propTypeMapping = {};
	role2propTypeMapping["property"] = "rdf:Property";
	role2propTypeMapping["objectProperty"] = "owl:ObjectProperty";
	role2propTypeMapping["datatypeProperty"] = "owl:DatatypeProperty";
	role2propTypeMapping["annotationProperty"] = "owl:AnnotationProperty";
	role2propTypeMapping["ontologyProperty"] = "owl:OntologyProperty";
	
	
	var myTree = document.getElementById("propertiesTree");
	
	var newPropName = responseArray["property"].getShow();
	var role = responseArray["property"].getRole();
	var propType = role2propTypeMapping[role];
	// The following variable holds the value of the property that trigger the CSS rule which attaches the
	// right icon to the property element
	var properties = propType.substring(propType.indexOf(":") + 1); // strip the prefix
	properties = properties.charAt(0).toUpperCase() + properties.substring(1); // capitalize the first letter
	
	if (typeof responseArray["superProperty"] == 'undefined') {  // add root property
		var node = document.getElementById('rootPropertyTreeChildren'); // myTree.getElementsByTagName('treechildren')[0]; 
		var tr = document.createElement("treerow");
		var tc = document.createElement("treecell");
		tc.setAttribute("label", newPropName);
		tc.setAttribute("deleteForbidden", "false");
		tr.setAttribute("properties", properties);
		tc.setAttribute("properties", properties);
		tc.setAttribute("propType", propType);
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
		var superPropName = responseArray["superProperty"].getShow();
		var tr = document.createElement("treerow");
		var tc = document.createElement("treecell");
		var ti = document.createElement("treeitem");
		tc.setAttribute("label", newPropName);
		tc.setAttribute("deleteForbidden", "false");
		tc.setAttribute("numInst", "0");
		tc.setAttribute("isRootNode", false);
		tc.setAttribute("properties", properties);
		tc.setAttribute("propType", propType);
		tr.setAttribute("properties", properties);
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
