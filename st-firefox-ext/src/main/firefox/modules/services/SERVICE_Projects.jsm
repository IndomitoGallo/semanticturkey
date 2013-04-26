Components.utils.import("resource://stmodules/STRequests.jsm");
Components.utils.import("resource://stmodules/Logger.jsm");
Components.utils.import("resource://stmodules/stEvtMgr.jsm");

EXPORTED_SYMBOLS = [ "HttpMgr", "STRequests" ];

var service = STRequests.Projects;
var serviceName = service.serviceName;

/**
 * opens an existing project, given its <code>name</code>
 * 
 * @member STRequests.Projects
 * @param name
 * @return
 */
function openProject(name) {
	Logger.debug('[SERVICE_Projects.jsm] openProject');
	var name = "name=" + name;
	return HttpMgr.GET(serviceName, service.openProjectRequest, name);
}

/**
 * opens the main project
 * 
 * @member STRequests.Projects
 * @return
 */
/*function openMainProject() {
	Logger.debug('[SERVICE_Projects.jsm] openMainProject');
	return HttpMgr.GET(serviceName, service.openMainProjectRequest);
}*/

function repairProject(name){
	Logger.debug('[SERVICE_Projects.jsm] repairProject');
	var name = "name=" + name;
	return HttpMgr.GET(serviceName, service.repairProjectRequest, name);
}

/**
 * creates a new empty project
 * 
 * @member STRequests.Projects
 * @param name
 *            the name of the project
 * @param baseuri
 *            the baseuri of the working ontology for the created project
 * @param ontmanager
 *            the id of the ontmanager technology which is being used for this project
 * @param type
 *            tells whether a project is always kept updated with modifications (<em>continuosEditing</em>)
 *            or if it needs to be explicitly saved (<em>saveToStore</em>)
 * @return
 */
function newProject(name, ontologyType, baseuri, ontmanager, ontMgrConfiguration, cfgParsArray) {
	Logger.debug('[SERVICE_Projects.jsm] newProject');
	var name = "name=" + name;
	var ontologyType = "ontologyType=" + ontologyType;
	var baseuri = "baseuri=" + baseuri;
	var ontmanager = "ontmanager=" + ontmanager;
	var ontMgrConfiguration = "ontMgrConfiguration=" + ontMgrConfiguration;
	var cfgPars = "cfgPars=";
	for ( var i=0; i < cfgParsArray.length; ++i){
		var namePar = cfgParsArray[i].name;
		var valuePar = cfgParsArray[i].value;
		if(i!=0)
			cfgPars +="|_|";
		cfgPars += namePar+":::"+valuePar;
	}
	return HttpMgr.GET(serviceName, service.newProjectRequest, name, ontologyType,baseuri, ontmanager, ontMgrConfiguration, cfgPars);
}

/**
 * creates a new project and immediately fills it with RDF data from a given RDF file
 * 
 * @member STRequests.Projects
 * @param name
 *            the name of the project
 * @param baseuri
 *            the baseuri of the working ontology for the created project
 * @param ontmanager
 *            the id of the ontmanager technology which is being used for this project
 * @param type
 *            tells whether a project is always kept updated with modifications (<em>continuosEditing</em>)
 *            or if it needs to be explicitly saved (<em>saveToStore</em>)
 * @param file
 *            the path to the RDF file the data of which is automatically loaded inside the new project
 * @return
 */
function newProjectFromFile(name, ontologyType, baseuri, ontmanager, ontMgrConfiguration, cfgParsArray, file) {
	Logger.debug('[SERVICE_Projects.jsm] newProjectFromFile');
	var name = "name=" + name;
	var ontologyType = "ontologyType=" + ontologyType;
	var baseuri = "baseuri=" + baseuri;
	var ontmanager = "ontmanager=" + ontmanager;
	var ontMgrConfiguration = "ontMgrConfiguration=" + ontMgrConfiguration;
	var file = "file=" + file;
	var cfgPars = "cfgPars=";
	for ( var i=0; i < cfgParsArray.length; ++i){
		var namePar = cfgParsArray[i].name;
		var valuePar = cfgParsArray[i].value;
		if(i!=0)
			cfgPars +="|_|";
		cfgPars += namePar+":::"+valuePar;
	}
	return HttpMgr.GET(serviceName, service.newProjectFromFileRequest, name, ontologyType, baseuri, ontmanager, ontMgrConfiguration, file, cfgPars);
}

/**
 * closes the current project
 * 
 * @member STRequests.Projects
 * @return
 */
function closeProject() {
	Logger.debug('[SERVICE_Projects.jsm] closeProject');
	return HttpMgr.GET(serviceName, service.closeProjectRequest);
}

