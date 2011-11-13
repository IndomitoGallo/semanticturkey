Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");

EXPORTED_SYMBOLS = [ "HttpMgr", "STRequests" ];

var service = STRequests.Metadata;
var serviceName = service.serviceName;


/**
 * returns the description of resource representing the current ontology
 * 
 * @member STRequests.Metadata
 * @return
 */
function getOntologyDescription() {
	return HttpMgr.GET(serviceName, service.getOntologyDescriptionRequest);
}

/**
 * returns the baseuri of the current ontology
 * 
 * @member STRequests.Metadata
 * @return
 */
function getBaseuri() {
	return HttpMgr.GET(serviceName, service.getBaseuriRequest);
}

/**
 * returns the default namespace of the current ontology
 * 
 * @member STRequests.Metadata
 * @return
 */
function getDefaultNamespace() {
	return HttpMgr.GET(serviceName, service.getDefaultNamespaceRequest);
}

/**
 * returns a tree forest representing current ontology imports. The roots of this forest list ontologies
 * directly imported from the current ontology, while subsequent nodes represent recursive imports
 * 
 * @member STRequests.Metadata
 * @return
 */
function getImports() {
	return HttpMgr.GET(serviceName, service.getImportsRequest);
}

/**
 * returns a list of mappings between prefixes and namespaces. Also, for each entry it is told whether this
 * mapping has been provided by the system (because it has been automatically guessed from the namespace name,
 * or because it is a mapping specified in one of the imported ontologies) or if has been explictly setup by
 * the user
 * 
 * @member STRequests.Metadata
 * @return
 */
function getNSPrefixMappings() {
	return HttpMgr.GET(serviceName, service.getNSPrefixMappingsRequest);
}

/**
 * returns the list of named graphs for the current ontology. By default, Semantic Turkey associates named
 * graphs to triples of imported ontologies, as well as to <code>application</code> and <code>support</code>
 * ontologies
 * 
 * @member STRequests.Metadata
 * @return
 */
function getNamedGraphs() {
	return HttpMgr.GET(serviceName, service.getNamedGraphsRequest);
}

/**
 * sets both baseuri and default namespace for the ontology of the current project
 * 
 * @member STRequests.Metadata
 * @param baseuri
 * @param namespace
 * @return
 */
function setBaseuriDefNamespace(baseuri, namespace) {
	var baseuri = "baseuri=" + baseuri;
	var namespace = "namespace=" + namespace;
	return HttpMgr.GET(serviceName, service.setBaseuriDefNamespaceRequest, baseuri, namespace);
}

/**
 * sets the default namespace for the ontology of the current project
 * 
 * @member STRequests.Metadata
 * @param namespace
 * @return
 */
function setDefaultNamespace(namespace) {
	var namespace = "namespace=" + namespace;
	return HttpMgr.GET(serviceName, service.setDefaultNamespaceRequest, namespace);
}

/**
 * sets the baseuri for the ontology of the current project
 * 
 * @member STRequests.Metadata
 * @param uri
 * @return
 */
function setBaseuri(uri) {
	var uri = "baseuri=" + uri;
	return HttpMgr.GET(serviceName, service.setBaseuriRequest, uri);
}

/**
 * adds a mapping between a namespace and a chosen prefix
 * 
 * @member STRequests.Metadata
 * @param prefix
 * @param namespace
 * @return
 */
function setNSPrefixMapping(prefix, namespace) {
	var prefix = "prefix=" + prefix;
	var namespace = "namespace=" + namespace;
	return HttpMgr.GET(serviceName, service.setNSPrefixMappingRequest, prefix, namespace);
}

/**
 * deletes a mapping from the prefix-namespace mapping table
 * 
 * @member STRequests.Metadata
 * @param namespace
 * @return
 */
function removeNSPrefixMapping(namespace) {
	var namespace = "namespace=" + namespace;
	return HttpMgr.GET(serviceName, service.removeNSPrefixMappingRequest, namespace);
}

/**
 * overwrites an entry in the prefix-namespace mapping table
 * 
 * @member STRequests.Metadata
 * @param prefix
 * @param namespace
 * @return
 */
