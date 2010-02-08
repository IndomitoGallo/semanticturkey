//Daniele Bagni, Marco Cappella (2009): script per l'inoltro al server della richiesta di tutte le risorse credute da più di un utente
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

if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};
Components.utils.import("resource://stmodules/SemTurkeyHTTP.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);


 var resourceTree;
function populateResourceManagementPanel() {
	var parameters = new Object();
	var server = readServer();
	var type = "ontology";
	resourceTree= document.getElementById("resourceManagementTree"); 
	parameters.resourceTree = resourceTree;
	parameters.type = type;
	art_semanticturkey.HttpMgr.GETP("http://"+server+":1979/semantic_turkey/resources/stserver/STServer?service=getResourceNumContexts",false, parameters);
	
	
} 
