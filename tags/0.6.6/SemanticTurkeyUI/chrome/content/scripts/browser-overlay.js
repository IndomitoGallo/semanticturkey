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
var JavaFirefoxExtension = new Object();
var defaultAnnotFunction = function(){
	 var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                    .getService(Components.interfaces.nsIWindowWatcher);
 	var window = ww.activeWindow;
	httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=annotation&request=addAnnotation&instanceQName="
	+ encodeURIComponent(window.subjectInstanceName)
	+"&text="
	+encodeURIComponent(window.objectInstanceName)
	+"&urlPage="
	+encodeURIComponent(window.arguments[0].urlPage)
	+"&title="
	+encodeURIComponent(window.arguments[0].title),false);
	window.close();
	}
JavaFirefoxExtension.initialize = function() {
	try {
		/*
		 * Get a Foo component
		 */
		var bridge = this.getFoo();

		/*
		 * Initialize it. The trick is to get past its IDL interface and right
		 * into its Javascript implementation, so that we can pass it the
		 * LiveConnect "java" object, which it will then use to load its JARs.
		 * Note that XPCOM Javascript code is not given LiveConnect by default.
		 */

		if (!bridge.wrappedJSObject.initialize(JavaFirefoxExtension._packageLoader, true)) {
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
			prompts.alert(null, "Semantic Turkey Initialization Error", "Hi, there appears to be a problem with the xpcom bridge between mozilla and java.\n"
					+ "maybe this is not related to Semantic Turkey, and that something is wrong in the configuration of your host.\n\n"
					+ "Please give a look at this page:\n"
					+ "http://semanticturkey.uniroma2.it/documentation/#requirements\n"
					+ "and check if you need to change anything in your configuration.\n\n"
					+ "The following exception has been thrown:\n"
					+ bridge.wrappedJSObject.error);			
		}
	} catch (e) {
		this._fail(e);
	}
	var annComponent = Components.classes["@art.info.uniroma2.it/semanticturkeyannotation;1"]
			.getService(Components.interfaces.nsISemanticTurkeyAnnotation);
		annComponent.wrappedJSObject.register('bookmarking',defaultAnnotFunction,highlightAnnFunction,listDragDrop,treeDragDrop);
};

JavaFirefoxExtension._getExtensionPath = function(extensionName) {
	var chromeRegistry = Components.classes["@mozilla.org/chrome/chrome-registry;1"]
			.getService(Components.interfaces.nsIChromeRegistry);

	var uri = Components.classes["@mozilla.org/network/standard-url;1"]
			.createInstance(Components.interfaces.nsIURI);

	uri.spec = "chrome://" + extensionName + "/content/";

	var path = chromeRegistry.convertChromeURL(uri);
	if (typeof(path) == "object") {
		path = path.spec;
	}

	path = path.substring(0, path.indexOf("/chrome/") + 1);

	return path;
};

