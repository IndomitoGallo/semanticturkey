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
const USER_AGENT = "Semantic Turkey";
const RESULT_OK = 0;
const RESULT_PARSE_ERROR = 1;
const RESULT_NOT_FOUND = 2;
const RESULT_NOT_AVAILABLE = 3;
const RESULT_ERROR_FAILURE = 4;
const RESULT_NOT_RSS = 5;

/*
 * var mainLoader =
 * Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
 * 
 * const log4jsberlURL =
 * 'chrome://semantic-turkey/content/scripts/lib/log4js(berlios)/log4js-lib.js';
 * //mainLoader.loadSubScript(log4jsberl);
 * 
 * const testjsURL = "chrome://semantic-turkey/content/scripts/lib/test.js";
 * mainLoader.loadSubScript(testjsURL);
 * 
 * const log4jsURL =
 * 'chrome://semantic-turkey/content/scripts/lib/log4js/log4js-mini.js';
 * mainLoader.loadSubScript(log4jsURL);
 * 
 * var httpLogger = new Log4js.getLogger("httpLogging");
 * httpLogger.setLevel(Log4js.Level.DEBUG); httpLogger.addAppender(new
 * Log4js.MozillaJSConsoleAppender());
 * 
 * httpLogger.info('an info');
 */

var responseXML;
// TODO i've to remove this global variable, which is only used by httploaded(e)
var parameters;

function _printToJSConsole(msg) {
	// Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService).logStringMessage(msg);
}

/*
 * function httpGetC(aURL, async, parameters) { if(NSIsSelected()== false){
 * window.openDialog("chrome://semantic-turkey/content/initialize.xul","_blank","modal=yes,resizable,centerscreen"); }
 * if(isRepLoaded() == false && aURL.indexOf("repositoryChoice") == -1){ // The
 * message will not be sent to the server return; }
 * 
 * httpGet(aURL, async, parameters); }
 */

function httpGetP(aURL, async, parameters) {
	httpGet(aURL, async, parameters);
}

/**
 * 
 * @param aURL
 * @param async
 *            true=asynchronous call, if invoked with only one parameter, it
 *            behaves as for the XMLHttpRequest.open() called with two
 *            parameters
 * @return
 */
function httpGet(aURL, async, parameters) {
	_printToJSConsole("httpGet( " + aURL + ") async:" + async + " parameters: "
			+ parameters);
	progressMeters = null;
	this.parameters = parameters;
	responseXML = null;
	// NScarpato add try/catch block for BridgeComponents
	try {
		httpReq = new XMLHttpRequest();
	} catch (e) {
		httpReq = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
				.createInstance();
	}

	// nasty hack: in Firefox http.open() with two parameters behaves as if
	// async were true, but if you called httpReq.open("GET", aURL, "undefined")
	// then it would behave as if async were false
	if (typeof async == 'undefined') {
		httpReq.open("GET", aURL);
	} else {
		httpReq.open("GET", aURL, async);
	}

	httpReq.onprogress = httpProgress;
	httpReq.onload = httpLoaded;
	httpReq.onerror = httpError;
	httpReq.onreadystatechange = httpReadyStateChange;
	// FINO QUI VECCHIO

	/*
	 * httpReq =
	 * Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(); //
	 * QI the object to nsIDOMEventTarget to set event handlers on it:
	 * httpReq.QueryInterface(Components.interfaces.nsIDOMEventTarget);
	 * progressMeters=null; httpReq.onprogress = onProgress;
	 * httpReq.addEventListener("load", httpLoaded, false);
	 * httpReq.addEventListener("error", httpError, false);
	 * httpReq.onreadystatechange = httpReadyStateChange;
	 * //httpReq.addEventListener("readystatechange", httpReadyStateChange,
	 * false); // QI it to nsIXMLHttpRequest to open and send the request:
	 * 
	 * httpReq.QueryInterface(Components.interfaces.nsIXMLHttpRequest);
	 * 
	 * if (typeof async == 'undefined') { _printToJSConsole("siamo in
	 * undefined"); httpReq.open("GET", aURL); } else { _printToJSConsole("async
	 * è definito come " + async); httpReq.open("GET", aURL, async); } //FINO
	 * QUI
	 */
	try {
		httpReq.setRequestHeader("User-Agent", USER_AGENT);
		httpReq.setRequestHeader("Content-Type", "application/xml")
		httpReq.overrideMimeType("application/xml");
	} catch (e) {
		httpGetResult(RESULT_ERROR_FAILURE);
	}

	try {
		httpReq.send(null);
	} catch (e) {
		httpGetResult(RESULT_ERROR_FAILURE);
	}
}

/**
 * @author NScarpato 02/04/2008 onProgress add onProgress event for http request
 */
function httpProgress(e) {
	if (progressMeters == null) {
		progressMeters = window.openDialog(
				"chrome://semantic-turkey/content/progressMeters.xul",
				"_blank", "modal=no,resizable,centerscreen");
	}
	_printToJSConsole("onProgress");
	_printToJSConsole("event " + e);
	var percentComplete = (e.position / e.totalSize) * 100;
	_printToJSConsole("% in on progress" + percentComplete + " scaricati "
			+ e.position + " di " + e.totalSize);

}
function httpLoaded(e) {
	if (progressMeters != null) {
		progressMeters.close();
	}
	_printToJSConsole("httploaded, e = " + e + ", parameters: " + parameters);
	responseXML = httpReq.responseXML;
	var rootNodeName = responseXML.documentElement.localName.toLowerCase();
	switch (rootNodeName) {
		case "tree" : {
			if (typeof parameters == 'undefined')
				httpGetResult(RESULT_OK);
			else
				httpGetResultP(RESULT_OK, parameters);
		}
			break;
		default :
			// Not RSS or Atom
			httpGetResult(RESULT_NOT_RSS);
			break;
	}
}

function httpError(e) {
	logMessage("HTTP Error: " + e.target.status + " - " + e.target.statusText);
	httpGetResult(RESULT_NOT_AVAILABLE);
}

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

/**
 * NScarpato 19/03/2007 aggiunta funzione httpGetResultP funzione che permette
 * di passare alcuni parametri utili per la parte grafica (client side) ad
 * esempio il nome della classe nell'albero completo di numero delle istanze tra
 * parentesi che va cambiato dopo una operazione che cambia il numero delle
 * istanze
 */
