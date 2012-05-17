Components.utils.import("resource://stmodules/SemTurkeyHTTP.jsm");

EXPORTED_SYMBOLS = [ "HttpMgr", "STRequests"];

/**
 * @class
 */
STRequests = new Object();

/**
 * @class
 */
STRequests.Administration = new Object();
/**
 * @class
 */
STRequests.Annotate = new Object();
/**
 * @class
 */
STRequests.Annotation = new Object();    
/**
 * @class
 */
STRequests.Cls = new Object();           
/**
 * @class
 */
STRequests.Delete = new Object();        
/**
 * @class
 */
STRequests.Graph = new Object();         
/**
 * @class
 */
STRequests.Individual = new Object();    
/**
 * @class
 */
STRequests.InputOutput = new Object();   
/**
 * @class
 */
STRequests.Metadata = new Object();      
/**
 * @class
 */
STRequests.ModifyName = new Object();    
/**
 * @class
 */
STRequests.OntoSearch = new Object();
/**
 * @class
 */
STRequests.Page = new Object();          
/**
 * @class
 */
STRequests.Property = new Object();      
/**
 * @class
 */
STRequests.SPARQL = new Object();
/**
 * @class
 */
STRequests.SKOS = new Object();
/**
 * @class
 */
STRequests.Statement = new Object();
/**
 * @class
 */
STRequests.Synonyms = new Object();      
/**
 * @class
 */
STRequests.SystemStart = new Object();   
/**
 * @class
 */
STRequests.Projects = new Object();
/**
 * @class
 */
STRequests.OntManager = new Object();


//systemStart service requests
STRequests.SystemStart.serviceName = "systemStart";
STRequests.SystemStart.startRequest = "start";
STRequests.SystemStart.listTripleStoresRequest = "listTripleStores";

//cls service requests
STRequests.Cls.serviceName = "cls";
STRequests.Cls.addTypeRequest = "addType";
STRequests.Cls.removeTypeRequest = "removeType";
STRequests.Cls.removeTypeRequest = "removeType";
STRequests.Cls.addSuperClsRequest = "addSuperCls";
STRequests.Cls.removeSuperClsRequest = "removeSuperCls";
STRequests.Cls.getClassTreeRequest = "getClassTree";
STRequests.Cls.getClassDescriptionRequest = "getClsDescription";
STRequests.Cls.getClassAndInstancesInfoRequest = "getClassAndInstancesInfo";
STRequests.Cls.createInstanceRequest = "createInstance";
STRequests.Cls.createClassRequest = "createClass";
STRequests.Cls.getSubClassesRequest = "getSubClasses";
STRequests.Cls.getSuperClassesRequest = "getSuperClasses";
STRequests.Cls.getClassesInfoAsRootsForTreeRequest = "getClassesInfoAsRootsForTree";

//ModifyName service Request
STRequests.ModifyName.serviceName = "modifyName";
STRequests.ModifyName.renameRequest = "rename";

//property service requests
STRequests.Property.serviceName = "property";
STRequests.Property.getPropertiesTreeRequest = "getPropertiesTree";
STRequests.Property.getObjPropertiesTreeRequest = "getObjPropertiesTree";
STRequests.Property.getDatatypePropertiesTreeRequest = "getDatatypePropertiesTree";
STRequests.Property.getAnnotationPropertiesTreeRequest = "getAnnotationPropertiesTree";
STRequests.Property.removePropertyRequest = "removeProperty";
STRequests.Property.addPropertyRequest = "addProperty";
STRequests.Property.getRangeClassesTreeRequest = "getRangeClassesTree";
STRequests.Property.getPropertyDescriptionRequest = "getPropDescription";
STRequests.Property.removePropValueRequest = "removePropValue";
STRequests.Property.addExistingPropValueRequest = "addExistingPropValue";
STRequests.Property.createAndAddPropValueRequest = "createAndAddPropValue";
STRequests.Property.addSuperPropertyRequest = "addSuperProperty";
STRequests.Property.removeSuperPropertyRequest = "removeSuperProperty";
STRequests.Property.addPropertyDomainRequest = "addPropertyDomain";
STRequests.Property.removePropertyDomainRequest = "removePropertyDomain";
STRequests.Property.addPropertyRangeRequest = "addPropertyRange";
STRequests.Property.removePropertyRangeRequest = "removePropertyRange";
STRequests.Property.getDomainRequest = "getDomain";
STRequests.Property.getRangeRequest = "getRange";
STRequests.Property.parseDataRangeRequest = "parseDataRange";

