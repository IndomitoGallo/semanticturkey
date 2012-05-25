Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");

EXPORTED_SYMBOLS = [ "HttpMgr", "STRequests" ];

var service = STRequests.Property;
var serviceName = service.serviceName;

var deleteService = STRequests.Delete;
var deleteServiceName = deleteService.serviceName;

/**
 * gets the tree of all properties in the ontology
 * 
 * @member STRequests.Property
 * @return
 */
function getPropertyTree(instanceQName, method) {
	Logger.debug('[SERVICE_Property.jsm] getPropertyTree');
	if (typeof instanceQName != "undefined") {
		var instanceQName = "instanceQName=" + instanceQName;
		var method = "method=" + method;
		return HttpMgr.GET(serviceName, service.getPropertiesTreeRequest, instanceQName, method);
	} else {
		return HttpMgr.GET(serviceName, service.getPropertiesTreeRequest);
	}
}

/**
 * gets the tree of all object properties in the ontology
 * 
 * @member STRequests.Property
 * @return
 */
function getObjPropertyTree() {
	Logger.debug('[SERVICE_Property.jsm] getObjPropertyTree');
	return HttpMgr.GET(serviceName, service.getObjPropertiesTreeRequest);
}

/**
 * gets the tree of all datatype properties in the ontology
 * 
 * @member STRequests.Property
 * @return
 */
function getDatatypePropertiesTree() {
	Logger.debug('[SERVICE_Property.jsm] getDatatypePropertiesTree');
	return HttpMgr.GET(serviceName, service.getDatatypePropertiesTreeRequest);
}

/**
 * gets the tree of all annotation properties in the ontology
 * 
 * @member STRequests.Property
 * @return
 */
function getAnnotationPropertiesTree() {
	Logger.debug('[SERVICE_Property.jsm] getAnnotationPropertiesTree');
	return HttpMgr.GET(serviceName, service.getAnnotationPropertiesTreeRequest);
}

/**
 * deletes triples describing property identified by <em>name</em>
 * 
 * @member STRequests.Delete
 * @param name
 * @return
 */
function removeProperty(name) {
	var myName = "name=" + name;
	var myType = "type=Property";
	return HttpMgr.GET(deleteServiceName, deleteService.removePropertyRequest, myName, myType);
}

/**
 * adds a property to the current ontology
 * 
 * @member STRequests.Property
 * @param propertyQName
 * @param propertyType
 * @return
 */
function addProperty(propertyQName, propertyType) {
	var myPropertyQName = "propertyQName=" + propertyQName;
	var myPropertyType = "propertyType=" + propertyType;
	return HttpMgr.GET(serviceName, service.addPropertyRequest, myPropertyQName, myPropertyType);
}

/**
 * adds a property to the current ontology, and defines the type and superProperty for it
 * 
 * @member STRequests.Property
 * @param propertyQName
 * @param propertyType
 *            must be the name of an existing class
 * @param superPropertyQName
 *            must be the name of an existing property
 * @return
 */
function addSubProperty(propertyQName, propertyType, superPropertyQName) {
	var myPropertyQName = "propertyQName=" + propertyQName;
	var myPropertyType = "propertyType=" + propertyType;
	var mySuperPropertyQName = "superPropertyQName=" + superPropertyQName;
	return HttpMgr.GET(serviceName, service.addPropertyRequest, myPropertyQName, myPropertyType,
			mySuperPropertyQName);
}

/**
 * gets a tree forest with roots provided by the classes in the range of property identified by
 * <em>propertyQName</em>
 * 
 * @member STRequests.Property
 * @param propertyQName
 * @return
 */
function getRangeClassesTree(propertyQName) {
	propertyQName = "propertyQName=" + propertyQName;
	return HttpMgr.GET(serviceName, service.getRangeClassesTreeRequest, propertyQName);
}

/**
 * retrieves the full description of property identified by <em>propertyQName</em>
 * 
 * @member STRequests.Property
 * @param propertyQName
 * @return
 */
function getPropertyDescription(propertyQName) {
	Logger.debug('[SERVICE_Property.jsm] getPropertyDescription');
	var propertyQName = "propertyQName=" + propertyQName;
	return HttpMgr.GET(serviceName, service.getPropertyDescriptionRequest, propertyQName);
}

