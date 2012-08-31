Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");
Components.utils.import("resource://stmodules/Deserializer.jsm");	
Components.utils.import("resource://stmodules/stEvtMgr.jsm");

EXPORTED_SYMBOLS = [ "HttpMgr", "STRequests" ];

var service = STRequests.Annotation;
var serviceName = service.serviceName;

/**
 * create and annotate an istance with drag n drop
 * 
 * @member STRequests.Annotation
 * @return
 */
function createAndAnnotate(clsQName, instanceQName, urlPage, title) {
	Logger.debug('[SERVICE_Annotation.jsm] createAndAnnotate');
	var clsQName = "clsQName=" + clsQName;
	var instanceQName = "instanceQName=" + instanceQName;
	var urlPage = "urlPage=" + urlPage;
	var title = "title=" + title;
	return HttpMgr.GET(serviceName, service.createAndAnnotateRequest, clsQName, instanceQName, urlPage, title);
}


/**
 * given qname <code>instanceQName</code> of an existing instance, it adds an annotation according to the
 * other arguments of the method
 * 
 * @member STRequests.Annotation
 * @param instanceQName
 * @param text
 * @param urlPage
 * @param title
 * @return
 */
function createFurtherAnnotation(instanceQName,text,urlPage,title) {
	Logger.debug('[SERVICE_Annotation.jsm] createFurtherAnnotationRequest');
	var instanceQName = "instanceQName=" + instanceQName;
	var text = "text=" + text;
	var urlPage = "urlPage=" + urlPage;
	var title = "title=" + title;
	return HttpMgr.GET(serviceName, service.createFurtherAnnotationRequest, instanceQName, text, urlPage, title);
}



/**
 * as for <code>relateAndAnnotate</code> with some of its arguments set for binding annotated value to an
 * existing resource
 * 
 * @member STRequests.Annotation
 * @param instanceQName
 * @param propertyQName
 * @param objectQName
 * @param urlPage
 * @param title
 * @param lexicalization
 * @return
 */
function relateAndAnnotateBindAnnot(instanceQName,propertyQName,objectQName,urlPage,title,lexicalization) {
	return relateAndAnnotate(instanceQName,propertyQName,objectQName,urlPage,title,null,null,null,lexicalization); 
}

/**
 * as for <code>relateAndAnnotate</code> with some of its arguments set for creating an element
 * (resource/literal) from the annotated text
 * 
 * @member STRequests.Annotation
 * @param instanceQName
 * @param propertyQName
 * @param objectQName
 * @param objectClsName
 * @param urlPage
 * @param title
 * @param lang
 * @param type
 * @return
 */
function relateAndAnnotateBindCreate(instanceQName,propertyQName,objectQName,urlPage,title,objectClsName,lang,type) {
	return relateAndAnnotate(instanceQName,propertyQName,objectQName,urlPage,title,objectClsName,lang,type); 
}


/**
 * this method is used to get information from web pages and use it to:
 * <ul>
 * <li>relate existing objects in the ontology with new objects got from the web </li>
 * <li>take the annotation related to the new object</li>
 * </ul>
 * 
 * @member STRequests.Annotation
 * @param instanceQName
 *            the qname of the selected object which is related to the annotated one
 * @param propertyQName
 *            the property which is used to qualify the selected object with new annotated information
 * @param objectQName
 *            the annotated object (this may be an ontology object, or a literal)
 * @param objectClsName
 *            if objectQName is a resource which is to be created, then this is the class associated that
 *            resource
 * @param urlPage
 *            the url of the web page from which the annotation has been taken
 * @param title
 *            the title of the web page from which the annotation has been taken
 * @param lang
 *            the iso code for th language of the annotated text
 * @param type
 *            used to qualify the nature of the annotated object; this argument is mandatory only if the
 *            property specified by <code>propertyQName</code>is a standard property, otherwise the nature
 *            of the object is desumed from the nature of the property (resource for object properties and
 *            literal in other cases).<br/> In case of a standard property, "literal" must be specified,
 *            otherwise a resource is added to the property
 * 
 * @param lexicalization
 * @return
 */
