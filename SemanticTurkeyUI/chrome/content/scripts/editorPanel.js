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
/**
 * NScarpato File che contiene le funzioni di Riempimento del Pannello per
 * l'editing
 */
netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
mytype = "";
// NScarpato add changed to check change of class and property tree
changed = false;
/** Funzione che crea gli elementi di EditorPanel in base al type */
function init(type, sourceElementName, superName, sourceElement) {
	mytype = type;
	// NScarpato 07-07-2008 add custom title to editor panel
	var edPnl = document.getElementById("editorPanel");
	edPnl.setAttribute("title", mytype + " Editor");
	var doc = getDoc();
	var mypanel = getmyPanel();
	var buttonModify = getButton();
	var lbl = document.createElement("label");
	lbl.setAttribute("value", mytype + " Form");
	lbl.setAttribute("class", "header");
	img = document.createElement("image");
	var txbox = document.createElement("textbox");
	buttonModify = document.getElementById("buttonModify");
	if (type == "Class") {
		deleteForbidden = sourceElement.getAttribute("deleteForbidden");
		if (deleteForbidden == "true") {
			buttonModify.setAttribute("disabled", "true");
			img.setAttribute("src", "images/class_imported.png");
			// txbox.setAttribute("disabled","true");
		} else {
			img.setAttribute("src", "images/class.png");
		}
	} else if (type == "Individual") {

		if (sourceElement == "undefined") {
			explicit = window.arguments[0].explicit;
		} else {
			explicit = sourceElement.getAttribute("explicit");
		}
		if (explicit == "false") {
			buttonModify.setAttribute("disabled", "true");
			img.setAttribute("src", "images/individual_noexpl.png");
			// txbox.setAttribute("disabled","true");
		} else {
			img.setAttribute("src", "images/individual.png");
		}
	} else if (type == "ObjectProperty" || type == "ObjectProperty_noexpl") {

		// NScarpato 14/04/2008
		deleteForbidden = sourceElement.getAttribute("deleteForbidden");
		if (deleteForbidden == "true") {
			img.setAttribute("src", "images/propObject_imported.png");
			buttonModify.setAttribute("disabled", "true");
			edPnl.setAttribute("title", "ObjectProperty Editor");
			mytype = "ObjectProperty";
			lbl.setAttribute("value", mytype + " Form");
		} else {
			// NScarpato 25/06/2007 aggiunto image per le proprieta' object
			img.setAttribute("src", "images/propObject20x20.png");
		}
	} else if (type == "DatatypeProperty" || type == "DatatypeProperty_noexpl") {
		deleteForbidden = sourceElement.getAttribute("deleteForbidden");
		if (deleteForbidden == "true") {
			buttonModify.setAttribute("disabled", "true");
			img.setAttribute("src", "images/propDatatype_imported.png");
			edPnl.setAttribute("title", "DatatypeProperty Editor");
			mytype = "DatatypeProperty";
			lbl.setAttribute("value", mytype + " Form");
		} else {
			// NScarpato 25/06/2007 aggiunto image per le proprieta' object
			img.setAttribute("src", "images/propDatatype20x20.png");
		}
		// NScarpato 25/06/2007 aggiunto image per le proprieta' datatype

	} else if (type == "AnnotationProperty"
			|| type == "AnnotationProperty_noexpl") {
		deleteForbidden = sourceElement.getAttribute("deleteForbidden");
		if (deleteForbidden == "true") {
			buttonModify.setAttribute("disabled", "true");
			img.setAttribute("src", "images/propAnnotation_imported.png");
			edPnl.setAttribute("title", "AnnotationProperty Editor");
			mytype = "AnnotationProperty";
			lbl.setAttribute("value", mytype + " Form");
		} else {
			// NScarpato 25/06/2007 aggiunto image per le proprieta' object
			img.setAttribute("src", "images/propAnnotation20x20.png");
		}

	} else if (type == "Property" || type == "Property_noexpl") {
		deleteForbidden = sourceElement.getAttribute("deleteForbidden");
		if (deleteForbidden == "true") {
			buttonModify.setAttribute("disabled", "true");
			img.setAttribute("src", "images/prop_imported.png");
			edPnl.setAttribute("title", "Property Editor");
			mytype = "Property";
			lbl.setAttribute("value", mytype + " Form");
		} else {
			// NScarpato 25/06/2007 aggiunto image per le proprieta' object
			img.setAttribute("src", "images/prop.png");
		}

	}
	var lblName = document.createElement("label");
	lblName.setAttribute("control", "sourceElementName");
	lblName.setAttribute("value", "Name:");
	txbox.setAttribute("value", sourceElementName);
	txbox.setAttribute("id", "name");
	txbox.setAttribute("oninput", "this.style.color='blue'");
	txbox.setAttribute("flex", "1");
	doc.appendChild(img);
	doc.appendChild(lbl);
	mypanel.insertBefore(lblName, buttonModify);
	mypanel.insertBefore(txbox, buttonModify);
	parentBox = document.getElementById("parentBoxRows");
	if (type == "Class") {
		// NScarpato 04/12/2007 add request for Class Description
		httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&request=getClsDescription&clsName="
				+ encodeURIComponent(sourceElementName)
				+ "&method=templateandvalued");
	} else if (type == "Individual") {
		httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=individual&request=getIndDescription&instanceQName="
				+ encodeURIComponent(sourceElementName)
				+ "&method=templateandvalued");
	} else {
		// NScarpato 18/04/2007 aggiunto Domain per le proprietà
		// NScarpato 11/07/2007 aggiunto property info
		var parameters = new Object();
		parameters.type = mytype;
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=getPropDescription&propertyQName="
						+ encodeURIComponent(sourceElementName), false,
				parameters);
		/*
		 * var prop=document.getElementById("property"); var
		 * lastsep=document.getElementById("lastSep"); var
		 * propSep=document.getElementById("propSep");
		 * getWindow().removeChild(prop); getWindow().removeChild(lastsep);
		 * getWindow().removeChild(propSep);
		 */

	}

}

