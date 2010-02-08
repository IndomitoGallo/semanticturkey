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

		//httpReq.onprogress = httpProgress;
		//httpReq.onload = httpLoaded;
		httpReq.onerror = httpError;
		//httpReq.onreadystatechange = httpReadyStateChange;
		// FINO QUI VECCHIO

		/*
		 * httpReq = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(); // QI the
		 * object to nsIDOMEventTarget to set event handlers on it:
		 * httpReq.QueryInterface(Components.interfaces.nsIDOMEventTarget); progressMeters=null;
		 * httpReq.onprogress = onProgress; httpReq.addEventListener("load", httpLoaded, false);
		 * httpReq.addEventListener("error", httpError, false); httpReq.onreadystatechange =
		 * httpReadyStateChange; //httpReq.addEventListener("readystatechange", httpReadyStateChange, false); //
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
		/*} catch (e) {
			httpGetResult(RESULT_ERROR_FAILURE);
		}*/

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
		/*} catch (e) {
			httpGetResult(RESULT_ERROR_FAILURE);
		}*/
	};

	/**
	 * invoked by GETP when the request has been satisfied (assigned to <code>httpReq.onload</code> event
	 * 
	 * @param e
	 * @return
	 */
	function httpLoaded(e) {
		Logger.debug('httpLoaded, from httpmanager: ' + that.getName() + ' event: ' + e);

		Logger.debug("[httploaded in SemTurkeyHTTP.jsm], e = " + e + ", parameters: " + that.parameters);
		

		Logger.debug("response XML:\n" + that.parseXMLSource(this.responseXML));

		var rootNodeName = this.responseXML.documentElement.localName.toLowerCase();
		Logger.debug("rootNodeName of responseXML: " + rootNodeName + ", parameters: " + that.parameters);
		switch (rootNodeName) {
		//Daniele Bagni, Marco Cappella (2009):gestione delle risposte che portano un messaggio di errore
		case "error": {
			httpGetResultErr();
		}
			break;
		// Daniele Bagni, Marco Cappella (2009):gestione delle risposte che
		// contengono un messaggio da visualizzare all'utente oppure necessario
		// al
		// client del tacchino
		case "msg": {
			httpGetResultMsg();
		}
			break;
		case "id":
			httpGetResultR();
			break;
		case "stresponse": {
			var responseXML = this.responseXML;
			this.abort();
			if (typeof that.parameters == 'undefined')
				httpGetResult(RESULT_OK,responseXML);
			else
				httpGetResultP(RESULT_OK,responseXML, that.parameters);
		}
			break;
		default:
			// Not RSS or Atom
			httpGetResult(RESULT_NOT_RSS);
			break;
		}
	}
	;

	/**
	 * invokes the request handler method which is associated to the given request
	 * 
	 * 
	 * @param aResultCode
	 * @param parameters
	 * @return
	 */
	function httpGetResult(aResultCode,responseXML) {
		Logger.debug("[httpGetResult in SemTurkeyHTTP.jsm] aResultCode=" + aResultCode);

		if (aResultCode == RESULT_OK) {
			var responseXMLContent = responseXML.getElementsByTagName('stresponse');
			var responseElement = responseXMLContent[0];
			var request = responseElement.getAttribute('request');
			Logger.debug('[httpGetResult in SemTurkeyHTTP.jsm]:\n' + requestHandler[request]);
			Logger.debug('responseXML: ' + that.parseXMLSource(responseXML));

			var responseType = responseElement.getAttribute('type');
			Logger.debug(" dentro httpGetResult responseType "+responseType);
			//if (responseType == "ack") {
			//	handleAck(request, responseElement);
			//} else
			if (responseType == "reply") {
				handleAction(request, responseElement);
			} else if (responseType == "exception" || responseType == "error") {
				
				handleTrouble(request, responseType, responseElement);
			}
		}

		else if (aResultCode == RESULT_ERROR_FAILURE) {
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
			prompts.alert(null, "Server Communication Error", "aResultCode == RESULT_ERROR_FAILURE");
		}
	}
	;

	function handleAck(request, responseElement) {
		var replyElement = responseElement.getElementsByTagName('reply')[0];
		// TODO do something with the status, like changing the icon of the
		// alert
		var status = replyElement.getAttribute("status");

		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
		prompts.alert(null, "Server Reply to request: " + request, replyElement.textContent);
	}

	function handleAction(request, responseElement) {
		var replyElement = responseElement.getElementsByTagName('reply')[0];
		// TODO do something with the status, like changing the icon of the
		// alert
		var status = replyElement.getAttribute("status");
		if (status == 'warning') {
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
			prompts.alert(null, "Server Reply to request: " + request, replyElement.textContent);
		}
		Logger.debug("request in HTTP "+request);
		Logger.debug(request+" Funzione in HTTP "+requestHandler[request]);
		requestHandler[request](responseElement, status, parameters);
	}

	function handleTrouble(request, responseType, responseElement) {
		Logger.debug(" dentro handleTrouble responseElement "+responseElement);
		var msgElement = responseElement.getElementsByTagName('msg')[0];
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
		prompts.alert(null, "server: " + responseType, msgElement.textContent);
	}

	/**
	 * This version of the httpGetResult function allows for passing of
	 * parameters needed by the GUI, which are known a priori when the GETP is
	 * being invoked, but which are not returned by the server. This way these
	 * parameters are passed from the request to the responseHandler
	 * 
	 * @param aResultCode
	 * @param parameters
	 * @return
	 */
	function httpGetResultP(aResultCode,responseXML,parameters) {
		Logger.debug("[httpGetResultP in SemTurkeyHTTP.jsm] aResultCode=" + aResultCode);

		if (aResultCode == RESULT_OK) {
			var responseXMLContent = responseXML.getElementsByTagName('stresponse');
			var request = responseXMLContent[0].getAttribute('request');
			Logger.debug('[httpGetResultP in SemTurkeyHTTP.jsm]:\n' + requestHandler[request]);
			Logger.debug('responseXML: ' + that.parseXMLSource(responseXML));
			requestHandler[request](responseXMLContent, parameters);
		} else if (aResultCode == RESULT_ERROR_FAILURE) {
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
			prompts.alert(null, "Server Communication Error", "aResultCode == RESULT_ERROR_FAILURE");
		}
	}
	;

	function httpError(e) {
		logMessage("HTTP Error: " + e.target.status + " - " + e.target.statusText);
		//httpGetResult(RESULT_NOT_AVAILABLE);
		httpErrorHappened = true;
	}
	;

	function httpReadyStateChange(evt) {
		if (httpReq.readyState == 0) {

		} else if (httpReq.readyState == 1) {
			/*
			 * if(progressMeters==null){
			 * progressMeters=window.openDialog("chrome://semantic-turkey/content/progressMeters.xul","_blank","modal=no,resizable,centerscreen"); }
			 */
		} else if (httpReq.readyState == 2) {
			try {
				if (httpReq.status == 404) {
					httpGetResult(RESULT_NOT_FOUND);
				}
			} catch (e) {
				httpGetResult(RESULT_NOT_AVAILABLE);
				return;
			}
			/*
			 * if(progressMeters!=null){ progressMeters.close(); }
			 */
		} else if (httpReq.readyState == 3) {

		} else if (httpReq.readyState == 4) {
			/*
			 * if(progressMeters!=null){ progressMeters.close(); }
			 */
		}
	}
	;

	/**
	 * this function handles refresh
	 * 
	 * @author Daniele Bagni, Marco Cappella (2009)
	 * 
	 * @return
	 */
	function httpGetResultR() {

		Logger.debug("dentro httpR");
		var treeList = responseXML.getElementsByTagName('ID');
		var attr = treeList[0].getAttribute('id_value');
		Logger.debug("HttpR: " + attr);
		if (attr == "refresh") {
			if (document.getElementById('classTab').contentDocument.getElementById('refresh') != null)
				document.getElementById('classTab').contentDocument.getElementById('refresh').image = "images/PNG-Refresh.png";
			if (document.getElementById('propertyTab').contentDocument.getElementById('refreshProp') != null)
				document.getElementById('propertyTab').contentDocument.getElementById('refreshProp').image = "images/PNG-Refresh.png";
		}
	}
	;

	/**
	 * this function is associated to the event <code>onprogress</code> and should be used to show progress
	 * of the http request
	 * 
	 * @param e
	 *            the event <code>onprogress</code>
	 * @return
	 */
	function httpProgress(e) {
		if (progressMeters == null) {
			progressMeters = window.openDialog("chrome://semantic-turkey/content/progressMeters.xul",
					"_blank", "modal=no,resizable,centerscreen");
		}
		Logger.debug("onProgress");
		Logger.debug("event " + e);
		var percentComplete = (e.position / e.totalSize) * 100;
		Logger
				.debug("% in on progress" + percentComplete + " scaricati " + e.position + " di "
						+ e.totalSize);

	}
	;

	// NScarpato 26/06/2007 Parse a xml document and print it on console
	this.parseXMLSource = function(document) {
		var serializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].createInstance();
		return serializer.serializeToString(document);
	};

};

/**
 * a simple internal shortcut for {@link HttpMgr.GETP}
 * 
 * @param aURL
 * @param async
 * @param parameters
 * @return
 */
function httpGet(aURL, async, parameters) {
	HttpMgr.GETP(aURL, async, parameters);
}

/**
 * This version of the httpGetResult function allows for passing of parameters needed
 * by the GUI, which are known a priori when the GETP is being invoked, but which are
 * not returned by the server. This way these parameters are passed from the request
 * to the responseHandler
 * 
 * @param aResultCode 
 * @param parameters
 * @return
 */
function httpGetResultPippo(aResultCode, parameters) {
	httpReq.abort();
	// var server = readServer();
	if (aResultCode == RESULT_OK) {
		var treeList = responseXML.getElementsByTagName('Tree');
		var attr = treeList[0].getAttribute('type');

		// NScarpato 29/04/2008 change implementation of repository list
		if (attr == "create_cls") {
			addClassFire();
			var isColl = readSwap();
			var textbox1 = document.getElementById("name");
			var server1 = readServer();
			if (isColl == "1") {
				var parameterss = new Object();
				parameterss.subject = "[Class]" + textbox1.value;
				parameterss.server = server1;
				window.openDialog("chrome://semantic-turkey/content/jforumQuestion.xul", "_blank",
						"modal=yes,resizable,centerscreen", parameterss);
			}
			if (create != null)
				window.close();
		} else if (attr == "freeze_editor_panel") {
			if (parameters.color != "base")
				parameters.selItem.setAttribute("class", "c" + parameters.color);
			else
				parameters.selItem.setAttribute("class", parameters.color);
		}// NScarpato 21/04/2008 add getNs
		/*else if (attr == "getDefaultNamespace") {
			dn = treeList[0].getElementsByTagName('DefaultNamespace')[0];
			parameters.ns = dn.getAttribute('ns');
		}// NScarpato 02/04/2008 add getNs
		*/
		else if (attr == "update_cls") {
			var clsNodeName = treeList[0].getElementsByTagName('Class')[0].getAttribute("clsName");
			var numTotInst = treeList[0].getElementsByTagName('Class')[0].getAttribute("numTotInst");
			var numTot = numTotInst - 1
			var treecellNodes;
			var iconicName = clsNodeName;
			if (numTot != 0) {
				var iconicName = clsNodeName + "(" + numTot + ")";
			}
			var newIconicName = clsNodeName + "(" + numTotInst + ")";
			treecellNodes = parameters.tree.getElementsByTagName("treecell");
			for ( var i = 0; i < treecellNodes.length; i++) {
				if (treecellNodes[i].getAttribute("label") == iconicName) {
					treecellNodes[i].setAttribute("label", newIconicName);
					treecellNodes[i].setAttribute("numTotInst", "" + numTotInst);
					// break;
				}
			}
			var par = new Object();
			par.list = parameters.list;
			httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&clsName="
					+ encodeURIComponent(clsNodeName), false, par);
		} //END UPDATE		
		else if (attr == "Instpanel") {

			var list = parameters.list;
			rows = list.getRowCount();
			while (rows--) {
				list.removeItemAt(rows);
			}
			myClass = treeList[0].getElementsByTagName('Class')[0].getAttribute("name");
			numTotInst = treeList[0].getElementsByTagName('Class')[0].getAttribute("numTotInst");
			list.getElementsByTagName('listheader')[0].getElementsByTagName('listitem-iconic')[0]
					.getElementsByTagName('label')[0].setAttribute("value", "Individuals of " + myClass);
			list.getElementsByTagName('listheader')[0].setAttribute("parentCls", myClass);
			list.getElementsByTagName('listheader')[0].setAttribute("numTotInst", numTotInst);
			instancesList = treeList[0].getElementsByTagName('Instance');
			for ( var i = 0; i < instancesList.length; i++) {
				var instName = instancesList[i].getAttribute("name");
				lsti = document.createElement("listitem");
				lsti.setAttribute("label", instName);
				// NScarpato 14/04/2008 add explicit attribute for instances
				// list
				explicit = instancesList[i].getAttribute("explicit");
				lsti.setAttribute("explicit", explicit);
				lsti.setAttribute("parentCls", myClass);
				lci = document.createElement("listitem-iconic");
				img = document.createElement("image");
				if (explicit == "false") {
					img.setAttribute("src", "images/individual_noexpl.png");
				} else {
					img.setAttribute("src", "images/individual.png");
				}
				lci.appendChild(img);
				lbl = document.createElement("label");
				lbl.setAttribute("value", instName);
				lci.appendChild(lbl);
				lsti.appendChild(lci);

				list.appendChild(lsti);
			}
		} else if (attr == "getBaseURI") {
			dn = treeList[0].getElementsByTagName('BaseURI')[0];
			parameters.baseuri = dn.getAttribute('uri');
		}// NScarpato 09/09/2008 add set baseuri and namespace request
		else if (attr == "setBaseURIAndDefaultNamespace") {
			ack = treeList[0].getElementsByTagName('Ack')[0];
			if (ack.getAttribute("msg") == "failed") {
				alert(ack.getAttribute("reason"));
				basetxbox = document.getElementById("baseUriTxtBox");
				nstxbox = document.getElementById("nsTxtBox");
				basetxbox.setAttribute("value", parameters.baseuri);
				nstxbox.setAttribute("value", parameters.ns);
				basetxbox.style.color = 'black';
				nstxbox.style.color = 'black';
			}
		}
		// NScarpato 12/07/2007 add getNsPrefixMapping service for import panel
		/*else if (attr == "getNSPrefixMappings") {
			getNSPrefixMappings(treeList);
		}*/
		// NScarpato 19/07/2007 add get_imports service for import panel
		else if (attr == "imports") {
			imports(treeList);
		} else if (attr == "AllPropertiesTree") {
			//DO NOTHING!!! ALREAY IMPORTED INTO property.js
		} else if (attr == "addFromWebToMirror") {
			var msg = treeList[0].getElementsByTagName('msg')[0];
			addFromWebToMirror(msg);
		} else if (attr == "addFromWeb") {
			var msg = treeList[0].getElementsByTagName('msg')[0];
			addFromWeb(msg);
		} else if (attr == "addFromLocalFile") {
			var msg = treeList[0].getElementsByTagName('msg')[0];
			addFromLocalFile(msg);
		} else if (attr == "addFromOntologyMirror") {
			var msg = treeList[0].getElementsByTagName('msg')[0];
			addFromOntologyMirror(msg);
		} else if (attr == "removeImport") {
			var msg = treeList[0].getElementsByTagName('Msg')[0];
			removeOntologyImport(msg);
		} else if (attr == "getToOntologyMirror") {
			var msg = treeList[0].getElementsByTagName('msg')[0];
			addFromOntologyMirror(msg);
			// NScarpato 03/09/2008 change ontology icon after mirroring of
			// ontology
		} else if (attr == "getFromLocalFile") {
			var msg = treeList[0].getElementsByTagName('msg')[0];
			addFromLocalFile(msg);
		} else if (attr == "getFromWeb") {
			var msg = treeList[0].getElementsByTagName('msg')[0];
			addFromWeb(msg);
		} else if (attr == "getFromWebToMirror") {
			var msg = treeList[0].getElementsByTagName('msg')[0];
			addFromWebToMirror(msg);
		} else if (attr == "NSPrefixMappingChanged") {
			NSPrefixMappingChanged();
		} else if (attr == "update_delete") {
			var type = treeList[0].getElementsByTagName('Resource')[0].getAttribute("type");
			update_delete(type);
		}// NScarpato 24/06/2008 change handler for get prop descr
		else if (attr == "templateandvalued") {
			var request = treeList[0].getAttribute('request');
			if (request == "getPropDescription") {
				getPropDscr(treeList);
			}
		} else if (attr == "add_superclass") {
			changeSuperClass(treeList);
		} else if (attr == "remove_superclass") {
			changeSuperClass(treeList);
		} else if (attr == "ClassesTree") {
			range = parameters.range;
			classList = treeList[0].childNodes;
			for ( var i = 0; i < classList.length; i++) {
				if (classList[i].nodeType == 1) {
					range = classList[i].getAttribute("name")
				}
			}
		}// NScarpato 14/03/2008 change update_modify to make refresh on:
		// class tree property tree and instance list
		/*else if (attr == "update_modify") {
			var resourceNode = treeList[0].getElementsByTagName('UpdateResource')[0];
			var iconicName = resourceNode.getAttribute("name");
			var newName = resourceNode.getAttribute("newname");
			if (parameters.sourceType == "Class") {
				var tree = parameters.tree;
				var treecellNodes = tree.getElementsByTagName("treecell");
				var numInst = parameters.numInst;
				if (numInst != 0) {
					iconicName = iconicName + numInst;
					newName = newName + numInst;
				}
				for ( var i = 0; i < treecellNodes.length; i++) { // does not
					// break
					// because
					// it has to
					// change
					// all
					// occurrences
					// of the
					// given
					// class
					if (treecellNodes[i].getAttribute("label") == iconicName) {
						treecellNodes[i].setAttribute("label", newName);
					}
				}
			} else if (parameters.sourceType == "Individual") {
				var list = parameters.list;
				listItemList = list.getElementsByTagName("listitem");
				for ( var i = 0; i < listItemList.length; i++) {
					if (listItemList[i].getAttribute("label") == iconicName) {
						listItemList[i].setAttribute("label", newName);
						listItIc = listItemList[i].getElementsByTagName("listitem-iconic");
						listItIc[0].getElementsByTagName("label")[0].setAttribute("value", newName);
					}
				}
			} else {
				var tree = parameters.tree;
				var treecellNodes = tree.getElementsByTagName("treecell");
				var numInst = parameters.numInst;
				if (numInst != 0) {
					iconicName = iconicName + numInst;
					newName = newName + numInst;
				}
				for ( var i = 0; i < treecellNodes.length; i++) { // does not
					// break
					// because
					// it has to
					// change
					// all
					// occurrences
					// of the
					// given
					// class
					if (treecellNodes[i].getAttribute("label") == iconicName) {
						treecellNodes[i].setAttribute("label", newName);
					}
				}
			}
		}*//**
		 * Pagina delle webPage
		 * 
		 * @author NScarpato 13/04/2007
		 * moved into webLinks.js
		

		else if (attr == "webPage") {
			labelBox = parameters.labelBox;
			urlList = treeList[0].getElementsByTagName('URL');
			for ( var i = 0; i < urlList.length; i++) {
				var value = urlList[i].getAttribute("value");
				var title = urlList[i].getAttribute("title");
				pagelbl2 = document.createElement("label");
				pagelbl2.setAttribute("value", title);
				pagelbl2.setAttribute("class", "text-link");
				// pagelbl2.setAttribute("href",value);
				// NScarpato 26/06/2007 add close on click event
				pagelbl2.setAttribute("onclick", "openUrl('" + value + "');");
				labelBox.appendChild(pagelbl2);
			}
		} *//*******************************************************************
		 * @author NScarpato 11/06/2007 END webPage
		 */
		/**
		 * @author NScarpato 03/03/2008 change search panel
		 
		else if (attr == "ontSearch") {
			var foundList = treeList[0].getElementsByTagName('found');
			if (foundList.length > 1) {
				var callPanel = parameters.callPanel;
				var parameters = new Object();
				parameters.foundList = foundList;
				parameters.callPanel = callPanel;
				if (callPanel == "class") {
					parameters.tree = getthetree();
					parameters.list = gettheList();
				} else {
					parameters.tree = getthetree();
				}
				window.openDialog("chrome://semantic-turkey/content/search.xul", "_blank",
						"modal=yes,resizable,centerscreen", parameters);
			} else {
				var resType = foundList[0].getAttribute("type");
				var resName = foundList[0].getAttribute("name");
				var callPanel = parameters.callPanel;
				var param = new Object();
				param.typeName = "none";
				httpGet(
						"http://"
								+ server
								+ ":1979/semantic_turkey/resources/stserver/STServer?service=individual&request=get_directNamedTypes&indqname="
								+ encodeURIComponent(resName), false, param);
				var typeName = param.typeName;
				searchFocus(resType, resName, callPanel, typeName);
			}

		} else if (attr == "bindAnnotToNewInstance") {
			var clsNodeName = treeList[0].getElementsByTagName('Class')[0].getAttribute("clsName");
			var numTotInst = treeList[0].getElementsByTagName('Class')[0].getAttribute("numTotInst");
			var treecellNodes;
			var iconicName = clsNodeName;
			var newIconicName = clsNodeName + "(" + numTotInst + ")";
			// treecellNodes = getPanelTree().getElementsByTagName("treecell");
			var t = parameters.tree;
			treecellNodes = t.getElementsByTagName("treecell");
			var numTot = numTotInst - 1;
			if (numTot != 0) {
				var iconicName = clsNodeName + "(" + numTot + ")";
			}
			for ( var i = 0; i < treecellNodes.length; i++) {
				if (treecellNodes[i].getAttribute("label") == iconicName) {
					treecellNodes[i].setAttribute("label", newIconicName);
					treecellNodes[i].setAttribute("numTotInst", "" + numTotInst);
					// break;
				}
			}
			httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&clsName="
					+ encodeURIComponent(clsNodeName), false);
		}// END UPDATE PROPERTIES
		/*
		 * NScarpato 15/11/2007 add request for range on annotator panel else if (attr == "property_dscr") {
		 * var rangeNode=treeList[0].getElementsByTagName('range'); var
		 * range=rangeNode[0].getAttribute("name"); parameters.reqparameters.objectClsName=range; var
		 * domainNode=treeList[0].getElementsByTagName('domain'); var
		 * domain=rangeNode[0].getAttribute("name"); parameters.reqparameters.domain=domain; }
		 */else if (attr == "error") {
			var errorNode = treeList[0].getElementsByTagName('Error')[0];
			alert("Error: " + errorNode.getAttribute("value"));
		}// END error
		else if (attr == "AckMsg") {
			var msg = treeList[0].getElementsByTagName('Msg')[0];
			// alert(msg.getAttribute("content"));

		} else if (attr == "Ack") {
			var request = treeList[0].getAttribute("request");
			if (request == "addProperty") {
				var tree = parameters.tree;
				var isRootNode = parameters.isRootNode;
				var newPropName = parameters.newPropName;
				var propType = parameters.propType;
				if (isRootNode == "true") {
					var node = tree.getElementsByTagName('treechildren')[0];
					var tr = document.createElement("treerow");
					var tc = document.createElement("treecell");
					tc.setAttribute("label", newPropName);
					tc.setAttribute("deleteForbidden", "false");
					tr.setAttribute("properties", propType);
					tc.setAttribute("properties", propType);
					var server = readServer();
					if (server != "127.0.0.1") {
						var hashUser = readUserHash();
						if (hashUser != null) { //Siamo in modalità collaborativa
							var ress = readProp();
							var founded = false;
							for ( var it = 0; it < ress.hash.length; it++) {
								if (hashUser == ress.hash[it]) {
									founded = true;
									break;
								}
							}
							if (founded) {
								tc.setAttribute("properties", "c" + ress.colors[it] + propType);
								tr.setAttribute("properties", "c" + ress.colors[it] + propType);
							}
						}
					}
					tr.appendChild(tc);
					var ti = document.createElement("treeitem");
					ti.appendChild(tr);
					var tch = document.createElement("treechildren");
					ti.appendChild(tch);
					node.appendChild(ti);
					var isColl = readSwap();
					if (isColl == "1") {
						var parameterss = new Object();
						parameterss.server = server;
						parameterss.subject = "[Property]" + textboxName.value;
						window.openDialog("chrome://semantic-turkey/content/jforumQuestion.xul", "_blank",
								"modal=yes,resizable,centerscreen", parameterss);
					}
					// add sub property
				} else {
					var iconicName = parameters.iconicName;
					var tr = document.createElement("treerow");
					var tc = document.createElement("treecell");
					var ti = document.createElement("treeitem");
					tc.setAttribute("label", newPropName);
					// NScarpato 26/06/2007 remove ParentName attribute
					// tc.setAttribute("parentName",
					// clsNode.getAttribute("clsName"));
					tc.setAttribute("deleteForbidden", "false");
					tc.setAttribute("numInst", "0");
					tc.setAttribute("isRootNode", isRootNode);
					tc.setAttribute("properties", propType);
					tr.setAttribute("properties", propType);
					var server = readServer();

					if (server != "127.0.0.1") {
						var hashUser = readUserHash();
						if (hashUser != null) { //Siamo in modalità collaborativa
							var ress = readProp();
							var founded = false;
							for ( var it = 0; it < ress.hash.length; it++) {
								if (hashUser == ress.hash[it]) {
									founded = true;
									break;
								}
							}
							if (founded) {
								tc.setAttribute("properties", "c" + ress.colors[it] + parameters.propType);
								tr.setAttribute("properties", "c" + ress.colors[it] + parameters.propType);
							}
						}
					}
					tr.appendChild(tc);
					ti.setAttribute('container', 'false');
					ti.setAttribute('open', 'false');
					ti.appendChild(tr);
					var treecellNodes;
					treecellNodes = tree.getElementsByTagName("treecell");
					var targetNode = null;
					for ( var i = 0; i < treecellNodes.length; i++) {
						if (treecellNodes[i].getAttribute("label") == iconicName) {
							targetNode = treecellNodes[i].parentNode.parentNode;
							break;
						}
					}

					var treechildren = targetNode.getElementsByTagName('treechildren')[0];
					if (treechildren == null) {
						treechildren = document.createElement("treechildren");
						targetNode.appendChild(treechildren);
					}

					if (targetNode.getAttribute('container') == "false") {
						targetNode.setAttribute('container', 'true');
						targetNode.setAttribute('open', 'true');
					} else if (targetNode.getAttribute('open') == "false") {
						targetNode.setAttribute('open', 'true');
					}

					var firstChild = treechildren.firstChild;
					if (firstChild == null) {
						treechildren.appendChild(ti);
					} else {
						treechildren.insertBefore(ti, firstChild);
					}
				}
				// NScarpato 10/03/2008
			} else if (request == "addedToMine") {
				window.close();
			} else if (request == "removePropValue") {
				changePropValue("remove");
			} else if (request == "createAndAddPropValue") {
				changePropValue("create");
			} else if (request == "addExistingPropValue") {
				changePropValue("add");
			} else if (request == "addPropertyRange") {
				// alert("Range: "+parameters.rangeName+" correctly added");
			} else if (request == "removePropertyRange") {
				// alert("Range: "+parameters.rangeName+" correctly removed");
			} else if (request == "addPropertyDomain") {
				// alert("Domain: "+parameters.domainName+" correctly added");
			} else if (request == "removePropertyDomain") {
				// alert("Domain: "+parameters.domainName+" correctly removed");
			} else if (request == "removeSuperProperty") {
				changeSuperProperty(treeList, parameters.type);
			} else if (request == "addSuperProperty") {
				changeSuperProperty(treeList);
			} else {
				var msg = treeList[0].getElementsByTagName('msg')[0];
				alert(msg.getAttribute("content"));
			}
		}// NScarpato 28/11/2007 add add_type and remove_type handler
		else if (attr == "remove_type") {
			typeName = treeList[0].getElementsByTagName('Type')[0].getAttribute("qname");
			// alert("type "+typeName+" correctly removed");
			// empty parentBox
			parentBox = parameters.parentBox;
			while (parentBox.hasChildNodes()) {
				parentBox.removeChild(parentBox.lastChild);
			}
			// empty rowBox
			rowBox = parameters.rowBox;
			while (rowBox.hasChildNodes()) {
				rowBox.removeChild(rowBox.lastChild);
			}
			if (parameters.type == "Individual") {
				httpGet("http://"
						+ server
						+ ":1979/semantic_turkey/resources/stserver/STServer?service=individual&request=getIndDescription&instanceQName="
						+ encodeURIComponent(parameters.sourceElementName) + "&method=templateandvalued");
			} else {
				httpGet("http://"
						+ server
						+ ":1979/semantic_turkey/resources/stserver/STServer?service=cls&request=getClsDescription&clsName="
						+ encodeURIComponent(parameters.sourceElementName) + "&method=templateandvalued");
			}

		} else if (attr == "add_type") {
			/*moved intoeditor panel.js
			 * typeName = treeList[0].getElementsByTagName('Type')[0].getAttribute("qname");
			// alert("type "+typeName+" correctly added");
			// empty parentBox
			parentBox = parameters.parentBox;
			while (parentBox.hasChildNodes()) {
				parentBox.removeChild(parentBox.lastChild);
			}
			// empty rowBox
			rowBox = parameters.rowBox;
			while (rowBox.hasChildNodes()) {
				rowBox.removeChild(rowBox.lastChild);
			}
			if (parameters.type == "Individual") {
				httpGet("http://"
						+ server
						+ ":1979/semantic_turkey/resources/stserver/STServer?service=individual&request=getIndDescription&instanceQName="
						+ encodeURIComponent(parameters.sourceElementName) + "&method=templateandvalued");
			} else {
				httpGet("http://"
						+ server
						+ ":1979/semantic_turkey/resources/stserver/STServer?service=cls&request=getClsDescription&clsName="
						+ encodeURIComponent(parameters.sourceElementName) + "&method=templateandvalued");
			}*/
		} else if (attr == "get_types") {
			// add only first type for search
			typeName = treeList[0].getElementsByTagName('Type')[0].getAttribute("qname");
			parameters.typeName = typeName;
		} //Daniele Bagni, Marco Cappella (2009):popolamento finestra del versioning
		else if (attr == "getVersioningTable") {
			populateVersioningTable(parameters, treeList);
		}
		//Daniele Bagni, Marco Cappella (2009):popolamento finestra contenente risorse credute da 2 utenti o più
		else if (attr == "getResourceNumContexts") {
			populateResourceManagementTable(parameters, treeList);
		}
		//Daniele Bagni, Marco Cappella (2009):popolamento finestra della gestione degli utenti
		else if (attr == "userTable") {
			populateUserTable(parameters, treeList);
		}
		//Daniele Bagni, Marco Cappella (2009)
		else if (attr == "my_prop") {
			window.close();
		}/* else if (attr == "getMirrorTable")
			populateMirrorTable(parameters, treeList);*/

	} else if (aResultCode == RESULT_ERROR_FAILURE) {
		alert("aResultCode == RESULT_ERROR_FAILURE");
	}// END RESULT_ERROR_FAILURE
}

