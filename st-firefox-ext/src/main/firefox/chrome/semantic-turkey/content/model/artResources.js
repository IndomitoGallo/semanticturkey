if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);


/********** ARTNode *******************/

art_semanticturkey.artNode = function(){
	var literal = false;
	var resource = false;
	var uriResource = false;
	var bnode = false;
	
	this.isLiteral = function(){
		return literal;
	};
	
	this.isResource = function(){
		return resource;
	};
	
	this.isURIResource = function(){
		return uriResource;
	};
	
	this.isBNode = function(){
		return bnode;
	};
};


/********** ARTLiteral *******************/

art_semanticturkey.artLiteral = function(label, datatype, lang){
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

art_semanticturkey.artLiteral.prototype = new art_semanticturkey.artNode();
art_semanticturkey.artLiteral.constructor = art_semanticturkey.artLiteral;

/*art_semanticturkey.artLiteral.prototype.isLiteral = function(){
	return true;
};*/


/********** ARTURIResource *******************/

art_semanticturkey.artURIResource = function(localName, nameSpace, uri){
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

art_semanticturkey.artURIResource.prototype = new art_semanticturkey.artNode();
art_semanticturkey.artURIResource.constructor = art_semanticturkey.artURIResource;


/********** ARTBNode *******************/

art_semanticturkey.artBNode = function(id){
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

art_semanticturkey.artBNode.prototype = new art_semanticturkey.artNode();
art_semanticturkey.artBNode.constructor = art_semanticturkey.artBNode;

/******************     *****************************/