function changeNSPrefixMapping(prefix, namespace) {
	var prefix = "prefix=" + prefix;
	var namespace = "namespace=" + namespace;
	return HttpMgr.GET(serviceName, service.changeNSPrefixMappingRequest, prefix, namespace);
}

/**
 * removes an import from the ontology of the current project. This operation deletes the named graph
 * associated to this import and the triples associated to the named graph
 * 
 * @member STRequests.Metadata
 * @param baseuri
 * @return
 */
function removeImport(baseuri) {
	var baseuri = "baseuri=" + baseuri;
	return HttpMgr.GET(serviceName, service.removeImportRequest, baseuri);
}

/**
 * imports an ontology from the Web. The imported ontology is considered to be always available from the Web,
 * so it is always rrefreshed each time the working ontology is being reloaded
 * 
 * @member STRequests.Metadata
 * @param baseuri
 * @param alturl
 *            if the baseuri is different from the phisical location of the ontology, then alturl specifies
 *            where to look for the file to be downloaded
 * @return
 */
function addFromWeb(baseuri, alturl) {
	var baseuri = "baseuri=" + baseuri;
	if (typeof alturl != "undefined") {
		var alturl = "alturl=" + alturl;
		return HttpMgr.GET(serviceName, service.addFromWebRequest, baseuri, alturl);
	} else {
		return HttpMgr.GET(serviceName, service.addFromWebRequest, baseuri);
	}
}

/**
 * imports an ontology from the Web to a local cache. The imported ontology is cached in a local file in
 * Semantic Turkey's ontologies mirror location
 * 
 * @member STRequests.Metadata
 * @param baseuri
 * @param mirrorFile
 *            the name of the cache file which is saved locally in the ontologies mirror of Semantic Turkey
 * @param alturl
 *            if the baseuri is different from the phisical location of the ontology, then alturl specifies
 *            where to look for the file to be downloaded
 * @return
 */
function addFromWebToMirror(baseuri, mirrorFile, alturl) {
	var baseuri = "baseuri=" + baseuri;
	var mirrorFile = "mirrorFile=" + mirrorFile;
	if (typeof alturl != "undefined") {
		var alturl = "alturl=" + alturl;
		return HttpMgr.GET(serviceName, service.addFromWebToMirrorRequest, baseuri, mirrorFile, alturl);
	} else {
		return HttpMgr.GET(serviceName, service.addFromWebToMirrorRequest, baseuri, mirrorFile);
	}
}

/**
 * imports an ontology from a file in the local file system. The imported ontology is cached in a local file
 * in Semantic Turkey's ontologies mirror location
 * 
 * @member STRequests.Metadata
 * @param baseuri
 * @param localFilePath
 *            the path to the source file which is imported in the current ontology
 * @param mirrorFile
 *            the name of the cache file which is saved locally in the ontologies mirror of Semantic Turkey
 * @return
 */
function addFromLocalFile(baseuri, localFilePath, mirrorFile) {
	var baseuri = "baseuri=" + baseuri;
	var localFilePath = "localFilePath=" + localFilePath;
	var mirrorFile = "mirrorFile=" + mirrorFile;
	return HttpMgr.GET(serviceName, service.addFromLocalFileRequest, baseuri, localFilePath, mirrorFile);
}

/**
 * imports an ontology by taking its content directly from the ontologies mirror of Semantic Turkey
 * 
 * @member STRequests.Metadata
 * @param baseuri
 * @param mirrorFile
 *            the name of the cache file which is imported into current ontology
 * @return
 */
function addFromOntologyMirror(baseuri, mirrorFile) {
	baseuri = "baseuri=" + baseuri;
	mirrorFile = "mirrorFile=" + mirrorFile;
	return HttpMgr.GET(serviceName, service.addFromOntologyMirrorRequest, baseuri, mirrorFile);
}

/**
 * as for addFromWebToMirror, excepts that this does not add an owl:imports statement to the current ontology.
 * It is mainly used to recover failed downloads of the content of ontologies which have already been declared
 * to be imported
 * 
 * @member STRequests.Metadata
 * @param baseuri
 * @param mirrorFile
 * @param alturl
 * @return
 */