/**
 * removes a given <em>value</em> associated to resource <em>instanceQName</em> through property
 * <em>propertyQName</em>
 * 
 * @member STRequests.Property
 * @param instanceQName
 * @param propertyQName
 * @param value
 * @param type
 *            (optional) if the property is a simple rdf:Property, this argument tells whether a literal
 *            should be passed as the value for the property, or a resource. <em>literal</em> should be
 *            passed via this argument to tell ST to add a literal value (only for pure rdf:property(es))
 * @param lang
 *            (optional) for annotation properties, tells the language of the entry which needs to be removed
 *            (it is necessary if the value to be removed had its language set up)
 * @return
 */
function removePropValue(instanceQName, propertyQName, value,rangeQName,type, lang) {
	Logger.debug('[SERVICE_Property.jsm] removePropValue');
	var instanceQName = "instanceQName=" + instanceQName;
	var propertyQName = "propertyQName=" + propertyQName;
	var value = "value=" + value;
	var rangeQName = "rangeQName=" + rangeQName;
	var type = "type=" + type;
	if (typeof lang != "undefined" && lang != "") {
		var lang = "lang=" + lang;
		
		return HttpMgr.GET(serviceName, service.removePropValueRequest, instanceQName, propertyQName, value,
				rangeQName,type, lang);
		
	} else {
		return HttpMgr.GET(serviceName, service.removePropValueRequest, instanceQName, propertyQName, value,
				rangeQName,type);
	}
}

/**
 * adds a given <em>value</em> to the description of a resource <em>instanceQName</em> through property
 * <em>propertyQName</em>
 * 
 * @member STRequests.Property
 * @param instanceQName
 * @param propertyQName
 * @param value
 * @param rangeClsQName
 *            (necessary only for resource values, otherwise set to null) tells the type for the newly created
 *            resource
 * @param type
 *            (optional) if the property is a simple rdf:Property, this argument tells whether a literal
 *            should be passed as the value for the property, or a resource. <em>literal</em> should be
 *            passed via this argument to tell ST to add a literal value (only for pure rdf:property(es))
 * @param lang
 *            (optional) for annotation properties, tells the language of the entry which needs to be set up
 * @return
 */
function createAndAddPropValue(instanceQName, propertyQName, value, rangeQName, type, lang) {
	Logger.debug('[SERVICE_Property.jsm] createAndAddPropValue');
	var instanceQName = "instanceQName=" + instanceQName;
	var propertyQName = "propertyQName=" + propertyQName;
	var value = "value=" + value;
	var rangeQName = "rangeQName=" + rangeQName;
	var type = "type=" + type;
	if (typeof lang != "undefined" && lang != "") {
		var lang = "lang=" + lang;
		return HttpMgr.GET(serviceName, service.createAndAddPropValueRequest, instanceQName, propertyQName,
				value, rangeQName, type, lang);
	} else {
		return HttpMgr.GET(serviceName, service.createAndAddPropValueRequest, instanceQName, propertyQName,
				value, rangeQName, type);
	}
}

/**
 * as for <code>createAndAddPropValue</code> but this does just relates the resource identified by
 * <em>createAndAddPropValue</em> to an existing resource
 * 
 * @member STRequests.Property
 * @param instanceQName
 * @param propertyQName
 * @param value
 * @return
 */
function addExistingPropValue(instanceQName, propertyQName, value,type) {
	Logger.debug('[SERVICE_Property.jsm] addExistingPropValueRequest');
	var instanceQName = "instanceQName=" + instanceQName;
	var propertyQName = "propertyQName=" + propertyQName;
	var value = "value=" + value;
	var type = "type=" + type;
	return HttpMgr.GET(serviceName, service.addExistingPropValueRequest, instanceQName, propertyQName, value,type);
}

/**
 * adds a super property relationship between two existing properties
 * 
 * @member STRequests.Property
 * @param propertyQName
 * @param superPropertyQName
 * @return
 */
function addSuperProperty(propertyQName, superPropertyQName) {
	var propertyQName = "propertyQName=" + propertyQName;
	var superPropertyQName = "superPropertyQName=" + superPropertyQName;
	return HttpMgr.GET(serviceName, service.addSuperPropertyRequest, propertyQName, superPropertyQName);
}

/**
 * removes the super property relationship between two existing properties (but does not delete the
 * properties)
 * 
 * @member STRequests.Property
 * @param propertyQName
 * @param superPropertyQName
 * @return
 */
function removeSuperProperty(propertyQName, superPropertyQName) {
	var propertyQName = "propertyQName=" + propertyQName;
	var superPropertyQName = "superPropertyQName=" + superPropertyQName;
	return HttpMgr.GET(serviceName, service.removeSuperPropertyRequest, propertyQName, superPropertyQName);
}

