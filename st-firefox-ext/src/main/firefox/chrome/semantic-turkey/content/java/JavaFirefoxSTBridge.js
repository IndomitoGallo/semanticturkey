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

// TODO all javascript code related to Java bridging has been confined here. Note that there are no imports
// here, in fact this file has not been validated after being isolated here
art_semanticturkey.JavaFirefoxSTBridge = new Object();


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

		// art_semanticturkey.registerAnnotationFamilies();  this has been separated from the Java bridge and put elsewhere
	} catch (e) {
		art_semanticturkey.JavaFirefoxSTBridge._fail(e);
		art_semanticturkey.Logger.printException(e);
	}
	// art_semanticturkey.ST_started.setStatus(); this has been separated from the Java bridge and put elsewhere
};


art_semanticturkey.JavaFirefoxSTBridge._getExtensionPath = function(extensionName) {
	var chromeRegistry = Components.classes["@mozilla.org/chrome/chrome-registry;1"]
			.getService(Components.interfaces.nsIChromeRegistry);

	var uri = Components.classes["@mozilla.org/network/standard-url;1"]
			.createInstance(Components.interfaces.nsIURI);

	uri.spec = "chrome://" + extensionName + "/content/";

	var path = chromeRegistry.convertChromeURL(uri);
	if (typeof (path) == "object") {
		path = path.spec;
	}

	path = path.substring(0, path.indexOf("/chrome/") + 1);

	return path;
};

art_semanticturkey.JavaFirefoxSTBridge._packageLoader = function(urlStrings, trace) {
	art_semanticturkey.JavaFirefoxSTBridge._trace("packageLoader {");

	/*
	 * Starting from FF 15.0 the reference window.java is no longer available to scripts. A workaround
	 * consists in running an applet (e.g. java.applet.Applet) so that scripts may access the package java
	 * from it. For further information, see: https://bugzilla.mozilla.org/show_bug.cgi?id=748343
	 */
	var embeddedAppletElement = window.document.createElementNS("http://www.w3.org/1999/xhtml", "embed");
	embeddedAppletElement.setAttribute("id", "st_emebedded_java_applet");
	embeddedAppletElement.setAttribute("type", "application/x-java-applet");
	embeddedAppletElement.setAttribute("code", "java.applet.Applet");
	embeddedAppletElement.setAttribute("MAYSCRIPT", "true");
	embeddedAppletElement.setAttribute("width", "0");
	embeddedAppletElement.setAttribute("height", "0");

	// It seems that the applet is not initialized until it is inserted into the
	// DOM tree.
	window.document.documentElement.appendChild(embeddedAppletElement);

	/*
	 * According to the first paragraph of this web page:
	 * http://docs.oracle.com/javase/tutorial/deployment/applet/appletStatus.html the execution of the
	 * following expression will be blocked until the applet has been initialized. However, this could freez
	 * FF.
	 */
	var java = embeddedAppletElement.Packages.java;

	var toUrlArray = function(a) {
		// var urlArray = java.lang.reflect.Array.newInstance(java.net.URL,
		// a.length);
		var dummyUrl = new java.net.URL("http://abc.xyz.org");
		var urlArray = java.lang.reflect.Array.newInstance(dummyUrl.getClass(), a.length);
		for ( var i = 0; i < a.length; i++) {
			var url = a[i];
			java.lang.reflect.Array.set(urlArray, i, (typeof url == "string") ? new java.net.URL(url) : url);
		}
		return urlArray;
	};

	var firefoxClassLoaderURL = new java.net.URL(art_semanticturkey.JavaFirefoxSTBridge
			._getExtensionPath("semantic-turkey")
			+ "components/lib/javaFirefoxExtensionUtils.jar");

	if (trace)
		art_semanticturkey.JavaFirefoxSTBridge._trace("classLoaderURL " + firefoxClassLoaderURL);

	// ===== Stage 1. Prepare to Give All Permission to the Java Code to be
	// Loaded =====

	/*
	 * Step 1. Load the bootstraping firefoxClassLoader.jar, which contains URLSetPolicy. We need URLSetPolicy
	 * so that we can give ourselves more permission.
	 */
	var bootstrapClassLoader = java.net.URLClassLoader.newInstance(toUrlArray([ firefoxClassLoaderURL ]));
	if (trace)
		art_semanticturkey.JavaFirefoxSTBridge._trace("created loader");

	/*
	 * Step 2. Instantiate a URLSetPolicy object from firefoxClassLoader.jar.
	 */
	var policyClass = java.lang.Class.forName("edu.mit.simile.javaFirefoxExtensionUtils.URLSetPolicy", true,
			bootstrapClassLoader);
	var policy = policyClass.newInstance();
	if (trace)
		art_semanticturkey.JavaFirefoxSTBridge._trace("policy");

	/*
	 * Step 3. Now, the trick: We wrap our own URLSetPolicy around the current security policy of the JVM
	 * security manager. This allows us to give our own Java code whatever permission we want, even though
	 * Firefox doesn't give us any permission.
	 */
	policy.setOuterPolicy(java.security.Policy.getPolicy());
	java.security.Policy.setPolicy(policy);
	if (trace)
		art_semanticturkey.JavaFirefoxSTBridge._trace("set policy");

	/*
	 * Step 4. Give ourselves all permission. Yay!
	 */
	policy.addPermission(new java.security.AllPermission());
	if (trace)
		art_semanticturkey.JavaFirefoxSTBridge._trace("got all permissions");

	/*
	 * That's pretty much it for the security bootstraping hack. But we want to do a little more. We want our
	 * own class loader for subsequent JARs that we load.
	 */

	// ===== Stage 2. Create Our Own Class Loader so We Can Do Things Like
	// Tracing Class Loading =====
	/*
	 * Reload firefoxClassLoader.jar and so we can make use of TracingClassLoader. We need to reload it
	 * because when it was loaded previously, we had not yet set the policy to give it enough permission for
	 * loading classes.
	 */

	policy.addURL(firefoxClassLoaderURL);
	if (trace)
		art_semanticturkey.JavaFirefoxSTBridge._trace("added url");

	var firefoxClassLoaderPackages = new WrappedPackages(java.net.URLClassLoader
			.newInstance(toUrlArray([ firefoxClassLoaderURL ])));
	if (trace)
		art_semanticturkey.JavaFirefoxSTBridge._trace("wrapped loader");

	var tracingClassLoaderClass = firefoxClassLoaderPackages
			.getClass("edu.mit.simile.javaFirefoxExtensionUtils.TracingClassLoader");
	if (trace)
		art_semanticturkey.JavaFirefoxSTBridge._trace("got class");

	var classLoader = tracingClassLoaderClass.m("newInstance")(trace);
	art_semanticturkey.JavaFirefoxSTBridge._trace("got new loader");

	// ===== Stage 3. Actually Load the Code We Were Asked to Load =====

	var urls = toUrlArray(urlStrings);

	/*
	 * Give it the JARs we were asked to load - should now load them with all permissions.
	 */
	classLoader.add(firefoxClassLoaderURL);

	for ( var i = 0; i < urls.length; i++) {
		var url = java.lang.reflect.Array.get(urls, i);
		classLoader.add(url);
		policy.addURL(url);
	}
	art_semanticturkey.JavaFirefoxSTBridge._trace("added urls");
	java.lang.Thread.currentThread().setContextClassLoader(classLoader);
	art_semanticturkey.JavaFirefoxSTBridge._trace("set context");

	/*
	 * Wrap up the class loader and return
	 */
	var packages = new WrappedPackages(classLoader);
	art_semanticturkey.JavaFirefoxSTBridge._trace("wrapped");

	art_semanticturkey.JavaFirefoxSTBridge._trace("} packageLoader");

	return packages;
};