//Daniele Bagni, Marco Cappella (2009):funzione per la gestione dei messaggi ricevuti dal server
function httpGetResultMsg() {

	var resp = responseXML.getElementsByTagName('msg');
	var attr = resp[0].getAttribute('id_value');
	Logger.debug("HttpMsg: " + attr);
	if (attr == "Not authenticated") {
		saveUserType("notLogged");
		window.openDialog("chrome://semantic-turkey/content/notLogged.xul", "_blank",
				"modal=yes,resizable,centerscreen", null);
	} else if (attr == "Registred") {

		window.close();
		format();
		saveUserName(resp[0].getAttribute('username'));
		saveUserHash(resp[0].getAttribute('hash'));
		saveUserType(resp[0].getAttribute('type'));
		saveOnt(resp[0].getAttribute('ontology'));
	} else if (attr == "Deleted") {

		var treeChildren = tree.getElementsByTagName('treechildren')[0];
		treeChildren.removeChild(currentelement);
	} else if (attr == "Namespace") {

		ontologyNamespace = resp[0].getAttribute('namespace');
	} else if (attr == "registration ok") {

		window.close();
	} else if (attr == "logouted") {
		alert("Logouted with success!");
		saveUserType("notLogged");
	}
}

//Daniele Bagni, Marco Cappella (2009):gestione dei messaggi di errore inviati dal server
function httpGetResultErr() {
	var resp = responseXML.getElementsByTagName('error');
	var attr = resp[0].getAttribute('id_value');
	Logger.debug("HttpErr: " + attr);
	if (attr == "Not registred") {
		logging = false;
		alert("Error: the user is not registred or the password is not correct");
	} else if (attr == "SPARQLException") {

		alert(resp[0].getAttribute('sparqlexception'));
	} else if (attr == "resourceNoDeleted") {

		alert("Error: you cannot delete this resource, it has subclasses or instance with your context!");
	} else if (attr == "noDeleted") {

		alert("Error: user not deleted");
	} else if (attr == "Not logged") {
		saveUserType("notLogged");
		alert("Error: the user is not logged!");
	} else if (attr == "noPermission") {
		alert("Error: the user is not enabled to make this operation!");
	} else if (attr == "noAdmin") {
		alert("Error: must exist an admin!");
	} else if (attr == "noOntology") {
		alert("Error: the ontology not exist!Please select a new ontology");
		window.openDialog('chrome://semantic-turkey/content/versioning.xul', '_blank',
				'modal=yes,resizable,centerscreen', null);
	} else if (attr == "userOnline") {
		alert("Error: the user is online!");
	} else if (attr == "noOwner") {
		alert("Error: is not a your resource!")
	} else if (attr == "ontologyExist") {
		alert("Error: Already exists an ontology with the same name!");
		window.close();
	} else if (attr == "registration error") {
		alert("Error: the pair username-password is already in use by another user!");
	} else if (attr == "no_core_freeze") {
		alert("Error: resource already belongs to the core!");
	} else if (attr == "no_freeze") {
		alert("Error: resource already belongs to your ontology!");
	} else if (attr == "no_create_prop_value") {
		alert("Error: the class chosen as range is not a your resource!");
	}
}

//Daniele Bagni, Marco Cappella (2009):variabili per la memorizzazione dei dati associati agli utenti selezionati perla visualizzazione delle risorse
var saveUsers = new Array();
var saveHash = new Array();
var saveColor = new Array();
var size;

