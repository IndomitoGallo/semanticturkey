Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");
Components.utils.import("resource://stmodules/Deserializer.jsm");	
Components.utils.import("resource://stmodules/ARTResources.jsm");

EXPORTED_SYMBOLS = [ "HttpMgr", "STRequests" ];

var service = STRequests.Cls;
var serviceName = service.serviceName;

var deleteService = STRequests.Delete;
var deleteServiceName = deleteService.serviceName;

var renameService = STRequests.ModifyName;
var renameServiceName = STRequests.ModifyName.serviceName;

var graphService = STRequests.Graph;
var graphServiceName = STRequests.Graph.serviceName;

/**
 * this method gets all information about a given class useful for setting it as the root of an ontology tree.<br/>
 * argument <code>instNum</code> may be <code>true</code> or <code>false</code>; if true, the number of
 * instances of that class is returned
 * 
 * @member STRequests.Cls
 * @param instNum
 * @param clsqnames
 * @return
 */
function getClassesInfoAsRootsForTree(instNum, clsqnames) {
	Logger.debug('[SERVICE_Cls.jsm] getClassTree');
	var instNum = "instNum=" + instNum; // instNum should be true or false
	var clsesqnames = "clsesqnames=" + clsqnames;
	for ( var i = 2; i < arguments.length; i++)
		clsesqnames += "|_|" + arguments[i];
	return Deserializer.getCollection(HttpMgr.GET(serviceName, service.getClassesInfoAsRootsForTreeRequest, clsesqnames, instNum));
}

/**
 * gets the tree of all classes in the ontology. Note that this method is no more used in Semantic Turkey,
 * since the tree is progressively built through the <code>getSubClasses</code> method, when the user
 * explicitly asks to explore subclasses in the class tree
 * 
 * @member STRequests.Cls
 * @return
 */
function getClassTree(clsName) {
	Logger.debug('[SERVICE_Cls.jsm] getClassTree');
	if (typeof clsName != "undefined") {
		var className = "clsName=" + clsName;
		return HttpMgr.GET(serviceName, service.getClassTreeRequest, className);
	} else {
		return HttpMgr.GET(serviceName, service.getClassTreeRequest);
	}
}

/**
 * returns info about subclasses of a given class identified by <code>clsName</code>.<br/>
 * 
 * @member STRequests.Cls
 * @param clsName
 * @param tree
 *            if this argument is <code>true</code>, then info about the presence of subclasses of each
 *            returned subclass is provided
 * @param instNum
 *            if this argument is <code>true</code>, then info about the number of instances of each
 *            returned subclass is provided
 * @return
 */
function getSubClasses(clsName, tree, instNum) {
	Logger.debug('[SERVICE_Cls.jsm] getSubClasses');
	var className = "clsName=" + clsName;
	var tree = "tree=" + tree;
	var instNum = "instNum=" + instNum;
	return Deserializer.getCollection(HttpMgr.GET(serviceName, service.getSubClassesRequest, className, tree, instNum));
}

/**
 * gets full description of a class
 * 
 * @member STRequests.Cls
 * @return
 */
function getClassDescription(clsName, method) {
	Logger.debug('[SERVICE_Cls.jsm] getClassTree');
	var className = "clsName=" + clsName;
	var method = "method=" + method;
	return HttpMgr.GET(serviceName, service.getClassDescriptionRequest, className, method);
}

/**
 * gets the list of instances of a given class, with additional info like if these are explicit instances or
 * are computed through inference, etc...
 * 
 * @member STRequests.Cls
 * @return
 */
function getClassAndInstancesInfo(clsName, hasSubClasses) {
	Logger.debug('[SERVICE_Cls.jsm] getClassAndInstancesInfo' + clsName);
	var clsName = "clsName=" + clsName;
	var resArray = new Array();
	
	if(typeof hasSubClasses != "undefined"){
		var hasSubClasses = "hasSubClasses="+hasSubClasses;
		var reply = HttpMgr.GET(serviceName, service.getClassAndInstancesInfoRequest, clsName,hasSubClasses)
	}
	var reply = HttpMgr.GET(serviceName, service.getClassAndInstancesInfoRequest, clsName);
	resArray["class"] = Deserializer.getURI(reply.getElementsByTagName("Class")[0]);
	resArray["instances"] = Deserializer.getCollection(reply.getElementsByTagName("Instances")[0]);
	return resArray;
}

