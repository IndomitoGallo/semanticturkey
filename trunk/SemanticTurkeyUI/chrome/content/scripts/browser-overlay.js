/*
 * this code is borrowed and adapted from the original code, written by David Huynh, and downloadable from:
 * http://simile.mit.edu/wiki/Java_Firefox_Extension
 */
var JavaFirefoxExtension = new Object();

JavaFirefoxExtension.initialize = function() {
    try {
        /*
         *  Get a Foo component
         */
        var bridge = this.getFoo();
        
        /*
         *  Initialize it. The trick is to get past its IDL interface
         *  and right into its Javascript implementation, so that we
         *  can pass it the LiveConnect "java" object, which it will
         *  then use to load its JARs. Note that XPCOM Javascript code
         *  is not given LiveConnect by default.
         */
         
        if (!bridge.wrappedJSObject.initialize(JavaFirefoxExtension._packageLoader, true)) {
            alert(bridge.wrappedJSObject.error);
        }
    } catch (e) {
        this._fail(e);
    }
};

JavaFirefoxExtension._getExtensionPath = function(extensionName) {
    var chromeRegistry =
        Components.classes["@mozilla.org/chrome/chrome-registry;1"]
            .getService(Components.interfaces.nsIChromeRegistry);
            
    var uri =
        Components.classes["@mozilla.org/network/standard-url;1"]
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
        var urlArray = java.lang.reflect.Array.newInstance(java.net.URL, a.length);
        for (var i = 0; i < a.length; i++) {
            var url = a[i];
            java.lang.reflect.Array.set(
                urlArray, 
                i, 
                (typeof url == "string") ? new java.net.URL(url) : url
            );
        }
        return urlArray;
    };
        
    var firefoxClassLoaderURL = 
        new java.net.URL(
            JavaFirefoxExtension._getExtensionPath("semantic-turkey") + 
            "components/javaFirefoxExtensionUtils.jar");
    
    if (trace) JavaFirefoxExtension._trace("classLoaderURL " + firefoxClassLoaderURL);
    
    //===== Stage 1. Prepare to Give All Permission to the Java Code to be Loaded =====
    
        /*
         *  Step 1. Load the bootstraping firefoxClassLoader.jar, which contains URLSetPolicy.
         *  We need URLSetPolicy so that we can give ourselves more permission.
         */
        var bootstrapClassLoader = java.net.URLClassLoader.newInstance(toUrlArray([ firefoxClassLoaderURL ]));
        if (trace) JavaFirefoxExtension._trace("created loader");
        
        /*
         *  Step 2. Instantiate a URLSetPolicy object from firefoxClassLoader.jar.
         */
        var policyClass = java.lang.Class.forName(
            "edu.mit.simile.javaFirefoxExtensionUtils.URLSetPolicy",
            true,
            bootstrapClassLoader
        );
        var policy = policyClass.newInstance();
        if (trace) JavaFirefoxExtension._trace("policy");
        
        /*
         *  Step 3. Now, the trick: We wrap our own URLSetPolicy around the current security policy 
         *  of the JVM security manager. This allows us to give our own Java code whatever permission 
         *  we want, even though Firefox doesn't give us any permission.
         */
        policy.setOuterPolicy(java.security.Policy.getPolicy());
        java.security.Policy.setPolicy(policy);
        if (trace) JavaFirefoxExtension._trace("set policy");
        
        /*
         *  Step 4. Give ourselves all permission. Yay!
         */
        policy.addPermission(new java.security.AllPermission());
        if (trace) JavaFirefoxExtension._trace("got all permissions");
        
        /*
         *  That's pretty much it for the security bootstraping hack. But we want to do a little more. 
         *  We want our own class loader for subsequent JARs that we load.
         */
    
    
    //===== Stage 2. Create Our Own Class Loader so We Can Do Things Like Tracing Class Loading =====
    
        /*
         *  Reload firefoxClassLoader.jar and so we can make use of TracingClassLoader. We 
         *  need to reload it because when it was loaded previously, we had not yet set the policy 
         *  to give it enough permission for loading classes.
         */
      
        policy.addURL(firefoxClassLoaderURL);
        if (trace) JavaFirefoxExtension._trace("added url");
        
        var firefoxClassLoaderPackages = new WrappedPackages(
            java.net.URLClassLoader.newInstance(toUrlArray([ firefoxClassLoaderURL ]))
        );
        if (trace) JavaFirefoxExtension._trace("wrapped loader");
        
        var tracingClassLoaderClass = 
            firefoxClassLoaderPackages.getClass("edu.mit.simile.javaFirefoxExtensionUtils.TracingClassLoader");
        if (trace) JavaFirefoxExtension._trace("got class");
    
        var classLoader = tracingClassLoaderClass.m("newInstance")(trace);
        JavaFirefoxExtension._trace("got new loader");
        
    //===== Stage 3. Actually Load the Code We Were Asked to Load =====
    
        var urls = toUrlArray(urlStrings);
        
        /*
         *  Give it the JARs we were asked to load - should now load them with 
         *  all permissions.
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
         *  Wrap up the class loader and return
         */
        var packages = new WrappedPackages(classLoader);
        JavaFirefoxExtension._trace("wrapped");
        
        JavaFirefoxExtension._trace("} packageLoader");
        
        return packages;
};

/*
 *  Wraps a class loader and allows easy access to the classes that it loads.
 */
function WrappedPackages(classLoader) {
    var packages = classLoader.loadClass("edu.mit.simile.javaFirefoxExtensionUtils.Packages").newInstance();
    
    var argumentsToArray = function(args) {
        var a = java.lang.reflect.Array.newInstance(java.lang.Object, args.length);
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

JavaFirefoxExtension.doIt = function() {
    //var focusedWindow = document.commandDispatcher.focusedWindow;
 	alert(window._content.getSelection() + "\n" + window._content.document.location.href);
    //var viewsource = window._content.document.body;
   
    //alert(focusedWindow);
};

JavaFirefoxExtension.googleAPI = function(query) {
    try {
        var bridge = this.getFoo();
        
        var test = bridge.wrappedJSObject.getTest();
        //test.count();
        
        //alert(test.googleAPI(query));
	//window.content.document.close();
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
        //return test.getOntology();
	
    } catch (e) {
        this._fail(e);
    }
}



JavaFirefoxExtension.getFoo = function() {
    return Components.classes["@art.info.uniroma2.it/semanticturkey;1"]
        .getService(Components.interfaces.nsISemanticTurkey);
}

JavaFirefoxExtension._trace = function (msg) {
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
