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

/*
 * The ST SPARQL Editor is built on the Flint SPARQL Editor
 * (http://openuplabs.tso.co.uk/demos/sparqleditor) as per the commit e88ec79911
 * (https://github.com/TSO-Openup/FlintSparqlEditor/commit/e88ec79911e9c933171ca6c11c59d6ede833b88b).
 */

if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/AnnotationManager.jsm", art_semanticturkey);

window.onload = function() {
	document.getElementById("acceptButton").addEventListener("command", function(){
		document.documentElement.acceptDialog();
	}, false);
	
	document.getElementById("cancelButton").addEventListener("command", function(){
		document.documentElement.cancelDialog();
	}, false);

	
	function createEditor(textarea, atoms) {
		var popuplist = document.createElement("popuplist");
		var completionsMenu = document.createElement("panel");
		completionsMenu.setAttribute("style", "padding: 0");
		completionsMenu.setAttribute("level", "top");

		document.documentElement.appendChild(popuplist);
		popuplist.appendChild(completionsMenu);


		/*
		 * var stIsStarted = art_semanticturkey.ST_started.getStatus(); if
		 * (stIsStarted == "false") { var eventSparqlSTStartedObject = new
		 * art_semanticturkey.eventListener("st_started",
		 * art_semanticturkey.enableSPARQLSubmitQuery, null);
		 * document.getElementById("submitQuery").disabled = true; }
		 */
	
		// ----------------------------------------------------------------
		// Error marking code. cmUpdate is called upon change in the editor
		// so that it can underly errors.
		var markers = [];
		
		var cmUpdate = function() {
			markers.forEach(function(m){m.clear();});
			
			var state = cm.getStateAfter();
			
			markers = state.errorMarkers.map(function(m){
				return cm.markText(m.begin, m.end, "cm-sp-error");
			});
			
			art_semanticturkey.enableAcceptButton(state.isValid());
		}
		// End of error marking code
			
		function autocompleteKeyEventHandler(i, e) {
			if (e.keyCode == 32 && (e.ctrlKey || e.metaKey) && !e.altKey) {
				e.preventDefault();
				startComplete();
			}
		}	
		
		function startComplete() {
			// We want a single cursor position.
			if (cm.somethingSelected())
				return;
	
			// Find the token at the cursor
			var cur = cm.getCursor(false);
			var cur1 = {
				line : cur.line,
				ch : cur.ch
			};
	
			// Before cursor
			var charBefore = cm.getRange({
				line : cur.line,
				ch : cur.ch - 1
			}, {
				line : cur.line,
				ch : cur.ch
			});
	
			// Cursor position on the far left (ch=0) is problematic
			// - if we ask CodeMirror for token at this position, we don't
			// get back the token at the beginning of the line
			// - hence use adjusted position cur1 to recover this token.
			if (cur1.ch == 0 && cm.lineInfo(cur1.line).text.length > 0)
				cur1.ch = 1;
	
			var token = cm.getTokenAt(cur1);
			
			if (token.className != "sp-var" && token.end != cur.ch) {
				return;
			}
			
			var completions = [];
			var tempCompletions = token.state.getPossibles();
						
			for (var i = 0 ; i < tempCompletions.length ; i++) {
				if (tempCompletions[i] != 'ATOM') {
					completions.push({label : tempCompletions[i], value : tempCompletions[i]});
				} else {
					atoms.forEach(function(v){completions.push({label : v, value : v})});					
				}
			}
			
			if (token.className == "sp-invalid") {
				completions = completions.filter(function(v){return v.value.startsWith(token.string);});
			} else if(token.className == "sp-var") {
				completions = atoms.filter(function(a){return a.startsWith(token.string) && a != token.string;}).map(function(a) {return {label : a, value : a}}).concat(completions);
			}
			
			if (completions.length == 0) {
				return;
			}
			
			if (completions.length == 1) {
				insertReplacement(completions[0].value);
				return;
			}

			// Build the select widget
			var pos = cm.cursorCoords();
		
			window.setTimeout(function() {
				completionsMenu.children[0].focus();
				completionsMenu.children[0].selectedIndex = 0;
			}, 0);
	
			if (completionsMenu.firstChild) {
				completionsMenu.removeChild(completionsMenu.firstChild);
			}
			
			var listbox = document.createElement("listbox");
			listbox.setAttribute("style", "border:0; margin:0; width: 20em");
			
			completionsMenu.appendChild(listbox);
	
			for (var i = 0; i < completions.length; ++i) {
				var item = document.createElement("listitem");
				item.setAttribute("label", completions[i].label);
				item.setAttribute("value", completions[i].value);
				listbox.appendChild(item);
			}
	
			completionsMenu.openPopup(null, "", pos.x, pos.yBot, true, false, null);
		}
		

		completionsMenu.addEventListener("keydown", function(event) {
			var code = event.keyCode;
	
			// Enter and space
			if (code == 13 || code == 32) {
				event.preventDefault();
				pick();
			}
			// Escape
			else if (code == 27) {
				event.preventDefault();
				completionsMenu.hidePopup();
				cm.focus();
			} else if (code != 38 && code != 40) {
				// The trick here is that the popup is
				// hidden and the editor focused, so that
				// the latter responds to the key event
				// (making the text to be written in the editor).
				var cur = cm.getCursor();
				completionsMenu.hidePopup();
				cm.focus();
				setTimeout(function() {
					var cur2 = cm.getCursor();
					if (!(cur.line == cur2.line && cur.ch == cur2.ch)) {
						startComplete();
					}
				}, 50);
			}
		}, false);
		
		completionsMenu.addEventListener("dblclick", function(event) {
			pick();
		}, false);
		
		function pick() {
			var lb = completionsMenu.getElementsByTagName("listbox")[0];
			var item = lb.selectedItem;
			
			if (item != null) {
				var replacement = item.getAttribute("value");
				completionsMenu.hidePopup();
				insertReplacement(replacement);
				setTimeout(function() {
					cm.focus();
				}, 0);
			}
		}
		
		function insertReplacement(replacement) {
			var cur = cm.getCursor(false);
			var cur1 = {
				line : cur.line,
				ch : cur.ch
			};
	
			// Before cursor
			var charBefore = cm.getRange({
				line : cur.line,
				ch : cur.ch - 1
			}, {
				line : cur.line,
				ch : cur.ch
			});
	
			// Cursor position on the far left (ch=0) is problematic
			// - if we ask CodeMirror for token at this position, we don't
			// get back the token at the beginning of the line
			// - hence use adjusted position cur1 to recover this token.
			if (cur1.ch == 0 && cm.lineInfo(cur1.line).text.length > 0)
				cur1.ch = 1;
	
			var token = cm.getTokenAt(cur1);
			
			if (token.className == "sp-invalid" || (token.className == "sp-var" && replacement.startsWith(token.string))) {
				cm.replaceRange(replacement, {line : cur.line, ch : token.start}, {line : cur.line, ch : token.end});
			} else {
				cm.replaceRange(replacement, {line : cur.line, ch : cur.ch});
			}
		}
	
	
		var cm = CodeMirror.fromTextArea(textarea, {
			mode : "preconditions",
			// workDelay: 50,
			// workTime: 100,
			lineNumbers : false,
			// indentUnit : 3,
			// tabMode : "indent",
			matchBrackets : true,
			onHighlightComplete : cmUpdate,
			onKeyEvent : autocompleteKeyEventHandler
			// onKeyEvent : autocompleteKeyEventHandler
		// onChange: cmUpdate,
		});
		
		return cm;
	}
	
	function gatherAvailableAtoms() {
		var obj = art_semanticturkey.annotation.Preconditions;
		
		function expand(current) {
			var result = [];
			Object.getOwnPropertyNames(current).forEach(
			function(v) {
				var newCurrent = current[v];
				
				if (typeof newCurrent == "function") {
					result.push(v);
				} else {
					expand(newCurrent).forEach(function (v2){
						result.push(v + "." + v2);
					});
				}
			});
			return result;
		}
		
		return expand(obj);
	}
	
	var atoms = gatherAvailableAtoms();
	atoms.sort();
	
	var parameters = window.arguments[0];
	var editor = createEditor(document.getElementById("textAreaPreconditions"), atoms);
	editor.setValue(parameters.preconditionRestrictionSpec || "");
	
	if (parameters.defaultPreconditionSpec) {
		CodeMirror.runMode(parameters.defaultPreconditionSpec, "preconditions", document.getElementById("divDefaultPrecondition"));
	} else {
		document.getElementById("defaultPreconditionGroupbox").setAttribute("collapsed", "true");
	}
	
	document.addEventListener("dialogaccept", function(){
		window.arguments[0].out = editor.getValue().trim();
	}, false);
};

art_semanticturkey.enableAcceptButton = function(validity) {
	document.getElementById("acceptButton").disabled = !validity;
};