/*
 * Wraps a class loader and allows easy access to the classes that it loads.
 */
function WrappedPackages(classLoader) {
	var packages = classLoader.loadClass("edu.mit.simile.javaFirefoxExtensionUtils.Packages").newInstance();

	var arrayListClass = classLoader.loadClass("java.util.ArrayList");

	var argumentsToArray = function(args) {
		// this direct method is actualy not supported by current java versions,
		// so need to create
		// a dummy java object
		// var a = java.lang.reflect.Array.newInstance(java.lang.Object,
		// args.length);

		var a = arrayListClass.newInstance();
		for ( var i = 0; i < args.length; i++) {
			// arrayClass.set(a, i, args[i]);
			a.add(args[i]);
		}
		return a.toArray();
	};

	this.getClass = function(className) {
		var classWrapper = packages.getClass(className);
		if (classWrapper) {
			return {
				n : function() {
					return classWrapper.callConstructor(argumentsToArray(arguments));
				},
				f : function(fieldName) {
					return classWrapper.getField(fieldName);
				},
				m : function(methodName) {
					return function() {
						return classWrapper.callMethod(methodName, argumentsToArray(arguments));
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

art_semanticturkey.JavaFirefoxSTBridge.doIt = function() {
	// var focusedWindow = document.commandDispatcher.focusedWindow;
	alert(window._content.getSelection() + "\n" + window._content.document.location.href);
	// var viewsource = window._content.document.body;

	// alert(focusedWindow);
};

art_semanticturkey.JavaFirefoxSTBridge.googleAPI = function(query) {
	try {
		var bridge = this.getSemanticTurkey();

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

art_semanticturkey.JavaFirefoxSTBridge.getOntology = function() {
	try {
		var bridge = this.getSemanticTurkey();

		var test = bridge.wrappedJSObject.getTest();
		// return test.getOntology();

	} catch (e) {
		this._fail(e);
	}
};

art_semanticturkey.JavaFirefoxSTBridge.getSemanticTurkey = function() {
	return Components.classes["@art.uniroma2.it/semanticturkey;1"]
			.getService(Components.interfaces.nsISemanticTurkey);
};

art_semanticturkey.JavaFirefoxSTBridge._trace = function(msg) {
	Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService)
			.logStringMessage(msg);
};

art_semanticturkey.JavaFirefoxSTBridge._fail = function(e) {
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