function getTypesList() {
	return document.getElementById("typesList");
}

function getPropertiesList() {
	return document.getElementById("propertiesList");
}
/**
 * NScarpato 29/11/2007 onAccept
 */
function accept() {
	if (changed == true) {
		var treeChildren = tree.getElementsByTagName('treechildren')[0];
		treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		// RELOAD TREE
		if (window.arguments[0].sourceType == "Class"
				|| window.arguments[0].sourceType == "Individual") {
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls",
					false);
		} else {
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property",
					false);
		}
	}
}

/**
 * NScarpato 29/11/2007 onCancel
 */
function onCancel() {
	if (changed == true) {
		var treeChildren = tree.getElementsByTagName('treechildren')[0];
		treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		// RELOAD TREE
		if (window.arguments[0].sourceType == "Class"
				|| window.arguments[0].sourceType == "Individual") {
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls",
					false);
		} else {
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property",
					false);
		}
	}
}
/**
 * @author NScarpato 13/03/2008 add Domain for selected property
 */
function insertDomain() {
	domainName = "";
	parameters = new Object();
	parameters.source = "domain";
	parameters.domainName = domainName;
	window.openDialog("chrome://semantic-turkey/content/classTree.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
	domainName = parameters.domainName;
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=addPropertyDomain&domainPropertyQName="
					+ encodeURIComponent(domainName)
					+ "&propertyQName="
					+ encodeURIComponent(document.getElementById("name").value),
			false, parameters);
	changed = true;
	refreshPanel();
}
/**
 * insertRange
 * 
 */
