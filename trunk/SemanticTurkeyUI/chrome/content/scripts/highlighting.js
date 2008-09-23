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
/*
 * This is the function that actually highlights a text string by
 * adding HTML tags before and after all occurrences of the search
 * term. You can pass your own tags if you'd like, or if the
 * highlightStartTag or highlightEndTag parameters are omitted or
 * are empty strings then the default <font> tags will be used.
 */
function doHighlight(bodyText, searchTerm, highlightStartTag, highlightEndTag) 
{
  // the highlightStartTag and highlightEndTag parameters are optional
  if ((!highlightStartTag) || (!highlightEndTag)) {
    highlightStartTag = "<font style='color:blue; background-color:yellow;'>";
    highlightEndTag = "</font>";
  }
  
  // find all occurences of the search term in the given text,
  // and add some "highlight" tags to them (we're not using a
  // regular expression search, because we want to filter out
  // matches that occur within HTML tags and script blocks, so
  // we have to do a little extra validation)
  var newText = "";
  var i = -1;
  var lcSearchTerm = searchTerm.toLowerCase();
  var lcBodyText = bodyText.toLowerCase();
    
  while (bodyText.length > 0) {
    i = lcBodyText.indexOf(lcSearchTerm, i+1);
    if (i < 0) {
      newText += bodyText;
      bodyText = "";
    } else {
      // skip anything inside an HTML tag
      if (bodyText.lastIndexOf(">", i) >= bodyText.lastIndexOf("<", i)) {
        // skip anything inside a <script> block
        if (lcBodyText.lastIndexOf("/script>", i) >= lcBodyText.lastIndexOf("<script", i)) {
          newText += bodyText.substring(0, i) + highlightStartTag + bodyText.substr(i, searchTerm.length) + highlightEndTag;
          bodyText = bodyText.substr(i + searchTerm.length);
          lcBodyText = bodyText.toLowerCase();
          i = -1;
        }
      }
    }
  }
  
  return newText;
}
/**NScarpato 28/05/2008*/
function doHighlightPosition(bodyText,locationInPage,searchTerm, highlightStartTag, highlightEndTag,startOffset) 
{
  // the highlightStartTag and highlightEndTag parameters are optional
  if ((!highlightStartTag) || (!highlightEndTag)) {
    highlightStartTag = "<font style='color:blue; background-color:yellow;'>";
    highlightEndTag = "</font>";
  }
  
  // find all occurences of the search term in the given text,
  // and add some "highlight" tags to them (we're not using a
  // regular expression search, because we want to filter out
  // matches that occur within HTML tags and script blocks, so
  // we have to do a little extra validation)
  var newText = "";
  var lcSearchTerm = searchTerm.toLowerCase();
  var lcBodyText = bodyText.toLowerCase();
  app=lcBodyText;
  startPos=0;
  	p=locationInPage.split("/");
    for(var y=0; y<p.length; y++) {
    	nodeName=p[y].substring(p[y],p[y].indexOf('['))
		nodePos=p[y].substring(p[y].indexOf('[')+1,p[y].indexOf(']'));
		 parseInt(nodePos);
		for(var k=0; k<nodePos; k++){		
    		app=app.substr(app.indexOf("<"+nodeName)+1+nodeName.length);
		}		
    }
    app=app.substr(app.indexOf(">")+1);
   
    startPos=bodyText.length-app.length;
	alert("findTextannotation(app, annotation)");   
   // findTextannotation(app, searchTerm);
    //non contare i caratteri tra <>
    /*addonOffset=0;
    i=0;
    l=0;
    alert(app);
    while(i<startOffset){
    	if(app.indexOf("<") < startOffset+searchTerm.length){
    		c=app.charAt(l);
    		l++;
			if(c!="<"){
				alert("letto carattere "+c);
				i++;
			}else{
				alert("letto carattere "+c);
				addonOffset+=app.indexOf(">")-app.indexOf("<");
				app=app.substr(app.indexOf(">")+1);
				l=0;
				alert("app addon\n"+app);	
			}		
    	}else{
    		i=startOffset;
    	}
    }
    alert("addonOffset"+addonOffset);
   // startPos=startPos+addonOffset;*/
    
    alert(app);
    //startPos=startPos+startOffset;
    alert("startPos Finale "+startPos);
    startPos = bodyText.indexOf(searchTerm, startPos+1);
    alert(startPos);
    newText += bodyText.substring(0, startPos) + highlightStartTag + bodyText.substr(startPos, searchTerm.length) + highlightEndTag+bodyText.substr(startPos+searchTerm.length);          	
  	return newText;
  	
}
/*
 * This is sort of a wrapper function to the doHighlight function.
 * It takes the searchText that you pass, optionally splits it into
 * separate words, and transforms the text on the current web page.
 * Only the "searchText" parameter is required; all other parameters
 * are optional and can be omitted.
 */
 /**NScarpato 28/05/2008*/
function highlightSearchTermsPosition(searchText,locationInPage, highlightStartTag, highlightEndTag,startOffset)  
{
 
  //NScarpato 
  var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
    var topWindowOfType = windowManager.getMostRecentWindow("navigator:browser");
    var tabWin = topWindowOfType.gBrowser.selectedBrowser.currentURI.spec; 
    var contentDocument = topWindowOfType.gBrowser.selectedBrowser.contentDocument;	
    
  
  if (!contentDocument.body || typeof(contentDocument.body.innerHTML) == "undefined") {
    if (warnOnFailure) {
      alert("Sorry, for some reason the text of this page is unavailable. Searching will not work.");
    }
    return false;
  }
  
  
  var bodyText = contentDocument.body.innerHTML;
    alert(" startOffset"+startOffset);
    bodyText = doHighlightPosition(bodyText,locationInPage,searchText, highlightStartTag, highlightEndTag,startOffset);
 
  
  contentDocument.body.innerHTML = bodyText;
  return true;
}