//delete service requests
STRequests.Delete.serviceName = "delete";
STRequests.Delete.removePropertyRequest = "removeProperty";
STRequests.Delete.removeClassRequest = "removeClass";
STRequests.Delete.removeInstanceRequest = "removeInstance";

//synonym service request
STRequests.Synonyms.serviceName = "synonyms";
STRequests.Synonyms.addSynonymsRequest ="addSynonym";
STRequests.Synonyms.getSynonymsRequest ="getSynonym";

//graph service request
STRequests.Graph.serviceName = "graph";
STRequests.Graph.graphRequest = "graph";
STRequests.Graph.partialGraphRequest = "partialGraph";

//page service request
STRequests.Page.serviceName = "page";
STRequests.Page.getBookmarksRequest ="getBookmarks";

//annotation service request
STRequests.Annotation.serviceName = "annotation";
STRequests.Annotation.chkAnnotationsRequest = "chkAnnotations";
STRequests.Annotation.getPageAnnotationsRequest = "getPageAnnotations";
STRequests.Annotation.createAndAnnotateRequest = "createAndAnnotate";
STRequests.Annotation.createFurtherAnnotationRequest = "addAnnotation";
STRequests.Annotation.relateAndAnnotateRequest = "relateAndAnnotate";
STRequests.Annotation.addAnnotationRequest = "addAnnotation";

// individual service request
STRequests.Individual.serviceName = "individual";
STRequests.Individual.getIndividualDescriptionRequest = "getIndDescription";
STRequests.Individual.addTypeRequest = "addType";
STRequests.Individual.removeTypeRequest = "removeType";
STRequests.Individual.get_directNamedTypesRequest = "getDirectNamedTypes";

//metadata service request
STRequests.Metadata.serviceName = "metadata";
STRequests.Metadata.getOntologyDescriptionRequest = "getOntologyDescription";
STRequests.Metadata.getBaseuriRequest = "getBaseuri";
STRequests.Metadata.getDefaultNamespaceRequest = "getDefaultNamespace";
STRequests.Metadata.getImportsRequest = "getImports";
STRequests.Metadata.getNSPrefixMappingsRequest = "getNSPrefixMappings";
STRequests.Metadata.setBaseuriDefNamespaceRequest = "setBaseuriDefNamespace";
STRequests.Metadata.setDefaultNamespaceRequest = "setDefaultNamespace";
STRequests.Metadata.setBaseuriRequest = "setBaseuri";
STRequests.Metadata.setNSPrefixMappingRequest = "setNSPrefixMapping";
STRequests.Metadata.removeNSPrefixMappingRequest = "removeNSPrefixMapping";
STRequests.Metadata.changeNSPrefixMappingRequest = "changeNSPrefixMapping";
STRequests.Metadata.removeImportRequest = "removeImport";
STRequests.Metadata.addFromWebRequest = "addFromWeb";
STRequests.Metadata.addFromWebToMirrorRequest = "addFromWebToMirror";
STRequests.Metadata.addFromLocalFileRequest = "addFromLocalFile";
STRequests.Metadata.addFromOntologyMirrorRequest = "addFromOntologyMirror";
STRequests.Metadata.downloadFromWebToMirrorRequest = "downloadFromWebToMirror";
STRequests.Metadata.downloadFromWebRequest = "downloadFromWeb";
STRequests.Metadata.getFromLocalFileRequest = "getFromLocalFile";
STRequests.Metadata.mirrorOntologyRequest = "mirrorOntology";
STRequests.Metadata.getNamedGraphsRequest = "getNamedGraphs";
//modifyName service request
STRequests.ModifyName.serviceName = "modifyName";
STRequests.ModifyName.renameRequest = "rename";

