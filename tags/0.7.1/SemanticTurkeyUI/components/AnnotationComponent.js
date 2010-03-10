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

var AnnotationModule = {
	_myComponentID : Components.ID("{a4bd5780-fe6f-11dd-87af-0800200c9a66}"),
	_myName : "The mange annnotation component",
	_myContractID : "@art.uniroma2.it/semanticturkeyannotation;1",
	// important this module can be instantiate only one time
	_singleton : true,
	_myFactory : {
		createInstance : function(outer, iid) {
			if (outer != null) {
				throw Components.results.NS_ERROR_NO_AGGREGATION;
			}
			var instance = null;

			if (this._singleton) {
				instance = this.theInstance;
			}

			if (!(instance)) {
				instance = new AnnotationComponent(); // AnnotationComponent
				// is declared below
			}

			if (this._singleton) {
				this.theInstance = instance;
			}

			return instance.QueryInterface(iid);
		}
	},
	registerSelf : function(compMgr, fileSpec, location, type) {
		compMgr = compMgr
				.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		compMgr.registerFactoryLocation(this._myComponentID, this._myName,
				this._myContractID, fileSpec, location, type);
	},

	unregisterSelf : function(compMgr, fileSpec, location) {
		compMgr = compMgr
				.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		compMgr.unregisterFactoryLocation(this._myComponentID, fileSpec);
	},

	getClassObject : function(compMgr, cid, iid) {
		if (cid.equals(this._myComponentID)) {
			return this._myFactory;
		} else if (!iid.equals(Components.interfaces.nsIFactory)) {
			throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
		}

		throw Components.results.NS_ERROR_NO_INTERFACE;
	},

	canUnload : function(compMgr) {
		/*
		 * Do any unloading task you want here
		 */
		return true;
	}
};

/**
 * @author NScarpato return the annotation module
 * @return Annotation Module
 */
function NSGetModule(compMgr, fileSpec) {
	return AnnotationModule;
}

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
	this.wrappedJSObject = this;// javascript
	this._initialized = false;
	this._packages = null;
}

/*
 * nsISupports.QueryInterface
 */
AnnotationComponent.prototype.QueryInterface = function(iid) {
	/*
	 * This code specifies that the component supports 2 interfaces:
	 * nsISemanticTurkeyAnnotation and nsISupports.
	 */
	if (!iid.equals(nsISemanticTurkeyAnnotation) && !iid.equals(nsISupports)) {
		throw Components.results.NS_ERROR_NO_INTERFACE;
	}
	return this;
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
AnnotationComponent.prototype.register = function(annFunctionName,
		furtherAnnotation, highlightAnnFunction, listAnnFunction,
		classAnnotationFunction, listDragDropEnrichProp,  listDragDropBind,  listDragDropAnnotateInst) {
	// if (!checkRegister(annFunctionName)) {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
	/*
	 * var annotList = prefs
	 * .getCharPref("extensions.semturkey.extpt.annotateList");
	 * prefs.setCharPref("extensions.semturkey.extpt.annotateList", annotList +
	 * "," + annFunctionName);
	 */
	// prefs.setCharPref("extensions.semturkey.extpt.annotate",
	// annFunctionName);
	// } else {
	// _printModuleToJSConsole("already_register");
	// }
	// TODO add propAnnFunction
	AnnotFunctionList[annFunctionName] = new Array();
	AnnotFunctionList[annFunctionName]["furtherAnnotation"] = furtherAnnotation;
	
	AnnotFunctionList[annFunctionName]["highlightAnnotation"] = highlightAnnFunction;
	
	AnnotFunctionList[annFunctionName]["listDragDrop"] = listAnnFunction;
	
	AnnotFunctionList[annFunctionName]["listDragDropEnrichProp"] = listDragDropEnrichProp;
	
	AnnotFunctionList[annFunctionName]["listDragDropBind"] = listDragDropBind;
	
	AnnotFunctionList[annFunctionName]["listDragDropAnnotateInst"] = listDragDropAnnotateInst;
	
	AnnotFunctionList[annFunctionName]["classDragDrop"] = classAnnotationFunction;
	
	return true;
};
AnnotationComponent.prototype.getList = function() {
	return AnnotFunctionList;
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