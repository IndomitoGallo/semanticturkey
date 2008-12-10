 /*
  * The contents of this file are subject to the Mozilla Public License
  * Version 1.1 (the "License");  you may not use this file except in compliance
  * with the License.  You may obtain a copy of the License at
  * http://www.mozilla.org/MPL/
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
  * (art.uniroma2.it) at the University of Roma Tor Vergata (ART)
  * Current information about SemanticTurkey can be obtained at 
  * http://semanticturkey.uniroma2.it
  *
  */
const USER_AGENT = "Semantic Turkey";
const RESULT_OK = 0;
const RESULT_PARSE_ERROR = 1;
const RESULT_NOT_FOUND = 2;
const RESULT_NOT_AVAILABLE = 3;
const RESULT_ERROR_FAILURE = 4;


var responseXML;


function httpPost(aURL, sync, tree) {	      			
	var serializer = new XMLSerializer();
	var post = serializer.serializeToString(tree);	
	
	responseXML = null;

	httpReq = new XMLHttpRequest();

	httpReq.open("POST", aURL, sync);
	
	httpReq.onload = httpLoaded;
	httpReq.onerror = httpError;
	httpReq.onreadystatechange = httpReadyStateChange;
	
	try {
		httpReq.setRequestHeader("User-Agent", USER_AGENT);		
		httpReq.setRequestHeader("Content-Type", "application/xml; charset=UTF-8");
		httpReq.overrideMimeType("application/xml");
		httpReq.setRequestHeader("Content-length", post.length); 
		httpReq.setRequestHeader("Connection", "close");
		
	} catch(e) {
		httpGetResult(RESULT_ERROR_FAILURE);
	}

	try {
		
		httpReq.send(post);		
	} catch(e) {			
		httpGetResult(RESULT_ERROR_FAILURE);
	}		
	}	
	
	function httpLoaded(e) {
	responseXML = httpReq.responseXML;
		
				
	var rootNodeName = responseXML.documentElement.localName.toLowerCase();

	switch(rootNodeName) {						
		case "tree":
			httpGetResult(RESULT_OK);
			break;
		default:
			// Not RSS or Atom
			httpGetResult(RESULT_NOT_RSS);
			break;
	}
	} 
	
	function httpError(e) {
	logMessage("HTTP Error: " + e.target.status + " - " + e.target.statusText);
	httpGetResult(RESULT_NOT_AVAILABLE);
}


function httpReadyStateChange() {

	if(httpReq.readyState == 2) {
		try {
			if(httpReq.status == 404) {
				httpGetResult(RESULT_NOT_FOUND);
			}
		} catch(e) {
			httpGetResult(RESULT_NOT_AVAILABLE);
			return;
		}
	} else if(httpReq.readyState == 3) {}
}

function httpGetResult(aResultCode) {	
	
	httpReq.abort();
	
		
	if(aResultCode == RESULT_OK) {				
		var treeList = responseXML.getElementsByTagName('Tree');
		var attr = treeList[0].getAttribute('type');	
		if (attr == "error") {			
			var errorNode = treeList[0].getElementsByTagName('Error')[0];
			alert("Error: " + errorNode.getAttribute("value"));
			return;
		}									
	}
	else if(aResultCode == RESULT_ERROR_FAILURE) {		
	}
} 