/**
 * remove selected class from the current ontology
 * 
 * @member STRequests.Delete
 * @return
 */
function removeClass(name) {
	var myName = "name=" + name;
	var myType = "type=Class";
	return Deserializer.getURI(HttpMgr.GET(deleteServiceName, deleteService.removeClassRequest, myName, myType));
}

/**
 * rename selected resource
 * 
 * @member STRequests.ModifyName
 * @return
 */
function renameResource(newResourceName, oldResourceName) {
	var myNewName = "newName=" + newResourceName;
	var myOldName = "oldName=" + oldResourceName;
	return HttpMgr.GET(renameServiceName, renameService.renameRequest, myNewName, myOldName);
}

/**
 * as for <code>addSubClass</code>, but <code>superClassName</code> is set to <code>owl:Thing</code>
 * 
 * @member STRequests.Cls
 * @param newClassName
 * @return
 */
function addClass(newClassName) {
	//var superClassName = "superClassName=http://www.w3.org/2002/07/owl#Thing";
	//var superClassName = "superClassName=owl:Thing";
	//var newClassName = "newClassName=" + newClassName;
	//return HttpMgr.GET(serviceName, service.createClassRequest, superClassName, newClassName);
	return addSubClass(newClassName, "owl:Thing");
}

/**
 * adds a resource to the ontology, classified with type <code>clsName</code>
 * 
 * @member STRequests.Cls
 * @param clsName
 * @param instanceName
 * @return
 */
function addIndividual(clsName, instanceName) {
	var clsName = "clsName=" + clsName;
	var instanceName = "instanceName=" + instanceName;
	var reply = HttpMgr.GET(serviceName, service.createInstanceRequest, clsName, instanceName);
	var resArray = new Array();
	resArray["class"] = Deserializer.getURI(reply.getElementsByTagName("Class")[0]);
	resArray["instance"] = Deserializer.getURI(reply.getElementsByTagName("Instance")[0]);
	return resArray;
}

/**
 * adds a class to the ontology, with superclass <code>superClassName</code>. superClassName must identify
 * an existing class
 * 
 * @member STRequests.Cls
 * @param newClassName
 * @param superClassName
 * @return
 */
function addSubClass(newClassName, superClassName) {
	var superClassName = "superClassName=" + superClassName;
	var newClassName = "newClassName=" + newClassName;
	var reply =  HttpMgr.GET(serviceName, service.createClassRequest, superClassName, newClassName);
	var resArray = new Array();
	resArray["class"] = Deserializer.getURI(reply.getElementsByTagName("Class")[0]);
	resArray["superClass"] = Deserializer.getURI(reply.getElementsByTagName("SuperClass")[0]);
	return resArray;
}

/**
 * returns a graph view of the ontology. Used by the graph functionality of Semantic Turkey, this is not
 * currently active, though this API may occasionally work on current version
 * 
 * @member STRequests.Graph
 * @return
 */
function graph() {
	return HttpMgr.GET(graphServiceName, graphService.graphRequest);
}

/**
 * returns a partial graph view of the ontology centred on <code>className</code>. Used by the graph
 * functionality of Semantic Turkey, this is not currently active, though this API may occasionally work on
 * current version
 * 
 * @member STRequests.Graph
 * @return
 */
function partialGraph(className) {
	var className = "className=" + className;
	return HttpMgr.GET(graphServiceName, graphService.partialGraphRequest, className);
}

/**
 * adds type <code>typeqname</code> as the classyfing resource for resource <code>clsqname</code>
 * 
 * @member STRequests.Cls
 * @param clsqname
 * @param typeqname
 * @return
 */
