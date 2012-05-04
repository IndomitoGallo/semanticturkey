Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");
Components.utils.import("resource://stmodules/stEvtMgr.jsm");
 
EXPORTED_SYMBOLS = [ "STRequests" ];

var service = STRequests.SKOS;
var serviceName = service.serviceName;

/**
 * Gets the top concepts of a given concept scheme.
 * 
 * @member STRequests.SKOS
 * @param scheme the concept scheme QName
 * @param lang the default language
 * @return
 */
function getTopConcepts(scheme,lang) {
	Logger.debug('[SERVICE_SKOS.jsm] getTopConcepts');
	var scheme_p = scheme == null ? "" : "scheme=" + scheme;
	var lang_p = "lang=" + lang;
	return HttpMgr.GET(serviceName, service.getTopConceptsRequest,scheme_p,lang_p);
}

/**
 * Gets the narrower concepts of a given concept. 
 * 
 * @member STRequests.SKOS
 * @param concept the concept QName
 * @param scheme the scheme QName
 * @param lang the default language
 * @return
 */
function getNarrowerConcepts(concept, scheme, lang) {
	Logger.debug('[SERVICE_SKOS.jsm] getNarrowerConcepts');
	var concept_p = "concept=" + concept;
	var scheme_p = scheme == null ? "" : "scheme=" + scheme;
	var treeView_p ="treeView=true";
	var lang_p = "lang=" + lang;
	return HttpMgr.GET(serviceName, service.getNarrowerConceptsRequest,concept_p, scheme_p, treeView_p, lang_p);
}

/**
 * Gets the list of all schemes.
 * 
 * @member STRequests.SKOS
 * @param lang the default language
 * @return
 */
function getAllSchemesList(lang) {
	Logger.debug('[SERVICE_SKOS.jsm] getAllSchemesList: langTag (' + lang + ')');
	var lang_p = "lang=" + lang;
	return HttpMgr.GET(serviceName, service.getAllSchemesListRequest, lang_p);
}

function getConceptDescription(concept, method) {
	Logger.debug('[SERVICE_SKOS.jsm] getConceptDescription');
	var concept_p = "concept=" + concept;
	var method_p = "method=" + method;
	
	return HttpMgr.GET(serviceName, service.getConceptDescriptionRequest,concept_p, method_p);	
}

function getConceptSchemeDescription(scheme) {
	Logger.debug('[SERVICE_SKOS.jsm] getConceptSchemeDescription');
	var scheme_p = "scheme=" + scheme;
	var method_p = "method=" + "templateandvalued";
	
	return HttpMgr.GET(serviceName, service.getConceptSchemeDescriptionRequest,scheme_p, method_p);	
}

function addBroaderConcept(concept, broaderConcept) {
	var concept_p = "concept=" + concept;
	var broaderConcept_p = "broaderConcept=" + broaderConcept;
	
	var reply = HttpMgr.GET(serviceName, service.addBroaderConceptRequest, concept_p, broaderConcept_p);

	if (!reply.isFail()) {
		evtMgr.fireEvent("skosBroaderConceptAdded", {getConceptName : function(){return concept;}, hasSubsumees : function(){return reply.getElementsByTagName("concept")[0].getAttribute("more") == "1";}, getURI : function() {return reply.getElementsByTagName("concept")[0].getAttribute("uri");}, getLabel : function(){return reply.getElementsByTagName("concept")[0].getAttribute("label");}, getBroaderConceptName : function(){return broaderConcept}});
	}
	
	return reply;
}

/**
 * Creates a concept in a concept scheme.
 * 
 * @member STRequests.SKOS
 * @param concept the concept QName
 * @param scheme the scheme QName, where the concept will be added to
 * @param prefLabel the preferred label
 * @param prefLabelLanguage the preferred label language
 * @return
 */
function createConcept(concept, broaderConcept, scheme, prefLabel, prefLabelLanguage) {
	var concept_p = "concept=" + concept;
	var broaderConcept_p = (broaderConcept != null) ? ("broaderConcept=" + broaderConcept) : "";
	var scheme_p = "scheme=" + scheme;
	var prefLabel_p = "prefLabel=" + prefLabel;
	var prefLabelLanguage_p = "lang=" + prefLabelLanguage;
	
	var reply = HttpMgr.GET(serviceName, service.createConceptRequest, concept_p, broaderConcept_p, scheme_p, prefLabel_p, prefLabelLanguage_p);

	if (!reply.isFail()) {
		evtMgr.fireEvent("skosConceptAdded", {getConceptQName : function(){return concept;}, getBroaderConceptQName : function(){return broaderConcept;}, hasSubsumees : function(){return reply.getElementsByTagName("concept")[0].getAttribute("more") == "1";}, getURI : function() {return reply.getElementsByTagName("concept")[0].getAttribute("uri");}, getLabel : function(){return reply.getElementsByTagName("concept")[0].getAttribute("label");}});
	}
	
	return reply;
}

