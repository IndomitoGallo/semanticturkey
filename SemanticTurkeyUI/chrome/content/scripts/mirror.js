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
//TODO capire come fungono le eccezioni in JavaScript
function getMirrorEntry() {
 	tree = document.getElementById("mirrorTree");
    try{
    	currentelement = tree.treeBoxObject.view.getItemAtIndex(tree.currentIndex);
    } catch(e){ 		
 		throw e;
	}
	var result = new Object();
	var treerow = currentelement.getElementsByTagName('treerow')[0];
    var treecell = treerow.getElementsByTagName('treecell')[0];
    var baseURI=treecell.getAttribute("label");
    var treecell1 = treerow.getElementsByTagName('treecell')[1];
    var file=treecell1.getAttribute("label");
    result.baseURI=baseURI;
    result.file=file;
	return result;   
}


/**
 *  
 * @return
 */
function populateMirrorPanel() {
	var parameters = new Object();
	parameters.mirrorTree = document.getElementById("mirrorTree"); 
	httpGetP("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=administration&request=getOntologyMirror",false, parameters);
	//set event Handler for remove event
	removeMirrorEntryEvent();
	//set event Handler for update event
	updateMirrorEntryEvent()
} 
/**
 *  
 * NScarpato
 */
function populateImportMirrorPanel(){
	var parameters = new Object();
	parameters.mirrorTree = document.getElementById("mirrorTree"); 
	httpGetP("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=administration&request=getOntologyMirror",false, parameters);
}


/**
 *
 * @return
 */
function deleteMirrorEntry() {
	try {
		var baseURI_FilePair = getMirrorEntry();
		httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=administration&request=deleteOntMirrorEntry&ns="+encodeURIComponent(baseURI_FilePair.baseURI)+"&file="+encodeURIComponent(baseURI_FilePair.file),false);
		var treeChildren = tree.getElementsByTagName('treechildren')[0];
		treeChildren.removeChild(currentelement);
	}
	catch(e) {
		alert("Please select a mirror file to delete");
	}
	
}
/**
 * @author NScarpato 17/03/2008
 * removeMirrorEntryEvent  
 */
 function removeMirrorEntryEvent() {
 	delBTN=document.getElementById("Delete");
 	delItem=document.getElementById("delItem");
 	delBTN.addEventListener('command', deleteMirrorEntry, true);
 	delItem.addEventListener('command', deleteMirrorEntry, true);
 }
/**
 * @author NScarpato 17/03/2008
 * updateMirrorEntryEvent  
 */
 function updateMirrorEntryEvent() {
 	upBTN=document.getElementById("Update");
 	upBTN.addEventListener('command', updateMirrorEntry, true);
 	upItem=document.getElementById("upItem");
	upItem.addEventListener('command', updateMirrorEntry, true);
 }
/**
* NScarpato add no element selected check
* @return
*/
function updateMirrorEntry() {
	try {
		var baseURI_FilePair=getMirrorEntry();
		parameters = new Object();
		parameters.baseURI_FilePair=baseURI_FilePair;
		window.openDialog("chrome://semantic-turkey/content/updateMirror.xul","_blank","modal=yes,resizable,centerscreen",parameters);
 	}
	catch(e) {
		alert("Please select a mirror file to update");
	}
}
/**NScarpato 19/09/2008*/
function updateMirror(){
		var baseURI_FilePair = window.arguments[0].baseURI_FilePair;
		updateOptionList=document.getElementById("updateMirrorOption");
		selectedUpdate=updateOptionList.selectedItem;
		 if(selectedUpdate.getAttribute("id")=="web"){
		 	httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=administration&request=updateOntMirrorEntry&baseURI="+encodeURIComponent(baseURI_FilePair.baseURI)+"&mirrorFileName="+encodeURIComponent(baseURI_FilePair.file)+"&srcLoc=wbu",false);
		 }else if(selectedUpdate.getAttribute("id")=="alt"){
		var newMirrorFilePath = "none"
		while(!isUrl(newMirrorFilePath)){
			newMirrorFilePath=prompt("Insert alternative uri:","","Update Mirror");
			if(newMirrorFilePath==null){
				break;
			}
		}
		if(newMirrorFilePath!=null){		
			httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=administration&request=updateOntMirrorEntry&baseURI="+encodeURIComponent(baseURI_FilePair.baseURI)+"&mirrorFileName="+encodeURIComponent(baseURI_FilePair.file)+"&altURL="+encodeURIComponent(newMirrorFilePath)+"&srcLoc=walturl",false);
		}
	 }else if(selectedUpdate.getAttribute("id")=="local"){
	 	parameters = new Object();
		parameters.baseURI_FilePair=baseURI_FilePair;
	 	window.openDialog("chrome://semantic-turkey/content/updateMirrorFromLocalFile.xul","_blank","modal=yes,resizable,centerscreen",parameters);
	 }
	}
/**
* Make ontology import from mirror
* @return
*/
function onAccept(){
			parameters=new Object();
	  		parameters.importsTree=window.arguments[0].importsTree;
	  		parameters.namespaceTree=window.arguments[0].namespaceTree;
			var tree = document.getElementById("mirrorTree");
		    try{
		    	var currentelement = tree.treeBoxObject.view.getItemAtIndex(tree.currentIndex);
		    }catch(e){
		 		alert("No element selected");
		 		return;
			}
			treerow = currentelement.getElementsByTagName('treerow')[0];
		    treecell = treerow.getElementsByTagName('treecell')[0];
		    namespace=treecell.getAttribute("label");
		    treecell = treerow.getElementsByTagName('treecell')[1];
		    localFile=treecell.getAttribute("label");
		    httpGetP("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=addFromOntologyMirror&baseuri="+encodeURIComponent(namespace)+"&mirrorFile="+encodeURIComponent(localFile),false,parameters);
		}
/**NScarpato 19-09-2008
 * function to update mirror entry by a local file*/		
function onLocalFileAccept(){
	var baseURI_FilePair = window.arguments[0].baseURI_FilePair;
	updateFilePath=document.getElementById("srcLocalFile").value;
	httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=administration&request=updateOntMirrorEntry&baseURI="+encodeURIComponent(baseURI_FilePair.baseURI)+"&mirrorFileName="+encodeURIComponent(baseURI_FilePair.file)+"&updateFilePath="+encodeURIComponent(updateFilePath)+"&srcLoc=lf",false);
	close();
}		
