
var EXPORTED_SYMBOLS = [ "RespContType", "XMLRespContType",  "JSONRespContType"];

XMLRespContType = function() {
};

JSONRespContType = function() {

};


RespContType = new function() {
	this.xml = new XMLRespContType();
	this.json = new JSONRespContType();
};