function highlightSearchTerms(searchText, treatAsPhrase, warnOnFailure, highlightStartTag, highlightEndTag)
{
  // if the treatAsPhrase parameter is true, then we should search for 
  // the entire phrase that was entered; otherwise, we will split the
  // search string so that each word is searched for and highlighted
  // individually
  if (treatAsPhrase) {
    searchArray = [searchText];
  } else {
    searchArray = searchText.split(" ");
  }
  //NScarpato 
  var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
    var topWindowOfType = windowManager.getMostRecentWindow("navigator:browser");
    var tabWin = topWindowOfType.gBrowser.selectedBrowser.currentURI.spec; 
    var contentDocument = topWindowOfType.gBrowser.selectedBrowser.contentDocument;	
    
  
  if (!contentDocument.body || typeof(contentDocument.body.innerHTML) == "undefined") {
    if (warnOnFailure) {
      alert("Sorry, for some reason the text of this page is unavailable. Searching will not work.");
    }
    return false;
  }
  
  var bodyText = contentDocument.body.innerHTML;
  for (var i = 0; i < searchArray.length; i++) {
    bodyText = doHighlight(bodyText, searchArray[i], highlightStartTag, highlightEndTag);
  }
  
  contentDocument.body.innerHTML = bodyText;
  return true;
}
function findTextannotation(doc, annotation) {                  
      var childNodes = doc.childNodes;    
      alert(childNodes);   
      //var regex = new RegExp("[ a-z0-9]*12:[ a-z0-9]*");
      //var regex = new RegExp("[ a-z0-9]*06[ a-z0-9]*");
      var regex = new RegExp("[ a-z0-9]*" + annotation + "[ a-z0-9]*");
      //var regex = new RegExp("[ a-z0-9]*[+]*[0-9]+[.]*[0-9]{4,}[.]*[0-9]+[.]*[0-9]+[ a-z0-9]*");
      for (var i = 0; i < childNodes.length; i++) {
      	//_printToJSConsole("name: " + childNodes[i].nodeName);
	if (childNodes[i].nodeType == 1) {
		findTextannotation(childNodes[i], annotation);
	}
      	if (childNodes[i].nodeType == 3) {
		//_printToJSConsole("value: " + childNodes[i].nodeValue);		
		var tokens = childNodes[i].nodeValue.split(' ');		
		for (var j = 0; j < tokens.length; j++) {			
			if (tokens[j] != null) {				
				if (regex.test(tokens[j])) {													
					_printToJSConsole("nodeValue: " + childNodes[i].nodeValue);
					var temp = childNodes[i].nodeValue.split(tokens[j]);								
					
					//_printToJSConsole("length: " + temp.length);
					
					var parentNode = childNodes[i].parentNode;										
					parentNode.removeChild(childNodes[i]);			 								
					
					var textNode1 = document.createTextNode(temp[0]);
					parentNode.appendChild(textNode1);
									
					var newSpan = document.createElement("div");
					newSpan.setAttribute("style", "background-color:yellow");					
					
					var textNode2 = document.createTextNode(tokens[j]);
					newSpan.appendChild(textNode2);
					
					parentNode.appendChild(newSpan);
															
					if (temp[1] != null) { 
						var textNode3 = document.createTextNode(temp[1]);  
						parentNode.appendChild(textNode3);										
					}
					
					var k = 2;
					if (k < temp.length) {
						while (k < temp.length) {
							_printToJSConsole("temp: " + temp[k]);
							var newSpan = document.createElement("div");
							newSpan.setAttribute("style", "background-color:yellow");					
							
							var textNode2 = document.createTextNode(tokens[j]);
							newSpan.appendChild(textNode2);
					
							parentNode.appendChild(newSpan)
							
							var textNode = document.createTextNode(temp[k]);
							parentNode.appendChild(textNode);
							
							k++;
						}
					}															
				}
			}
		}
	}	
    }
}

/*
 * This displays a dialog box that allows a user to enter their own
 * search terms to highlight on the page, and then passes the search
 * text or phrase to the highlightSearchTerms function. All parameters
 * are optional.
 */
function searchPrompt(defaultText, treatAsPhrase, textColor, bgColor)
{
  // This function prompts the user for any words that should
  // be highlighted on this web page
  if (!defaultText) {
    defaultText = "";
  }
  
  // we can optionally use our own highlight tag values
  if ((!textColor) || (!bgColor)) {
    highlightStartTag = "";
    highlightEndTag = "";
  } else {
    highlightStartTag = "<font style='color:" + textColor + "; background-color:" + bgColor + ";'>";
    highlightEndTag = "</font>";
  }
  
  if (treatAsPhrase) {
    promptText = "Please enter the phrase you'd like to search for:";
  } else {
    promptText = "Please enter the words you'd like to search for, separated by spaces:";
  }
  
  searchText = prompt(promptText, defaultText);

  if (!searchText)  {
    alert("No search terms were entered. Exiting function.");
    return false;
  }
  
  return highlightSearchTerms(searchText, treatAsPhrase, true, highlightStartTag, highlightEndTag);
}