function addType(clsqname, typeqname) {
	var clsqname = "clsqname=" + clsqname;
	var typeqname = "typeqname=" + typeqname;
	var reply = HttpMgr.GET(serviceName, service.addTypeRequest, clsqname, typeqname);
	var resArray = new Array();
	resArray["type"] = Deserializer.getURI(reply.getElementsByTagName("Type")[0]);
	resArray["instance"] = Deserializer.getURI(reply.getElementsByTagName("Instance")[0]);
	return resArray;
}

/**
 * removes type <code>typeqname</code> from class <code>clsqname</code>
 * 
 * @member STRequests.Cls
 * @param clsqname
 * @param typeqname
 * @return
 */
function removeType(clsqname, typeqname) {
	var clsqname = "clsqname=" + clsqname;
	var typeqname = "typeqname=" + typeqname;
	var reply = HttpMgr.GET(serviceName, service.removeTypeRequest, clsqname, typeqname);
	var resArray = new Array();
	resArray["type"] = Deserializer.getURI(reply.getElementsByTagName("Type")[0]);
	resArray["instance"] = Deserializer.getURI(reply.getElementsByTagName("Instance")[0]);
	return resArray;
}

/**
 * adds superclass <code>superclsqname</code> to class <code>clsqname</code>. Both class need to be
 * existing classes in the ontology
 * 
 * @member STRequests.Cls
 * @param clsqname
 * @param superclsqname
 * @return
 */
function addSuperCls(clsqname, superclsqname) {
	var clsqname = "clsqname=" + clsqname;
	var superclsqname = "superclsqname=" + superclsqname;
	var reply = HttpMgr.GET(serviceName, service.addSuperClsRequest, clsqname, superclsqname);
	var resArray = new Array();
	resArray["class"] = Deserializer.getURI(reply.getElementsByTagName("Class")[0]);
	resArray["superClass"] = Deserializer.getURI(reply.getElementsByTagName("SuperClass")[0]);
	return resArray;
}

/**
 * removes the superclass relationship between the two classes passed as arguments to this method. This does
 * not delete any of the two classes
 * 
 * @member STRequests.Cls
 * @param clsqname
 * @param superclsqname
 * @return
 */
function removeSuperCls(clsqname, superclsqname) {
	var clsqname = "clsqname=" + clsqname;
	var superclsqname = "superclsqname=" + superclsqname;
	var reply = HttpMgr.GET(serviceName, service.removeSuperClsRequest, clsqname, superclsqname);
	var resArray = new Array();
	resArray["class"] = Deserializer.getURI(reply.getElementsByTagName("Class")[0]);
	resArray["superClass"] = Deserializer.getURI(reply.getElementsByTagName("SuperClass")[0]);
	return resArray;
}

/**
 * returns the list of superclasses of class <code>clsName</code>
 * 
 * @member STRequests.Cls
 * @param clsName
 * @return
 */
function getSuperClasses(clsName) {
	var clsName = "clsName=" + clsName;
	return Deserializer.getCollection(HttpMgr.GET(serviceName, service.getSuperClassesRequest, clsName));
}

// Class SERVICE INITIALIZATION
service.getClassesInfoAsRootsForTree = getClassesInfoAsRootsForTree;
service.getClassTree = getClassTree;
service.addType = addType;
service.removeType = removeType;
service.addSuperCls = addSuperCls;
service.removeSuperCls = removeSuperCls;
service.getSuperClasses = getSuperClasses;
graphService.graph = graph;
graphService.partialGraph = partialGraph;
deleteService.removeClass = removeClass;
service.addClass = addClass;
service.addSubClass = addSubClass;
service.getClassDescription = getClassDescription;
renameService.renameResource = renameResource;
service.getSubClasses = getSubClasses;
// Instance SERVICE INITIALIZATION
service.getClassAndInstancesInfo = getClassAndInstancesInfo;
service.addIndividual = addIndividual;