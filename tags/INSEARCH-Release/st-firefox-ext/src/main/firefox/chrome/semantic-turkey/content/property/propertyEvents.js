art_semanticturkey.associateEventsOnGraphicElements = function() {
	
	document.getElementById("propertiesTree").addEventListener("dblclick",
			art_semanticturkey.myPropertyTreedoubleClick, true);

	document.getElementById("createObjectProperty").addEventListener("command",
			art_semanticturkey.createObjectProperty, true);
	document.getElementById("createDatatypeProperty").addEventListener("command",
			art_semanticturkey.createDatatypeProperty, true);
	document.getElementById("createAnnotationProperty").addEventListener(
			"command", art_semanticturkey.createAnnotationProperty, true);
	document.getElementById("createSubProperty").addEventListener("command",
			art_semanticturkey.createSubProperty, true);
	document.getElementById("removeProperty").addEventListener("command",
			art_semanticturkey.removeProperty, true);
	var stIsStarted = art_semanticturkey.ST_started.getStatus();
	if(stIsStarted=="false"){
		document.getElementById("createObjectProperty").disabled = true;
		document.getElementById("createDatatypeProperty").disabled = true;
		document.getElementById("createAnnotationProperty").disabled = true;
		document.getElementById("createSubProperty").disabled = true;
		document.getElementById("removeProperty").disabled = true;
	}
	document.getElementById("menuItemCreateSubProperty").addEventListener(
			"command", art_semanticturkey.createSubProperty, true);
	document.getElementById("menuItemRemoveProperty").addEventListener(
			"command", art_semanticturkey.removeProperty, true);
	document.getElementById("menuItemModifyName").addEventListener("command",
			art_semanticturkey.modifyPropertyName, true);
	document.getElementById("menuItemAddSynonym").addEventListener("command",
			art_semanticturkey.addPropertySynonym, true);

};
window.addEventListener("load",
		art_semanticturkey.associateEventsOnGraphicElements, true);

art_semanticturkey.createObjectProperty = function() {
	art_semanticturkey.createProperty("owl:ObjectProperty");
};

art_semanticturkey.createAnnotationProperty = function() {
	art_semanticturkey.createProperty("owl:AnnotationProperty");
};
art_semanticturkey.createDatatypeProperty = function() {
	art_semanticturkey.createProperty("owl:DatatypeProperty");
};

art_semanticturkey.createProperty = function(propType) {
	var tree = document.getElementById("propertiesTree");
	var parameters = new Object();
	parameters.tree = tree;
	parameters.propType = propType;
	parameters.type = "property";
	parameters.parentWindow = window;
	window.openDialog(
			"chrome://semantic-turkey/content/property/createProperty.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);

};

art_semanticturkey.createSubProperty = function() {
	var tree = document.getElementById("propertiesTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		alert("Please Select a Property");
		return;
	}
	var currentelement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var selPropName = treecell.getAttribute("label");
	var selPropType = treecell.getAttribute("propType");
	var parameters = new Object();
	/*
	if (selPropType.indexOf("ObjectProperty") != -1) {
		selPropType = "ObjectProperty";
	} else if (selPropType.indexOf("DatatypeProperty") != -1) {
		selPropType = "DatatypeProperty";
	} else if (selPropType.indexOf("AnnotationProperty") != -1) {
		selPropType = "AnnotationProperty";
	} else if (selPropType.indexOf("Property") != -1) {
		selPropType = "Property";
	}
	*/
	parameters.propType = selPropType;
	parameters.selPropName = selPropName;
	parameters.tree = tree;
	parameters.parentTreecell = treecell;
	parameters.type = "subProperty";
	parameters.parentWindow = window;
	window.openDialog(
			"chrome://semantic-turkey/content/property/createProperty.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
	/*
	 * this code is related to collaborative version of ST if (server !=
	 * "127.0.0.1") { var treeChildren =
	 * tree.getElementsByTagName('treechildren')[0]; treeItemsNodes =
	 * treeChildren.getElementsByTagName("treeitem"); while
	 * (treeChildren.hasChildNodes()) {
	 * treeChildren.removeChild(treeChildren.lastChild); }
	 * art_semanticturkey.HttpMgr.GETP(request); }
	 */
};

// TODO check if the deleteForbidden attribute is useful or if is the server
// that make check of delete
art_semanticturkey.removeProperty = function() {
	var tree = document.getElementById("propertiesTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		alert("Please Select a Property");
		return;
	}
	var currentelement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var deleteForbidden = treecell.getAttribute("deleteForbidden");
	if (deleteForbidden == "false") {
		var name = treecell.getAttribute("label");
		try{
			var responseURI = art_semanticturkey.STRequests.Delete
					.removeProperty(name);
			art_semanticturkey.removeProperty_RESPONSE(responseURI);
		}
		catch (e) {
			alert(e.name + ": " + e.message);
		}
	} else {
		alert("You cannot delete this property, it's a system resource!");
	}
};

art_semanticturkey.modifyPropertyName = function() {
	alert("Not implemented yet!");
};

art_semanticturkey.addPropertySynonym = function() {
	var tree = document.getElementById("propertiesTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		alert("Please Select a Property");
		return;
	}
	var currentelement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var label = treecell.getAttribute("label");
	var parameters = new Object();
	parameters.name = label;
	parameters.parentWindow = window;
	window.openDialog("chrome://semantic-turkey/content/synonym/synonym.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
};

art_semanticturkey.myPropertyTreedoubleClick = function(event) {
	var tree = document.getElementById("propertiesTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		alert("Please Select a Property");
		return;
	}
	var currentelement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var parameters = new Object();
	parameters.sourceType = treecell.getAttribute("properties");
	parameters.sourceElement = currentelement;
	parameters.sourceElementName = treecell.getAttribute("label");
	parameters.sourceParentElementName = "";
	parameters.deleteForbidden = treecell.getAttribute("deleteForbidden");
	parameters.list = "";
	parameters.tree = tree;
	parameters.parentWindow = window;
	parameters.isFirstEditor = true;
	window.openDialog("chrome://semantic-turkey/content/editors/editorPanel.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
};
art_semanticturkey.getCellNodeAt = function(row, col) {
	var tree = document.getElementById("propertiesTree");
	var view;
	try {
		view = tree.contentView;
	} catch (ex) {
	}
	if (view) {
		var elem = view.getItemAtIndex(row);
		if (elem) {
			var pos = ((document.getElementById(col).ordinal - 1) >> 1);
			return elem.firstChild.childNodes[pos];
		}
	}
	return null;
};