JavaFirefoxExtension._packageLoader = function(urlStrings, trace) {
	JavaFirefoxExtension._trace("packageLoader {");

	var toUrlArray = function(a) {
		var urlArray = java.lang.reflect.Array.newInstance(java.net.URL,
				a.length);
		for (var i = 0; i < a.length; i++) {
			var url = a[i];
			java.lang.reflect.Array.set(urlArray, i, (typeof url == "string")
							? new java.net.URL(url)
							: url);
		}
		return urlArray;
	};

	var firefoxClassLoaderURL = new java.net.URL(JavaFirefoxExtension
					._getExtensionPath("semantic-turkey")
					+ "components/javaFirefoxExtensionUtils.jar");

	if (trace)
		JavaFirefoxExtension._trace("classLoaderURL " + firefoxClassLoaderURL);

	// ===== Stage 1. Prepare to Give All Permission to the Java Code to be
	// Loaded =====

	/*
	 * Step 1. Load the bootstraping firefoxClassLoader.jar, which contains
	 * URLSetPolicy. We need URLSetPolicy so that we can give ourselves more
	 * permission.
	 */
	var bootstrapClassLoader = java.net.URLClassLoader
			.newInstance(toUrlArray([firefoxClassLoaderURL]));
	if (trace)
		JavaFirefoxExtension._trace("created loader");

	/*
	 * Step 2. Instantiate a URLSetPolicy object from firefoxClassLoader.jar.
	 */
	var policyClass = java.lang.Class.forName(
			"edu.mit.simile.javaFirefoxExtensionUtils.URLSetPolicy", true,
			bootstrapClassLoader);
	var policy = policyClass.newInstance();
	if (trace)
		JavaFirefoxExtension._trace("policy");

	/*
	 * Step 3. Now, the trick: We wrap our own URLSetPolicy around the current
	 * security policy of the JVM security manager. This allows us to give our
	 * own Java code whatever permission we want, even though Firefox doesn't
	 * give us any permission.
	 */
	policy.setOuterPolicy(java.security.Policy.getPolicy());
	java.security.Policy.setPolicy(policy);
	if (trace)
		JavaFirefoxExtension._trace("set policy");

	/*
	 * Step 4. Give ourselves all permission. Yay!
	 */
	policy.addPermission(new java.security.AllPermission());
	if (trace)
		JavaFirefoxExtension._trace("got all permissions");

	/*
	 * That's pretty much it for the security bootstraping hack. But we want to
	 * do a little more. We want our own class loader for subsequent JARs that
	 * we load.
	 */

	// ===== Stage 2. Create Our Own Class Loader so We Can Do Things Like
	// Tracing Class Loading =====
	/*
	 * Reload firefoxClassLoader.jar and so we can make use of
	 * TracingClassLoader. We need to reload it because when it was loaded
	 * previously, we had not yet set the policy to give it enough permission
	 * for loading classes.
	 */

	policy.addURL(firefoxClassLoaderURL);
	if (trace)
		JavaFirefoxExtension._trace("added url");

	var firefoxClassLoaderPackages = new WrappedPackages(java.net.URLClassLoader
					.newInstance(toUrlArray([firefoxClassLoaderURL])));
	if (trace)
		JavaFirefoxExtension._trace("wrapped loader");

	var tracingClassLoaderClass = firefoxClassLoaderPackages
			.getClass("edu.mit.simile.javaFirefoxExtensionUtils.TracingClassLoader");
	if (trace)
		JavaFirefoxExtension._trace("got class");

	var classLoader = tracingClassLoaderClass.m("newInstance")(trace);
	JavaFirefoxExtension._trace("got new loader");

	// ===== Stage 3. Actually Load the Code We Were Asked to Load =====

	var urls = toUrlArray(urlStrings);

	/*
	 * Give it the JARs we were asked to load - should now load them with all
	 * permissions.
	 */
	classLoader.add(firefoxClassLoaderURL);

	for (var i = 0; i < urls.length; i++) {
		var url = java.lang.reflect.Array.get(urls, i);
		classLoader.add(url);
		policy.addURL(url);
	}
	JavaFirefoxExtension._trace("added urls");
	java.lang.Thread.currentThread().setContextClassLoader(classLoader);
	JavaFirefoxExtension._trace("set context");

	/*
	 * Wrap up the class loader and return
	 */
	var packages = new WrappedPackages(classLoader);
	JavaFirefoxExtension._trace("wrapped");

	JavaFirefoxExtension._trace("} packageLoader");

	return packages;
};

/*
 * Wraps a class loader and allows easy access to the classes that it loads.
 */
function WrappedPackages(classLoader) {
	var packages = classLoader
			.loadClass("edu.mit.simile.javaFirefoxExtensionUtils.Packages")
			.newInstance();

	var argumentsToArray = function(args) {
		var a = java.lang.reflect.Array.newInstance(java.lang.Object,
				args.length);
		for (var i = 0; i < args.length; i++) {
			java.lang.reflect.Array.set(a, i, args[i]);
		}
		return a;
	}

	this.getClass = function(className) {
		var classWrapper = packages.getClass(className);
		if (classWrapper) {
			return {
				n : function() {
					return classWrapper
							.callConstructor(argumentsToArray(arguments));
				},
				f : function(fieldName) {
					return classWrapper.getField(fieldName);
				},
				m : function(methodName) {
					return function() {
						return classWrapper.callMethod(methodName,
								argumentsToArray(arguments));
					};
				}
			};
		} else {
			return null;
		}
	};

	this.setTracing = function(enable) {
		classLoader.setTracing((enable) ? true : false);
	};
}

JavaFirefoxExtension.doIt = function() {
	// var focusedWindow = document.commandDispatcher.focusedWindow;
	alert(window._content.getSelection() + "\n"
			+ window._content.document.location.href);
	// var viewsource = window._content.document.body;

	// alert(focusedWindow);
};

JavaFirefoxExtension.googleAPI = function(query) {
	try {
		var bridge = this.getFoo();

		var test = bridge.wrappedJSObject.getTest();
		// test.count();

		// alert(test.googleAPI(query));
		// window.content.document.close();
		window.content.document.open();
		window.content.document.write(test.googleAPI(query));
		window.content.document.close();
	} catch (e) {
		this._fail(e);
	}
};

