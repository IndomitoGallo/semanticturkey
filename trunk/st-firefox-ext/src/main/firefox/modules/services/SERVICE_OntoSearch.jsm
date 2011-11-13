Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");

EXPORTED_SYMBOLS = ["STRequests"];

var service = STRequests.OntoSearch;
var serviceName = service.serviceName;


/**
 * returns the result of a search over ontology data of the proposed <code>inputString</code>
 * 
 * @member STRequests.OntoSearch
 * @param inputString
 * @param types can be either <em>property</em> or <em>clsNInd</em>
 * @return
 */
function searchOntology(inputString,types){
	var inputString = "inputString="+inputString;
	var types = "types="+types;
	return HttpMgr.GET(serviceName, service.searchOntologyRequest,inputString,types);
}
//OntoSearch SERVICE INITIALIZATION
service.searchOntology = searchOntology;