//administartion service request
STRequests.Administration.serviceName = "administration";
STRequests.Administration.getOntologyMirrorRequest = "getOntologyMirror";
STRequests.Administration.setAdminLevelRequest = "setAdminLevel";
STRequests.Administration.deleteOntMirrorEntryRequest = "deleteOntMirrorEntry";
STRequests.Administration.updateOntMirrorEntryRequest = "updateOntMirrorEntry";

// inputoutput service request
STRequests.InputOutput.serviceName = "inputOutput";
STRequests.InputOutput.saveRepositoryRequest = "saveRDF";
STRequests.InputOutput.loadRepositoryRequest = "loadRDF";
STRequests.InputOutput.clearRepositoryRequest = "clearData";

// SPARQL service request
STRequests.SPARQL.serviceName = "sparql";
STRequests.SPARQL.resolveQueryRequest = "resolveQuery";

// SKOS service request
STRequests.SKOS.serviceName = "skos";
STRequests.SKOS.getTopConceptsRequest = "getTopConcepts";
STRequests.SKOS.getNarrowerConceptsRequest = "getNarrowerConcepts";
STRequests.SKOS.getAllSchemesListRequest = "getAllSchemesList";
STRequests.SKOS.getConceptDescriptionRequest = "getConceptDescription";
STRequests.SKOS.getConceptSchemeDescriptionRequest = "getConceptSchemeDescription";

// ADD REQUESTS
STRequests.SKOS.addBroaderConceptRequest = "addBroaderConcept";
STRequests.SKOS.addTopConceptRequest = "addTopConcept";

// CREATE REQUESTS
STRequests.SKOS.createConceptRequest = "createConcept";
STRequests.SKOS.createSchemeRequest = "createScheme";

// DELETE REQUESTS
STRequests.SKOS.deleteConceptRequest = "deleteConcept";
STRequests.SKOS.deleteSchemeRequest = "deleteScheme";

// REMOVE REQUESTS
STRequests.SKOS.removeBroaderConceptRequest = "removeBroaderConcept";
STRequests.SKOS.removeTopConceptRequest = "removeTopConcept";

//projects service request
STRequests.Projects.serviceName = "projects";
STRequests.Projects.openProjectRequest = "openProject";
STRequests.Projects.repairProjectRequest = "repairProject";
STRequests.Projects.newProjectRequest = "newProject";
STRequests.Projects.newProjectFromFileRequest = "newProjectFromFile";
STRequests.Projects.closeProjectRequest = "closeProject";
STRequests.Projects.deleteProjectRequest = "deleteProject";
STRequests.Projects.exportProjectRequest = "exportProject";
STRequests.Projects.importProjectRequest = "importProject";
STRequests.Projects.cloneProjectRequest = "cloneProject";
STRequests.Projects.saveProjectAsRequest = "saveProjectAs";
STRequests.Projects.saveProjectRequest = "saveProject";
STRequests.Projects.listProjectsRequest = "listProjects";
STRequests.Projects.getCurrentProjectRequest = "getCurrentProject";
STRequests.Projects.getProjectPropertyRequest = "getProjectProperty";
STRequests.Projects.setProjectPropertyRequest = "setProjectProperty";

//ontManager service request
STRequests.OntManager.serviceName = "ontManager";
STRequests.OntManager.getOntManagerParametersRequest = "getOntManagerParameters";

//OntoSearch service request
STRequests.OntoSearch.serviceName = "ontologySearch";
STRequests.OntoSearch.searchOntologyRequest = "searchOntology";

//Statement service request
STRequests.Statement.serviceName = "statement";
STRequests.Statement.getStatementsRequest = "getStatements";
STRequests.Statement.hasStatementRequest = "hasStatement";