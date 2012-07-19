Components.utils.import("resource://stmodules/Logger.jsm");
Components.utils.import("resource://stmodules/ARTResources.jsm");


EXPORTED_SYMBOLS = ["Deserializer"];



var Deserializer = new Object();
	
function getCollection(response){
	var collectionElement = response.getElementsByTagName('collection')[0];
	var childElements = collectionElement.childNodes;
	var collectionArray = new Array(); 
	for (var i = 0; i < childElements.length; i++){
		if(childElements[i].nodeType == 1) {// == ELEMENT_NODE
			var tagName = childElements[i].tagName;
			if(tagName == 'uri'){
				var uriValue = childElements[i].textContent;
				var showValue = childElements[i].getAttribute('show');
				var explicitValue = childElements[i].getAttribute('explicit');
				var moreValue = childElements[i].getAttribute('more');
				var roleValue = childElements[i].getAttribute('role');
				var artURIRes = new ARTURIResource(showValue, roleValue, uriValue);
				artURIRes.explicit = explicitValue; 
				artURIRes.more = moreValue; 
				collectionArray.push(artURIRes);
			} else if(tagName == 'literal'){ // TODO check this name
			} // TODO add the other possible types
		}
	}
	return collectionArray;
};
	
function getURI(response){
	var uriElement = response.getElementsByTagName('uri')[0];
	var uriValue = uriElement.textContent;
	var showValue = uriElement.getAttribute('show');
	var explicitValue = uriElement.getAttribute('explicit');
	var moreValue = uriElement.getAttribute('more');
	var roleValue = uriElement.getAttribute('role');
	var artURIRes = new ARTURIResource(showValue, roleValue, uriValue);
	artURIRes.explicit = explicitValue; 
	artURIRes.more = moreValue; 
	return artURIRes;
}

//TODO old format, it should use the new standard
function getPropertyValue(response){
	var propertyElement = response.getElementsByTagName('property')[0];
	return propertyElement.getAttribute('value');
} 



Deserializer.getCollection = getCollection;
Deserializer.getURI = getURI;
Deserializer.getPropertyValue = getPropertyValue;