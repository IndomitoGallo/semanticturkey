/*
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 * 
 * The Original Code is SemanticTurkey.
 * 
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2007.
 * All Rights Reserved.
 * 
 * SemanticTurkey was developed by the Artificial Intelligence Research Group
 * (art.uniroma2.it) at the University of Roma Tor Vergata (ART) Current
 * information about SemanticTurkey can be obtained at
 * http://semanticturkey.uniroma2.it
 * 
 */

/** NScarpato */
netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Property.jsm",art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Cls.jsm",art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Projects.jsm", art_semanticturkey);

var classHandlers = {};
classHandlers["*"] = new function() {
	this.showInstances = function(e) {
/*
 		var ep_tree = document.getElementById("ep_classesTree");
*/
		var instanceDeck = document.getElementById("instanceDeck");
		var ep_list = document.getElementById("ep_IndividualsList");
		instanceDeck.selectedPanel = ep_list;
/*
		var parentWindow = window.arguments[0].parentWindow;
		art_semanticturkey.classesTreeClick(e,ep_tree,ep_list);
*/
	};
	
	this.getInstanceName = function(e) {
		var myList = document.getElementById("ep_IndividualsList");
		var selItem = myList.selectedItem;
		return selItem.label;
	};
};
classHandlers["skos:Concept"] = new function() {
	this.showInstances = function(e) {
		var selSc = art_semanticturkey.STRequests.Projects.getProjectProperty("skos.selected_scheme").getElementsByTagName("property")[0].getAttribute("value");

		var instanceDeck = document.getElementById("instanceDeck");
		var conceptTree = document.getElementById("ep_conceptTree");
		conceptTree.conceptScheme = selSc;
		instanceDeck.selectedPanel = conceptTree;	
	};
	
	this.getInstanceName = function() {
		var conceptTree = document.getElementById("ep_conceptTree");
		return conceptTree.selectedConcept;
	};
};

classHandlers.getCurrentHandler = function() {
	var ep_tree = document.getElementById("ep_classesTree");
	var currentelement = ep_tree.treeBoxObject.view.getItemAtIndex(ep_tree.currentIndex);
	var className = currentelement.getAttribute("className");
	
	var clsHandl = classHandlers[className];
	if (typeof clsHandl == "undefined") {
		return classHandlers["*"];
	}
	
	return clsHandl;
}