// Daniele Bagni, Marco Cappella (2009):funzione adattata all'ambiente
// collaborativo
function httpGetResultOLD(aResultCode) {
	//var server = readServer();
	httpReq.abort();
	if (aResultCode == RESULT_OK) {
		var treeList = responseXML.getElementsByTagName('Tree');
		var attr = treeList[0].getAttribute('type');
		if (attr == "ClassesTree") {
			var treecol = document.getElementById("category");
			if (treecol != null) {
				if (server != "127.0.0.1") {
					var ontName = readOnt();
					treecol.setAttribute("label", "Classes of " + ontName);
				} else {
					treecol.setAttribute("label", "Classes of Local Ontology");
				}
			}
			var node = getthetree().getElementsByTagName('treechildren')[0];
			var classList;

			for ( var i = 0; i < treeList.length; i++) {
				if (treeList[i].nodeType == 1) {
					classList = treeList[i].childNodes;
				}
			}
			for ( var i = 0; i < classList.length; i++) {
				if (classList[i].nodeType == 1) {
					parsing(classList[i], node, true);

				}
			}
			if (closeWin != null)
				window.close();
			// parseXMLSource(getthetree());
		}// END PANEL
		/*****************************************************************************************************
		 * @author NScarpato riempie la lista delle istanze
		 */
		else if (attr == "error") {
			var errorNode = treeList[0].getElementsByTagName('Error')[0];
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
			prompts.alert(null, "Server Communication Error", "Error: " + errorNode.getAttribute("value"));
		}// END error
		else if (attr == "AckMsg") {
			var msg = treeList[0].getElementsByTagName('Msg')[0];
			if (msg.getAttribute("content") != "") {
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
						.getService(Components.interfaces.nsIPromptService);
				prompts.alert(null, "Server Reply", msg.getAttribute("content"));
			}
			window.location.reload();

		} else if (attr == "Ack") {
			var req = treeList[0].getAttribute('request');
			if (req == "chkAnnotations") {
				var res = treeList[0].getElementsByTagName('result')[0];
				var act = res.getAttribute("status");
				active(act);
			} else if (req == "addedToCore") {
				window.close();
			} else {
				var msg = treeList[0].getElementsByTagName('Msg')[0];
				if (msg.getAttribute("content") != "") {
					var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
							.getService(Components.interfaces.nsIPromptService);
					prompts.alert(null, "Server Reply", msg.getAttribute("content"));
				}
			}
		} /*else if (attr == "save_repository") {
			var msg = treeList[0].getElementsByTagName('msg')[0];
			alert(msg.getAttribute("content"));
			close();
		} else if (attr == "load_repository") {
			var msg = treeList[0].getElementsByTagName('msg')[0];
			alert(msg.getAttribute("content"));
			close();
		} else if (attr == "clear_repository") {
			var msg = treeList[0].getElementsByTagName('msg')[0];
			alert(msg.getAttribute("content") + " Mozilla Firefox will be restart");
			// NScarpato 21/05/2008 add restarting
			var nsIAppStartup = Components.interfaces.nsIAppStartup;
			Components.classes["@mozilla.org/toolkit/app-startup;1"].getService(nsIAppStartup).quit(
					nsIAppStartup.eForceQuit | nsIAppStartup.eRestart);
		}*/ else if (attr == "Instpanel") {
			/*var list = gettheList();
			rows = list.getRowCount();
			var forum = false;
			if (rows > 0)
				forum = true;
			while (rows--) {
				list.removeItemAt(rows);
			}
			myClass = treeList[0].getElementsByTagName('Class')[0].getAttribute("name");
			numTotInst = treeList[0].getElementsByTagName('Class')[0].getAttribute("numTotInst");
			list.getElementsByTagName('listheader')[0].getElementsByTagName('listitem-iconic')[0]
					.getElementsByTagName('label')[0].setAttribute("value", "Individuals of " + myClass);
			list.getElementsByTagName('listheader')[0].setAttribute("parentCls", myClass);
			list.getElementsByTagName('listheader')[0].setAttribute("numTotInst", numTotInst);
			instancesList = treeList[0].getElementsByTagName('Instance');
			for ( var i = 0; i < instancesList.length; i++) {
				var instName = instancesList[i].getAttribute("name");
				lsti = document.createElement("listitem");
				lsti.setAttribute("label", instName);
				// NScarpato 14/04/2008 add explicit attribute for instances
				// list
				explicit = instancesList[i].getAttribute("explicit");
				lsti.setAttribute("explicit", explicit);
				lsti.setAttribute("parentCls", myClass);
				lci = document.createElement("listitem-iconic");
				img = document.createElement("image");
				if (explicit == "false") {
					img.setAttribute("src", "images/individual_noexpl.png");
				} else {
					img.setAttribute("src", "images/individual.png");
				}
				lci.appendChild(img);
				lbl = document.createElement("label");
				lbl.setAttribute("value", instName);
				lbl.setAttribute("id", instName);
				lbl.setAttribute("class", "base");
				if (server != "127.0.0.1") {//Siamo in modalità collaborativa

					var hashUser = instancesList[i].getAttribute("hash");
					if (hashUser != "ResourceBase") {
						var ress = readProp();
						var founded = false;
						for ( var it = 0; it < ress.hash.length; it++) {
							if (hashUser == ress.hash[it]) {
								founded = true;
								break;
							}
						}
						if (founded) {
							lbl.setAttribute("class", "c" + ress.colors[it]);
						}
					}
				}
				lci.appendChild(lbl);
				lsti.appendChild(lci);

				list.appendChild(lsti);
			}
			if (forum) {
				var parametersf = new Object();
				parametersf.subject = "[Instance]" + textbox.value;
				parametersf.server = server;
				window.openDialog("chrome://semantic-turkey/content/jforumQuestion.xul", "_blank",
						"modal=yes,resizable,centerscreen", parametersf);
			}
			if (create != null)
				window.close();*/
		}
		/***********************************************************************
		 * @author NScarpato creazione pannello ricerca
		 * 
		 * else if (attr == "Element") { var findType =
		 * treeList[0].getAttribute('findType'); if(findType=="similarList"){
		 * var simList=treeList[0].getElementsByTagName('SimilarElement');
		 * if(simList.length>1){ var parameters = new Object();
		 * parameters.simList = simList; parameters.tree = getthetree();
		 * parameters.list = gettheList();
		 * window.openDialog("chrome://semantic-turkey/content/search.xul",
		 * "showmore", "chrome",parameters); }else{ var resType =
		 * simList[0].getAttribute("resType"); var name =
		 * simList[0].getAttribute("name"); var typeName =
		 * simList[0].getAttribute("typeName"); var
		 * refInstName=simList[0].getAttribute("instance_name");
		 * searchFocus(resType,name,typeName,refInstName,""); } }else{ var
		 * find=treeList[0].getElementsByTagName('Find')[0]; var
		 * resType=find.getAttribute("resType"); var
		 * name=find.getAttribute("name"); var
		 * typeName=find.getAttribute("typeName"); // NScarpato 22/05/2007
		 * corretto comportamento della search var
		 * refInstName=find.getAttribute("instance_name");
		 * searchFocus(resType,name,typeName,refInstName,""); } }
		 **********************************************************************/
		/**
		 * Pagina delle webPage
		 * 
		 * @author NScarpato 21/02/2007 moved in httpGetResultP
		 */

		else if (attr == "webPage") {
			urlList = treeList[0].getElementsByTagName('URL');
			for ( var i = 0; i < urlList.length; i++) {
				var value = urlList[i].getAttribute("value");
				var title = urlList[i].getAttribute("title");
				pagelbl2 = document.createElement("label");
				pagelbl2.setAttribute("value", title);
				pagelbl2.setAttribute("class", "text-link");
				pagelbl2.setAttribute("href", value);
				pagelbl2.setAttribute("style", "-moz-user-focus: ignore");
				document.getElementById("labelBox").appendChild(pagelbl2);
			}
		}/*******************************************************************
		 * @author NScarpato END webPage
		 */
		// NScarpato change annotatorProperties in template
		else if (attr == "template") {
			var node = getthetree().getElementsByTagName('treechildren')[0];
			var propTree = treeList[0].getElementsByTagName("Properties");
			var propertyList = propTree[0].childNodes;
			// NScarpato 13/06/2008 change prop server
			for ( var i = 0; i < propertyList.length; i++) {
				if (propertyList[i].nodeType == 1) {
					var name = propertyList[i].getAttribute("name");
					var type = propertyList[i].getAttribute("type");
					type = type.substring(type.indexOf(':') + 1);
					var tr = document.createElement("treerow");
					var tc = document.createElement("treecell");
					tc.setAttribute("label", name);
					tr.setAttribute("properties", type);
					tc.setAttribute("properties", type);
					tr.appendChild(tc);
					// NScarpato 12/05/2007 Modificato Annotator.xul
					var ti = document.createElement("treeitem");
					ti.appendChild(tr);
					node.appendChild(ti);
				}
			}
		}// END properties
		else if (attr == "AllPropertiesTree") {
			var node = getthetree().getElementsByTagName('treechildren')[0];
			var propertyList;
			for ( var i = 0; i < treeList.length; i++) {
				if (treeList[i].nodeType == 1) {
					propertyList = treeList[i].childNodes;
				}
			}
			for ( var i = 0; i < propertyList.length; i++) {
				if (propertyList[i].nodeType == 1) {
					parsingProperties(propertyList[i], node);
				}
			}
			if (closeWin != null)
				window.close();
		}// END allproperties
		// NScarpato 27/10/2007 change editorPanelProperties con
		// templateandvalued
		// NScarpato 04/12/2007 add editor panel for class

		else if (attr == "templateandvalued") {/* moved into editorPanel.js
			var userType = "";
			if (server == "127.0.0.1")
				userType = "Local User";
			else {
				userType = readUserType();
			}
			if (userType == "Simple User") {
				document.getElementById("buttonModify").setAttribute("disabled", "true");
			}
			var ress = readProp();
			var request = treeList[0].getAttribute('request');
			if (request == "getClsDescription" || request == "getIndDescription") {
				var types = treeList[0].getElementsByTagName('Types');
				var typeList = types[0].getElementsByTagName('Type');
				// NScarpato 26/11/2007 change types visualization added add
				// type and remove type
				parentBox = document.getElementById("parentBoxRows");
				if (typeList.length > 3) {
					typeToolbox = document.createElement("toolbox");
					typeToolbar = document.createElement("toolbar");
					typeToolbox.appendChild(typeToolbar);
					typeToolbarButton = document.createElement("toolbarbutton");
					typeToolbarButton.setAttribute("image", "images/class_create.png");
					typeToolbarButton.setAttribute("onclick", "addType('list');");
					typeToolbarButton.setAttribute("tooltiptext", "Add Type");
					typeToolbar.appendChild(typeToolbarButton);
					typeToolbarButton2 = document.createElement("toolbarbutton");
					typeToolbarButton2.setAttribute("image", "images/class_delete.png");
					typeToolbarButton2.setAttribute("onclick", "removeType('list');");
					typeToolbarButton2.setAttribute("tooltiptext", "Remove Type");
					typeToolbar.appendChild(typeToolbarButton2);
					if (userType != "Local User") {
						var typeToolbarButton3 = document.createElement("toolbarbutton");
						typeToolbarButton3.setAttribute("image", "images/snow.png");
						typeToolbarButton3.setAttribute("onclick", "freezeType('list');");
						typeToolbarButton3.setAttribute("tooltiptext", "Freeze");
						typeToolbar.appendChild(typeToolbarButton3);
						if (userType == "Simple User") {
							typeToolbarButton.setAttribute("hidden", "true");
							typeToolbarButton2.setAttribute("hidden", "true");
							typeToolbarButton3.setAttribute("hidden", "true");
						}
					}
					parentBox.appendChild(typeToolbox);
					var list = document.createElement("listbox");
					list.setAttribute("id", "typesList");
					list.setAttribute("onclick", "listclick(event);");
					list.setAttribute("flex", "1");
					var listhead = document.createElement("listhead");
					var listheader = document.createElement("listheader");
					var listitem_iconic = document.createElement("listitem-iconic");
					// var image=document.createElement("image");
					// image.setAttribute("src","images/class.png");
					lbl2 = document.createElement("label");
					lbl2.setAttribute("value", "Types:");
					// listitem_iconic.appendChild(image);
					listitem_iconic.appendChild(lbl2);
					listheader.appendChild(listitem_iconic);
					listhead.appendChild(listheader);
					list.appendChild(listhead);
					parentBox.appendChild(list);
					for ( var i = 0; i < typeList.length; i++) {
						if (typeList[i].nodeType == 1) {
							lsti = document.createElement("listitem");
							lci = document.createElement("listitem-iconic");
							img = document.createElement("image");
							img.setAttribute("src", "images/class20x20.png");
							// img.setAttribute("width","16");
							// img.setAttribute("height","16");
							lci.appendChild(img);
							lbl = document.createElement("label");
							var value = typeList[i].getAttribute("class");
							lsti.setAttribute("label", value);
							lsti.setAttribute("explicit", typeList[i].getAttribute("explicit"));
							lbl.setAttribute("value", value);
							if (server != "127.0.0.1") {
								var hashUser = typeList[i].getAttribute("hash");
								var founded = false;
								lbl.setAttribute("class", "base");
								for ( var it = 0; it < ress.hash.length; it++) {
									if (hashUser == ress.hash[it]) {
										founded = true;
										break;
									}
								}
								if (founded) {
									lbl.setAttribute("class", "c" + ress.colors[it]);
								}
							}
							lci.appendChild(lbl);
							lsti.appendChild(lci);
							list.appendChild(lsti);
						}
					}
				} else {
					// var lblic=document.createElement("label-iconic");
					var lbl = document.createElement("label");
					var img = document.createElement("image");
					img.setAttribute("src", "images/class20x20.png");
					img.setAttribute("flex", "0");
					lbl.setAttribute("value", "Types:");
					var row = document.createElement("row");
					var box = document.createElement("box");
					// lblic.appendChild(img);
					// lblic.appendChild(lbl);
					// lblic.setAttribute("flex","0");
					row.setAttribute("flex", "0");
					// typeToolbox=document.createElement("toolbox");
					// typeToolbar=document.createElement("toolbar");
					// typeToolbox.appendChild(typeToolbar);
					var typeButton = document.createElement("toolbarbutton");
					typeButton.setAttribute("onclick", "addType('row');");
					typeButton.setAttribute("image", "images/class_create.png");
					typeButton.setAttribute("tooltiptext", "Add Type");
					if (userType == "Simple User") {
						typeButton.setAttribute("hidden", "true");
					}
					// typeToolbar.appendChild(typeButton);
					box.appendChild(typeButton);
					box.insertBefore(lbl, typeButton);
					box.insertBefore(img, lbl);
					row.appendChild(box);
					parentBox.appendChild(row);
					for ( var j = 0; j < typeList.length; j++) {
						if (typeList[j].nodeType == 1) {
							var value = typeList[j].getAttribute("class");
							var explicit = typeList[j].getAttribute("explicit");
							var txbox = document.createElement("textbox");
							txbox.setAttribute("id", "tx" + value);
							txbox.setAttribute("value", value);
							txbox.setAttribute("readonly", "true");
							var typeButton = document.createElement("button");
							typeButton.setAttribute("id", "typeButton");
							typeButton.setAttribute("flex", "0");
							typeButton.setAttribute("oncommand", "removeType('" + value + "');");
							if (explicit == "false") {
								typeButton.setAttribute("disabled", "true");
							}
							if (userType == "Simple User") {
								typeButton.setAttribute("disabled", "true");
							}
							typeButton.setAttribute("label", "Remove Type");
							typeButton.setAttribute("image", "images/class_delete.png");
							var row2 = document.createElement("row");
							row2.setAttribute("id", value);
							row2.appendChild(typeButton);
							row2.insertBefore(txbox, typeButton);
							if (server != "127.0.0.1") {
								var hashUser = typeList[j].getAttribute("hash");

								var founded = false;
								txbox.setAttribute("class", "base");

								for ( var it = 0; it < ress.hash.length; it++) {
									if (hashUser == ress.hash[it]) {
										founded = true;
										break;
									}
								}
								if (founded) {
									txbox.setAttribute("class", "c" + ress.colors[it]);
								}
								var freezeButton = document.createElement("button");
								freezeButton.setAttribute("id", "freezeButton");
								freezeButton.setAttribute("flex", "0");
								freezeButton.setAttribute("oncommand", "freezeType('" + value + "');");
								if (explicit == "false") {
									freezeButton.setAttribute("disabled", "true");
								}
								if (userType == "Simple User") {
									freezeButton.setAttribute("disabled", "true");
								}
								freezeButton.setAttribute("image", "images/snow.png");
								row2.insertBefore(freezeButton, typeButton);

							}
							parentBox.appendChild(row2);
						}
					}
				}// NScarpato 05/12/2007 add superClass list for class's
				// editor panel
				if (request == "getClsDescription") {
					var superTypes = treeList[0].getElementsByTagName('SuperTypes');
					var superClassList = superTypes[0].getElementsByTagName('SuperType');
					separator = document.createElement("separator");
					separator.setAttribute("class", "groove");
					separator.setAttribute("orient", "orizontal");
					parentBox.appendChild(separator);
					if (superClassList.length > 3) {
						typeToolbox = document.createElement("toolbox");
						typeToolbar = document.createElement("toolbar");
						typeToolbox.appendChild(typeToolbar);
						typeToolbarButton = document.createElement("toolbarbutton");
						typeToolbarButton.setAttribute("image", "images/class_create.png");
						typeToolbarButton.setAttribute("onclick", "addSuperClass('list');");
						typeToolbarButton.setAttribute("tooltiptext", "Add Super Class");
						typeToolbar.appendChild(typeToolbarButton);
						typeToolbarButton2 = document.createElement("toolbarbutton");
						typeToolbarButton2.setAttribute("image", "images/class_delete.png");
						typeToolbarButton2.setAttribute("onclick", "removeSuperClass('list');");
						typeToolbarButton2.setAttribute("tooltiptext", "Remove Super Class");
						typeToolbar.appendChild(typeToolbarButton2);
						if (userType != "Local User") {
							var typeToolbarButton3 = document.createElement("toolbarbutton");
							typeToolbarButton3.setAttribute("image", "images/snow.png");
							typeToolbarButton3.setAttribute("onclick", "freezeSuperClass('list');");
							typeToolbarButton3.setAttribute("tooltiptext", "Freeze");
							typeToolbar.appendChild(typeToolbarButton3);
							if (userType == "Simple User") {
								typeToolbarButton.setAttribute("hidden", "true");
								typeToolbarButton2.setAttribute("hidden", "true");
								typeToolbarButton3.setAttribute("hidden", "true");
							}
						}
						parentBox.appendChild(typeToolbox);
						var list = document.createElement("listbox");
						list.setAttribute("id", "typesList");
						list.setAttribute("onclick", "listclick(event);");
						list.setAttribute("flex", "1");
						var listhead = document.createElement("listhead");
						var listheader = document.createElement("listheader");
						var listitem_iconic = document.createElement("listitem-iconic");
						// var image=document.createElement("image");
						// image.setAttribute("src","images/class.png");
						lbl2 = document.createElement("label");
						lbl2.setAttribute("value", "Super Classes:");
						// listitem_iconic.appendChild(image);
						listitem_iconic.appendChild(lbl2);
						listheader.appendChild(listitem_iconic);
						listhead.appendChild(listheader);
						list.appendChild(listhead);
						parentBox.appendChild(list);
						for ( var k = 0; k < superClassList.length; k++) {
							if (superClassList[k].nodeType == 1) {
								lsti = document.createElement("listitem");
								lci = document.createElement("listitem-iconic");
								img = document.createElement("image");
								img.setAttribute("src", "images/class20x20.png");
								lci.appendChild(img);
								lbl = document.createElement("label");
								var value = superClassList[k].getAttribute("resource");
								lsti.setAttribute("label", value);
								lsti.setAttribute("explicit", superClassList[k].getAttribute("explicit"));
								lbl.setAttribute("value", value);
								if (server != "127.0.0.1") {
									var hashUser = superClassList[k].getAttribute("hash");
									var founded = false;
									lbl.setAttribute("class", "base");
									for ( var it = 0; it < ress.hash.length; it++) {
										if (hashUser == ress.hash[it]) {
											founded = true;
											break;
										}
									}
									if (founded) {
										lbl.setAttribute("class", "c" + ress.colors[it]);
									}
								}
								lci.appendChild(lbl);
								lsti.appendChild(lci);
								list.appendChild(lsti);
							}
						}
					} else {
						// var lblic2=document.createElement("label-iconic");
						var lbl2 = document.createElement("label");
						var img2 = document.createElement("image");
						img2.setAttribute("src", "images/class20x20.png");
						img2.setAttribute("flex", "0");
						lbl2.setAttribute("value", "Super Classes:");
						var row3 = document.createElement("row");
						var box2 = document.createElement("box");
						// lblic2.appendChild(img2);
						// lblic2.appendChild(lbl2);
						row3.setAttribute("flex", "0");
						// typeToolbox=document.createElement("toolbox");
						// typeToolbar=document.createElement("toolbar");
						// typeToolbox.appendChild(typeToolbar);
						typeButton2 = document.createElement("toolbarbutton");
						typeButton2.setAttribute("image", "images/class_create.png");
						typeButton2.setAttribute("onclick", "addSuperClass('row');");
						typeButton2.setAttribute("tooltiptext", "Add Super Class");
						if (userType == "Simple User") {
							typeButton2.setAttribute("hidden", "true");
						}
						// typeToolbar.appendChild(typeButton2);
						box2.appendChild(typeButton2);
						box2.insertBefore(lbl2, typeButton2);
						box2.insertBefore(img2, lbl2);
						row3.appendChild(box2);
						parentBox.appendChild(row3);
						for ( var h = 0; h < superClassList.length; h++) {
							if (superClassList[h].nodeType == 1) {
								var value2 = superClassList[h].getAttribute("resource");
								var explicit = superClassList[h].getAttribute("explicit");
								var txbox2 = document.createElement("textbox");
								txbox2.setAttribute("value", value2);
								txbox2.setAttribute("id", "tx" + value2);
								txbox2.setAttribute("readonly", "true");
								var typeButton3 = document.createElement("button");
								typeButton3.setAttribute("id", "typeButton");
								typeButton3.setAttribute("flex", "0");
								typeButton3.setAttribute("oncommand", "removeSuperClass('" + value2 + "');");
								typeButton3.setAttribute("label", "Remove Super Class");
								if (explicit == "false") {
									typeButton3.setAttribute("disabled", "true");
								}
								if (userType == "Simple User") {
									typeButton3.setAttribute("disabled", "true");
								}
								var row4 = document.createElement("row");
								row4.setAttribute("id", value2);
								row4.appendChild(typeButton3);
								row4.insertBefore(txbox2, typeButton3);
								if (server != "127.0.0.1") {
									var hashUser = superClassList[h].getAttribute("hash");
									var founded = false;
									txbox2.setAttribute("class", "base");
									for ( var it = 0; it < ress.hash.length; it++) {
										if (hashUser == ress.hash[it]) {
											founded = true;
											break;
										}
									}
									if (founded) {
										txbox2.setAttribute("class", "c" + ress.colors[it]);
									}
									var freezeButton2 = document.createElement("button");
									freezeButton2.setAttribute("id", "freezeButton");
									freezeButton2.setAttribute("flex", "0");
									freezeButton2.setAttribute("oncommand", "freezeSuperClass('" + value2
											+ "');");
									if (explicit == "false") {
										freezeButton2.setAttribute("disabled", "true");
									}
									if (userType == "Simple User") {
										freezeButton2.setAttribute("disabled", "true");
									}
									freezeButton2.setAttribute("image", "images/snow.png");
									row4.insertBefore(freezeButton2, typeButton3);
								}
								parentBox.appendChild(row4);
							}
						}
					}
				}
				// NScarpato 07/11/2007 change property visualization
				// NScarpato 06/03/2008 add button for add e remove value
				var properties = treeList[0].getElementsByTagName('Properties');
				var propertyList = properties[0].getElementsByTagName('Property');
				// NScarpato 26/03/2008 add title and addNewProperty option for
				// property of instance
				var rowsBox = document.getElementById("rowsBox");
				var propTitle = document.createElement("label");
				propTitle.setAttribute("value", "Properties:");
				var rowTitle = document.createElement("row");
				rowTitle.setAttribute("align", "center");
				rowTitle.setAttribute("pack", "center");
				rowTitle.setAttribute("flex", "0");
				var titleBox = document.createElement("box");
				// propertyTitleToolbox=document.createElement("toolbox");
				// propertyTitleToolbar=document.createElement("toolbar");
				// propertyTitleToolbox.appendChild(propertyTitleToolbar);
				typeTitleToolbarButton = document.createElement("toolbarbutton");
				typeTitleToolbarButton.setAttribute("image", "images/prop_create.png");
				typeTitleToolbarButton.setAttribute("onclick", "AddNewProperty();");
				typeTitleToolbarButton.setAttribute("tooltiptext", "Add New Property");
				if (userType == "Simple User") {
					typeTitleToolbarButton.setAttribute("hidden", "true");
				}
				// propertyTitleToolbar.appendChild(typeTitleToolbarButton);
				titleBox.appendChild(typeTitleToolbarButton);
				titleBox.insertBefore(propTitle, typeTitleToolbarButton);
				rowTitle.appendChild(titleBox);
				rowsBox.appendChild(rowTitle);
				for ( var i = 0; i < propertyList.length; i++) {
					if (propertyList[i].nodeType == 1) {
						var nameValue = propertyList[i].getAttribute("name");
						var typeValue = propertyList[i].getAttribute("type");
						var row = document.createElement("row");
						var box3 = document.createElement("box");

						// propertyToolbox=document.createElement("toolbox");
						// propertyToolbar=document.createElement("toolbar");
						// propertyToolbox.appendChild(propertyToolbar);
						if (typeValue == "owl:ObjectProperty") {
							typeToolbarButton = document.createElement("toolbarbutton");
							typeToolbarButton.setAttribute("image", "images/propObject_create.png");
							typeToolbarButton.setAttribute("onclick", "createAndAddPropValue('" + nameValue
									+ "','" + typeValue + "');");
							typeToolbarButton.setAttribute("tooltiptext", "Add and Create Value");
							if (userType == "Simple User") {
								typeToolbarButton.setAttribute("hidden", "true");
							}
							box3.appendChild(typeToolbarButton);
							
							 * typeToolbarButton1=document.createElement("toolbarbutton");
							 * typeToolbarButton1.setAttribute("image","images/addExistingObjectPropertyValue.GIF");
							 * typeToolbarButton1.setAttribute("onclick","addExistingPropValue('"+nameValue+"');");
							 * typeToolbarButton1.setAttribute("tooltiptext","Add Value");
							 * propertyToolbar.appendChild(typeToolbarButton1);
							 
						} else if (typeValue == "owl:DatatypeProperty") {
							typeToolbarButton = document.createElement("toolbarbutton");
							typeToolbarButton.setAttribute("image", "images/propDatatype_create.png");
							typeToolbarButton.setAttribute("onclick", "createAndAddPropValue('" + nameValue
									+ "','" + typeValue + "');");
							typeToolbarButton.setAttribute("tooltiptext", "Add Value");
							if (userType == "Simple User") {
								typeToolbarButton.setAttribute("hidden", "true");
							}
							box3.appendChild(typeToolbarButton);
						} else if (typeValue == "owl:AnnotationProperty") {
							typeToolbarButton = document.createElement("toolbarbutton");
							typeToolbarButton.setAttribute("image", "images/propAnnotation_create.png");
							typeToolbarButton.setAttribute("onclick", "createAndAddPropValue('" + nameValue
									+ "','" + typeValue + "');");
							typeToolbarButton.setAttribute("tooltiptext", "Add Value");
							if (userType == "Simple User") {
								typeToolbarButton.setAttribute("hidden", "true");
							}
							box3.appendChild(typeToolbarButton);

						} else {
							typeToolbarButton = document.createElement("toolbarbutton");
							typeToolbarButton.setAttribute("image", "images/prop20x20.png");
							typeToolbarButton.setAttribute("onclick", "createAndAddPropValue('" + nameValue
									+ "','" + typeValue + "');");
							typeToolbarButton.setAttribute("tooltiptext", "Add Value");
							if (userType == "Simple User") {
								typeToolbarButton.setAttribute("hidden", "true");
							}
							box3.appendChild(typeToolbarButton);
						}

						var lblic = document.createElement("label-iconic");
						var lbl = document.createElement("label");
						var img = document.createElement("image");
						if (typeValue == "owl:ObjectProperty") {
							img.setAttribute("src", "images/propObject20x20.png");
							img.setAttribute("flex", "0");
							lbl.setAttribute("value", nameValue);
						} else if (typeValue == "owl:DatatypeProperty") {
							img.setAttribute("src", "images/propDatatype20x20.png");
							img.setAttribute("flex", "0");
							lbl.setAttribute("value", nameValue);
						} else if (typeValue == "owl:AnnotationProperty") {
							img.setAttribute("src", "images/propAnnotation20x20.png");
							img.setAttribute("flex", "0");
							lbl.setAttribute("value", nameValue);
						} else {
							img.setAttribute("src", "images/prop20x20.png");
							img.setAttribute("flex", "0");
							lbl.setAttribute("value", nameValue);
						}

						lblic.appendChild(img);
						lblic.appendChild(lbl);
						box3.insertBefore(lblic, typeToolbarButton);
						row.setAttribute("flex", "0");
						row.appendChild(box3);
						rowsBox.appendChild(row);
						valueList = propertyList[i].getElementsByTagName('Value');

						if (valueList.length > 10) {
							if (typeValue == "owl:ObjectProperty") {
								typeToolbarButton2 = document.createElement("toolbarbutton");
								typeToolbarButton2.setAttribute("image", "images/individual_remove.png");
								typeToolbarButton2.setAttribute("onclick", "removePropValue('list','"
										+ nameValue + "','" + typeValue + "');");
								typeToolbarButton2.setAttribute("tooltiptext", "Remove Value");
								propertyToolbar.appendChild(typeToolbarButton2);

								if (userType != "Local User") {
									var typeToolbarButton3 = document.createElement("toolbarbutton");
									typeToolbarButton3.setAttribute("image", "images/snow.png");
									typeToolbarButton3.setAttribute("onclick", "freezePropValue('list','"
											+ nameValue + "','" + typeValue + "');");
									typeToolbarButton3.setAttribute("tooltiptext", "Freeze");
									box3.appendChild(typeToolbarButton3);

									if (userType == "Simple User") {
										typeToolbarButton2.setAttribute("hidden", "true");
										typeToolbarButton3.setAttribute("hidden", "true");
									}
								}
							} else if (typeValue == "owl:DatatypeProperty") {
								typeToolbarButton2 = document.createElement("toolbarbutton");
								// typeToolbarButton2.setAttribute("image","images/prop_delete.png");
								typeToolbarButton2.setAttribute("onclick", "removePropValue('list','"
										+ nameValue + "','" + typeValue + "');");
								typeToolbarButton2.setAttribute("tooltiptext", "Remove Value");
								propertyToolbar.appendChild(typeToolbarButton2);
								if (userType != "Local User") {
									var typeToolbarButton3 = document.createElement("toolbarbutton");
									typeToolbarButton3.setAttribute("image", "images/snow.png");
									typeToolbarButton3.setAttribute("onclick", "freezePropValue('list','"
											+ nameValue + "','" + typeValue + "');");
									typeToolbarButton3.setAttribute("tooltiptext", "Freeze");
									box3.appendChild(typeToolbarButton3);
									if (userType == "Simple User") {
										typeToolbarButton2.setAttribute("hidden", "true");
										typeToolbarButton3.setAttribute("hidden", "true");
									}
								}
							} else if (typeValue == "owl:AnnotationProperty") {
								typeToolbarButton2 = document.createElement("toolbarbutton");
								// typeToolbarButton2.setAttribute("image","images/prop_delete.png");
								typeToolbarButton2.setAttribute("onclick", "removePropValue('list','"
										+ nameValue + "','" + typeValue + "');");
								typeToolbarButton2.setAttribute("tooltiptext", "Remove Value");
								propertyToolbar.appendChild(typeToolbarButton2);
								if (userType != "Local User") {
									var typeToolbarButton3 = document.createElement("toolbarbutton");
									typeToolbarButton3.setAttribute("image", "images/snow.png");
									typeToolbarButton3.setAttribute("onclick", "freezePropValue('list','"
											+ nameValue + "','" + typeValue + "');");
									typeToolbarButton3.setAttribute("tooltiptext", "Freeze");
									box3.appendChild(typeToolbarButton3);
									if (userType == "Simple User") {
										typeToolbarButton2.setAttribute("hidden", "true");
										typeToolbarButton3.setAttribute("hidden", "true");
									}
								}
							} else {
								typeToolbarButton2 = document.createElement("toolbarbutton");
								// typeToolbarButton2.setAttribute("image","images/prop_delete.png");
								typeToolbarButton2.setAttribute("onclick", "removePropValue('list','"
										+ nameValue + "','" + typeValue + "');");
								typeToolbarButton2.setAttribute("tooltiptext", "Remove Value");
								propertyToolbar.appendChild(typeToolbarButton2);
								if (userType != "Local User") {
									var typeToolbarButton3 = document.createElement("toolbarbutton");
									typeToolbarButton3.setAttribute("image", "images/snow.png");
									typeToolbarButton3.setAttribute("onclick", "freezePropValue('list','"
											+ nameValue + "','" + typeValue + "');");
									typeToolbarButton3.setAttribute("tooltiptext", "Freeze");
									box3.appendChild(typeToolbarButton3);
									if (userType == "Simple User") {
										typeToolbarButton2.setAttribute("hidden", "true");
										typeToolbarButton3.setAttribute("hidden", "true");
									}
								}
							}
							propList = document.createElement("listbox");
							propList.setAttribute("id", "propList");
							propList.setAttribute("onclick", "listclick(event);");
							if (typeValue == "owl:ObjectProperty") {
								propList.setAttribute("ondblclick", "listdblclick(event);");
							}
							propList.setAttribute("flex", "1");
							for ( var j = 0; j < valueList.length; j++) {
								lsti = document.createElement("listitem");
								lci = document.createElement("listitem-iconic");
								img = document.createElement("image");
								img.setAttribute("src", "images/individual.png");
								lci.appendChild(img);
								lbl = document.createElement("label");
								var value = valueList[j].getAttribute("value");
								// NScarpato 25/03/2008
								if (typeValue == "owl:AnnotationProperty"
										|| typeValue == "owl:AnnotationProperty_noexpl") {
									var lang = valueList[j].getAttribute("lang");
									lbl.setAttribute("value", value + " (language: " + lang + ")");
									lsti.setAttribute("language", lang);
									lsti.setAttribute("typeValue", typeValue);
								} else {
									lbl.setAttribute("value", value);
								}
								if (server != "127.0.0.1") {
									var hashUser = valueList[j].getAttribute("hash");
									var founded = false;
									lbl.setAttribute("class", "base");
									for ( var it = 0; it < ress.hash.length; it++) {
										if (hashUser == ress.hash[it]) {
											founded = true;
											break;
										}
									}
									if (founded) {
										lbl.setAttribute("class", "c" + ress.colors[it]);
									}
								}
								lci.appendChild(lbl);
								lsti.setAttribute("label", value);
								var explicit = valueList[j].getAttribute("explicit");
								lsti.setAttribute("explicit", explicit);
								lsti.appendChild(lci);
								propList.appendChild(lsti);
							}
							var row2 = document.createElement("row");
							row2.appendChild(propList);
							rowsBox.appendChild(row2);
						} else {
							for ( var j = 0; j < valueList.length; j++) {
								if (valueList[j].nodeType == 1) {
									value = valueList[j].getAttribute("value");
									var explicit = valueList[j].getAttribute("explicit");
									var valueType = valueList[j].getAttribute("type");
									row2 = document.createElement("row");
									txbox = document.createElement("textbox");
									txbox.setAttribute("id", "tx" + value);
									txbox.setAttribute("typeValue", typeValue);
									if (typeValue == "owl:AnnotationProperty") {
										var lang = valueList[j].getAttribute("lang");
										txbox.setAttribute("value", value + " (language: " + lang + ")");
										txbox.setAttribute("language", lang);

									} else {
										txbox.setAttribute("value", value);
									}
									txbox.setAttribute("readonly", "true");
									propButton = document.createElement("button");
									if (userType == "Simple User") {
										propButton.setAttribute("disabled", "true");
									}
									propButton.setAttribute("flex", "0");
									if (valueType == "rdfs:Resource") {
										propButton.setAttribute("image", "images/individual_remove.png");
										var resImg = document.createElement("image");
										resImg.setAttribute("src", "images/individual20x20.png");
										// resImg.setAttribute("ondblclick","resourcedblClick('"+explicit+"','"+value+"');");
										txbox.setAttribute("tooltiptext", "Editable Resource");
										txbox.setAttribute("onclick", "resourcedblClick('" + explicit + "','"
												+ value + "');");
										txbox.setAttribute("onmouseover", "setCursor('pointer')");
										resImg.setAttribute("onmouseover", "setCursor('pointer')");
										txbox.setAttribute("onmouseout", "setCursor('default')");
									} else if (typeValue == "owl:DatatypeProperty") {
										// propButton.setAttribute("image","images/prop_delete.png");
									} else if (typeValue == "owl:AnnotationProperty") {
										// propButton.setAttribute("image","images/prop_delete.png");
										if (nameValue == "rdfs:comment") {
											txbox.setAttribute("cols", "1");
											txbox.setAttribute("rows", "3");
											txbox.setAttribute("wrap", "on");
											txbox.setAttribute("multiline", "true");
										}
									} else {
										// propButton.setAttribute("image","images/prop_delete.png");
									}
									propButton.setAttribute("oncommand", "removePropValue('" + value + "','"
											+ nameValue + "','" + typeValue + "');");
									propButton.setAttribute("label", "Remove Value");
									if (explicit == "false") {
										propButton.setAttribute("disabled", "true");
									}
									row2.appendChild(propButton);
									if (valueType == "rdfs:Resource") {
										
										 * resToolbar=document.createElement("toolbar");
										 * resToolbar.appendChild(editToolbarButton);
										 * resToolbar.appendChild(txbox);
										 * resToolbar.setAttribute("flex","0");
										 * row2.insertBefore(txbox,propButton);
										 * row2.insertBefore(resToolbar,txbox);
										 
										txbox.appendChild(resImg);
									}// else{
									row2.insertBefore(txbox, propButton);
									// }
									if (server != "127.0.0.1") {
										var hashUser = valueList[j].getAttribute("hash");
										var founded = false;
										txbox.setAttribute("class", "base");
										for ( var it = 0; it < ress.hash.length; it++) {
											if (hashUser == ress.hash[it]) {
												founded = true;
												break;
											}
										}
										if (founded) {
											txbox.setAttribute("class", "c" + ress.colors[it]);
										}
										var freezeButton2 = document.createElement("button");
										freezeButton2.setAttribute("id", "freezeButton");
										freezeButton2.setAttribute("flex", "0");
										freezeButton2.setAttribute("oncommand", "freezePropValue('" + value
												+ "','" + nameValue + "','" + typeValue + "');");
										if (explicit == "false") {
											freezeButton2.setAttribute("disabled", "true");
										}
										if (userType == "Simple User") {
											freezeButton2.setAttribute("disabled", "true");
										}
										freezeButton2.setAttribute("image", "images/snow.png");
										row2.insertBefore(freezeButton2, propButton);
									}
									rowsBox.appendChild(row2);
								}
							}
						}

					}
				}

			}
*/		}// END editorPanelProperties for class and instance

		else if (attr == "error") {
			var errorNode = treeList[0].getElementsByTagName('Error')[0];
			alert("Error: " + errorNode.getAttribute("value"));
		}// END error

//		else if (attr == "Annotations") {
//			/*var annotations = treeList[0].getElementsByTagName('Annotation');
//			for ( var i = 0; i < annotations.length; i++) {
//				var valueToHighlight = annotations[i].getAttribute("value");
//				highlightStartTag = "<font style='color:blue; background-color:yellow;'>";
//				highlightEndTag = "</font>";
//				highlightSearchTerms(valueToHighlight, true, true, highlightStartTag, highlightEndTag);
//			}*/
//		}// END annotations

		else if (attr == "AckMsg") {
			var msg = treeList[0].getElementsByTagName('Msg')[0];
			// alert(msg.getAttribute("content"));
		} else if (attr == "my_cls") {
			window.close();
		} else if (attr == "logging") {
			var nsList = treeList[0].getElementsByTagName('Modify');
			var i;
			var lstbox = document.getElementById("logging");
			if (!lstbox.hasChildNodes()) {
				var ldth = document.createElement("listhead");
				var ldthr = document.createElement("listheader");
				var ldthr1 = document.createElement("listheader");
				ldthr.setAttribute("flex", "4");
				ldthr1.setAttribute("flex", "1");
				ldthr.setAttribute("label", "Modifies");
				ldthr1.setAttribute("label", "Date");
				ldth.appendChild(ldthr);
				ldth.appendChild(ldthr1);
				lstbox.appendChild(ldth);
			}
			for (i = 0; i < nsList.length; i++) {
				var lstitem = document.createElement("listitem");
				var lstcell = document.createElement("listcell");
				var lstcell2 = document.createElement("listcell");
				lstcell.setAttribute("label", nsList[i].getAttribute("msg"));
				lstcell2.setAttribute("label", nsList[i].getAttribute("date").substring(0,
						nsList[i].getAttribute("date").indexOf(",")));
				lstitem.appendChild(lstcell);
				lstitem.appendChild(lstcell2);
				lstbox.appendChild(lstitem);
			}
			if (nsList.length == 0) {
				var lstitem = document.createElement("listitem");
				var lstcell = document.createElement("listcell");
				var lstcell2 = document.createElement("listcell");
				lstcell.setAttribute("label", "No modifies");
				lstcell2.setAttribute("label", "-");
				lstitem.appendChild(lstcell);
				lstitem.appendChild(lstcell2);
				lstbox.appendChild(lstitem);
			}

		} else if (attr == "graphicsTable") {
			var nsList = treeList[0].getElementsByTagName('graphic');
			var treeGraph = document.getElementById("deleteGraphTree");
			var tch = treeGraph.getElementsByTagName("treechildren");
			for ( var i = 0; i <= nsList.length; i++) {
				var tr = document.createElement("treerow");
				var tc = document.createElement("treecell");
				var labelNew = nsList[i].getAttribute('name');
				var labelDel = nsList[i].getAttribute('name');
				labelDel = labelDel.substring(11);
				labelDel = labelDel.substring(labelDel.indexOf("_") + 1);
				labelDel = labelDel.substring(labelDel.indexOf("_") + 1);
				var parlen = 0;
				if (labelDel.substring(labelDel.length - 1) == "_") {
					labelDel = labelDel.substring(0, labelDel.length - 1);
					parlen++;
				}

				var realLabel = "[" + labelNew.substring(1, (labelNew.length - parlen - labelDel.length - 1))
						+ "]" + labelDel;
				tc.setAttribute("label", " - " + realLabel);
				tc.setAttribute("value", nsList[i].getAttribute('name'));
				tr.appendChild(tc);
				var ti = document.createElement("treeitem");
				ti.appendChild(tr);
				tch[0].appendChild(ti);

			}
		} else if (attr == "mailTable") {
			var nsList = treeList[0].getElementsByTagName('Users');
			var popupADest = document.getElementById("popupADest");

			for ( var i = 0; i <= nsList.length; i++) {
				var elem = document.createElement("menuitem");
				elem.setAttribute("label", nsList[i].getAttribute('Username') + "<"
						+ nsList[i].getAttribute('Mail') + ">");
				elem.setAttribute("onclick", "selectA('" + nsList[i].getAttribute('Mail') + "')");
				popupADest.appendChild(elem);
			}
		}
		//Daniele Bagni, Marco Cappella (2009):gestione della finestra per la scelta dei colori associati all'utente
		else if (attr == "userTableColor") {
			var colors = new Array();
			colors[0] = "red";
			colors[1] = "aqua";
			colors[2] = "green";
			colors[3] = "yellow";
			colors[4] = "blue";
			colors[5] = "gray";
			colors[6] = "lime";
			colors[7] = "olive";
			colors[8] = "navy";
			colors[9] = "fuchsia";
			colors[10] = "maroon";
			colors[11] = "teal";
			colors[12] = "silver";
			colors[13] = "purple";
			var oldProp = readProp();
			var nsList = treeList[0].getElementsByTagName('Users');
			var numColor = 14;
			var i = 0;
			size = nsList.length;
			if (nsList.length == 0) {

				var panel = document.getElementById("myPanelcolorRows");
				var labelErr = document.createElement("label");
				labelErr.setAttribute("value", "No users owning classes in the ontology");
				labelErr.setAttribute("class", "header");
				panel.appendChild(labelErr);
			} else {
				var rowss = document.getElementById("colorRows");
				for (i = 0; i < nsList.length; i++) {

					var user = nsList[i].getAttribute("Username");
					saveUsers[i] = user;
					var hash = nsList[i].getAttribute("Hash");
					saveHash[i] = hash;
					var found = false;
					var j;
					var labelrow = document.createElement("textbox");
					var menurow = document.createElement("row");
					var menulst = document.createElement("menulist");
					var userHash = readUserHash();

					for (k = 0; k < oldProp.hash.length; k++) {

						if (hash == oldProp.hash[k]) {

							found = true;
							labelrow.setAttribute("value", oldProp.users[k]);
							labelrow.setAttribute("class", "c" + oldProp.colors[k]);
							menulst.setAttribute("class", "c" + oldProp.colors[k]);

						}
						if (found)
							break;

					}
					if (!found) {

						labelrow.setAttribute("value", user);
						labelrow.setAttribute("class", "c" + (((i) % numColor) + 1));
						menulst.setAttribute("class", "c" + (((i) % numColor) + 1));

					}
					if (hash == userHash)
						labelrow.setAttribute("value", "You");

					labelrow.setAttribute("readonly", "true");
					labelrow.setAttribute("id", "labelC" + i);

					menulst.setAttribute("id", "listC" + i);
					var menuppp = document.createElement("menupopup");
					var j = 1;

					for (j = 1; j <= numColor; j++) {
						var menuite = document.createElement("menuitem");
						menuite.setAttribute("label", colors[j - 1]);
						menuite.setAttribute("class", "c" + j);
						menuite.setAttribute("onclick", "changeLabelColor(" + j + "," + i + ")");
						menuite.setAttribute("onmouseover", "changeLabelColor(" + j + "," + i + ")");
						if (found) {
							if (j == oldProp.colors[k]) {
								menuite.setAttribute("selected", "true");

							}
						} else {
							if (i + 1 == j)
								menuite.setAttribute("selected", "true");
						}
						menuppp.appendChild(menuite);
					}
					var menuite = document.createElement("menuitem");
					menuite.setAttribute("label", "No");
					menuite.setAttribute("class", "cNo");
					menuite.setAttribute("onclick", "changeLabelColor(-1," + i + ")");
					menuite.setAttribute("onmouseover", "changeLabelColor(-1," + i + ")");
					if (found) {
						if (oldProp.colors[k] == "No") {
							menuite.setAttribute("selected", "true");
						}
					}
					menuppp.appendChild(menuite);
					menulst.appendChild(menuppp);
					menurow.appendChild(labelrow);
					menurow.appendChild(menulst);
					rowss.appendChild(menurow);
				}
			}
		}
		//Daniele Bagni, Marco Cappella (2009):gestione dei risultati della query SPARQL inoltrata
		else if (attr == "SPARQLTree") {
			/*var querytype = treeList[0].getAttribute("queryType");
			if (querytype == "select") {
				var SPARQLvbox = document.getElementById("SPARQLvbox");
				var list = SPARQLvbox.childNodes;
				for (it = 0; it < list.length; it++) {
					list[it].setAttribute("hidden", "true");
				}
				var results = treeList[0].getElementsByTagName('Binding');
				var counter = 0;
				var STree = getSPARQLTree();
				while (STree.hasChildNodes()) {
					STree.removeChild(STree.lastChild);
				}
				STree.setAttribute("hidden", "false");
				var treecols = document.createElement("treecols");
				var treechildren = document.createElement("treechildren");
				STree.appendChild(treecols);
				STree.appendChild(treechildren);
				if (results.length == 0) {
					var treecol = document.createElement("treecol");

					treecol.setAttribute("label", "Results");
					treecol.setAttribute("flex", "1");
					treecols.appendChild(treecol);
					var treeitem = document.createElement("treeitem");
					var treerow = document.createElement("treerow");
					var treecell = document.createElement("treecell");
					treecell.setAttribute("label", "No Results");

					treechildren.appendChild(treeitem);
					treeitem.appendChild(treerow);
					treerow.appendChild(treecell);
				} else {
					var treeitem = new Array();
					var treerow = new Array();

					for (counter = 0; counter < results.length; counter++) {

						var treecol = document.createElement("treecol");

						// lstheader.setAttribute("flex",1);

						treecol.setAttribute("label", results[counter].getAttribute("bindingName"));
						treecol.setAttribute("flex", "1");
						if (counter == 0)
							treecol.setAttribute("primary", "true");
						treecols.appendChild(treecol);
						if (counter != results.length - 1) {
							var splitter = document.createElement("splitter");
							splitter.setAttribute("class", "tree-splitter");
							treecols.appendChild(splitter);
						}

					}
					var counter2 = 0;
					var resultsList = results[0].getElementsByTagName("Value");
					for (counter2 = 0; counter2 < resultsList.length; counter2++) {
						treeitem[counter2] = document.createElement("treeitem");
						treerow[counter2] = document.createElement("treerow");
						treeitem[counter2].appendChild(treerow[counter2]);
					}

					for (counter = 0; counter < results.length; counter++) {
						resultsList = results[counter].getElementsByTagName("Value");
						for (counter2 = 0; counter2 < resultsList.length; counter2++) {
							var nameResultList = resultsList[counter2].getAttribute("value");
							var treecell = document.createElement("treecell");
							treecell.setAttribute("label", nameResultList);
							var typeResultList = resultsList[counter2].getAttribute("type");
							treecell.setAttribute("properties", "base" + typeResultList);

							if (typeResultList == "Instance") {
								treecell.setAttribute("value", "Individual"); // Importante
								// per
								// editor
								// panel
							} else {
								treecell.setAttribute("value", typeResultList); // Importante
								// per
								// editor
								// panel
							}
							treerow[counter2].appendChild(treecell);

						}

					}
					for (counter2 = 0; counter2 < resultsList.length; counter2++) {

						treechildren.appendChild(treeitem[counter2]);
					}
				}
			} else if (querytype == "ask") {
				var labelR = document.getElementById('labelask');
				labelR.setAttribute("value", "   >>>   The result of ASK query is:   >>>   "
						+ treeList[0].getAttribute("value"));
				var SPARQLvbox = document.getElementById("SPARQLvbox");
				var list = SPARQLvbox.childNodes;
				for (it = 0; it < list.length; it++) {
					list[it].setAttribute("hidden", "true");
				}
				labelR.setAttribute("hidden", "false");
			} else if (querytype == "describe" || querytype == "construct") {
				var SPARQLvbox = document.getElementById("SPARQLvbox");
				var list = SPARQLvbox.childNodes;
				for ( var it = 0; it < list.length; it++) {
					list[it].setAttribute("hidden", "true");
				}
				var textarea = document.getElementById("textAreaResult");
				var labelText = document.getElementById("textAreaResult1");
				var valueText = treeList[0].getAttribute('value');
				textarea.setAttribute("hidden", "false");
				labelText.setAttribute("hidden", "false");
				textarea.setAttribute("value", valueText);
			}*/
		}
		//Daniele Bagni, Marco Cappella (2009)
		else if (attr == "freeze_cls") {

			window.close();
		}
		//Daniele Bagni, Marco Cappella (2009):gestione a livello grafico del freeze di una istanza	
		else if (attr == "freeze_inst") {
			var instName = treeList[0].getAttribute("instanceName");
			var list = getthelist();
			var items = list.getElementsByTagName('listitem');
			for ( var i = 0; i < items.length; i++) {
				var itemsIconic = items[i].getElementsByTagName('listitem-iconic');
				var labelitem = itemsIconic[0].getElementsByTagName('label');
				var oldName = labelitem[0].getAttribute('value');
				if (oldName.substring(oldName.length - 1) == ")")
					oldName = oldName.substring(0, oldName.indexOf("("))
				if (oldName == instName) {

					labelitem[0].setAttribute("value", oldName);

					labelitem[0].setAttribute("class", "base");
					break;
				}
			}
			window.close();

		}
		//Daniele Bagni, Marco Cappella (2009):gestione a livello grafico di 'add to my ontology'
		else if (attr == "my_inst") {
			var instName = treeList[0].getAttribute("instanceName");
			var list = getthelist();
			var items = list.getElementsByTagName('listitem');
			for ( var i = 0; i < items.length; i++) {
				var itemsIconic = items[i].getElementsByTagName('listitem-iconic');
				var labelitem = itemsIconic[0].getElementsByTagName('label');
				var oldName = labelitem[0].getAttribute('value');
				var oldNum = 1;
				if (oldName.substring(oldName.length - 1) == ")") {
					oldNum = oldName.substring(oldName.indexOf('(') + 1, oldName.indexOf(')'));

					oldName = oldName.substring(0, oldName.indexOf('('));
				}

				if (oldName == instName) {
					var prop = readProp();
					var userhash1 = readUserHash();
					for ( var j = 0; j < prop.hash.length; j++) {
						if (prop.hash[j] == userhash1) {
							labelitem[0].setAttribute("class", "c" + prop.colors[j]);
							labelitem[0].setAttribute("value", oldName + "(" + (parseInt(oldNum) + 1) + ")");
							break;
						}
					}

					break;
				}
			}
			window.close();

		}
		//Daniele Bagni, Marco Cappella (2009):gestione contesti associati ad una risorsa
		else if (attr == "ContextTree") {
			var triples = treeList[0].getElementsByTagName('Context');
			var userTree = document.getElementById("contextTree");
			var treeChildren = userTree.getElementsByTagName('treechildren')[0];
			var foundUser = false;
			var oldProp = readProp();
			var resBase = false;
			for ( var i = 0; i < oldProp.hash.length; i++) {

				if (oldProp.colors[i] != "No") {

					for ( var k = 0; k < triples.length; k++) {
						if (i == 0) {
							if (!resBase) {
								if (triples[k].getAttribute("context") == "ResourceBase") {
									var tc = document.createElement("treecell");

									tc.setAttribute("properties", "base");
									tc.setAttribute("align", "center");
									var tc1 = document.createElement("treecell");
									tc1.setAttribute("label", "Core Resource");
									var tr = document.createElement("treerow");
									tr.appendChild(tc);
									tr.appendChild(tc1);
									var ti = document.createElement("treeitem");
									ti.appendChild(tr);
									treeChildren.appendChild(ti);
									resBase = true;
								}
							}
						}
						var cntxt = triples[k].getAttribute("context");
						if (oldProp.hash[i] == cntxt) {
							var tc = document.createElement("treecell");

							tc.setAttribute("properties", "c" + oldProp.colors[i]);
							tc.setAttribute("align", "center");
							var tc1 = document.createElement("treecell");
							if (oldProp.hash[i] == readUserHash()) {
								foundUser = true;
								tc1.setAttribute("label", "You");
							} else
								tc1.setAttribute("label", oldProp.users[i]);

							var tr = document.createElement("treerow");
							tr.appendChild(tc);
							tr.appendChild(tc1);
							var ti = document.createElement("treeitem");
							ti.appendChild(tr);
							treeChildren.appendChild(ti);
							break;
						}
					}
				}

			}

		}
		//Daniele Bagni, Marco Cappella (2009):	gestione dei sondaggi standard riguardanti una risorsa
		else if (attr == "TripleTree") {
			var triples = treeList[0].getElementsByTagName('Class');
			var counter = 0;
			for (counter = 0; counter < triples.length; counter++) {
				var rows = document.getElementById("parentBoxRows");
				var rowPoll = document.createElement("row");
				var txtbx = document.createElement("textbox");
				txtbx.setAttribute("readonly", "true");
				txtbx.setAttribute("id", "label" + counter);
				if (triples[counter].getAttribute("pred") == "subClassOf")
					txtbx.setAttribute("value", triples[counter].getAttribute("subj") + " "
							+ triples[counter].getAttribute("pred") + " "
							+ triples[counter].getAttribute("obj") + "?");
				else
					txtbx.setAttribute("value", triples[counter].getAttribute("pred") + " of "
							+ triples[counter].getAttribute("subj") + " is "
							+ triples[counter].getAttribute("obj") + "?");
				var btt = document.createElement("button");
				btt.setAttribute("image", "images/istogramma.png");
				btt.setAttribute("label", " Vote");
				btt.setAttribute("id", "button" + counter);
				btt.setAttribute("oncommand", "votePoll(" + counter + ")");

				rowPoll.appendChild(txtbx);
				rowPoll.appendChild(btt);
				rows.appendChild(rowPoll);
			}
		}
	} else if (aResultCode == RESULT_ERROR_FAILURE) {
	}// END RESULT_ERROR_FAILURE
}

