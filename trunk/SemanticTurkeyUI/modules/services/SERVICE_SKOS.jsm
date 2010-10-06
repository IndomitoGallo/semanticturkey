Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");

EXPORTED_SYMBOLS = [ "STRequests" ];

var service = STRequests.SKOS;
var serviceName = service.serviceName;

/**
 * gets the list of schemes
 * 
 * @member STRequests.SKOS
 * @return
 */
function getAllSchemesList(langTag) {
	Logger.debug('[SERVICE_SKOS.jsm] getAllSchemesList: langTag (' + langTag + ')');
	var langTag = "langTag=" + langTag;
	return HttpMgr.GET(serviceName, service.getAllSchemesListRequest, langTag);
}

/**
 * list of concepts associated at the scheme 
 * 
 * @member STRequests.SKOS
 * @return
 */
function getConceptsTree(schemeName,langTag) {
	Logger.debug('[SERVICE_SKOS.jsm] getConceptsTree');
	var schemeName = "schemeName=" + schemeName;
	var langTag = "langTag=" + langTag;
	return HttpMgr.GET(serviceName, service.getConceptsTreeRequest,schemeName,langTag);
}

/**
 * list of narrower concepts 
 * 
 * @member STRequests.SKOS
 * @return
 */
function getNarrowerConcepts(conceptName,langTag) {
	Logger.debug('[SERVICE_SKOS.jsm] getConceptsTree');
	var conceptName = "conceptName=" + conceptName;
	var langTag = "langTag=" + langTag;
	return HttpMgr.GET(serviceName, service.getNarrowerConceptsRequest,conceptName,langTag);
}

/**
 * adds a concept to the ontology
 * 
 * @member STRequests.Cls
 * @param conceptName
 * @param schemeName
 * @param rdfsLabel
 * @param rdfsLabelLanguage
 * @param preferredLabel
 * @param preferredLabelLanguage
 * @return
 */
function addConcept(conceptName, schemeName, rdfsLabel,rdfsLabelLanguage, preferredLabel,preferredLabelLanguage) {
	var conceptName = "conceptName=" + conceptName;
	var schemeName = "schemeName=" + schemeName;
	var rdfsLabel = "rdfsLabel=" + rdfsLabel;
	var rdfsLabelLanguage = "rdfsLabelLanguage=" + rdfsLabelLanguage;
	var preferredLabel = "preferredLabel=" + preferredLabel;
	var preferredLabelLanguage = "preferredLabelLanguage=" + preferredLabelLanguage;
	return HttpMgr.GET(serviceName, service.addConceptRequest, conceptName, schemeName, rdfsLabel,rdfsLabelLanguage, preferredLabel,preferredLabelLanguage);
}


/**
 * Add semantic relation between two concepts
 * 
 * @member STRequests.SKOS
 * @param from
 * @param relation
 * @param to
 * @return
 */
function addSemanticRelation(conceptFrom, semanticRelation, conceptTo) {
	Logger.debug('[SERVICE_SKOS.jsm] addSemanticRelation');
	var conceptFrom = "conceptFrom=" + conceptFrom;
	var semanticRelation = "semanticRelation=" + semanticRelation;
	var conceptTo = "conceptTo=" + conceptTo;
	return HttpMgr.GET(serviceName, service.addSemanticRelationRequest, conceptFrom, semanticRelation, conceptTo);
}

/**
 * create a new concept narrower then relatedConcept
 * 
 * @member STRequests.Cls
 * @param newConcept
 * @param relatedConcept
 * @param rdfsLabel
 * @param rdfsLabelLanguage
 * @param preferredLabel
 * @param preferredLabelLanguage
 * @return
 */

function createNarrowerConcept(newConcept, schemeName, relatedConcept,rdfsLabel, rdfsLabelLanguage,preferredLabel,preferredLabelLanguage) {
	var newConcept = "newConcept=" + newConcept;
	var relatedConcept = "relatedConcept=" + relatedConcept;
	var schemeName = "schemeName=" + schemeName;
	var rdfsLabel = "rdfsLabel=" + rdfsLabel;
	var rdfsLabelLanguage = "rdfsLabelLanguage=" + rdfsLabelLanguage;
	var preferredLabel = "preferredLabel=" + preferredLabel;
	var preferredLabelLanguage = "preferredLabelLanguage=" + preferredLabelLanguage;
	return HttpMgr.GET(serviceName, service.createNarrowerConceptRequest,newConcept, schemeName,relatedConcept,rdfsLabel, rdfsLabelLanguage,preferredLabel,preferredLabelLanguage);
}

/**
 * create a new concept broader then relatedConcept
 * 
 * @member STRequests.Cls
 * @param newConcept
 * @param relatedConcept
 * @param rdfsLabel
 * @param rdfsLabelLanguage
 * @param preferredLabel
 * @param preferredLabelLanguage
 * @return
 */

function createBroaderConcept(newConcept, schemeName, relatedConcept,rdfsLabel, rdfsLabelLanguage,preferredLabel,preferredLabelLanguage) {
	var newConcept = "newConcept=" + newConcept;
	var relatedConcept = "relatedConcept=" + relatedConcept;
	var schemeName = "schemeName=" + schemeName;
	var rdfsLabel = "rdfsLabel=" + rdfsLabel;
	var rdfsLabelLanguage = "rdfsLabelLanguage=" + rdfsLabelLanguage;
	var preferredLabel = "preferredLabel=" + preferredLabel;
	var preferredLabelLanguage = "preferredLabelLanguage=" + preferredLabelLanguage;
	return HttpMgr.GET(serviceName, service.createBroaderConceptRequest,newConcept, schemeName,relatedConcept,rdfsLabel, rdfsLabelLanguage,preferredLabel,preferredLabelLanguage);
}

/**
 * adds a concept scheme to the ontology
 * 
 * @member STRequests.Cls
 * @param newScheme new scheme
 * @param rdfsLabel
 * @param rdfsLabelLanguage
 * @param preferredLabel
 * @param preferredLabelLanguage
 * @return
 */
function createScheme(schemeName,rdfsLabel, rdfsLabelLanguage,preferredLabel,preferredLabelLanguage) {
	Logger.debug('[SERVICE_SKOS.jsm] createScheme');
	var schemeName = "schemeName=" + schemeName;
	var rdfsLabel = "rdfsLabel=" + rdfsLabel;
	var rdfsLabelLanguage = "rdfsLabelLanguage=" + rdfsLabelLanguage;
	var preferredLabel = "preferredLabel=" + preferredLabel;
	var preferredLabelLanguage = "preferredLabelLanguage=" + preferredLabelLanguage;
	return HttpMgr.GET(serviceName, service.createSchemeRequest,schemeName, rdfsLabel, rdfsLabelLanguage,preferredLabel,preferredLabelLanguage);
}

/**
 * remove a concept
 * 
 * @member STRequests.SKOS
 * @param comcept concept to be remove
 * @return
 */
function removeConcept(concept) {
	Logger.debug('[SERVICE_SKOS.jsm] removeConcept');
	var concept = "concept=" + concept;
	return HttpMgr.GET(serviceName, service.removeConceptRequest,concept);
}

// SKOS SERVICE INITIALIZATION
service.getAllSchemesList = getAllSchemesList;
service.getConceptsTree = getConceptsTree;
service.getNarrowerConcepts = getNarrowerConcepts;
service.addConcept = addConcept;
service.addSemanticRelation = addSemanticRelation;
service.createNarrowerConcept = createNarrowerConcept;
service.createBroaderConcept = createBroaderConcept;
service.createScheme = createScheme;
service.removeConcept = removeConcept;