function httpGetResultP(aResultCode, parameters) {
	httpReq.abort();
	if (aResultCode == RESULT_OK) {
		var treeList = responseXML.getElementsByTagName('Tree');
		var attr = treeList[0].getAttribute('type');
		// NScarpato 29/04/2008 change implementation of repository list
		if (attr == "repository_list") {
			populateRepositoryList(treeList);
		} else if (attr == "create_cls") {
			createCls(treeList);
		}// NScarpato 21/04/2008 add getNs
		else if (attr == "getDefaultNamespace") {
			dn = treeList[0].getElementsByTagName('DefaultNamespace')[0];
			parameters.ns = dn.getAttribute('ns');
		}// NScarpato 02/04/2008 add getNs
		else if (attr == "update_cls") {
			var clsNodeName = treeList[0].getElementsByTagName('Class')[0]
					.getAttribute("clsName");
			var numTotInst = treeList[0].getElementsByTagName('Class')[0]
					.getAttribute("numTotInst");
			var numTot = numTotInst - 1
			var treecellNodes;
			var iconicName = clsNodeName;
			if (numTot != 0) {
				var iconicName = clsNodeName + "(" + numTot + ")";
			}
			var newIconicName = clsNodeName + "(" + numTotInst + ")";
			treecellNodes = parameters.tree.getElementsByTagName("treecell");
			for (var i = 0; i < treecellNodes.length; i++) {
				if (treecellNodes[i].getAttribute("label") == iconicName) {
					treecellNodes[i].setAttribute("label", newIconicName);
					treecellNodes[i]
							.setAttribute("numTotInst", "" + numTotInst);
					// break;
				}
			}
			var par=new Object();
			par.list=parameters.list;
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&clsName="
							+ encodeURIComponent(clsNodeName), false,par);
		}// END UPDATE
		else if (attr == "Instpanel") {
			
			var list = parameters.list;
			rows = list.getRowCount();
			while (rows--) {
				list.removeItemAt(rows);
			}
			myClass = treeList[0].getElementsByTagName('Class')[0]
					.getAttribute("name");
			numTotInst = treeList[0].getElementsByTagName('Class')[0]
					.getAttribute("numTotInst");
			list.getElementsByTagName('listheader')[0]
					.getElementsByTagName('listitem-iconic')[0]
					.getElementsByTagName('label')[0].setAttribute("value",
					"Individuals of " + myClass);
			list.getElementsByTagName('listheader')[0].setAttribute(
					"parentCls", myClass);
			list.getElementsByTagName('listheader')[0].setAttribute(
					"numTotInst", numTotInst);
			instancesList = treeList[0].getElementsByTagName('Instance');
			for (var i = 0; i < instancesList.length; i++) {
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
		}
		else if (attr == "getBaseURI") {
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
		}// NScarpato 28/04/2008 add start function
		else if (attr == "startResponse") {
			manageStartST();
		}
		// NScarpato 12/07/2007 add getNsPrefixMapping service for import panel
		else if (attr == "getNSPrefixMappings") {
			getNSPrefixMappings(treeList);
		}
		// NScarpato 19/07/2007 add get_imports service for import panel
		else if (attr == "imports") {
			imports(treeList);
		} else if (attr == "AllPropertiesTree") {
			// NScarpato 04/04/2008
			var node = getthetree().getElementsByTagName('treechildren')[0];
			var propertyList;
			for (var i = 0; i < treeList.length; i++) {
				if (treeList[i].nodeType == 1) {
					propertyList = treeList[i].childNodes;
				}
			}
			for (var i = 0; i < propertyList.length; i++) {
				if (propertyList[i].nodeType == 1) {
					var type = propertyList[i].getAttribute("type");
					if (type == "owl:ObjectProperty") {
						parsingProperties(propertyList[i], node);
					}
				}
			}
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
			var type = treeList[0].getElementsByTagName('Resource')[0]
					.getAttribute("type");
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
			for (var i = 0; i < classList.length; i++) {
				if (classList[i].nodeType == 1) {
					range = classList[i].getAttribute("name")
				}
			}
		}// NScarpato 14/03/2008 change update_modify to make refresh on:
			// class tree property tree and instance list
		else if (attr == "update_modify") {
			var resourceNode = treeList[0]
					.getElementsByTagName('UpdateResource')[0];
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
				for (var i = 0; i < treecellNodes.length; i++) { // does not
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
				for (var i = 0; i < listItemList.length; i++) {
					if (listItemList[i].getAttribute("label") == iconicName) {
						listItemList[i].setAttribute("label", newName);
						listItIc = listItemList[i]
								.getElementsByTagName("listitem-iconic");
						listItIc[0].getElementsByTagName("label")[0]
								.setAttribute("value", newName);
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
				for (var i = 0; i < treecellNodes.length; i++) { // does not
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
		} /**
		 * Pagina delle webPage
		 * 
		 * @author NScarpato 13/04/2007
		 */

		else if (attr == "webPage") {
			labelBox = parameters.labelBox;
			urlList = treeList[0].getElementsByTagName('URL');
			for (var i = 0; i < urlList.length; i++) {
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
		}/*******************************************************************
			 * @author NScarpato 11/06/2007 END webPage
			 */
		/**
		 * @author NScarpato 03/03/2008 change search panel
		 */
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
				window.openDialog(
						"chrome://semantic-turkey/content/search.xul",
						"_blank", "modal=yes,resizable,centerscreen",
						parameters);
			} else {
				var resType = foundList[0].getAttribute("type");
				var resName = foundList[0].getAttribute("name");
				var callPanel = parameters.callPanel;
				var param = new Object();
				param.typeName = "none";
				httpGet(
						"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=individual&request=get_directNamedTypes&indqname="
								+ encodeURIComponent(resName), false, param);
				var typeName = param.typeName;
				searchFocus(resType, resName, callPanel, typeName);
			}

		}/*
			 * NScarpato 15/11/2007 add request for range on annotator panel
			 * else if (attr == "property_dscr") { var
			 * rangeNode=treeList[0].getElementsByTagName('range'); var
			 * range=rangeNode[0].getAttribute("name");
			 * parameters.reqparameters.objectClsName=range; var
			 * domainNode=treeList[0].getElementsByTagName('domain'); var
			 * domain=rangeNode[0].getAttribute("name");
			 * parameters.reqparameters.domain=domain; }
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
					tr.appendChild(tc);
					var ti = document.createElement("treeitem");
					ti.appendChild(tr);
					var tch = document.createElement("treechildren");
					ti.appendChild(tch);
					node.appendChild(ti);
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
					tr.appendChild(tc);
					ti.setAttribute('container', 'false');
					ti.setAttribute('open', 'false');
					ti.appendChild(tr);
					var treecellNodes;
					treecellNodes = tree.getElementsByTagName("treecell");
					var targetNode = null;
					for (var i = 0; i < treecellNodes.length; i++) {
						if (treecellNodes[i].getAttribute("label") == iconicName) {
							targetNode = treecellNodes[i].parentNode.parentNode;
							break;
						}
					}

					var treechildren = targetNode
							.getElementsByTagName('treechildren')[0];
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
			typeName = treeList[0].getElementsByTagName('Type')[0]
					.getAttribute("qname");
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
				httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=individual&request=getIndDescription&instanceQName="
						+ encodeURIComponent(parameters.sourceElementName)
						+ "&method=templateandvalued");
			} else {
				httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&request=getClsDescription&clsName="
						+ encodeURIComponent(parameters.sourceElementName)
						+ "&method=templateandvalued");
			}

		} else if (attr == "add_type") {
			typeName = treeList[0].getElementsByTagName('Type')[0]
					.getAttribute("qname");
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
				httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=individual&request=getIndDescription&instanceQName="
						+ encodeURIComponent(parameters.sourceElementName)
						+ "&method=templateandvalued");
			} else {
				httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&request=getClsDescription&clsName="
						+ encodeURIComponent(parameters.sourceElementName)
						+ "&method=templateandvalued");
			}
		} else if (attr == "get_types") {
			// add only first type for search
			typeName = treeList[0].getElementsByTagName('Type')[0]
					.getAttribute("qname");
			parameters.typeName = typeName;
		} else if (attr == "getMirrorTable")
			populateMirrorTable(parameters, treeList);

	} else if (aResultCode == RESULT_ERROR_FAILURE) {
		alert("aResultCode == RESULT_ERROR_FAILURE");
	}// END RESULT_ERROR_FAILURE
}

function httpGetResult(aResultCode) {
	httpReq.abort();
	if (aResultCode == RESULT_OK) {
		var treeList = responseXML.getElementsByTagName('Tree');
		var attr = treeList[0].getAttribute('type');
		if (attr == "ClassesTree") {
			var node = getthetree().getElementsByTagName('treechildren')[0];
			var classList;

			for (var i = 0; i < treeList.length; i++) {
				if (treeList[i].nodeType == 1) {
					classList = treeList[i].childNodes;
				}
			}
			for (var i = 0; i < classList.length; i++) {
				if (classList[i].nodeType == 1) {
					parsing(classList[i], node, true);

				}
			}
			// parseXMLSource(getthetree());
		}// END PANEL
		/***********************************************************************
		 * @author NScarpato riempie la lista delle istanze
		 */
		else if (attr == "error") {
			var errorNode = treeList[0].getElementsByTagName('Error')[0];
			alert("Error: " + errorNode.getAttribute("value"));
		}// END error
		else if (attr == "AckMsg") {
			var msg = treeList[0].getElementsByTagName('Msg')[0];
			if (msg.getAttribute("content") != "") {
				alert(msg.getAttribute("content"));
			}
			window.location.reload();

		} else if (attr == "Ack") {
			var req = treeList[0].getAttribute('request');
			if (req == "chkAnnotations") {
				var res = treeList[0].getElementsByTagName('result')[0];
				var act = res.getAttribute("status");
				active(act);
			} else {
				var msg = treeList[0].getElementsByTagName('Msg')[0];
				if (msg.getAttribute("content") != "") {
					alert(msg.getAttribute("content"));
				}
			}
		} else if (attr == "save_repository") {
			var msg = treeList[0].getElementsByTagName('msg')[0];
			alert(msg.getAttribute("content"));
			close();
		} else if (attr == "load_repository") {
			var msg = treeList[0].getElementsByTagName('msg')[0];
			alert(msg.getAttribute("content"));
			close();
		} else if (attr == "clear_repository") {
			var msg = treeList[0].getElementsByTagName('msg')[0];
			alert(msg.getAttribute("content")
					+ " Mozilla Firefox will be restart");
			// NScarpato 21/05/2008 add restarting
			var nsIAppStartup = Components.interfaces.nsIAppStartup;
			Components.classes["@mozilla.org/toolkit/app-startup;1"]
					.getService(nsIAppStartup).quit(nsIAppStartup.eForceQuit
							| nsIAppStartup.eRestart);
		} else if (attr == "Instpanel") {
			var list = gettheList();
			rows = list.getRowCount();
			while (rows--) {
				list.removeItemAt(rows);
			}
			myClass = treeList[0].getElementsByTagName('Class')[0]
					.getAttribute("name");
			numTotInst = treeList[0].getElementsByTagName('Class')[0]
					.getAttribute("numTotInst");
			list.getElementsByTagName('listheader')[0]
					.getElementsByTagName('listitem-iconic')[0]
					.getElementsByTagName('label')[0].setAttribute("value",
					"Individuals of " + myClass);
			list.getElementsByTagName('listheader')[0].setAttribute(
					"parentCls", myClass);
			list.getElementsByTagName('listheader')[0].setAttribute(
					"numTotInst", numTotInst);
			instancesList = treeList[0].getElementsByTagName('Instance');
			for (var i = 0; i < instancesList.length; i++) {
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
		 * typeName=find.getAttribute("typeName"); //NScarpato 22/05/2007
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
			for (var i = 0; i < urlList.length; i++) {
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
			for (var i = 0; i < propertyList.length; i++) {
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
			for (var i = 0; i < treeList.length; i++) {
				if (treeList[i].nodeType == 1) {
					propertyList = treeList[i].childNodes;
				}
			}
			for (var i = 0; i < propertyList.length; i++) {
				if (propertyList[i].nodeType == 1) {
					parsingProperties(propertyList[i], node);
				}
			}

		}// END allproperties
		// NScarpato 27/10/2007 change editorPanelProperties con
		// templateandvalued
		// NScarpato 04/12/2007 add editor panel for class

		else if (attr == "templateandvalued") {
			var request = treeList[0].getAttribute('request');
			if (request == "getClsDescription"
					|| request == "getIndDescription") {
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
					typeToolbarButton.setAttribute("image",
							"images/class_create.png");
					typeToolbarButton.setAttribute("onclick",
							"addType('list');");
					typeToolbarButton.setAttribute("tooltiptext", "Add Type");
					typeToolbar.appendChild(typeToolbarButton);
					typeToolbarButton2 = document
							.createElement("toolbarbutton");
					typeToolbarButton2.setAttribute("image",
							"images/class_delete.png");
					typeToolbarButton2.setAttribute("onclick",
							"removeType('list');");
					typeToolbarButton2.setAttribute("tooltiptext",
							"Remove Type");
					typeToolbar.appendChild(typeToolbarButton2);
					parentBox.appendChild(typeToolbox);
					var list = document.createElement("listbox");
					list.setAttribute("id", "typesList");
					list.setAttribute("onclick", "listclick(event);");
					list.setAttribute("flex", "1");
					var listhead = document.createElement("listhead");
					var listheader = document.createElement("listheader");
					var listitem_iconic = document
							.createElement("listitem-iconic");
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
					for (var i = 0; i < typeList.length; i++) {
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
							lsti.setAttribute("explicit", typeList[i]
											.getAttribute("explicit"));
							lbl.setAttribute("value", value);
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
					// typeToolbar.appendChild(typeButton);
					box.appendChild(typeButton);
					box.insertBefore(lbl, typeButton);
					box.insertBefore(img, lbl);
					row.appendChild(box);
					parentBox.appendChild(row);
					for (var j = 0; j < typeList.length; j++) {
						if (typeList[j].nodeType == 1) {
							var value = typeList[j].getAttribute("class");
							var explicit = typeList[j].getAttribute("explicit");
							var txbox = document.createElement("textbox");
							txbox.setAttribute("value", value);
							txbox.setAttribute("readonly", "true");
							var typeButton = document.createElement("button");
							typeButton.setAttribute("id", "typeButton");
							typeButton.setAttribute("flex", "0");
							typeButton.setAttribute("oncommand", "removeType('"
											+ value + "');");
							if (explicit == "false") {
								typeButton.setAttribute("disabled", "true");
							}
							typeButton.setAttribute("label", "Remove Type");
							typeButton.setAttribute("image",
									"images/class_delete.png");
							var row2 = document.createElement("row");
							row2.setAttribute("id", value);
							row2.appendChild(typeButton);
							row2.insertBefore(txbox, typeButton);
							parentBox.appendChild(row2);
						}
					}
				}// NScarpato 05/12/2007 add superClass list for class's
					// editor panel
				if (request == "getClsDescription") {
					var superTypes = treeList[0]
							.getElementsByTagName('SuperTypes');
					var superClassList = superTypes[0]
							.getElementsByTagName('SuperType');
					separator = document.createElement("separator");
					separator.setAttribute("class", "groove");
					separator.setAttribute("orient", "orizontal");
					parentBox.appendChild(separator);
					if (superClassList.length > 3) {
						typeToolbox = document.createElement("toolbox");
						typeToolbar = document.createElement("toolbar");
						typeToolbox.appendChild(typeToolbar);
						typeToolbarButton = document
								.createElement("toolbarbutton");
						typeToolbarButton.setAttribute("image",
								"images/class_create.png");
						typeToolbarButton.setAttribute("onclick",
								"addSuperClass('list');");
						typeToolbarButton.setAttribute("tooltiptext",
								"Add Super Class");
						typeToolbar.appendChild(typeToolbarButton);
						typeToolbarButton2 = document
								.createElement("toolbarbutton");
						typeToolbarButton2.setAttribute("image",
								"images/class_delete.png");
						typeToolbarButton2.setAttribute("onclick",
								"removeSuperClass('list');");
						typeToolbarButton2.setAttribute("tooltiptext",
								"Remove Super Class");
						typeToolbar.appendChild(typeToolbarButton2);
						parentBox.appendChild(typeToolbox);
						var list = document.createElement("listbox");
						list.setAttribute("id", "typesList");
						list.setAttribute("onclick", "listclick(event);");
						list.setAttribute("flex", "1");
						var listhead = document.createElement("listhead");
						var listheader = document.createElement("listheader");
						var listitem_iconic = document
								.createElement("listitem-iconic");
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
						for (var k = 0; k < superClassList.length; k++) {
							if (superClassList[k].nodeType == 1) {
								lsti = document.createElement("listitem");
								lci = document.createElement("listitem-iconic");
								img = document.createElement("image");
								img
										.setAttribute("src",
												"images/class20x20.png");
								lci.appendChild(img);
								lbl = document.createElement("label");
								var value = superClassList[k]
										.getAttribute("resource");
								lsti.setAttribute("label", value);
								lsti.setAttribute("explicit", superClassList[k]
												.getAttribute("explicit"));
								lbl.setAttribute("value", value);
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
						typeButton2.setAttribute("image",
								"images/class_create.png");
						typeButton2.setAttribute("onclick",
								"addSuperClass('row');");
						typeButton2.setAttribute("tooltiptext",
								"Add Super Class");
						// typeToolbar.appendChild(typeButton2);
						box2.appendChild(typeButton2);
						box2.insertBefore(lbl2, typeButton2);
						box2.insertBefore(img2, lbl2);
						row3.appendChild(box2);
						parentBox.appendChild(row3);
						for (var h = 0; h < superClassList.length; h++) {
							if (superClassList[h].nodeType == 1) {
								var value2 = superClassList[h]
										.getAttribute("resource");
								var explicit = superClassList[h]
										.getAttribute("explicit");
								var txbox2 = document.createElement("textbox");
								txbox2.setAttribute("value", value2);
								txbox2.setAttribute("readonly", "true");
								var typeButton3 = document
										.createElement("button");
								typeButton3.setAttribute("id", "typeButton");
								typeButton3.setAttribute("flex", "0");
								typeButton3.setAttribute("oncommand",
										"removeSuperClass('" + value2 + "');");
								typeButton3.setAttribute("label",
										"Remove Super Class");
								if (explicit == "false") {
									typeButton3
											.setAttribute("disabled", "true");
								}
								var row4 = document.createElement("row");
								row4.setAttribute("id", value2);
								row4.appendChild(typeButton3);
								row4.insertBefore(txbox2, typeButton3);
								parentBox.appendChild(row4);
							}
						}
					}
				}
				// NScarpato 07/11/2007 change property visualization
				// NScarpato 06/03/2008 add button for add e remove value
				var properties = treeList[0].getElementsByTagName('Properties');
				var propertyList = properties[0]
						.getElementsByTagName('Property');
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
				typeTitleToolbarButton = document
						.createElement("toolbarbutton");
				typeTitleToolbarButton.setAttribute("image",
						"images/prop_create.png");
				typeTitleToolbarButton.setAttribute("onclick",
						"AddNewProperty();");
				typeTitleToolbarButton.setAttribute("tooltiptext",
						"Add New Property");
				// propertyTitleToolbar.appendChild(typeTitleToolbarButton);
				titleBox.appendChild(typeTitleToolbarButton);
				titleBox.insertBefore(propTitle, typeTitleToolbarButton);
				rowTitle.appendChild(titleBox);
				rowsBox.appendChild(rowTitle);
				for (var i = 0; i < propertyList.length; i++) {
					if (propertyList[i].nodeType == 1) {
						var nameValue = propertyList[i].getAttribute("name");
						var typeValue = propertyList[i].getAttribute("type");
						var row = document.createElement("row");
						var box3 = document.createElement("box");

						// propertyToolbox=document.createElement("toolbox");
						// propertyToolbar=document.createElement("toolbar");
						// propertyToolbox.appendChild(propertyToolbar);
						if (typeValue == "owl:ObjectProperty") {
							typeToolbarButton = document
									.createElement("toolbarbutton");
							typeToolbarButton.setAttribute("image",
									"images/propObject_create.png");
							typeToolbarButton.setAttribute("onclick",
									"createAndAddPropValue('" + nameValue
											+ "','" + typeValue + "');");
							typeToolbarButton.setAttribute("tooltiptext",
									"Add and Create Value");
							box3.appendChild(typeToolbarButton);
							/*
							 * typeToolbarButton1=document.createElement("toolbarbutton");
							 * typeToolbarButton1.setAttribute("image","images/addExistingObjectPropertyValue.GIF");
							 * typeToolbarButton1.setAttribute("onclick","addExistingPropValue('"+nameValue+"');");
							 * typeToolbarButton1.setAttribute("tooltiptext","Add
							 * Value");
							 * propertyToolbar.appendChild(typeToolbarButton1);
							 */
						} else if (typeValue == "owl:DatatypeProperty") {
							typeToolbarButton = document
									.createElement("toolbarbutton");
							typeToolbarButton.setAttribute("image",
									"images/propDatatype_create.png");
							typeToolbarButton.setAttribute("onclick",
									"createAndAddPropValue('" + nameValue
											+ "','" + typeValue + "');");
							typeToolbarButton.setAttribute("tooltiptext",
									"Add Value");
							box3.appendChild(typeToolbarButton);
						} else if (typeValue == "owl:AnnotationProperty") {
							typeToolbarButton = document
									.createElement("toolbarbutton");
							typeToolbarButton.setAttribute("image",
									"images/propAnnotation_create.png");
							typeToolbarButton.setAttribute("onclick",
									"createAndAddPropValue('" + nameValue
											+ "','" + typeValue + "');");
							typeToolbarButton.setAttribute("tooltiptext",
									"Add Value");
							box3.appendChild(typeToolbarButton);

						} else {
							typeToolbarButton = document
									.createElement("toolbarbutton");
							typeToolbarButton.setAttribute("image",
									"images/prop20x20.png");
							typeToolbarButton.setAttribute("onclick",
									"createAndAddPropValue('" + nameValue
											+ "','" + typeValue + "');");
							typeToolbarButton.setAttribute("tooltiptext",
									"Add Value");
							box3.appendChild(typeToolbarButton);
						}

						var lblic = document.createElement("label-iconic");
						var lbl = document.createElement("label");
						var img = document.createElement("image");
						if (typeValue == "owl:ObjectProperty") {
							img.setAttribute("src",
									"images/propObject20x20.png");
							img.setAttribute("flex", "0");
							lbl.setAttribute("value", nameValue);
						} else if (typeValue == "owl:DatatypeProperty") {
							img.setAttribute("src",
									"images/propDatatype20x20.png");
							img.setAttribute("flex", "0");
							lbl.setAttribute("value", nameValue);
						} else if (typeValue == "owl:AnnotationProperty") {
							img.setAttribute("src",
									"images/propAnnotation20x20.png");
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
						valueList = propertyList[i]
								.getElementsByTagName('Value');

						if (valueList.length > 10) {
							if (typeValue == "owl:ObjectProperty") {
								typeToolbarButton2 = document
										.createElement("toolbarbutton");
								typeToolbarButton2.setAttribute("image",
										"images/individual_remove.png");
								typeToolbarButton2.setAttribute("onclick",
										"removePropValue('list','" + nameValue
												+ "','" + typeValue + "');");
								typeToolbarButton2.setAttribute("tooltiptext",
										"Remove Value");
								propertyToolbar.appendChild(typeToolbarButton2);
							} else if (typeValue == "owl:DatatypeProperty") {
								typeToolbarButton2 = document
										.createElement("toolbarbutton");
								// typeToolbarButton2.setAttribute("image","images/prop_delete.png");
								typeToolbarButton2.setAttribute("onclick",
										"removePropValue('list','" + nameValue
												+ "','" + typeValue + "');");
								typeToolbarButton2.setAttribute("tooltiptext",
										"Remove Value");
								propertyToolbar.appendChild(typeToolbarButton2);
							} else if (typeValue == "owl:AnnotationProperty") {
								typeToolbarButton2 = document
										.createElement("toolbarbutton");
								// typeToolbarButton2.setAttribute("image","images/prop_delete.png");
								typeToolbarButton2.setAttribute("onclick",
										"removePropValue('list','" + nameValue
												+ "','" + typeValue + "');");
								typeToolbarButton2.setAttribute("tooltiptext",
										"Remove Value");
								propertyToolbar.appendChild(typeToolbarButton2);
							} else {
								typeToolbarButton2 = document
										.createElement("toolbarbutton");
								// typeToolbarButton2.setAttribute("image","images/prop_delete.png");
								typeToolbarButton2.setAttribute("onclick",
										"removePropValue('list','" + nameValue
												+ "','" + typeValue + "');");
								typeToolbarButton2.setAttribute("tooltiptext",
										"Remove Value");
								propertyToolbar.appendChild(typeToolbarButton2);
							}
							propList = document.createElement("listbox");
							propList.setAttribute("id", "propList");
							propList.setAttribute("onclick",
									"listclick(event);");
							if (typeValue == "owl:ObjectProperty") {
								propList.setAttribute("ondblclick",
										"listdblclick(event);");
							}
							propList.setAttribute("flex", "1");
							for (var j = 0; j < valueList.length; j++) {
								lsti = document.createElement("listitem");
								lci = document.createElement("listitem-iconic");
								img = document.createElement("image");
								img
										.setAttribute("src",
												"images/individual.png");
								lci.appendChild(img);
								lbl = document.createElement("label");
								var value = valueList[j].getAttribute("value");
								// NScarpato 25/03/2008
								if (typeValue == "owl:AnnotationProperty" || typeValue == "owl:AnnotationProperty_noexpl") {
									var lang = valueList[j].getAttribute("lang");
									lbl.setAttribute("value", value
													+ " (language: " + lang
													+ ")");
									lsti.setAttribute("language", lang);
									lsti.setAttribute("typeValue", typeValue);
								} else {
									lbl.setAttribute("value", value);
								}

								lci.appendChild(lbl);
								lsti.setAttribute("label", value);
								var explicit = valueList[j]
										.getAttribute("explicit");
								lsti.setAttribute("explicit", explicit);
								lsti.appendChild(lci);
								propList.appendChild(lsti);
							}
							var row2 = document.createElement("row");
							row2.appendChild(propList);
							rowsBox.appendChild(row2);
						} else {
							for (var j = 0; j < valueList.length; j++) {
								if (valueList[j].nodeType == 1) {
									value = valueList[j].getAttribute("value");
									var explicit = valueList[j]
											.getAttribute("explicit");
									var valueType = valueList[j]
											.getAttribute("type");
									row2 = document.createElement("row");
									txbox = document.createElement("textbox");
									txbox.setAttribute("id", value);
									txbox.setAttribute("typeValue", typeValue);
									if (typeValue == "owl:AnnotationProperty") {
										var lang = valueList[j]
												.getAttribute("lang");
										txbox.setAttribute("value", value
														+ " (language: " + lang
														+ ")");
										txbox.setAttribute("language", lang);

									} else {
										txbox.setAttribute("value", value);
									}
									txbox.setAttribute("readonly", "true");
									propButton = document
											.createElement("button");
									propButton.setAttribute("flex", "0");
									if (valueType == "rdfs:Resource") {
										propButton.setAttribute("image",
												"images/individual_remove.png");
										var resImg = document
												.createElement("image");
										resImg.setAttribute("src",
												"images/individual20x20.png");
										// resImg.setAttribute("ondblclick","resourcedblClick('"+explicit+"','"+value+"');");
										txbox.setAttribute("tooltiptext",
												"Editable Resource");
										txbox
												.setAttribute("onclick",
														"resourcedblClick('"
																+ explicit
																+ "','" + value
																+ "');");
										txbox.setAttribute("onmouseover",
												"setCursor('pointer')");
										resImg.setAttribute("onmouseover",
												"setCursor('pointer')");
										txbox.setAttribute("onmouseout",
												"setCursor('default')");
									} else if (typeValue == "owl:DatatypeProperty") {
										// propButton.setAttribute("image","images/prop_delete.png");
									} else if (typeValue == "owl:AnnotationProperty") {
										// propButton.setAttribute("image","images/prop_delete.png");
										if (nameValue == "rdfs:comment") {
											txbox.setAttribute("cols", "1");
											txbox.setAttribute("rows", "3");
											txbox.setAttribute("wrap", "on");
											txbox.setAttribute("multiline",
													"true");
										}
									} else {
										// propButton.setAttribute("image","images/prop_delete.png");
									}
									propButton.setAttribute("oncommand",
											"removePropValue('" + value + "','"
													+ nameValue + "','"
													+ typeValue + "');");
									propButton.setAttribute("label",
											"Remove Value");
									if (explicit == "false") {
										propButton.setAttribute("disabled",
												"true");
									}
									row2.appendChild(propButton);
									if (valueType == "rdfs:Resource") {
										/*
										 * resToolbar=document.createElement("toolbar");
										 * resToolbar.appendChild(editToolbarButton);
										 * resToolbar.appendChild(txbox);
										 * resToolbar.setAttribute("flex","0");
										 * row2.insertBefore(txbox,propButton);
										 * row2.insertBefore(resToolbar,txbox);
										 */
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
		}// END editorPanelProperties for class and instance

		else if (attr == "error") {
			var errorNode = treeList[0].getElementsByTagName('Error')[0];
			alert("Error: " + errorNode.getAttribute("value"));
		}// END error

		else if (attr == "bindAnnotToNewInstance") {
			// alert("value correctly added");
			// NScarpato 27/05/2007 add update for class tree after binding new
			// individual for selected Class
			var clsNodeName = treeList[0].getElementsByTagName('Class')[0]
					.getAttribute("clsName");
			var numTotInst = treeList[0].getElementsByTagName('Class')[0]
					.getAttribute("numTotInst");
			var treecellNodes;
			var iconicName = clsNodeName;
			var newIconicName = clsNodeName + "(" + numTotInst + ")";
			treecellNodes = getPanelTree().getElementsByTagName("treecell");
			var numTot = numTotInst - 1;
			if (numTot != 0) {
				var iconicName = clsNodeName + "(" + numTot + ")";
			}
			for (var i = 0; i < treecellNodes.length; i++) {
				if (treecellNodes[i].getAttribute("label") == iconicName) {
					treecellNodes[i].setAttribute("label", newIconicName);
					treecellNodes[i]
							.setAttribute("numTotInst", "" + numTotInst);
					// break;
				}
			}
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&clsName="
							+ encodeURIComponent(clsNodeName), false);
		}// END UPDATE PROPERTIES
		
		else if (attr == "Annotations") {
			var annotations = treeList[0].getElementsByTagName('Annotation');
			for (var i = 0; i < annotations.length; i++) {
				var valueToHighlight = annotations[i].getAttribute("value");
				highlightStartTag = "<font style='color:blue; background-color:yellow;'>";
				highlightEndTag = "</font>";
				highlightSearchTerms(valueToHighlight, true, true,
						highlightStartTag, highlightEndTag);
			}
		}// END annotations

		
		else if (attr == "AckMsg") {
			var msg = treeList[0].getElementsByTagName('Msg')[0];
			// alert(msg.getAttribute("content"));
		}
	} else if (aResultCode == RESULT_ERROR_FAILURE) {
	}// END RESULT_ERROR_FAILURE
}

function parsing(classNode, node, isRootNode) {
	var tr = document.createElement("treerow");
	tr.setAttribute("id", "treerow" + 30);
	var tc = document.createElement("treecell");
	var numInst = classNode.getAttribute("numInst");
	if (numInst != 0) {
		tc.setAttribute("label", classNode.getAttribute("name") + numInst);
	} else {
		tc.setAttribute("label", classNode.getAttribute("name"));
	}
	// NScarpato 26/06/2007 remove ParentName attribute
	// tc.setAttribute("parentName", classNode.getAttribute("parentName"));
	// tc.setAttribute("pareNumInst", classNode.getAttribute("pareNumInst"));
	tc.setAttribute("numInst", numInst);
	tc.setAttribute("deleteForbidden", classNode
					.getAttribute("deleteForbidden"));
	tc.setAttribute("properties", classNode.getAttribute("deleteForbidden"));
	tc.setAttribute("id", "cell-of-treeitem" + 10);
	// NScarpato 11/07/2007 add attribute isRootNode
	tc.setAttribute("isRootNode", isRootNode);
	tr.appendChild(tc);
	var ti = document.createElement("treeitem");
	ti.setAttribute("id", "treeitem" + this.itemid);
	ti.appendChild(tr);
	var tch = document.createElement("treechildren");
	ti.appendChild(tch);
	node.appendChild(ti);
	var classNodes;
	var instanceNodes;
	var classList = classNode.childNodes;
	for (var i = 0; i < classList.length; i++) {
		if (classList[i].nodeName == "SubClasses") {
			classNodes = classList[i].childNodes;
			/*
			 * if (classNodes.length > 0) { ti.setAttribute("open", true);
			 * ti.setAttribute("container", true); } else {
			 * ti.setAttribute("open", false); ti.setAttribute("container",
			 * false); }
			 */
			for (var j = 0; j < classNodes.length; j++) {
				if (classNodes[j].nodeType == 1) {
					parsing(classNodes[j], tch, false);
				}
			}
		}
		if (classList[i].nodeName == "Instances") {
			instanceNodes = classList[i].childNodes;;
			for (var j = 0; j < instanceNodes.length; j++) {
				if (instanceNodes[j].nodeType == 1) {
					// _printToJSConsole("instanceNode: " +
					// instanceNodes[j].nodeType);
					var trInst = document.createElement("treerow");
					// trInst.setAttribute("id", "treerow" + 30);
					var tcInst = document.createElement("treecell");
					// _printToJSConsole("instanceNode: " +
					// instanceNodes[j].getAttribute("name"));
					tcInst.setAttribute("properties", "individual");
					tcInst.setAttribute("label", instanceNodes[j]
									.getAttribute("name"));
					// tcInst.setAttribute("id","cell-of-treeitem" + 10);
					trInst.appendChild(tcInst);
					var tiInst = document.createElement("treeitem");
					tiInst.appendChild(trInst);
					// tiInst.setAttribute("id", "treeitem" + this.itemid);
					tch.appendChild(tiInst);
				}
			}
		}

		if (classNodes != null && classNodes.length > 0) {
			// NScarpato 12/07/07 change ClassTree visualization on closed mode
			// ti.setAttribute("open", true);
			ti.setAttribute("open", false);
			ti.setAttribute("container", true);
		} else if (instanceNodes != null && instanceNodes.length > 0) {
			ti.setAttribute("open", false);
			ti.setAttribute("container", true);
		} else {
			ti.setAttribute("open", false);
			ti.setAttribute("container", false);
		}

		/*
		 * if (instanceNodes != null) { }
		 */
	}
}

/**
 * NScarpato 18/06/2007 This function make parsing for properties tree
 */
function parsingProperties(propertyNode, node) {
	var name = propertyNode.getAttribute("name");
	var deleteForbidden = propertyNode.getAttribute("deleteForbidden");
	var type = propertyNode.getAttribute("type");
	var tr = document.createElement("treerow");
	var tc = document.createElement("treecell");
	tc.setAttribute("label", name);
	tc.setAttribute("deleteForbidden", deleteForbidden);
	// NScarpato 25/06/2007 remove owl: because : doesn't work for css
	type = type.substring(type.indexOf(':') + 1);
	if (deleteForbidden == "true") {
		tr.setAttribute("properties", type + "_noexpl");
		tc.setAttribute("properties", type + "_noexpl");
	} else {
		tr.setAttribute("properties", type);
		tc.setAttribute("properties", type);
	}
	tr.appendChild(tc);
	var ti = document.createElement("treeitem");
	ti.appendChild(tr);
	var tch = document.createElement("treechildren");
	ti.appendChild(tch);
	node.appendChild(ti);
	var propertiesNodes;
	var propertiesList = propertyNode.childNodes;
	for (var i = 0; i < propertiesList.length; i++) {
		if (propertiesList[i].nodeName == "SubProperties") {
			propertiesNodes = propertiesList[i].childNodes;
			for (var j = 0; j < propertiesNodes.length; j++) {
				if (propertiesNodes[j].nodeType == 1) {
					parsingProperties(propertiesNodes[j], tch);
				}
			}
		}
		if (propertiesNodes != null && propertiesNodes.length > 0) {
			ti.setAttribute("open", true);
			ti.setAttribute("container", true);
		} else {
			ti.setAttribute("open", false);
			ti.setAttribute("container", false);
		}
	}
}

/**
 * NScarpato 12/07/2007 This function make parsing for prefix namespace tree
 * 
 */
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

/**
 * NScarpato 04/10/2007 This function make parsing for imports tree
 * 
 */
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
	for (var i = 0; i < importsList.length; i++) {
		if (importsList[i].nodeName == "ontology") {
			importsNodes = importsList[i].childNodes;
			if (importsList[i].nodeType == 1) {
				parsingImports(importsList[i], tch, "false");
			}
			for (var j = 0; j < importsNodes.length; j++) {
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
/**
 * NScarpato 23/05/2007 This function focus result element to ontologySearch
 * Nscarpato 27/05/2007 add param myTree to make function for all trees
 * Nscarpato 04/03/2008 change search focus
 * 
 * @param
 */
function searchFocus(resType, resName, callPanel, typeName) {
	var myTree = getthetree();
	if (callPanel == "class") {
		if (resType == "owl:Individual") {
			myTree.selectElementClass(myTree, typeName);
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&clsName="
							+ encodeURIComponent(typeName), false);
			list = gettheList();
			index = 0;
			while (list.getItemAtIndex(index) != null) {
				if (list.getItemAtIndex(index).label == resName) {
					list.selectedIndex = index;
					list.scrollToIndex(index);
					break;
				}
				index++;
			}
		} else if (resType == "Class") {
			myTree.selectElementClass(myTree, resName);
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&clsName="
							+ encodeURIComponent(resName), false);
		} else if (resType == "annotation") {
			// TODO Mancano le annotation nella ricerca
		}
		// property
	} else {
		myTree.selectElementClass(myTree, resName);
	}
	/*
	 * var myTree = getthetree(); myTree.selectElementClass(myTree,name);
	 * httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&clsName=" +
	 * encodeURIComponent(name), false); }else if(resType=="Individual"){ var
	 * myTree = getthetree(); if(callPanel=="class"){
	 * myTree.selectElementClass(myTree,typeName);
	 * httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&clsName=" +
	 * encodeURIComponent(typeName), false); list=gettheList(); index=0;
	 * while(list.getItemAtIndex(index)!=null){ if
	 * (list.getItemAtIndex(index).label==name) { list.selectedIndex=index;
	 * list.scrollToIndex(index); break; } index++; } }else{//is a property
	 * _printToJSConsole("e' una proprieta'"); _printToJSConsole("sto per
	 * selezionare "+name+" da "+myTree.getAttribute("id"));
	 * myTree.selectElementClass(myTree,name); }
	 *  } //NScarpato 23/05/2007 if it's a annotation focus the refered instance
	 * else if(resType=="annotation" || resType=="annotationS"){
	 * if(resType=="annotation"){ alert(name+" it's a annotation in reference to
	 * instance "+refInstName); } myTree.selectElementClass(myTree,typeName);
	 * httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&clsName=" +
	 * encodeURIComponent(typeName), false); list=gettheList(); index=0;
	 * while(list.getItemAtIndex(index)!=null){ if
	 * (list.getItemAtIndex(index).label==refInstName) {
	 * list.selectedIndex=index; list.scrollToIndex(index); break; } index++; } }
	 */
}
// NScarpato 26/06/2007 Parse a xml document and print it on console
function parseXMLSource(document) {
	var serializer = new XMLSerializer();
	var xml = serializer.serializeToString(document);
	_printToJSConsole(xml);
}
/**
 * @author NScarpato 12/03/2008 createCls
 */
function createCls(treeList) {
	var iconicName = parameters.iconicName;
	var tree = parameters.tree;
	var isRootNode = parameters.isRootNode;
	var type = parameters.type;
	// NScarpato 11/07/2007
	if (type == "siblingClass" && isRootNode == "true") {
		var node = getthetree().getElementsByTagName('treechildren')[0];
		var newClassNode = treeList[0].getElementsByTagName('SubClass')[0];
		var tr = document.createElement("treerow");
		tr.setAttribute("id", "treerow" + 30);
		var tc = document.createElement("treecell");
		tc.setAttribute("label", newClassNode.getAttribute("SubClassName"));
		tc.setAttribute("numInst", 0);
		tc.setAttribute("deleteForbidden", "false");
		tc.setAttribute("id", "cell-of-treeitem" + 10);
		tc.setAttribute("isRootNode", isRootNode);
		tr.appendChild(tc);
		var ti = document.createElement("treeitem");
		ti.setAttribute("id", "treeitem" + this.itemid);
		ti.setAttribute('container', 'false');
		ti.setAttribute('open', 'false');
		ti.appendChild(tr);
		var tch = document.createElement("treechildren");
		ti.appendChild(tch);
		node.appendChild(ti);
	} else {
		var clsNode = treeList[0].getElementsByTagName('Class')[0];
		var subClassNode = treeList[0].getElementsByTagName('SubClass')[0];
		var tr = document.createElement("treerow");
		var tc = document.createElement("treecell");
		var ti = document.createElement("treeitem");
		tc.setAttribute("label", subClassNode.getAttribute("SubClassName"));
		// NScarpato 26/06/2007 remove ParentName attribute
		// tc.setAttribute("parentName", clsNode.getAttribute("clsName"));
		tc.setAttribute("deleteForbidden", "false");
		tc.setAttribute("numInst", "0");
		tc.setAttribute("isRootNode", isRootNode);
		tr.appendChild(tc);
		var ti = document.createElement("treeitem");
		ti.setAttribute('container', 'false');
		ti.setAttribute('open', 'false');
		ti.appendChild(tr);
		var treecellNodes;
		treecellNodes = tree.getElementsByTagName("treecell");
		var targetNode = null;
		for (var i = 0; i < treecellNodes.length; i++) {
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
}
/**
 * @author NScarpato 12/03/2008 getNSPrefixMappings
 * 
 */
function getNSPrefixMappings(treeList) {
	namespaceTree = parameters.namespaceTree;
	var node = namespaceTree.getElementsByTagName('treechildren')[0];
	var nsList;
	for (var i = 0; i < treeList.length; i++) {
		if (treeList[i].nodeType == 1) {
			nsList = treeList[i].childNodes;
		}
	}
	for (var i = 0; i < nsList.length; i++) {
		if (nsList[i].nodeType == 1) {
			parsingNSPrefixMappings(nsList[i], node);
		}
	}
}
/**
 * @author NScarpato 12/03/2008 imports
 */
function imports(treeList) {

	importTree = parameters.importsTree;
	var node = importTree.getElementsByTagName('treechildren')[0];
	var nsList;
	for (var i = 0; i < treeList.length; i++) {
		if (treeList[i].nodeType == 1) {
			nsList = treeList[i].childNodes;
		}
	}
	for (var i = 0; i < nsList.length; i++) {
		if (nsList[i].nodeType == 1) {
			parsingImports(nsList[i], node, "true");
		}
	}

}
/**
 * @author NScarpato 12/03/2008 addFromWebToMirror
 */
function addFromWebToMirror(msg) {
	var treeChildren = parameters.namespaceTree
			.getElementsByTagName('treechildren')[0];
	treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
	// EMPTY TREE
	while (treeChildren.hasChildNodes()) {
		treeChildren.removeChild(treeChildren.lastChild);
	}
	var treeChildren2 = parameters.importsTree
			.getElementsByTagName('treechildren')[0];
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
	var treeChildren = parameters.namespaceTree
			.getElementsByTagName('treechildren')[0];
	treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
	// EMPTY TREE
	while (treeChildren.hasChildNodes()) {
		treeChildren.removeChild(treeChildren.lastChild);
	}
	var treeChildren2 = parameters.importsTree
			.getElementsByTagName('treechildren')[0];
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
	var treeChildren = parameters.namespaceTree
			.getElementsByTagName('treechildren')[0];
	treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
	// EMPTY TREE
	while (treeChildren.hasChildNodes()) {
		treeChildren.removeChild(treeChildren.lastChild);
	}
	var treeChildren2 = parameters.importsTree
			.getElementsByTagName('treechildren')[0];
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
	var treeChildren = parameters.namespaceTree
			.getElementsByTagName('treechildren')[0];
	treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
	// EMPTY TREE
	while (treeChildren.hasChildNodes()) {
		treeChildren.removeChild(treeChildren.lastChild);
	}
	var treeChildren2 = parameters.importsTree
			.getElementsByTagName('treechildren')[0];
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

	var treeChildren = parameters.namespaceTree
			.getElementsByTagName('treechildren')[0];
	treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
	// EMPTY TREE
	while (treeChildren.hasChildNodes()) {
		treeChildren.removeChild(treeChildren.lastChild);
	}
	var treeChildren2 = parameters.importsTree
			.getElementsByTagName('treechildren')[0];
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
	var treeChildren = parameters.namespaceTree
			.getElementsByTagName('treechildren')[0];
	treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
	// EMPTY TREE
	while (treeChildren.hasChildNodes()) {
		treeChildren.removeChild(treeChildren.lastChild);
	}
	/*
	 * var treeChildren2 =
	 * parameters.importsTree.getElementsByTagName('treechildren')[0]; //EMPTY
	 * TREE while(treeChildren2.hasChildNodes()){
	 * treeChildren2.removeChild(treeChildren2.lastChild); }
	 * httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_imports",false,parameters);
	 */
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_nsprefixmappings",
			false, parameters);
}
/**
 * @author NScarpato 12/03/2008 update_delete
 * @param type
 */
function update_delete(type) {
	var tree = parameters.tree;
	if (type == "Instance") {
		var list = parameters.list;
		var parentName = list.getElementsByTagName('listheader')[0]
				.getAttribute("parentCls");
		var instName = parameters.instName;
		var instIndex = parameters.instIndex;
		var numTotInst = parameters.numTotInst;
		var deleteType = parameters.deleteType;
		// Elimino istanza dalla lista e aggiorno parametro numTotInst
		list.removeItemAt(instIndex);
		// If it's simple delete refresh only node aboute instance
		if (deleteType == "delete") {
			numTot = numTotInst - 1;
			list.getElementsByTagName('listheader')[0].setAttribute(
					"numTotInst", numTot);
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
			for (var i = 0; i < treecellNodes.length; i++) {
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
			httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls");
		}
	}// Update after class delete
	// NScarpato 08/10/2007 add delete Property
	else if (type == "Class") {
		var treeChildren = tree.getElementsByTagName('treechildren')[0];
		treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		// RELOAD TREE
		httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls");
	} else {// property
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
	}
}
/**
 * @author NScarpato 14/03/2008 addSuperClass or remove Super classes
 * @param {xml}
 *            treeList
 */
function changeSuperClass(treeList) {
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
	httpGetP("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls&request=getClsDescription&clsName="
			+ encodeURIComponent(parameters.sourceElementName)
			+ "&method=templateandvalued");
}
/**
 * @author NScarpato 23/06/2008 addSuperProperty or remove Super property
 * @param {xml}
 *            treeList
 */
function changeSuperProperty(treeList) {
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
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=getPropDescription&propertyQName="
					+ encodeURIComponent(parameters.sourceElementName), false,
			parameters);
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
/**
 * @author NScarpato 12/03/2008 getPropDscr
 * @param {String}
 *            treeList
 */
function getPropDscr(treeList) {
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
		for (var i = 0; i < typeList.length; i++) {
			if (typeList[i].nodeType == 1) {
				lsti = document.createElement("listitem");
				lci = document.createElement("listitem-iconic");
				img = document.createElement("image");
				img.setAttribute("src", "images/class20x20.png");
				lci.appendChild(img);
				lbl = document.createElement("label");
				var value = typeList[i].getAttribute("class");
				lsti.setAttribute("label", value);
				lsti.setAttribute("explicit", typeList[i]
								.getAttribute("explicit"));
				lbl.setAttribute("value", value);
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
		// typeToolbar.appendChild(typeButton);
		box.appendChild(typeButton);
		box.insertBefore(lbl, typeButton);
		box.insertBefore(img, lbl);
		row.appendChild(box);
		parentBox.appendChild(row);
		for (var j = 0; j < typeList.length; j++) {
			if (typeList[j].nodeType == 1) {
				var value = typeList[j].getAttribute("class");
				var explicit = typeList[j].getAttribute("explicit");
				var txbox = document.createElement("textbox");
				txbox.setAttribute("value", value);
				txbox.setAttribute("readonly", "true");
				var typeButton = document.createElement("button");
				typeButton.setAttribute("id", "typeButton");
				typeButton.setAttribute("flex", "0");
				typeButton.setAttribute("oncommand", "removeType('" + value
								+ "');");
				if (explicit == "false") {
					typeButton.setAttribute("disabled", "true");
				}
				typeButton.setAttribute("label", "Remove Type");
				typeButton.setAttribute("image", "images/class_delete.png");
				var row2 = document.createElement("row");
				row2.setAttribute("id", value);
				row2.appendChild(typeButton);
				row2.insertBefore(txbox, typeButton);
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
		typeToolbarButton2.setAttribute("onclick",
				"removeSuperProperty('list');");
		typeToolbarButton2.setAttribute("tooltiptext", "Remove SuperProperty");
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
		for (var i = 0; i < superTypeList.length; i++) {
			if (superTypeList[i].nodeType == 1) {
				lsti = document.createElement("listitem");
				lci = document.createElement("listitem-iconic");
				img = document.createElement("image");
				img.setAttribute("src", "images/prop20x20.png");
				lci.appendChild(img);
				lbl = document.createElement("label");
				var value = superTypeList[i].getAttribute("resource");
				lsti.setAttribute("label", value);
				lsti.setAttribute("explicit", superTypeList[i]
								.getAttribute("explicit"));
				lbl.setAttribute("value", value);
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
		// typeToolbar.appendChild(typeButton);
		box.appendChild(typeButton);
		box.insertBefore(lbl, typeButton);
		box.insertBefore(img, lbl);
		row.appendChild(box);
		parentBox.appendChild(row);
		for (var j = 0; j < superTypeList.length; j++) {
			if (superTypeList[j].nodeType == 1) {
				var value = superTypeList[j].getAttribute("resource");
				var explicit = superTypeList[j].getAttribute("explicit");
				var txbox = document.createElement("textbox");
				txbox.setAttribute("value", value);
				txbox.setAttribute("readonly", "true");
				var typeButton = document.createElement("button");
				typeButton.setAttribute("id", "typeButton");
				typeButton.setAttribute("flex", "0");
				typeButton.setAttribute("oncommand", "removeSuperProperty('"
								+ value + "');");
				if (explicit == "false") {
					typeButton.setAttribute("disabled", "true");
				}
				typeButton.setAttribute("label", "Remove SuperProperty");
				typeButton.setAttribute("image", "images/prop_delete.png");
				var row2 = document.createElement("row");
				row2.setAttribute("id", value);
				row2.appendChild(typeButton);
				row2.insertBefore(txbox, typeButton);
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
			domainToolbarButton
					.setAttribute("image", "images/class_create.png");
			domainToolbarButton
					.setAttribute("onclick", "insertDomain('list');");
			domainToolbarButton.setAttribute("tooltiptext", "Add Domain");
			domainToolbar.appendChild(domainToolbarButton);
			domainToolbarButton2 = document.createElement("toolbarbutton");
			domainToolbarButton2.setAttribute("image",
					"images/class_delete.png");
			domainToolbarButton2.setAttribute("onclick",
					"removeDomain('list');");
			domainToolbarButton2.setAttribute("tooltiptext", "Remove Domain");
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
			for (var i = 0; i < domainNodeList.length; i++) {
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
			// domainToolbar.appendChild(domainButton);
			box.appendChild(domainButton);
			box.insertBefore(lbl, domainButton);
			box.insertBefore(img, lbl);
			row.appendChild(box);
			parentBox.appendChild(row);
			for (var j = 0; j < domainNodeList.length; j++) {
				if (domainNodeList[j].nodeType == 1) {
					var value = domainNodeList[j].getAttribute("name");
					var txbox = document.createElement("textbox");
					txbox.setAttribute("value", value);
					txbox.setAttribute("explicit", explicit);
					txbox.setAttribute("readonly", "true");
					var domainButton = document.createElement("button");
					domainButton.setAttribute("id", "domainButton");
					domainButton.setAttribute("flex", "0");
					domainButton.setAttribute("oncommand", "removeDomain('"
									+ value + "');");
					domainButton.setAttribute("label", "Remove Domain");
					domainButton.setAttribute("image",
							"images/class_delete.png");
					var explicit = domainNodeList[j].getAttribute("explicit");
					if (explicit == "false") {
						domainButton.setAttribute("disabled", "true");
					}
					var row2 = document.createElement("row");
					row2.setAttribute("id", value);
					row2.appendChild(domainButton);
					row2.insertBefore(txbox, domainButton);
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
			for (var k = 0; k < rangeList.length; k++) {
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
			// typeToolbar.appendChild(typeButton2);
			box2.appendChild(typeButton2);
			box2.insertBefore(lbl2, typeButton2);
			box2.insertBefore(img2, lbl2);
			row3.appendChild(box2);
			parentBox.appendChild(row3);
			for (var h = 0; h < rangeList.length; h++) {
				if (rangeList[h].nodeType == 1) {
					var value2 = rangeList[h].getAttribute("name");
					var txbox2 = document.createElement("textbox");
					txbox2.setAttribute("value", value2);
					txbox2.setAttribute("readonly", "true");
					var typeButton3 = document.createElement("button");
					typeButton3.setAttribute("id", "typeButton");
					typeButton3.setAttribute("flex", "0");
					typeButton3.setAttribute("oncommand", "removeRange('"
									+ value2 + "');");
					typeButton3.setAttribute("label", "Remove Range");
					var explicit = rangeList[h].getAttribute("explicit");
					if (explicit == "false") {
						typeButton3.setAttribute("disabled", "true");
					}
					var row4 = document.createElement("row");
					row4.setAttribute("id", value2);
					row4.appendChild(typeButton3);
					row4.insertBefore(txbox2, typeButton3);
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
			domainToolbarButton
					.setAttribute("image", "images/class_create.png");
			domainToolbarButton.setAttribute("onclick", "insertDomain();");
			domainToolbarButton.setAttribute("tooltiptext", "Add Domain");
			domainToolbar.appendChild(domainToolbarButton);
			domainToolbarButton2 = document.createElement("toolbarbutton");
			domainToolbarButton2.setAttribute("image",
					"images/class_delete.png");
			domainToolbarButton2.setAttribute("onclick",
					"removeDomain('list');");
			domainToolbarButton2.setAttribute("tooltiptext", "Remove Domain");
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
			for (var i = 0; i < domainNodeList.length; i++) {
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
			// domainToolbar.appendChild(domainButton);
			box.appendChild(domainButton);
			box.insertBefore(lbl, domainButton);
			box.insertBefore(img, lbl);
			row.appendChild(box);
			parentBox.appendChild(row);
			for (var j = 0; j < domainNodeList.length; j++) {
				if (domainNodeList[j].nodeType == 1) {
					var value = domainNodeList[j].getAttribute("name");
					var txbox = document.createElement("textbox");
					txbox.setAttribute("value", value);
					txbox.setAttribute("readonly", "true");
					var domainButton = document.createElement("button");
					domainButton.setAttribute("id", "domainButton");
					domainButton.setAttribute("flex", "0");
					domainButton.setAttribute("oncommand", "removeDomain('"
									+ value + "');");
					domainButton.setAttribute("label", "Remove Domain");
					domainButton.setAttribute("image",
							"images/class_delete.png");
					var explicit = domainNodeList[j].getAttribute("explicit");
					if (explicit == "false") {
						domainButton.setAttribute("disabled", "true");
					}
					var row2 = document.createElement("row");
					row2.setAttribute("id", value);
					row2.appendChild(domainButton);
					row2.insertBefore(txbox, domainButton);
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
			var typeButton3 = document.createElement("button");
			typeButton3.setAttribute("id", "typeButton");
			typeButton3.setAttribute("flex", "0");
			typeButton3.setAttribute("oncommand", "removeRange('" + value2
							+ "');");
			typeButton3.setAttribute("label", "Remove Range");
			var explicit = rangeList[0].getAttribute("explicit");
			if (explicit == "false") {
				typeButton3.setAttribute("disabled", "true");
			}
			var row4 = document.createElement("row");
			row4.setAttribute("id", value2);
			row4.appendChild(typeButton3);
			row4.insertBefore(txbox2, typeButton3);
			parentBox.appendChild(row4);
		}
	} else if (parameters.type == "AnnotationProperty") {
		// lista domini fino a 3 valori righe e poi lista
		if (domainNodeList.length > 3) {
			domainToolbox = document.createElement("toolbox");
			domainToolbar = document.createElement("toolbar");
			domainToolbox.appendChild(domainToolbar);
			domainToolbarButton = document.createElement("toolbarbutton");
			domainToolbarButton
					.setAttribute("image", "images/class_create.png");
			domainToolbarButton.setAttribute("onclick", "insertDomain();");
			domainToolbarButton.setAttribute("tooltiptext", "Add Domain");
			domainToolbar.appendChild(domainToolbarButton);
			domainToolbarButton2 = document.createElement("toolbarbutton");
			domainToolbarButton2.setAttribute("image",
					"images/class_delete.png");
			domainToolbarButton2.setAttribute("onclick",
					"removeDomain('list');");
			domainToolbarButton2.setAttribute("tooltiptext", "Remove Domain");
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
			for (var i = 0; i < domainNodeList.length; i++) {
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
			// domainToolbar.appendChild(domainButton);
			box.appendChild(domainButton);
			box.insertBefore(lbl, domainButton);
			box.insertBefore(img, lbl);
			row.appendChild(box);
			parentBox.appendChild(row);
			for (var j = 0; j < domainNodeList.length; j++) {
				if (domainNodeList[j].nodeType == 1) {
					var value = domainNodeList[j].getAttribute("name");
					var txbox = document.createElement("textbox");
					txbox.setAttribute("value", value);
					txbox.setAttribute("readonly", "true");
					var domainButton = document.createElement("button");
					domainButton.setAttribute("id", "domainButton");
					domainButton.setAttribute("flex", "0");
					domainButton.setAttribute("oncommand", "removeDomain('"
									+ value + "');");
					domainButton.setAttribute("label", "Remove Domain");
					domainButton.setAttribute("image",
							"images/class_delete.png");
					var row2 = document.createElement("row");
					row2.setAttribute("id", value);
					row2.appendChild(domainButton);
					row2.insertBefore(txbox, domainButton);
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
		// inversePropertyToolbar.appendChild(inversBtn);
		titleBox.appendChild(inversBtn);
		titleBox.insertBefore(box, inversBtn);
		row.appendChild(titleBox);
		rowBox.appendChild(row);

		if (facetsList.length > 0) {
			for (var i = 0; i < facetsList.length; i++) {
				if (facetsList[i].nodeType == 1
						&& facetsList[i].tagName == "inverseOf") {

					var valueList = facetsList[i].childNodes;

					if (valueList.length > 10) {
						inverseList = document.createElement("listbox");
						inverseList.setAttribute("id", "inverseList");
						inverseList
								.setAttribute("onclick", "listclick(event);");
						inverseList.setAttribute("flex", "1");
						remInverseBtn = document.createElement("toolbarbutton");
						remInverseBtn.setAttribute("image",
								"images/prop_delete.png");
						remInverseBtn.setAttribute("label", "Remove Value");
						remInverseBtn.setAttribute("id", "removeInverseOf");
						remInverseBtn.setAttribute("flex", "0");
						remInverseBtn.setAttribute("oncommand",
								"removeInverseOf('"
										+ inverseList.selectedItem.label
										+ "');");
						remInverseBtn.setAttribute("tooltiptext",
								"Remove InverseOf value");
						titleBox.insertBefore(inversBtn, remInverseBtn);
						for (var j = 0; j < valueList.length; j++) {
							if (valueList[j].nodeType == 1) {
								lsti = document.createElement("listitem");
								lci = document.createElement("listitem-iconic");
								img = document.createElement("image");
								img.setAttribute("src", "images/prop.png");
								lci.appendChild(img);
								lbl = document.createElement("label");
								var value = valueList[j].getAttribute("value");
								lbl.setAttribute("value", value);
								lci.appendChild(lbl);
								lsti.setAttribute("label", value);
								var explicit = valueList[j]
										.getAttribute("explicit");
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
								var inverseTxbox = document
										.createElement("textbox");
								inverseTxbox.setAttribute("id", "inverseOf");
								inverseTxbox.setAttribute("value", value);
								inverseTxbox.setAttribute("flex", "1");
								inverseTxbox.setAttribute("readonly", "true");
								inversBtn = document
										.getElementById("addInverseOf");
								// inversBtn.setAttribute("disabled","true");
								// inversePropertyToolbar.setAttribute("disabled","true");
								// var row2 = document.createElement("row");
								// row2.setAttribute("id",value);
								var inverseBox = document.createElement("box");
								inverseBox.setAttribute("flex", "1");
								// NScarpato 15/09/2008 added remove inverseOf
								// value Button
								remInverseBtn = document
										.createElement("button");
								remInverseBtn.setAttribute("image",
										"images/prop_delete.png");
								remInverseBtn.setAttribute("label",
										"Remove Value");
								remInverseBtn.setAttribute("id",
										"removeInverseOf");
								remInverseBtn.setAttribute("flex", "0");
								remInverseBtn.setAttribute("oncommand",
										"removeInverseOf('" + value + "');");
								remInverseBtn.setAttribute("tooltiptext",
										"Remove InverseOf value");
								inverseBox.appendChild(remInverseBtn);
								inverseBox.insertBefore(inverseTxbox,
										remInverseBtn);
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
	if (parameters.type == "ObjectProperty"
			|| parameters.type == "ObjectProperty_noexpl") {
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
	// propertyTitleToolbar.appendChild(typeTitleToolbarButton);
	titleBox.appendChild(typeTitleToolbarButton);
	titleBox.insertBefore(propTitle, typeTitleToolbarButton);
	rowTitle.appendChild(titleBox);
	rowsBox.appendChild(rowTitle);
	for (var i = 0; i < propertyList.length; i++) {
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
				typeToolbarButton.setAttribute("image",
						"images/propObject_create.png");
				typeToolbarButton.setAttribute("onclick",
						"createAndAddPropValue('" + nameValue + "','"
								+ typeValue + "');");
				typeToolbarButton.setAttribute("tooltiptext",
						"Add and Create Value");
				box3.appendChild(typeToolbarButton);
				/*
				 * typeToolbarButton1=document.createElement("toolbarbutton");
				 * typeToolbarButton1.setAttribute("image","images/addExistingObjectPropertyValue.GIF");
				 * typeToolbarButton1.setAttribute("onclick","addExistingPropValue('"+nameValue+"');");
				 * typeToolbarButton1.setAttribute("tooltiptext","Add Value");
				 * propertyToolbar.appendChild(typeToolbarButton1);
				 */
			} else if (typeValue == "owl:DatatypeProperty") {
				typeToolbarButton = document.createElement("toolbarbutton");
				typeToolbarButton.setAttribute("image",
						"images/propDatatype_create.png");
				typeToolbarButton.setAttribute("onclick",
						"createAndAddPropValue('" + nameValue + "','"
								+ typeValue + "');");
				typeToolbarButton.setAttribute("tooltiptext", "Add Value");
				box3.appendChild(typeToolbarButton);
			} else if (typeValue == "owl:AnnotationProperty") {
				typeToolbarButton = document.createElement("toolbarbutton");
				typeToolbarButton.setAttribute("image",
						"images/propAnnotation_create.png");
				typeToolbarButton.setAttribute("onclick",
						"createAndAddPropValue('" + nameValue + "','"
								+ typeValue + "');");
				typeToolbarButton.setAttribute("tooltiptext", "Add Value");
				box3.appendChild(typeToolbarButton);

			} else {
				typeToolbarButton = document.createElement("toolbarbutton");
				typeToolbarButton.setAttribute("image", "images/prop20x20.png");
				typeToolbarButton.setAttribute("onclick",
						"createAndAddPropValue('" + nameValue + "','"
								+ typeValue + "');");
				typeToolbarButton.setAttribute("tooltiptext", "Add Value");
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
					typeToolbarButton2 = document
							.createElement("toolbarbutton");
					typeToolbarButton2.setAttribute("image",
							"images/individual_remove.png");
					typeToolbarButton2.setAttribute("onclick",
							"removePropValue('list','" + nameValue + "','"
									+ typeValue + "');");
					typeToolbarButton2.setAttribute("tooltiptext",
							"Remove Value");
					propertyToolbar.appendChild(typeToolbarButton2);
				} else if (typeValue == "owl:DatatypeProperty") {
					typeToolbarButton2 = document
							.createElement("toolbarbutton");
					// typeToolbarButton2.setAttribute("image","images/prop_delete.png");
					typeToolbarButton2.setAttribute("onclick",
							"removePropValue('list','" + nameValue + "','"
									+ typeValue + "');");
					typeToolbarButton2.setAttribute("tooltiptext",
							"Remove Value");
					propertyToolbar.appendChild(typeToolbarButton2);
				} else if (typeValue == "owl:AnnotationProperty") {
					typeToolbarButton2 = document
							.createElement("toolbarbutton");
					// typeToolbarButton2.setAttribute("image","images/prop_delete.png");
					typeToolbarButton2.setAttribute("onclick",
							"removePropValue('list','" + nameValue + "','"
									+ typeValue + "');");
					typeToolbarButton2.setAttribute("tooltiptext",
							"Remove Value");
					propertyToolbar.appendChild(typeToolbarButton2);
				} else {
					typeToolbarButton2 = document
							.createElement("toolbarbutton");
					// typeToolbarButton2.setAttribute("image","images/prop_delete.png");
					typeToolbarButton2.setAttribute("onclick",
							"removePropValue('list','" + nameValue + "','"
									+ typeValue + "');");
					typeToolbarButton2.setAttribute("tooltiptext",
							"Remove Value");
					propertyToolbar.appendChild(typeToolbarButton2);
				}
				propList = document.createElement("listbox");
				propList.setAttribute("id", "propList");
				propList.setAttribute("onclick", "listclick(event);");
				if (typeValue == "owl:ObjectProperty") {
					propList.setAttribute("ondblclick", "listdblclick(event);");
				}
				propList.setAttribute("flex", "1");
				for (var j = 0; j < valueList.length; j++) {
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
						lbl.setAttribute("value", value + " (language: " + lang
										+ ")");
						lsti.setAttribute("language", lang);
						lsti.setAttribute("typeValue", typeValue);
					} else {
						lbl.setAttribute("value", value);
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
				for (var j = 0; j < valueList.length; j++) {
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
							txbox.setAttribute("value", value + " (language: "
											+ lang + ")");
							txbox.setAttribute("language", lang);

						} else {
							txbox.setAttribute("value", value);
						}
						txbox.setAttribute("readonly", "true");
						propButton = document.createElement("button");
						propButton.setAttribute("flex", "0");
						if (valueType == "rdfs:Resource") {
							propButton.setAttribute("image",
									"images/individual_remove.png");
							var resImg = document.createElement("image");
							resImg.setAttribute("src",
									"images/individual20x20.png");
							// resImg.setAttribute("ondblclick","resourcedblClick('"+explicit+"','"+value+"');");
							txbox.setAttribute("tooltiptext",
									"Editable Resource");
							txbox.setAttribute("onclick", "resourcedblClick('"
											+ explicit + "','" + value + "');");
							txbox.setAttribute("onmouseover",
									"setCursor('pointer')");
							resImg.setAttribute("onmouseover",
									"setCursor('pointer')");
							txbox.setAttribute("onmouseout",
									"setCursor('default')");
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
						propButton.setAttribute("oncommand",
								"removePropValue('" + value + "','" + nameValue
										+ "','" + typeValue + "');");
						propButton.setAttribute("label", "Remove Value");
						if (explicit == "false") {
							propButton.setAttribute("disabled", "true");
						}
						row2.appendChild(propButton);
						if (valueType == "rdfs:Resource") {
							/*
							 * resToolbar=document.createElement("toolbar");
							 * resToolbar.appendChild(editToolbarButton);
							 * resToolbar.appendChild(txbox);
							 * resToolbar.setAttribute("flex","0");
							 * row2.insertBefore(txbox,propButton);
							 * row2.insertBefore(resToolbar,txbox);
							 */
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
/**
 * @author NScarpato 29/04/2008 populateRepositoryList
 * @param {XMLResponse}
 *            treeList
 */
function populateRepositoryList(treeList) {
	repList = treeList[0].getElementsByTagName('Repository');
	radiogroup = document.getElementById("repositoryList");
	for (var i = 0; i < repList.length; i++) {
		repositoryName = repList[i].getAttribute("repName");
		repBTN = document.createElement("radio");
		repBTN.setAttribute("id", repositoryName);
		repBTN.setAttribute("label", repositoryName);
		radiogroup.appendChild(repBTN);
	}
}
/**
 * @author NScarpato 28/04/2008 manageStartST
 */
function manageStartST() {
	var treeList = responseXML.getElementsByTagName('Tree');
	parameters.start = treeList[0].getElementsByTagName('response')[0]
			.getAttribute("state");
	parameters.baseuri = treeList[0].getElementsByTagName('baseuri')[0]
			.getAttribute("state");
	parameters.state = treeList[0]
			.getElementsByTagName('repositoryImplementation')[0]
			.getAttribute("state");
	parameters.repositoryImplementation = treeList[0]
			.getElementsByTagName('repositoryImplementation')[0]
			.getAttribute("id");
}