//Daniele Bagni, Marco Cappella (2009):funziona adattata all'ambito collaborativo



/**
 * NScarpato 12/07/2007 This function make parsing for prefix namespace tree
 * 
 */
/*
function parsingNSPrefixMappings(namespaceNode, node) {
	var ns = namespaceNode.getAttribute("ns");
	var prefix = namespaceNode.getAttribute("prefix");
	var tr = document.createElement("treerow");
	var explicit = namespaceNode.getAttribute("explicit");
	var tcPrefix = document.createElement("treecell");
	tcPrefix.setAttribute("label", prefix);
	var tcNs = document.createElement("treecell");
	tcNs.setAttribute("label", ns);
	// NScarpato 07/04/2008 add grey text to no explicit namespace
	tcNs.setAttribute("properties", explicit);
	tcPrefix.setAttribute("properties", explicit);
	tr.setAttribute("explicit", explicit);
	tr.appendChild(tcPrefix);
	tr.appendChild(tcNs);
	var ti = document.createElement("treeitem");
	ti.appendChild(tr);
	node.appendChild(ti);
}
*/
/**
 * NScarpato 04/10/2007 This function make parsing for imports tree
 * 
 */
/*
function parsingImports(importsNode, node, isRoot) {
	var uri = importsNode.getAttribute("uri");
	var stato = importsNode.getAttribute("status");
	var localfile = importsNode.getAttribute("localfile");
	var tr = document.createElement("treerow");
	var tc = document.createElement("treecell");
	tc.setAttribute("label", uri);
	tc.setAttribute("localfile", localfile);
	tr.setAttribute("properties", stato);
	tc.setAttribute("properties", stato);
	tr.setAttribute("isRoot", isRoot);
	tc.setAttribute("isRoot", isRoot);
	tr.appendChild(tc);
	var ti = document.createElement("treeitem");
	importsBox = parameters.importsBox;
	ti.appendChild(tr);
	var tch = document.createElement("treechildren");
	ti.appendChild(tch);
	node.appendChild(ti);
	var importsNodes;
	var importsList = importsNode.childNodes;
	for ( var i = 0; i < importsList.length; i++) {
		if (importsList[i].nodeName == "ontology") {
			importsNodes = importsList[i].childNodes;
			if (importsList[i].nodeType == 1) {
				parsingImports(importsList[i], tch, "false");
			}
			for ( var j = 0; j < importsNodes.length; j++) {
				if (importsNodes[j].nodeType == 1) {
					parsingImports(importsNodes[j], tch, "false");
				}
			}
		}
		if (importsList != null && importsList.length > 0) {
			ti.setAttribute("open", true);
			ti.setAttribute("container", true);
		} else {
			ti.setAttribute("open", false);
			ti.setAttribute("container", false);
		}
	}

}
*/
//Daniele Bagni, Marco Cappella (2009):funzione adattata all'ambiente collaborativo



