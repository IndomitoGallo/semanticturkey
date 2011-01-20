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

Components.utils.import("resource://stmodules/Logger.jsm");  // debug

if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};


	
art_semanticturkey.eventListenerArrayObject = null;

	
art_semanticturkey.associateEventsFiredByServer = function(){
	
	//register the handler for the events
	
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("visLevelChanged", art_semanticturkey.createSTVisLevEventFunct, null);
	
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("projectClosed", art_semanticturkey.createSTClosedProjectFunct, null);
	
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("rdfLoaded", art_semanticturkey.rdfLoadedFunct, null);
	
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("clearedData", art_semanticturkey.clearedDataFunct, null);
	
	//remove class event
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("removedClass", art_semanticturkey.removeClassFunct, null);
	
	//create (sub)class event, this is used only when a new class is created
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("createdSubClass", art_semanticturkey.createdSubClassFunct, null);
	
	//addSubclass event, this is NOT used when a new class is created
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("subClsOfAddedClass", art_semanticturkey.subClsOfAddedFunct, null);
	
	//removeSubclass event
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("subClsOfRemovedClass", art_semanticturkey.subClsOfRemovedFunct, null);
		
	//remove superclass event ???
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("removedSuperClass", art_semanticturkey.removedSuperClassFunct, null);
	
	//renamed class event
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("renamedClass", art_semanticturkey.renamedClassFunct, null);
	//renamed individual event
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("renamedIndividual", art_semanticturkey.renamedIndividualFunct, null);
	
	//removed a type of an individual
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("removedType", art_semanticturkey.removedTypeFunct, null);
	
	//added a type of an individual
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("addedType", art_semanticturkey.addedTypeFunct, null);
};


art_semanticturkey.removeClassFunct = function(eventId, classRemovedObj){
	var removedClassName = classRemovedObj.getClassName();
	var tree = document.getElementById("classesTree");
	var childList = tree.getElementsByTagName("treeitem");
	for (var i = 0; i < childList.length; i++) {
		art_semanticturkey.checkAndRemove(removedClassName, childList[i]);
	}
};

art_semanticturkey.renamedIndividualFunct = function(eventId, individualRenamedObj){
	var newIndividualName = individualRenamedObj.getNewIndividualName();
	var oldIndividualName = individualRenamedObj.getOldIndividualName();
	var list = document.getElementById("IndividualsList");
	var listItemList = list.getElementsByTagName("listitem");
	for (var i = 0; i < listItemList.length; i++) {
		if (listItemList[i].getAttribute("label") == oldIndividualName) {
			listItemList[i].setAttribute("label", newIndividualName);
			var listItIc = listItemList[i]
					.getElementsByTagName("listitem-iconic");
			listItIc[0].getElementsByTagName("label")[0].setAttribute(
					"value", newIndividualName);
		}
	}
};

art_semanticturkey.removedTypeFunct = function(eventId, removedTypeObj){
	var type = removedTypeObj.getType();
	var resource = removedTypeObj.getResource();
	var list = document.getElementById("IndividualsList");
	var className = list.getElementsByTagName("listheader")[0].getAttribute("parentCls");
	var listItemList = list.getElementsByTagName("listitem");
	if(className != type)
		return;
	for (var i = 0; i < listItemList.length; i++) {
		if (listItemList[i].getAttribute("label") == resource) {
			listItemList[i].parentNode.removeChild(listItemList[i]);
		}
	}
};

