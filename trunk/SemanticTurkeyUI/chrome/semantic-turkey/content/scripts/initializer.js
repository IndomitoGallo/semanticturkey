Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);
art_semanticturkey.JavaFirefoxSTBridge.initialize = function() {
	try {
		/*
		 * Get a Foo component
		 */
		var semTurkeyBridge = art_semanticturkey.JavaFirefoxSTBridge
				.getSemanticTurkey();

		/*
		 * Initialize it. The trick is to get past its IDL interface and right
		 * into its Javascript implementation, so that we can pass it the
		 * LiveConnect "java" object, which it will then use to load its JARs.
		 * Note that XPCOM Javascript code is not given LiveConnect by default.
		 */

		if (!semTurkeyBridge.wrappedJSObject.initialize(
				art_semanticturkey.JavaFirefoxSTBridge._packageLoader, true)) {
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
			prompts
					.alert(
							null,
							"Semantic Turkey Initialization Error",
							"Hi, there appears to be a problem with the xpcom bridge between mozilla and java.\n"
									+ "maybe this is not related to Semantic Turkey, and that something is wrong in the configuration of your host.\n\n"
									+ "Please give a look at this page:\n"
									+ "http://semanticturkey.uniroma2.it/documentation/#requirements\n"
									+ "and check if you need to change anything in your configuration.\n\n"
									+ "The following exception has been thrown:\n"
									+ semTurkeyBridge.wrappedJSObject.error);
		}
		// art_semanticturkey.evtMgr.fireEvent("st_started");
	} catch (e) {
		art_semanticturkey.JavaFirefoxSTBridge._fail(e);
		art_semanticturkey.Logger.printException(e);
	}
	art_semanticturkey.ST_started.setStatus();
};
art_semanticturkey.annotationRegister = function() {
	try {
		// initializes the annotation extension point, registering the
		// "bookmarking" service (the default one)
		var annComponent = Components.classes["@art.uniroma2.it/semanticturkeyannotation;1"]
				.getService(Components.interfaces.nsISemanticTurkeyAnnotation);
		annComponent.wrappedJSObject.register('bookmarking',
				art_semanticturkey.furtherAnnotFunction,
				art_semanticturkey.highlightAnnFunction,
				art_semanticturkey.listDragDrop,
				art_semanticturkey.treeDragDrop,
				art_semanticturkey.listDragDropEnrichProp,
				art_semanticturkey.listDragDropBind,
				art_semanticturkey.listDragDropAnnotateInstance);
	} catch (e) {
		// TODO change this code with a unique object (module) to be invoked for
		// alerting the user
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
		prompts.alert(null, "Annotation Extension Point Initialization Error",
				"an error occurred during initialization of the Annotation Component:\n"
						+ e.getMessage());
	}
};
// Annotation function that add further lexicalization of an instance (0)
art_semanticturkey.furtherAnnotFunction = function() {
	var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
			.getService(Components.interfaces.nsIWindowWatcher);
	var window = ww.activeWindow;
	var objectInstanceName = window.arguments[0].objectInstanceName;
	var subjectInstanceName = window.arguments[0].subjectInstanceName;
	var parentWindow = window.arguments[0].parentWindow;
	try {
		parentWindow.art_semanticturkey.STRequests.Annotation
			.createFurtherAnnotation(
				subjectInstanceName,
				objectInstanceName,
				window.arguments[0].urlPage,
				window.arguments[0].title);
	} catch (e) {
		alert(e.name + ": " + e.message);
	}

};
art_semanticturkey.highlightAnnFunction = function() {
	// NScarpato add highlith for all occurence of annotations
	var url = gBrowser.selectedBrowser.currentURI.spec;
	try {
		var responseXML = art_semanticturkey.STRequests.Annotation
				.getPageAnnotations(url);
		art_semanticturkey.getPageAnnotations_RESPONSE(responseXML);
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.getPageAnnotations_RESPONSE = function(responseElement) {
	var annotations = responseElement.getElementsByTagName('Annotation');
	for (var i = 0; i < annotations.length; i++) {
		var valueToHighlight = annotations[i].getAttribute("value");
		highlightStartTag = "<font style='color:blue; background-color:yellow;'>";
		highlightEndTag = "</font>";
		art_semanticturkey.highlightSearchTerms(valueToHighlight, true, true,
				highlightStartTag, highlightEndTag);
	}
};
art_semanticturkey.listDragDrop = function(event, parentWindow) {
	var elementName = event.target.tagName;
	if (elementName == "listitem") {
		var listItem = event.target;
		var ds = Components.classes["@mozilla.org/widget/dragservice;1"]
				.getService(Components.interfaces.nsIDragService);
		var ses = ds.getCurrentSession();
		var list = parentWindow.document.getElementById('InstancesList');
		var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1']
				.getService(Components.interfaces.nsIWindowMediator);
		var topWindowOfType = windowManager
				.getMostRecentWindow("navigator:browser");
		var tabWin = topWindowOfType.gBrowser.selectedBrowser.currentURI.spec;
		// tabWin = tabWin.replace(/&/g, "%26");
		var contentDocument = topWindowOfType.gBrowser.selectedBrowser.contentDocument;
		var titleNodes = contentDocument.getElementsByTagName('title');
		var title = "";
		if (titleNodes != null) {
			var titleNodeChildren = titleNodes[0].childNodes;
			for (var i = 0; i < titleNodeChildren.length; i++) {
				if (titleNodeChildren[i].nodeType == 3)
					title = titleNodeChildren[i].nodeValue;
			}
		}
		// provare con text/plain
		if (ses.isDataFlavorSupported("text/unicode")) {
			var transferObject = Components.classes["@mozilla.org/widget/transferable;1"]
					.createInstance();
			transferObject = transferObject
					.QueryInterface(Components.interfaces.nsITransferable);
			transferObject.addDataFlavor("text/unicode");
			var numItems = ds.numDropItems;

			for (var i = 0; i < numItems; i++) {
				ds.getData(transferObject, i);
			}

			var str = new Object();
			var strLength = new Object();
			transferObject.getTransferData("text/unicode", str, strLength);
			if (str)
				str = str.value
						.QueryInterface(Components.interfaces.nsISupportsString);
			var parameters = new Object();
			// TODO vedere quali parametri servono realmente
			parameters.subjectInstanceName = listItem.getAttribute("label");
			parameters.parentClsName = listItem.getAttribute("parentCls");
			parameters.objectInstanceName = str;
			parameters.urlPage = tabWin;
			parameters.title = title;
			parameters.tree = list;
			parameters.parentWindow = parentWindow;
			parameters.panelTree = document.getElementById("classesTree");
			window
					.openDialog(
							"chrome://semantic-turkey/content/class/annotator/annotator.xul",
							"_blank", "modal=yes,resizable,centerscreen",
							parameters);
		}
	} else {
		alert("No Individual Selected!");
	}
};

art_semanticturkey.treeDragDrop = function(event, parentWindow) {
	var stloader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
			.getService(Components.interfaces.mozIJSSubScriptLoader);
	stloader.loadSubScript('chrome://global/content/nsDragAndDrop.js');
	stloader.loadSubScript('chrome://global/content/nsTransferable.js');
	// stloader.loadSubScript('chrome://semantic-turkey/content/class/dragDrop.js');
	event.stopPropagation(); // This line was in an example, will test if
	// we
	// need it later...
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

	var ds = Components.classes["@mozilla.org/widget/dragservice;1"]
			.getService(Components.interfaces.nsIDragService);
	var ses = ds.getCurrentSession();

	var sourceNode = ses.sourceNode;
	var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1']
			.getService(Components.interfaces.nsIWindowMediator);
	var topWindowOfType = windowManager
			.getMostRecentWindow("navigator:browser");
	var tabWin = topWindowOfType.gBrowser.selectedBrowser.currentURI.spec;
	if (sourceNode.nodeName == "treeitem") {

		var tree = parentWindow.document.getElementById("classesTree");
		// We'll just get the node id from the source element
		var nodeId = sourceNode.firstChild.getAttribute('_exe_nodeid');
		// Get the new parent node
		var row = {};
		var col = {};
		var child = {};
		tree.treeBoxObject.getCellAt(event.pageX, event.pageY, row, col, child);
		// CRAPINESS ALERT!
		// If they're moving, (without ctrl down) the target node becomes our
		// sibling
		// above us. If copying, the source node becomes the first child of the
		// target node
		var targetNode = parentWindow.art_semanticturkey.getOutlineItem(tree,
				row.value);

		var treerow = targetNode.getElementsByTagName('treerow')[0];
		var treecell = treerow.getElementsByTagName('treecell')[0];

		if (treecell.getAttribute('properties') == "instance") {
			return;
		}

		if (ses.dragAction && ses.DRAGDROP_ACTION_COPY) {
			// Target node is our parent, sourceNode becomes first child
			var parentItem = targetNode;
			var sibling = null; // Must be worked out after we get 'container'
			// (treeitems)
			var before = true;
		} else {
			// Target node is our sibling, we'll be inserted below (vertically)
			// it on the same tree level
			var parentItem = targetNode.parentNode.parentNode;
			var sibling = targetNode;
			var before = false;
		}

		// Do some sanity checking
		if ((sourceNode == parentItem) || (sourceNode == targetNode))
			return;
		var parentItemId = parentItem.firstChild.getAttribute('_exe_nodeid');
		if (sibling && (tree.view.getIndexOfItem(sibling) <= 1)) {
			return
		} // Can't drag to top level
		try {
			if ((parentItem.getElementsByTagName('treechildren')[0].firstChild == sourceNode)
					&& before) {
				return
			} // Can't drag into same position
		} catch (e) {
		} // Ignore when parentItem has no treechildren node
		// Check for recursion
		var node = targetNode.parentNode;
		while (node) {
			if (node == sourceNode) {
				return
			} // Can't drag into own children
			node = node.parentNode;
		}
		// Re-organise the tree...
		// See if parent is a container
		var isContainer = parentItem.getAttribute('container');
		if ((!isContainer) || (isContainer == 'false')) {
			// Make it one
			var container = parentItem.appendChild(document
					.createElement('treechildren'));
			parentItem.setAttribute('container', 'true');
			parentItem.setAttribute('open', 'true');
		} else {
			var container = parentItem.getElementsByTagName('treechildren')[0];
			// If still haven't got a 'treechildren' node, then make one
			if (!container) {
				var container = parentItem.appendChild(document
						.createElement('treechildren'));
			}
		}
		// Now we can work out our sibling if we don't already have it
		if (before) {
			sibling = container.firstChild;
		}
		// Move the node
		var oldContainer = sourceNode.parentNode;
		try {
			oldContainer.removeChild(sourceNode);
		} catch (e) {
		} // For some reason works, but still raises exception!
		if (sibling) { // If the container has children
			// Insert either before or after the sibling
			if (before) {
				if (sibling) {
					container.insertBefore(sourceNode, sibling);
				} else {
					container.appendChild(sourceNode);
				}
			} else {
				// Append after target node
				if (sibling.nextSibling) {
					container.insertBefore(sourceNode, sibling.nextSibling);
				} else {
					container.appendChild(sourceNode);
				}
			}
		} else {
			// Otherwise, just make it be the only child
			container.appendChild(sourceNode);
		}
		// See if the old parent node is no longer a container
		if (oldContainer.childNodes.length == 0) {
			// alert("oldContainer: " + oldContainer.nodeName);
			oldContainer.parentNode.setAttribute('open', 'false');// controlla
			// se da
			// problemi
			oldContainer.parentNode.setAttribute('container', 'false');
			oldContainer.parentNode.removeChild(oldContainer); // Remove the
			// treechildren
			// node
		}
		// Tell the server what happened
		var nextSiblingNodeId = null;
		var sibling = sourceNode.nextSibling;
		if (sibling) {
			nextSiblingNodeId = sibling.firstChild.getAttribute('_exe_nodeid');
		}
		nevow_clientToServerEvent('outlinePane.handleDrop', this, '',
				sourceNode.firstChild.getAttribute('_exe_nodeid'),
				parentItemId, nextSiblingNodeId);
	}// END If nodeName = treeitem
	else {

		var contentDocument = topWindowOfType.gBrowser.selectedBrowser.contentDocument;
		var titleNodes = contentDocument.getElementsByTagName('title');
		var title = "";
		if (titleNodes != null) {
			var titleNodeChildren = titleNodes[0].childNodes;
			for (var i = 0; i < titleNodeChildren.length; i++) {
				if (titleNodeChildren[i].nodeType == 3)
					title = titleNodeChildren[i].nodeValue;
			}
		}
		// alert("tabWin" + tabWin); INFO IMPORTANTE
		if (ses.isDataFlavorSupported("text/unicode")) {
			var transferObject = Components.classes["@mozilla.org/widget/transferable;1"]
					.createInstance();
			transferObject = transferObject
					.QueryInterface(Components.interfaces.nsITransferable);
			transferObject.addDataFlavor("text/unicode");
			var numItems = ds.numDropItems;

			for (var i = 0; i < numItems; i++) {
				ds.getData(transferObject, i);
			}

			var str = new Object();
			var strLength = new Object();
			transferObject.getTransferData("text/unicode", str, strLength);
			// TODO here the clipboard is copied to the string str. It has
			// problems with URLs. See
			// http://www.xulplanet.com/tutorials/mozsdk/clipboard.php
			// see also:
			// http://straxus.javadevelopersjournal.com/creating_a_mozillafirefox_drag_and_drop_file_upload_script_p.htm
			if (str)
				str = str.value
						.QueryInterface(Components.interfaces.nsISupportsString);

			var tree = parentWindow.document.getElementById("classesTree");
			// Get the new parent node
			var row = {};
			var col = {};
			var child = {};
			tree.treeBoxObject.getCellAt(event.pageX, event.pageY, row, col,
					child);
			// CRAPINESS ALERT!
			// If they're moving, (without ctrl down) the target node becomes
			// our sibling
			// above us. If copying, the source node becomes the first child of
			// the target node

			var targetNode = parentWindow.art_semanticturkey.getOutlineItem(
					tree, row.value);

			var trecell = targetNode.getElementsByTagName("treecell")[0];
			var attr = trecell.getAttribute("properties");

			var temp = trecell.parentNode.parentNode.parentNode.parentNode;
			temp = temp.getElementsByTagName("treerow")[0];
			var parentcell = temp.getElementsByTagName("treecell")[0];

			// tabWin = tabWin.replace(/&/g, "%26");
			var parameters = new Object();
			parameters.subjectInstanceName = trecell.getAttribute("label");
			parameters.parentClsName = parentcell.parentNode.parentNode
					.getAttribute("className");
			parameters.objectInstanceName = str;
			parameters.urlPage = tabWin;
			parameters.title = title;
			parameters.parentWindow = parentWindow;
			if (attr == "instance") {
				window.openDialog(
						"chrome://semantic-turkey/content/annotator.xul",
						"_blank", "modal=yes,resizable,centerscreen",
						parameters);
				return;
			}

			var trecell = targetNode.getElementsByTagName('treerow')[0]
					.getElementsByTagName('treecell')[0];
			// tabWin = tabWin.replace("&", "%26");
			var parameters2 = new Object();
			var list = document.getElementById('InstancesList');
			parameters2.tree = tree;
			parameters2.list = list;

			try {
				return parentWindow.art_semanticturkey.STRequests.Annotation
						.createAndAnnotate(trecell.parentNode.parentNode
										.getAttribute("className"), str,
								tabWin, title);
			} catch (e) {
				alert(e.name + ": " + e.message);
			}
		}
	}
};

art_semanticturkey.listDragDropEnrichProp = function(parameters) {
	try {
		// NScarpato 26/11/2010
		var responseXML = art_semanticturkey.STRequests.Property.getRange(
				parameters.predicatePropertyName, "false");
		var ranges = responseXML.getElementsByTagName("ranges")[0];
		if (ranges.getAttribute("rngType").indexOf("resource") != -1) {
			window
					.openDialog(
							"chrome://semantic-turkey/content/enrichProperty/enrichProperty.xul",
							"_blank", "modal=yes,resizable,centerscreen",
							parameters);
			// NScarpato 15/04/2008
			if (parameters.oncancel == false) {
				close();
			}

		} else if (ranges.getAttribute("rngType").indexOf("plainLiteral") != -1) {
			var parametersLang = new Object();
			var lang = "";
			parametersLang.lang = lang;
			parametersLang.onAccept = art_semanticturkey.onLangAccept;
			window.openDialog(
					"chrome://semantic-turkey/content/availableLanguages.xul",
					"_blank", "modal=yes,resizable,centerscreen",
					parametersLang);
			close();
			
			parameters.parentWindow.art_semanticturkey.STRequests.Property.createAndAddPropValue(
					parameters.subjectInstanceName,
					parameters.predicatePropertyName,
					parameters.objectInstanceName,
					null,
					"plainLiteral",
					parametersLang.lang
			);
			return parameters.parentWindow.art_semanticturkey.STRequests.Annotation.addAnnotation(parameters.urlPage,parameters.subjectInstanceName,
			parameters.objectInstanceName,parameters.title);
			/*return parameters.parentWindow.art_semanticturkey.STRequests.Annotation
					.relateAndAnnotateBindCreate(
							parameters.subjectInstanceName,
							parameters.predicatePropertyName,
							parameters.objectInstanceName, parameters.urlPage,
							parameters.title, parameters.objectClsName,
							parametersLang.lang);*/

		} else if (ranges.getAttribute("rngType").indexOf("typedLiteral") != -1) {
			var rangeList = ranges.childNodes;
			for (var i = 0; i < rangeList.length; ++i) {
				if (typeof(rangeList[i].tagName) != 'undefined') {

					parameters.rangeType = rangeList[i].textContent;
				}
			}
			close();
			parameters.parentWindow.art_semanticturkey.STRequests.Property.createAndAddPropValue(
					parameters.subjectInstanceName,
					parameters.predicatePropertyName,
					parameters.objectInstanceName,
					parameters.rangeType,
					"typedLiteral"
			);
			return parameters.parentWindow.art_semanticturkey.STRequests.Annotation.addAnnotation(parameters.urlPage,parameters.subjectInstanceName,
			parameters.objectInstanceName,parameters.title);
			/*return parameters.parentWindow.art_semanticturkey.STRequests.Annotation
					.relateAndAnnotateBindCreate(
							parameters.subjectInstanceName,
							parameters.predicatePropertyName,
							parameters.objectInstanceName, parameters.urlPage,
							parameters.title, parameters.objectClsName);*/
		} else if (ranges.getAttribute("rngType").indexOf("literal") != -1) {
			var literalsParameters = new Object();
			literalsParameters.isLiteral = "literal";
			window
					.openDialog(
							"chrome://semantic-turkey/content/enrichProperty/isLiteral.xul",
							"_blank", "modal=yes,resizable,centerscreen",
							literalsParameters);
			if (literalsParameters.isLiteral == "plainLiteral") {
				var parametersLang = new Object();
				var lang = "";
				parametersLang.lang = lang;
				parametersLang.onAccept = art_semanticturkey.onLangAccept;
				window
						.openDialog(
								"chrome://semantic-turkey/content/availableLanguages.xul",
								"_blank", "modal=yes,resizable,centerscreen",
								parametersLang);
				close();
				parameters.parentWindow.art_semanticturkey.STRequests.Property.createAndAddPropValue(
					parameters.subjectInstanceName,
					parameters.predicatePropertyName,
					parameters.objectInstanceName,
					null,
					"plainLiteral",
					parametersLang.lang
			);
			return parameters.parentWindow.art_semanticturkey.STRequests.Annotation.addAnnotation(parameters.urlPage,parameters.subjectInstanceName,
			parameters.objectInstanceName,parameters.title);
				/*return parameters.parentWindow.art_semanticturkey.STRequests.Annotation
						.relateAndAnnotateBindCreate(
								parameters.subjectInstanceName,
								parameters.predicatePropertyName,
								parameters.objectInstanceName,
								parameters.urlPage, 
								parameters.title,
								parameters.objectClsName, 
								parametersLang.lang);*/
			} else if (literalsParameters.isLiteral == "typedLiteral") {
				var rangeList = ranges.childNodes;
				for (var i = 0; i < rangeList.length; ++i) {
					if (typeof(rangeList[i].tagName) != 'undefined') {

						parameters.rangeType = rangeList[i].textContent;
					}
				}
				parameters.parentWindow.art_semanticturkey.STRequests.Property.createAndAddPropValue(
					parameters.subjectInstanceName,
					parameters.predicatePropertyName,
					parameters.objectInstanceName,
					parameters.rangeType,
					"typedLiteral"
			);
			return parameters.parentWindow.art_semanticturkey.STRequests.Annotation.addAnnotation(parameters.urlPage,parameters.subjectInstanceName,
			parameters.objectInstanceName,parameters.title);
				/*return parameters.parentWindow.art_semanticturkey.STRequests.Annotation
						.relateAndAnnotateBindCreate(
								parameters.subjectInstanceName,
								parameters.predicatePropertyName,
								parameters.objectInstanceName,
								parameters.urlPage,
								parameters.title,
								parameters.objectClsName);*/
			}

			
				// NScarpato 15/04/2008
				if (parameters.oncancel == false) {
					close();
				}

		}else if (ranges.getAttribute("rngType").indexOf("dataRange") != -1) { 
			var rangeList = ranges.childNodes; 
			for (var i = 0; i <	rangeList.length; ++i) { 
				if (typeof(rangeList[i].tagName) != 'undefined') { 
					var dataRangeBNodeID = rangeList[i].textContent; 
				} 
			}
			var responseXML =
			art_semanticturkey.STRequests.Property.parseDataRange(dataRangeBNodeID,"bnode");
			var dataElement = responseXML.getElementsByTagName("data")[0];
			var dataRangesList = dataElement.childNodes; 
			var	dataRangesValueList = new Array(); 
			var k=0;
			var type=null;
			var rangeQName = null;
			for (var i = 0; i < dataRangesList.length; ++i) {
				if (typeof(dataRangesList[i].tagName) != 'undefined') {
					if(parameters.objectInstanceName == dataRangesList[i].getAttribute("show")){
						type = dataRangesList[i].tagName;
						rangeQName = dataRangesList[i].getAttribute("type");
						break;
					}
				}
			}
			parameters.parentWindow.art_semanticturkey.STRequests.Property.createAndAddPropValue(
					parameters.subjectInstanceName,
					parameters.predicatePropertyName,
					parameters.objectInstanceName,
					rangeQName,
					type
			);
			return parameters.parentWindow.art_semanticturkey.STRequests.Annotation.addAnnotation(parameters.urlPage,parameters.subjectInstanceName,
			parameters.objectInstanceName,parameters.title);
			 
		}else if (ranges.getAttribute("rngType").indexOf("undetermined") != -1) {
			var literalsParameters = new Object();
			literalsParameters.isLiteral = "undetermined"; 
			window.openDialog("chrome://semantic-turkey/content/enrichProperty/isLiteral.xul",
			 "_blank", "modal=yes,resizable,centerscreen",literalsParameters); 
			if(literalsParameters.isLiteral ==  "plainLiteral"){ 
				var parametersLang = new Object();
				var lang = "";
				parametersLang.lang = lang;
				parametersLang.onAccept = art_semanticturkey.onLangAccept;
				window.openDialog(
					"chrome://semantic-turkey/content/availableLanguages.xul",
					"_blank", "modal=yes,resizable,centerscreen",
					parametersLang);
				close();
				parameters.parentWindow.art_semanticturkey.STRequests.Property.createAndAddPropValue(
					parameters.subjectInstanceName,
					parameters.predicatePropertyName,
					parameters.objectInstanceName,
					null,
					"plainLiteral",
					parametersLang.lang
			);
			return parameters.parentWindow.art_semanticturkey.STRequests.Annotation.addAnnotation(parameters.urlPage,parameters.subjectInstanceName,
			parameters.objectInstanceName,parameters.title);
				/*return parameters.parentWindow.art_semanticturkey.STRequests.Annotation
						.relateAndAnnotateBindCreate(
							parameters.subjectInstanceName,
							parameters.predicatePropertyName,
							parameters.objectInstanceName, parameters.urlPage,
							parameters.title, parameters.objectClsName,
							parametersLang.lang);*/
			 }else if(literalsParameters.isLiteral == "typedLiteral"){ 
			 	//TODO aggiungere finestra per scegliere il tipo
			 	var rangeList = ranges.childNodes;
				for (var i = 0; i < rangeList.length; ++i) {
					if (typeof(rangeList[i].tagName) != 'undefined') {
						parameters.rangeType = rangeList[i].textContent;
					}
				}
				close();
				parameters.parentWindow.art_semanticturkey.STRequests.Property.createAndAddPropValue(
					parameters.subjectInstanceName,
					parameters.predicatePropertyName,
					parameters.objectInstanceName,
					parameters.rangeType,
					"typedLiteral"
			);
			return parameters.parentWindow.art_semanticturkey.STRequests.Annotation.addAnnotation(parameters.urlPage,parameters.subjectInstanceName,
			parameters.objectInstanceName,parameters.title);
				/*return parameters.parentWindow.art_semanticturkey.STRequests.Annotation
						.relateAndAnnotateBindCreate(
							parameters.subjectInstanceName,
							parameters.predicatePropertyName,
							parameters.objectInstanceName, parameters.urlPage,
							parameters.title, parameters.objectClsName);*/
			 }else if(literalsParameters.isLiteral == "resource"){ 
			  	parameters.rangeType="resource";
			  	window
					.openDialog(
							"chrome://semantic-turkey/content/enrichProperty/enrichProperty.xul",
							"_blank", "modal=yes,resizable,centerscreen",
							parameters);
				// NScarpato 15/04/2008
				if (parameters.oncancel == false) {
					close();
				}
			  } 
			}else if (ranges.getAttribute("rngType").indexOf("inconsistent") != -1) { 
				alert("Error range of "+propertyQName+" property is  inconsistent"); 
			}
			
	} catch (e) {
		alert(e.name + ": " + e.message);
	}

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
			return parameters.parentWindow.art_semanticturkey.STRequests.Annotation.addAnnotation(win.arguments[0].urlPage,win.arguments[0].subjectInstanceName,
			win.arguments[0].objectInstanceName,win.arguments[0].title);
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

// NScarpato 28/05/2007 add sole annotate function ("add new annotation for
// selected instance")
// NScarpato 10/03/2008 add annotate function "addExistingPropValue"
art_semanticturkey.listDragDropAnnotateInstance = function(win, myList) {
	var selItem = myList.selectedItem;
	var instanceName = selItem.label;
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
			return win.arguments[0].parentWindow.art_semanticturkey.STRequests.Annotation
					.relateAndAnnotateBindAnnot(
							win.arguments[0].subjectInstanceName,
							win.arguments[0].predicatePropertyName,
							instanceName, win.arguments[0].urlPage,
							win.arguments[0].title,
							win.arguments[0].objectInstanceName);
		}
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};
art_semanticturkey.annotationRegister();
// art_semanticturkey.JavaFirefoxSTBridge.initialize();