window.onload = function() {
	art_semanticturkey.setPanel();
	document.getElementById("checkAll").addEventListener("command",art_semanticturkey.showAllClasses,true);
	document.getElementById("ep_classesTree").addEventListener("click",
			art_semanticturkey.ep_classesTreeClick, true);
	document.getElementById("cancel").addEventListener("click",art_semanticturkey.onCancel, true);
	document.getElementById("Bind").addEventListener("click",art_semanticturkey.bind, true);
	document.getElementById("Add").addEventListener("click",art_semanticturkey.annotateInst, true);
	
	var predicatePropertyName = window.arguments[0].predicatePropertyName;
	try{
		var responseXML = art_semanticturkey.STRequests.Property.getRangeClassesTree(predicatePropertyName);
		if(responseXML.getElementsByTagName("Class").length == 0){
			document.getElementById("checkAll").checked = true;
			document.getElementById("checkAll").disabled = true;
		}
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
	art_semanticturkey.showAllClasses();
};
art_semanticturkey.ep_classesTreeClick = function(e) {
	// We always need to perform the following operations, otherwise the class tree gets frozen
	var ep_tree = document.getElementById("ep_classesTree");
	var ep_list = document.getElementById("ep_IndividualsList");
	var parentWindow = window.arguments[0].parentWindow;
	art_semanticturkey.classesTreeClick(e,ep_tree,ep_list);		

	var clsHandl = classHandlers.getCurrentHandler();
	clsHandl.showInstances(e);
};
/**
 * @author NScarpato 10/03/2008 setPanel
 * @param {}
 */
art_semanticturkey.setPanel = function() {
	document.getElementById("properties").setAttribute("title", window.arguments[0].winTitle);
	if (window.arguments[0].action != null) {
		var sourceElementName = window.arguments[0].sourceElementName;
		document.getElementById('Bind').setAttribute("label", "Create and add Property Value");
		document.getElementById('Add').setAttribute("label", "Add Existing Property Value");
	}
	// NScarpato 24/05/2007 add subtree
	/*art_semanticturkey.HttpMgr.GETP("http://"+server+":1979/semantic_turkey/resources/stserver/STServer?service=property&request=getRangeClassesTree&propertyQName="
			+ predicatePropertyName);*/
	//TODO è stata spostata in utilities e gli vanno passati albero e lista 
	//searchFocus("Class", objectClsName, "", "");
};

// NScarpato 24/05/2007 add new annotation AND new instance bind function ("bind
// to new individual for selected class")
art_semanticturkey.bind = function() {
			
			var tree = document.getElementById("ep_classesTree");
			var responseXML = art_semanticturkey.listDragDropBind(window,tree);
			if(responseXML != null){
				var mainTree = window.arguments[0].parentWindow.document.getElementById("classesTree");
				close();
				if (mainTree != null) {
					window.arguments[0].parentWindow.art_semanticturkey.classDragDrop_RESPONSE(responseXML,mainTree,false);
				}
			}	
		
		close();
};
// NScarpato 28/05/2007 add sole annotate function ("add new annotation for
// selected instance")
// NScarpato 10/03/2008 add annotate function "addExistingPropValue"
art_semanticturkey.annotateInst = function(){
	var clsHandl = classHandlers.getCurrentHandler();
	instanceName = clsHandl.getInstanceName();
	
	art_semanticturkey.listDragDropAnnotateInstance(window, instanceName);
		
	close();
};

art_semanticturkey.showAllClasses = function() {
	var sel = document.getElementById("checkAll");
	if (sel.getAttribute("checked")) {
		var treeChildren = document.getElementById("ep_classesTree").getElementsByTagName('treechildren')[0];
		var treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		try{
			var responseXML = window.arguments[0].parentWindow.art_semanticturkey.STRequests.Cls.getClassTree();
			art_semanticturkey.getClassTree_RESPONSE(responseXML,document.getElementById("ep_rootClassTreeChildren"));
		}
		catch (e) {
			alert(e.name + ": " + e.message);
		}
	} else {
		var treeChildren = document.getElementById("ep_classesTree").getElementsByTagName('treechildren')[0];
		treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		var predicatePropertyName = window.arguments[0].predicatePropertyName;
		
		try{
			var responseXML = art_semanticturkey.STRequests.Property.getRangeClassesTree(predicatePropertyName);
			art_semanticturkey.getClassTree_RESPONSE(responseXML,document.getElementById("ep_rootClassTreeChildren"));
		}
		catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
};
art_semanticturkey.onCancel = function() {
	window.arguments[0].oncancel = true;
	window.close();
};

art_semanticturkey.listDragDropBind = function(win, tree) {
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		alert("No range class selected");
		return;
	} else {
		try {
			var currentelement = tree.treeBoxObject.view
					.getItemAtIndex(tree.currentIndex);
			var selectedObjClsName = currentelement.getAttribute("className");
			var type = "resource";
			if (typeof win.arguments[0].action != 'undefined') {
				var parameters = new Object();
				parameters.parentBox = win.arguments[0].parentBox;
				parameters.rowBox = win.arguments[0].rowBox;
				parameters.sourceElementName = win.arguments[0].sourceElementName;
				propValue = null;
				propValue = prompt("Insert new property value:", "",
						"Create and add property value");
				if (propValue != null) {
					parameters.propValue = propValue;
					return win.arguments[0].parentWindow.art_semanticturkey.STRequests.Property
							.createAndAddPropValue(
									win.arguments[0].sourceElementName,
									win.arguments[0].predicatePropertyName,
									propValue, selectedObjClsName, type);
				}
			} else {
				close();
			/*NScarpato 29/11/2010*/
			 win.arguments[0].parentWindow.art_semanticturkey.STRequests.Property.createAndAddPropValue(
					win.arguments[0].subjectInstanceName,
					win.arguments[0].predicatePropertyName,
					win.arguments[0].objectInstanceName,
					selectedObjClsName,
					type
			);

			// The annotation has to be applied to the resource, which is the value
			// of the property assigned before
			var newParameters = {};
			newParameters.__proto__ = win.arguments[0];
			newParameters.subjectInstanceName = newParameters.objectInstanceName;
			 
			return win.arguments[0].functors.addAnnotation(newParameters);

				/*return win.arguments[0].parentWindow.art_semanticturkey.STRequests.Annotation
						.relateAndAnnotateBindCreate(
								win.arguments[0].subjectInstanceName,
								win.arguments[0].predicatePropertyName,
								win.arguments[0].objectInstanceName,
								win.arguments[0].urlPage,
								win.arguments[0].title, selectedObjClsName,
								null, type);*/
			}
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
};

//NScarpato 28/05/2007 add sole annotate function ("add new annotation for
//selected instance")
//NScarpato 10/03/2008 add annotate function "addExistingPropValue"
art_semanticturkey.listDragDropAnnotateInstance = function(win, instanceName /*myList*/) {
//	var selItem = myList.selectedItem;
//	var instanceName = selItem.label;
	try {
		if (win.arguments[0].action != null) {
			/*
			 * parameters = new Object(); parameters.parentBox =
			 * win.arguments[0].parentBox; parameters.rowBox =
			 * win.arguments[0].rowBox; parameters.propValue =
			 * win.arguments[0].instanceName; parameters.sourceElementName =
			 * win.arguments[0].sourceElementName;
			 */
			var responseXML = art_semanticturkey.STRequests.Property.getRange(
					win.arguments[0].predicatePropertyName, "false");
			var ranges = responseXML.getElementsByTagName("ranges")[0];
			var type = (ranges.getAttribute("rngType"));
			
			win.close();
			if(type =="undetermined"){
				return win.arguments[0].parentWindow.art_semanticturkey.STRequests.Property
					.addExistingPropValue(win.arguments[0].sourceElementName,
							win.arguments[0].predicatePropertyName,
							instanceName, win.arguments[0].rangeType);
			}else{
				return win.arguments[0].parentWindow.art_semanticturkey.STRequests.Property
					.addExistingPropValue(win.arguments[0].sourceElementName,
							win.arguments[0].predicatePropertyName,
							instanceName, type);
			}
		} else {
			win.close();

			var newParameters = {};
			newParameters.__proto__ = win.arguments[0];
			newParameters.lexicalization = newParameters.objectInstanceName;
			newParameters.objectInstanceName = instanceName;
						
			return win.arguments[0].functors.relateAndAnnotateBindAnnot(newParameters);
		}
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};

