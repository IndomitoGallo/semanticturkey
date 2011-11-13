Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");

EXPORTED_SYMBOLS = [ "HttpMgr", "STRequests" ];

var service = STRequests.ModifyName;
var serviceName = service.serviceName;

/**
 * renames an existing resource
 * 
 * @member STRequests.ModifyName
 * @param oldName
 * @param newName
 * @return
 */
function rename(oldName,newName){
	var oldName = "oldName=" + oldName;
	var newName = "newName=" + newName;
	return HttpMgr.GET(serviceName, service.renameRequest, oldName,newName);
}
//ModifyName SERVICE INITIALIZATION
service.rename = rename;