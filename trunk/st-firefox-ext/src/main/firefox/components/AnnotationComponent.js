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
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const ctor = Components.Constructor;
const Exception = Components.Exception;
const module = Components.utils.import;
const error = Components.utils.reportError;


//Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
const NS_ERROR_NO_INTERFACE = Cr.NS_ERROR_NO_INTERFACE;
const NS_ERROR_FAILURE = Cr.NS_ERROR_FAILURE;
const NS_ERROR_NO_AGGREGATION = Cr.NS_ERROR_NO_AGGREGATION;
const NS_ERROR_INVALID_ARG = Cr.NS_ERROR_INVALID_ARG;

//We are using this to xpcom registration
module("resource://gre/modules/XPCOMUtils.jsm");
/*******************************************************************************
 * constants
 ******************************************************************************/

// reference to the interface defined in nsISemanticTurkeyAnnotation.idl
var nsISemanticTurkeyAnnotation = Components.interfaces.nsISemanticTurkeyAnnotation;

// reference to the required base interface that all components must support
var nsISupports = Components.interfaces.nsISupports;

// UUID uniquely identifying our component
var myUUid = generateMyUUID();
// http://www.famkruithof.net/uuid/uuidgen
// a4bd5780-fe6f-11dd-87af-0800200c9a66

// array that contains the registered annotation function
var AnnotFunctionList = new Array();

function AnnotationComponent() {
	/*
	 * This is a XPCOM-in-Javascript trick: Clients using an XPCOM implemented
	 * in Javascript can access its wrappedJSObject field and then from there,
	 * access its Javascript methods that are not declared in any of the IDL
	 * interfaces that it implements.
	 * 
	 * Being able to call directly the methods of a Javascript-based XPCOM
	 * allows clients to pass to it and receive from it objects of types not
	 * supported by IDL.
	 */
//	we  do need these 3 lines!
	this.wrappedJSObject = this;// javascript
	this._initialized = false;
	this._packages = null;
}


//  
//  
//  to be removed in FF4.0 port we are using XPCOMUtils.jsm to  get registered (FF3.6 and FF4.0)
//var AnnotationModule = {
//	_myComponentID : Components.ID("{a4bd5780-fe6f-11dd-87af-0800200c9a66}"),
//	_myName : "The mange annnotation component",
//	_myContractID : "@art.uniroma2.it/semanticturkeyannotation;1",
//	// important this module can be instantiate only one time
//	_singleton : true,
//	_myFactory : {
//		createInstance : function(outer, iid) {
//			if (outer != null) {
//				throw Components.results.NS_ERROR_NO_AGGREGATION;
//			}
//			var instance = null;
//
//			if (this._singleton) {
//				instance = this.theInstance;
//			}
//
//			if (!(instance)) {
//				instance = new AnnotationComponent(); // AnnotationComponent
//				// is declared below
//			}
//
//			if (this._singleton) {
//				this.theInstance = instance;
//			}
//
//			return instance.QueryInterface(iid);
//		}
//	},
//	registerSelf : function(compMgr, fileSpec, location, type) {
//		compMgr = compMgr
//				.QueryInterface(Components.interfaces.nsIComponentRegistrar);
//		compMgr.registerFactoryLocation(this._myComponentID, this._myName,
//				this._myContractID, fileSpec, location, type);
//	},
//
//	unregisterSelf : function(compMgr, fileSpec, location) {
//		compMgr = compMgr
//				.QueryInterface(Components.interfaces.nsIComponentRegistrar);
//		compMgr.unregisterFactoryLocation(this._myComponentID, fileSpec);
//	},
//
//	getClassObject : function(compMgr, cid, iid) {
//		if (cid.equals(this._myComponentID)) {
//			return this._myFactory;
//		} else if (!iid.equals(Components.interfaces.nsIFactory)) {
//			throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
//		}
//
//		throw Components.results.NS_ERROR_NO_INTERFACE;
//	},
//
//	canUnload : function(compMgr) {
//		/*
//		 * Do any unloading task you want here
//		 */
//		return true;
//	}
//};

//To be changed in FF4.0 port
///**
// * @author NScarpato return the annotation module
// * @return Annotation Module
// */
//function NSGetModule(compMgr, fileSpec) {
//	return AnnotationModule;
//}



//we don't need this since  XPCOMUtils will generate a QueryInterface for us
///*
// * nsISupports.QueryInterface
// */
//AnnotationComponent.prototype.QueryInterface = function(iid) {
//	/*
//	 * This code specifies that the component supports 2 interfaces:
//	 * nsISemanticTurkeyAnnotation and nsISupports.
//	 */
//	if (!iid.equals(nsISemanticTurkeyAnnotation) && !iid.equals(nsISupports)) {
//		throw Components.results.NS_ERROR_NO_INTERFACE;
//	}
//	return this;
//};

