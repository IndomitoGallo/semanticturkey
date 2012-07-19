if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};
if (!art_semanticturkey.deserializer) 
	art_semanticturkey.deserializer = {};	

	
art_semanticturkey.deserializer.getCollection = function(response){
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
				var artURIRes = new art_semanticturkey.ARTURIResource(showValue, roleValue, uriValue);
				artURIRes.explicit = explicitValue; 
				artURIRes.more = moreValue; 
				collectionArray.push(artURIRes);
			} else if(tagName == 'literal'){ // TODO check this name
			} // TODO add the other possible types
		}
	}
	return collectionArray;
}


art_semanticturkey.deserializer.getURI = function(response){
	var uriElement = response.getElementsByTagName('uri')[0];
	var uriValue = uriElement.textContent;
	var showValue = uriElement.getAttribute('show');
	var explicitValue = uriElement.getAttribute('explicit');
	var moreValue = uriElement.getAttribute('more');
	var roleValue = uriElement.getAttribute('role');
	var artURIRes = new art_semanticturkey.ARTURIResource(showValue, roleValue, uriValue);
	artURIRes.explicit = explicitValue; 
	artURIRes.more = moreValue; 
	return artURIRes;
}


//TODO old format, it should use the new standard
art_semanticturkey.deserializer.getPropertyValue = function(response){
	var propertyElement = response.getElementsByTagName('property')[0];
	return propertyElement.getAttribute('value');
} 