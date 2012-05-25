
EXPORTED_SYMBOLS = ["ARTNode", "ARTLiteral", "ARTURIResource", "ARTBNode"];

/********** ARTNode *******************/

ARTNode = function(){
		
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

ARTLiteral = function(label, datatype, lang){
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

ARTLiteral.prototype = new ARTNode();
ARTLiteral.constructor = ARTLiteral;

/********** ARTURIResource *******************/

ARTURIResource = function(localName, nameSpace, uri){
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

ARTURIResource.prototype = new ARTNode();
ARTURIResource.constructor = ARTURIResource;


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

ARTBNode.prototype = new ARTNode();
ARTBNode.constructor = ARTBNode;
