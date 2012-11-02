Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");
Components.utils.import("resource://stmodules/Deserializer.jsm");	
Components.utils.import("resource://stmodules/ARTResources.jsm");

EXPORTED_SYMBOLS = [ "HttpMgr", "STRequests" ];

var service = STRequests.Individual;
var serviceName = service.serviceName;

var pageService = STRequests.Page;
var pageServiceName = pageService.serviceName;

var deleteService = STRequests.Delete;
var deleteServiceName = deleteService.serviceName;

/**
 * gets the bookmarks associated to specified resource
 * 
 * @member STRequests.Page
 * @param individualName
 * @return
 */
function getBookmarks(individualName) {
	Logger.debug('[SERVICE_Individual.jsm] getBookmarks');
	var individualName = "instanceName=" + individualName;
	return HttpMgr.GET(pageServiceName, pageService.getBookmarksRequest, individualName);
};

/**
 * remove specified resource
 * 
 * @member STRequests.Delete
 * @return
 */
function removeInstance(name) {
	var myName = "name=" + name;
	var myType = "type=Instance";
	return Deserializer.getURI(HttpMgr.GET(deleteServiceName, deleteService.removeInstanceRequest, myName, myType));
};

/**
 * gets the full description of resource <code>instanceQName</code>
 * 
 * @member STRequests.Individual
 * @param instanceQName
 * @param method
 * @return
 */
function getIndividualDescription(instanceQName, method) {
	var instanceQName = "instanceQName=" + instanceQName;
	var method = "method=" + method;
	return HttpMgr.GET(serviceName, service.getIndividualDescriptionRequest, instanceQName, method);
};

/**
 * adds a type to resource identified by first argument of this method
 * 
 * @member STRequests.Individual
 * @param indqname
 * @param typeqname
 * @return
 */
function addType(indqname, typeqname) {
	var indqname = "indqname=" + indqname;
	var typeqname = "typeqname=" + typeqname;
	var reply = HttpMgr.GET(serviceName, service.addTypeRequest, indqname, typeqname);
	var resArray = new Array();
	resArray["type"] = Deserializer.getURI(reply.getElementsByTagName("Type")[0]);
	resArray["instance"] = Deserializer.getURI(reply.getElementsByTagName("Instance")[0]);
	return resArray;
};

/**
 * remove the rdf:type relation between resource specified as arguments of this method. Note that this does
 * not delete any other info about the two resources
 * 
 * @member STRequests.Individual
 * @param indqname
 * @param typeqname
 * @return
 */
function removeType(indqname, typeqname) {
	var indqname = "indqname=" + indqname;
	var typeqname = "typeqname=" + typeqname;
	var reply = HttpMgr.GET(serviceName, service.removeTypeRequest, indqname, typeqname);
	var resArray = new Array();
	resArray["type"] = Deserializer.getURI(reply.getElementsByTagName("Type")[0]);
	resArray["instance"] = Deserializer.getURI(reply.getElementsByTagName("Instance")[0]);
	return resArray;
};


/**
 * gets only the <em>named</em> classes which are <em>direct types</em> for resource <code>indqname</code>
 * 
 * @member STRequests.Individual
 * @param indqname
 * @return
 */
function get_directNamedTypes(indqname) {
	var indqname = "indqname=" + indqname;
	var reply = HttpMgr.GET(serviceName, service.get_directNamedTypesRequest, indqname);
	var resArray = new Array();
	resArray["types"] = Deserializer.getCollection(reply.getElementsByTagName("Types")[0]);
	resArray["instance"] = Deserializer.getURI(reply.getElementsByTagName("Instance")[0]);
	return resArray;
	//return Deserializer.getURI(HttpMgr.GET(serviceName, service.get_directNamedTypesRequest, indqname));
};

service.getIndividualDescription = getIndividualDescription;
service.addType = addType;
service.removeType = removeType;
service.get_directNamedTypes = get_directNamedTypes;

// Remove Individual SERVICE INITIALIZATION
deleteService.removeInstance = removeInstance;

// Page SERVICE INITIALIZATION
pageService.getBookmarks = getBookmarks;
