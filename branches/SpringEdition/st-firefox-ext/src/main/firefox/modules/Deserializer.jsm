Components.utils.import("resource://stmodules/Logger.jsm");
Components.utils.import("resource://stmodules/ARTResources.jsm");


EXPORTED_SYMBOLS = ["Deserializer"];



var Deserializer = new Object();
	
function createRDFArray(response){
	var collectionElement = response.getElementsByTagName('collection')[0];
	var childElements = collectionElement.childNodes;
	var collectionArray = new Array(); 
	for (var i = 0; i < childElements.length; i++){
		if(childElements[i].nodeType == 1) {// == ELEMENT_NODE
			collectionArray.push(createRDFNode(childElements[i]));
		}
	}
	return collectionArray;
};
	
function createURI(response){
	var uriElement;
	if(response.tagName == 'uri')
		uriElement = response;
	else
		uriElement = response.getElementsByTagName('uri')[0];
	var uriValue = uriElement.textContent;
	var showValue = uriElement.getAttribute('show');
	var explicitValue = uriElement.getAttribute('explicit');
	var deleteForbiddenValue = uriElement.getAttribute('deleteForbidden');
	var moreValue = uriElement.getAttribute('more');
	var roleValue = uriElement.getAttribute('role');
	var numInst = uriElement.getAttribute("numInst")
	
	var artURIRes = new ARTURIResource(showValue, roleValue, uriValue);
	artURIRes.explicit = explicitValue; 
	artURIRes.deleteForbidden = deleteForbiddenValue;
	artURIRes.more = moreValue; 
	artURIRes.numInst = numInst; 
	return artURIRes;
}

function createBlankNode(response){
	var bnodeElement;
	if(response.tagName == 'bnode')
		bnodeElement = response;
	else
		bnodeElement = response.getElementsByTagName('bnode')[0];
	var id = bnodeElement.textContent;
	var showValue = bnodeElement.getAttribute("show");
	var explicitValue = bnodeElement.getAttribute('explicit');
	
	var bNodeRes = new ARTBNode(id);
	bNodeRes.show = showValue;
	bNodeRes.explicit = explicitValue;
	return bNodeRes;
	
}

function createLiteral(response){
	var isTypedLiteral;
	var literalElement;
	if(response.tagName == 'plainLiteral' || response.tagName == 'typedLiteral')
		literalElement = response;
	else{
		literalElement = response.getElementsByTagName('typedLiteral');
		if(literalElement.lenght != 0)
			literalElement = response.getElementsByTagName('typedLiteral')[0];
		else
			literalElement = response.getElementsByTagName('plainLiteral')[0];
	}
	if(literalElement.tagName == 'typedLiteral')
		isTypedLiteral = true;
	else 
		isTypedLiteral = false;
	
	var label = literalElement.textContent;
	var datatype;
	if(isTypedLiteral)
		datatype = literalElement.getAttribute("typeQName");
	else
		datatype = "";
	var lang;
	if(isTypedLiteral)
		lang = "";
	else
		lang = literalElement.getAttribute("lang");
	var showValue = literalElement.getAttribute("show");
	var explicitValue = literalElement.getAttribute('explicit');
	
	var artLiteralRes = new ARTLiteral(label, datatype, lang, isTypedLiteral);
	artLiteralRes.show = showValue;
	artLiteralRes.explicit = explicitValue;
	return artLiteralRes;
}

function createRDFNode(response) {
	var tagName = response.tagName;
	if(tagName == 'uri'){
		return createURI(response);
	} else if(tagName == 'bnode'){
		return createBlankNode(response);
	} else if(tagName == 'plainLiteral' || tagName == 'typedLiteral'){ 
		return createLiteral(response);
	} else {
		//ERROR
	}
}

function createRDFResource(response) {
	var tagName = response.tagName;
	if(tagName == 'uri' || tagName == 'bnode'){
		return createRDFNode(response);
	} else{
		//ERROR
	}
}

//TODO old format, it should use the new standard
function createPropertyValue(response){
	var propertyElement = response.getElementsByTagName('property')[0];
	return propertyElement.getAttribute('value');
} 



Deserializer.createRDFArray = createRDFArray;
Deserializer.createURI = createURI;
Deserializer.createBlankNode = createBlankNode;
Deserializer.createLiteral = createLiteral;
Deserializer.createRDFNode = createRDFNode;
Deserializer.createRDFResource = createRDFResource;
Deserializer.createPropertyValue = createPropertyValue;
