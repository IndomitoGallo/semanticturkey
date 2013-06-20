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


Components.utils.import("resource://stmodules/Preferences.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");
Components.utils.import("resource://stmodules/ResponseContentType.jsm");
Components.utils.import("resource://stmodules/Exceptions.jsm");

let EXPORTED_SYMBOLS = [ "HttpMgr" ];

const USER_AGENT = "Semantic Turkey";
const RESULT_OK = 0;
const RESULT_PARSE_ERROR = 1;
const RESULT_NOT_FOUND = 2;
const RESULT_NOT_AVAILABLE = 3;
const RESULT_ERROR_FAILURE = 4;
const RESULT_NOT_RSS = 5;

httpErrorHappened = false;

// TODO i've to remove this global variables!!!
var parameters;

HttpMgr = new function() {

	var requestHandler = new Object();
	var that = this;

	// Ramon Orru (2010): introduzione campo per memorizzare la serializzazione
	// this.serializationType="null";

	// TODO should put a listener for hot changing to these preferences
	var serverhost = Preferences.get("extensions.semturkey.server.host", "127.0.0.1");
	var serverport = Preferences.get("extensions.semturkey.server.port", "1979");
	var serverpath = Preferences.get("extensions.semturkey.server.path", "/semantic_turkey/resources/stserver/STServer");

	this.getName = function() {
		return 'HttpMgr';
	};

	this.addRequestHandler = function(request, method) {
		// Logger.debug('registered method: ' + method);
		requestHandler[request] = method;
		// Logger.debug(' request '+request);
		//Logger.debug('[SemTurkeyHTTP.jsm] addedRequestHandler:\n' + requestHandler[request]);
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
	this.POST = function(respType, service, request) {
		var aURL = "http://" + serverhost + ":" + serverport + serverpath;
		var realRespType;
		var parameters;
		if ((respType instanceof XMLRespContType) || (respType instanceof JSONRespContType)) {
			realRespType = respType;
			parameters = "service=" + service + "&request=" + request;
			Logger.debug("get: #arguments:" + arguments.length + " arguments: " + arguments);
		} else {
			realRespType = RespContType.xml;
			var realService = respType;
			var realRequest = service;
			parameters += "?service=" + realService + "&request=" + realRequest;
			if (arguments.length > 2) { // arguments[2] = request
				var index = arguments[2].indexOf("=");
				aURL += "&" + arguments[2].substring(0, index + 1)
						+ encodeURIComponent(arguments[2].substr(index + 1));
			}
		}
		if (arguments.length > 3)
			for ( var i = 3; i < arguments.length; i++) {
				var index = arguments[i].indexOf("=");
				parameters += "&" + arguments[i].substring(0, index + 1)
						+ encodeURIComponent(arguments[i].substr(index + 1));
			}
		return this.submitHTTPRequest(realRespType, aURL, "POST", false, parameters);
	};

	/**
	 * this function composes a GET request (with async argument always set to false). It can be invoked with
	 * a variable number of arguments. The first two ones are always the service and the request. All the
	 * other ones are the parameters of the http GET request
	 */
	this.GET = function(respType, service, request) {
		var aURL = "http://" + serverhost + ":" + serverport + serverpath;
		var realRespType;
		if ((respType instanceof XMLRespContType) || (respType instanceof JSONRespContType)) {
			realRespType = respType;
			aURL += "?service=" + service + "&request=" + request;
			// Logger.debug("get: #arguments:" + arguments.length + " arguments: " + arguments);
		} else {
			realRespType = RespContType.xml;
			var realService = respType;
			var realRequest = service;
			aURL += "?service=" + realService + "&request=" + realRequest;
			if (arguments.length > 2) { // arguments[2] = request
				var index = arguments[2].indexOf("=");
				aURL += "&" + arguments[2].substring(0, index + 1)
						+ encodeURIComponent(arguments[2].substr(index + 1));
			}
		}
		if (arguments.length > 3)
			for ( var i = 3; i < arguments.length; i++) {
				var index = arguments[i].indexOf("=");
				aURL += "&" + arguments[i].substring(0, index + 1)
						+ encodeURIComponent(arguments[i].substr(index + 1));
			}
		return this.submitHTTPRequest(realRespType, aURL, "GET", false);
	};


	this.submitHTTPRequest = function(respType, aURL, method, async, parameters) {
		// Logger.debug("httpRequest: " + method + ": " + aURL + "| async:" + async + " parameters: " + parameters + " port: " + serverport);
		Logger.debug(aURL);

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

		Logger.debug("dopo l'assegnazione onerror");

		/*
		 * httpReq = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(); // QI the
		 * object to nsIDOMEventTarget to set event handlers on it:
		 * httpReq.QueryInterface(Components.interfaces.nsIDOMEventTarget); progressMeters=null;
		 * httpReq.addEventListener("error", httpError, false); httpReq.onreadystatechange = QI it to
		 * nsIXMLHttpRequest to open and send the request:
		 * 
		 * httpReq.QueryInterface(Components.interfaces.nsIXMLHttpRequest);
		 * 
		 * if (typeof async == 'undefined') { Logger.debug("siamo in undefined"); httpReq.open("GETP", aURL); }
		 * else { Logger.debug("async è definito come " + async); httpReq.open("GETP", aURL, async); } //FINO
		 * QUI
		 */
		// try {
		httpReq.setRequestHeader("User-Agent", USER_AGENT);
		if (method == "POST") {
			httpReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			httpReq.setRequestHeader("Content-length", parameters.length);
			// httpReq.setRequestHeader("Connection", "close");
		}
		// else
		// httpReq.setRequestHeader("Content-Type", "application/xml");
		if (respType instanceof XMLRespContType)
			httpReq.setRequestHeader("Accept", "application/xml");
		else if (respType instanceof JSONRespContType)
			httpReq.setRequestHeader("Accept", "application/json");
		// httpReq.overrideMimeType("application/xml");

		Logger.debug("prima della send");

		try {
			if (method == "GET")
				httpReq.send(null);
			else
				// "POST"
				httpReq.send(parameters);
		} catch (e) {
			throw new HTTPError("http error...we have to customize this message! (ST authors)", httpReq.status, httpReq.statusText);
		}

		Logger.debug("prima dell'if");

		if (httpErrorHappened == true) {
			throw new HTTPError("http error...we have to customize this message! (ST authors)");
		}
		
		// ok qua devo leggere l'header http e decidere se parsare una risposta json o xml
		var serializationType = httpReq.getResponseHeader("Content-Type");

		if (serializationType.indexOf("application/xml") != -1) {

			Logger.debug("Parsing the XML response");

			var newResponseXML = httpReq.responseXML;
			var type = newResponseXML.getElementsByTagName("stresponse")[0].getAttribute("type");

			newResponseXML.isReply = function() {
				return (this.getElementsByTagName("stresponse")[0].getAttribute("type") == "reply");
			};

			if (newResponseXML.isReply()) {

				newResponseXML.isOk = function() {
					return (this.getElementsByTagName("reply")[0].getAttribute("status") == "ok");
				};

				newResponseXML.isWarning = function() {
					return (this.getElementsByTagName("reply")[0].getAttribute("status") == "warning");
				};

				newResponseXML.isFail = function() {
					return (this.getElementsByTagName("reply")[0].getAttribute("status") == "fail");
				};

//				if (!newResponseXML.isReply()) {
//					newResponseXML.getMsg = function() {
//						return (this.getElementsByTagName("reply")[0].textContent);
//					};
//				}
				
				newResponseXML.getMsg = function() {
					return (this.getElementsByTagName("reply")[0].textContent);
				};
			}

			newResponseXML.isException = function() {
				return (this.getElementsByTagName("stresponse")[0].getAttribute("type") == "exception");
			};

			if (newResponseXML.isException()) {
				throw new STException("java.prova.exception", newResponseXML.getElementsByTagName("msg")[0].firstChild.textContent);
			}
			
			newResponseXML.isError = function() {
				return (this.getElementsByTagName("stresponse")[0].getAttribute("type") == "error");
			};
			
			if (newResponseXML.isError()) {
				throw new STError("java.prova.exception", newResponseXML.getElementsByTagName("msg")[0].firstChild.textContent);
			}
			newResponseXML.getContent = function() {
				return this.getElementsByTagName("data")[0];
			};
			return newResponseXML;
		}

		if (serializationType.indexOf("application/json") != -1) {

			// header json

			var newResponseJSON = JSON.parse(httpReq.responseText);

			Logger.debug("Parsing the JSON response: " + JSON.stringify(newResponseJSON));
			Logger.debug("Response type: " + JSON.stringify(newResponseJSON.stresponse.type));
			Logger.debug("Response data: " + JSON.stringify(newResponseJSON.stresponse.data));

			var type = newResponseJSON.stresponse.type;

			newResponseJSON.isReply = function() {
				return (JSON.stringify(this.stresponse.type) == "reply");
			};

			if (newResponseJSON.isReply()) {

				newResponseJSON.isOk = function() {
					return (JSON.stringify(this.stresponse.reply.status) == "ok");
				};

				newResponseJSON.isWarning = function() {
					return (JSON.stringify(this.stresponse.reply.status) == "warning");
				};

				newResponseJSON.isFail = function() {
					return (JSON.stringify(this.stresponse.reply.status) == "fail");
				};

				if (!newResponseJSON.isReply()) {
					newResponseJSON.getMsg = function() {
						return (JSON.stringify(this.stresponse.msg));
					};
				}
			}

			newResponseJSON.isException = function() {
				return (JSON.stringify(this.stresponse.type) == "exception");
			};

			if (newResponseJSON.isException()) {
				throw new STException("java exception to be embedded", JSON.stringify(newResponseJSON.stresponse.msg));
			}

			newResponseJSON.isError = function() {
				return (JSON.stringify(this.stresponse.type) == "error");
			};

			if (newResponseJSON.isError()) {
				throw new STError("java exception to be embedded", JSON.stringify(newResponseJSON.stresponse.msg));
			}

			newResponseJSON.getContent = function() {
				return JSON.stringify(this.stresponse.data);
			};

			return newResponseJSON;
		}

		/*
		 * } catch (e) { httpGetResult(RESULT_ERROR_FAILURE); }
		 */
	};

	function httpError(e) {
		Logger.debug("HTTP Error: " + e.target.status + " - " + e.target.statusText);
		// httpGetResult(RESULT_NOT_AVAILABLE);
		httpErrorHappened = true;
	}
	;

	// NScarpato 26/06/2007 Parse a xml document and print it on console
	this.parseXMLSource = function(document) {
		var serializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].createInstance();
		return serializer.serializeToString(document);
	};


	this.getAuthority = function() {
		return serverhost + ":" + serverport;
	};
	
	this.setAuthority = function(host, port) {
		serverhost = host;
		serverport = port;
		Preferences.set("extensions.semturkey.server.host", host);
		Preferences.set("extensions.semturkey.server.port", port);
	};
	
	
	
	
};