JavaFirefoxExtension.getOntology = function() {
	try {
		var bridge = this.getFoo();

		var test = bridge.wrappedJSObject.getTest();
		// return test.getOntology();

	} catch (e) {
		this._fail(e);
	}
}

JavaFirefoxExtension.getFoo = function() {
	return Components.classes["@art.info.uniroma2.it/semanticturkey;1"]
			.getService(Components.interfaces.nsISemanticTurkey);
}

JavaFirefoxExtension._trace = function(msg) {
	Components.classes["@mozilla.org/consoleservice;1"]
			.getService(Components.interfaces.nsIConsoleService)
			.logStringMessage(msg);
}

JavaFirefoxExtension._fail = function(e) {
	var msg;
	if (e.getMessage) {
		msg = e + ": " + e.getMessage() + "\n";
		while (e.getCause() != null) {
			e = e.getCause();
			msg += "caused by " + e + ": " + e.getMessage() + "\n";
		}
	} else {
		msg = e;
	}
	alert(msg);
};

function highlightAnnFunction() {
	// NScarpato add highlith for all occurence of annotations
	// findTextannotation(currentdoc, annotationValue);
	var url = gBrowser.selectedBrowser.currentURI.spec;
	url = url.replace("&", "%26");
	httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=annotation&request=getPageAnnotations&urlPage="
			+ encodeURIComponent(url));
}

function listDragDrop(event,document) {
	var elementName = event.target.tagName;
	if (elementName == "listitem") {
		var listItem = event.target;
		var ds = Components.classes["@mozilla.org/widget/dragservice;1"]
				.getService(Components.interfaces.nsIDragService);
		var ses = ds.getCurrentSession();
		var list = document.getElementById('InstancesList');
		var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1']
				.getService(Components.interfaces.nsIWindowMediator);
		var topWindowOfType = windowManager
				.getMostRecentWindow("navigator:browser");
		var tabWin = topWindowOfType.gBrowser.selectedBrowser.currentURI.spec;
		tabWin = tabWin.replace(/&/g, "%26");
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
			parameters.subjectInstanceName = listItem.getAttribute("label");
			parameters.parentClsName = listItem.getAttribute("parentCls");
			parameters.objectInstanceName = str;
			parameters.urlPage = tabWin;
			parameters.title = title;
			parameters.tree = list;
			parameters.panelTree = document.getElementById('outlineTree');
			window.openDialog("chrome://semantic-turkey/content/annotator.xul",
					"_blank", "modal=yes,resizable,centerscreen", parameters);
		}
	} else {
		alert("No Individual Selected!");
	}
}