/**
 * @author NScarpato 12/03/2008 getNSPrefixMappings
 * 
 */
/*
function getNSPrefixMappings(treeList) {
	namespaceTree = parameters.namespaceTree;
	var node = namespaceTree.getElementsByTagName('treechildren')[0];
	var nsList;
	for ( var i = 0; i < treeList.length; i++) {
		if (treeList[i].nodeType == 1) {
			nsList = treeList[i].childNodes;
		}
	}
	for ( var i = 0; i < nsList.length; i++) {
		if (nsList[i].nodeType == 1) {
			parsingNSPrefixMappings(nsList[i], node);
		}
	}
}*/

/**
 * @author NScarpato 12/03/2008 imports
 */
/*
function imports(treeList) {

	importTree = parameters.importsTree;
	var node = importTree.getElementsByTagName('treechildren')[0];
	var nsList;
	for ( var i = 0; i < treeList.length; i++) {
		if (treeList[i].nodeType == 1) {
			nsList = treeList[i].childNodes;
		}
	}
	for ( var i = 0; i < nsList.length; i++) {
		if (nsList[i].nodeType == 1) {
			parsingImports(nsList[i], node, "true");
		}
	}

}*/
/**
 * @author NScarpato 12/03/2008 addFromWebToMirror
 */
function addFromWebToMirror(msg) {
	var treeChildren = parameters.namespaceTree.getElementsByTagName('treechildren')[0];
	treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
	// EMPTY TREE
	while (treeChildren.hasChildNodes()) {
		treeChildren.removeChild(treeChildren.lastChild);
	}
	var treeChildren2 = parameters.importsTree.getElementsByTagName('treechildren')[0];
	// EMPTY TREE
	while (treeChildren2.hasChildNodes()) {
		treeChildren2.removeChild(treeChildren2.lastChild);
	}
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_nsprefixmappings",
			false, parameters);
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_imports",
			false, parameters);
	// alert(msg.getAttribute("content"));
}
/**
 * @author NScarpato 12/03/2008 addFromWeb
 */
function addFromWeb(msg) {
	var treeChildren = parameters.namespaceTree.getElementsByTagName('treechildren')[0];
	treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
	// EMPTY TREE
	while (treeChildren.hasChildNodes()) {
		treeChildren.removeChild(treeChildren.lastChild);
	}
	var treeChildren2 = parameters.importsTree.getElementsByTagName('treechildren')[0];
	// EMPTY TREE
	while (treeChildren2.hasChildNodes()) {
		treeChildren2.removeChild(treeChildren2.lastChild);
	}
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_nsprefixmappings",
			false, parameters);
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_imports",
			false, parameters);
	// alert(msg.getAttribute("content"));
}
/**
 * @author NScarpato 12/03/2008 addFromLocalFile
 */
function addFromLocalFile(msg) {
	var treeChildren = parameters.namespaceTree.getElementsByTagName('treechildren')[0];
	treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
	// EMPTY TREE
	while (treeChildren.hasChildNodes()) {
		treeChildren.removeChild(treeChildren.lastChild);
	}
	var treeChildren2 = parameters.importsTree.getElementsByTagName('treechildren')[0];
	// EMPTY TREE
	while (treeChildren2.hasChildNodes()) {
		treeChildren2.removeChild(treeChildren2.lastChild);
	}
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_nsprefixmappings",
			false, parameters);
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_imports",
			false, parameters);
	// alert(msg.getAttribute("content"));
}
/**
 * @author NScarpato 12/03/2008 removeImport
 */
function removeOntologyImport(msg) {
	var treeChildren = parameters.namespaceTree.getElementsByTagName('treechildren')[0];
	treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
	// EMPTY TREE
	while (treeChildren.hasChildNodes()) {
		treeChildren.removeChild(treeChildren.lastChild);
	}
	var treeChildren2 = parameters.importsTree.getElementsByTagName('treechildren')[0];
	// EMPTY TREE
	while (treeChildren2.hasChildNodes()) {
		treeChildren2.removeChild(treeChildren2.lastChild);
	}
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_nsprefixmappings",
			false, parameters);
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_imports",
			false, parameters);
	// alert(msg.getAttribute("content"));
}
/**
 * @author NScarpato 12/03/2008 addFromOntologyMirror
 * @param msg
 */
function addFromOntologyMirror(msg) {

	var treeChildren = parameters.namespaceTree.getElementsByTagName('treechildren')[0];
	treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
	// EMPTY TREE
	while (treeChildren.hasChildNodes()) {
		treeChildren.removeChild(treeChildren.lastChild);
	}
	var treeChildren2 = parameters.importsTree.getElementsByTagName('treechildren')[0];
	// EMPTY TREE
	while (treeChildren2.hasChildNodes()) {
		treeChildren2.removeChild(treeChildren2.lastChild);
	}
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_nsprefixmappings",
			false, parameters);
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_imports",
			false, parameters);
	// alert(msg.getAttribute("content"));
}
/**
 * @author NScarpato 12/03/2008 NSPrefixMappingChanged
 */
function NSPrefixMappingChanged() {
	var treeChildren = parameters.namespaceTree.getElementsByTagName('treechildren')[0];
	treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
	// EMPTY TREE
	while (treeChildren.hasChildNodes()) {
		treeChildren.removeChild(treeChildren.lastChild);
	}
	/*
	 * var treeChildren2 =
	 * parameters.importsTree.getElementsByTagName('treechildren')[0]; // EMPTY
	 * TREE while(treeChildren2.hasChildNodes()){
	 * treeChildren2.removeChild(treeChildren2.lastChild); }
	 * httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_imports",false,parameters);
	 */
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_nsprefixmappings",
			false, parameters);
}
//Daniele Bagni, Marco Cappella (2009):funzione adattata all'ambiente collaborativo

/**
 * @author NScarpato 12/03/2008 update_delete
 * @param type
 */
function update_delete(type) {
	var server = readServer();
	var tree = parameters.tree;
	if (type == "Instance") {
		var list = parameters.list;
		var parentName = list.getElementsByTagName('listheader')[0].getAttribute("parentCls");
		var instName = parameters.instName;
		var instIndex = parameters.instIndex;
		var numTotInst = parameters.numTotInst;
		var deleteType = parameters.deleteType;
		// Elimino istanza dalla lista e aggiorno parametro numTotInst
		list.removeItemAt(instIndex);
		// If it's simple delete refresh only node aboute instance
		if (deleteType == "delete") {
			numTot = numTotInst - 1;
			list.getElementsByTagName('listheader')[0].setAttribute("numTotInst", numTot);
			var newParentClassName = "";
			if (numTot != "0") {
				newParentClassName = parentName + "(" + numTot + ")";
			} else {
				newParentClassName = parentName;
			}
			// modifico il numero di istanze nell'attributo name
			// della classe nell'albero
			var treecellNodes;
			var iconicName = parentName + "(" + numTotInst + ")";
			treecellNodes = tree.getElementsByTagName("treecell");
			for ( var i = 0; i < treecellNodes.length; i++) {
				if (treecellNodes[i].getAttribute("label") == iconicName) {
					treecellNodes[i].setAttribute("label", newParentClassName);
				}
			}
			// Else If it's deep delete refresh all classTree
		} else if (deleteType == "deepDelete") {
			var treeChildren = tree.getElementsByTagName('treechildren')[0];
			treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
			// EMPTY TREE
			while (treeChildren.hasChildNodes()) {
				treeChildren.removeChild(treeChildren.lastChild);
			}
			// RELOAD TREE
			if (server == "127.0.0.1")
				httpGet("http://" + server + ":1979/semantic_turkey/resources/stserver/STServer?service=cls");
			else
				httpGet("http://" + server
						+ ":1979/semantic_turkey/resources/stserver/STServer?service=cls&type=clsTree");

		}
		var swap = readSwap();
		if (swap == "1") {
			var parametersJ = new Object();
			parametersJ.server = server;
			parametersJ.threadName = "[Instance]" + instName;
			window.openDialog("chrome://semantic-turkey/content/jforumDeleteThread.xul", "_blank",
					"modal=yes,resizable,centerscreen", parametersJ);

		}
	}// Update after class delete
	// NScarpato 08/10/2007 add delete Property
	/*else if (type == "Class") {// property this code has been moved into class.js
		var treeChildren = tree.getElementsByTagName('treechildren')[0];
		treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		// RELOAD TREE
		if (server == "127.0.0.1")
			httpGet("http://" + server + ":1979/semantic_turkey/resources/stserver/STServer?service=cls");
		else {
			var treeList = responseXML.getElementsByTagName('Tree');
			var resource = treeList[0].getElementsByTagName('Resource');
			var requestToSM = gettherequest()
			httpGet(requestToSM);
			var parametersJ = new Object();
			parametersJ.server = server;
			parametersJ.threadName = "[Class]" + resource[0].getAttribute('name');
			window.openDialog("chrome://semantic-turkey/content/jforumDeleteThread.xul", "_blank",
					"modal=yes,resizable,centerscreen", parametersJ);

		}
	}*/ /*else {// property this code has been moved into property.js
		var name = parameters.name;
		var parentIconicName = parameters.parentIconicName;
		var child = parameters.currentelement;
		var targetNode = child.parentNode.parentNode;
		var treeChildren = targetNode.getElementsByTagName('treechildren')[0];
		treeChildren.removeChild(child);
		if (targetNode.getElementsByTagName('treechildren').length == 1) {
			targetNode.setAttribute('container', 'false');
			targetNode.setAttribute('open', 'false');
		} else if (targetNode.getAttribute('open') == "false") {
			targetNode.setAttribute('open', 'true');
		}
		var swap = readSwap();
		if (swap == "1") {
			var server = readServer();
			var parametersJ = new Object();
			parametersJ.server = server;
			parametersJ.threadName = "[Property]" + name;
			window.openDialog("chrome://semantic-turkey/content/jforumDeleteThread.xul", "_blank",
					"modal=yes,resizable,centerscreen", parametersJ);

		}
	}*/
}
/**
 * @author NScarpato 14/03/2008 addSuperClass or remove Super classes
 * @param {xml}
 *            treeList
 */
function changeSuperClass(treeList) {
	var server = readServer();
	value = treeList[0].getElementsByTagName('Type')[0].getAttribute("qname");
	if (treeList[0].getAttribute('type') == "remove_superclass") {
		// alert("Class '"+value+"' correctly removed");
	} else {
		// alert("Class '"+value+"' correctly added");
	}
	// empty parentBox
	parentBox = parameters.parentBox;
	while (parentBox.hasChildNodes()) {
		parentBox.removeChild(parentBox.lastChild);
	}
	// empty rowBox
	rowBox = parameters.rowBox;
	while (rowBox.hasChildNodes()) {
		rowBox.removeChild(rowBox.lastChild);
	}
	httpGetP("http://"
			+ server
			+ ":1979/semantic_turkey/resources/stserver/STServer?service=cls&request=getClsDescription&clsName="
			+ encodeURIComponent(parameters.sourceElementName) + "&method=templateandvalued");
}
/**
 * @author NScarpato 23/06/2008 addSuperProperty or remove Super property
 * @param {xml}
 *            treeList
 */
function changeSuperProperty(treeList) {
	var server = readServer();
	var req = treeList[0].getAttribute('request');
	if (treeList[0].getAttribute('request') == "removeSuperProperty") {
		// alert("Super Property correctly removed");
	} else {
		// alert("Super Property correctly added");
	}
	// empty parentBox
	parentBox = parameters.parentBox;
	while (parentBox.hasChildNodes()) {
		parentBox.removeChild(parentBox.lastChild);
	}
	// empty rowBox
	rowBox = parameters.rowBox;
	while (rowBox.hasChildNodes()) {
		rowBox.removeChild(rowBox.lastChild);
	}
	httpGet(
			"http://"
					+ server
					+ ":1979/semantic_turkey/resources/stserver/STServer?service=property&request=getPropDescription&propertyQName="
					+ encodeURIComponent(parameters.sourceElementName), false, parameters);
}
/**
 * @author NScarpato 12/03/2008 changePropValue
 * @param {String}
 *            type
 */
function changePropValue(type) {
	if (type == "remove") {
		// alert("Value '"+parameters.propValue+"' correctly removed");
	} else if (type == "add" || type == "create") {
		// alert("Value '"+parameters.propValue+"' correctly added");
	}
}
//Daniele Bagni, Marco Cappella (2009):funzione adattata all'ambiente collaborativo

/**
 * @author NScarpato 12/03/2008 getPropDscr
 * @param {String}
 *            treeList
 */