/**
 * get info about Domain of a property
 * 
 * @member STRequests.Property
 * @param propertyQName
 * @return
 */
function  getDomain(propertyQName){
	var propertyQName = "propertyQName=" + propertyQName;
	return HttpMgr.GET(serviceName, service.getDomainRequest, propertyQName);
}
/**
 * get info about Range of a property
 * 
 * @member STRequests.Property
 * @param propertyQName
 * @return
 */
function getRange(propertyQName,visualize) {
	var propertyQName = "propertyQName=" + propertyQName;
	var visualize = "visualize=" + visualize;
	return HttpMgr.GET(serviceName, service.getRangeRequest, propertyQName,visualize);
}

/**
 * parses a list of literals representing values in a dataRange
 * 
 * @member STRequests.Property
 * @param dataRange
 * @param nodeType
 * @return
 */
function  parseDataRange(dataRange,nodeType) {
	var dataRange = "dataRange=" + dataRange;
	var nodeType = "nodeType=" + nodeType;
	return HttpMgr.GET(serviceName, service.parseDataRangeRequest, dataRange,nodeType);
}

/**
 * specifies the domain for property <em>propertyQName</em> (actually, it just adds a class to the list of
 * classes the intersection of which represents the true property domain)
 * 
 * @member STRequests.Property
 * @param propertyQName
 * @param domainPropertyQName
 * @return
 */
function addPropertyDomain(propertyQName, domainPropertyQName) {
	var propertyQName = "propertyQName=" + propertyQName;
	var domainPropertyQName = "domainPropertyQName=" + domainPropertyQName;
	return HttpMgr.GET(serviceName, service.addPropertyDomainRequest, propertyQName, domainPropertyQName);
}

/**
 * removes property domain from property <em>propertyQName</em>
 * 
 * @member STRequests.Property
 * @param propertyQName
 * @param domainPropertyQName
 * @return
 */
function removePropertyDomain(propertyQName, domainPropertyQName) {
	var propertyQName = "propertyQName=" + propertyQName;
	var domainPropertyQName = "domainPropertyQName=" + domainPropertyQName;
	return HttpMgr.GET(serviceName, service.removePropertyDomainRequest, propertyQName, domainPropertyQName);
}

/**
 * specifies the range for property <em>propertyQName</em> (actually, it just adds a class to the list of
 * classes the intersection of which represents the true property range)
 * 
 * @member STRequests.Property
 * @param propertyQName
 * @param rangePropertyQName
 * @return
 */
function addPropertyRange(propertyQName, rangePropertyQName) {
	var propertyQName = "propertyQName=" + propertyQName;
	var rangePropertyQName = "rangePropertyQName=" + rangePropertyQName;
	return HttpMgr.GET(serviceName, service.addPropertyRangeRequest, propertyQName, rangePropertyQName);
}

/**
 * removes property range from property <em>propertyQName</em>
 * 
 * @member STRequests.Property
 * @param propertyQName
 * @param rangePropertyQName
 * @return
 */
function removePropertyRange(propertyQName, rangePropertyQName) {
	var propertyQName = "propertyQName=" + propertyQName;
	var rangePropertyQName = "rangePropertyQName=" + rangePropertyQName;
	return HttpMgr.GET(serviceName, service.removePropertyRangeRequest, propertyQName, rangePropertyQName);
}
// Property SERVICE INITIALIZATION
service.getPropertyTree = getPropertyTree;
service.getAnnotationPropertiesTree = getAnnotationPropertiesTree;
service.getDatatypePropertiesTree = getDatatypePropertiesTree;
service.getObjPropertyTree = getObjPropertyTree;
service.getPropertyDescription = getPropertyDescription;
deleteService.removeProperty = removeProperty;
service.addProperty = addProperty;
service.addSubProperty = addSubProperty;
service.getRangeClassesTree = getRangeClassesTree;
service.removePropValue = removePropValue;
service.createAndAddPropValue = createAndAddPropValue;
service.addExistingPropValue = addExistingPropValue;
service.addSuperProperty = addSuperProperty;
service.removeSuperProperty = removeSuperProperty;
service.addPropertyDomain = addPropertyDomain;
service.removePropertyDomain = removePropertyDomain;
service.addPropertyRange = addPropertyRange;
service.removePropertyRange = removePropertyRange;
service.getDomain = getDomain;
service.getRange = getRange;
service.parseDataRange=parseDataRange;