function treeDragDrop(event,document) {
var stloader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
		stloader.loadSubScript('chrome://global/content/nsDragAndDrop.js');
		stloader.loadSubScript('chrome://global/content/nsTransferable.js');
		stloader.loadSubScript('chrome://semantic-turkey/content/scripts/captain.js');
event.stopPropagation(); // This line was in an example, will test if we
								// need it later...
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect")

	var ds = Components.classes["@mozilla.org/widget/dragservice;1"]
			.getService(Components.interfaces.nsIDragService);
	var ses = ds.getCurrentSession()

	var sourceNode = ses.sourceNode;
	 var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
		var topWindowOfType = windowManager.getMostRecentWindow("navigator:browser");
		var tabWin = topWindowOfType.gBrowser.selectedBrowser.currentURI.spec;
	if (sourceNode.nodeName == "treeitem") {
		
		var tree = document.getElementById('outlineTree')
		// We'll just get the node id from the source element
		var nodeId = sourceNode.firstChild.getAttribute('_exe_nodeid')
		// Get the new parent node
		var row = {}
		var col = {}
		var child = {}
		tree.treeBoxObject.getCellAt(event.pageX, event.pageY, row, col, child)
		// CRAPINESS ALERT!
		// If they're moving, (without ctrl down) the target node becomes our
		// sibling
		// above us. If copying, the source node becomes the first child of the
		// target node
		var targetNode = getOutlineItem(tree, row.value)

		var treerow = targetNode.getElementsByTagName('treerow')[0];
		var treecell = treerow.getElementsByTagName('treecell')[0];

		if (treecell.getAttribute('properties') == "instance") {
			return;
		}

		if (ses.dragAction && ses.DRAGDROP_ACTION_COPY) {
			// Target node is our parent, sourceNode becomes first child
			var parentItem = targetNode
			var sibling = null // Must be worked out after we get 'container'
								// (treeitems)
			var before = true
		} else {
			// Target node is our sibling, we'll be inserted below (vertically)
			// it on the same tree level
			var parentItem = targetNode.parentNode.parentNode
			var sibling = targetNode
			var before = false
		}

		// Do some sanity checking
		if ((sourceNode == parentItem) || (sourceNode == targetNode))
			return;
		var parentItemId = parentItem.firstChild.getAttribute('_exe_nodeid')
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
		var node = targetNode.parentNode
		while (node) {
			if (node == sourceNode) {
				return
			} // Can't drag into own children
			node = node.parentNode
		}
		// Re-organise the tree...
		// See if parent is a container
		var isContainer = parentItem.getAttribute('container')
		if ((!isContainer) || (isContainer == 'false')) {
			// Make it one
			var container = parentItem.appendChild(document
					.createElement('treechildren'))
			parentItem.setAttribute('container', 'true')
			parentItem.setAttribute('open', 'true')
		} else {
			var container = parentItem.getElementsByTagName('treechildren')[0]
			// If still haven't got a 'treechildren' node, then make one
			if (!container) {
				var container = parentItem.appendChild(document
						.createElement('treechildren'))
			}
		}
		// Now we can work out our sibling if we don't already have it
		if (before) {
			sibling = container.firstChild
		}
		// Move the node
		var oldContainer = sourceNode.parentNode
		try {
			oldContainer.removeChild(sourceNode)
		} catch (e) {
		} // For some reason works, but still raises exception!
		if (sibling) { // If the container has children
			// Insert either before or after the sibling
			if (before) {
				if (sibling) {
					container.insertBefore(sourceNode, sibling)
				} else {
					container.appendChild(sourceNode)
				}
			} else {
				// Append after target node
				if (sibling.nextSibling) {
					container.insertBefore(sourceNode, sibling.nextSibling)
				} else {
					container.appendChild(sourceNode)
				}
			}
		} else {
			// Otherwise, just make it be the only child
			container.appendChild(sourceNode)
		}
		// See if the old parent node is no longer a container
		if (oldContainer.childNodes.length == 0) {
			// alert("oldContainer: " + oldContainer.nodeName);
			oldContainer.parentNode.setAttribute('open', 'false') // controlla
																	// se da
																	// problemi
			oldContainer.parentNode.setAttribute('container', 'false')
			oldContainer.parentNode.removeChild(oldContainer) // Remove the
																// treechildren
																// node
		}
		// Tell the server what happened
		var nextSiblingNodeId = null
		var sibling = sourceNode.nextSibling
		if (sibling) {
			nextSiblingNodeId = sibling.firstChild.getAttribute('_exe_nodeid')
		}
		nevow_clientToServerEvent('outlinePane.handleDrop', this, '',
				sourceNode.firstChild.getAttribute('_exe_nodeid'),
				parentItemId, nextSiblingNodeId)
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
		/*
		 * var requestor =
		 * topWindowOfType.QueryInterface(Components.interfaces.nsIInterfaceRequestor);
		 * var nav =
		 * requestor.getInterface(Components.interfaces.nsIWebNavigation); if
		 * (nav) alert("prova" + nav.currentURI.path);
		 */

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

		
			var tree = document.getElementById('outlineTree');
			// Get the new parent node
			var row = {}
			var col = {}
			var child = {}
			tree.treeBoxObject.getCellAt(event.pageX, event.pageY, row, col,
					child)
			// CRAPINESS ALERT!
			// If they're moving, (without ctrl down) the target node becomes
			// our sibling
			// above us. If copying, the source node becomes the first child of
			// the target node
			
			var targetNode = getOutlineItem(tree, row.value)

			var trecell = targetNode.getElementsByTagName("treecell")[0];
			var attr = trecell.getAttribute("properties");

			var temp = trecell.parentNode.parentNode.parentNode.parentNode;
			temp = temp.getElementsByTagName("treerow")[0];
			var parentcell = temp.getElementsByTagName("treecell")[0];

			tabWin = tabWin.replace(/&/g, "%26");
			var parameters = new Object();
			parameters.subjectInstanceName = trecell.getAttribute("label");
			parameters.parentClsName = parentcell.getAttribute("label");
			parameters.objectInstanceName = str;
			parameters.urlPage = tabWin;
			parameters.title = title;
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
			var list=document.getElementById('InstancesList');
			parameters2.tree=tree;
			parameters2.list=list;
			httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=annotation&request=createAndAnnotate&clsQName="
					+ encodeURIComponent(trecell.getAttribute("label"))
					+ "&instanceQName="
					+ encodeURIComponent(str)
					+ "&urlPage="
					+ encodeURIComponent(tabWin)
					+ "&title="
					+ encodeURIComponent(title),false,parameters2);
			
		}
	}
}
