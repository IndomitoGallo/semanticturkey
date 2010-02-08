//Daniele Bagni, Marco Cappella (2009):script per la gestione delle ontologie e delle relative versioni
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


//Daniele Bagni, Marco Cappella (2009):restituisce i dati della versione selezionata
function getVersioningEntry(isversion) {
	
 	tree = document.getElementById("versioningTree");
    try{
    	currentelement = tree.treeBoxObject.view.getItemAtIndex(tree.currentIndex);
    } catch(e){ 		
 		throw e;
	}
	var result = new Object();
	var treerowp =currentelement.parentNode.parentNode;
	var treerow = currentelement.getElementsByTagName('treerow')[0];
    var treecell = treerow.getElementsByTagName('treecell')[0];
     var treecellp = treerowp.getElementsByTagName('treecell')[0];
      var version=treecell.getAttribute("label");
    var parentName=treecellp.getAttribute("label");

    if(treecell.getAttribute("properties")=="ontology")
    	version = "-NOVERSION-";
    result.version=version;
    result.parentName=parentName;
    
    if(isversion){
    	
		var childs = currentelement.parentNode.childNodes;
		var versionNum=0;
		var releaseNum=-1;
		for(var it = 0;it<childs.length;it++){
			var treerowlast = childs[it].getElementsByTagName('treerow')[0];
			var treecelllast = treerowlast.getElementsByTagName('treecell')[0];
			var ll = treecelllast.getAttribute("label");
			var vn =ll.substring(0,ll.indexOf("."));
			var rn =ll.substring(ll.indexOf(".")+1);
			if(vn>versionNum){
				versionNum=vn;
				releaseNum=rn;
			}
			else if(vn==versionNum){
				if(rn>releaseNum){
					releaseNum=rn;
				}
			}
		}
		result.last = versionNum+"."+releaseNum;
    }
    result.currentelement=currentelement;
	return result;   
}




 var verTree;
 //Daniele Bagni, Marco Cappella (2009):popola il pannello delle versioni
function populateVersioningPanel() {
	var parameters = new Object();
	var server = readServer();
	var type = "ontology";
	verTree= document.getElementById("versioningTree"); 
	parameters.versioningTree = verTree;
	parameters.type = type;
	art_semanticturkey.HttpMgr.GETP("http://"+server+":1979/semantic_turkey/resources/stserver/STServer?service=selectOntology",false, parameters);
	
	var user = readUserType();
    if(user!="Admin"){
    	document.getElementById("DeleteGraph").disabled= true;
      	document.getElementById("Delete").disabled= true;
		document.getElementById("New").disabled= true;
		document.getElementById("NewOntology").disabled= true;
    }
	//set event Handler for remove event
	removeVersioningEntryEvent();
	
	removeGraphVersioningEntryEvent();
	//set event Handler for update event
	selectVersioningEntryEvent();
	//set event Handler for update event
	newVersioningEntryEvent();
	
	newOntologyEntryEvent();
} 

//Daniele Bagni, Marco Cappella (2009):funzione che gestisce l'evento associato al bottone 'delete graph'
function deleteGraphVersioningEntry() {
	try {
		
		var version_datePair = getVersioningEntry(false);
		if(version_datePair.version== "-NOVERSION-")
			alert("You must select a version!");
		else{
			verTree= document.getElementById("versioningTree"); 
			var parametersD = new Object();
			parametersD.version = version_datePair;
			window.openDialog("chrome://semantic-turkey/content/DeleteGraph.xul","_blank","modal=yes,resizable,centerscreen",parametersD);

			
		}	
	}
	catch(e) {
		alert("Please select a version file to delete");
	}
	
}

//Daniele Bagni, Marco Cappella (2009):gestisce l'evento associato al bottone 'delete graph'
 function removeGraphVersioningEntryEvent() {
 	delBTN=document.getElementById("DeleteGraph");
 	delBTN.addEventListener('command', deleteGraphVersioningEntry, true);
 }

