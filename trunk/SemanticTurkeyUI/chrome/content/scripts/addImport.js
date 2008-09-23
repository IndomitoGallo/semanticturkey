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
/**NScarpato 02/10/2007 File che contiene le funzioni di Riempimento del Pannello 
 * add Import */
netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");



/**Funzione che crea gli elementi di addImport in base al tipo di import selezionato*/
function initIMP(selectIndex,selectedLabel){
	getDoc().setAttribute("title",selectedLabel);
	mypanel=getPanel();
	rows=getRows();
	if(selectIndex==1 || selectIndex==6){
			var lbl=document.createElement("label");
			lbl.setAttribute("value","Base Uri:");		
			lbl.setAttribute("id","uriLbl");	
			lbl.setAttribute("control","uri");
			var txbox=document.createElement("textbox");
			txbox.setAttribute("value","");
			txbox.setAttribute("id","uri");	
			var row=document.createElement("row");
			row.appendChild(lbl);
			var row1=document.createElement("row");
			row1.appendChild(txbox);
			var row2=document.createElement("row");
			var chkbox=document.createElement("checkbox");
			chkbox.setAttribute("id","alturl");
			chkbox.setAttribute("oncommand","setAlternativeUrl()");
			chkbox.setAttribute("label","Select Alternative Url:");
			row2.appendChild(chkbox);
			
			rows.appendChild(row);
			rows.appendChild(row1);
			rows.appendChild(row2);
			
		}else if(selectIndex==2 || selectIndex==5){			
			var lbl=document.createElement("label");
			lbl.setAttribute("value","Base Uri:");		
			lbl.setAttribute("id","localLbl");	
			lbl.setAttribute("control","local");
			var txbox=document.createElement("textbox");
			txbox.setAttribute("value","");
			txbox.setAttribute("id","uri");	
			
			var lbl1=document.createElement("label");
			lbl1.setAttribute("value","Mirror File:");		
			lbl1.setAttribute("id","uriLbl");	
			lbl1.setAttribute("control","uri");
			var txbox1=document.createElement("textbox");
			txbox1.setAttribute("value","");
			txbox1.setAttribute("id","local");	
			
			var row=document.createElement("row");
			row.appendChild(lbl);
			var row1=document.createElement("row");
			row1.appendChild(txbox);
			var row2=document.createElement("row");
			row2.appendChild(lbl1);
			var row3=document.createElement("row");
			row3.appendChild(txbox1);
			var row4=document.createElement("row");
			var chkbox=document.createElement("checkbox");
			chkbox.setAttribute("id","alturl");
			chkbox.setAttribute("oncommand","setAlternativeUrl()");
			chkbox.setAttribute("label","Select Alternative Url:");
			row4.appendChild(chkbox);
			rows.appendChild(row);
			rows.appendChild(row1);
			rows.appendChild(row2);
			rows.appendChild(row3);
			rows.appendChild(row4);
		}
		else if(selectIndex==3 || selectIndex==7){			
			var lbl=document.createElement("label");
			lbl.setAttribute("value","Base Uri:");		
			lbl.setAttribute("id","baseLbl");	
			lbl.setAttribute("control","base");
			var txbox=document.createElement("textbox");
			txbox.setAttribute("value","");
			txbox.setAttribute("id","base");		
			
			var lbl1=document.createElement("label");
			lbl1.setAttribute("value","Choose Local File:");		
			lbl1.setAttribute("id","srcLocalFileLbl");	
			lbl1.setAttribute("control","srcLocalFile");
			var btn=document.createElement("button");
			btn.setAttribute("id","chooseFile");
			btn.setAttribute("label","select local file");
			btn.setAttribute("onclick","chooseFile();");
			
			var txbox1=document.createElement("textbox");
			txbox1.setAttribute("value","");
			txbox1.setAttribute("id","srcLocalFile");
			
			var lbl2=document.createElement("label");
			lbl2.setAttribute("value","Mirror File:");		
			lbl2.setAttribute("id","destLocalFileLbl");	
			lbl2.setAttribute("control","destLocalFile");
			var txbox2=document.createElement("textbox");
			txbox2.setAttribute("value","");
			txbox2.setAttribute("id","destLocalFile");		
			var row=document.createElement("row");
			row.appendChild(lbl);			
			var row1=document.createElement("row");
			row1.appendChild(txbox);
			row1.appendChild(btn);
			var row2=document.createElement("row");
			row2.appendChild(lbl1);
			var row3=document.createElement("row");
			row3.appendChild(txbox1);
			row3.appendChild(btn);
			var row4=document.createElement("row");
			row4.appendChild(lbl2);
			var row5=document.createElement("row");
			row5.appendChild(txbox2);
			rows.appendChild(row);
			rows.appendChild(row1);
			rows.appendChild(row2);
			rows.appendChild(row3);
			rows.appendChild(row4);
			rows.appendChild(row5);
		}else if(selectIndex==4){
			/*var parameters=new Object();
			parameters.prova="prova";
			alert("Import Tree"+getImportsTree());
	  		parameters.importsTree=getImportsTree();
	  		parameters.namespaceTree=getNamespaceTree();
	  		alert("Namespace Tree"+getNamespaceTree());
			window.open("chrome://semantic-turkey/content/selectFileFromMirror.xul", "showmore", "chrome, modal","add",parameters);
			var lbl=document.createElement("label");
			lbl.setAttribute("value","Base Uri:");		
			lbl.setAttribute("id","baseLbl");	
			lbl.setAttribute("control","base");
			var txbox=document.createElement("textbox");
			txbox.setAttribute("value","");
			txbox.setAttribute("id","base");		
			var lbl1=document.createElement("label");
			lbl1.setAttribute("value","Destination Local File:");		
			lbl1.setAttribute("id","destLocalFileLbl");	
			lbl1.setAttribute("control","destLocalFile");
			var txbox1=document.createElement("textbox");
			txbox1.setAttribute("value","");
			txbox1.setAttribute("id","destLocalFile");	
			
			var row=document.createElement("row");
			row.appendChild(lbl);
			var row1=document.createElement("row");
			row1.appendChild(txbox);
			var row2=document.createElement("row");
			row2.appendChild(lbl1);
			var row3=document.createElement("row");
			row3.appendChild(txbox1);
			rows.appendChild(row);
			rows.appendChild(row1);
			rows.appendChild(row2);
			rows.appendChild(row3);*/
		}
		
}
/**
 * setAlternativeUri
 * NScarpato 20/11/2007 
 */
 function setAlternativeUrl() {
 	sel=document.getElementById("alturl");
 	rows=getRows();
  	if(sel.getAttribute("checked")){
		var txbox=document.createElement("textbox");
		txbox.setAttribute("value","");
		txbox.setAttribute("id","alternativeUrl");
		var row=document.createElement("row");
		row.appendChild(txbox);
		row.setAttribute("id","altrow1");
		rows.appendChild(row);
 	}else{
 		row=document.getElementById("altrow1");
 		rows.removeChild(row);
 	}
 }
  function onAccept() {  
      parameters=new Object();
	  parameters.importsTree=window.arguments[0].importsTree;
	  parameters.namespaceTree=window.arguments[0].namespaceTree;
	  parameters.importsBox=window.arguments[0].importsBox;	 			 		 
   		if(selectItem==1){
			var uri =  document.getElementById("uri").value;    
			sel=document.getElementById("alturl"); 	
			if(sel.getAttribute("checked")){
				var alturl =  document.getElementById("alternativeUrl").value; 
				httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=addFromWeb&baseuri="+encodeURIComponent(uri)+"&alturl="+encodeURIComponent(alturl),false,parameters); 
			}else{	   		
				httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=addFromWeb&baseuri="+encodeURIComponent(uri),false,parameters); 
			}
		}else if(selectItem==2){			
			var local = document.getElementById("local").value; 
			var uri =   document.getElementById("uri").value; 
			sel=document.getElementById("alturl"); 	
			if(sel.getAttribute("checked")){
				var alturl =  document.getElementById("alternativeUrl").value; 
				httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=addFromWebToMirror&baseuri="+encodeURIComponent(uri)+"&mirrorFile="+encodeURIComponent(local)+"&alturl="+encodeURIComponent(alturl),false,parameters); 
			}else{	   		
				httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=addFromWebToMirror&baseuri="+encodeURIComponent(uri)+"&mirrorFile="+encodeURIComponent(local),false,parameters); 
			}    		   		
			
		}
		else if(selectItem==3){			
			var base = document.getElementById("base").value; 
			var srcLocalFile =   document.getElementById("srcLocalFile").value;     		   		
			var destLocalFile =   document.getElementById("destLocalFile").value;     		   		
			httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=addFromLocalFile&baseuri="+encodeURIComponent(base)+"&mirrorFile="+encodeURIComponent(destLocalFile)+"&localFilePath="+encodeURIComponent(srcLocalFile),false,parameters); 
		}else if(selectItem==5){
			var local = document.getElementById("local").value; 
			var uri =   document.getElementById("uri").value; 
			sel=document.getElementById("alturl"); 	
			if(sel.getAttribute("checked")){
				var alturl =  document.getElementById("alternativeUrl").value; 
				httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=downloadFromWebToMirror&baseuri="+encodeURIComponent(uri)+"&mirrorFile="+encodeURIComponent(local)+"&alturl="+encodeURIComponent(alturl),false,parameters); 
			}else{	   		
				httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=downloadFromWebToMirror&baseuri="+encodeURIComponent(uri)+"&mirrorFile="+encodeURIComponent(local),false,parameters); 
			}    		   		
		}else if(selectItem==6){
			var uri =  document.getElementById("uri").value;    
			sel=document.getElementById("alturl"); 	
			if(sel.getAttribute("checked")){
				var alturl =  document.getElementById("alternativeUrl").value; 
				httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=downloadFromWeb&baseuri="+encodeURIComponent(uri)+"&alturl="+encodeURIComponent(alturl),false,parameters); 
			}else{	   		
				httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=downloadFromWeb&baseuri="+encodeURIComponent(uri),false,parameters); 
			}
		}else if(selectItem==7){
			var base = document.getElementById("base").value; 
			var srcLocalFile =   document.getElementById("srcLocalFile").value;     		   		
			var destLocalFile =   document.getElementById("destLocalFile").value;     		   		
			httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=getFromLocalFile&baseuri="+encodeURIComponent(base)+"&mirrorFile="+encodeURIComponent(destLocalFile)+"&localFilePath="+encodeURIComponent(srcLocalFile),false,parameters); 
		}
			close();	
      }