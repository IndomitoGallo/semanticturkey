//Daniele Bagni, Marco Cappella (2009):script per la gestione degli utenti
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


//Daniele Bagni, Marco Cappella (2009):restituisce username,tipo e hash dell'utente selezionato
function getUserEntry() {
 	tree = document.getElementById("userTree");
    try{
    	currentelement = tree.treeBoxObject.view.getItemAtIndex(tree.currentIndex);
    } catch(e){ 		
 		throw e;
	}
	var result = new Object();
	var treerow = currentelement.getElementsByTagName('treerow')[0];
    var treecell = treerow.getElementsByTagName('treecell')[0];
    var username=treecell.getAttribute("label");
    var treecell1 = treerow.getElementsByTagName('treecell')[1];
    var hash=treecell1.getAttribute("label");
    var treecell2 = treerow.getElementsByTagName('treecell')[2];
    var type=treecell2.getAttribute("label");
    result.username=username;
    result.hash=hash;
    result.type=type;
	return result;   
}


//Daniele Bagni, Marco Cappella (2009): popola il pannello degli utenti
function populateUserPanel() {
	var parameters = new Object();
	var server = readServer();
	var user = readUserType();
	if(user!="Admin")
		alert("Error: you must be admin!");
	else{
		
		parameters.userTree = document.getElementById("userTree"); 
		art_semanticturkey.HttpMgr.GETP("http://"+server+":1979/semantic_turkey/resources/stserver/STServer?service=userManagement&color=no",false, parameters);
		//set event Handler for remove event
		changeUserTypeEntryEvent();
		deleteUserEntryEvent();
	}
} 

//Daniele Bagni, Marco Cappella (2009): gestisce l'evento associato al bottone 'change type'
 function changeUserTypeEntryEvent() {
 	upBTN=document.getElementById("changeType");
 	upBTN.addEventListener('command', changeUserTypeEntry, true);
 }

//Daniele Bagni, Marco Cappella (2009):funzione associata all'evento che consegue al click sul bottone 'change type'
function changeUserTypeEntry() {
	
	try {
		var server = readServer()
		var uht=getUserEntry();
		var parameters= new Object();
		parameters.hash = uht.hash;
		parameters.user = uht.username;
		parameters.tree = document.getElementById("userTree"); 
		window.openDialog("chrome://semantic-turkey/content/changeUserType.xul","_blank","modal=yes,resizable,centerscreen", parameters);
 	}
	catch(e) {
		alert("Please select a user");
	}
}

//Daniele Bagni, Marco Cappella (2009):funzione associata all'evento associato al bottone 'delete user'
function deleteUserEntry() {
	try {
		var server = readServer();
		var uht=getUserEntry();
		art_semanticturkey.HttpMgr.GETP("http://"+server+":1979/semantic_turkey/resources/stserver/STServer?service=userManagement&color=no&hash="+uht.hash,false, parameters);
		
	}
	catch(e) {
		alert("Please select a user to delete");
	}
	
}

//Daniele Bagni, Marco Cappella (2009):gestisce l'evento associato al bottone 'delete user'
 function deleteUserEntryEvent() {
 	delBTN=document.getElementById("deleteUser");
 	delBTN.addEventListener('command', deleteUserEntry, true);
 }