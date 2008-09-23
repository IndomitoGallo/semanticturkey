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
function abilita(){
	document.getElementById("viewSageSidebar").setAttribute("disabled", false);
	document.getElementById("viewSageSidebar2").setAttribute("disabled", false);
	document.getElementById("visualization2").setAttribute("disabled", false);
}


function disabilita(){
	document.getElementById("viewSageSidebar").setAttribute("disabled", true);
	document.getElementById("viewSageSidebar2").setAttribute("disabled", true);
	document.getElementById("visualization2").setAttribute("disabled", true);
}

function repositoryChosen(idRepository){
	document.getElementById("viewSageSidebar").setAttribute("disabled", false);
	document.getElementById("viewSageSidebar2").setAttribute("disabled", false);
	document.getElementById("visualization2").setAttribute("disabled", false);
	document.getElementById(idRepository).setAttribute("checked", true);
	
	document.getElementById("menuRepositoryM").setAttribute("hasChosen", "true")
	
	var list = document.getElementById("menuRepositoryMP").getElementsByTagName("menuitem");
	//_printToJSConsole("in menuRepositoryMP ci sono "+list.length+" elementi"); // da cancellare
	for(var i=0; i<list.length; i++){
		list[i].setAttribute("disabled", true);
	}
	closeSidebar();
}

function choseRepository(idRepository){
	var parameters=new Object();
    parameters.typeR = "chosen";
    //_printToJSConsole("*****2 choseRepository: "+idRepository); // da cancellare
	httpGetP("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=repositoryChoice&repository="+idRepository, false, parameters);
}

function isRepLoaded(){
	//_printToJSConsole("*isRepLoaded*"); // da cancellare
	//_printToJSConsole("document.getElementById(\"viewSageSidebar\"): "+document.getElementById("viewSageSidebar")); // da cancellare
	var isLoaded;
	if(document.getElementById("visualization2") != null){ 
		//isLoaded =  document.getElementById("visualization2").getAttribute("disabled");
		isLoaded =  document.getElementById("menuRepositoryM").getAttribute("hasChosen");
	}
	else{
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
        .getInterface(Components.interfaces.nsIWebNavigation)
        .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
        .rootTreeItem
        .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
        .getInterface(Components.interfaces.nsIDOMWindow);
		//_printToJSConsole("mainWindow: "+mainWindow);
		//_printToJSConsole("mainWindow.getElementById(\"viewSageSidebar\"): "+mainWindow.getElementById("viewSageSidebar"));
		isLoaded = mainWindow.document.getElementById("menuRepositoryM").getAttribute("hasChosen");
	}
	//_printToJSConsole("+++++++++++++++++++++ isLoaded: "+isLoaded);
	if( isLoaded == "false" ){
		return false;
	}
	return true;
}

function hasAlreadyAsk() {
	var hasAsked =  document.getElementById("menuRepositoryM").getAttribute("hasAsked");
	if( hasAsked == "false" ){
		return false;
	}
	return true;
}

function trySendMsg(){
	var parameters=new Object();
	parameters.typeR = "list";
	//_printToJSConsole("mando messaggio");
	httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=repositoryChoice", false, parameters);
	//_printToJSConsole("messaggio mandato");
}

function closeSidebar(){
	var titleSB = document.getElementById("sidebar-title").getAttribute("value");
	//_printToJSConsole("$$$$$$$$$$$$$$$$$$$$$$$$$$$$ titleSB "+titleSB);
	//_printToJSConsole("$$$$$$$$$$$$$ stateSB2 "+stateSB2);
	if((titleSB == "Ontology Panel") || (titleSB == "Imports Management")){
	//if(titleSB == "Segnalibri"){
		  toggleSidebar();
		// nel caso non si sia riuscita a chiudere la sidebar con in questo tentativo
		//_printToJSConsole("$$$$$$$$$$$$$$$$$$$$$$$$$$$$ CHIUSA SIDEBAR");
		setTimeout("closeSidebar()", 400); 
	}
	/*
	if(stateSB1 == "false"){
		document.getElementById("viewSageSidebar").setAttribute("disabled", true);
	}
	if(stateSB2 == "false"){
		document.getElementById("viewSageSidebar2").setAttribute("disabled", true);
	}
	*/
}