art_semanticturkey.addedTypeFunct = function(eventId, addedTypeObj){
	var type = addedTypeObj.getType();
	var instName = addedTypeObj.getResource();
	var list = document.getElementById("IndividualsList");
	var className = list.getElementsByTagName("listheader")[0].getAttribute("parentCls");
	var listItemList = list.getElementsByTagName("listitem");
	if(className != type)
		return;
	var foundInstance = false;
	for (var i = 0; i < listItemList.length; i++) {
		if (listItemList[i].getAttribute("label") == instName) {
			foundInstance = true;
		}
	}
	if(foundInstance == false){
		var lsti = document.createElement("listitem");
		lsti.setAttribute("label", instName);
		var explicit = addedTypeObj.getExplicit();
		lsti.setAttribute("explicit", explicit); 
		lsti.setAttribute("parentCls", type);
		var lci = document.createElement("listitem-iconic");
		var img = document.createElement("image");
		var instanceType = addedTypeObj.getIstanceType();
		lsti.setAttribute("type",instanceType);
		img.setAttribute("src", art_semanticturkey.getImgFromType(instanceType, explicit));
		
		lci.appendChild(img);
		var lbl = document.createElement("label");
		lbl.setAttribute("value", instName);
		lbl.setAttribute("id", instName);
		lbl.setAttribute("class", "base");
		lci.appendChild(lbl);
		lsti.appendChild(lci);
		list.appendChild(lsti);
	}
};

art_semanticturkey.subClsOfRemovedFunct = function(eventId, subClsOfRemovedObj){
	var className = subClsOfRemovedObj.getClassName();
	var superClassName = subClsOfRemovedObj.getSuperClassName();
	
	art_semanticturkey.checkAndRefreshTree(className, superClassName);
	
	/*var childList = tree.getElementsByTagName("treeitem");
	for (var i = 0; i < childList.length; i++) {
		var parentNode = childList[i].parentNode.parentNode;
		if(parentNode.getAttribute("className") == superClassName)
			art_semanticturkey.checkAndRemove(className, childList[i]);
	}
	//now ask the server all the super class of the selcted class and search in the 
	// class tree if it is necessary to add this class as a subclass of another class
	var responseXMLSuperType = art_semanticturkey.STRequests.Cls
					.getClassDescription(className,"templateandvalued");
	var responseXMLClassInfo = art_semanticturkey.STRequests.Cls
					.getClassAndInstancesInfo(className, true);
	*/				
	
};


art_semanticturkey.subClsOfAddedFunct  = function(eventId, subClsOfAddedObj){
	var className = subClsOfAddedObj.getClassName();
	var superClassName = subClsOfAddedObj.getSuperClassName();
	
	art_semanticturkey.checkAndRefreshTree(className, superClassName);
	/*
	var numInst = subClsOfAddedObj.getNumInst();
	var delForbidden = subClsOfAddedObj.getDelFobidden();
	var tree = document.getElementById("classesTree");
	var childList = tree.getElementsByTagName("treeitem");
	for (var i = 0; i < childList.length; i++) {
		art_semanticturkey.checkAndCreate(className, childList[i],
				superClassName, numInst);
	}*/
};


art_semanticturkey.createdSubClassFunct = function(eventId, classAddedObj){
	var className = classAddedObj.getClassName();
	var superClassName = classAddedObj.getSuperClassName();
	var tree = document.getElementById("classesTree");
	var childList = tree.getElementsByTagName("treeitem");
	for (var i = 0; i < childList.length; i++) {
		art_semanticturkey.checkAndCreate(className, childList[i],
				superClassName);
	}
};





art_semanticturkey.renamedClassFunct = function(eventId, classRenamedObj){
	var newClassName = classRenamedObj.getNewClassName();
	var oldClassName = classRenamedObj.getOldClassName();
	
	var tree = document.getElementById("classesTree");
	var childList = tree.getElementsByTagName("treeitem");
	for (var i = 0; i < childList.length; i++) {
		art_semanticturkey.checkAndRename(newClassName, oldClassName,
				childList[i]);
	}
};

/**
 * @author Noemi Andrea check all occurence of class that should be removed
 */
art_semanticturkey.checkAndRemove = function(removedClassName, node) {
	var className = node.getAttribute("className");
	if (className == removedClassName) {
		var parentNode = node.parentNode;
		parentNode.removeChild(node);
		if (parentNode.childNodes.length == 0) {
			parentNode.parentNode.setAttribute("container", false);
			parentNode.parentNode.removeChild(parentNode);
		}
	}
};

