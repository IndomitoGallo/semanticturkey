Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");
Components.utils.import("resource://stmodules/stEvtMgr.jsm");

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
	var oldName_p = "oldName=" + oldName;
	var newName_p = "newName=" + newName;
	var reply = HttpMgr.GET(serviceName, service.renameRequest, oldName_p, newName_p);
	
	if (!reply.isFail()) {
		evtMgr.fireEvent("resourceRenamed", {getOldName : function(){return oldName;}, getNewName : function(){return newName;}});
	}

	return reply;
}
//ModifyName SERVICE INITIALIZATION
service.rename = rename;