function insertRange() {
	rangeName = "";
	// if(sourceType=="ObjectProperty"){
	if (mytype == "ObjectProperty") {
		parameters = new Object();
		parameters.source = "range";
		parameters.rangeName = rangeName;
		window.openDialog("chrome://semantic-turkey/content/classTree.xul",
				"_blank", "modal=yes,resizable,centerscreen", parameters);
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=addPropertyRange&rangePropertyQName="
						+ encodeURIComponent(parameters.rangeName)
						+ "&propertyQName="
						+ encodeURIComponent(document.getElementById("name").value),
				false, parameters);
	} else {
		parameters.source = "range";
		parameters.rangeName = rangeName;
		window.openDialog("chrome://semantic-turkey/content/rangeList.xul",
				"_blank", "modal=yes,resizable,centerscreen", parameters);
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=addPropertyRange&rangePropertyQName="
						+ encodeURIComponent(parameters.rangeName)
						+ "&propertyQName="
						+ encodeURIComponent(document.getElementById("name").value),
				false, parameters);
	}
	changed = true;
	refreshPanel();
}
/**
 * NScarpato 19/03/2008 removeDomain
 */
function removeDomain(value) {
	parameters = new Object();
	if (value == "list") {
		list = document.getElementById("domainsList");
		selItem = list.selectedItem;
		domainName = list.selectedItem.getAttribute("label");
		explicit = list.selectedItem.getAttribute("explicit");
		if (explicit == "true") {
			parameters.sourceElementName = document.getElementById("name").value;
			parameters.parentBox = parentBox;
			parameters.rowBox = document.getElementById("rowsBox");
			parameters.domainName = domainName;
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=removePropertyDomain&propertyQName="
							+ encodeURIComponent(document
									.getElementById("name").value)
							+ "&domainPropertyQName="
							+ encodeURIComponent(domainName), false, parameters);
			changed = true;
			refreshPanel();
		} else {
			alert("You cannot remove this domain, it's a domain value that belongs to the top ontology!");
		}
	} else {
		myRow = document.getElementById(value);
		parameters.sourceElementName = document.getElementById("name").value;
		parameters.parentBox = parentBox;
		parameters.rowBox = document.getElementById("rowsBox");
		parameters.domainName = value;
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=removePropertyDomain&propertyQName="
						+ encodeURIComponent(document.getElementById("name").value)
						+ "&domainPropertyQName=" + encodeURIComponent(value),
				false, parameters);
		changed = true;
		refreshPanel();
	}
}

/**
 * NScarpato 19/03/2008 removeRange
 */
function removeRange(value) {
	parameters = new Object();
	if (value == "list") {
		list = document.getElementById("rangeList");
		selItem = list.selectedItem;
		rangeName = list.selectedItem.getAttribute("label");
		explicit = list.selectedItem.getAttribute("explicit");
		if (explicit == "true") {
			parameters.sourceElementName = document.getElementById("name").value;
			parameters.parentBox = parentBox;
			parameters.rowBox = document.getElementById("rowsBox");
			parameters.rangeName = rangeName;
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=removePropertyRange&propertyQName="
							+ encodeURIComponent(document
									.getElementById("name").value)
							+ "&rangePropertyQName="
							+ encodeURIComponent(rangeName), false, parameters);
			changed = true;
			refreshPanel();
		} else {
			alert("You cannot remove this range, it's a range value that belongs to the top ontology!");
		}
	} else {
		myRow = document.getElementById(value);
		parameters.sourceElementName = document.getElementById("name").value;
		parameters.parentBox = parentBox;
		parameters.rowBox = document.getElementById("rowsBox");
		parameters.rangeName = value;
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=removePropertyRange&propertyQName="
						+ encodeURIComponent(document.getElementById("name").value)
						+ "&rangePropertyQName=" + encodeURIComponent(value),
				false, parameters);
		changed = true;
		refreshPanel();
	}
}
/**
 * NScarpato 26/11/2007 addType
 */
