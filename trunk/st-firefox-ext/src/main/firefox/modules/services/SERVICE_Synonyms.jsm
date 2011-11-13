Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");

EXPORTED_SYMBOLS = [ "HttpMgr", "STRequests" ];

var service = STRequests.Synonyms;
var serviceName = service.serviceName;


/**
 * adds a value on the rdf:label property to resource identified by <em>resourceName</em>
 * 
 * @member STRequests.Synonyms
 * @param resourceName
 * @param language
 * @param synonym
 * @return
 */
function addSynonyms(resourceName,language,synonym) {
	Logger.debug('[SERVICE_Synonyms.jsm] addSynonym');
		var resourceName ="name="+resourceName;
		var synonym ="synonym="+synonym;
		var language ="language="+language;
		HttpMgr.GET(serviceName, service.addSynonymsRequest,resourceName,synonym,language);
	}


//Synonym SERVICE INITIALIZATION
service.addSynonyms = addSynonyms;
