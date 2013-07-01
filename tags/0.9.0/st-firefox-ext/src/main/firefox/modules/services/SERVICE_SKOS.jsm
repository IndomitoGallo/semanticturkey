Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");
Components.utils.import("resource://stmodules/stEvtMgr.jsm");
Components.utils.import("resource://stmodules/Deserializer.jsm");	
Components.utils.import("resource://stmodules/ARTResources.jsm");
				

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
	var language_p = lang != null ? "lang=" + lang : "";

	return Deserializer.createRDFArray(HttpMgr.GET(serviceName, service.getTopConceptsRequest,scheme_p,language_p));
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
	var language_p = lang != null ? "lang=" + lang : "";

	return Deserializer.createRDFArray(HttpMgr.GET(serviceName, service.getNarrowerConceptsRequest,concept_p, scheme_p, treeView_p, language_p));
}

/**
 * Gets the list of all schemes.
 * 
 * @member STRequests.SKOS
 * @param lang the default language
 * @return
 */
function getAllSchemesList(lang) {
	Logger.debug('[SERVICE_SKOS.jsm] getAllSchemesList');
	var language_p = lang != null ? "lang=" + lang : "";

	return Deserializer.createRDFArray(HttpMgr.GET(serviceName, service.getAllSchemesListRequest, language_p));
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

function getPrefLabel(concept, lang) {
	Logger.debug('[SERVICE_SKOS.jsm] getPrefLabel');
	var concept_p = "concept=" + concept;
	var lang_p = "lang=" + lang;
	
	return HttpMgr.GET(serviceName, service.getPrefLabelRequest,concept_p, lang_p);	
}

function addBroaderConcept(concept, broaderConcept) {
	var concept_p = "concept=" + concept;
	var broaderConcept_p = "broaderConcept=" + broaderConcept;
	
	var reply = HttpMgr.GET(serviceName, service.addBroaderConceptRequest, concept_p, broaderConcept_p);

	if (!reply.isFail()) {
		var conceptResource = Deserializer.createRDFResource(reply.getElementsByTagName("data")[0].children[0]);
		Logger.debug(conceptResource);
		evtMgr.fireEvent("skosBroaderConceptAdded", {
			getConcept : function(){return conceptResource;}, 
			getBroaderConceptName : function(){return broaderConcept}
		});
	}
	
	return reply;
}

function addTopConcept(scheme, concept) {
	var scheme_p = "scheme=" + scheme;
	var concept_p = "concept=" + concept;
	
	var reply = HttpMgr.GET(serviceName, service.addTopConceptRequest, scheme_p, concept_p);

	if (!reply.isFail()) {
		var topConcept = Deserializer.createRDFResource(reply.getElementsByTagName("data")[0].children[0]);
		evtMgr.fireEvent("skosTopConceptAdded", {
			getTopConcept : function(){return topConcept;},
			getSchemeName : function(){return scheme;}
		});
	}
	
	return reply;
}

function setPrefLabel(concept, label, lang) {
	var concept_p = "concept=" + concept;
	var label_p = "label=" + label;
	var lang_p = "lang=" + lang;
	
	var reply = HttpMgr.GET(serviceName, service.setPrefLabelRequest, concept_p, label_p, lang_p);

	if (!reply.isFail()) {
		evtMgr.fireEvent("skosPrefLabelSet", {
			getConceptName : function(){return concept;}, 
			getLabel : function(){return label;}, 
			getLang : function(){return lang;}});	
	}
	
	return reply;
	
}

function removeTopConcept(scheme, concept) {
	var scheme_p = "scheme=" + scheme;
	var concept_p = "concept=" + concept;
	
	var reply = HttpMgr.GET(serviceName, service.removeTopConceptRequest, scheme_p, concept_p);

	if (!reply.isFail()) {
		evtMgr.fireEvent("skosTopConceptRemoved", {
			getConceptName : function(){return concept;}, 
			getSchemeName : function(){return scheme}
		});
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
 * @param prefLabel Language the preferred label language
 * @param language the default language
 * @return
 */
function createConcept(concept, broaderConcept, scheme, prefLabel, prefLabelLanguage, language) {
	var concept_p = "concept=" + concept;
	var broaderConcept_p = (broaderConcept != null) ? ("broaderConcept=" + broaderConcept) : "";
	var scheme_p = "scheme=" + scheme;
	var prefLabel_p = prefLabel != null ? "prefLabel=" + prefLabel : "";
	var prefLabelLanguage_p = prefLabelLanguage != null ? "prefLabelLang=" + prefLabelLanguage : "";
	var language_p = language != null ? "lang=" + language : "";
	
	var reply = HttpMgr.GET(serviceName, service.createConceptRequest, concept_p, broaderConcept_p, scheme_p, prefLabel_p, prefLabelLanguage_p, language_p);

	var uriValue = Deserializer.createURI(reply);
	
	if (!reply.isFail()) {
		evtMgr.fireEvent("skosConceptAdded", {
			getConcept : function(){return uriValue;}, 
			getBroaderConceptName : function(){return broaderConcept;} 
		});
	}
	
	return uriValue;
}

//TODO use new resource serialization

/**
 * Creates a concept scheme in the KOS.
 * 
 * @member STRequests.SKOS
 * @param scheme the concept scheme QName
 * @param prefLabel the concept scheme preferred label
 * @param prefLabelLanguage the preferred label language
 * @param language the default language
 * @return
 */
function createScheme(scheme, prefLabel, prefLabelLanguage, language) {
	Logger.debug('[SERVICE_SKOS.jsm] createScheme');
	var scheme_p = "scheme=" + scheme;
	var prefLabel_p = prefLabel != null ? "prefLabel=" + prefLabel : "";
	var prefLabelLanguage_p = prefLabelLanguage != null ? "prefLabelLang=" + prefLabelLanguage : "";
	var language_p = language != null ? "lang=" + language : "";
	
	var reply = HttpMgr.GET(serviceName, service.createSchemeRequest,scheme_p, prefLabel_p,prefLabelLanguage_p, language_p);
	
	var uriValue = Deserializer.createURI(reply);
	
	if (!reply.isFail()) {
		evtMgr.fireEvent("skosSchemeAdded", {
			getSchemeName : function(){return uriValue.getURI();}, 
			getURI : function(){return uriValue.getURI();}, 
			getLabel : function(){return uriValue.getShow();}
		});
	}
	return uriValue;
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
		evtMgr.fireEvent("skosConceptRemoved", {
			getConceptName : function(){return concept;}
		});
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
		evtMgr.fireEvent("skosSchemeRemoved", {
			getSchemeName : function(){return scheme;}
		});
	}
	
	return reply;
}


function removeBroaderConcept(concept, broaderConcept) {
	var concept_p = "concept=" + concept;
	var broaderConcept_p = "broaderConcept=" + broaderConcept;
	
	var reply = HttpMgr.GET(serviceName, service.removeBroaderConceptRequest, concept_p, broaderConcept_p);

	if (!reply.isFail()) {
		evtMgr.fireEvent("skosBroaderConceptRemoved", {
			getConceptName : function(){return concept;}, 
			getBroaderConceptName : function(){return broaderConcept;}
		});
	}
	
	return reply;
}

function removePrefLabel(concept, label, lang) {
	var concept_p = "concept=" + concept;
	var label_p = "label=" + label;
	var lang_p = "lang=" + lang;
	
	var reply = HttpMgr.GET(serviceName, service.removePrefLabelRequest, concept_p, label_p, lang_p);

	if (!reply.isFail()) {
		evtMgr.fireEvent("skosPrefLabelRemoved", {
			getConceptName : function(){return concept;}, 
			getLabel : function(){return label;}, 
			getLang : function(){return lang;}
		});
	}
	
	return reply;
}

function getShow(resourceName, language) {
	var resourceName_p = "resourceName=" + resourceName;
	var language_p = language != null ? "lang=" + language : "";	
	
	var reply = HttpMgr.GET(serviceName, service.getShowRequest, resourceName_p, language_p);
	
	return reply.getElementsByTagName("show")[0].getAttribute("value");
}


// SKOS SERVICE INITIALIZATION
service.getTopConcepts = getTopConcepts;
service.getAllSchemesList = getAllSchemesList;
service.getNarrowerConcepts = getNarrowerConcepts;
service.getConceptDescription = getConceptDescription;
service.getConceptSchemeDescription = getConceptSchemeDescription;
service.getPrefLabel = getPrefLabel;
service.getShow = getShow;

service.addBroaderConcept = addBroaderConcept;
service.addTopConcept = addTopConcept;

service.setPrefLabel = setPrefLabel;

service.createConcept = createConcept;
service.createScheme = createScheme;

service.deleteConcept = deleteConcept;
service.deleteScheme = deleteScheme;

service.removeBroaderConcept = removeBroaderConcept;
service.removeTopConcept = removeTopConcept;
service.removePrefLabel = removePrefLabel;