function addType(addtype) {
	parameters = new Object();
	if (addtype == "list") {
		parameters2 = new Object();
		parameters2.source = "editorIndividual";
		lsti = document.createElement("listitem");
		var selectedClass = "none";
		parameters2.txbox = selectedClass;
		window.openDialog("chrome://semantic-turkey/content/classTree.xul",
				"_blank", "modal=yes,resizable,centerscreen", parameters2);
		parameters.sourceElementName = document.getElementById("name").value;
		parameters.parentBox = document.getElementById("parentBoxRows");
		parameters.rowBox = document.getElementById("rowsBox");
		parameters.type = mytype;
		changed = true;
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=individual&request=add_type&indqname="
						+ encodeURIComponent(document.getElementById("name").value)
						+ "&typeqname=" + encodeURIComponent(selectedClass),
				false, parameters);
	} else {
		parameters2 = new Object();
		parameters2.source = "editorIndividual";
		var txbox = document.createElement("textbox");
		txbox.setAttribute("readonly", "true");
		parameters2.txbox = txbox;
		window.openDialog("chrome://semantic-turkey/content/classTree.xul",
				"_blank", "modal=yes,resizable,centerscreen", parameters2);
		parameters.sourceElementName = document.getElementById("name").value;
		parameters.parentBox = document.getElementById("parentBoxRows");
		parameters.rowBox = document.getElementById("rowsBox");
		parameters.type = mytype;
		changed = true;
		if (txbox.getAttribute("value") != "") {
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=individual&request=add_type&indqname="
							+ encodeURIComponent(document
									.getElementById("name").value)
							+ "&typeqname="
							+ encodeURIComponent(txbox.getAttribute("value")),
					false, parameters);
		}
	}
}

/**
 * NScarpato 26/11/2007 Remove Type
 */
function removeType(value) {
	parameters = new Object();
	if (value == "list") {
		list = document.getElementById("typesList");
		selItem = list.selectedItem;
		instanceName = list.selectedItem.getAttribute("label");
		explicit = list.selectedItem.getAttribute("explicit");
		if (explicit == "true") {
			parameters.sourceElementName = document.getElementById("name").value;
			parameters.parentBox = parentBox;
			parameters.rowBox = document.getElementById("rowsBox");
			parameters.type = mytype;
			changed = true;
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=individual&request=remove_type&indqname="
							+ encodeURIComponent(document
									.getElementById("name").value)
							+ "&typeqname=" + encodeURIComponent(instanceName),
					false, parameters);
		} else {
			alert("You cannot remove this type, it's a type that belongs to the top ontology!");
		}
	} else {
		myRow = document.getElementById(value);
		parameters.sourceElementName = document.getElementById("name").value;
		parameters.parentBox = parentBox;
		parameters.rowBox = document.getElementById("rowsBox");
		parameters.type = mytype;
		changed = true;
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=individual&request=remove_type&indqname="
						+ encodeURIComponent(document.getElementById("name").value)
						+ "&typeqname=" + encodeURIComponent(value), false,
				parameters);
	}
}
/**
 * NScarpato 05/12/2007 addSuperClass
 */
function addSuperClass(addSCtype) {
	parameters = new Object();
	if (addSCtype == "list") {
		parameters2 = new Object();
		parameters2.source = "editorClass";
		lsti = document.createElement("listitem");
		var selectedClass = "none";
		parameters2.txbox = selectedClass;
		domainTree = window.openDialog(
				"chrome://semantic-turkey/content/classTree.xul", "_blank",
				"modal=yes,resizable,centerscreen", parameters2);
		parameters.sourceElementName = document.getElementById("name").value;
		parameters.parentBox = document.getElementById("parentBoxRows");
		parameters.rowBox = document.getElementById("rowsBox");
		changed = true;
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&request=add_supercls&clsqname="
						+ encodeURIComponent(document.getElementById("name").value)
						+ "&superclsqname=" + encodeURIComponent(selectedClass),
				false, parameters);
	} else {
		parameters2 = new Object();
		parameters2.source = "editorClass";
		var txbox = document.createElement("textbox");
		txbox.setAttribute("readonly", "true");
		parameters2.txbox = txbox;
		domainTree = window.openDialog(
				"chrome://semantic-turkey/content/classTree.xul", "_blank",
				"modal=yes,resizable,centerscreen", parameters2);
		parameters.sourceElementName = document.getElementById("name").value;
		parameters.parentBox = document.getElementById("parentBoxRows");
		parameters.rowBox = document.getElementById("rowsBox");
		changed = true;
		if (txbox.getAttribute("value") != "") {
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&request=add_supercls&clsqname="
							+ encodeURIComponent(document
									.getElementById("name").value)
							+ "&superclsqname="
							+ encodeURIComponent(txbox.getAttribute("value")),
					false, parameters);
		}
	}
}

