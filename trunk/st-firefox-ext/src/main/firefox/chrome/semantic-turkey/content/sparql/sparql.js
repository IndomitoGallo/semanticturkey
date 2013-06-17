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
Components.utils.import("resource://stservices/SERVICE_SPARQL.jsm",
		art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Metadata.jsm",
		art_semanticturkey);
Components.utils
		.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ResponseContentType.jsm",
		art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm",
		art_semanticturkey);

window.onload = function() {
	document.getElementById("submitQuery").addEventListener("command",
			function(event) {
				art_semanticturkey.submitQuery();
			}, false);

	document.getElementById("SPARQLTree").addEventListener("dblclick",
			art_semanticturkey.SPARQLResourcedblClick, false);

	var isNull = art_semanticturkey.CurrentProject.isNull();
	if (isNull == false)
		art_semanticturkey.enableSPARQLSubmitQuery();

	art_semanticturkey.eventListenerSPARQLArrayObject = new art_semanticturkey.eventListenerArrayClass();
	art_semanticturkey.eventListenerSPARQLArrayObject
			.addEventListenerToArrayAndRegister("projectOpened",
					art_semanticturkey.enableSPARQLSubmitQuery, null);
	art_semanticturkey.eventListenerSPARQLArrayObject
			.addEventListenerToArrayAndRegister("projectClosed",
					art_semanticturkey.disableSPARQLSubmitQuery, null);

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
	
	var clearError = null;
	var markerHandle = null;
	
	var cmUpdate = function() {
		if (cm != undefined) {
			var queryValid = true;
			if (clearError != null) {
				clearError.clear();
				clearError = null
			}
			;
			if (markerHandle != null)
				cm.clearMarker(markerHandle);
			var state;
			for ( var l = 0; l < cm.lineCount(); ++l) {
				state = cm.getTokenAt({
					line : l,
					ch : cm.getLine(l).length
				}).state;
				if (state.OK == false) {
					markerHandle = cm
							.setMarker(l,
									"<span style=\"color: #f00 ; font-size: large;\">&#8594;</span> %N%");
					clearError = cm.markText({
						line : l,
						ch : state.errorStartPos
					}, {
						line : l,
						ch : state.errorEndPos
					}, "cm-sp-error");
					queryValid = false;
					break;
				}
			}
			var stack = state.stack, len = state.stack.length;
			// Because incremental parser doesn't receive end-of-input
			// it can't clear stack, so we have to check that whatever
			// is left on the stack is nillable
			if (len > 1)
				queryValid = false;
			else if (len == 1) {
				if (stack[0] != "solutionModifier"
						&& stack[0] != "?limitOffsetClauses"
						&& stack[0] != "?offsetClause")
					queryValid = false;
			}

			if (queryValid) {
				document.getElementById("submitQuery").tooltipText = "";
				document.getElementById("submitQuery").style.opacity = 1.0;
				// submitItemCoolbar.enable();
				// submitItemEndpointBar.enable();
				// datasetMimeTypeItem.setDisableElements(state.queryType);
				// endpointMimeTypeItem.setDisableElements(state.queryType);
				// statusArea.setQueryValid(true);
				// statusArea.updateStatus();
			} else {
				document.getElementById("submitQuery").tooltipText = "Query contains errors";
				document.getElementById("submitQuery").style.opacity = 0.6;

				// submitItemCoolbar.disable();
				// submitItemEndpointBar.disable();
				// datasetMimeTypeItem.setDisableElements(state.queryType);
				// endpointMimeTypeItem.setDisableElements(state.queryType);
				// statusArea.setQueryValid(false);
				// statusArea.updateStatus();
			}
		}
	}
	// End of error marking code

	// ----------------------------------------------------------------
	// Autocompletion code, based on the example for javascript
	function autocompleteKeyEventHandler(i, e) {
		// Hook into ctrl-space
		if (e.keyCode == 32 && (e.ctrlKey || e.metaKey) && !e.altKey) {
			e.stop();
			return startComplete();
		}
	}

	function stopEvent() {
		if (this.preventDefault) {
			this.preventDefault();
			this.stopPropagation();
		} else {
			this.returnValue = false;
			this.cancelBubble = true;
		}
	}

	function addStop(event) {
		if (!event.stop)
			event.stop = stopEvent;

		return event;
	}

	function connect(node, type, handler) {
		function wrapHandler(event) {
			handler(addStop(event || window.event));
		}

		if (typeof node.addEventListener == "function")
			node.addEventListener(type, wrapHandler, false);
		else
			node.attachEvent("on" + type, wrapHandler);
	}

	function forEach(arr, f) {
		for ( var i = 0, e = arr.length; i < e; ++i)
			f(arr[i]);
	}

	function memberChk(el, arr) {
		for ( var i = 0, e = arr.length; i < e; ++i)
			if (arr[i] == el)
				return (true);

		return false;
	}

	// Extract context info needed for autocompletion / keyword buttons
	// based on cursor position
	function getPossiblesAtCursor() {
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

		var charAfter;
		var possibles;

		var start = token.string.toLowerCase();
		var insertPos = null;
		var insertEnd = false;
		var insertStart = false;

		// if the token is whitespace, use empty string for matching
		// and set insertPos, so that selection will be inserted into
		// into space, rather than replacing it.
		if (token.className == "sp-ws") {
			start = "";

			// charAfter is char after cursor
			charAfter = cm.getRange({
				line : cur.line,
				ch : cur.ch
			}, {
				line : cur.line,
				ch : cur.ch + 1
			});
			insertPos = cur;
		} else {
			// charAfter is char after end of token
			charAfter = cm.getRange({
				line : cur.line,
				ch : token.end
			}, {
				line : cur.line,
				ch : token.end + 1
			});

			if (token.className != "sp-invalid"
					&& token.className != "sp-prefixed"
					&& (token.string != "<" || !memberChk("IRI_REF",
							token.state.possibleCurrent))
			// OK when "<" is start of URI
			) {
				if (token.end == cur.ch && token.end != 0) {
					insertEnd = true;
					start = "";
					insertPos = cur;
				} else if (token.start == cur.ch) {
					insertStart = true;
					start = "";
					insertPos = cur;
				}
			}
		}

		if (token.className == "sp-comment")
			possibles = [];
		else if (cur1.ch > 0 && !insertEnd) {
			possibles = token.state.possibleCurrent;
		} else {
			possibles = token.state.possibleNext;
		}

		return {
			"token" : token, // codemirror token object
			"possibles" : possibles, // array of possibles terminals from
										// grammar
			"insertPos" : insertPos, // Position in line to insert text, or
										// null if replacing existing text
			"insertStart" : insertStart, // true if position of insert
											// adjacent to start of a non-ws
											// token
			"insertEnd" : insertEnd, // true if ... ... end of a ...
			"charAfter" : charAfter, // char found straight after cursor
			"cur" : cur, // codemirror {line,ch} object giving pos of cursor
			"start" : start
		// Start of token for autocompletion
		}
	}

	// Initializes the completion popup. 
	var completionsMenu = document.getElementById("completionsMenu");
	completionsMenu.setAttribute("level", "top");
	completionsMenu.addEventListener("keydown", function(event) {
		var code = event.keyCode;
		addStop(event);

		// Enter and space
		if (code == 13 || code == 32) {
			event.stop();
			pick();
		}
		// Escape
		else if (code == 27) {
			event.stop();
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
		var tkposs = getPossiblesAtCursor();
		insertOrReplace(
				completionsMenu.getElementsByTagName("listbox")[0].selectedItem.value,
				tkposs);
		completionsMenu.hidePopup();
		setTimeout(function() {
			cm.focus();
		}, 0);
	}

	function startComplete() {
		if (cm.somethingSelected())
			return;

		var tkposs = getPossiblesAtCursor();
		var stack = tkposs.token.state.stack;

		var completions = getCompletions(tkposs.token, tkposs.start,
				tkposs.possibles);

		if (!completions.length)
			return;

		// When there is only one completion, use it directly.
		if (completions.length == 1) {
			insertOrReplace(completions[0].text, tkposs);
			return true;
		}

		// Build the select widget
		var pos = cm.cursorCoords();

		var completionsMenu = document.getElementById("completionsMenu");

		window.setTimeout(function() {
			completionsMenu.children[0].focus();
			completionsMenu.children[0].selectedIndex = 0;
		}, 0);

		var lb = completionsMenu.getElementsByTagName("listbox")[0];

		while (lb.itemCount != 0) {
			lb.removeItemAt(0);
		}

		for ( var i = 0; i < completions.length; ++i) {
			lb.insertItemAt(-1, completions[i].label, completions[i].text);
		}

		completionsMenu.openPopup(null, "", pos.x, pos.yBot, true, false, null);
		return true;
	}

	var allKeywords = this.allKeywords;

	// FIXME: This is duplicated from elsewhere, and it shouldn't be!
	var keywords = /^(BASE|PREFIX|SELECT|CONSTRUCT|DESCRIBE|ASK|FROM|NAMED|ORDER|BY|LIMIT|ASC|DESC|OFFSET|DISTINCT|REDUCED|WHERE|GRAPH|OPTIONAL|UNION|FILTER|STR|LANG|LANGMATCHES|DATATYPE|BOUND|SAMETERM|ISIRI|ISURI|ISBLANK|ISLITERAL|REGEX|TRUE|FALSE)$/i;
	// Punctuation omits "a" and "<"
	// - because we might want to autocomplete a URI
	var punct = /^(\*|\.|\{|\}|,|\(|\)|;|\[|\]|\|\||&&|=|!=|!|<=|>=|>|\+|-|\/|\^\^)$/

	function getCompletions(token, start, possibles) {
		var found = [];
		// test the case of the 1st non-space char
		var startIsLowerCase = /^ *[a-z]/.test(token.string);

		// Where case is flexible
		function maybeAdd(str) {
			var obj = str;

			if (typeof str == "string") {
				obj = {};
				obj.text = str;
				obj.label = str;
			}

			if (obj.text.toUpperCase().indexOf(start.toUpperCase()) == 0) {
				if (startIsLowerCase) {
					obj.text = obj.text.toLowerCase();
				} else {
					obj.text = obj.text.toUpperCase();
				}

				found.push(obj);
			}
		}

		// Where case is not flexible
		function maybeAddCS(str) {
			var obj = str;

			if (typeof str == "string") {
				obj = {};
				obj.text = str;
				obj.label = str;
			}

			if (obj.text.toUpperCase().indexOf(start.toUpperCase()) == 0) {
				found.push(obj);
			}
		}

		function gatherCompletions() {
			for ( var i = 0; i < possibles.length; ++i) {
				if (possibles[i] == "VAR1")
					maybeAddCS("?");
				else if (keywords.exec(possibles[i])) {
					// keywords - the strings stand for themselves
					maybeAdd(possibles[i]);
				} else if (punct.exec(possibles[i])) {
					// punctuation - the strings stand for themselves
					maybeAddCS(possibles[i]);
				} else if (possibles[i] == "STRING_LITERAL1") {
					maybeAddCS('"');
					maybeAddCS("'");
				} else if (possibles[i] == "IRI_REF") {
					var stack = token.state.stack;

					// The stack is inspected in order to verify if we are in a "FROM NAMED" context
					if ((stack.length >= 1
							&& stack[stack.length - 1] == "sourceSelector")
							|| (stack.length >= 2
								&& stack[stack.length - 2] == "groupGraphPattern")) {
						for ( var j = 0; j < namedGraphs.length; j++) {
							maybeAddCS("<" + namedGraphs[j] + ">");
						}
					} else if (!/^</.test(start)) {
						maybeAddCS("<");
					}
				} else if (possibles[i] == "BLANK_NODE_LABEL") {
					maybeAddCS("_:");
				} else if (possibles[i] == "a") {
					// Property expected at cursor position - fetch
					// possibilities
					maybeAddCS("a");

//					if (/:/.test(start)) {
//						// Prefix has been entered - give matching prefixed
//						// properties
//						var activeDataItem = createSidebar.getActiveDataItem();
//						if (activeDataItem) {
//							for ( var k = 0; k < activeDataItem.prefixes.length; k++) {
//								// maybeAddCS(activeDataItem.prefixes[i].prefix+":");
//								var ns = activeDataItem.prefixes[k].uri;
//								for ( var j = 0; j < activeDataItem.properties.results.bindings.length; j++) {
//									var fragments = activeDataItem.properties.results.bindings[j].p.value
//											.match(/(^\S*[#\/])([^#\/]*$)/);
//									if (fragments.length == 3
//											&& fragments[1] == ns)
//										maybeAddCS(activeDataItem.prefixes[k].prefix
//												+ ":" + fragments[2]);
//								}
//							}
//						}
//					}

					if (/^</.test(start)) {
						// if (true) {
						// Looks like a URI - add property URIs

//						var activeDataItem = createSidebar.getActiveDataItem();
//						if (activeDataItem) {
//							for ( var j = 0; j < activeDataItem.properties.results.bindings.length; j++)
//								maybeAddCS("<"
//										+ activeDataItem.properties.results.bindings[j].p.value
//										+ ">");
//						}
					}
				} else if (possibles[i] == "PNAME_LN" && !/:$/.test(start)) {

//					var activeDataItem = createSidebar.getActiveDataItem();
//					if (activeDataItem && activeDataItem.prefixes.length) {
//						for ( var j = 0; j < activeDataItem.prefixes.length; j++) {
//							maybeAddCS(activeDataItem.prefixes[j].prefix + ":");
//						}
//					}
				} else if (possibles[i] == "PNAME_NS") {
					var stack = token.state.stack;

					// The parser stack is inspected in order to verify if we are in a prefix declaration.
					if (stack.length >= 3
							&& stack[stack.length - 2] == "IRI_REF"
							&& stack[stack.length - 3] == "*prefixDecl") {
						var prefixes = [];
						var acc = "";
						for ( var ns in nsPrefixMappings) {
							if (prefixes.length != 0) {
								acc += "PREFIX ";
							}
							acc += ns + ": <" + nsPrefixMappings[ns] + ">\n";
							prefixes.push({
								text : ns + ": <" + nsPrefixMappings[ns] + ">",
								label : ns + ":"
							});
						}

						maybeAddCS({
							text : acc,
							label : "All prefixes"
						});

						for ( var j = 0; j < prefixes.length; j++) {
							maybeAddCS(prefixes[j]);
						}
					}
				}
			}
		}

		gatherCompletions();
		return found;
	}
	// End of autocompletion code

	var insertOrReplace = function(str, tkposs) {
		if ((tkposs.insertStart || tkposs.charAfter != " ")
				&& /^[A-Za-z\*]*$/.exec(str))
			str = str + " ";
		if (tkposs.insertEnd)
			str = " " + str;
		if (tkposs.insertPos) {
			// Insert between spaces
			cm.replaceRange(str, tkposs.insertPos);
		} else {
			// Replace existing token
			cm.replaceRange(str, {
				line : tkposs.cur.line,
				ch : tkposs.token.start
			}, {
				line : tkposs.cur.line,
				ch : tkposs.token.end
			});
		}
	};

	// Retrieves the prefix mappings from the server
	var nsPrefixMappings = {};

	try {
		var responseXML = art_semanticturkey.STRequests.Metadata
				.getNSPrefixMappings();
		var mappings = responseXML.getElementsByTagName("Mapping");

		for ( var i = 0; i < mappings.length; i++) {
			nsPrefixMappings[mappings[i].getAttribute("prefix")] = mappings[i]
					.getAttribute("ns");
		}
	} catch (e) {
		alert(e.name + ": " + e.message);
	}

	// Retrieves the named graphs from the server
	var namedGraphs = [];

	try {
		var responseXML = art_semanticturkey.STRequests.Metadata
				.getNamedGraphs();
		var ngList = responseXML.getElementsByTagName("namedgraph");
		for ( var i = 0; i < ngList.length; i++) {
			var ngName = ngList[i].getAttribute("uri");
			namedGraphs.push(ngName);
		}
	} catch (e) {
		alert(e.name + ": " + e.message);
	}

	var cm = CodeMirror.fromTextArea(document.getElementById("textAreaQuery"),
			{
				mode : "sparql",
				// workDelay: 50,
				// workTime: 100,
				lineNumbers : true,
				indentUnit : 3,
				tabMode : "indent",
				matchBrackets : true,
				onHighlightComplete : cmUpdate,
				onKeyEvent : autocompleteKeyEventHandler
			// onChange: cmUpdate,
			});
	art_semanticturkey.cm = cm;
};

art_semanticturkey.enableSPARQLSubmitQuery = function() {
	document.getElementById("submitQuery").disabled = false;
};

art_semanticturkey.disableSPARQLSubmitQuery = function() {
	document.getElementById("submitQuery").disabled = true;
};

// Daniele Bagni, Marco Cappella (2009): inoltro della query al server
// Noemi Scarpato
art_semanticturkey.submitQuery = function() {

	var queryText = art_semanticturkey.cm.getValue();
	var inferredStat = document.getElementById("inferredStatements").hasAttribute("checked");
	
	try {
		var response = art_semanticturkey.STRequests.SPARQL.resolveQuery(
				queryText, "SPARQL", inferredStat);
		art_semanticturkey.resolveQuery_RESPONSE(response);
	} catch (e) {
		alert(e.name + ": " + e.message);
	}

};

art_semanticturkey.resolveQuery_RESPONSE = function(response) {

	// Ramon Orr� (2010) : controllo tipologia serializzazione
	if (response.respType == art_semanticturkey.RespContType.xml) {
		var treecols = document.getElementById("SPARQLTreeCols");
		while (treecols.hasChildNodes()) {
			treecols.removeChild(treecols.lastChild);
		}
		var rootTreechildren = document
				.getElementById("SPARQLRootTreechildren");

		while (rootTreechildren.hasChildNodes()) {
			rootTreechildren.removeChild(rootTreechildren.lastChild);
		}
		var resultType = response.getElementsByTagName("data")[0]
				.getAttribute("resulttype");
		/*
		 * PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX my:
		 * <http://art.uniroma2.it#> SELECT ?persona ?cosa WHERE { ?persona
		 * rdf:type my:Person. ?cosa rdf:type my:cosa. }
		 */
		if (resultType == "tuple") {
			var cols = response.getElementsByTagName("variable");
			for (var i = 0; i < cols.length; i++) {
				var colName = cols[i].getAttribute("name");
				var treecol = document.createElement("treecol");
				treecol.setAttribute("label", colName);
				treecol.setAttribute("flex", "1");
				// treecol.setAttribute("num", i);
				treecols.appendChild(treecol);
				var results = response.getElementsByTagName("result");
				var resultsArray = new Array();
				for (var y = 0; y < results.length; y++) {
					var result = new Array();
					var bindings = results[y].getElementsByTagName("binding");
					for ( var h = 0; h < bindings.length; h++) {
						// var value = new Array();
						bindName = bindings[h].getAttribute("name");
						var lblValue = "";
						// var type = "";
						if (bindings[h].getElementsByTagName("uri").length > 0) {
							lblValue = bindings[h].getElementsByTagName("uri")[0].textContent;
							// type = "uri";
						} else if (bindings[h].getElementsByTagName("literal").length > 0) {
							lblValue = bindings[h]
									.getElementsByTagName("literal")[0].textContent;
							if ((bindings[h].getElementsByTagName("literal")[0]
									.getAttribute("xml:lang")) != null) {
								lblValue = lblValue
										+ "("
										+ bindings[h]
												.getElementsByTagName("literal")[0]
												.getAttribute("xml:lang") + ")";
							}
							// type = "literal";
						} else if (bindings[h]
								.getElementsByTagName("typed-literal").length > 0) {
							lblValue = bindings[h]
									.getElementsByTagName("typed-literal")[0].textContent;
							// type = "typed-literal";
						} else if (bindings[h].getElementsByTagName("bnode").length > 0) {
							lblValue = bindings[h]
									.getElementsByTagName("bnode")[0].textContent;
							// type = "bnode";
						}
						// value.lblValue = lblValue;
						// value.type = type;
						// result[bindName] = value;
						result[bindName] = lblValue;
					}
					resultsArray[y] = result;
				}
			}
			for ( var k in resultsArray) {
				var ti = document.createElement("treeitem");
				var tr = document.createElement("treerow");
				for ( var i = 0; i < cols.length; i++) {
					var lblValue = resultsArray[k][cols[i].getAttribute("name")];
					// var lblValue =
					// resultsArray[k][cols[i].getAttribute("name")].lblValue;
					// var type =
					// resultsArray[k][cols[i].getAttribute("name")].type;
					if (typeof lblValue == 'undefined') {
						lblValue = "";
					}
					var tc = document.createElement("treecell");
					tc.setAttribute("label", lblValue);
					// tc.setAttribute("type", type);
					tr.appendChild(tc);
					ti.appendChild(tr);
				}
				rootTreechildren.appendChild(ti);
			}
		} else if (resultType == "graph") {
			var treecol = document.createElement("treecol");
			treecol.setAttribute("label", "subject");
			treecol.setAttribute("flex", "1");
			treecols.appendChild(treecol);
			treecol = document.createElement("treecol");
			treecol.setAttribute("label", "predicate");
			treecol.setAttribute("flex", "1");
			treecols.appendChild(treecol);
			treecol = document.createElement("treecol");
			treecol.setAttribute("label", "object");
			treecol.setAttribute("flex", "1");
			treecols.appendChild(treecol);
			var stm = response.getElementsByTagName("stm");
			for ( var i = 0; i < stm.length; i++) {
				var ti = document.createElement("treeitem");
				var tr = document.createElement("treerow");
				var sbj = document.createElement("treecell");
				var pre = document.createElement("treecell");
				var obj = document.createElement("treecell");
				var sbjName = stm[i].getElementsByTagName("subj")[0].textContent;
				sbj.setAttribute("label", sbjName);
				var preName = stm[i].getElementsByTagName("pred")[0].textContent;
				pre.setAttribute("label", preName);
				var objName = stm[i].getElementsByTagName("obj")[0].textContent;
				obj.setAttribute("label", objName);
				ti.appendChild(tr);
				tr.appendChild(sbj);
				tr.appendChild(pre);
				tr.appendChild(obj);
				rootTreechildren.appendChild(ti);
			}
		} else if (resultType == "boolean") {
			var SPARQLtree = document.getElementById("SPARQLTree");
			SPARQLtree.setAttribute("hidden", true);
			var resultLabel = document.getElementById("textAreaResult1")
					.getAttribute("value");
			var boolValue = response.getElementsByTagName("result")[0].textContent;
			document.getElementById("textAreaResult1").setAttribute("value",
					resultLabel + " " + boolValue);
		}
	}

	// Ramon Orrù (2010) : JSON SPARQL RESULT Parser
	else if (response.respType == art_semanticturkey.RespContType.json) {
		var treecols = document.getElementById("SPARQLTreeCols");
		while (treecols.hasChildNodes()) {
			treecols.removeChild(treecols.lastChild);
		}
		var rootTreechildren = document
				.getElementById("SPARQLRootTreechildren");

		while (rootTreechildren.hasChildNodes()) {
			rootTreechildren.removeChild(rootTreechildren.lastChild);
		}
		if (response.stresponse.reply.status == 'fail') {
			// var msg = JSON.stringify(response.stresponse.reply.msg);
			var msg = response.stresponse.reply.msg;
			alert(msg);
			return;
		}
		var resultType = response.stresponse.data.resulttype;

		if (resultType == "tuple") {
			var cols = response.stresponse.data.sparql.head.vars;

			var resultsArray = new Array();
			for (var i = 0; i < cols.length; i++) {
				var variable_name = cols[i];
				var treecol = document.createElement("treecol");
				treecol.setAttribute("label", variable_name);
				treecol.setAttribute("flex", "1");
				treecol.setAttribute("ordinal", "" + i);
				treecols.appendChild(treecol);
			}

			var bindings = response.stresponse.data.sparql.results.bindings;

			for (var bind in bindings) {
				var ti = document.createElement("treeitem");
				var tr = document.createElement("treerow");

				for (var i = 0; i < cols.length; i++) {
					var variable_name = cols[i];
					var element = (bindings[bind])[variable_name];

					if (typeof element != "undefined") {
						var lblValue = "";
						var type = "";
	
						if (element.type == "uri") {
							lblValue = element.value;
						} else if (element.type == "literal") {
							lblValue = element.value;
							if (element["xml:lang"] != null) {
								lblValue = lblValue + " (" + element["xml:lang"]
										+ ")";
							}
						} else if (element.type == "typed-literal") {
							lblValue = element.value;
						} else if (element.type == "bnode") {
							lblValue = element.value;
						}
	
						var tc = document.createElement("treecell");
						tc.setAttribute("label", lblValue);
						tc.setAttribute("type", element.type);
						
						tr.appendChild(tc);
					} else {
						var tc = document.createElement("treecell");
						tc.setAttribute("properties", "unbound");
						tr.appendChild(tc);
					}
				}
				ti.appendChild(tr)
				rootTreechildren.appendChild(ti);
			}

		} else if (resultType == "graph") {
			var treecol = document.createElement("treecol");
			treecol.setAttribute("label", "subject");
			treecol.setAttribute("flex", "1");
			treecol.setAttribute("ordinal", "0");
			treecols.appendChild(treecol);

			treecol = document.createElement("treecol");
			treecol.setAttribute("label", "predicate");
			treecol.setAttribute("flex", "1");
			treecol.setAttribute("ordinal", "1");
			treecols.appendChild(treecol);

			treecol = document.createElement("treecol");
			treecol.setAttribute("label", "object");
			treecol.setAttribute("flex", "1");
			treecol.setAttribute("ordinal", "2");
			treecols.appendChild(treecol);

			var stms = response.stresponse.data.stm;
			for ( var stm in stms) {
				var ti = document.createElement("treeitem");
				var tr = document.createElement("treerow");
				var sbj = document.createElement("treecell");
				var pre = document.createElement("treecell");
				var obj = document.createElement("treecell");
				var sbjName = JSON.stringify(stms[stm].subj).replace(/\"/g, "");
				sbj.setAttribute("label", sbjName);
				var preName = JSON.stringify(stms[stm].pred).replace(/\"/g, "");
				pre.setAttribute("label", preName);
				var objName = JSON.stringify(stms[stm].obj).replace(/\"/g, "");
				obj.setAttribute("label", objName);
				ti.appendChild(tr);
				tr.appendChild(sbj);
				tr.appendChild(pre);
				tr.appendChild(obj);
				rootTreechildren.appendChild(ti);
			}
		} else if (resultType == "boolean") {
			var boolValue = response.stresponse.data.result;
			var treecol = document.createElement("treecol");
			treecol.setAttribute("label", "Result");
			treecol.setAttribute("flex", "1");
			treecols.appendChild(treecol);
			var ti = document.createElement("treeitem");
			var tr = document.createElement("treerow");
			var result_cell = document.createElement("treecell");
			result_cell.setAttribute("label", boolValue);
			ti.appendChild(tr);
			tr.appendChild(result_cell);
			rootTreechildren.appendChild(ti);
		}
	}
};

/*
 * This function is invoked when the user double clicks on an element
 * within the result table.
 */
art_semanticturkey.SPARQLResourcedblClick = function(event) {

	var row = {};
	var col = {};
	var part = {};
	var tree = document.getElementById("SPARQLTree");
	tree.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, part);

	if (row.value == -1)
		return;

	var treecell = tree.contentView.getItemAtIndex(row.value)
			.getElementsByTagName("treecell")[col.value.element.ordinal];	// The ordinal property has been assigned with
	                                                                        // the column position within the heading
	var sourceType = treecell.getAttribute("type");

	// manca controllo se tuple o graph
	if (sourceType == "uri" || sourceType == "bnode") {
		var parameters = {};
		parameters.sourceType = "individual";
		parameters.sourceElement = treecell;
		parameters.sourceElementName = treecell.getAttribute("label");
		parameters.isFirstEditor = true;
		window.openDialog(
				"chrome://semantic-turkey/content/editors/editorPanel.xul",
				"_blank", "modal=yes,resizable,left=400,top=100", parameters);
	}
};
