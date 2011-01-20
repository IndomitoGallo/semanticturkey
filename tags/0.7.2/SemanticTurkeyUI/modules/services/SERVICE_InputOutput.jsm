Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");

EXPORTED_SYMBOLS = [ "HttpMgr", "STRequests" ];

var service = STRequests.InputOutput;
var serviceName = service.serviceName;


/**
 * saves an RDF file with the content of current ontology.<br/>
 * The chosen extension for the file determines the format for the output
 * 
 * @member STRequests.InputOutput
 * @param file
 * @return
 */
function saveRepository(file){
	var file = "file="+file;
	return HttpMgr.GET(serviceName, service.saveRepositoryRequest, file);
}

/**
 * loads data from an RDF file. The extension of the file determines the format for reading data
 * 
 * @member STRequests.InputOutput
 * @param file
 * @param baseUri
 * @return
 */
function loadRepository(file, baseUri){
	var file = "file="+file;
	var baseUri = "baseUri="+baseUri;
	return HttpMgr.GET(serviceName, service.loadRepositoryRequest, file, baseUri);
}

/**
 * clears all data in current ontology. It leaves only baseuri and namespace unchanged
 * 
 * @member STRequests.InputOutput
 * @return
 */
function clearRepository(){
	return HttpMgr.GET(serviceName, service.clearRepositoryRequest);
}


//InputOutput SERVICE INITIALIZATION
service.saveRepository = saveRepository;
service.loadRepository = loadRepository;
service.clearRepository = clearRepository;


