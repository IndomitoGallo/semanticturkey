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
const langsPrefsEntry="extensions.semturkey.annotprops.langs";
 const defaultLangsPrefsEntry="extensions.semturkey.annotprops.defaultlang";
/**
 * @author NScarpato - ATurbati 28/04/2008
 * populateInitializePanel 
 */
 
 
 function populateInitializePanel() {
 	if ("arguments" in window &&   window.arguments[0] instanceof Components.interfaces.nsIDialogParamBlock) {
	    baseuri = window.arguments[0].GetString(0);
	    state = window.arguments[0].GetString(1);
	    repositoryImplementation = window.arguments[0].GetString(2);
   }
 	if(baseuri!="unavailable"){
 		document.getElementById('baseuri').setAttribute("value",baseuri);
 	}
 	var parameters=new Object();
    parameters.typeR = "list";
 	httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=systemStart&request=listRepositories", false, parameters);
 	if(repositoryImplementation!="unavailable"){
	 	repBTN=document.getElementById(repositoryImplementation);
	 	repBTN.setAttribute("selected","true");
	 }
 }
/**
 * @author NScarpato 15/04/2008
 *  isSelected
 *  Check if the baseUri and the default Namespace of working ontolgy 
 *  are selected  
 */
 function NSIsSelected() {
 	parameters=new Object();
 	parameters.ns="none";
 	httpGetP("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_defaultnamespace",false,parameters);
 	if(parameters.ns!=""){
	 		var NSselected=true;
	 }else{
	 		var NSselected=false;
	 }
 	return NSselected;
 } 
 
  /**
   * @author NScarpato 15/04/2008
   * select baseUri and default Namespace for working ontolgy
   */
   function onAccept() {
   	baseuri=document.getElementById("baseUriTxtBox").value;
   if(baseuri.endsWith('#')){
      			var len=baseuri.length -1;
      			val=baseuri.substring(0,len)
      			_printToJSConsole("value"+val);
      		}
   _printToJSConsole("repimpl "+repositoryImplementation+"baseuri "+baseuri);
   	//richiesta al server per settare baseuri
   	
   	/*
   	if(repositoryImplementation!="unavailable" && isUrl(baseuri)){
   		httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=systemStart&request=start&baseuri="+baseuri+"&repositoryImpl="+repositoryImplementation, false);
   		NSselected=true;
   		close();
   	}else{
   		
   		//alert("please type a valid URI and select a repository " +
   			//	"An example of valid URI is: http://myontology");	
   			prompt("please type a valid URI and select a repository \n An example of valid URI is:","http://myontology");
   			
   	}
     //close();*/
     while(!isUrl(baseuri)){
     	baseuri=prompt("please type a valid URI and select a repository \n An example of valid URI is:","http://myontology");
     }
     if(repositoryImplementation!="unavailable"){
   		httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=systemStart&request=start&baseuri="+baseuri+"&repositoryImpl="+repositoryImplementation, false);
   		NSselected=true;
   		close();
   	}else{
   		//TODO vedere cosa fare nel caso in cui non seleziono il repository di norma se c'è uno è settato di default
   	}
   }
   /**
   * @author NScarpato 15/04/2008
   * onCancel
   */
   function onCancel() {
   	NSselected=false;
   }
   function _printToJSConsole(msg) {
    		//Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService).logStringMessage(msg);
	}
    /**
     * @author NScarpato 17/04/2008
     * manageInput 
     */
     function manageInputBind(type,txbox) {
     	changed=true;
     	var isurl=isUrl(txbox.value);
     	var baseUriTxtBox=document.getElementById("baseUriTxtBox");
     	var nsTxtBox=document.getElementById("nsTxtBox");
     	if(isurl==true){
      		baseUriTxtBox.style.color='blue';
      		nsTxtBox.style.color='blue';	
      	}else{
      		baseUriTxtBox.style.color='red';
      		nsTxtBox.style.color='red';
      	}
     	if(type=="ns"){
     		val=txbox.value;
     		if(txbox.value.endsWith('#')){
      			var len=txbox.value.length -1;
      			val=txbox.value.substring(0,len);
      			_printToJSConsole("value"+val);      			
      		}
     		document.getElementById("baseUriTxtBox").value=val;
     	}else{
     		document.getElementById("nsTxtBox").value=txbox.value+"#";
     	}
     }
     /**
      * @author NScarpato 21/04/2008
      * manageInput 
      */
      function manageInput(type,txbox) {
      	changed=true;
      	var isurl=isUrl(txbox.value);
      	if(isurl==true){
      		txbox.style.color='blue';	
      	}else{
      		txbox.style.color='red';
      	}
      }
     /**
      * @author NScarpato 18/04/2008
      * lostFocus 
      */
      function changeBaseuri_Namespace(type,txbox) {
      	button=document.getElementById("lockBtn");
      	_printToJSConsole("cheked  type"+button.getAttribute("checked"));
      	_printToJSConsole("type "+type);      	
      	if(button.getAttribute("checked")=="true"){
      		_printToJSConsole("son in bind")
      		basetxbox=document.getElementById("baseUriTxtBox");
      		nstxbox=document.getElementById("nsTxtBox");
      		if(changed==true){
		      	var risp=confirm("Save change of baseuri and namespace?");
		 		if(risp){
		      		valBase=basetxbox.value;
		      		if(basetxbox.value.endsWith('#')){
		      			var len=basetxbox.value.length -1;
		      			valBase=basetxbox.value.substring(0,len);   			
		      		}
		      		parameters = new Object();
					parameters.baseuri=valBase;	
		 			if(nstxbox.value.endsWith('#') || nstxbox.value.endsWith('/')){	
						parameters.ns=nstxbox.value;
			     		/*httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=set_baseuri&uri="+encodeURIComponent(valBase),false,parameters);
						httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=set_defaultnamespace&namespace="+encodeURIComponent(nstxbox.value),false,parameters);*/
						httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=set_baseuridnspace&baseuri="+encodeURIComponent(valBase)+"&namespace="+encodeURIComponent(nstxbox.value),false,parameters);
			     	}else{
		      			alert("Default Namespace should end with '#' or '/'");
		      		}
		 		}		
			 }
			 	
      	}else{
	      	if(type=="base"){
	      		if(changed==true){
			      	var risp=confirm("Save change of baseuri?");
			 		if(risp){
			      		valBase=txbox.value;
			      		if(txbox.value.endsWith('#')){
			      			var len=txbox.value.length -1;
			      			valBase=txbox.value.substring(0,len);   			
			      		}
			      		parameters = new Object();
						parameters.baseuri="none";
						httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=set_baseuri&uri="+encodeURIComponent(valBase),false,parameters);
						
			 		}
			 		changed=false;
		 		}
	 		}else{
	 			if(changed==true){
			     	var risp=confirm("Save change of namespace?");
			 		if(risp){
				     	if(txbox.value.endsWith('#') || txbox.value.endsWith('/')){	
				      		parameters = new Object();
							parameters.ns="none";
							httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=set_defaultnamespace&namespace="+encodeURIComponent(txbox.value),false,parameters);
				      	}else{
				      		alert("Default Namespace should end with '#' or '/'");
				      	}
			 		}
			 		changed=false;
	 			}	
	      	}
      	}
     }
 
 /**
  * NScarpato 08/09/2008
  * check if enter key is selected*/
 function checkEnter(e,type,txbox){ //e is event object passed from function invocation
	var characterCode //literal character code will be stored in this variable
	characterCode = e.which 
	if(characterCode == 13){ //if generated character code is equal to ascii 13 (if enter key)
			changeBaseuri_Namespace(type,txbox);
	return false
	}
	else{
		return true
	}

}



      
      /**
      * @author NScarpato 18/04/2008
      * checkbind 
      */
     function checkbind(button){
     	var baseUriTxtBox=document.getElementById("baseUriTxtBox");
     	var nsTxtBox=document.getElementById("nsTxtBox");
     	if(button.checked==true){
     		button.image="images/lock.png";
     		baseUriTxtBox.setAttribute("onkeyup","manageInputBind('base',this);");
     		nsTxtBox.setAttribute("onkeyup","manageInputBind('ns',this);");
     	}else{
     		button.image="images/unlock.png";
     		baseUriTxtBox.setAttribute("onkeyup","manageInput('base',this);");
     		nsTxtBox.setAttribute("onkeyup","manageInput('ns',this);");
     	}
     } 
     /**
      * @author NScarpato 28/04/2008
      * startST 
      */
      function startST() {
      	parameters=new Object();
 		parameters.start="none";
 		parameters.baseuri="none";
 		parameters.state="none";
 		parameters.repositoryImplementation="none";
 		httpGetP("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=systemStart&request=start",false,parameters);
      	if(parameters.start=="negative"){
	      	param = Components.classes["@mozilla.org/embedcomp/dialogparam;1"].createInstance(Components.interfaces.nsIDialogParamBlock);
	 		param.SetNumberStrings(3);
			param.SetString(0, parameters.baseuri);
			param.SetString(1, parameters.state);
			param.SetString(2, parameters.repositoryImplementation);
	      	win = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher); 
	    	win.openWindow(null, "chrome://semantic-turkey/content/initialize.xul", "initialize","chrome,modal,centerscreen",param);
	    	//NScarpato 02/12/2008 add default language property and accepted languages property 
	    	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
 			prefs.setCharPref(langsPrefsEntry,"de,en,es,fr,it,nl,pt,ru");
 			var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
 			prefs.setCharPref(defaultLangsPrefsEntry,"en");	 
 			
      	}
      }