/*
 *Moved in editorPanel.js 
 function getPropDscr(treeList) {
	var userType = "";
	if (server == "127.0.0.1")
		userType = "Local User";
	else {
		userType = readUserType();
	}
	if (userType == "Simple User") {
		document.getElementById("buttonModify").setAttribute("disabled", "true");
	}
	var ress = readProp();
	var domainNodeList = treeList[0].getElementsByTagName("domain");
	parentBox = document.getElementById("parentBoxRows");
	// Types
	var types = treeList[0].getElementsByTagName('Types');
	var typeList = types[0].getElementsByTagName('Type');
	// NScarpato 26/11/2007 change types visualization added add type and remove
	// type
	parentBox = document.getElementById("parentBoxRows");
	if (typeList.length > 3) {
		typeToolbox = document.createElement("toolbox");
		typeToolbar = document.createElement("toolbar");
		typeToolbox.appendChild(typeToolbar);
		typeToolbarButton = document.createElement("toolbarbutton");
		typeToolbarButton.setAttribute("image", "images/class_create.png");
		typeToolbarButton.setAttribute("onclick", "addType('list');");
		typeToolbarButton.setAttribute("tooltiptext", "Add Type");
		if (userType != "Local User") {
			var typeToolbarButton3 = document.createElement("toolbarbutton");
			typeToolbarButton3.setAttribute("image", "images/snow.png");
			typeToolbarButton3.setAttribute("onclick", "freezePropType('list');");
			typeToolbarButton3.setAttribute("tooltiptext", "Freeze");
			typeToolbar.appendChild(typeToolbarButton3);
			if (userType == "Simple User") {
				typeToolbarButton.setAttribute("hidden", "true");
				typeToolbarButton2.setAttribute("hidden", "true");
				typeToolbarButton3.setAttribute("hidden", "true");
			}
		}
		typeToolbar.appendChild(typeToolbarButton);
		typeToolbarButton2 = document.createElement("toolbarbutton");
		typeToolbarButton2.setAttribute("image", "images/class_delete.png");
		typeToolbarButton2.setAttribute("onclick", "removeType('list');");
		typeToolbarButton2.setAttribute("tooltiptext", "Remove Type");
		typeToolbar.appendChild(typeToolbarButton2);
		parentBox.appendChild(typeToolbox);
		var list = document.createElement("listbox");
		list.setAttribute("id", "typesList");
		list.setAttribute("onclick", "listclick(event);");
		list.setAttribute("flex", "1");
		var listhead = document.createElement("listhead");
		var listheader = document.createElement("listheader");
		var listitem_iconic = document.createElement("listitem-iconic");
		// var image=document.createElement("image");
		// image.setAttribute("src","images/class.png");
		lbl2 = document.createElement("label");
		lbl2.setAttribute("value", "Types:");
		// listitem_iconic.appendChild(image);
		listitem_iconic.appendChild(lbl2);
		listheader.appendChild(listitem_iconic);
		listhead.appendChild(listheader);
		list.appendChild(listhead);
		parentBox.appendChild(list);
		for ( var i = 0; i < typeList.length; i++) {
			if (typeList[i].nodeType == 1) {
				lsti = document.createElement("listitem");
				lci = document.createElement("listitem-iconic");
				img = document.createElement("image");
				img.setAttribute("src", "images/class20x20.png");
				lci.appendChild(img);
				lbl = document.createElement("label");
				var value = typeList[i].getAttribute("class");
				lsti.setAttribute("label", value);
				lsti.setAttribute("explicit", typeList[i].getAttribute("explicit"));
				lbl.setAttribute("value", value);
				if (server != "127.0.0.1") {
					var hashUser = typeList[i].getAttribute("hash");
					var founded = false;
					lbl.setAttribute("class", "base");
					for ( var it = 0; it < ress.hash.length; it++) {
						if (hashUser == ress.hash[it]) {
							founded = true;
							break;
						}
					}
					if (founded) {
						lbl.setAttribute("class", "c" + ress.colors[it]);
					}
				}
				lci.appendChild(lbl);
				lsti.appendChild(lci);
				list.appendChild(lsti);
			}
		}
	} else {
		// var lblic=document.createElement("label-iconic");
		var lbl = document.createElement("label");
		var img = document.createElement("image");
		img.setAttribute("src", "images/class20x20.png");
		lbl.setAttribute("value", "Types:");
		var row = document.createElement("row");
		var box = document.createElement("box");
		// lblic.appendChild(img);
		// lblic.appendChild(lbl);
		// lblic.setAttribute("flex","0");
		row.setAttribute("flex", "0");
		// typeToolbox=document.createElement("toolbox");
		// typeToolbar=document.createElement("toolbar");
		// typeToolbox.appendChild(typeToolbar);
		var typeButton = document.createElement("toolbarbutton");
		typeButton.setAttribute("onclick", "addType('row');");
		typeButton.setAttribute("image", "images/class_create.png");
		typeButton.setAttribute("tooltiptext", "Add Type");
		if (userType == "Simple User") {
			typeButton.setAttribute("hidden", "true");
		}
		// typeToolbar.appendChild(typeButton);
		box.appendChild(typeButton);
		box.insertBefore(lbl, typeButton);
		box.insertBefore(img, lbl);
		row.appendChild(box);
		parentBox.appendChild(row);
		for ( var j = 0; j < typeList.length; j++) {
			if (typeList[j].nodeType == 1) {
				var value = typeList[j].getAttribute("class");
				var explicit = typeList[j].getAttribute("explicit");
				var txbox = document.createElement("textbox");
				txbox.setAttribute("value", value);
				txbox.setAttribute("id", "tx" + value);
				txbox.setAttribute("readonly", "true");
				var typeButton = document.createElement("button");
				typeButton.setAttribute("id", "typeButton");
				typeButton.setAttribute("flex", "0");
				typeButton.setAttribute("oncommand", "removeType('" + value + "');");
				if (explicit == "false") {
					typeButton.setAttribute("disabled", "true");
				}
				if (userType == "Simple User") {
					typeButton.setAttribute("disabled", "true");
				}
				typeButton.setAttribute("label", "Remove Type");
				typeButton.setAttribute("image", "images/class_delete.png");
				var row2 = document.createElement("row");
				row2.setAttribute("id", value);
				row2.appendChild(typeButton);
				row2.insertBefore(txbox, typeButton);
				if (server != "127.0.0.1") {
					var hashUser = typeList[j].getAttribute("hash");
					var founded = false;
					txbox.setAttribute("class", "base");
					for ( var it = 0; it < ress.hash.length; it++) {
						if (hashUser == ress.hash[it]) {
							founded = true;
							break;
						}
					}
					if (founded) {
						txbox.setAttribute("class", "c" + ress.colors[it]);
					}
					var freezeButton = document.createElement("button");
					freezeButton.setAttribute("id", "freezeButton");
					freezeButton.setAttribute("flex", "0");
					freezeButton.setAttribute("oncommand", "freezePropType('" + value + "');");
					if (explicit == "false") {
						freezeButton.setAttribute("disabled", "true");
					}
					if (userType == "Simple User") {
						freezeButton.setAttribute("disabled", "true");
					}
					freezeButton.setAttribute("image", "images/snow.png");
					row2.insertBefore(freezeButton, typeButton);
				}
				parentBox.appendChild(row2);
			}
		}
	}
	// Supertypes
	var superTypes = treeList[0].getElementsByTagName('SuperTypes');
	var superTypeList = superTypes[0].getElementsByTagName('SuperType');
	// NScarpato 26/11/2007 change types visualization added add type and remove
	// type
	parentBox = document.getElementById("parentBoxRows");
	if (superTypeList.length > 3) {
		typeToolbox = document.createElement("toolbox");
		typeToolbar = document.createElement("toolbar");
		typeToolbox.appendChild(typeToolbar);
		typeToolbarButton = document.createElement("toolbarbutton");
		typeToolbarButton.setAttribute("image", "images/prop_create.png");
		typeToolbarButton.setAttribute("onclick", "addSuperProperty('list');");
		typeToolbarButton.setAttribute("tooltiptext", "Add SuperProperty");
		typeToolbar.appendChild(typeToolbarButton);
		typeToolbarButton2 = document.createElement("toolbarbutton");
		typeToolbarButton2.setAttribute("image", "images/prop_delete.png");
		typeToolbarButton2.setAttribute("onclick", "removeSuperProperty('list');");
		typeToolbarButton2.setAttribute("tooltiptext", "Remove SuperProperty");
		if (userType != "Local User") {
			var typeToolbarButton3 = document.createElement("toolbarbutton");
			typeToolbarButton3.setAttribute("image", "images/snow.png");
			typeToolbarButton3.setAttribute("onclick", "freezeSuperProperty('list');");
			typeToolbarButton3.setAttribute("tooltiptext", "Freeze");
			typeToolbar.appendChild(typeToolbarButton3);
			if (userType == "Simple User") {
				typeToolbarButton.setAttribute("hidden", "true");
				typeToolbarButton2.setAttribute("hidden", "true");
				typeToolbarButton3.setAttribute("hidden", "true");
			}
		}
		typeToolbar.appendChild(typeToolbarButton2);
		parentBox.appendChild(typeToolbox);
		var list = document.createElement("listbox");
		list.setAttribute("id", "superTypeList");
		list.setAttribute("onclick", "listclick(event);");
		list.setAttribute("flex", "1");
		var listhead = document.createElement("listhead");
		var listheader = document.createElement("listheader");
		var listitem_iconic = document.createElement("listitem-iconic");
		// var image=document.createElement("image");
		// image.setAttribute("src","images/class.png");
		lbl2 = document.createElement("label");
		lbl2.setAttribute("value", "SuperProperty:");
		// listitem_iconic.appendChild(image);
		listitem_iconic.appendChild(lbl2);
		listheader.appendChild(listitem_iconic);
		listhead.appendChild(listheader);
		list.appendChild(listhead);
		parentBox.appendChild(list);
		for ( var i = 0; i < superTypeList.length; i++) {
			if (superTypeList[i].nodeType == 1) {
				lsti = document.createElement("listitem");
				lci = document.createElement("listitem-iconic");
				img = document.createElement("image");
				img.setAttribute("src", "images/prop20x20.png");
				lci.appendChild(img);
				lbl = document.createElement("label");
				var value = superTypeList[i].getAttribute("resource");
				lsti.setAttribute("label", value);
				lsti.setAttribute("explicit", superTypeList[i].getAttribute("explicit"));
				lbl.setAttribute("value", value);
				if (server != "127.0.0.1") {
					var hashUser = superTypeList[i].getAttribute("hash");
					var founded = false;
					lbl.setAttribute("class", "base");
					for ( var it = 0; it < ress.hash.length; it++) {
						if (hashUser == ress.hash[it]) {
							founded = true;
							break;
						}
					}
					if (founded) {
						lbl.setAttribute("class", "c" + ress.colors[it]);
					}
				}
				lci.appendChild(lbl);
				lsti.appendChild(lci);
				list.appendChild(lsti);
			}
		}
	} else {
		// var lblic=document.createElement("label-iconic");
		var lbl = document.createElement("label");
		var img = document.createElement("image");
		img.setAttribute("src", "images/prop20x20.png");
		lbl.setAttribute("value", "SuperProperty:");
		var row = document.createElement("row");
		var box = document.createElement("box");
		// lblic.appendChild(img);
		// lblic.appendChild(lbl);
		// lblic.setAttribute("flex","0");
		row.setAttribute("flex", "0");
		// typeToolbox=document.createElement("toolbox");
		// typeToolbar=document.createElement("toolbar");
		// typeToolbox.appendChild(typeToolbar);
		var typeButton = document.createElement("toolbarbutton");
		typeButton.setAttribute("onclick", "addSuperProperty('row');");
		typeButton.setAttribute("image", "images/prop_create.png");
		typeButton.setAttribute("tooltiptext", "Add SuperProperty");
		if (userType == "Simple User") {
			typeButton.setAttribute("hidden", "true");
		}
		// typeToolbar.appendChild(typeButton);
		box.appendChild(typeButton);
		box.insertBefore(lbl, typeButton);
		box.insertBefore(img, lbl);
		row.appendChild(box);
		parentBox.appendChild(row);
		for ( var j = 0; j < superTypeList.length; j++) {
			if (superTypeList[j].nodeType == 1) {
				var value = superTypeList[j].getAttribute("resource");
				var explicit = superTypeList[j].getAttribute("explicit");
				var txbox = document.createElement("textbox");
				txbox.setAttribute("value", value);
				txbox.setAttribute("id", "tx" + value);

				txbox.setAttribute("readonly", "true");
				var typeButton = document.createElement("button");
				typeButton.setAttribute("id", "typeButton");
				typeButton.setAttribute("flex", "0");
				typeButton.setAttribute("oncommand", "removeSuperProperty('" + value + "');");
				if (explicit == "false") {
					typeButton.setAttribute("disabled", "true");
				}
				if (userType == "Simple User") {
					typeButton.setAttribute("disabled", "true");
				}
				typeButton.setAttribute("label", "Remove SuperProperty");
				typeButton.setAttribute("image", "images/prop_delete.png");
				var row2 = document.createElement("row");
				row2.setAttribute("id", value);
				row2.appendChild(typeButton);
				row2.insertBefore(txbox, typeButton);
				if (server != "127.0.0.1") {
					var hashUser = superTypeList[j].getAttribute("hash");
					var founded = false;
					txbox.setAttribute("class", "base");
					for ( var it = 0; it < ress.hash.length; it++) {
						if (hashUser == ress.hash[it]) {
							founded = true;
							break;
						}
					}
					if (founded) {
						txbox.setAttribute("class", "c" + ress.colors[it]);
					}
					var freezeButton = document.createElement("button");
					freezeButton.setAttribute("id", "freezeButton");
					freezeButton.setAttribute("flex", "0");
					freezeButton.setAttribute("oncommand", "freezeSuperProperty('" + value + "');");
					if (explicit == "false") {
						freezeButton.setAttribute("disabled", "true");
					}
					if (userType == "Simple User") {
						freezeButton.setAttribute("disabled", "true");
					}
					freezeButton.setAttribute("image", "images/snow.png");
					row2.insertBefore(freezeButton, typeButton);
				}
				parentBox.appendChild(row2);
			}
		}
	}
	if (parameters.type == "ObjectProperty") {
		if (domainNodeList.length > 3) {
			domainToolbox = document.createElement("toolbox");
			domainToolbar = document.createElement("toolbar");
			domainToolbox.appendChild(domainToolbar);
			domainToolbarButton = document.createElement("toolbarbutton");
			domainToolbarButton.setAttribute("image", "images/class_create.png");
			domainToolbarButton.setAttribute("onclick", "insertDomain('list');");
			domainToolbarButton.setAttribute("tooltiptext", "Add Domain");
			domainToolbar.appendChild(domainToolbarButton);
			domainToolbarButton2 = document.createElement("toolbarbutton");
			domainToolbarButton2.setAttribute("image", "images/class_delete.png");
			domainToolbarButton2.setAttribute("onclick", "removeDomain('list');");
			domainToolbarButton2.setAttribute("tooltiptext", "Remove Domain");
			domainToolbar.appendChild(domainToolbarButton2);
			if (userType != "Local User") {
				var domainToolbarButton3 = document.createElement("toolbarbutton");
				domainToolbarButton3.setAttribute("image", "images/snow.png");
				domainToolbarButton3.setAttribute("onclick", "freezeDomain('list');");
				domainToolbarButton3.setAttribute("tooltiptext", "Freeze");
				domainToolbar.appendChild(domainToolbarButton3);
				if (userType == "Simple User") {
					domainToolbarButton.setAttribute("hidden", "true");
					domainToolbarButton2.setAttribute("hidden", "true");
					domainToolbarButton3.setAttribute("hidden", "true");
				}
			}
			parentBox.appendChild(domainToolbox);
			var list = document.createElement("listbox");
			list.setAttribute("id", "domainsList");
			list.setAttribute("onclick", "listclick(event);");
			list.setAttribute("flex", "1");
			var listhead = document.createElement("listhead");
			var listheader = document.createElement("listheader");
			var listitem_iconic = document.createElement("listitem-iconic");
			// var image=document.createElement("image");
			// image.setAttribute("src","images/class.png");
			lbl2 = document.createElement("label");
			lbl2.setAttribute("value", "Domains:");
			// listitem_iconic.appendChild(image);
			listitem_iconic.appendChild(lbl2);
			listheader.appendChild(listitem_iconic);
			listhead.appendChild(listheader);
			list.appendChild(listhead);
			parentBox.appendChild(list);
			for ( var i = 0; i < domainNodeList.length; i++) {
				if (domainNodeList[i].nodeType == 1) {
					lsti = document.createElement("listitem");
					lci = document.createElement("listitem-iconic");
					img = document.createElement("image");
					img.setAttribute("src", "images/class20x20.png");
					lci.appendChild(img);
					lbl = document.createElement("label");
					var value = domainNodeList[i].getAttribute("name");
					lsti.setAttribute("label", value);
					var explicit = domainNodeList[i].getAttribute("explicit");
					lsti.setAttribute("explicit", explicit);
					lbl.setAttribute("value", value);
					if (server != "127.0.0.1") {
						var hashUser = domainNodeList[i].getAttribute("hash");
						var founded = false;
						lbl.setAttribute("class", "base");

						for ( var it = 0; it < ress.hash.length; it++) {
							if (hashUser == ress.hash[it]) {
								founded = true;
								break;
							}
						}
						if (founded) {
							lbl.setAttribute("class", "c" + ress.colors[it]);
						}
					}
					lci.appendChild(lbl);
					lsti.appendChild(lci);
					list.appendChild(lsti);
				}
			}
		} else {
			// var lblic=document.createElement("label-iconic");
			var lbl = document.createElement("label");
			var img = document.createElement("image");
			img.setAttribute("src", "images/class20x20.png");
			lbl.setAttribute("value", "Domains:");
			var row = document.createElement("row");
			var box = document.createElement("box");
			// lblic.appendChild(img);
			// lblic.appendChild(lbl);
			// lblic.setAttribute("flex","0");
			row.setAttribute("flex", "4");
			// domainToolbox=document.createElement("toolbox");
			// domainToolbar=document.createElement("toolbar");
			// domainToolbox.appendChild(domainToolbar);
			var domainButton = document.createElement("toolbarbutton");
			domainButton.setAttribute("onclick", "insertDomain();");
			domainButton.setAttribute("image", "images/class_create.png");
			domainButton.setAttribute("tooltiptext", "Add domain");
			if (userType == "Simple User") {
				domainButton.setAttribute("hidden", "true");
			}
			// domainToolbar.appendChild(domainButton);
			box.appendChild(domainButton);
			box.insertBefore(lbl, domainButton);
			box.insertBefore(img, lbl);
			row.appendChild(box);
			parentBox.appendChild(row);
			for ( var j = 0; j < domainNodeList.length; j++) {
				if (domainNodeList[j].nodeType == 1) {
					var value = domainNodeList[j].getAttribute("name");
					var txbox = document.createElement("textbox");
					txbox.setAttribute("value", value);
					txbox.setAttribute("id", "tx" + value);
					txbox.setAttribute("explicit", explicit);
					txbox.setAttribute("readonly", "true");
					var domainButton = document.createElement("button");
					domainButton.setAttribute("id", "domainButton");
					domainButton.setAttribute("flex", "0");
					domainButton.setAttribute("oncommand", "removeDomain('" + value + "');");
					domainButton.setAttribute("label", "Remove Domain");
					domainButton.setAttribute("image", "images/class_delete.png");
					var explicit = domainNodeList[j].getAttribute("explicit");
					if (explicit == "false") {
						domainButton.setAttribute("disabled", "true");
					}
					if (userType == "Simple User") {
						domainButton.setAttribute("disabled", "true");
					}
					var row2 = document.createElement("row");
					row2.setAttribute("id", value);
					row2.appendChild(domainButton);
					row2.insertBefore(txbox, domainButton);
					if (server != "127.0.0.1") {
						var hashUser = domainNodeList[j].getAttribute("hash");
						var founded = false;
						txbox.setAttribute("class", "base");
						for ( var it = 0; it < ress.hash.length; it++) {
							if (hashUser == ress.hash[it]) {
								founded = true;
								break;
							}
						}
						if (founded) {
							txbox.setAttribute("class", "c" + ress.colors[it]);
						}
						var freezeButton = document.createElement("button");
						freezeButton.setAttribute("id", "freezeButton");
						freezeButton.setAttribute("flex", "0");
						freezeButton.setAttribute("oncommand", "freezeDomain('" + value + "');");
						if (explicit == "false") {
							freezeButton.setAttribute("disabled", "true");
						}
						if (userType == "Simple User") {
							freezeButton.setAttribute("disabled", "true");
						}
						freezeButton.setAttribute("image", "images/snow.png");
						row2.insertBefore(freezeButton, domainButton);
					}
					parentBox.appendChild(row2);
				}
			}
		}
		// Range Box
		// lista range fino a 3 valori righe e poi lista
		var rangeList = treeList[0].getElementsByTagName('range');
		separator = document.createElement("separator");
		separator.setAttribute("class", "groove");
		separator.setAttribute("orient", "orizontal");
		parentBox.appendChild(separator);
		if (rangeList.length > 3) {
			typeToolbox = document.createElement("toolbox");
			typeToolbar = document.createElement("toolbar");
			typeToolbox.appendChild(typeToolbar);
			typeToolbar.appendChild(typeToolbarButton);
			typeToolbarButton = document.createElement("toolbarbutton");
			typeToolbarButton.setAttribute("image", "images/class_create.png");
			typeToolbarButton.setAttribute("onclick", "alert('add');");
			typeToolbarButton.setAttribute("tooltiptext", "Add Range");
			typeToolbar.appendChild(typeToolbarButton);
			typeToolbarButton2 = document.createElement("toolbarbutton");
			typeToolbarButton2.setAttribute("image", "images/class_delete.png");
			typeToolbarButton2.setAttribute("onclick", "removeRange('list');");
			typeToolbarButton2.setAttribute("tooltiptext", "Remove Range");
			if (userType != "Local User") {
				var typeToolbarButton3 = document.createElement("toolbarbutton");
				typeToolbarButton3.setAttribute("image", "images/snow.png");
				typeToolbarButton3.setAttribute("onclick", "freezeRange('list');");
				typeToolbar.setAttribute("tooltiptext", "Freeze");
				typeToolbar.appendChild(typeToolbarButton3);
				if (userType == "Simple User") {
					typeToolbarButton.setAttribute("hidden", "true");
					typeToolbarButton2.setAttribute("hidden", "true");
					typeToolbarButton3.setAttribute("hidden", "true");
				}
			}
			typeToolbar.appendChild(typeToolbarButton2);
			parentBox.appendChild(typeToolbox);
			var list = document.createElement("listbox");
			list.setAttribute("id", "rangesList");
			list.setAttribute("onclick", "listclick(event);");
			list.setAttribute("flex", "1");
			var listhead = document.createElement("listhead");
			var listheader = document.createElement("listheader");
			var listitem_iconic = document.createElement("listitem-iconic");
			// var image=document.createElement("image");
			// image.setAttribute("src","images/class.png");
			lbl2 = document.createElement("label");
			lbl2.setAttribute("value", "Ranges:");
			// listitem_iconic.appendChild(image);
			listitem_iconic.appendChild(lbl2);
			listheader.appendChild(listitem_iconic);
			listhead.appendChild(listheader);
			list.appendChild(listhead);
			parentBox.appendChild(list);
			for ( var k = 0; k < rangeList.length; k++) {
				if (rangeList[k].nodeType == 1) {
					lsti = document.createElement("listitem");
					lci = document.createElement("listitem-iconic");
					img = document.createElement("image");
					img.setAttribute("src", "images/class20x20.png");
					lci.appendChild(img);
					lbl = document.createElement("label");
					var value = rangeList[k].getAttribute("name");
					lsti.setAttribute("label", value);
					var explicit = rangeList[k].getAttribute("explicit");
					lsti.setAttribute("explicit", explicit);
					lbl.setAttribute("value", value);
					if (server != "127.0.0.1") {
						var hashUser = rangeList[k].getAttribute("hash");
						var founded = false;
						lbl.setAttribute("class", "base");
						for ( var it = 0; it < ress.hash.length; it++) {
							if (hashUser == ress.hash[it]) {
								founded = true;
								break;
							}
						}
						if (founded) {
							lbl.setAttribute("class", "c" + ress.colors[it]);
						}
					}
					lci.appendChild(lbl);
					lsti.appendChild(lci);
					list.appendChild(lsti);
				}
			}
		} else {
			// var lblic2=document.createElement("label-iconic");
			var lbl2 = document.createElement("label");
			var img2 = document.createElement("image");
			img2.setAttribute("src", "images/class20x20.png");
			lbl2.setAttribute("value", "Ranges:");
			var row3 = document.createElement("row");
			var box2 = document.createElement("box");
			// lblic2.appendChild(img2);
			// lblic2.appendChild(lbl2);
			row3.setAttribute("flex", "0");
			// typeToolbox=document.createElement("toolbox");
			// typeToolbar=document.createElement("toolbar");
			// typeToolbox.appendChild(typeToolbar);
			typeButton2 = document.createElement("toolbarbutton");
			typeButton2.setAttribute("image", "images/class_create.png");
			typeButton2.setAttribute("onclick", "insertRange();");
			typeButton2.setAttribute("tooltiptext", "Add Range");
			if (userType == "Simple User") {
				typeButton2.setAttribute("hidden", "true");
			}
			// typeToolbar.appendChild(typeButton2);
			box2.appendChild(typeButton2);
			box2.insertBefore(lbl2, typeButton2);
			box2.insertBefore(img2, lbl2);
			row3.appendChild(box2);
			parentBox.appendChild(row3);
			for ( var h = 0; h < rangeList.length; h++) {
				if (rangeList[h].nodeType == 1) {
					var value2 = rangeList[h].getAttribute("name");
					var txbox2 = document.createElement("textbox");
					txbox2.setAttribute("value", value2);
					txbox2.setAttribute("readonly", "true");
					txbox2.setAttribute("id", "tx" + value2);
					var typeButton3 = document.createElement("button");
					typeButton3.setAttribute("id", "typeButton");
					typeButton3.setAttribute("flex", "0");
					typeButton3.setAttribute("oncommand", "removeRange('" + value2 + "');");
					typeButton3.setAttribute("label", "Remove Range");
					var explicit = rangeList[h].getAttribute("explicit");
					if (explicit == "false") {
						typeButton3.setAttribute("disabled", "true");
					}
					if (userType == "Simple User") {
						typeButton3.setAttribute("disabled", "true");
					}
					var row4 = document.createElement("row");
					row4.setAttribute("id", value2);
					row4.appendChild(typeButton3);
					row4.insertBefore(txbox2, typeButton3);
					if (server != "127.0.0.1") {
						var hashUser = rangeList[h].getAttribute("hash");
						var founded = false;
						txbox2.setAttribute("class", "base");
						for ( var it = 0; it < ress.hash.length; it++) {
							if (hashUser == ress.hash[it]) {
								founded = true;
								break;
							}
						}
						if (founded) {
							txbox2.setAttribute("class", "c" + ress.colors[it]);
						}
						var freezeButton2 = document.createElement("button");
						freezeButton2.setAttribute("id", "freezeButton");
						freezeButton2.setAttribute("flex", "0");
						freezeButton2.setAttribute("oncommand", "freezeRange('" + value2 + "');");
						if (explicit == "false") {
							freezeButton2.setAttribute("disabled", "true");
						}
						if (userType == "Simple User") {
							freezeButton2.setAttribute("disabled", "true");
						}
						freezeButton2.setAttribute("image", "images/snow.png");
						row4.insertBefore(freezeButton2, typeButton3);

					}
					parentBox.appendChild(row4);
				}
			}
		}
	} else if (parameters.type == "DatatypeProperty") {
		// lista domini fino a 3 valori righe e poi lista
		if (domainNodeList.length > 3) {
			domainToolbox = document.createElement("toolbox");
			domainToolbar = document.createElement("toolbar");
			domainToolbox.appendChild(domainToolbar);
			domainToolbarButton = document.createElement("toolbarbutton");
			domainToolbarButton.setAttribute("image", "images/class_create.png");
			domainToolbarButton.setAttribute("onclick", "insertDomain();");
			domainToolbarButton.setAttribute("tooltiptext", "Add Domain");
			domainToolbar.appendChild(domainToolbarButton);
			domainToolbarButton2 = document.createElement("toolbarbutton");
			domainToolbarButton2.setAttribute("image", "images/class_delete.png");
			domainToolbarButton2.setAttribute("onclick", "removeDomain('list');");
			domainToolbarButton2.setAttribute("tooltiptext", "Remove Domain");
			if (userType != "Local User") {
				var domainToolbarButton3 = document.createElement("toolbarbutton");
				domainToolbarButton3.setAttribute("image", "images/snow.png");
				domainToolbarButton3.setAttribute("onclick", "freezeDomain('list');");
				domainToolbarButton3.setAttribute("tooltiptext", "Freeze");
				domainToolbar.appendChild(domainToolbarButton3);
				if (userType == "Simple User") {
					domainToolbarButton.setAttribute("hidden", "true");
					domainToolbarButton2.setAttribute("hidden", "true");
					domainToolbarButton3.setAttribute("hidden", "true");
				}
			}
			domainToolbar.appendChild(domainToolbarButton2);
			parentBox.appendChild(domainToolbox);
			var list = document.createElement("listbox");
			list.setAttribute("id", "domainsList");
			list.setAttribute("onclick", "listclick(event);");
			list.setAttribute("flex", "1");
			var listhead = document.createElement("listhead");
			var listheader = document.createElement("listheader");
			var listitem_iconic = document.createElement("listitem-iconic");
			// var image=document.createElement("image");
			// image.setAttribute("src","images/class.png");
			lbl2 = document.createElement("label");
			lbl2.setAttribute("value", "Domains:");
			// listitem_iconic.appendChild(image);
			listitem_iconic.appendChild(lbl2);
			listheader.appendChild(listitem_iconic);
			listhead.appendChild(listheader);
			list.appendChild(listhead);
			parentBox.appendChild(list);
			for ( var i = 0; i < domainNodeList.length; i++) {
				if (domainNodeList[i].nodeType == 1) {
					lsti = document.createElement("listitem");
					lci = document.createElement("listitem-iconic");
					img = document.createElement("image");
					img.setAttribute("src", "images/class20x20.png");
					lci.appendChild(img);
					lbl = document.createElement("label");
					var value = domainNodeList[i].getAttribute("name");
					lsti.setAttribute("label", value);
					var explicit = domainNodeList[i].getAttribute("explicit");
					lsti.setAttribute("explicit", explicit);
					lbl.setAttribute("value", value);
					if (server != "127.0.0.1") {
						var hashUser = domainNodeList[i].getAttribute("hash");
						var founded = false;
						lbl.setAttribute("class", "base");
						for ( var it = 0; it < ress.hash.length; it++) {
							if (hashUser == ress.hash[it]) {
								founded = true;
								break;
							}
						}
						if (founded) {
							lbl.setAttribute("class", "c" + ress.colors[it]);
						}
					}
					lci.appendChild(lbl);
					lsti.appendChild(lci);
					list.appendChild(lsti);
				}
			}
		} else {
			// var lblic=document.createElement("label-iconic");
			var lbl = document.createElement("label");
			var img = document.createElement("image");
			img.setAttribute("src", "images/class20x20.png");
			lbl.setAttribute("value", "Domains:");
			var row = document.createElement("row");
			var box = document.createElement("box");
			// lblic.appendChild(img);
			// lblic.appendChild(lbl);
			// lblic.setAttribute("flex","0");
			row.setAttribute("flex", "4");
			// domainToolbox=document.createElement("toolbox");
			// domainToolbar=document.createElement("toolbar");
			// domainToolbox.appendChild(domainToolbar);
			var domainButton = document.createElement("toolbarbutton");
			domainButton.setAttribute("onclick", "insertDomain();");
			domainButton.setAttribute("image", "images/class_create.png");
			domainButton.setAttribute("tooltiptext", "Add domain");
			if (userType == "Simple User") {
				domainButton.setAttribute("hidden", "true");
			}
			// domainToolbar.appendChild(domainButton);
			box.appendChild(domainButton);
			box.insertBefore(lbl, domainButton);
			box.insertBefore(img, lbl);
			row.appendChild(box);
			parentBox.appendChild(row);
			for ( var j = 0; j < domainNodeList.length; j++) {
				if (domainNodeList[j].nodeType == 1) {
					var value = domainNodeList[j].getAttribute("name");
					var txbox = document.createElement("textbox");
					txbox.setAttribute("value", value);
					txbox.setAttribute("explicit", explicit);
					txbox.setAttribute("readonly", "true");
					var domainButton = document.createElement("button");
					domainButton.setAttribute("id", "domainButton");
					domainButton.setAttribute("flex", "0");
					domainButton.setAttribute("oncommand", "removeDomain('" + value + "');");
					domainButton.setAttribute("label", "Remove Domain");
					domainButton.setAttribute("image", "images/class_delete.png");
					var explicit = domainNodeList[j].getAttribute("explicit");
					if (explicit == "false") {
						domainButton.setAttribute("disabled", "true");
					}
					if (userType == "Simple User") {
						domainButton.setAttribute("disabled", "true");
					}
					var row2 = document.createElement("row");
					row2.setAttribute("id", value);
					row2.appendChild(domainButton);
					row2.insertBefore(txbox, domainButton);
					if (server != "127.0.0.1") {
						var hashUser = domainNodeList[j].getAttribute("hash");
						var founded = false;
						txbox.setAttribute("class", "base");
						for ( var it = 0; it < ress.hash.length; it++) {
							if (hashUser == ress.hash[it]) {
								founded = true;
								break;
							}
						}
						if (founded) {
							txbox.setAttribute("class", "c" + ress.colors[it]);
						}
						var freezeButton = document.createElement("button");
						freezeButton.setAttribute("id", "freezeButton");
						freezeButton.setAttribute("flex", "0");
						freezeButton.setAttribute("oncommand", "freezeDomain('" + value + "');");
						if (explicit == "false") {
							freezeButton.setAttribute("disabled", "true");
						}
						if (userType == "Simple User") {
							freezeButton.setAttribute("disabled", "true");
						}
						freezeButton.setAttribute("image", "images/snow.png");
						row2.insertBefore(freezeButton, domainButton);
					}
					parentBox.appendChild(row2);
				}
			}
		}
		// Range value it's unique value
		var rangeList = treeList[0].getElementsByTagName('range');
		var lbl2 = document.createElement("label");
		var img2 = document.createElement("image");
		img2.setAttribute("src", "images/class20x20.png");
		lbl2.setAttribute("value", "Ranges:");
		var row3 = document.createElement("row");
		var box2 = document.createElement("box");
		// lblic2.appendChild(img2);
		// lblic2.appendChild(lbl2);
		row3.setAttribute("flex", "0");
		// typeToolbox=document.createElement("toolbox");
		// typeToolbar=document.createElement("toolbar");
		// typeToolbox.appendChild(typeToolbar);
		typeButton2 = document.createElement("toolbarbutton");
		typeButton2.setAttribute("image", "images/class_create.png");
		typeButton2.setAttribute("onclick", "insertRange();");
		typeButton2.setAttribute("tooltiptext", "Add Range");
		if (userType == "Simple User") {
			typeButton2.setAttribute("hidden", "true");
		}
		// typeToolbar.appendChild(typeButton2);
		box2.appendChild(typeButton2);
		box2.insertBefore(lbl2, typeButton2);
		box2.insertBefore(img2, lbl2);
		row3.appendChild(box2);
		parentBox.appendChild(row3);
		if (rangeList[0].nodeType == 1) {
			var value2 = rangeList[0].getAttribute("name");
			var txbox2 = document.createElement("textbox");
			txbox2.setAttribute("value", value2);
			txbox2.setAttribute("readonly", "true");
			txbox2.setAttribute("id", "tx" + value2);
			var typeButton3 = document.createElement("button");
			typeButton3.setAttribute("id", "typeButton");
			typeButton3.setAttribute("flex", "0");
			typeButton3.setAttribute("oncommand", "removeRange('" + value2 + "');");
			typeButton3.setAttribute("label", "Remove Range");
			var explicit = rangeList[0].getAttribute("explicit");
			if (explicit == "false") {
				typeButton3.setAttribute("disabled", "true");
			}
			if (userType == "Simple User") {
				typeButton3.setAttribute("disabled", "true");
			}
			var row4 = document.createElement("row");
			row4.setAttribute("id", value2);
			row4.appendChild(typeButton3);
			row4.insertBefore(txbox2, typeButton3);
			if (server != "127.0.0.1") {
				var hashUser = rangeList[0].getAttribute("hash");
				var founded = false;
				txbox2.setAttribute("class", "base");
				for ( var it = 0; it < ress.hash.length; it++) {
					if (hashUser == ress.hash[it]) {
						founded = true;
						break;
					}
				}
				if (founded) {
					txbox2.setAttribute("class", "c" + ress.colors[it]);
				}
				var freezeButton2 = document.createElement("button");
				freezeButton2.setAttribute("id", "freezeButton");
				freezeButton2.setAttribute("flex", "0");
				freezeButton2.setAttribute("oncommand", "freezeRange('" + value2 + "');");
				if (explicit == "false") {
					freezeButton2.setAttribute("disabled", "true");
				}
				if (userType == "Simple User") {
					freezeButton2.setAttribute("disabled", "true");
				}
				freezeButton2.setAttribute("image", "images/snow.png");
				row4.insertBefore(freezeButton2, typeButton3);
			}
			parentBox.appendChild(row4);
		}
	} else if (parameters.type == "AnnotationProperty") {
		// lista domini fino a 3 valori righe e poi lista
		if (domainNodeList.length > 3) {
			domainToolbox = document.createElement("toolbox");
			domainToolbar = document.createElement("toolbar");
			domainToolbox.appendChild(domainToolbar);
			domainToolbarButton = document.createElement("toolbarbutton");
			domainToolbarButton.setAttribute("image", "images/class_create.png");
			domainToolbarButton.setAttribute("onclick", "insertDomain();");
			domainToolbarButton.setAttribute("tooltiptext", "Add Domain");
			domainToolbar.appendChild(domainToolbarButton);
			domainToolbarButton2 = document.createElement("toolbarbutton");
			domainToolbarButton2.setAttribute("image", "images/class_delete.png");
			domainToolbarButton2.setAttribute("onclick", "removeDomain('list');");
			domainToolbarButton2.setAttribute("tooltiptext", "Remove Domain");
			if (userType != "Local User") {
				var domainToolbarButton3 = document.createElement("toolbarbutton");
				domainToolbarButton3.setAttribute("image", "images/snow.png");
				domainToolbarButton3.setAttribute("onclick", "freezeDomain('list');");
				domainToolbarButton3.setAttribute("tooltiptext", "Freeze");
				domainToolbar.appendChild(domainToolbarButton3);
				if (userType == "Simple User") {
					domainToolbarButton.setAttribute("hidden", "true");
					domainToolbarButton2.setAttribute("hidden", "true");
					domainToolbarButton3.setAttribute("hidden", "true");
				}
			}
			domainToolbar.appendChild(domainToolbarButton2);
			parentBox.appendChild(domainToolbox);
			var list = document.createElement("listbox");
			list.setAttribute("id", "domainsList");
			list.setAttribute("onclick", "listclick(event);");
			list.setAttribute("flex", "1");
			var listhead = document.createElement("listhead");
			var listheader = document.createElement("listheader");
			var listitem_iconic = document.createElement("listitem-iconic");
			// var image=document.createElement("image");
			// image.setAttribute("src","images/class.png");
			lbl2 = document.createElement("label");
			lbl2.setAttribute("value", "Domains:");
			// listitem_iconic.appendChild(image);
			listitem_iconic.appendChild(lbl2);
			listheader.appendChild(listitem_iconic);
			listhead.appendChild(listheader);
			list.appendChild(listhead);
			parentBox.appendChild(list);
			for ( var i = 0; i < domainNodeList.length; i++) {
				if (domainNodeList[i].nodeType == 1) {
					lsti = document.createElement("listitem");
					lci = document.createElement("listitem-iconic");
					img = document.createElement("image");
					img.setAttribute("src", "images/class20x20.png");
					lci.appendChild(img);
					lbl = document.createElement("label");
					var value = domainNodeList[i].getAttribute("name");
					lsti.setAttribute("label", value);
					lbl.setAttribute("value", value);
					if (server != "127.0.0.1") {
						var hashUser = domainNodeList[i].getAttribute("hash");
						var founded = false;
						lbl.setAttribute("class", "base");
						for ( var it = 0; it < ress.hash.length; it++) {
							if (hashUser == ress.hash[it]) {
								founded = true;
								break;
							}
						}
						if (founded) {
							lbl.setAttribute("class", "c" + ress.colors[it]);
						}
					}
					lci.appendChild(lbl);
					lsti.appendChild(lci);
					list.appendChild(lsti);
				}
			}
		} else {
			// var lblic=document.createElement("label-iconic");
			var lbl = document.createElement("label");
			var img = document.createElement("image");
			img.setAttribute("src", "images/class20x20.png");
			lbl.setAttribute("value", "Domains:");
			var row = document.createElement("row");
			var box = document.createElement("box");
			// lblic.appendChild(img);
			// lblic.appendChild(lbl);
			// lblic.setAttribute("flex","0");
			row.setAttribute("flex", "4");
			// domainToolbox=document.createElement("toolbox");
			// domainToolbar=document.createElement("toolbar");
			// domainToolbox.appendChild(domainToolbar);
			var domainButton = document.createElement("toolbarbutton");
			domainButton.setAttribute("onclick", "insertDomain();");
			domainButton.setAttribute("image", "images/class_create.png");
			domainButton.setAttribute("tooltiptext", "Add domain");
			if (userType == "Simple User") {
				domainButton.setAttribute("hidden", "true");
			}
			// domainToolbar.appendChild(domainButton);
			box.appendChild(domainButton);
			box.insertBefore(lbl, domainButton);
			box.insertBefore(img, lbl);
			row.appendChild(box);
			parentBox.appendChild(row);
			for ( var j = 0; j < domainNodeList.length; j++) {
				if (domainNodeList[j].nodeType == 1) {
					var value = domainNodeList[j].getAttribute("name");
					var txbox = document.createElement("textbox");
					txbox.setAttribute("value", value);
					txbox.setAttribute("id", "tx" + value);
					txbox.setAttribute("readonly", "true");
					var domainButton = document.createElement("button");
					domainButton.setAttribute("id", "domainButton");
					domainButton.setAttribute("flex", "0");
					domainButton.setAttribute("oncommand", "removeDomain('" + value + "');");
					domainButton.setAttribute("label", "Remove Domain");
					domainButton.setAttribute("image", "images/class_delete.png");
					if (userType == "Simple User") {
						domainButton.setAttribute("disabled", "true");
					}
					var row2 = document.createElement("row");
					row2.setAttribute("id", value);
					row2.appendChild(domainButton);
					row2.insertBefore(txbox, domainButton);
					if (server != "127.0.0.1") {
						var hashUser = domainNodeList[j].getAttribute("hash");
						var founded = false;
						txbox.setAttribute("class", "base");
						for ( var it = 0; it < ress.hash.length; it++) {
							if (hashUser == ress.hash[it]) {
								founded = true;
								break;
							}
						}
						if (founded) {
							txbox.setAttribute("class", "c" + ress.colors[it]);
						}
						var freezeButton2 = document.createElement("button");
						freezeButton2.setAttribute("id", "freezeButton");
						freezeButton2.setAttribute("flex", "0");
						freezeButton2.setAttribute("oncommand", "freezeDomain('" + value + "');");
						if (explicit == "false") {
							freezeButton2.setAttribute("disabled", "true");
						}
						if (userType == "Simple User") {
							freezeButton2.setAttribute("disabled", "true");
						}
						freezeButton2.setAttribute("image", "images/snow.png");
						row2.insertBefore(freezeButton2, domainButton);
					}
					parentBox.appendChild(row2);
				}
			}
		}// Range non si vede ed è sempre xsd:string
	}
	// FACETS
	if (parameters.type == "ObjectProperty") {
		facets = treeList[0].getElementsByTagName('facets');
		facetsList = facets[0].childNodes;
		rowBox = document.getElementById("rowsBox");
		ftitle = document.createElement("label");
		ftitle.setAttribute("value", "Facets:");
		var row = document.createElement("row");
		row.appendChild(ftitle);
		rowBox.appendChild(row);

		// functional, transitive, inverseFunctional symmetric
		var row = document.createElement("row");
		row.setAttribute("flex", "1");
		row.setAttribute("align", "start");
		row.setAttribute("pack", "start");
		var facetsBox = document.createElement("box");
		facetsBox.setAttribute("flex", "1");
		ckbox1 = document.createElement("checkbox");
		ckbox1.setAttribute("label", "functional");
		ckbox1.setAttribute("propertyName", "owl:FunctionalProperty");
		ckbox1.addEventListener('command', changeFacets, true);
		ckbox1.setAttribute("checked", "false");
		facetsBox.appendChild(ckbox1);

		ckbox2 = document.createElement("checkbox");
		ckbox2.setAttribute("label", "inverseFunctional");
		ckbox2.setAttribute("propertyName", "owl:InverseFunctionalProperty");
		ckbox2.addEventListener('command', changeFacets, true);
		ckbox2.setAttribute("checked", "false");
		facetsBox.insertBefore(ckbox2, ckbox1);

		ckbox3 = document.createElement("checkbox");
		ckbox3.setAttribute("label", "transitive");
		ckbox3.addEventListener('command', changeFacets, true);
		ckbox3.setAttribute("propertyName", "owl:TransitiveProperty");
		ckbox3.setAttribute("checked", "false");
		facetsBox.insertBefore(ckbox3, ckbox2);
		ckbox4 = document.createElement("checkbox");
		ckbox4.setAttribute("label", "symmetric");
		ckbox4.setAttribute("checked", "false");
		ckbox4.setAttribute("propertyName", "owl:SymmetricProperty");
		ckbox4.addEventListener('command', changeFacets, true);
		if (userType == "Simple User") {
			ckbox1.setAttribute("disabled", "true");
			ckbox2.setAttribute("disabled", "true");
			ckbox3.setAttribute("disabled", "true");
			ckbox4.setAttribute("disabled", "true");
		}
		facetsBox.insertBefore(ckbox4, ckbox3);
		rowBox.appendChild(facetsBox);
		// InverseOf
		var lbl = document.createElement("label");
		var img = document.createElement("image");
		img.setAttribute("src", "images/prop.png");
		lbl.setAttribute("value", "inverseOf");
		var row = document.createElement("row");
		var box = document.createElement("box");
		row.setAttribute("flex", "0");
		box.appendChild(lbl);
		box.insertBefore(img, lbl);
		// row.appendChild(box);
		// rowBox.appendChild(row);
		var titleBox = document.createElement("box");
		// inversePropertyToolbox=document.createElement("toolbox");
		// inversePropertyToolbar=document.createElement("toolbar");
		// inversePropertyToolbox.appendChild(inversePropertyToolbar);
		inversBtn = document.createElement("toolbarbutton");
		inversBtn.setAttribute("image", "images/prop_create.png");
		inversBtn.setAttribute("id", "addInverseOf");
		inversBtn.setAttribute("oncommand", "AddInverseOf();");
		inversBtn.setAttribute("tooltiptext", "Add New Property");
		inversBtn.setAttribute("disabled", "false");
		if (userType == "Simple User") {
			inversBtn.setAttribute("hidden", "true");
		}
		// inversePropertyToolbar.appendChild(inversBtn);
		titleBox.appendChild(inversBtn);
		titleBox.insertBefore(box, inversBtn);
		row.appendChild(titleBox);
		rowBox.appendChild(row);

		if (facetsList.length > 0) {
			for ( var i = 0; i < facetsList.length; i++) {
				if (facetsList[i].nodeType == 1 && facetsList[i].tagName == "inverseOf") {

					var valueList = facetsList[i].childNodes;

					if (valueList.length > 10) {
						inverseList = document.createElement("listbox");
						inverseList.setAttribute("id", "inverseList");
						inverseList.setAttribute("onclick", "listclick(event);");
						inverseList.setAttribute("flex", "1");
						remInverseBtn = document.createElement("toolbarbutton");
						remInverseBtn.setAttribute("image", "images/prop_delete.png");
						remInverseBtn.setAttribute("label", "Remove Value");
						remInverseBtn.setAttribute("id", "removeInverseOf");
						remInverseBtn.setAttribute("flex", "0");
						remInverseBtn.setAttribute("oncommand", "removeInverseOf('"
								+ inverseList.selectedItem.label + "');");
						remInverseBtn.setAttribute("tooltiptext", "Remove InverseOf value");
						if (userType == "Simple User") {
							remInverseBtn.setAttribute("disabled", "true");
						}
						titleBox.insertBefore(inversBtn, remInverseBtn);
						for ( var j = 0; j < valueList.length; j++) {
							if (valueList[j].nodeType == 1) {
								lsti = document.createElement("listitem");
								lci = document.createElement("listitem-iconic");
								img = document.createElement("image");
								img.setAttribute("src", "images/prop.png");
								lci.appendChild(img);
								lbl = document.createElement("label");
								var value = valueList[j].getAttribute("value");
								lbl.setAttribute("value", value);
								if (server != "127.0.0.1") {
									var hashUser = valueList[j].getAttribute("hash");
									var founded = false;
									lbl.setAttribute("class", "base");
									for ( var it = 0; it < ress.hash.length; it++) {
										if (hashUser == ress.hash[it]) {
											founded = true;
											break;
										}
									}
									if (founded) {
										lbl.setAttribute("class", "c" + ress.colors[it]);
									}
								}
								lci.appendChild(lbl);
								lsti.setAttribute("label", value);
								var explicit = valueList[j].getAttribute("explicit");
								lsti.setAttribute("explicit", explicit);
								lsti.appendChild(lci);
								inverseList.appendChild(lsti);
							}
						}
						var rowInv = document.createElement("row");
						rowInv.appendChild(propList);
						rowsBox.appendChild(rowInv);
					} else {
						for (k = 0; k < valueList.length; k++) {
							if (valueList[k].nodeType == 1) {
								var value = valueList[k].getAttribute("value");
								var inverseTxbox = document.createElement("textbox");
								inverseTxbox.setAttribute("id", "inverseOf");
								inverseTxbox.setAttribute("value", value);
								inverseTxbox.setAttribute("flex", "1");
								inverseTxbox.setAttribute("readonly", "true");
								inversBtn = document.getElementById("addInverseOf");
								// inversBtn.setAttribute("disabled","true");
								// inversePropertyToolbar.setAttribute("disabled","true");
								// var row2 = document.createElement("row");
								// row2.setAttribute("id",value);
								var inverseBox = document.createElement("box");
								inverseBox.setAttribute("flex", "1");
								// NScarpato 15/09/2008 added remove inverseOf
								// value Button
								remInverseBtn = document.createElement("button");
								remInverseBtn.setAttribute("image", "images/prop_delete.png");
								remInverseBtn.setAttribute("label", "Remove Value");
								remInverseBtn.setAttribute("id", "removeInverseOf");
								remInverseBtn.setAttribute("flex", "0");
								remInverseBtn.setAttribute("oncommand", "removeInverseOf('" + value + "');");
								remInverseBtn.setAttribute("tooltiptext", "Remove InverseOf value");
								if (userType == "Simple User") {
									remInverseBtn.setAttribute("disabled", "true");
								}
								inverseBox.appendChild(remInverseBtn);
								inverseBox.insertBefore(inverseTxbox, remInverseBtn);
								rowBox.appendChild(inverseBox);
							}
						}
					}
				} else if (facetsList[i].tagName == "functional") {
					ckbox1.setAttribute("checked", "true");
				} else if (facetsList[i].tagName == "inverseFunctional") {
					ckbox2.setAttribute("checked", "true");
				} else if (facetsList[i].tagName == "transitive") {
					ckbox3.setAttribute("checked", "true");
				} else if (facetsList[i].tagName == "symmetric") {
					ckbox4.setAttribute("checked", "true");
				}
			}
		}

	}
	// NScarpato add property
	var rowsBox = document.getElementById("rowsBox");
	if (parameters.type == "ObjectProperty" || parameters.type == "ObjectProperty_noexpl") {
		var sep = document.createElement("separator");
		sep.setAttribute("orient", "orizontal");
		sep.setAttribute("class", "groove");
		rowsBox.appendChild(sep);
	}
	var properties = treeList[0].getElementsByTagName('Properties');
	var propertyList = properties[0].getElementsByTagName('Property');
	// NScarpato 26/03/2008 add title and addNewProperty option for property of
	// instance
	var propTitle = document.createElement("label");
	propTitle.setAttribute("value", "Properties:");
	var rowTitle = document.createElement("row");
	rowTitle.setAttribute("align", "center");
	rowTitle.setAttribute("pack", "center");
	rowTitle.setAttribute("flex", "0");
	var titleBox = document.createElement("box");
	// propertyTitleToolbox=document.createElement("toolbox");
	// propertyTitleToolbar=document.createElement("toolbar");
	// propertyTitleToolbox.appendChild(propertyTitleToolbar);
	typeTitleToolbarButton = document.createElement("toolbarbutton");
	typeTitleToolbarButton.setAttribute("image", "images/prop_create.png");
	typeTitleToolbarButton.setAttribute("onclick", "AddNewProperty();");
	typeTitleToolbarButton.setAttribute("tooltiptext", "Add New Property");
	if (userType == "Simple User") {
		typeTitleToolbarButton.setAttribute("hidden", "true");
	}
	// propertyTitleToolbar.appendChild(typeTitleToolbarButton);
	titleBox.appendChild(typeTitleToolbarButton);
	titleBox.insertBefore(propTitle, typeTitleToolbarButton);
	rowTitle.appendChild(titleBox);
	rowsBox.appendChild(rowTitle);
	for ( var i = 0; i < propertyList.length; i++) {
		if (propertyList[i].nodeType == 1) {
			var nameValue = propertyList[i].getAttribute("name");
			var typeValue = propertyList[i].getAttribute("type");
			var row = document.createElement("row");
			var box3 = document.createElement("box");

			// propertyToolbox=document.createElement("toolbox");
			// propertyToolbar=document.createElement("toolbar");
			// propertyToolbox.appendChild(propertyToolbar);
			if (typeValue == "owl:ObjectProperty") {
				typeToolbarButton = document.createElement("toolbarbutton");
				typeToolbarButton.setAttribute("image", "images/propObject_create.png");
				typeToolbarButton.setAttribute("onclick", "createAndAddPropValue('" + nameValue + "','"
						+ typeValue + "');");
				typeToolbarButton.setAttribute("tooltiptext", "Add and Create Value");
				if (userType == "Simple User") {
					typeTitleToolbarButton.setAttribute("hidden", "true");
				}
				box3.appendChild(typeToolbarButton);
				
				 * typeToolbarButton1=document.createElement("toolbarbutton");
				 * typeToolbarButton1.setAttribute("image","images/addExistingObjectPropertyValue.GIF");
				 * typeToolbarButton1.setAttribute("onclick","addExistingPropValue('"+nameValue+"');");
				 * typeToolbarButton1.setAttribute("tooltiptext","Add Value");
				 * propertyToolbar.appendChild(typeToolbarButton1);
				 
			} else if (typeValue == "owl:DatatypeProperty") {
				typeToolbarButton = document.createElement("toolbarbutton");
				typeToolbarButton.setAttribute("image", "images/propDatatype_create.png");
				typeToolbarButton.setAttribute("onclick", "createAndAddPropValue('" + nameValue + "','"
						+ typeValue + "');");
				typeToolbarButton.setAttribute("tooltiptext", "Add Value");
				if (userType == "Simple User") {
					typeTitleToolbarButton.setAttribute("hidden", "true");
				}
				box3.appendChild(typeToolbarButton);
			} else if (typeValue == "owl:AnnotationProperty") {
				typeToolbarButton = document.createElement("toolbarbutton");
				typeToolbarButton.setAttribute("image", "images/propAnnotation_create.png");
				typeToolbarButton.setAttribute("onclick", "createAndAddPropValue('" + nameValue + "','"
						+ typeValue + "');");
				typeToolbarButton.setAttribute("tooltiptext", "Add Value");
				if (userType == "Simple User") {
					typeTitleToolbarButton.setAttribute("hidden", "true");
				}
				box3.appendChild(typeToolbarButton);

			} else {
				typeToolbarButton = document.createElement("toolbarbutton");
				typeToolbarButton.setAttribute("image", "images/prop20x20.png");
				typeToolbarButton.setAttribute("onclick", "createAndAddPropValue('" + nameValue + "','"
						+ typeValue + "');");
				typeToolbarButton.setAttribute("tooltiptext", "Add Value");
				if (userType == "Simple User") {
					typeTitleToolbarButton.setAttribute("hidden", "true");
				}
				box3.appendChild(typeToolbarButton);
			}

			var lblic = document.createElement("label-iconic");
			var lbl = document.createElement("label");
			var img = document.createElement("image");
			if (typeValue == "owl:ObjectProperty") {
				img.setAttribute("src", "images/propObject20x20.png");
				img.setAttribute("flex", "0");
				lbl.setAttribute("value", nameValue);
			} else if (typeValue == "owl:DatatypeProperty") {
				img.setAttribute("src", "images/propDatatype20x20.png");
				img.setAttribute("flex", "0");
				lbl.setAttribute("value", nameValue);
			} else if (typeValue == "owl:AnnotationProperty") {
				img.setAttribute("src", "images/propAnnotation20x20.png");
				img.setAttribute("flex", "0");
				lbl.setAttribute("value", nameValue);
			} else {
				img.setAttribute("src", "images/prop20x20.png");
				img.setAttribute("flex", "0");
				lbl.setAttribute("value", nameValue);
			}

			lblic.appendChild(img);
			lblic.appendChild(lbl);
			box3.insertBefore(lblic, typeToolbarButton);
			row.setAttribute("flex", "0");
			row.appendChild(box3);
			rowsBox.appendChild(row);
			valueList = propertyList[i].getElementsByTagName('Value');
			if (valueList.length > 10) {
				if (typeValue == "owl:ObjectProperty") {
					typeToolbarButton2 = document.createElement("toolbarbutton");
					typeToolbarButton2.setAttribute("image", "images/individual_remove.png");
					typeToolbarButton2.setAttribute("onclick", "removePropValue('list','" + nameValue + "','"
							+ typeValue + "');");
					typeToolbarButton2.setAttribute("tooltiptext", "Remove Value");
					if (userType == "Simple User") {
						typeTitleToolbarButton2.setAttribute("hidden", "true");
					}
					propertyToolbar.appendChild(typeToolbarButton2);
				} else if (typeValue == "owl:DatatypeProperty") {
					typeToolbarButton2 = document.createElement("toolbarbutton");
					// typeToolbarButton2.setAttribute("image","images/prop_delete.png");
					typeToolbarButton2.setAttribute("onclick", "removePropValue('list','" + nameValue + "','"
							+ typeValue + "');");
					typeToolbarButton2.setAttribute("tooltiptext", "Remove Value");
					if (userType == "Simple User") {
						typeTitleToolbarButton2.setAttribute("hidden", "true");
					}
					propertyToolbar.appendChild(typeToolbarButton2);
				} else if (typeValue == "owl:AnnotationProperty") {
					typeToolbarButton2 = document.createElement("toolbarbutton");
					// typeToolbarButton2.setAttribute("image","images/prop_delete.png");
					typeToolbarButton2.setAttribute("onclick", "removePropValue('list','" + nameValue + "','"
							+ typeValue + "');");
					typeToolbarButton2.setAttribute("tooltiptext", "Remove Value");
					if (userType == "Simple User") {
						typeTitleToolbarButton2.setAttribute("hidden", "true");
					}
					propertyToolbar.appendChild(typeToolbarButton2);
				} else {
					typeToolbarButton2 = document.createElement("toolbarbutton");
					// typeToolbarButton2.setAttribute("image","images/prop_delete.png");
					typeToolbarButton2.setAttribute("onclick", "removePropValue('list','" + nameValue + "','"
							+ typeValue + "');");
					typeToolbarButton2.setAttribute("tooltiptext", "Remove Value");
					if (userType == "Simple User") {
						typeTitleToolbarButton2.setAttribute("hidden", "true");
					}
					propertyToolbar.appendChild(typeToolbarButton2);
				}
				if (userType != "Local User") {
					var typeToolbarButton3 = document.createElement("toolbarbutton");
					typeToolbarButton3.setAttribute("image", "images/snow.png");
					typeToolbarButton3.setAttribute("onclick", "freezePropValue('list','" + nameValue + "','"
							+ typeValue + "');");
					typeToolbarButton3.setAttribute("tooltiptext", "Freeze");
					propertyToolbar.appendChild(typeToolbarButton3);
					if (userType == "Simple User") {
						typeToolbarButton3.setAttribute("hidden", "true");
					}
				}
				propList = document.createElement("listbox");
				propList.setAttribute("id", "propList");
				propList.setAttribute("onclick", "listclick(event);");
				if (typeValue == "owl:ObjectProperty") {
					propList.setAttribute("ondblclick", "listdblclick(event);");
				}
				propList.setAttribute("flex", "1");
				for ( var j = 0; j < valueList.length; j++) {
					lsti = document.createElement("listitem");
					lci = document.createElement("listitem-iconic");
					img = document.createElement("image");
					img.setAttribute("src", "images/individual.png");
					lci.appendChild(img);
					lbl = document.createElement("label");
					var value = valueList[j].getAttribute("value");
					// NScarpato 25/03/2008
					if (typeValue == "owl:AnnotationProperty") {
						var lang = valueList[j].getAttribute("lang");
						lbl.setAttribute("value", value + " (language: " + lang + ")");
						lsti.setAttribute("language", lang);
						lsti.setAttribute("typeValue", typeValue);
					} else {
						lbl.setAttribute("value", value);
					}
					if (server != "127.0.0.1") {
						var hashUser = valueList[j].getAttribute("hash");
						var founded = false;
						lbl.setAttribute("class", "base");
						for ( var it = 0; it < ress.hash.length; it++) {
							if (hashUser == ress.hash[it]) {
								founded = true;
								break;
							}
						}
						if (founded) {
							lbl.setAttribute("class", "c" + ress.colors[it]);
						}
					}
					lci.appendChild(lbl);
					lsti.setAttribute("label", value);
					var explicit = valueList[j].getAttribute("explicit");
					lsti.setAttribute("explicit", explicit);
					lsti.appendChild(lci);
					propList.appendChild(lsti);
				}
				var row2 = document.createElement("row");
				row2.appendChild(propList);
				rowsBox.appendChild(row2);
			} else {
				for ( var j = 0; j < valueList.length; j++) {
					if (valueList[j].nodeType == 1) {
						value = valueList[j].getAttribute("value");
						var explicit = valueList[j].getAttribute("explicit");
						var valueType = valueList[j].getAttribute("type");
						row2 = document.createElement("row");
						txbox = document.createElement("textbox");
						txbox.setAttribute("id", value);
						txbox.setAttribute("typeValue", typeValue);
						if (typeValue == "owl:AnnotationProperty") {
							var lang = valueList[j].getAttribute("lang");
							txbox.setAttribute("value", value + " (language: " + lang + ")");
							txbox.setAttribute("language", lang);

						} else {
							txbox.setAttribute("value", value);
						}
						txbox.setAttribute("readonly", "true");
						propButton = document.createElement("button");
						propButton.setAttribute("flex", "0");
						if (valueType == "rdfs:Resource") {
							propButton.setAttribute("image", "images/individual_remove.png");
							var resImg = document.createElement("image");
							resImg.setAttribute("src", "images/individual20x20.png");
							// resImg.setAttribute("ondblclick","resourcedblClick('"+explicit+"','"+value+"');");
							txbox.setAttribute("tooltiptext", "Editable Resource");
							txbox.setAttribute("onclick", "resourcedblClick('" + explicit + "','" + value
									+ "');");
							txbox.setAttribute("onmouseover", "setCursor('pointer')");
							resImg.setAttribute("onmouseover", "setCursor('pointer')");
							txbox.setAttribute("onmouseout", "setCursor('default')");
						} else if (typeValue == "owl:DatatypeProperty") {
							// propButton.setAttribute("image","images/prop_delete.png");
						} else if (typeValue == "owl:AnnotationProperty") {
							// propButton.setAttribute("image","images/prop_delete.png");
							if (nameValue == "rdfs:comment") {
								txbox.setAttribute("cols", "1");
								txbox.setAttribute("rows", "3");
								txbox.setAttribute("wrap", "on");
								txbox.setAttribute("multiline", "true");
							}
						} else {
							// propButton.setAttribute("image","images/prop_delete.png");
						}
						if (userType == "Simple User") {
							propButton.setAttribute("disabled", "true");
						}
						propButton.setAttribute("oncommand", "removePropValue('" + value + "','" + nameValue
								+ "','" + typeValue + "');");
						propButton.setAttribute("label", "Remove Value");
						if (explicit == "false") {
							propButton.setAttribute("disabled", "true");
						}
						row2.appendChild(propButton);
						if (valueType == "rdfs:Resource") {
							
							 * resToolbar=document.createElement("toolbar");
							 * resToolbar.appendChild(editToolbarButton);
							 * resToolbar.appendChild(txbox);
							 * resToolbar.setAttribute("flex","0");
							 * row2.insertBefore(txbox,propButton);
							 * row2.insertBefore(resToolbar,txbox);
							 
							txbox.appendChild(resImg);
						}// else{
						row2.insertBefore(txbox, propButton);
						// }
						rowsBox.appendChild(row2);
					}
				}
			}

		}
	}

}
*/