/**
 * NScarpato 05/12/2007 Remove Super Class
 */
function removeSuperClass(value) {
	parameters = new Object();

	if (value == "list") {
		list = document.getElementById("typesList");
		selItem = list.selectedItem;
		instanceName = list.selectedItem.getAttribute("label");
		explicit = list.selectedItem.getAttribute("explicit");
		if (explicit == "true") {
			parameters.sourceElementName = document.getElementById("name").value;
			parameters.parentBox = parentBox;
			parameters.rowBox = document.getElementById("rowsBox");
			changed = true;
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&request=remove_supercls&clsqname="
							+ encodeURIComponent(document
									.getElementById("name").value)
							+ "&superclsqname="
							+ encodeURIComponent(instanceName), false,
					parameters);
		} else {
			alert("You cannot remove this superClass, it's a superClass that belongs to the top ontology!");
		}
	} else {
		myRow = document.getElementById(value);
		parameters.sourceElementName = document.getElementById("name").value;
		parameters.parentBox = parentBox;
		parameters.rowBox = document.getElementById("rowsBox");
		changed = true;
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&request=remove_supercls&clsqname="
						+ encodeURIComponent(document.getElementById("name").value)
						+ "&superclsqname=" + encodeURIComponent(value), false,
				parameters);
	}
}
/**
 * @author NScarpato 10/03/2008 createAndAddPropValue
 * @param {String}
 *            property name
 */
function createAndAddPropValue(propertyQName, typeValue) {
	instanceQName = document.getElementById("name").value;
	parameters = new Object();
	parameters.predicatePropertyName = propertyQName;
	parameters.winTitle = "Add Property Value";
	parameters.action = "createAndAddPropValue";
	parameters.sourceElementName = instanceQName;
	parameters.parentBox = parentBox;
	parameters.rowBox = document.getElementById("rowsBox");
	parameters.typeValue = typeValue;
	parameters.oncancel = false;
	if (typeValue == "owl:ObjectProperty"
			|| typeValue == "owl:ObjectProperty_noexpl") {
		window.openDialog(
				"chrome://semantic-turkey/content/enrichProperty.xul",
				"_blank", "modal=yes,resizable,centerscreen", parameters);
	} else {
		window.openDialog(
				"chrome://semantic-turkey/content/enrichNoObjectProperty.xul",
				"_blank", "modal=yes,resizable,centerscreen", parameters);
	}
	if (parameters.oncancel == false) {
		changed = true;
		refreshPanel();
	}
}
/**
 * @author NScarpato 10/03/2008 addExistingPropValue
 */
