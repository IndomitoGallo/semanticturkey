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
var AnnotateTrigger = new Object();

/*const pageLoaderIface = Components.interfaces.nsIWebPageDescriptor;
const nsISelectionPrivate = Components.interfaces.nsISelectionPrivate;
const nsISelectionController = Components.interfaces.nsISelectionController;
var gBrowser = null;
var gViewSourceBundle = null;
var gPrefs = null;

var gLastLineFound = '';
var gGoToLine = 0;

try {
  var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                              .getService(Components.interfaces.nsIPrefService);
  gPrefs = prefService.getBranch(null);
} catch (ex) {
}

var gSelectionListener = {
  timeout: 0,
  notifySelectionChanged: function(doc, sel, reason)
  {
    // Coalesce notifications within 100ms intervals.
    if (!this.timeout)
      this.timeout = setTimeout(updateStatusBar, 100);
  }
}*/


/*AnnotateTrigger.trigger = function() {
  
      
    if (! Components.classes["@mozilla.org/xpointer-service;1"]) {
	window.alert("Please install the XPointerService from http://xpointerlib.mozdev.org/");
        return;
    }
    
    var focusedWindow = document.commandDispatcher.focusedWindow;
    var wrapper = new XPCNativeWrapper(focusedWindow, 'getSelection()');
    var seln = wrapper.getSelection ();
   
  
  //alert("seln: " + seln + "??);
  
  var xptrService = Components.classes["@mozilla.org/xpointer-service;1"].
           getService().QueryInterface(Components.interfaces.nsIXPointerService);
    
    var xptr = xptrService.createXPointerFromSelection(seln, focusedWindow.document);

  _printToJSConsole(xptr);
    
  return true;
}*/

AnnotateTrigger.trigger = function() {	
	//var xptrService = Components.classes["@mozilla.org/xpointer-service;1"].getService();
	
	//xptrService = xptrService.QueryInterface(Components.interfaces.nsIXPointerService);
	//var xptrString = xptrService.createXPointerFromSelection(window._content.getSelection(), window._content.document);	
	//var ciao = window._content.getSelection();
	/*
	
	var txt = '';
	var foundIn = '';*/
	/*if (window.getSelection)
	{
		
		txt = window._content.getSelection();
		foundIn = 'window.getSelection()';
	}
	else if (document.getSelection)
	{
		txt = document.getSelection();
		foundIn = 'document.getSelection()';
	}
	else if (document.selection)
	{
		txt = document.selection.createRange().text;
		foundIn = 'document.selection.createRange()';
	}
	else return;*/
	/* var xptrService = Components.classes["@mozilla.org/xpointer-service;1"].getService();
	xptrService = xptrService.QueryInterface(Components.interfaces.nsIXPointerService);
	 var xptrString = xptrService.createXPointerFromSelection(window._content.getSelection(), window._content.document);*/
	//var viewsource = window._content.document.body;
	var uri = window._content.document.location.href; 
	
	_printToJSConsole(uri);
	
}



