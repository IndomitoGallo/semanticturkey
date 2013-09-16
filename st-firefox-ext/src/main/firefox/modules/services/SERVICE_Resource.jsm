Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");

EXPORTED_SYMBOLS = [ "STRequests" ];

var service = STRequests.Resource;
var serviceName = service.serviceName;

/**
 * Gets a resource role.
 * 
 * @member STRequests.Resource
 * @param resource a resource
 * @return
 */
function getRole(resource) {
	Logger.debug('[SERVICE_Resource.jsm] getRole');
	var resource_p = "resource=" + resource;

	var response = HttpMgr.GET(serviceName, service.getRoleRequest,resource_p);
	return response.getElementsByTagName("value")[0].textContent.trim();
}

// RESOURCE SERVICE INITIALIZATION
service.getRole = getRole;