function downloadFromWebToMirror(baseuri, mirrorFile, alturl) {
	var baseuri = "baseuri=" + baseuri;
	var mirrorFile = "mirrorFile=" + mirrorFile;
	if (typeof alturl != "undefined") {
		var alturl = "alturl=" + alturl;
		return HttpMgr.GET(serviceName, service.downloadFromWebToMirrorRequest, baseuri, mirrorFile, alturl);
	} else {
		return HttpMgr.GET(serviceName, service.downloadFromWebToMirrorRequest, baseuri, mirrorFile);
	}
}

/**
 * as for addFromWeb, excepts that this does not add an owl:imports statement to the current ontology. It is
 * mainly used to recover failed downloads of the content of ontologies which have already been declared to be
 * imported
 * 
 * @member STRequests.Metadata
 * @param baseuri
 * @param alturl
 * @return
 */
function downloadFromWeb(baseuri, alturl) {
	var baseuri = "baseuri=" + baseuri;
	if (typeof alturl != "undefined") {
		var alturl = "alturl=" + alturl;
		return HttpMgr.GET(serviceName, service.downloadFromWebRequest, baseuri, alturl);
	} else {
		return HttpMgr.GET(serviceName, service.downloadFromWebRequest, baseuri);
	}
}

/**
 * as for addFromLocalFile, excepts that this does not add an owl:imports statement to the current ontology.
 * It is mainly used to recover failed downloads of the content of ontologies which have already been declared
 * to be imported
 * 
 * @member STRequests.Metadata
 * @param baseuri
 * @param localFilePath
 * @param mirrorFile
 * @param alturl
 * @return
 */
function getFromLocalFile(baseuri, localFilePath, mirrorFile, alturl) {
	var baseuri = "baseuri=" + baseuri;
	var localFilePath = "localFilePath=" + localFilePath;
	var mirrorFile = "mirrorFile=" + mirrorFile;
	if (typeof alturl != "undefined") {
		var alturl = "alturl=" + alturl;
		return HttpMgr.GET(serviceName, service.getFromLocalFileRequest, baseuri, localFilePath, mirrorFile,
				alturl);
	} else {
		return HttpMgr.GET(serviceName, service.getFromLocalFileRequest, baseuri, localFilePath, mirrorFile);
	}
}

/**
 * mirrors an ontology which has already been imported
 * 
 * @member STRequests.Metadata
 * @param baseuri
 * @param mirrorFile
 * @return
 */
function mirrorOntology(baseuri, mirrorFile) {
	baseuri = "baseuri=" + baseuri;
	mirrorFile = "mirrorFile=" + mirrorFile;
	return HttpMgr.GET(serviceName, service.mirrorOntologyRequest, baseuri, mirrorFile);
}


// Annotation SERVICE INITIALIZATION
service.getOntologyDescription = getOntologyDescription;
service.getBaseuri = getBaseuri;
service.getDefaultNamespace = getDefaultNamespace;
service.getImports = getImports;
service.getNSPrefixMappings = getNSPrefixMappings;
service.setBaseuriDefNamespace = setBaseuriDefNamespace;
service.setDefaultNamespace = setDefaultNamespace;
service.setBaseuri = setBaseuri;
service.setNSPrefixMapping = setNSPrefixMapping;
service.removeNSPrefixMapping = removeNSPrefixMapping;
service.changeNSPrefixMapping = changeNSPrefixMapping;
service.removeImport = removeImport;
service.addFromWeb = addFromWeb;
service.addFromWebToMirror = addFromWebToMirror;
service.addFromLocalFile = addFromLocalFile;
service.addFromOntologyMirror = addFromOntologyMirror;
service.downloadFromWebToMirror = downloadFromWebToMirror;
service.downloadFromWeb = downloadFromWeb;
service.getFromLocalFile = getFromLocalFile;
service.mirrorOntology = mirrorOntology;
service.getNamedGraphs = getNamedGraphs;
