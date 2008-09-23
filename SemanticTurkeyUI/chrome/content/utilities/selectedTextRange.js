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
function ahyObjSelectedTextRange()    
            {    
                this.ahyMousedownContainer = null;
                this.ahyMouseupContainer = null;
                this.ahySelection = null;
                this.ahySelectionString = null;
                this.ahySelectionLength = null;
                this.ahy_StartSelect = ahy_StartSelect;    
                this.ahy_EndSelect = ahy_EndSelect;    
                function ahy_StartSelect(event){    
                    if (event.altKey){
                        this.ahyMousedownContainer = event.target;
                    }
                }    
                function ahy_EndSelect(event)    
                {    
                    if (event.altKey){
                        this.ahyMouseupContainer = event.target;
                        var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
   						var topWindowOfType = windowManager.getMostRecentWindow("navigator:browser");
   						var tabWin = topWindowOfType.gBrowser.selectedBrowser.currentURI.spec; 
    					var contentDocument = topWindowOfType.gBrowser.selectedBrowser.contentDocument;
                        this.ahySelection = contentDocument.getSelection();
                        this.ahySelectionString = this.ahySelection.toString();
                        this.ahySelectionLength = this.ahySelectionString.length;
                        var intSelectionAnchorOffset = this.ahySelection.anchorOffset;
                        var intSelectionFocusOffset = this.ahySelection.focusOffset;
                        //=====================================
                        if(this.ahySelectionLength == 0){
                            alert("Zero Characters Selected");
                            return false;
                        }
                         alert("this.ahySelectionString : "+this.ahySelectionString+"\n this.ahySelection.anchorOffset : "+this.ahySelection.anchorOffset+"\n this.ahySelection.anchorOffset : "+this.ahySelection.anchorOffset);
                    }
                }    
            }    

            function ahy_DoOnLoad()    
            {    
                    if(window.getSelection){    
                            var blnRangeImplemented = document.implementation.hasFeature("Range", "2.0");    
                            if(blnRangeImplemented){    
                                    objSelectedTextRange = new ahyObjSelectedTextRange();    
                                    document.addEventListener("mousedown", objSelectedTextRange.ahy_StartSelect, false);    
                                    document.addEventListener("mouseup", objSelectedTextRange.ahy_EndSelect, false);    
                            }else{    
                                    alert("Sorry, but your browser does not support the W3C Level 2 DOM Range API.");
                            }    
                    }else{    
                            alert("Sorry, but your browser does not support the window.getSelection() method.");
                    }    
            }

		function rangeEvent(){
            if(window.addEventListener){
                window.addEventListener("load", ahy_DoOnLoad, false);
            }else{
                alert("Sorry, but your browser does not support the addEventListener() method.");
            }
            }