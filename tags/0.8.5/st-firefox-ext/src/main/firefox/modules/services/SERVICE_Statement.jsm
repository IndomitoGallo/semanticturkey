Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");

EXPORTED_SYMBOLS = ["STRequests"];

var service = STRequests.Statement;
var serviceName = service.serviceName;

/**
 * basic service for retrieving statements from the RDF graph of current ontology
 * 
 * @member STRequests.Statement
 * @param subj
 * @param pred
 * @param obj
 * @param inference
 * @param ngs
 * 
 * @return
 */
function getStatements(subj, pred, obj, inference, ngs){
	var subj = "subj=" + subj;
	var pred = "pred=" +pred;
	var obj = "obj=" + obj;
	
	if(typeof inference != 'undefined'){
		var inference = "inference" + inference;
		if(typeof ngs != 'undefined'){
			var ngs = "ngs=" + ngs;
			return HttpMgr.GET(serviceName, service.getStatementsRequest, subj, pred, obj, inference, ngs);
		}
		return HttpMgr.GET(serviceName, service.getStatementsRequest, subj, pred, obj, inference);
	}
	return HttpMgr.GET(serviceName, service.getStatementsRequest, subj, pred, obj);
}

/**
 * checks if a statement is present in the graph of the current ontology
 * 
 * @member STRequests.Statement
 * @param subj
 * @param pred
 * @param obj
 * @param inference
 * @param ngs
 * 
 * @return
 */
function hasStatements(subj, pred, obj, inference, ngs){
	var subj = "subj=" + subj;
	var pred = "pred=" +pred;
	var obj = "obj=" + obj;
	
	if(typeof inference != 'undefined'){
		var inference = "inference" + inference;
		if(typeof ngs != 'undefined'){
			var ngs = "ngs=" + ngs;
			return HttpMgr.GET(serviceName, service.hasStatementRequest, subj, pred, obj, inference, ngs);
		}
		return HttpMgr.GET(serviceName, service.hasStatementRequest, subj, pred, obj, inference);
	}
	return HttpMgr.GET(serviceName, service.hasStatementRequest, subj, pred, obj);
}
//SPARQL SERVICE INITIALIZATION
service.getStatements = getStatements;
service.hasStatement = hasStatement;
