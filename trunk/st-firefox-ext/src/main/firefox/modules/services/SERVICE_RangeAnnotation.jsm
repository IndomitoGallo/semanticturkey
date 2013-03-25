Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");
Components.utils.import("resource://stmodules/Deserializer.jsm");	
Components.utils.import("resource://stmodules/stEvtMgr.jsm");

EXPORTED_SYMBOLS = [ "HttpMgr", "STRequests" ];

var service = STRequests.RangeAnnotation;
var serviceName = service.serviceName;

/**
 * given page <code>urlPage</code>, this method tells if the page contains annotations
 * 
 * @member STRequests.RangeAnnotation
 * @param urlPage
 * @return
 */
function chkAnnotation(urlPage) {
	var urlPage="urlPage="+urlPage;
	return HttpMgr.GET(serviceName, service.chkAnnotationsRequest,urlPage);
}

/**
 * given page <code>urlPage</code>, it returns all annotations previously taken on that page
 * 
 * @member STRequests.Annotation
 * @param urlPage
 * @return
 */
function getPageAnnotations(urlPage) {
	var urlPage="urlPage="+urlPage;
	var reponseXML = HttpMgr.GET(serviceName, service.getPageAnnotationsRequest,urlPage);
	var annotations = [];
	var annotationsXML = reponseXML.getElementsByTagName("RangeAnnotation");
	
	for (var i = 0 ; i < annotationsXML.length ; i++) {
		var annXML = annotationsXML[i];
		
		annotations.push(
			{
				id : annXML.getAttribute("id"),
				resource : annXML.getAttribute("resource"),
				value : annXML.getAttribute("value"),
				range : annXML.getAttribute("range")
			}
		);
	}
	
	return annotations;
}

/**
 * 
 * @member STRequests.RangeAnnotation
 * @param resource
 * @param lexicalization
 * @param urlPage
 * @param title
 * @param range
 * @return
 */
function addAnnotation(resource, lexicalization, urlPage, title, range) {
	var resource_p = "resource=" + resource;
	var lexicalization_p = "lexicalization=" + lexicalization;
	var urlPage_p = "urlPage=" + urlPage;
	var title_p = "title=" + title;
	var range_p = "range=" + range;
	
	var responseXML = HttpMgr.GET(serviceName, service.addAnnotationRequest,resource_p, lexicalization_p,
	   urlPage_p, title_p, range_p);

	return responseXML;
}
/**
 * 
 * @member STRequests.RangeAnnotation
 * @param id
 * @return
 */
function deleteAnnotation(id) {
	var id_p = "id=" + id;

	var responseXML = HttpMgr.GET(serviceName, service.deleteAnnotationRequest, id_p);
	
	if (!responseXML.isFail()) {
		var annotation;
		
		evtMgr.fireEvent("rangeAnnotationDeleted", {
			getId : function(){return id;}
		});
	}

	return responseXML;
}

// Range Annotation SERVICE INITIALIZATION
service.chkAnnotation = chkAnnotation;
service.getPageAnnotations = getPageAnnotations;
service.addAnnotation = addAnnotation;
service.deleteAnnotation = deleteAnnotation;
