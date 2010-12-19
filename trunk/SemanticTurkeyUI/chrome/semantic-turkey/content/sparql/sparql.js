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
Components.utils.import("resource://stmodules/ResponseContentType.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);

window.onload = function() {
	document.getElementById("rdfPrefix").addEventListener("click",
			art_semanticturkey.addRDFPrefix, true);
	document.getElementById("rdfsPrefix").addEventListener("click",
			art_semanticturkey.addRDFSPrefix, true);
	document.getElementById("xsdPrefix").addEventListener("click",
			art_semanticturkey.addXSDPrefix, true);
	document.getElementById("owlPrefix").addEventListener("click",
			art_semanticturkey.addOWLPrefix, true);
	document.getElementById("annPrefix").addEventListener("click",
			art_semanticturkey.addANNPrefix, true);
	document.getElementById("myPrefix").addEventListener("click",
			art_semanticturkey.addMYPrefix, true);
	document.getElementById("from").addEventListener("click",
			art_semanticturkey.addFROM, true);
	document.getElementById("where").addEventListener("click",
			art_semanticturkey.addWHERE, true);
	document.getElementById("Select").addEventListener("click",
			art_semanticturkey.select, true);
	document.getElementById("Describe").addEventListener("click",
			art_semanticturkey.describe, true);
	document.getElementById("Construct").addEventListener("click",
			art_semanticturkey.construct, true);
	document.getElementById("Ask").addEventListener("click",
			art_semanticturkey.ask, true);
	document.getElementById("submitQuery").addEventListener("click",
			art_semanticturkey.submitQuery, true);
	document.getElementById("from_named").addEventListener("popupshowing",
			art_semanticturkey.getNamedGraphs, true);
//	document.getElementById("SPARQLTree").addEventListener("dblclick",
//			art_semanticturkey.SPARQLResourcedblClick, true);
	
			
	var isNull = art_semanticturkey.CurrentProject.isNull();
	if(isNull == false)
		art_semanticturkey.enableSPARQLSubmitQuery();
		
	art_semanticturkey.eventListenerSPARQLArrayObject = new art_semanticturkey.eventListenerArrayClass();
	art_semanticturkey.eventListenerSPARQLArrayObject.addEventListenerToArrayAndRegister(
					"projectOpened", art_semanticturkey.enableSPARQLSubmitQuery, null);
	art_semanticturkey.eventListenerSPARQLArrayObject.addEventListenerToArrayAndRegister(
					"projectClosed", art_semanticturkey.disableSPARQLSubmitQuery, null);
	
	/*var stIsStarted = art_semanticturkey.ST_started.getStatus();
	if (stIsStarted == "false") {
		var eventSparqlSTStartedObject = new art_semanticturkey.eventListener("st_started", art_semanticturkey.enableSPARQLSubmitQuery, null);
		document.getElementById("submitQuery").disabled = true;
	}*/
};


art_semanticturkey.enableSPARQLSubmitQuery = function(){
	document.getElementById("submitQuery").disabled = false;
};

art_semanticturkey.disableSPARQLSubmitQuery = function(){
	document.getElementById("submitQuery").disabled = true;
};

art_semanticturkey.getNamedGraphs = function() {
	var stIsStarted = art_semanticturkey.ST_started.getStatus();
	if (stIsStarted == "true") {
		try {
			var responseXML = art_semanticturkey.STRequests.Metadata
					.getNamedGraphs();
			art_semanticturkey.getNamedGraphs_RESPONSE(responseXML);
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
};


art_semanticturkey.getNamedGraphs_RESPONSE = function(responseXML) {
	var ngList = responseXML.getElementsByTagName("namedgraph");
	var menu = document.getElementById("from_named");
	while (menu.hasChildNodes()) {
		menu.removeChild(menu.lastChild);
	}
	for (var i = 0; i < ngList.length; i++) {
		var ngitem = document.createElement("menuitem");
		ngName = ngList[i].getAttribute("uri");
		ngitem.setAttribute("label", ngName);
		ngitem.addEventListener("command", art_semanticturkey.from_named, true);
		menu.appendChild(ngitem);
	}
};

art_semanticturkey.from_named = function(event) {
	art_semanticturkey.addToText('FROM NAMED <'
			+ event.target.getAttribute('label') + '>');
};

art_semanticturkey.select = function() {
	art_semanticturkey.addToText('SELECT ?x ');
};

art_semanticturkey.describe = function() {
	art_semanticturkey.addToText('DESCRIBE ?x ');
};

art_semanticturkey.construct = function() {
	art_semanticturkey.addToText('CONSTRUCT { } ');
};

art_semanticturkey.ask = function() {
	art_semanticturkey.addToText('ASK ');
};

art_semanticturkey.addContext = function(context) {

	if (!this.selected) {
		if (document.getElementById("textAreaQuery").value != "")
			document.getElementById("textAreaQuery").value = document
					.getElementById("textAreaQuery").value
					+ "\n";

		document.getElementById("textAreaQuery").value = document
				.getElementById("textAreaQuery").value
				+ "FROM <> ";
	}
	// aggiungere from named con lista

};

// Daniele Bagni, Marco Cappella (2009): aggiunta di una tra SELECT, DESCRIBE,
// ASK e CONSTRUCT al testo della query
art_semanticturkey.addToText = function(textquery) {

	if (document.getElementById("textAreaQuery").value != "")
		document.getElementById("textAreaQuery").value = document
				.getElementById("textAreaQuery").value
				+ "\n";

	document.getElementById("textAreaQuery").value = document
			.getElementById("textAreaQuery").value
			+ textquery;

};

// Daniele Bagni, Marco Cappella (2009): aggiunta dell'espressione FROM <> al
// testo
art_semanticturkey.addFROM = function() {

	if (document.getElementById("textAreaQuery").value != "")
		document.getElementById("textAreaQuery").value = document
				.getElementById("textAreaQuery").value
				+ "\n";

	document.getElementById("textAreaQuery").value = document
			.getElementById("textAreaQuery").value
			+ "FROM <> ";

};

// Daniele Bagni, Marco Cappella (2009): aggiunta dell'espressione WHERE{} al
// testo
art_semanticturkey.addWHERE = function() {

	if (document.getElementById("textAreaQuery").value != "")
		document.getElementById("textAreaQuery").value = document
				.getElementById("textAreaQuery").value
				+ "\n";

	document.getElementById("textAreaQuery").value = document
			.getElementById("textAreaQuery").value
			+ "WHERE {\n\n} ";

};

// Daniele Bagni, Marco Cappella (2009): aggiunta del prefisso RDF al testo
art_semanticturkey.addRDFPrefix = function() {
	var value = document.getElementById("textAreaQuery").value;
	document.getElementById("textAreaQuery").value = "PREFIX rdf: <"
			+ "http://www.w3.org/1999/02/22-rdf-syntax-ns#" + "> \n" + value;
};

// Daniele Bagni, Marco Cappella (2009): aggiunta del prefisso RDFS al testo
art_semanticturkey.addRDFSPrefix = function() {
	var value = document.getElementById("textAreaQuery").value;
	document.getElementById("textAreaQuery").value = "PREFIX rdfs: <"
			+ "http://www.w3.org/2000/01/rdf-schema#" + "> \n" + value;
};

// Daniele Bagni, Marco Cappella (2009): aggiunta del prefisso XSD al testo
art_semanticturkey.addXSDPrefix = function() {
	var value = document.getElementById("textAreaQuery").value;
	document.getElementById("textAreaQuery").value = "PREFIX xsd: <"
			+ "http://www.w3.org/2001/XMLSchema#" + "> \n" + value;

};

// Daniele Bagni, Marco Cappella (2009): aggiunta del prefisso OWL al testo
art_semanticturkey.addOWLPrefix = function() {

	var value = document.getElementById("textAreaQuery").value;
	document.getElementById("textAreaQuery").value = "PREFIX owl: <"
			+ "http://www.w3.org/2002/07/owl#" + "> \n" + value;

};

// Daniele Bagni, Marco Cappella (2009): aggiunta del prefisso Annotation al
// testo
art_semanticturkey.addANNPrefix = function() {
	var value = document.getElementById("textAreaQuery").value;
	document.getElementById("textAreaQuery").value = "PREFIX ann: <"
			+ "http://art.uniroma2.it/ontologies/annotation#" + "> \n" + value;

};

// Daniele Bagni, Marco Cappella (2009): aggiunta del prefisso del namespace
// selezionato nel server al testo
art_semanticturkey.addMYPrefix = function() {
	var value = document.getElementById("textAreaQuery").value;
	var stIsStarted = art_semanticturkey.ST_started.getStatus();
	if (stIsStarted == "true") {
		try {
	var responseXML = art_semanticturkey.STRequests.Metadata
			.getDefaultNamespace();
	var defaultNamespace = responseXML.getElementsByTagName('DefaultNamespace')[0]
			.getAttribute('ns');
	document.getElementById("textAreaQuery").value = "PREFIX : <"
			+ defaultNamespace + "> \n" + value;
		}catch (e){
			alert(e.name + ": " + e.message);
		}
	}

};

// Daniele Bagni, Marco Cappella (2009): inoltro della query al server
// Noemi Scarpato
art_semanticturkey.submitQuery = function() {

	var queryText = document.getElementById("textAreaQuery").value;

	try {
		var response = art_semanticturkey.STRequests.SPARQL.resolveQuery(
				queryText, "SPARQL", "true");
		art_semanticturkey.resolveQuery_RESPONSE(response);
	} catch (e) {
		alert(e.name + ": " + e.message);
	}

};


art_semanticturkey.resolveQuery_RESPONSE = function(response) {
	
//	Ramon Orr� (2010) : controllo tipologia serializzazione
	if(	response.respType == art_semanticturkey.RespContType.xml){
		var treecols = document.getElementById("SPARQLTreeCols");
		while (treecols.hasChildNodes()) {
			treecols.removeChild(treecols.lastChild);
		}
		var rootTreechildren = document.getElementById("SPARQLRootTreechildren");

		while (rootTreechildren.hasChildNodes()) {
			rootTreechildren.removeChild(rootTreechildren.lastChild);
		}
		var resultType = response.getElementsByTagName("data")[0]
		                                                       .getAttribute("resulttype");
		/*
		 * PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX my:
		 * <http://art.uniroma2.it#> SELECT ?persona ?cosa WHERE { ?persona rdf:type
		 * my:Person. ?cosa rdf:type my:cosa. }
		 */
		if (resultType == "tuple") {
			var cols = response.getElementsByTagName("variable");
			for (var i = 0; i < cols.length; i++) {
				var colName = cols[i].getAttribute("name");
				var treecol = document.createElement("treecol");
				treecol.setAttribute("label", colName);
				treecol.setAttribute("flex", "1");
				//treecol.setAttribute("num", i);
				treecols.appendChild(treecol);
				var results = response.getElementsByTagName("result");
				var resultsArray = new Array();
				for (var y = 0; y < results.length; y++) {
					var result = new Array();
					var bindings = results[y].getElementsByTagName("binding");
					for (var h = 0; h < bindings.length; h++) {
						//	var value = new Array();
						bindName = bindings[h].getAttribute("name");
						var lblValue = "";
						//	var type = "";
						if (bindings[h].getElementsByTagName("uri").length > 0) {
							lblValue = bindings[h].getElementsByTagName("uri")[0].textContent;
							//	type = "uri";
						} else if (bindings[h].getElementsByTagName("literal").length > 0) {
							lblValue = bindings[h].getElementsByTagName("literal")[0].textContent;
							if ((bindings[h].getElementsByTagName("literal")[0]
							                                                 .getAttribute("xml:lang")) != null) {
								lblValue = lblValue + "("
								+bindings[h].getElementsByTagName("literal")[0].getAttribute("xml:lang")
								                                       + ")";
							}
							//	type = "literal";
						} else if (bindings[h].getElementsByTagName("typed-literal").length > 0) {
							lblValue = bindings[h].getElementsByTagName("typed-literal")[0].textContent;
							//	type = "typed-literal";
						} else if (bindings[h].getElementsByTagName("bnode").length > 0) {
							lblValue = bindings[h].getElementsByTagName("bnode")[0].textContent;
							//	type = "bnode";
						}
						//	value.lblValue = lblValue;
						//	value.type = type;
						//	result[bindName] = value;
						result[bindName] = lblValue;
					}
					resultsArray[y] = result;
				}
			}
			for (var k in resultsArray) {
				var ti = document.createElement("treeitem");
				var tr = document.createElement("treerow");
				for (var i = 0; i < cols.length; i++) {
					var lblValue = resultsArray[k][cols[i].getAttribute("name")];
					//	var lblValue = resultsArray[k][cols[i].getAttribute("name")].lblValue;
					//var type = resultsArray[k][cols[i].getAttribute("name")].type;
					if (typeof lblValue == 'undefined') {
						lblValue = "";
					}
					var tc = document.createElement("treecell");
					tc.setAttribute("label", lblValue);
					//	tc.setAttribute("type", type);
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
			for (var i = 0; i < stm.length; i++) {
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
			var resultLabel = document.getElementById("textAreaResult1").getAttribute("value");
			var boolValue = response.getElementsByTagName("result")[0].textContent;
			document.getElementById("textAreaResult1").setAttribute("value", resultLabel + " " + boolValue);
		}
	}

//	Ramon Orrù (2010) : JSON SPARQL RESULT Parser
	else if( response.respType == art_semanticturkey.RespContType.json){
		var treecols = document.getElementById("SPARQLTreeCols");
		while (treecols.hasChildNodes()) {
			treecols.removeChild(treecols.lastChild);
		}
		var rootTreechildren = document.getElementById("SPARQLRootTreechildren");

		while (rootTreechildren.hasChildNodes()) {
			rootTreechildren.removeChild(rootTreechildren.lastChild);
		}
		
		if(typeof response.stresponse.data == 'undefined'){
			var msg = JSON.stringify(response.stresponse.msg);
			alert(msg);
			return;
		}
		var resultType = JSON.stringify(response.stresponse.data.resulttype).replace(/\"/g, "");

		if (resultType == "tuple") {
			var cols  = response.stresponse.data.sparql.head.vars;
			var rows=0;
			var resultsArray = new Array();
			for (var i = 0; i < cols.length; i++) {
				variable_name=cols[i];
				var treecol = document.createElement("treecol");
				treecol.setAttribute("label",variable_name );
				treecol.setAttribute("flex", "1");
				treecols.appendChild(treecol);
				var bindings  = response.stresponse.data.sparql.results.bindings;
				rows=bindings.length;
				var result = new Array(); 
				for(var bind in bindings){
					var element=(bindings[bind])[variable_name];
					var lblValue = "";
					if(typeof(element)!="undefined"){					
						if (JSON.stringify(element.type).replace(/\"/g, "")=="uri") {
							lblValue = JSON.stringify(element.value).replace(/\"/g, "");						
						} else if (JSON.stringify(element.type).replace(/\"/g, "")=="literal") {
							lblValue = JSON.stringify(element.value).replace(/\"/g, "");
							if (element["xml:lang"] != null) {
								lblValue = lblValue + "("+ JSON.stringify(element["xml:lang"]).replace(/\"/g, "") + ")";
							}
						} else if (JSON.stringify(element.type).replace(/\"/g, "")=="typed-literal") {
							lblValue = JSON.stringify(element.value).replace(/\"/g, "");
						}  else if (JSON.stringify(element.type).replace(/\"/g, "")=="bnode") {
							lblValue = JSON.stringify(element.value).replace(/\"/g, "");
						}						
					}
					result[bind] = lblValue;
				}
				resultsArray[i]=result;
			}

			for (var i = 0; i < rows; i++) {
				var ti = document.createElement("treeitem");
				var tr = document.createElement("treerow");
				for (var k in resultsArray) {
					var lblValue = resultsArray[k][i];
					if (typeof lblValue == 'undefined') {
						lblValue = "";
					}
					var tc = document.createElement("treecell");
					tc.setAttribute("label", lblValue);
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
			var stms  = response.stresponse.data.stm;
			for (var stm in stms) {
				var ti = document.createElement("treeitem");
				var tr = document.createElement("treerow");
				var sbj = document.createElement("treecell");
				var pre = document.createElement("treecell");
				var obj = document.createElement("treecell");
				var sbjName = JSON.stringify(stms[stm].subj).replace(/\"/g, "");
				sbj.setAttribute("label", sbjName);
				var preName =JSON.stringify(stms[stm].pred).replace(/\"/g, "");
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
			var boolValue = JSON.stringify(response.stresponse.data.result).replace(/\"/g, "");
			var treecol = document.createElement("treecol");
			treecol.setAttribute("label", "Result");
			treecol.setAttribute("flex", "1");
			treecols.appendChild(treecol);
			var ti = document.createElement("treeitem");
			var tr = document.createElement("treerow");
			var result_cell = document.createElement("treecell");
			result_cell.setAttribute("label", boolValue)	;
			ti.appendChild(tr);
			tr.appendChild(result_cell);
			rootTreechildren.appendChild(ti);			
		}
	}
};


art_semanticturkey.SPARQLResourcedblClick = function(event) {
	var parameters = new Object();
	var row = {};
	var col = {};
	var part = {};
	var tree = document.getElementById("SPARQLTree");
	tree.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, part);
	alert("row.value "+row.value+"col value"+col.ordinal);
	var treecell = tree.contentView.getItemAtIndex(row.value).getElementsByTagName("treecell")[0];
	var sourceType = treecell.getAttribute("type");
	
	// manca controllo se tuple o graph
	if (sourceType == "uri") {
		parameters.sourceType = "individual";
		parameters.sourceElement = treecell;
		parameters.sourceElementName = treecell.getAttribute("label");
		alert(sourceType+" LABEL "+parameters.sourceElementName);
		parameters.isFirstEditor = true;
		window.openDialog(
				"chrome://semantic-turkey/content/editors/editorPanel.xul",
				"_blank", "modal=yes,resizable,left=400,top=100", parameters);
	}
};