art_semanticturkey.checkAndRename = function(newClassName, oldClassName, node) {
	var className = node.getAttribute("className");
	if (className == oldClassName) {
		var parentNode = node.parentNode;
		node.setAttribute("className", newClassName);
		var numInst = node.getElementsByTagName("treecell")[0]
				.getAttribute("numInst");
		var newLabel = "";
		if (numInst > 0)
			newLabel = newClassName + "(" + numInst + ")";
		else
			newLabel = newClassName;
		node.getElementsByTagName("treecell")[0]
				.setAttribute("label", newLabel);
	}
};

art_semanticturkey.checkAndCreate = function(className, parentNode,
		superClassName, numInst, delForbidden, hasSubClasses) {
	var parentClassName = parentNode.getAttribute("className");
	if (parentClassName == superClassName) {
		var parentTreeChildren = parentNode
				.getElementsByTagName("treechildren")[0];
		if (parentTreeChildren == null) {
			parentTreeChildren = document.createElement("treechildren");
			parentNode.appendChild(parentTreeChildren);
			parentNode.setAttribute("container", true);
			parentNode.setAttribute("open", true);
		}
		var tr = document.createElement("treerow");
		var tc = document.createElement("treecell");
		if(numInst == undefined){
			tc.setAttribute("numInst", "0");
			tc.setAttribute("deleteForbidden", false);
		}
		else{
			tc.setAttribute("numInst", numInst);
			tc.setAttribute("deleteForbidden", delForbidden);
		}
		
		tc.setAttribute("isRootNode", false);
		if(numInst == undefined || numInst == 0){
			tc.setAttribute("label", className);
		}
		else{
			tc.setAttribute("label", className+"("+numInst+")");
		}
		tr.appendChild(tc);
		var ti = document.createElement("treeitem");
		ti.setAttribute("className", className);
		if(hasSubClasses != undefined)
			ti.setAttribute("container", hasSubClasses);
		ti.appendChild(tr);
		parentTreeChildren.appendChild(ti);
	}
};