function addExistingPropValue(propertyQName) {
	instanceQName = document.getElementById("name").value;
	parameters = new Object();
	parameters.winTitle = "Add Existing Property Value";
	parameters.predicatePropertyName = propertyQName;
	parameters.action = "addExistingPropValue";
	parameters.sourceElementName = instanceQName;
	parameters.parentBox = parentBox;
	parameters.rowBox = document.getElementById("rowsBox");
	parameters.oncancel == false;
	window.openDialog("chrome://semantic-turkey/content/enrichProperty.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
	if (parameters.oncancel == false) {
		changed = true;
		refreshPanel();
	}
}

/**
 * @author NScarpato 10/03/2008 removePropValue
 * @param {String}
 *            value: it's 'list' or value of textBox
 */
function removePropValue(value, propertyQName, typeValue) {
	parameters = new Object();
	parameters.parentBox = parentBox;
	parameters.rowBox = document.getElementById("rowsBox");
	instanceQName = document.getElementById("name").value;
	parameters.sourceElementName = instanceQName;
	if (value == "list") {
		list = document.getElementById("propList");
		selItem = list.selectedItem;
		propValue = instanceName = list.selectedItem.getAttribute("label");
		explicit = list.selectedItem.getAttribute("explicit");
		if (explicit == "true") {
			parameters.propValue = propValue;
			if (typeValue == "owl:AnnotationProperty") {
				lang = list.selectedItem.getAttribute("language");
				httpGet(
						"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=removePropValue&instanceQName="
								+ encodeURIComponent(instanceQName)
								+ "&propertyQName="
								+ encodeURIComponent(propertyQName)
								+ "&value="
								+ encodeURIComponent(propValue)
								+ "&lang="
								+ encodeURIComponent(lang), false, parameters);
			} else {
				httpGet(
						"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=removePropValue&instanceQName="
								+ encodeURIComponent(instanceQName)
								+ "&propertyQName="
								+ encodeURIComponent(propertyQName)
								+ "&value="
								+ encodeURIComponent(propValue), false,
						parameters);
			}
			changed = true;
			refreshPanel();
		} else {
			alert("You cannot remove this property value, it's a property value that belongs to the top ontology!");
		}
	} else {
		parameters.propValue = value;
		if (typeValue == "owl:AnnotationProperty") {
			lang = document.getElementById(value).getAttribute("language");
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=removePropValue&instanceQName="
							+ encodeURIComponent(instanceQName)
							+ "&propertyQName="
							+ encodeURIComponent(propertyQName)
							+ "&value="
							+ encodeURIComponent(value)
							+ "&lang="
							+ encodeURIComponent(lang), false, parameters);
		} else {
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=removePropValue&instanceQName="
							+ encodeURIComponent(instanceQName)
							+ "&propertyQName="
							+ encodeURIComponent(propertyQName)
							+ "&value="
							+ encodeURIComponent(value), false, parameters);
		}
		changed = true;
		refreshPanel();
	}

}
/**
 * @author NScarpato 12/03/2008 rename 14/03/2008 change function to make also
 *         refresh of instance list and property tree
 */
function rename() {
	deleteForbidden = window.arguments[0].deleteForbidden;
	var parameters = new Object();
	parameters.sourceType = window.arguments[0].sourceType;
	elname = window.arguments[0].sourceElementName;
	textbox = document.getElementById("name");
	newName = textbox.value;
	if (window.arguments[0].sourceType == "Class") {
		if (deleteForbidden == "true") {
			alert("You cannot rename this class, it's a class that belongs to the top ontology!");
			textbox.value = elname.substring(0, elname.indexOf('('));
		} else {
			if (elname.indexOf('(') > -1) {
				elname = elname.substring(0, elname.indexOf('('));
			}
			parameters.tree = getTree();
			parameters.numInst = window.arguments[0].numInst;
		}
	} else if (window.arguments[0].sourceType == "Individual") {
		if (deleteForbidden == "true") {
			alert("You cannot rename this istance, it's a istance that belongs to the top ontology!");
			textbox.value = elname;
		} else {
			parameters.list = window.arguments[0].list;
		}
	} else {
		if (deleteForbidden == "true") {
			alert("You cannot rename this property, it's a property that belongs to the top ontology!");
			textbox.value = elname;
		} else {
			parameters.tree = getTree();
		}
	}
	if (deleteForbidden != "true") {
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=modifyName&name="
						+ encodeURIComponent(elname)
						+ "&newName="
						+ encodeURIComponent(newName), false, parameters);
		_printToJSConsole("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=modifyName&name="
				+ encodeURIComponent(elname)
				+ "&newName="
				+ encodeURIComponent(newName));
		window.arguments[0].sourceElementName = newName;
		changed = true;
	}
	textbox.style.color = "black";
}
/**
 * @author NScarpato 18/03/2008 refreshPanel
 * 
 */
