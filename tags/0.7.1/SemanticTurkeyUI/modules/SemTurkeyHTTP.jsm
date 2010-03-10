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

/*PATTUMIERA*/
function readServer() {
	return "127.0.0.1";
}

/*PATTUMIERA*/

Components.utils.import("resource://stmodules/Preferences.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");

let
EXPORTED_SYMBOLS = [ "HttpMgr" ];

const
USER_AGENT = "Semantic Turkey";
const
RESULT_OK = 0;
const
RESULT_PARSE_ERROR = 1;
const
RESULT_NOT_FOUND = 2;
const
RESULT_NOT_AVAILABLE = 3;
const
RESULT_ERROR_FAILURE = 4;
const
RESULT_NOT_RSS = 5;


httpErrorHappened = false;

// TODO i've to remove this global variables!!!
var parameters;

HttpMgr = new function() {

	var requestHandler = new Object();
	var that = this;

	// TODO should put a listener for hot changing to these preferences
	var serverip = Preferences.get("extensions.semturkey.server.ip", "127.0.0.1");
	var serverport = Preferences.get("extensions.semturkey.server.port", "1979");
	var serverpath = Preferences.get("extensions.semturkey.server.path",
			"/semantic_turkey/resources/stserver/STServer");

	this.getName = function() {
		return 'HttpMgr';
	};

	this.addRequestHandler = function(request, method) {
		//Logger.debug('registered method: ' + method);
		requestHandler[request] = method;
		//Logger.debug(' request '+request);
		Logger.debug('[SemTurkeyHTTP.jsm] addedRequestHandler:\n' + requestHandler[request]);
	};

	this.getRequestHandler = function() {
		return requestHandler;
	};

	this.hasRequestHandler = function(request) {
		return (requestHandler[request] != null);
	};

	
	/**
	 * this function composes a POST request (with async argument always set to false). It can be invoked with
	 * a variable number of arguments. The first two ones are always the service and the request. All the
	 * other ones are the parameters of the http GET request
	 */
	this.POST = function(service, request) {
		var aURL = "http://" + serverip + ":" + serverport + serverpath;
		
		var parameters = "service=" + service + "&request="	+ request;
		Logger.debug("get: #arguments:" + arguments.length + " arguments: " + arguments);
		if (arguments.length > 2)
			for ( var i = 2; i < arguments.length; i++){
				var index = arguments[i].indexOf("=");
				parameters += "&" + arguments[i].substring(0, index+1) + encodeURIComponent(arguments[i].substr(index+1));
			}
		return this.submitHTTPRequest(aURL, "POST", false, parameters);
	};
	
	/**
	 * this function composes a GET request (with async argument always set to false). It can be invoked with
	 * a variable number of arguments. The first two ones are always the service and the request. All the
	 * other ones are the parameters of the http GET request
	 */
	this.GET = function(service, request) {
		var aURL = "http://" + serverip + ":" + serverport + serverpath + "?service=" + service + "&request="
				+ request;
		Logger.debug("get: #arguments:" + arguments.length + " arguments: " + arguments);
		if (arguments.length > 2)
			for ( var i = 2; i < arguments.length; i++){
				var index = arguments[i].indexOf("=");
				aURL += "&" + arguments[i].substring(0, index+1) + encodeURIComponent(arguments[i].substr(index+1));
			}

		return this.submitHTTPRequest(aURL, "GET", false);
	};

	this.submitHTTPRequest = function(aURL, method, async, parameters) {
		Logger.debug("httpRequest: " + method + ": " + aURL + "| async:" + async + " parameters: " + parameters + " port: " + serverport);

		var httpReq;
		// NScarpato add try/catch block for BridgeComponents
		try {
			httpReq = new XMLHttpRequest();
		} catch (e) {
			httpReq = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
		}

		// nasty hack: in Firefox http.open() with two parameters behaves as if
		// async were true, but if you called httpReq.open("GETP", aURL,
		// "undefined")
		// then it would behave as if async were false
		if (typeof async == 'undefined') {
			httpReq.open(method, aURL);
		} else {
			httpReq.open(method, aURL, async);
		}

		httpReq.onerror = httpError;
		// FINO QUI VECCHIO

		/*
		 * httpReq = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(); // QI the
		 * object to nsIDOMEventTarget to set event handlers on it:
		 * httpReq.QueryInterface(Components.interfaces.nsIDOMEventTarget); progressMeters=null;
		 * httpReq.addEventListener("error", httpError, false); httpReq.onreadystatechange =
		 * QI it to nsIXMLHttpRequest to open and send the request:
		 * 
		 * httpReq.QueryInterface(Components.interfaces.nsIXMLHttpRequest);
		 * 
		 * if (typeof async == 'undefined') { Logger.debug("siamo in undefined"); httpReq.open("GETP", aURL); }
		 * else { Logger.debug("async è definito come " + async); httpReq.open("GETP", aURL, async); } //FINO
		 * QUI
		 */
		//try {
		httpReq.setRequestHeader("User-Agent", USER_AGENT);
		if (method == "POST") {		  
			httpReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			httpReq.setRequestHeader("Content-length", parameters.length);
			//httpReq.setRequestHeader("Connection", "close");
		}
		else
			httpReq.setRequestHeader("Content-Type", "application/xml");
		
		httpReq.overrideMimeType("application/xml");

		//try {
		if (method == "GET")
			httpReq.send(null);
		else //"POST"
			httpReq.send(parameters);
		
		if (httpErrorHappened == true) {
			return null;
		}
		
		var newResponseXML = httpReq.responseXML;
		var type = newResponseXML.getElementsByTagName("stresponse")[0].getAttribute("type");
		newResponseXML.isReply = function(){
			return (this.getElementsByTagName("stresponse")[0].getAttribute("type") == "reply");
		};
		
		if(newResponseXML.isReply()) {
			newResponseXML.isOk = function(){
				return (this.getElementsByTagName("reply")[0].getAttribute("status") == "ok");
			};
			
			newResponseXML.isWarning = function(){
				return (this.getElementsByTagName("reply")[0].getAttribute("status") == "warning");
			};
			
			newResponseXML.isFail = function(){
				return (this.getElementsByTagName("reply")[0].getAttribute("status") == "fail");
			};
			
			if(!newResponseXML.isReply()) {
				newResponseXML.getMsg = function(){
					return (this.getElementsByTagName("reply")[0].textContent );
				};
			}
		}	
		newResponseXML.isException = function(){
			return (this.getElementsByTagName("stresponse")[0].getAttribute("type") == "exception");
		};
		
		
		if(newResponseXML.isException()){
			throw new Error(newResponseXML.getElementsByTagName("msg")[0].firstChild.textContent);
		}
		newResponseXML.isError = function(){
			return (this.getElementsByTagName("stresponse")[0].getAttribute("type") == "error");
		};
		if(newResponseXML.isError()){
			throw new Error(newResponseXML.getElementsByTagName("msg")[0].firstChild.textContent);
		}
		newResponseXML.getContent = function() {
			return this.getElementsByTagName("data")[0];
		};
		return newResponseXML;
	};

	

	function httpError(e) {
		logMessage("HTTP Error: " + e.target.status + " - " + e.target.statusText);
		//httpGetResult(RESULT_NOT_AVAILABLE);
		httpErrorHappened = true;
	}
	;

	

	

	

	// NScarpato 26/06/2007 Parse a xml document and print it on console
	this.parseXMLSource = function(document) {
		var serializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].createInstance();
		return serializer.serializeToString(document);
	};

};