/**
 * Creates a concept scheme in the KOS.
 * 
 * @member STRequests.SKOS
 * @param scheme the concept scheme QName
 * @param prefLabel the concept scheme preferred label
 * @param prefLabelLanguage the preferred label language
 * @return
 */
function createScheme(scheme, prefLabel, prefLabelLanguage) {
	Logger.debug('[SERVICE_SKOS.jsm] createScheme');
	var scheme_p = "scheme=" + scheme;
	var prefLabel_p = "prefLabel=" + prefLabel;
	var prefLabelLanguage_p = "lang=" + prefLabelLanguage;
	
	var reply = HttpMgr.GET(serviceName, service.createSchemeRequest,scheme_p, prefLabel_p,prefLabelLanguage_p);
	
	if (!reply.isFail()) {
		evtMgr.fireEvent("skosSchemeAdded", {getSchemeName : function(){return scheme;}, getURI : function(){return reply.getElementsByTagName("scheme")[0].getAttribute("uri");}, getLabel : function(){return reply.getElementsByTagName("scheme")[0].getAttribute("label");}});
	}
	
	return reply;
}

/**
 * Deletes a concept.
 * 
 * @member STRequests.SKOS
 * @param concept the concept QName
 * @return
 */
function deleteConcept(concept) {
	Logger.debug('[SERVICE_SKOS.jsm] deleteConcept');
	var concept_p = "concept=" + concept;
	
	var reply = HttpMgr.GET(serviceName, service.deleteConceptRequest, concept_p);
	
	if (!reply.isFail()) {
		evtMgr.fireEvent("skosConceptRemoved", {getConceptName : function(){return concept;}});
	}
	
	return reply;
}

/**
 * Deletes a concept scheme.
 * 
 * @member STRequests.SKOS
 * @param scheme the scheme QName
 * @param forceDeleteDanglingConcepts indicates whether or not delete the dangling concepts. If this argument is omitted and the scheme is not empty, then the operation will fail.
 * @return
 */
function deleteScheme(scheme, forceDeleteDanglingConcepts) {
	Logger.debug('[SERVICE_SKOS.jsm] deleteScheme');
	var setForceDeleteDanglingConcepts = typeof forceDeleteDanglingConcepts != "undefined";
	
	var scheme_p = "scheme=" + scheme;
	var setForceDeleteDanglingConcepts_p = "setForceDeleteDanglingConcepts=" + setForceDeleteDanglingConcepts;
	var forceDeleteDanglingConcepts_p = setForceDeleteDanglingConcepts ? "forceDeleteDanglingConcepts=" + forceDeleteDanglingConcepts : ""; 
	
	var reply = HttpMgr.GET(serviceName, service.deleteSchemeRequest, scheme_p, setForceDeleteDanglingConcepts_p, forceDeleteDanglingConcepts_p);
	
	if (!reply.isFail()) {
		evtMgr.fireEvent("skosSchemeRemoved", {getSchemeName : function(){return scheme;}});
	}
	
	return reply;
}


function removeBroaderConcept(concept, broaderConcept) {
	var concept_p = "concept=" + concept;
	var broaderConcept_p = "broaderConcept=" + broaderConcept;
	
	var reply = HttpMgr.GET(serviceName, service.removeBroaderConceptRequest, concept_p, broaderConcept_p);

	if (!reply.isFail()) {
		evtMgr.fireEvent("skosBroaderConceptRemoved", {});
	}
	
	return reply;
}

// SKOS SERVICE INITIALIZATION
service.getTopConcepts = getTopConcepts;
service.getAllSchemesList = getAllSchemesList;
service.getNarrowerConcepts = getNarrowerConcepts;
service.getConceptDescription = getConceptDescription;
service.getConceptSchemeDescription = getConceptSchemeDescription;

service.addBroaderConcept = addBroaderConcept;

service.createConcept = createConcept;
service.createScheme = createScheme;

service.deleteConcept = deleteConcept;
service.deleteScheme = deleteScheme;

service.removeBroaderConcept = removeBroaderConcept;