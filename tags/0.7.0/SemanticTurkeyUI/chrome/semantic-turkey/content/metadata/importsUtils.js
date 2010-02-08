
art_semanticturkey.emptyNSandImportTreesAndPopulateThem = function(){
	// EMPTY NAMESPACE TREE
	var treeChildrenNS = document.getElementById('namespaceTree').getElementsByTagName('treechildren')[0];
	while (treeChildrenNS.hasChildNodes()) {
		treeChildrenNS.removeChild(treeChildrenNS.lastChild);
	}
	// EMPTY IMPORT TREE
	var treeChildren2 = document.getElementById('importsTree').getElementsByTagName('treechildren')[0];
	while (treeChildren2.hasChildNodes()) {
		treeChildren2.removeChild(treeChildren2.lastChild);
	}
	
	// ASK THE SERVER FOR NAMESPACES AND IMPORTS LISTS
	var responseXML;
	try{
		responseXML = art_semanticturkey.STRequests.Metadata.getNSPrefixMappings();
		art_semanticturkey.getNSPrefixMappings_RESPONSE(responseXML);
		
		responseXML = art_semanticturkey.STRequests.Metadata.getImports();
		art_semanticturkey.getImports_RESPONSE(responseXML);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.addFromWeb_RESPONSE = function(responseElement) {
	var reply = responseElement.getElementsByTagName("reply")[0];
	var status = reply.getAttribute("status");
	if(status == "ok")		
		art_semanticturkey.emptyNSandImportTreesAndPopulateThem();
};

art_semanticturkey.addFromWebToMirror_RESPONSE = function(responseElement) {
	var reply = responseElement.getElementsByTagName("reply")[0];
	var status = reply.getAttribute("status");
	if(status == "ok")		
		art_semanticturkey.emptyNSandImportTreesAndPopulateThem();
};

art_semanticturkey.addFromLocalFile_RESPONSE = function(responseElement) {
	var reply = responseElement.getElementsByTagName("reply")[0];
	var status = reply.getAttribute("status");
	if(status == "ok")		
		art_semanticturkey.emptyNSandImportTreesAndPopulateThem();
};

art_semanticturkey.downloadFromWebToMirror_RESPONSE = function(responseElement){
	var reply = responseElement.getElementsByTagName("reply")[0];
	var status = reply.getAttribute("status");
	if(status == "ok")		
		art_semanticturkey.emptyNSandImportTreesAndPopulateThem();
};

art_semanticturkey.downloadFromWeb_RESPONSE = function(responseElement){
	var reply = responseElement.getElementsByTagName("reply")[0];
	var status = reply.getAttribute("status");
	if(status == "ok")		
		art_semanticturkey.emptyNSandImportTreesAndPopulateThem();
};

art_semanticturkey.getFromLocalFile_RESPONSE = function(responseElement){
	var reply = responseElement.getElementsByTagName("reply")[0];
	var status = reply.getAttribute("status");
	if(status == "ok")		
		art_semanticturkey.emptyNSandImportTreesAndPopulateThem();
};

art_semanticturkey.addFromOntologyMirror_RESPONSE = function(responseElement){
	var reply = responseElement.getElementsByTagName("reply")[0];
	var status = reply.getAttribute("status");
	if(status == "ok")		
		art_semanticturkey.emptyNSandImportTreesAndPopulateThem();
};

art_semanticturkey.removeImport = function() {
	var tree = document.getElementById("importsTree");
	try {
		var currentelement = tree.treeBoxObject.view
				.getItemAtIndex(tree.currentIndex);
	} catch (e) {
		alert("No element selected");
		return;
	}
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var uri = treecell.getAttribute("label");
	try{
		var responseXML = art_semanticturkey.STRequests.Metadata.removeImport(uri);
		art_semanticturkey.removeImport_RESPONSE(responseXML);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
};


art_semanticturkey.removeImport_RESPONSE = function(responseElement){
	var reply = responseElement.getElementsByTagName("reply")[0];
	var status = reply.getAttribute("status");
	if(status == "ok")		
		art_semanticturkey.emptyNSandImportTreesAndPopulateThem();
};

/**
 * NScarpato 08/09/2008 check if enter key is selected
 */
art_semanticturkey.checkEnter = function(e, type, txbox) { // e is event object passed from
	// function invocation
	var characterCode; // literal character code will be stored in this
	// variable
	characterCode = e.which;
	if (characterCode == 13) { // if generated character code is equal to ascii
		// 13 (if enter key)
		art_semanticturkey.changeBaseuri_Namespace(type, txbox, txbox.getAttribute("isChanged"));
		return false;
	} else {
		txbox.setAttribute("isChanged", "true");
		return true;
	}
};



art_semanticturkey.setNSPrefixMapping_RESPONSE = function(responseElement, prefix, namespace){
	//TODO la risposta non contiene il prefix e il namespace, quindi mi viene passato esplicitamente
	// oppure si può ricaricare tutto il pannesso (come per le altre RESPONSE)
	if(responseElement.getElementsByTagName("reply")[0].getAttribute("status") != "ok")
		return;
	var namespaceTree = document.getElementById('namespaceTree');
	var node = namespaceTree.getElementsByTagName('treechildren')[0];	
		
	var ns = namespace;
	var prefix = prefix;
	var tr = document.createElement("treerow");
	var explicit = "true"; // TODO vedere se mettere true o false
	var tcPrefix = document.createElement("treecell");
	tcPrefix.setAttribute("label", prefix);
	var tcNs = document.createElement("treecell");
	tcNs.setAttribute("label", ns);
	tcNs.setAttribute("properties", explicit);
	tcPrefix.setAttribute("properties", explicit);
	tr.setAttribute("explicit", explicit);
	tr.appendChild(tcPrefix);
	tr.appendChild(tcNs);
	var ti = document.createElement("treeitem");
	ti.appendChild(tr);
	node.appendChild(ti);	
};



art_semanticturkey.removeNSPrefixMapping_RESPONSE = function(responseElement){
	//TODO vedere se fare così o ricarire la sidebar come si per le altre RESPONSE
	// oppure si può ricaricare tutto il pannesso (come per le altre RESPONSE)
	var ns = responseElement.getElementsByTagName("Mapping")[0].getAttribute("prefix");
	
	var namespaceTree = document.getElementById('namespaceTree');
	var node = namespaceTree.getElementsByTagName('treechildren')[0];
	var treecells = node.getElementsByTagName("treecell");
	for(var i=0; i<treecells.length; ++i){
		if(treecells[i].getAttribute("label") == ns){
			treecells[i].parentNode.parentNode.parentNode.removeChild(treecells[i].parentNode.parentNode);
			return;
		}
	}
	
};



art_semanticturkey.changeNSPrefixMapping_RESPONSE = function(responseElement){
	var reply = responseElement.getElementsByTagName("reply")[0];
	var status = reply.getAttribute("status");
	if(status == "ok")		
		art_semanticturkey.emptyNSandImportTreesAndPopulateThem();
};

art_semanticturkey.associateEventsOnGraphicElementsImports = function(){
	document.getElementById("infoOnProject").addEventListener("command", art_semanticturkey.infoProject, true);
	
	var baseUriTxtBox = document.getElementById("baseUriTxtBox");
	baseUriTxtBox.setAttribute("onkeyup", "art_semanticturkey.manageInput('base',this);");
	baseUriTxtBox.setAttribute("onkeypress", "art_semanticturkey.checkEnter(event,'base',this);");
	
	var nsTxtBox = document.getElementById("nsTxtBox");
	nsTxtBox.setAttribute("onkeyup", "art_semanticturkey.manageInput('ns',this);");
	nsTxtBox.setAttribute("onkeypress", "art_semanticturkey.checkEnter(event,'ns',this);");
	
	document.getElementById("lockBtn").addEventListener("command",
			art_semanticturkey.checkbind, true);
	
	document.getElementById("addPrefix").addEventListener("command",
			art_semanticturkey.addPrefix, true);
	document.getElementById("removePrefix").addEventListener("command",
			art_semanticturkey.removePrefix, true);
	document.getElementById("changePrefix").addEventListener("command",
			art_semanticturkey.changePrefix, true);
			
	//var stIsStarted = art_semanticturkey.ST_started.getStatus();
	var projectIsNull = art_semanticturkey.CurrentProject.isNull();
	if(projectIsNull == true){
		document.getElementById("import").disabled=true;
		document.getElementById("baseUriTxtBox").disabled=true;
		document.getElementById("nsTxtBox").disabled=true;
		document.getElementById("addPrefix").disabled=true;
		document.getElementById("removePrefix").disabled=true;
		document.getElementById("changePrefix").disabled=true;
		document.getElementById("infoOnProject").disabled = true;

	}
	document.getElementById("AddImportFromWeb").addEventListener("command",
			art_semanticturkey.addImport, true);
	document.getElementById("AddImportFromWebToMirror").addEventListener(
			"command", art_semanticturkey.addImport, true);
	document.getElementById("AddImportFromLocalFile").addEventListener(
			"command", art_semanticturkey.addImport, true);
	document.getElementById("AddImportFromOntologyMirror").addEventListener(
			"command", art_semanticturkey.addImport, true);

	document.getElementById("importsClipmenu").addEventListener("popupshowing",
			art_semanticturkey.showHideItems, true);
	document.getElementById("remove").addEventListener("command",art_semanticturkey.removeImport,true);
	document.getElementById("mirror").addEventListener("command",art_semanticturkey.mirrorOntology,true);
	document.getElementById("downloadFromWebToMirror").addEventListener("command",art_semanticturkey.downloadFromWebToMirror,true);
	document.getElementById("downloadFromWeb").addEventListener("command",art_semanticturkey.downloadFromWeb,true);
	document.getElementById("getFromLocalFile").addEventListener("command",art_semanticturkey.getFromLocalFile,true);
};

art_semanticturkey.getNSPrefixMappings_RESPONSE = function(responseXML){
	var namespaceTree = document.getElementById('namespaceTree');
	var node = namespaceTree.getElementsByTagName('treechildren')[0];
	var nsList = responseXML.getElementsByTagName("data")[0].childNodes;
	for ( var i = 0; i < nsList.length; i++) {
		if (nsList[i].nodeType == 1) {
			art_semanticturkey.parsingNSPrefixMappings(nsList[i], node);
		}
	}
};

art_semanticturkey.parsingNSPrefixMappings = function(namespaceNode, node) {
	var ns = namespaceNode.getAttribute("ns");
	var prefix = namespaceNode.getAttribute("prefix");
	var tr = document.createElement("treerow");
	var explicit = namespaceNode.getAttribute("explicit");
	var tcPrefix = document.createElement("treecell");
	tcPrefix.setAttribute("label", prefix);
	var tcNs = document.createElement("treecell");
	tcNs.setAttribute("label", ns);
	// NScarpato 07/04/2008 add grey text to no explicit namespace
	tcNs.setAttribute("properties", explicit);
	tcPrefix.setAttribute("properties", explicit);
	tr.setAttribute("explicit", explicit);
	tr.appendChild(tcPrefix);
	tr.appendChild(tcNs);
	var ti = document.createElement("treeitem");
	ti.appendChild(tr);
	node.appendChild(ti);
};

art_semanticturkey.getImports_RESPONSE = function(responseXML){
	var importTree = document.getElementById("importsTree");
	var node = importTree.getElementsByTagName('treechildren')[0];
	var nsList = responseXML.getElementsByTagName("data")[0].childNodes;	
	for ( var i = 0; i < nsList.length; i++) {
		if (nsList[i].nodeType == 1) {
			art_semanticturkey.parsingImports(nsList[i], node, "true");
		}
	}
};

art_semanticturkey.parsingImports = function(importsNode, node, isRoot) {
	var uri = importsNode.getAttribute("uri");
	var stato = importsNode.getAttribute("status");
	var localfile = importsNode.getAttribute("localfile");
	var tr = document.createElement("treerow");
	var tc = document.createElement("treecell");
	tc.setAttribute("label", uri);
	tc.setAttribute("localfile", localfile);
	tr.setAttribute("properties", stato);
	tc.setAttribute("properties", stato);
	tr.setAttribute("isRoot", isRoot);
	tc.setAttribute("isRoot", isRoot);
	tr.appendChild(tc);
	var ti = document.createElement("treeitem");
	var importsBox = document.getElementById("importsBox");
	ti.appendChild(tr);
	var tch = document.createElement("treechildren");
	ti.appendChild(tch);
	node.appendChild(ti);
	var importsNodes;
	var importsList = importsNode.childNodes;
	for ( var i = 0; i < importsList.length; i++) {
		if (importsList[i].nodeName == "ontology") {
			importsNodes = importsList[i].childNodes;
			if (importsList[i].nodeType == 1) {
				art_semanticturkey.parsingImports(importsList[i], tch, "false");
			}
			for ( var j = 0; j < importsNodes.length; j++) {
				if (importsNodes[j].nodeType == 1) {
					art_semanticturkey.parsingImports(importsNodes[j], tch, "false");
				}
			}
		}
		if (importsList != null && importsList.length > 0) {
			ti.setAttribute("open", true);
			ti.setAttribute("container", true);
		} else {
			ti.setAttribute("open", false);
			ti.setAttribute("container", false);
		}
	}
};


art_semanticturkey.getDefaultNamespace_RESPONSE = function(responseXML) {
	var ns = responseXML.getElementsByTagName('DefaultNamespace')[0].getAttribute('ns');
	var nstxbox = document.getElementById("nsTxtBox");
	nstxbox.setAttribute("value", ns);
	nstxbox.style.color = 'black';
};


art_semanticturkey.getBaseuri_RESPONSE = function(responseXML) {
	var bs = responseXML.getElementsByTagName('BaseURI')[0].getAttribute('uri');
	var basetxbox = document.getElementById("baseUriTxtBox");
	basetxbox.setAttribute("value", bs);
	basetxbox.style.color = 'black';
};


/**
 * NScarpato 25/03/2008 show or hidden contextmenu's items in particular the
 * remove item that it's shown only if the ontology it's root ontology
 */
art_semanticturkey.showHideItems = function() {
	var tree = document.getElementById("importsTree");
	var currentelement = tree.treeBoxObject.view.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var state = treerow.getAttribute("properties");
	document.getElementById("mirror").hidden = true;
	document.getElementById("downloadFromWebToMirror").hidden = true;
	document.getElementById("downloadFromWeb").hidden = true;
	document.getElementById("getFromLocalFile").hidden = true;
	document.getElementById("remove").hidden = true;
	// NScarpato add function for mirror ontologies and download if is failed
	if (state == "WEB") {
		document.getElementById("mirror").hidden = false;
	} else if (state == "FAILED") {
		document.getElementById("downloadFromWebToMirror").hidden = false;
		document.getElementById("downloadFromWeb").hidden = false;
		document.getElementById("getFromLocalFile").hidden = false;
	}
	isRoot = treerow.getAttribute("isRoot");
	if (isRoot == "true") {
		document.getElementById("remove").hidden = false;
	}
};
/**
 * downloadFailedImport
 * 
 * @param int
 *            selectedDownload
 */
art_semanticturkey.downloadFailedImport = function(selectDownload, selectedLabel) {
	var parameters = new Object();
	parameters.selectedIndex = selectDownload;
	parameters.selectLabel = selectedLabel;
	parameters.importsTree = document.getElementById("importsTree");
	parameters.namespaceTree = document.getElementById('namespaceTree');
	parameters.importsBox = document.getElementById("importsBox");
	window.openDialog(
			"chrome://semantic-turkey/content/metadata/addImport.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
};
/**
 * mirrorOntology
 * 
 * @param
 */
art_semanticturkey.mirrorOntology = function() {
	var tree = document.getElementById("importsTree");
	var currentelement = tree.treeBoxObject.view.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var uri = treecell.getAttribute("label");
	var mirrorname = prompt("Insert the name of new mirror file");
	if(mirrorname == null)
		return;
	try{
		var responseXML = art_semanticturkey.STRequests.Metadata.mirrorOntology(
				uri, mirrorname);
		art_semanticturkey.mirrorOntology_RESPONSE(responseXML);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
	};

art_semanticturkey.mirrorOntology_RESPONSE = function(responseElement){
	var reply = responseElement.getElementsByTagName("reply")[0];
	var status = reply.getAttribute("status");
	if(status == "ok")		
		art_semanticturkey.emptyNSandImportTreesAndPopulateThem();
};

art_semanticturkey.getSelectedIndex = function(){
	return document.getElementById("import").selectedIndex;
};

art_semanticturkey.getSelectedLabel = function(){
	return document.getElementById("import").selectedItem.getAttribute("label");
};

art_semanticturkey.getSelectedIndex = function(){
	return document.getElementById("import").selectedIndex;
};
