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


function getOutlineItem(tree, index) {
    // Get the appropriate treeitem element
    // There's a dumb thing with trees in that mytree.currentIndex
    // Shows the index of the treeitem that's selected, but if there is a
    // collapsed branch above that treeitem, all the items in that branch are
    // not included in the currentIndex value, so
    // "var treeitem = mytree.getElementsByTagName('treeitem')[mytree.currentIndex]"
    // doesn't work. 
    var mytree = tree
    if (!mytree) { mytree = document.getElementById('outlineTree') }
    var items = mytree.getElementsByTagName('treeitem')
    for (var i=0; i<items.length; i++) {
        if (mytree.contentView.getIndexOfItem(items[i]) == index) {
            return items[i]
        }
    }
    return null // Should never get here
}



// Returns the currently selected tree item.
function currentOutlineItem(tree) {
    // Get the appropriate treeitem element
    var mytree = tree;
    if (!mytree) { mytree = document.getElementById('outlineTree') }
    if (!mytree) { mytree = document.getElementById('myAddPropertyTree') }
    if (!mytree) { mytree = document.getElementById('myPropertyTree') }
    return getOutlineItem(tree, mytree.currentIndex)
}

// Returns the _exe_nodeid attribute of the currently selected row item
function currentOutlineId(index)
{
    var treeitem = currentOutlineItem()
    return treeitem.getElementsByTagName('treerow')[0].getAttribute('_exe_nodeid')
}

function treeDragGesture(event) {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect")
    var tree = document.getElementById('outlineTree') 
    if (!mytree) { mytree = document.getElementById('myAddPropertyTree') }
    if (!mytree) { mytree = document.getElementById('myPropertyTree') }
    
    var treeitem = currentOutlineItem(tree)
    
    var treerow = treeitem.getElementsByTagName('treerow')[0];
    var treecell = treerow.getElementsByTagName('treecell')[0]; 
        
    if (treecell.getAttribute('properties') != "instance") {    		
	return;
    }
    else return; // TODO : manage instance migration
    
    // Only allow dragging of treeitems below main
  //  if (tree.view.getIndexOfItem(treeitem) <= 1) { alert("nodrag"); return }
    // Don't start drag because they are moving the scroll bar!
    var row = { }
    var col = { }
    var child = { }
    tree.treeBoxObject.getCellAt(event.pageX, event.pageY, row, col, child)
    if (!col.value) {  return }
    // CRAPINESS ALERT!
    // If they're moving, (without ctrl down) the target node becomes our sibling
    // above us. If copying, the source node becomes the first child of the target node
    var targetNode = getOutlineItem(tree, row.value)
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
    
    event.stopPropagation(); // This line was in an example, will test if we need it later...
}


function treeDragEnter(event) {
window.status = "treeDragEnter";
    event.stopPropagation(); // This line was in an example, will test if we need it later...
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect")
    var ds = Components.classes["@mozilla.org/widget/dragservice;1"].getService(Components.interfaces.nsIDragService);
    var ses = ds.getCurrentSession()
    var tree = document.getElementById('outlineTree')
    //tree.treeBoxObject.onDragEnter(event)
    if (ses) { ses.canDrop = 'true' }
}


function DragOverContentArea ( event )
{
  var validFlavor = false;
  var dragSession = null;


    var tree = document.getElementById('outlineTree')
    var row = { }
    var col = { }
    var child = { }
    tree.treeBoxObject.getCellAt(event.pageX, event.pageY, row, col, child)
    var targetNode = getOutlineItem(tree, row.value)
	 //document.getElementById("myout").value = targetNode.id; //ATTENTION! 
	 targetNode.style.backgroundColor = "red";
 	 targetNode.style.color = "red";
  
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	} catch (e) {
		alert("Permission to save file was denied.");
	}
/*	var file = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
		.createInstance( Components.interfaces.nsIFileOutputStream );
*/  
  

