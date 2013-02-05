if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};

Components.utils.import("resource://stservices/SERVICE_Annotation.jsm",
		art_semanticturkey);
Components.utils.import("resource://stmodules/Deserializer.jsm");	
Components.utils.import("resource://stmodules/ARTResources.jsm");
Components.utils.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);

var stEventListeners = null;

art_semanticturkey.init = function() {
	try {
		if (typeof window.arguments[0] != "object" && typeof window.arguments[0].url != "string") {
			throw new Exception("Missing required parameter: url");
		}
		
		var topics = art_semanticturkey.STRequests.Annotation.getPageTopics(window.arguments[0].url);

		for (var i = 0 ; i < topics.length ; i++) {
			art_semanticturkey.showTopic(topics[i]);
		}
		
		stEventListeners = new art_semanticturkey.eventListenerArrayClass();
		stEventListeners.addEventListenerToArrayAndRegister("bookmarkRemoved", 
		                                                    art_semanticturkey.handleBookmarkRemoved);

	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.clean = function() {
	if (stEventListeners != null) {
		stEventListeners.deregisterAllListener();
	}
};

art_semanticturkey.showTopic = function(topic) {
	 var topicList = document.getElementById("topicList");
	 
	 var listItem = document.createElement("richlistitem");
	 listItem.setAttribute("st-topic-uri", topic.getURI());
	 var topicLabel = document.createElement("label");
	 topicLabel.setAttribute("flex", "1");
	 var removeButton = document.createElement("toolbarbutton");
	 removeButton.setAttribute("flex", "0");
	 removeButton.setAttribute("image", "moz-icon://stock/gtk-close?size=menu");
	 	removeButton.setAttribute("tooltiptext", "Remove this bookmark");
	 removeButton.addEventListener("click", art_semanticturkey.doRemoveTopic, false);
	 topicLabel.setAttribute("value", topic.getShow());
	 
	 listItem.appendChild(topicLabel);
	 listItem.appendChild(removeButton);
	 
	 topicList.appendChild(listItem);
};

art_semanticturkey.doRemoveTopic = function(event) {
	var listItem = event.target.parentNode;
	var topicURI = listItem.getAttribute("st-topic-uri");
	var list = listItem.parentNode;
	
	try {
		art_semanticturkey.STRequests.Annotation.removeBookmark(window.arguments[0].url, topicURI);
	} catch(e) {
		alert(e.name + ":" + e.message);
	}
};

art_semanticturkey.handleBookmarkRemoved = function(eventId, bookmarkRemovedObj) {
	 var topicList = document.getElementById("topicList").getElementsByTagName("richlistitem");
	 
	 for (var i = 0 ; i < topicList.length ; i++) {
	 	var t = topicList[i];
	 	
	 	if (t.getAttribute("st-topic-uri").trim() == bookmarkRemovedObj.getTopic().trim()) {
	 		document.getElementById("topicList").removeChild(t);
	 		break;
	 	}
	 }
};

window.addEventListener("load", art_semanticturkey.init, false);
window.addEventListener("unload", art_semanticturkey.clean, false);
