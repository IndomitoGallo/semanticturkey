Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");

EXPORTED_SYMBOLS = [ "STRequests" ];

var service = STRequests.Administration;
var serviceName = service.serviceName;

/**
 * this service sets the configuration for the amount of information which is shown to the user.<br/>
 * Possible values of adminLevel are "on" or "off". Default is off<br/> With value set to "on", user is able
 * to see also the content of triples related to application ontologies (such as the annotation ontology
 * present in Semantic Turkey, or other ontologies adopted by installed Semantic Turkey extensions)
 * 
 * @member STRequests.Administration
 * @param adminLevel
 * @return
 */
function setAdminLevel(adminLevel) {
	var adminLevel = "adminLevel=" + adminLevel;
	return HttpMgr.GET(serviceName, service.setAdminLevelRequest, adminLevel);
}

/**
 * this method returns the list of cached ontology files which replicate the content of ontologies on the web
 * 
 * @member STRequests.Administration
 * @return
 */
function getOntologyMirror() {
	return HttpMgr.GET(serviceName, service.getOntologyMirrorRequest);
}

/**
 * given the baseuri and name of cached file of an ontology in the ontology mirror, this method deletes the
 * corresponding entry on Semantic Turkey Ontology Mirror
 * 
 * @member STRequests.Administration
 * @param ns
 * @param file
 * @return
 */
function deleteOntMirrorEntry(ns, file) {
	var ns = "ns=" + ns;
	var file = "file=" + file;
	return HttpMgr.GET(serviceName, service.deleteOntMirrorEntryRequest, ns, file);
}

/**
 * this method tells the Ontology Mirror to refresh the cached file of an ontology by downloading again the
 * RDF content of its original ontology from the web
 * 
 * @member STRequests.Administration
 * @param baseURI
 * @param mirrorFileName
 * @param srcLoc
 * @param location
 * @return
 */
function updateOntMirrorEntry(baseURI, mirrorFileName, srcLoc, location) {
	var baseURI = "baseURI=" + baseURI;
	var mirrorFileName = "mirrorFileName=" + mirrorFileName;
	var srcLoc = "srcLoc=" + srcLoc;
	var loc;

	Logger.debug("inizio updateOntMirrorEntry");

	Logger.debug("dentro updateOntMirrorEntry e location = " + location);

	if (srcLoc == "srcLoc=wbu")
		return HttpMgr.GET(serviceName, service.updateOntMirrorEntryRequest, baseURI, mirrorFileName, srcLoc);
	else if (srcLoc == "srcLoc=walturl")
		loc = "altURL=" + location;
	else if (srcLoc == "srcLoc=lf")
		loc = "updateFilePath=" + location;

	Logger.debug("dentro updateOntMirrorEntry e loc = " + loc);

	return HttpMgr
			.GET(serviceName, service.updateOntMirrorEntryRequest, baseURI, mirrorFileName, srcLoc, loc);
}

// Administration SERVICE INITIALIZATION
service.setAdminLevel = setAdminLevel;
service.getOntologyMirror = getOntologyMirror;
service.deleteOntMirrorEntry = deleteOntMirrorEntry;
service.updateOntMirrorEntry = updateOntMirrorEntry;