//  var dragService =
//    Components.classes["component://netscape/widget/dragservice"].getService(Components.interfaces.nsIDragService);
//     Components.classes["@mozilla.org/netscape/widget/dragservice"].getService(Components.interfaces.nsIDragService);

	var dragService = Components.classes["@mozilla.org/widget/dragservice;1"].
		getService().QueryInterface(Components.interfaces.nsIDragService);
  

  if ( dragService ) {
    dragSession = dragService.getCurrentSession();
    if ( dragSession ) {
      if ( dragSession.isDataFlavorSupported("moz/toolbaritem") )
        validFlavor = true;
      else if ( dragSession.isDataFlavorSupported("text/plain") )
        validFlavor = true;
      //XXX other flavors here...such as files from the desktop?

      if ( validFlavor ) {
        // XXX do some drag feedback here, set a style maybe???

        dragSession.canDrop = true;
        event.stopPropagation();
      }
    }
  }
} // DragOverContentArea



function treeDragExit(event) {
    event.stopPropagation(); // This line was in an example, will test if we need it later...
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect")
    var ds = Components.classes["@mozilla.org/widget/dragservice;1"].getService(Components.interfaces.nsIDragService);
    var ses = ds.getCurrentSession()
    var tree = document.getElementById('outlineTree')
}



