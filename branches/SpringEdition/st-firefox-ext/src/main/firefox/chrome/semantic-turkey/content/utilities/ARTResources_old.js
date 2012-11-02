
// just for the developlment phase, then it should be used the relative module

//EXPORTED_SYMBOLS = ["ARTNode", "ARTLiteral", "ARTURIResource", "ARTBNode"];


if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};

/********** ARTNode *******************/

art_semanticturkey.ARTNode = function(){
		
	this.isLiteral = function(){
		return false;
	};
	
	this.isResource = function(){
		return false;
	};
	
	this.isURIResource = function(){
		return false;
	};
	
	this.isBNode = function(){
		return false;
	};
};

/********** ARTLiteral *******************/

art_semanticturkey.ARTLiteral = function(label, datatype, lang){
	var label = label;
	var datatype = datatype;
	var lang = lang;
	
	this.getLabel = function(){
		return label;	
	};
	
	this.getDatatype = function(){
		return datatype;	
	};
	
	this.getLang = function(){
		return lang;	
	};
	
	this.isLiteral = function(){
		return true;
	};
};

art_semanticturkey.ARTLiteral.prototype = new art_semanticturkey.ARTNode();
art_semanticturkey.ARTLiteral.constructor = art_semanticturkey.ARTLiteral;

/********** ARTURIResource *******************/

art_semanticturkey.ARTURIResource = function(localName, nameSpace, uri){
	var localName = localName;
	var nameSpace = nameSpace;
	var uri = uri;
	
	this.isResource = function(){
		return true;
	};
	
	this.isURIResource = function(){
		return true;
	};
	
	this.getLocalName = function(){
		return localName;	
	};
	
	this.getNamespace = function(){
		return nameSpace;	
	};
	
	this.getURI = function(){
		return uri;	
	};
};

art_semanticturkey.ARTURIResource.prototype = new ARTNode();
art_semanticturkey.ARTURIResource.constructor = ARTURIResource;


/********** ARTBNode *******************/

ARTBNode = function(id){
	var id = id;
	
	this.isResource = function(){
		return true;
	};
	
	this.isBNode = function(){
		return true;
	};
	
	this.getId = function(){
		return id;	
	};
};

art_semanticturkey.ARTBNode.prototype = new ARTNode();
art_semanticturkey.ARTBNode.constructor = ARTBNode;
