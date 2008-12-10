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
 * setPanel
 * @param   
 */
 function setPanel() {
 	if(window.arguments[0].typeValue=="owl:AnnotationProperty"){
	 	langLbl=document.createElement("label");
	 	langLbl.setAttribute("id","lblvalue");
	 	langLbl.setAttribute("value","Insert Annotation language:");
	 	row1=document.createElement("row");
	 	row1.appendChild(langLbl);
	 	langMenulist = document.createElement("menulist");
	 	langMenulist.setAttribute("id","langMenu");
	 	langMenupopup = document.createElement("menupopup");
	 	langMenuitem = document.createElement("menuitem"); 
    	langMenuitem.setAttribute("label","de");
    	langMenupopup.appendChild(langMenuitem);
    	langMenuitem = document.createElement("menuitem"); 
    	langMenuitem.setAttribute("label","en");
    	langMenupopup.appendChild(langMenuitem);
    	langMenuitem = document.createElement("menuitem"); 
    	langMenuitem.setAttribute("label","es");
    	langMenupopup.appendChild(langMenuitem);
    	langMenuitem = document.createElement("menuitem"); 
    	langMenuitem.setAttribute("label","fr");
    	langMenupopup.appendChild(langMenuitem);
    	langMenuitem = document.createElement("menuitem"); 
    	langMenuitem.setAttribute("label","it");
    	langMenupopup.appendChild(langMenuitem);
    	langMenuitem = document.createElement("menuitem"); 
    	langMenuitem.setAttribute("label","nl");
    	langMenupopup.appendChild(langMenuitem);
    	langMenuitem = document.createElement("menuitem"); 
    	langMenuitem.setAttribute("label","pt");
    	langMenupopup.appendChild(langMenuitem);
    	langMenuitem = document.createElement("menuitem"); 
    	langMenuitem.setAttribute("label","ru");
    	langMenupopup.appendChild(langMenuitem);
	 	row2=document.createElement("row");
	 	langMenulist.appendChild(langMenupopup);
	 	row2.appendChild(langMenulist);
	 	boxrows=document.getElementById("boxrows");
	 	boxrows.appendChild(row1);
	 	boxrows.appendChild(row2);
	 	if(window.arguments[0].predicatePropertyName=="rdfs:comment"){
		 	var propValue=document.getElementById("newValue");
		 	propValue.setAttribute("multiline","true");
		 	propValue.setAttribute("wrap","on");
		 	txbox.setAttribute("cols","1");
			txbox.setAttribute("rows","3");
		}
		
	 }
	
	 
 }
 function getthetree() {
      	return tree;
  }
 function onAccept() { 
 	range="";
 	parameters = new Object();
	parameters.range=range;
	httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=getRangeClassesTree&propertyQName=" + encodeURIComponent(window.arguments[0].predicatePropertyName),false,parameters);	
  	parameters = new Object();
	parameters.parentBox=window.arguments[0].parentBox;
	parameters.rowBox=window.arguments[0].rowsBox;
	propValue=document.getElementById("newValue").value;
	parameters.propValue=propValue;
	if(window.arguments[0].typeValue=="owl:AnnotationProperty"){
		menu=document.getElementById("langMenu");      
		lang=menu.selectedItem.label;
		//httpGetP("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=createAndAddPropValue&instanceQName="+encodeURIComponent(window.arguments[0].sourceElementName)+"&propertyQName="+encodeURIComponent(window.arguments[0].predicatePropertyName)+"&value="+encodeURIComponent(propValue)+"&rangeClsQName="+encodeURIComponent(parameters.range)+"&lang="+encodeURIComponent(lang),false,parameters);
		httpGetP("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=createAndAddPropValue&instanceQName="+encodeURIComponent(window.arguments[0].sourceElementName)+"&propertyQName="+encodeURIComponent(window.arguments[0].predicatePropertyName)+"&value="+encodeURIComponent(propValue)+"&lang="+encodeURIComponent(lang),false,parameters);
	}else{
		//httpGetP("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=createAndAddPropValue&instanceQName="+encodeURIComponent(window.arguments[0].sourceElementName)+"&propertyQName="+encodeURIComponent(window.arguments[0].predicatePropertyName)+"&value="+encodeURIComponent(propValue)+"&rangeClsQName="+encodeURIComponent(parameters.range),false,parameters);
		httpGetP("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=createAndAddPropValue&instanceQName="+encodeURIComponent(window.arguments[0].sourceElementName)+"&propertyQName="+encodeURIComponent(window.arguments[0].predicatePropertyName)+"&value="+encodeURIComponent(propValue),false,parameters);
	}
    close();
  }
      
	function onCancel() {
 	window.arguments[0].oncancel=true;
 	window.close();
 }
 