function refreshPanel() {
	// empty parentBox
	while (parentBox.hasChildNodes()) {
		parentBox.removeChild(parentBox.lastChild);
	}
	// empty rowBox
	rowBox = document.getElementById("rowsBox");
	while (rowBox.hasChildNodes()) {
		rowBox.removeChild(rowBox.lastChild);
	}
	if (mytype == "Class") {
		httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&request=getClsDescription&clsName="
				+ encodeURIComponent(parameters.sourceElementName)
				+ "&method=templateandvalued");
	} else if (mytype == "Individual") {
		httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=individual&request=getIndDescription&instanceQName="
				+ encodeURIComponent(parameters.sourceElementName)
				+ "&method=templateandvalued");
	} else {
		parameters = new Object();
		parameters.type = mytype;
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&propertyQName="
						+ encodeURIComponent(sourceElementName), false,
				parameters);
	}
}

/**
 * @author NScarpato 26/03/2008 AddNewProperty
 */
function AddNewProperty() {
	parameters = new Object();
	selectedProp = "";
	selectedPropType = "";
	parameters.selectedProp = selectedProp;
	parameters.selectedPropType = selectedPropType;
	parameters.oncancel = false;
	parameters.source = "AddNewProperty";
	window.openDialog("chrome://semantic-turkey/content/propertyTree.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
	var type = "owl:" + parameters.selectedPropType;
	if (parameters.oncancel == false) {
		createAndAddPropValue(parameters.selectedProp, type);
	}
}
/**
 * @author NScarpato 27/03/2008 changeFacets
 */
function changeFacets(event) {
	check = event.target.getAttribute("checked");
	parameters = new Object();
	parameters.parentBox = parentBox;
	parameters.rowBox = rowBox;
	sourceElementName = window.arguments[0].sourceElementName;
	parameters.sourceElementName = sourceElementName;
	parameters.propValue = event.target.getAttribute("propertyName");
	if (check) {
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=addExistingPropValue&instanceQName="
						+ encodeURIComponent(sourceElementName)
						+ "&propertyQName=rdf:type"
						+ "&value="
						+ encodeURIComponent(event.target
								.getAttribute("propertyName")), false,
				parameters);
	} else {
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=removePropValue&instanceQName="
						+ encodeURIComponent(sourceElementName)
						+ "&propertyQName=rdf:type"
						+ "&value="
						+ encodeURIComponent(event.target
								.getAttribute("propertyName")), false,
				parameters);
	}
}
/**
 * @author NScarpato 03/04/2008 AddInverseOf
 */
function AddInverseOf() {
	parameters = new Object();
	selectedProp = "";
	selectedPropType = "";
	parameters.selectedProp = selectedProp;
	parameters.selectedPropType = selectedPropType;
	parameters.oncancel = false;
	parameters.type = mytype;
	window.openDialog("chrome://semantic-turkey/content/propertyTree.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
	if (parameters.oncancel == false) {
		parameters.parentBox = parentBox;
		parameters.rowBox = rowBox;
		parameters.propValue = parameters.selectedProp;
		parameters.sourceElementName = sourceElementName;
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=addExistingPropValue&instanceQName="
						+ encodeURIComponent(sourceElementName)
						+ "&propertyQName=owl:inverseOf"
						+ "&value="
						+ encodeURIComponent(parameters.selectedProp), false,
				parameters);
	}
	refreshPanel();
}
/**
 * @author NScarpato 15/09/2008 RemoveInverseOf
 */
