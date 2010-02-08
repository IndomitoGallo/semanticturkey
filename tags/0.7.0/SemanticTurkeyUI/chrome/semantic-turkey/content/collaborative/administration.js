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
/*function populateMirrorTable(parameters, treeList) {
	var mirrorTree = parameters.mirrorTree;
	node = mirrorTree.getElementsByTagName('treechildren')[0];
	for (var i = 0; i < treeList.length; i++) {
		if (treeList[i].nodeType == 1) {
			nsList = treeList[i].childNodes;
		}
	}
	for (i = 0; i < nsList.length; i++) {
		if (nsList[i].nodeType == 1) {
			parseMirror(nsList[i], node);
		}
	}
}*/

/*function parseMirror(mirrorNode, node) {
	var uri = mirrorNode.getAttribute("ns");
	var tcURI = document.createElement("treecell");
	tcURI.setAttribute("label", uri);

	var file = mirrorNode.getAttribute("file");
	var tcFile = document.createElement("treecell");
	tcFile.setAttribute("label", file);

	var tr = document.createElement("treerow");

	tr.appendChild(tcURI);
	tr.appendChild(tcFile);

	var ti = document.createElement("treeitem");
	ti.appendChild(tr);

	node.appendChild(ti);
}*/

//Daniele Bagni, Marco Cappella (2009):funzione per il popolamento della finestra contenente le risorse credute da più di un utente
	function populateResourceManagementTable(parameters, treeList){
		
			var resourceTree=parameters.resourceTree;
		//if(parameters.type=="ontology"){
			node = resourceTree.getElementsByTagName('treechildren')[0];
			for (var i = 0; i < treeList.length; i++) {	
				if (treeList[i].nodeType == 1) {
					nsList = treeList[i].childNodes;												
				}
			}	
			for (i = 0; i < nsList.length; i++) {			
				if (nsList[i].nodeType == 1) {
					parseResourceManagement(nsList[i], node);			
				}			
			}
	}
	//Daniele Bagni, Marco Cappella (2009):funzione per il popolamento della finestra contenente le versioni delle ontologie
	var ontolName="";
	function populateVersioningTable(parameters, treeList) {
	
		var versioningTree=parameters.versioningTree;
		var createForum = treeList[0].getAttribute('forum');
		node = versioningTree.getElementsByTagName('treechildren')[0];
		var numChild = node.childNodes.length;
		for (var i = 0; i < treeList.length; i++) {	
			if (treeList[i].nodeType == 1) {
				nsList = treeList[i].childNodes;												
			}
		}	
		for (i = 0; i < nsList.length; i++) {			
			if (nsList[i].nodeType == 1) {
				parseVersioning(nsList[i], node,parameters.type);			
			}			
		}
		if(createForum=="yes"){
			for (var i = 0; i < nsList.length; i++) {	
				if (nsList[i].nodeType == 1) {
					var VersionList = nsList[i].getElementsByTagName('Versioning');	
					ontolName=ontolName+"-"+VersionList[0].getAttribute("version");
					var fparameters = new Object();
					fparameters.server = parameters.server;
					fparameters.ontName = ontolName;
					window.openDialog("chrome://semantic-turkey/content/jforumNewForum.xul","_blank","modal=yes,resizable,centerscreen", fparameters);
					break;
				}			
			}
		}
	}

	//Daniele Bagni, Marco Cappella (2009):funzione per il popolamento della finestra contenente gli utenti registrati al tacchino
	function populateUserTable(parameters, treeList) {
		var userTree=parameters.userTree;
		var username =readUserName()
		var treeChildren = userTree.getElementsByTagName('treechildren')[0];	
			//EMPTY TREE
			while(treeChildren.hasChildNodes()){
				treeChildren.removeChild(treeChildren.lastChild);
			}
		
		node = userTree.getElementsByTagName('treechildren')[0];
		for (var i = 0; i < treeList.length; i++) {	
			if (treeList[i].nodeType == 1) {
				nsList = treeList[i].childNodes;												
			}
		}	
		for (i = 0; i < nsList.length; i++) {			
			if (nsList[i].nodeType == 1) {
				parseUser(nsList[i], node,username);			
			}			
		}
	}

	//Daniele Bagni, Marco Cappella (2009):funzione per il popolamento della finestra contenente gli utenti registrati al tacchino
	function parseUser(userNode, node,username) {
		var uri = userNode.getAttribute("Username");	
		var tcURI = document.createElement("treecell");
		tcURI.setAttribute("label",uri);
		var hash = userNode.getAttribute("Hash");
		var tcHash = document.createElement("treecell");
		tcHash.setAttribute("label",hash);
		var file = userNode.getAttribute("Type");
		if(uri==username)
			saveUserType(file);
		var tcFile = document.createElement("treecell");
		if(file.substring(0,6)=="Simple")
			file = "Final User";
		tcFile.setAttribute("label",file);
		
		var tr = document.createElement("treerow");					
		
		tr.appendChild(tcURI);
		tr.appendChild(tcHash);
		tr.appendChild(tcFile);
		
		var ti = document.createElement("treeitem");					
		ti.appendChild(tr);
		
		node.appendChild(ti);		
	}
	
	//Daniele Bagni, Marco Cappella (2009):funzione per il popolamento della finestra contenente le risorse credute da più di un utente
	function parseResourceManagement(resourceManagementNode, node){
		
		var resName = resourceManagementNode.getAttribute("resourceName");	
		var tcresName = document.createElement("treecell");
		tcresName.setAttribute("label",resName);
		var numContext = resourceManagementNode.getAttribute("numContext");
		var tcnumContext = document.createElement("treecell");
		tcnumContext.setAttribute("label",numContext);
		if(resourceManagementNode.getAttribute('alert')=="yes"){
			tcresName.setAttribute("properties","red"+resourceManagementNode.getAttribute('type'));
			tcnumContext.setAttribute("properties","nred"+resourceManagementNode.getAttribute('type'));
		}else{
			tcresName.setAttribute("properties",resourceManagementNode.getAttribute('type'));
			tcnumContext.setAttribute("properties","n"+resourceManagementNode.getAttribute('type'));
		}
		var tr = document.createElement("treerow");					
		
		tr.appendChild(tcresName);
		tr.appendChild(tcnumContext);
		
		var ti = document.createElement("treeitem");					
		ti.appendChild(tr);
		
		node.appendChild(ti);	
		
	}
	
	//Daniele Bagni, Marco Cappella (2009):funzione per il popolamento della finestra contenente le versioni delle ontologie
	function parseVersioning(versioningNode, node, type) {
	
		if(type=="ontology"){
			
			var tr = document.createElement("treerow");
			var tc = document.createElement("treecell");
			ontolName=versioningNode.getAttribute("ontology");
			tc.setAttribute("label",ontolName);
			
			var tcc = document.createElement("treecell");
			tcc.setAttribute("label","Last Version: "+versioningNode.getAttribute("date"));
			tr.appendChild(tc);
			tr.appendChild(tcc);
		
			var tiont = document.createElement("treeitem");
			tiont.setAttribute("open", true);
			tiont.setAttribute("container", true);
			tiont.appendChild(tr);		
			var tch = document.createElement("treechildren");	
		
			var VersionList = versioningNode.getElementsByTagName('Versioning');	

			for (var i = 0; i < VersionList.length; i++) {
				var tr1 = document.createElement("treerow");
				var tc1 = document.createElement("treecell");
				tc1.setAttribute("label",VersionList[i].getAttribute("version"));
				tc1.setAttribute("properties","version");
				tr1.appendChild(tc1);
				var tc2 = document.createElement("treecell");
				tc2.setAttribute("label",VersionList[i].getAttribute("date"));
				tr1.appendChild(tc2);
				var ti1 = document.createElement("treeitem");
				ti1.appendChild(tr1);	
				ti1.setAttribute("id","old");
				tch.appendChild(ti1);
			}
			tc.setAttribute("properties","ontology");
			tiont.appendChild(tch);
			node.appendChild(tiont);
		}
		else {
			var tiont1 = node.childNodes;
			for (var j = 0; j < tiont1.length; j++) {	
				var trtch = tiont1[j].childNodes;
				var tc11 = trtch[0].childNodes;
				ontolName=versioningNode.getAttribute("ontology");
				if (tc11[0].getAttribute("label") == ontolName) {
					var VersionList = versioningNode.getElementsByTagName('Versioning');	
				
					for (var i = 0; i < VersionList.length; i++) {
						
						var tr1 = document.createElement("treerow");
						var tc1 = document.createElement("treecell");
					
						tc1.setAttribute("label",VersionList[i].getAttribute("version"));
						tc1.setAttribute("properties","version");
						tr1.appendChild(tc1);
						var tc2 = document.createElement("treecell");
						tc2.setAttribute("label",VersionList[i].getAttribute("date"));
						tr1.appendChild(tc2);
						
						var ti1 = document.createElement("treeitem");
						ti1.setAttribute("id","new");
						ti1.appendChild(tr1);
							
						trtch[0].appendChild(ti1);
					}
				}
			}
		}	
	}