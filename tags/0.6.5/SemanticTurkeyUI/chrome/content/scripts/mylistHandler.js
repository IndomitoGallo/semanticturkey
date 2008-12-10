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
netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

//NScarpato 22/05/2007 Select a list item whit specified name.
function selectItem(list,valName) {
    // Get the appropriate listitem element
    var mylist = list;
    index=0;
    while(mylist.getItemAtIndex(index)!=null){
    	if (mylist.getItemAtIndex(index).label==valName) {
    		mylist.selectedIndex=index;
			mylist.scrollToIndex(index);
			return;		
    	} 
    }
    
}

function listDragGesture(event) {
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect")
    var mylist = document.getElementById('InstancesList') 
    
        
   /* if (treecell.getAttribute('properties') != "instance") {    		
	return;
    }
    else return; // TODO : manage instance migration
    
    // Only allow dragging of treeitems below main
  //  if (tree.view.getIndexOfItem(treeitem) <= 1) { alert("nodrag"); return }
    // Don't start drag because they are moving the scroll bar!*/
    var row = { }
    var col = { }
    var child = { }
    mylist.listBoxObject.getCellAt(event.pageX, event.pageY, row, col, child)
    if (!col.value) {  return }
    else{
    }
    // CRAPINESS ALERT!
    // If they're moving, (without ctrl down) the target node becomes our sibling
    // above us. If copying, the source node becomes the first child of the target node
   /* var targetNode = getOutlineItem(mylist, row.value)
    // Start packaging the drag data (Which we don't use but have to do anyway)
    var data = new Array(treeitem)
    var ds = Components.classes["@mozilla.org/widget/dragservice;1"].getService(Components.interfaces.nsIDragService);
    var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
    trans.addDataFlavor("text/plain");
    var textWrapper = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
    textWrapper.data = currentOutlineId(); // Get the id of the node bieng dragged
    trans.setTransferData("text/plain", textWrapper, textWrapper.data.length);  // double byte data
    // create an array for our drag items, though we only have one this time
    var transArray = Components.classes["@mozilla.org/supports-array;1"].createInstance(Components.interfaces.nsISupportsArray);
    // Put it into the list as an |nsISupports|
    //var data = trans.QueryInterface(Components.interfaces.nsISupports);
    transArray.AppendElement(trans);
    // Actually start dragging
    ds.invokeDragSession(treeitem, transArray, null, ds.DRAGDROP_ACTION_COPY + ds.DRAGDROP_ACTION_MOVE);
    event.stopPropagation(); // This line was in an example, will test if we need it later...*/
}


function listDragEnter(event) {
window.status = "treeDragEnter";
    event.stopPropagation(); // This line was in an example, will test if we need it later...
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect")
    var ds = Components.classes["@mozilla.org/widget/dragservice;1"].getService(Components.interfaces.nsIDragService);
    var ses = ds.getCurrentSession()
    var list = document.getElementById('InstancesList')
    //tree.treeBoxObject.onDragEnter(event)
    if (ses) { ses.canDrop = 'true' }
}


function listDragOverContentArea ( event )
{
  var validFlavor = false;
  var dragSession = null;
    var list = document.getElementById('InstancesList') 
} // DragOverContentArea



function listDragExit(event) {
   // _printToJSConsole("listDragExit(event)");
   
}


/**NScarpato 24/02/2007 Aggiunto evento dblClick 
*che apre pannello di Editing(editorPanel)*/
function listdblclick(event) {
		var parameters = new Object();
	    parameters.sourceType = "Individual";
	    parameters.sourceElement = event.target;
	    parameters.sourceElementName = event.target.getAttribute("label");
	    //NScarpato 14/03/2008 need deleteForbidden attribute for instance
	    //parameters.deleteForbidden = event.target.getAttribute("deleteForbidden");
	    parameters.sourceParentElementName = event.target.getAttribute("parentCls");
	    parameters.list=document.getElementById('InstancesList');
	    parameters.tree=document.getElementById('outlineTree');
		//parameters.domain="";
		//parameters.range="";
		window.openDialog("chrome://semantic-turkey/content/editorPanel.xul","_blank","modal=yes,resizable,centerscreen",parameters);
}

function listDragDrop(event) {
  	var elementName=event.target.tagName;
  	if(elementName=="listitem"){
	  	var listItem = event.target;
		var ds = Components.classes["@mozilla.org/widget/dragservice;1"].getService(Components.interfaces.nsIDragService);
		var ses = ds.getCurrentSession();
		var list = document.getElementById('InstancesList');
		var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
		var topWindowOfType = windowManager.getMostRecentWindow("navigator:browser");
		var tabWin = topWindowOfType.gBrowser.selectedBrowser.currentURI.spec;	    	    
		tabWin = tabWin.replace(/&/g, "%26");
		var contentDocument = topWindowOfType.gBrowser.selectedBrowser.contentDocument;	
	  	var titleNodes = contentDocument.getElementsByTagName('title');
	  	var title = "";
	  	if (titleNodes != null) {	    	
		var titleNodeChildren = titleNodes[0].childNodes;
	  		for (var i = 0; i < titleNodeChildren.length; i++) {
				if (titleNodeChildren[i].nodeType == 3)
					title = titleNodeChildren[i].nodeValue;
			}
	  	}  
	     	 if (ses.isDataFlavorSupported("text/unicode")) {    
	    	var transferObject = Components.classes["@mozilla.org/widget/transferable;1"].createInstance();	
			transferObject=transferObject.QueryInterface(Components.interfaces.nsITransferable);
			transferObject.addDataFlavor("text/unicode");
			var numItems = ds.numDropItems;
	
	    	for (var i = 0; i < numItems; i++)
	    	{
	    		ds.getData(transferObject, i);
	    	}
		
	 		var str = new Object();
			var strLength = new Object();	 
	    	transferObject.getTransferData("text/unicode", str, strLength);
			if (str) str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
	 		var parameters = new Object();		
			parameters.subjectInstanceName = listItem.getAttribute("label");
			parameters.parentClsName =  listItem.getAttribute("parentCls");  
			parameters.objectInstanceName = str;
			parameters.urlPage = tabWin;
			parameters.title = title;
			parameters.tree = list;	
			parameters.panelTree=document.getElementById('outlineTree');
	    	window.openDialog("chrome://semantic-turkey/content/annotator.xul","_blank","modal=yes,resizable,centerscreen",parameters);
		} 
	} 
	else{
		alert("No Individual Selected!");
	}  	
}
/**
 * @author NScarpato 26/03/2008
 * show or hidden contextmenu's items in particular the remove item 
 * that it's shown only if the ontology it's root ontology
 * showHideItemsList 
 */
function showHideItemsList() {
	list=document.getElementById('InstancesList');
	currentelement = list.selectedItem;
	document.getElementById("deleteInst").setAttribute("disabled", false);
	//document.getElementById("deepDeleteInst").setAttribute("disabled", false);
	var explicit=currentelement.getAttribute("explicit");
	if(explicit=="false"){
		document.getElementById("deleteInst").setAttribute("disabled", true);
		document.getElementById("deepDeleteInst").setAttribute("disabled", true);	
	} 	
}
