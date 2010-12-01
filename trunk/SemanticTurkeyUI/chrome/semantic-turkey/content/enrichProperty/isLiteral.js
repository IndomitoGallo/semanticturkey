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
if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};
	
 window.onload = function(){
 	var plainButton=document.createElement("button");
 	plainButton.setAttribute("id","plainLiteral");
 	plainButton.setAttribute("label","plainLiteral");
 	plainButton.setAttribute("flex","1");
 	var typedButton=document.createElement("button");
 	typedButton.setAttribute("id","typedLiteral");
 	typedButton.setAttribute("label","typedLiteral");
 	typedButton.setAttribute("flex","1");
 	plainButton.addEventListener("click",art_semanticturkey.isPlainLiteral, true);
	typedButton.addEventListener("click",art_semanticturkey.isTypedLiteral, true);
	var choiseRow =document.getElementById("choiseRow");
	choiseRow.appendChild(plainButton);
	choiseRow.appendChild(typedButton);
	if(window.arguments[0].isLiteral =="undetermined"){
		if(typeof window.arguments[0].objName == 'undefined'){
	 		window.arguments[0].objName  = " new value";
	 	}
	 	var question = "Do you want to add "+window.arguments[0].objName+" as plainLiteral, typedLiteral or as resource?";
	 	document.getElementById("question").setAttribute("value",question);
	 	var resourceButton=document.createElement("button");
	 	resourceButton.setAttribute("id","resource");
	 	resourceButton.setAttribute("label","resource");
	 	resourceButton.setAttribute("flex","1");
	 	var columnrow= document.getElementById("column");
	 	var column = document.createElement("column");
	 	column.setAttribute("flex","1");
	 	columnrow.appendChild(column);
	 	resourceButton.addEventListener("click",art_semanticturkey.isResource, true);
		choiseRow.appendChild(resourceButton);		
		
	}else{
			alert("literal ");
		alert(document.getElementById("question").getAttribute("value"));
	 		
		if(typeof window.arguments[0].objName == 'undefined'){
	 		window.arguments[0].objName  = " new value";
	 	}
	 	var question = "Do you want to add "+window.arguments[0].objName+" as plainLiteral or as typedLiteral?";
	 	document.getElementById("question").setAttribute("value",question);
	}
 };
 
 art_semanticturkey.isPlainLiteral = function(){
 	window.arguments[0].isLiteral = "plainLiteral";
 	close();
 };
 
 art_semanticturkey.isTypedLiteral = function(){
 	window.arguments[0].isLiteral = "typedLiteral";
 	close();
 };
 
 art_semanticturkey.isResource = function(){
 	window.arguments[0].isLiteral = "resource";
 	close();
 };