//Daniele Bagni, Marco Cappella (2009):gestisce l'evento associato al bottone 'delete version'
function deleteVersioningEntry() {
	try {
		
		var version_datePair = getVersioningEntry(false);
		if(version_datePair.version== "-NOVERSION-")
			alert("You must select a version!");
		else{
			verTree= document.getElementById("versioningTree"); 
			var parametersD = new Object();
			parametersD.version = version_datePair;
			parametersD.tree = verTree;
			parametersD.currentelement = version_datePair.currentelement;
			window.openDialog("chrome://semantic-turkey/content/confirmDelete.xul","_blank","modal=yes,resizable,centerscreen",parametersD);

			
		}	
	}
	catch(e) {
		alert("Please select a version file to delete");
	}
	
}

//Daniele Bagni, Marco Cappella (2009):gestisce l'evento associato al bottone 'delete version'
 function removeVersioningEntryEvent() {
 	delBTN=document.getElementById("Delete");
 	delBTN.addEventListener('command', deleteVersioningEntry, true);
 }

//Daniele Bagni, Marco Cappella (2009):gestisce l'evento associato al bottone 'select'
 function selectVersioningEntryEvent() {
 	upBTN=document.getElementById("Select");
 	upBTN.addEventListener('command', selectVersioningEntry, true);
 }

//Daniele Bagni, Marco Cappella (2009):gestisce l'evento associato al bottone 'select'
function selectVersioningEntry() {
	try {
		var server = readServer()
		var version_parentPair=getVersioningEntry(false);
		if(version_parentPair.version== "-NOVERSION-")
			alert("You must select a version!");
		else{
			
			art_semanticturkey.HttpMgr.GETP("http://"+server+":1979/semantic_turkey/resources/stserver/STServer?service=selectOntology&version="+version_parentPair.parentName+"-"+version_parentPair.version+"&funct=select",false, parameters);
 			saveOnt(version_parentPair.parentName+"-"+version_parentPair.version);
 			window.openDialog('chrome://semantic-turkey/content/changeColor.xul','_blank','modal=yes,resizable,centerscreen', null);
 			window.close();
		}
 	}
	catch(e) {
		alert("Please select a version file");
	}
}

//Daniele Bagni, Marco Cappella (2009):gestisce l'evento associato al bottone 'new version'
 function newVersioningEntryEvent() {
 	upBTN=document.getElementById("New");
 	upBTN.addEventListener('command', newVersioningEntry, true);
 }
 
//Daniele Bagni, Marco Cappella (2009):gestisce l'evento associato al bottone 'new version'
function newVersioningEntry() {
	try {
		var server = readServer()
		var version_parentPair=getVersioningEntry(true);
		var parameters= new Object();
		if(version_parentPair.version== "-NOVERSION-")
			alert("You must select a version!");
		else{
			parameters.version = version_parentPair;
			parameters.tree = verTree; 
			window.openDialog("chrome://semantic-turkey/content/version.xul","_blank","modal=yes,resizable,centerscreen", parameters);
		}
 	}
	catch(e) {
		alert("Please select a version file");
	}
}

//Daniele Bagni, Marco Cappella (2009):gestisce l'evento associato al bottone 'new ontology'
 function newOntologyEntryEvent() {
 	upBTN=document.getElementById("NewOntology");
 	upBTN.addEventListener('command', newOntologyEntry, true);
 }
 
//Daniele Bagni, Marco Cappella (2009):gestisce l'evento associato al bottone 'new ontology'
function newOntologyEntry() {
	try {
		var server = readServer();
		var parameters= new Object();
		parameters.tree = verTree;
		window.openDialog("chrome://semantic-turkey/content/newOnt.xul","_blank","modal=yes,resizable,centerscreen", parameters);

 	}
	catch(e) {
		alert("Please select a version file");
	}
}

