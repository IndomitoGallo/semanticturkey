Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");

EXPORTED_SYMBOLS = ["STRequests"];

var service = STRequests.OntManager;
var serviceName = service.serviceName;


/**
 * returns all the parameters (and theirs value) associated to all the configurations
 * of the triplo store <code>ontMgrID</code>
 * 
 * @member STRequests.OntManager
 * @param ontMgrID
 * @return
 */
function getOntManagerParameters(ontMgrID){
	var ontMgrID = "ontMgrID="+ontMgrID;
	return HttpMgr.GET(serviceName, service.getOntManagerParametersRequest,ontMgrID);
}
//OntManager SERVICE INITIALIZATION
service.getOntManagerParameters = getOntManagerParameters;