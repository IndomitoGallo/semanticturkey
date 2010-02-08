Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");

EXPORTED_SYMBOLS = [ "STRequests" ];

var service = STRequests.SPARQL;
var serviceName = service.serviceName;

/**
 * asks for a result to given query <code>queryPar</code>
 * 
 * @member STRequests.SPARQL
 * @param queryPar
 * @param languagePar
 *            (optional) if not specified, it is SPARQL, otherwise it must be the id of a query language
 *            supported by the OntManager implementation backending current ontology
 * @param inferPar
 * @return
 */
function resolveQuery(queryPar, languagePar, inferPar) {
	var queryPar = "query=" + queryPar;
	var languagePar = "lang=" + languagePar;
	var inferPar = "infer=" + inferPar;
	return HttpMgr.POST(serviceName, service.resolveQueryRequest, queryPar, languagePar, inferPar);
}

// SPARQL SERVICE INITIALIZATION
service.resolveQuery = resolveQuery;