/**
 * deletes a project identified by argument <em>name</em>
 * 
 * @member STRequests.Projects
 * @param name
 * @return
 */
function deleteProject(name) {
	Logger.debug('[SERVICE_Projects.jsm] deleteProject');
	var name = "name=" + name;
	return HttpMgr.GET(serviceName, service.deleteProjectRequest, name);
}

/**
 * exports a project to a given file. The file is compiled according to Semantic Turkey project file format
 * 
 * @member STRequests.Projects
 * @param projfile
 * @return
 */
function exportProject(projfile) {
	Logger.debug('[SERVICE_Projects.jsm] exportProject');
	var projfile = "projfile=" + projfile;
	return HttpMgr.GET(serviceName, service.exportProjectRequest, projfile);
}

/**
 * imports a project compiled according to Semantic Turkey project file format.
 * 
 * @member STRequests.Projects
 * @param projfile
 * @param name
 *            (optional). If not specified, the name is the one declared in the imported project; however, it
 *            this name clashes with that of an existing project, then an exception is being thrown
 * @return
 */
function importProject(projfile, name) {
	Logger.debug('[SERVICE_Projects.jsm] importProject');
	var projfile = "projfile=" + projfile;
	var name = "name=" + name;
	return HttpMgr.GET(serviceName, service.importProjectRequest, projfile, name);
}

/**
 * clones an existing project identified by <em>name</em> into a new one called <em>newName</em>
 * 
 * @member STRequests.Projects
 * @param name
 * @param newName
 * @return
 */
function cloneProject(name, newName) {
	Logger.debug('[SERVICE_Projects.jsm] cloneProject');
	var name = "name=" + name;
	var newName = "newName=" + newName;
	return HttpMgr.GET(serviceName, service.cloneProjectRequest, name, newName);
}

/**
 * saves the current project into a new one with given name <em>newName</em>. If the save is successful,
 * then the new project automatically becomes the current one and the previous one is being closed
 * 
 * @member STRequests.Projects
 * @param newName
 * @return
 */
function saveProjectAs(newName) {
	Logger.debug('[SERVICE_Projects.jsm] saveProjectAs');
	var newName = "newName=" + newName;
	return HttpMgr.GET(serviceName, service.saveProjectAsRequest, newName);
}

/**
 * saves the current project
 * 
 * @member STRequests.Projects
 * @return
 */
function saveProject() {
	Logger.debug('[SERVICE_Projects.jsm] saveProject');
	return HttpMgr.GET(serviceName, service.saveProjectRequest);
}

/**
 * returns a list of all projects available in Semantic Turkey (the <code>mainProject</code> is excluded
 * from this list, whether it has been initialized or not)
 * 
 * @member STRequests.Projects
 * @return
 */
function listProjects() {
	Logger.debug('[SERVICE_Projects.jsm] listProjects');
	return HttpMgr.GET(serviceName, service.listProjectsRequest);
}

/**
 * gets the name of the current project
 * 
 * @member STRequests.Projects
 * @return
 */
function getCurrentProject() {
	Logger.debug('[SERVICE_Projects.jsm] getCurrentProject');
	return HttpMgr.GET(serviceName, service.getCurrentProjectRequest);
}

function getProjectProperty(propNames, projectName) {
	Logger.debug('[SERVICE_Projects.jsm] getProjectProperty');
	var propNames_p = "propNames=" + propNames;
	var name_p = projectName == null ? "" : "name=" + projectName;
	return HttpMgr.GET(serviceName, service.getProjectPropertyRequest, propNames_p, name_p);
}

function setProjectProperty(propName, propValue, context) {
	Logger.debug('[SERVICE_Projects.jsm] setProjectProperty');
	var propName_p = "name=" + propName;
	var propValue_p = "value=" + propValue;
	
	var reply = HttpMgr.GET(serviceName, service.setProjectPropertyRequest, propName_p, propValue_p);
	
	if (!reply.isFail()) {
		evtMgr.fireEvent("projectPropertySet", {getPropName : function(){return propName;}, getPropValue : function(){return propValue;}, getContext : function(){return context;}});
	}

	return reply;
}

// Projects SERVICE INITIALIZATION
service.openProject = openProject;
service.repairProject = repairProject;
//service.openMainProject = openMainProject;
service.newProject = newProject;
service.newProjectFromFile = newProjectFromFile;
service.closeProject = closeProject;
service.deleteProject = deleteProject;
service.exportProject = exportProject;
service.importProject = importProject;
service.cloneProject = cloneProject;
service.saveProject = saveProject;
service.saveProjectAs = saveProjectAs;
service.listProjects = listProjects;
service.getCurrentProject = getCurrentProject;
service.getProjectProperty = getProjectProperty;
service.setProjectProperty = setProjectProperty;

