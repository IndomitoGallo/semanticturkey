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
/**NScarpato  */
netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

/**Funzione che crea gli elementi di EditorPanel in base al type*/

 function onAccept() { 
     	var newPrefix=document.getElementById("prefix").value; 	  
     	var parameters = new Object();
	    parameters.importsTree=window.arguments[0].importsTree;
	  	parameters.namespaceTree=window.arguments[0].namespaceTree;
	  	parameters.namespace = window.arguments[0].namespace;	
	  	parameters.importsBox=window.arguments[0].importsBox;	 		 
		//httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=change_prefix&newPrefix="+encodeURIComponent(newPrefix)+"&ns="+encodeURIComponent(parameters.namespace),false,parameters); 
		httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=change_nsprefixmapping&prefix="+encodeURIComponent(newPrefix)+"&ns="+encodeURIComponent(parameters.namespace),false,parameters);
		close();	
}