art_semanticturkey.checkAndRefreshTree = function(className, superClassName){
	//ask the server all the super class of the selcted class and search in the 
	// class tree if it is necessary to add this class as a subclass of another class
	var treeItemList = document.getElementById("classesTree").getElementsByTagName("treeitem");
	var responseXMLSuperType = art_semanticturkey.STRequests.Cls
					.getClassDescription(className,"templateandvalued");
	var responseXMLClassInfo = art_semanticturkey.STRequests.Cls
					.getClassAndInstancesInfo(className, true);
					
	var numInst = responseXMLClassInfo.getElementsByTagName('Class')[0]
			.getAttribute("numTotInst");
	var hasSubClasses =  responseXMLClassInfo.getElementsByTagName('Class')[0]
			.getAttribute("more"); // this can be "1" or "0"
	var deleteForbidden = responseXMLClassInfo.getElementsByTagName('Class')[0]
			.getAttribute("deleteForbidden");
	
	var superTypeList = responseXMLSuperType.getElementsByTagName("SuperType");
	
	for (var i=0; i < treeItemList.length; i++) {
		var treeItemClassName = treeItemList[i].getAttribute("className");
		for(var j=0; j<superTypeList.length; ++j){
			var superTypeClassName = superTypeList[j].getAttribute("resource");
			//look for the superclasses
			if(treeItemClassName == superTypeClassName){
				var found = false;
				//search if the className is already among its child node
				var parentTreeChildren = treeItemList[i].getElementsByTagName("treechildren")[0];
				if(parentTreeChildren != null){
					var treeItemChildList = parentTreeChildren.childNodes;
					for(var k=0; k<treeItemChildList.length && found == false; ++k){
						if(treeItemChildList[k].getAttribute("className") == className)
							found = true;
					}
				}
				if(found == false){
					//this node as no child named className
					if(parentTreeChildren == null){
						//the parent node was not a container, so now it should became a container (but a closed one)
						parentTreeChildren = document.createElement("treechildren");
						treeItemList[i].appendChild(parentTreeChildren);
						treeItemList[i].setAttribute("container", true);
						treeItemList[i].setAttribute("open", false);
					}
					else{
						//this node as no child named className, but it should have, so it should be added
						var tr = document.createElement("treerow");
						var tc = document.createElement("treecell");
						tc.setAttribute("numInst", numInst);
						tc.setAttribute("deleteForbidden", deleteForbidden);
						tc.setAttribute("isRootNode", false);
						if(numInst == 0)
							tc.setAttribute("label", className);
						else
							tc.setAttribute("label", className+"("+numInst+")");
						tr.appendChild(tc);
						var ti = document.createElement("treeitem");
						ti.setAttribute("className", className);
						if(hasSubClasses == "0")
							ti.setAttribute("container", false);
						else{ //hasSubClasses == 1
							var tch = document.createElement("treechildren");
							ti.appendChild(tch);
							ti.setAttribute("container", true);
							ti.setAttribute("open", false);
						}
						ti.appendChild(tr);
						parentTreeChildren.appendChild(ti);
					}
				}
			}
		}
		//look for className and see if its superclass are the right one
		if(treeItemClassName == className){
			var treeItemSuperClassOfClass = treeItemList[i].parentNode.parentNode;
			var SuperClassOfClassName = treeItemSuperClassOfClass.getAttribute("className");
			var rightSuperClass = false;
			for(var j=0; j<superTypeList.length; ++j){
				var superTypeClassName = superTypeList[j].getAttribute("resource");
				if(superTypeClassName == SuperClassOfClassName)
					rightSuperClass = true;
			}
			if(rightSuperClass == false){
				art_semanticturkey.checkAndRemove(className, treeItemList[i]);
			}
		}
	}
};


/*
art_semanticturkey.createSTClosedProjectObj = function() {
	this.fireEvent = function(eventId, closedProjectInfo) {
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow); 
        mainWindow.toggleSidebar();
    };

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("projectClosed", this);
	};
};*/

art_semanticturkey.createSTClosedProjectFunct = function(eventId, closedProjectInfo){
	var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow); 
    mainWindow.toggleSidebar();
};

/*
art_semanticturkey.createSTVisualizationLevelObj = function(){
	this.fireEvent = function(eventId, visualizationLevel) {
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow); 
        mainWindow.toggleSidebar();
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("visLevelChanged", this);
	};
};*/

art_semanticturkey.createSTVisLevEventFunct = function(eventId, visualizationLevel){
	var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow); 
    mainWindow.toggleSidebar();
};

/*
art_semanticturkey.rdfLoadedObj = function(){
	this.fireEvent = function(eventId, rdfLoaded) {
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow); 
        mainWindow.toggleSidebar();
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("rdfLoaded", this);
	};
};*/

art_semanticturkey.rdfLoadedFunct = function(eventId, rdfLoaded){
	var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow); 
    mainWindow.toggleSidebar();
};

/*
art_semanticturkey.clearedDataObj = function(){
	this.fireEvent = function(eventId, clearedData) {
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
               .getInterface(Components.interfaces.nsIWebNavigation)
               .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
               .rootTreeItem
               .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
               .getInterface(Components.interfaces.nsIDOMWindow); 
    	mainWindow.toggleSidebar();
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("clearedData", this);
	};
};*/

art_semanticturkey.clearedDataFunct = function(eventId, clearedData){
	var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
               .getInterface(Components.interfaces.nsIWebNavigation)
               .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
               .rootTreeItem
               .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
               .getInterface(Components.interfaces.nsIDOMWindow); 
	mainWindow.toggleSidebar();
};