AnnotationComponent.prototype={
    //XPCOMUtils.jsm needs these 
    classDescription:"AnnotationComponent for SemanticTurkey",
    contractID:"@art.uniroma2.it/semanticturkeyannotation;1",
    classID: Components.ID("{a4bd5780-fe6f-11dd-87af-0800200c9a66}"),    
    QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsISupport,nsISemanticTurkeyAnnotation]),
    _xpcom_categories: [{
        category: 'profile-after-change'
    }]
    
    
};
/*
 * Initializes this component, including loading JARs.
 */

AnnotationComponent.prototype._fail = function(e) {
	if (e.getMessage) {
		this.error = e + ": " + e.getMessage() + "\n";
		while (e.getCause() != null) {
			e = e.getCause();
			this.error += "caused by " + e + ": " + e.getMessage() + "\n";
		}
	} else {
		this.error = e;
	}
};

AnnotationComponent.prototype._trace = function(msg) {
	if (this._traceFlag) {
		_printModuleToJSConsole(msg);
	}
};

/**
 * register the function related to annotation mode
 * 
 * @param annFunctionName
 * @param lexAnnFunction
 *            drag_drop on instance and annotated lexicalization
 * @param highlightAnnFunction
 *            highlight of range annotation
 * @param classAnnFunction
 *            drag_drop on class
 * @param propAnnFunction
 *            drag_drop on instance and enrichment of a property
 */

//register the family of function
AnnotationComponent.prototype.register = function(newFamily) {
	var nameFamily = newFamily.getname();
	AnnotFunctionList[nameFamily] = newFamily;	
};

AnnotationComponent.prototype.getList = function() {
	return AnnotFunctionList;
};

//add function to an existent family
AnnotationComponent.prototype.addToFamily = function(name, event, functionObject) {
	
		AnnotFunctionList[name].addfunction(event, functionObject);
};

//object family
AnnotationComponent.prototype.Family = function(nameFamily) {
	var name = nameFamily;
	var eventFunctions = new Array();
	eventFunctions["selectionOverResource"] = new AnnotationComponent.prototype.ClassEvent();
	eventFunctions["highlightAnnotations"] = new AnnotationComponent.prototype.ClassEvent();

	//add function to family for a given event
	this.addfunction = function(event, functionObject) {
		eventFunctions[event].add(functionObject);
	};
	
	this.getfunctions = function(event) {
		return eventFunctions[event].getfunction();
	};
	
	this.getname = function() {
		return name;
	};
	this.getArrayEventFunctions = function() {
		return eventFunctions;
	};
	
	//remove function from a given event
	this.removefunction = function(event,functionObject) {
		eventFunctions[event].remove(functionObject);
	};
	
};

//object class event
AnnotationComponent.prototype.ClassEvent = function() {
	var functions = new Array();
	
	this.add = function(functionObject) {
		functions.push(functionObject);
	};
	
	this.getfunction = function() {
		return functions;
	};
	
	this.remove = function(functionObject) {
		functions.splice(functions.indexOf(functionObject), 1);
	};
};

//object that represent the funciton stored in family object
AnnotationComponent.prototype.functionObject = function(fun, descr) {
	var funct = fun;			//function to register
	var description = descr;	//description of function: used for the menu
	var enabled=true;			//enable field: if false function is not visible in the menu
	
	this.isEnabled = function() {
		return enabled;
	};
	
	this.enable = function() {
		enabled=true;
	};
	
	this.disable = function() {
		enabled=false;
	};
	
	this.getfunct = function() {
		return funct;
	};
	
	this.getdescription = function() {
		return description;
	};
};

/**
 * generateMyUUID
 * 
 * @author NScarpato
 * @return UUID
 */
function generateMyUUID() {
	var uuidGenerator = Components.classes["@mozilla.org/uuid-generator;1"]
			.getService(Components.interfaces.nsIUUIDGenerator);
	var uuid = uuidGenerator.generateUUID();
	var uuidString = uuid.toString();
	return uuidString;
}
/**
 * check if annFunction is yet present in preferences
 * 
 * @author NScarpato
 * @return: true if isn't yet registered false otherwise
 */
function checkRegister(annFunctionName) {
	var annPrefsEntry = "extensions.semturkey.extpt.annotateList";
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
	// Available Annotation options
	var annList = prefs.getCharPref(annPrefsEntry).split(",");
	for ( var i = 0; i < annList.length; i++) {
		if (annList[i] == annFunctionName)
			return true;
	}

	return false;
}

function _printModuleToJSConsole(msg) {
	/*
	 * Components.classes["@mozilla.org/consoleservice;1"]
	 * .getService(Components.interfaces.nsIConsoleService)
	 * .logStringMessage(msg);
	 */
}

if (XPCOMUtils.generateNSGetFactory) {  //we have 2 entry points from FF depending on FF version
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([AnnotationComponent]); 
}//we are in FF4.0
else {
function NSGetModule() XPCOMUtils.generateModule([AnnotationComponent]);
//
} //we are in FF3.6