function treeDragDrop(event) {  
    event.stopPropagation(); // This line was in an example, will test if we need it later...
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect")
    
    var ds = Components.classes["@mozilla.org/widget/dragservice;1"].getService(Components.interfaces.nsIDragService);
    var ses = ds.getCurrentSession()
    
    var sourceNode = ses.sourceNode;
                 
    if (sourceNode.nodeName == "treeitem") {           
            
    var tree = document.getElementById('outlineTree')
    // We'll just get the node id from the source element
    var nodeId = sourceNode.firstChild.getAttribute('_exe_nodeid')
    // Get the new parent node
    var row = { }
    var col = { }
    var child = { }
    tree.treeBoxObject.getCellAt(event.pageX, event.pageY, row, col, child)
    // CRAPINESS ALERT!
    // If they're moving, (without ctrl down) the target node becomes our sibling
    // above us. If copying, the source node becomes the first child of the target node
    var targetNode = getOutlineItem(tree, row.value)
    
    var treerow = targetNode.getElementsByTagName('treerow')[0];
    var treecell = treerow.getElementsByTagName('treecell')[0]; 
        
    if (treecell.getAttribute('properties') == "instance") {    		
	return;
    }
        
    if (ses.dragAction && ses.DRAGDROP_ACTION_COPY) {
        // Target node is our parent, sourceNode becomes first child
        var parentItem = targetNode
        var sibling = null  // Must be worked out after we get 'container' (treeitems)
        var before = true
    } else {
        // Target node is our sibling, we'll be inserted below (vertically) it on the same tree level
        var parentItem = targetNode.parentNode.parentNode
        var sibling = targetNode
        var before = false
    }

    // Do some sanity checking
    if ((sourceNode == parentItem) || (sourceNode == targetNode)) return;
    var parentItemId = parentItem.firstChild.getAttribute('_exe_nodeid')
    if (sibling && (tree.view.getIndexOfItem(sibling) <= 1)) { return } // Can't drag to top level
    try { if ((parentItem.getElementsByTagName('treechildren')[0].firstChild == sourceNode) && before) { return } // Can't drag into same position
    } catch(e) { } // Ignore when parentItem has no treechildren node
    // Check for recursion
    var node = targetNode.parentNode
    while (node) {
        if (node == sourceNode) { return } // Can't drag into own children
        node = node.parentNode
    }
    // Re-organise the tree...
    // See if parent is a container
    var isContainer = parentItem.getAttribute('container')
    if ((!isContainer) || (isContainer == 'false')) {
        // Make it one
        var container = parentItem.appendChild(document.createElement('treechildren'))
        parentItem.setAttribute('container', 'true')
        parentItem.setAttribute('open', 'true')
    } else {
        var container = parentItem.getElementsByTagName('treechildren')[0]
        // If still haven't got a 'treechildren' node, then make one
        if (!container) {
            var container = parentItem.appendChild(document.createElement('treechildren'))
        }
    }
    // Now we can work out our sibling if we don't already have it
    if (before) { sibling = container.firstChild }
    // Move the node
    var oldContainer = sourceNode.parentNode
    try { oldContainer.removeChild(sourceNode) } catch(e) { } // For some reason works, but still raises exception!
    if (sibling) {  // If the container has children
        // Insert either before or after the sibling
        if (before) {
            if (sibling) {
                container.insertBefore(sourceNode, sibling)
            } else {
                container.appendChild(sourceNode)
            }
        } else {
            // Append after target node
            if (sibling.nextSibling) {
                container.insertBefore(sourceNode, sibling.nextSibling)
            } else {
                container.appendChild(sourceNode)
            }
        }
    } else {
        // Otherwise, just make it be the only child
        container.appendChild(sourceNode)
    }
    // See if the old parent node is no longer a container
    if (oldContainer.childNodes.length == 0) {
        //alert("oldContainer: " + oldContainer.nodeName);
	oldContainer.parentNode.setAttribute('open', 'false') // controlla se da problemi
	oldContainer.parentNode.setAttribute('container', 'false')
        oldContainer.parentNode.removeChild(oldContainer) // Remove the treechildren node
    }
    // Tell the server what happened
    var nextSiblingNodeId = null
    var sibling = sourceNode.nextSibling
    if (sibling) {
        nextSiblingNodeId = sibling.firstChild.getAttribute('_exe_nodeid')
    }
    nevow_clientToServerEvent('outlinePane.handleDrop', this, '', sourceNode.firstChild.getAttribute('_exe_nodeid'), parentItemId, nextSiblingNodeId)
    }//END If nodeName = treeitem
    else {                
    var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
    var topWindowOfType = windowManager.getMostRecentWindow("navigator:browser");
    var tabWin = topWindowOfType.gBrowser.selectedBrowser.currentURI.spec; 
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
    //alert("tabWin" + tabWin); INFO IMPORTANTE
       /*var requestor = topWindowOfType.QueryInterface(Components.interfaces.nsIInterfaceRequestor);
       var nav = requestor.getInterface(Components.interfaces.nsIWebNavigation);
       if (nav) alert("prova" + nav.currentURI.path); */
            
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
    	//TODO here the clipboard is copied to the string str. It has problems with URLs. See http://www.xulplanet.com/tutorials/mozsdk/clipboard.php
    	//see also: http://straxus.javadevelopersjournal.com/creating_a_mozillafirefox_drag_and_drop_file_upload_script_p.htm
	if (str) str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
		
						
	var tree = document.getElementById('outlineTree');
    	// Get the new parent node
    	var row = { }
    	var col = { }
    	var child = { }
    	tree.treeBoxObject.getCellAt(event.pageX, event.pageY, row, col, child)
    	// CRAPINESS ALERT!
    	// If they're moving, (without ctrl down) the target node becomes our sibling
    	// above us. If copying, the source node becomes the first child of the target node
    	var targetNode = getOutlineItem(tree, row.value)
	
		
	var trecell = targetNode.getElementsByTagName("treecell")[0];   
    	var attr = trecell.getAttribute("properties");    		
	
	var temp = trecell.parentNode.parentNode.parentNode.parentNode;
	temp = temp.getElementsByTagName("treerow")[0];
	var parentcell = temp.getElementsByTagName("treecell")[0];

	tabWin = tabWin.replace(/&/g, "%26");
	var parameters = new Object();		
	parameters.subjectInstanceName = trecell.getAttribute("label");  
	parameters.parentClsName = parentcell.getAttribute("label");  
	parameters.objectInstanceName = str;
	parameters.urlPage = tabWin;
	parameters.title = title;
	if (attr == "instance") {   							
		window.openDialog("chrome://semantic-turkey/content/annotator.xul", "_blank","modal=yes,resizable,centerscreen", parameters);
		return;
	}
			
	var trecell = targetNode.getElementsByTagName('treerow')[0].getElementsByTagName('treecell')[0];		
	//tabWin = tabWin.replace("&", "%26");
	httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=annotation&request=createAndAnnotate&clsQName=" + encodeURIComponent(trecell.getAttribute("label")) + "&instanceQName=" + encodeURIComponent(str) + "&urlPage=" + encodeURIComponent(tabWin) + "&title=" + encodeURIComponent(title));      	
	/**NScarpato	
		
	var tr = document.createElement("treerow");
	tr.setAttribute("id", "treerow" + 30);	
	var tc = document.createElement("treecell");
	tc.setAttribute("label", str);
	tc.setAttribute("id","cell-of-treeitem" + 10);		
	tc.setAttribute("properties", "instance");		
	tr.appendChild(tc);
	var ti = document.createElement("treeitem");
	ti.setAttribute("id", "treeitem" + this.itemid);				
	ti.appendChild(tr);		
	
	var treechildren = targetNode.getElementsByTagName('treechildren')[0];
	if (treechildren == null) {
		treechildren = document.createElement("treechildren");	
		targetNode.appendChild(treechildren);
	}
		
		
	if (targetNode.getAttribute('container') == "false") {		
		targetNode.setAttribute('container', 'true');
		targetNode.setAttribute('open', 'true');
	}	
	else if (targetNode.getAttribute('open') == "false") {		
		targetNode.setAttribute('open', 'true');
	}
	
	var firstChild = treechildren.firstChild;			
	if (firstChild == null) {
		treechildren.appendChild(ti);
	}
	else {
    		treechildren.insertBefore(ti, firstChild);
	}/**END NScarpato**/
    }	 
    }
   /*NScarpato 26/05/2008 use xpointerlib to make a range
   try { 
 	   xptrService = Components.classes["@mozilla.org/xpointer-service;1"].getService(); 
 	   xptrService = xptrService.QueryInterface(Components.interfaces.nsIXPointerService); 
    } 
     catch (e) { 
        window.alert("In order to create XPointer fragment identifiers, you must install the " + 
                     "javascript XPointer Service component, available at xpointerlib.mozdev.org/installation.html"); 
 	        return null; 
 	    } 
	var xptrString = xptrService.createXPointerFromSelection(window._content.getSelection(), window._content.document);
	alert("xptrString: \n"+xptrString);
	xpointerEl=xptrString.split(",");
	locationInPage=xptrString.substring(xpointerEl[0].indexOf("html[1]"),xpointerEl[0].length);
	startOffset=parseInt(xpointerEl[2]);
   	highlightStartTag = "<font style='color:blue; background-color:yellow;'>";
   	highlightEndTag = "</font>";
	highlightSearchTermsPosition(window._content.getSelection().toString(),locationInPage,highlightStartTag,highlightEndTag,startOffset);*/
   }
   
    /**NScarpato 26/03/2008
 * show or hidden contextmenu's items in particular the remove item 
 * that it's shown only if the ontology it's root ontology*/
function showHideItems(){
  tree=getthetree();		
  currentelement = tree.treeBoxObject.view.getItemAtIndex(tree.currentIndex);
  treerow = currentelement.getElementsByTagName('treerow')[0];	
  document.getElementById("removeItem").disabled  = false;
  //NScarpato add function for mirror ontologies and download if is failed
	treecell=treerow.getElementsByTagName('treecell')[0];
	var deleteForbidden=treecell.getAttribute("deleteForbidden");
	if(deleteForbidden=="true"){
		 document.getElementById("removeItem").disabled  = true;	
	}
}
 