function relateAndAnnotate(instanceQName,propertyQName,objectQName,urlPage,title,objectClsName,lang,type,lexicalization) {
	var instanceQName = "instanceQName=" + instanceQName;
	var propertyQName = "propertyQName=" + propertyQName;
	var objectQName = "objectQName=" + objectQName;
	var urlPage = "urlPage=" + urlPage;
	var title = "title=" + title;
	if(typeof lexicalization != 'undefined'){
		var op = "op=bindAnnot";
		var lex = "lexicalization=" + lexicalization;
		return HttpMgr.GET(serviceName, service.relateAndAnnotateRequest, 
	    		instanceQName,
	    		propertyQName,
	    		objectQName,
	    		lex,
	    		urlPage, 
	    		title,
	    		op);
	}else{
		var op = "op=bindCreate";
		if(lang != ""){
			var lang = "lang=" + lang;
			if(typeof type != 'undefined'){
				var type = "type=" +type;
				if(typeof objectClsName != 'undefined'){
					var objectClsName = "objectClsName=" + objectClsName;
					return HttpMgr.GET(serviceName, service.relateAndAnnotateRequest, 
		    			instanceQName,
		    			propertyQName,
		    			objectQName,
		    			objectClsName, 
		    			urlPage, 
		    			title,
		    			lang,
		    			type,
		    			op);
		    	}else{
		    		return HttpMgr.GET(serviceName, service.relateAndAnnotateRequest, 
		    			instanceQName,
		    			propertyQName,
		    			objectQName,
		    			urlPage, 
		    			title,
		    			lang,
		    			type,
		    			op);
		    	}
	    	} else{
		    	if(typeof objectClsName != 'undefined'){
					var objectClsName = "objectClsName=" + objectClsName;
					return HttpMgr.GET(serviceName, service.relateAndAnnotateRequest, 
		    			instanceQName,
		    			propertyQName,
		    			objectQName,
		    			objectClsName, 
		    			urlPage, 
		    			title,
		    			lang,
		    			op);
		    	}else{
		    		return HttpMgr.GET(serviceName, service.relateAndAnnotateRequest, 
		    			instanceQName,
		    			propertyQName,
		    			objectQName,
		    			urlPage, 
		    			title,
		    			lang,
		    			op);
		    	}
		    }
		}else{
			if(typeof type != 'undefined'){
				var type = "type=" +type;
				if(typeof objectClsName != 'undefined'){
					var objectClsName = "objectClsName=" + objectClsName;
					return HttpMgr.GET(serviceName, service.relateAndAnnotateRequest, 
		    			instanceQName,
		    			propertyQName,
		    			objectQName,
		    			objectClsName, 
		    			urlPage, 
		    			title,
		    			type,
		    			op);
		    	}else{
		    		return HttpMgr.GET(serviceName, service.relateAndAnnotateRequest, 
		    			instanceQName,
		    			propertyQName,
		    			objectQName,
		    			urlPage, 
		    			title,
		    			type,
		    			op);
		    	}
    		} else{
	    		if(typeof objectClsName != 'undefined'){
					var objectClsName = "objectClsName=" + objectClsName;
					return HttpMgr.GET(serviceName, service.relateAndAnnotateRequest, 
	    				instanceQName,
	    				propertyQName,
	    				objectQName,
	    				objectClsName, 
	    				urlPage, 
	    				title,
	    				op);
		    	}else{
		    		return HttpMgr.GET(serviceName, service.relateAndAnnotateRequest, 
		    			instanceQName,
		    			propertyQName,
		    			objectQName,
		    			urlPage, 
		    			title,
		    			op);
		    	}
		    	}
		}
	}
   }

/**
 * given page <code>urlPage</code>, this method tells if the page contains annotations
 * 
 * @member STRequests.Annotation
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
	return HttpMgr.GET(serviceName, service.getPageAnnotationsRequest,urlPage);
}

/**
 * @member STRequests.Annotation
 * @param urlPage
 * @param instanceQName
 * @param text
 * @param title
 * @return
 */
function addAnnotation(urlPage,instanceQName,text,title){
	var urlPage="urlPage="+urlPage;
	var instanceQName="instanceQName="+instanceQName;
	var text="text="+text;
	var title="title="+title;
	return HttpMgr.GET(serviceName, service.addAnnotationRequest,urlPage,instanceQName,text,title);
}

/**
 * @member STRequests.Annotation
 * @param urlPage
 * @param title
 * @param topics
 * @return
 */
function bookmarkPage(urlPage, title, topics){
	var urlPage_p="urlPage="+urlPage;
	var title_p="title="+title;
	var topics_p = "topics=";
	
	for (var i = 0 ; i < topics.length ; i++) {
		topics_p += topics[i];
	}
	
	return Deserializer.getCollection(HttpMgr.GET(serviceName, service.bookmarkPageRequest,urlPage_p,title_p,topics_p));
}

function getPageTopics(urlPage) {
	var urlPage_p = "urlPage=" + urlPage;
	
	return Deserializer.getCollection(HttpMgr.GET(serviceName, service.getPageTopicsRequest,urlPage_p));
}

function getBookmarksByTopic(topic) {
	var topic_p = "topic=" + topic;
	return HttpMgr.GET(serviceName, service.getBookmarksByTopicRequest,topic_p);
}

function removeBookmark(urlPage, topic) {
	var urlPage_p = "urlPage=" + urlPage;
	var topic_p = "topic=" + topic;
	
	
	var reply = HttpMgr.GET(serviceName, service.removeBookmarkRequest, urlPage_p, topic_p);

	if (!reply.isFail()) {
		evtMgr.fireEvent("bookmarkRemoved", {
			getPageURL : function() {return urlPage;},
			getTopic : function() {return topic;}
			});
	}
	
	return reply;
}

// Annotation SERVICE INITIALIZATION
service.chkAnnotation = chkAnnotation;
service.getPageAnnotations = getPageAnnotations;
service.createAndAnnotate = createAndAnnotate;
service.relateAndAnnotateBindAnnot = relateAndAnnotateBindAnnot;
service.relateAndAnnotateBindCreate = relateAndAnnotateBindCreate;
service.createFurtherAnnotation = createFurtherAnnotation;
service.addAnnotation=addAnnotation;
service.bookmarkPage=bookmarkPage;
service.getPageTopics=getPageTopics;
service.getBookmarksByTopic=getBookmarksByTopic;
service.removeBookmark=removeBookmark;