function removeInverseOf(value) {
	parameters = new Object();
	parameters.propValue = value;
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=removePropValue&instanceQName="
					+ encodeURIComponent(sourceElementName)
					+ "&propertyQName=owl:inverseOf"
					+ "&value="
					+ encodeURIComponent(value), false, parameters);
	refreshPanel();
}

/**
 * NScarpato 23/06/2008 addSuperProperty
 */
function addSuperProperty(addSPtype) {
	parameters = new Object();
	if (addSPtype == "list") {
		parameters2 = new Object();
		parameters2.source = "editorProperty";
		lsti = document.createElement("listitem");
		parameters2.txbox = lsti;
		parameters2.type = mytype;
		domainTree = window.openDialog(
				"chrome://semantic-turkey/content/propertyTree.xul", "_blank",
				"modal=yes,resizable,centerscreen", parameters2);
		parameters.sourceElementName = document.getElementById("name").value;
		parameters.parentBox = document.getElementById("parentBoxRows");
		parameters.rowBox = document.getElementById("rowsBox");
		parameters.type = mytype;
		changed = true;
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=addSuperProperty&propertyQName="
						+ encodeURIComponent(document.getElementById("name").value)
						+ "&superPropertyQName="
						+ encodeURIComponent(lsti.getAttribute("value")),
				false, parameters);
	} else {
		parameters2 = new Object();
		parameters2.source = "editorProperty";
		var txbox = document.createElement("textbox");
		txbox.setAttribute("readonly", "true");
		parameters2.txbox = txbox;
		parameters2.type = mytype;
		domainTree = window.openDialog(
				"chrome://semantic-turkey/content/propertyTree.xul", "_blank",
				"modal=yes,resizable,centerscreen", parameters2);
		parameters.sourceElementName = document.getElementById("name").value;
		parameters.parentBox = document.getElementById("parentBoxRows");
		parameters.rowBox = document.getElementById("rowsBox");
		parameters.type = mytype;
		changed = true;
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=addSuperProperty&propertyQName="
						+ encodeURIComponent(document.getElementById("name").value)
						+ "&superPropertyQName="
						+ encodeURIComponent(txbox.getAttribute("value")),
				false, parameters);
	}
}

/**
 * NScarpato 23/06/2008 Remove Super Property
 */
function removeSuperProperty(value) {
	parameters = new Object();

	if (value == "list") {
		list = document.getElementById("superTypeList");
		selItem = list.selectedItem;
		instanceName = list.selectedItem.getAttribute("label");
		explicit = list.selectedItem.getAttribute("explicit");
		if (explicit == "true") {
			parameters.sourceElementName = document.getElementById("name").value;
			parameters.parentBox = parentBox;
			parameters.rowBox = document.getElementById("rowsBox");
			parameters.type = mytype;
			changed = true;
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=removeSuperProperty&propertyQName="
							+ encodeURIComponent(document
									.getElementById("name").value)
							+ "&superPropertyQName="
							+ encodeURIComponent(instanceName), false,
					parameters);
		} else {
			alert("You cannot remove this superProperty");
		}
	} else {
		myRow = document.getElementById(value);
		parameters.sourceElementName = document.getElementById("name").value;
		parameters.parentBox = parentBox;
		parameters.rowBox = document.getElementById("rowsBox");
		parameters.type = mytype;
		changed = true;
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=removeSuperProperty&propertyQName="
						+ encodeURIComponent(document.getElementById("name").value)
						+ "&superPropertyQName=" + encodeURIComponent(value),
				false, parameters);
	}
}

/** NScarpato 10/07/2008 */
function resourcedblClick(explicit, sourceElementName) {
	var parameters = new Object();
	parameters.sourceType = "Individual";
	parameters.explicit = explicit;
	parameters.sourceElement = "undefined";
	parameters.sourceElementName = sourceElementName;
	window.openDialog("chrome://semantic-turkey/content/editorPanel.xul",
			"_blank", "modal=yes,resizable,left=400,top=100", parameters);
}