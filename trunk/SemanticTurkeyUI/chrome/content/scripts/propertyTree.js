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
/**
 * @author NScarpato 26/03/2008
 * onAccept
 *  
 */
 function onAccept() {
 	var tree = document.getElementById('myAddPropertyTree');
		try{
			var currentelement = tree.treeBoxObject.view.getItemAtIndex(tree.currentIndex);
		}
		catch(e){
	    	alert("Please Select a Property");
	    	return;
	    }
		var treerow = currentelement.getElementsByTagName('treerow')[0];
    	var treecell = treerow.getElementsByTagName('treecell')[0]; 	
	    var selPropName = treecell.getAttribute("label");
	    var selPropType = treecell.getAttribute("properties");
	    if(window.arguments[0].source=="editorProperty"){
				txbox2=window.arguments[0].txbox;
				txbox2.setAttribute("value",selPropName);
		}else{
			window.arguments[0].selectedProp=selPropName;
 			window.arguments[0].selectedPropType=selPropType;
 		}
 		
 }
 
 /**
 * @author NScarpato 26/03/2008
 * onCancel
 *  
 */
 function onCancel() {
 	window.arguments[0].oncancel=true;
 	window.close();
 }