/*
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License");  you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * http//www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 *
 * The Original Code is SemanticTurkey.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2007.
 * All Rights Reserved.
 *
 * SemanticTurkey was developed by the Artificial Intelligence Research Group
 * (art.uniroma2.it) at the University of Roma Tor Vergata (ART)
 * Current information about SemanticTurkey can be obtained at 
 * http://semanticturkey.uniroma2.it
 *
 */

/*
 * Contributor(s): Armando Stellato stellato@info.uniroma2.it
 */
package it.uniroma2.art.semanticturkey.servlet.main;

import it.uniroma2.art.owlart.exceptions.ModelUpdateException;
import it.uniroma2.art.owlart.exceptions.UnavailableResourceException;
import it.uniroma2.art.owlart.io.RDFFormat;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.semanticturkey.exceptions.DuplicatedResourceException;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.exceptions.InvalidProjectNameException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectAccessException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectDeletionException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectInconsistentException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectInexistentException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectUpdateException;
import it.uniroma2.art.semanticturkey.exceptions.ReservedPropertyUpdateException;
import it.uniroma2.art.semanticturkey.ontology.ModelTypeRegistry;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.AbstractProject;
import it.uniroma2.art.semanticturkey.project.Project;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.project.ProjectManager.ProjectType;
import it.uniroma2.art.semanticturkey.project.SaveToStoreProject;
import it.uniroma2.art.semanticturkey.resources.UpdateRoutines;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.w3c.dom.DOMException;
import org.w3c.dom.Element;

@Component
public class Projects extends ServiceAdapter {
	protected static Logger logger = LoggerFactory.getLogger(Projects.class);

	// requests
	public static class Req {
		public final static String isCurrentProjectActiveRequest = "isCurrentProjectActive";
		public final static String openProjectRequest = "openProject";
		public final static String createNewProjectRequest = "newProject";
		public final static String createNewProjectFromFileRequest = "newProjectFromFile";
		public final static String closeProjectRequest = "closeProject";
		public final static String deleteProjectRequest = "deleteProject";
		public final static String exportProjectRequest = "exportProject";
		public final static String importProjectRequest = "importProject";
		public final static String cloneProjectRequest = "cloneProject";
		public final static String saveProjectRequest = "saveProject";
		public final static String saveProjectAsRequest = "saveProjectAs";
		public final static String listProjectsRequest = "listProjects";
		public final static String getProjectPropertyRequest = "getProjectProperty";
		public final static String setProjectPropertyRequest = "setProjectProperty";
		public final static String getCurrentProjectRequest = "getCurrentProject";
		public final static String repairProjectRequest = "repairProject";
	}

	// parameters
	public final static String baseuriPar = "baseuri";
	public final static String ontmanagerPar = "ontmanager";
	public final static String projectNamePar = "name";
	public final static String newProjectNamePar = "newName";
	public final static String ontologyTypePar = "ontologyType";
	public final static String projectTypePar = "type";
	public final static String ontMgrConfigurationPar = "ontMgrConfiguration";
	public final static String cfgParsPar = "cfgPars";
	public final static String ontFilePar = "file";
	public final static String projectFilePar = "projfile";
	public final static String propNamePar = "name";
	public final static String propValuePar = "value";
	public final static String propNamesPar = "propNames";

	// response tags
	public final static String baseuriTag = "baseuri";
	public final static String projectTag = "project";
	public final static String propertyTag = "property";
	public final static String propNameAttr = "name";
	public final static String propValueAttr = "value";
	public final static String ontMgrAttr = "ontmgr";
	public final static String typeAttr = "type";
	public final static String ontoTypeAttr = "ontoType";
	public final static String modelConfigAttr = "modelConfigType";
	public final static String statusAttr = "status";
	public final static String statusMsgAttr = "stMsg";

	// parameters
	@Autowired
	public Projects(@Value("Projects") String id) {
		super(id);
	}

	public Logger getLogger() {
		return logger;
	}

	public Response getPreCheckedResponse(String request) throws HTTPParameterUnspecifiedException {

		if (request.equals(Req.isCurrentProjectActiveRequest)) {
			return isCurrentProjectActive();
		}
		
		else if (request.equals(Req.openProjectRequest)) {
			String projectName = setHttpPar(projectNamePar);
			checkRequestParametersAllNotNull(projectNamePar);
			return openProject(projectName);
		}

		else if (request.equals(Req.createNewProjectRequest)) {
			String projectName = setHttpPar(projectNamePar);
			String ontologyType = setHttpPar(ontologyTypePar);
			String baseuri = setHttpPar(baseuriPar);
			String ontmanager = setHttpPar(ontmanagerPar);
			String ontManagerConfiguration = setHttpPar(ontMgrConfigurationPar);
			String cfgPars = setHttpPar(cfgParsPar);

			checkRequestParametersAllNotNull(projectNamePar, ontologyTypePar, baseuriPar, ontmanagerPar,
					ontMgrConfigurationPar);

			return newEmptyProject(projectName, ontologyType, baseuri, ontmanager, ontManagerConfiguration,
					cfgPars);
		}

		else if (request.equals(Req.createNewProjectFromFileRequest)) {
			String projectName = setHttpPar(projectNamePar);
			String ontologyType = setHttpPar(ontologyTypePar); // not checked for existence
			String baseuri = setHttpPar(baseuriPar);
			String ontmanager = setHttpPar(ontmanagerPar);
			String ontManagerConfiguration = setHttpPar(ontMgrConfigurationPar);
			String cfgPars = setHttpPar(cfgParsPar);
			String ontFile = setHttpPar(ontFilePar);

			checkRequestParametersAllNotNull(projectNamePar, ontologyTypePar, baseuriPar, ontmanagerPar,
					ontMgrConfigurationPar, ontFilePar);
			return newProjectFromFile(projectName, ontologyType, baseuri, ontmanager,
					ontManagerConfiguration, cfgPars, ontFile);
		}

		else if (request.equals(Req.closeProjectRequest)) {
			return closeCurrentProject();
		}

		else if (request.equals(Req.deleteProjectRequest)) {
			String projectName = setHttpPar(projectNamePar);
			checkRequestParametersAllNotNull(projectNamePar);
			return deleteProject(projectName);
		}

		else if (request.equals(Req.exportProjectRequest)) {
			String projectFile = setHttpPar(projectFilePar);
			checkRequestParametersAllNotNull(projectFilePar);
			return exportProject(projectFile);
		}

		else if (request.equals(Req.importProjectRequest)) {
			String projectFile = setHttpPar(projectFilePar);
			String projectName = setHttpPar(projectNamePar);
			checkRequestParametersAllNotNull(projectFilePar);
			return importProject(projectFile, projectName);
		}

		else if (request.equals(Req.saveProjectAsRequest)) {
			String newProject = setHttpPar(newProjectNamePar);
			checkRequestParametersAllNotNull(newProjectNamePar);
			return saveProjectAs(newProject);
		}

		else if (request.equals(Req.saveProjectRequest)) {
			String projectName = setHttpPar(projectNamePar);
			return saveProject(projectName);
		}

		else if (request.equals(Req.cloneProjectRequest)) {
			String projectName = setHttpPar(projectNamePar);
			String newProject = setHttpPar(newProjectNamePar);
			checkRequestParametersAllNotNull(projectNamePar, newProjectNamePar);
			return cloneProject(projectName, newProject);
		}

		else if (request.equals(Req.listProjectsRequest)) {
			return listProjects();
		}

		else if (request.equals(Req.getProjectPropertyRequest)) {
			String propNamesCompact = setHttpPar(propNamesPar);
			String projectName = setHttpPar(projectNamePar);
			checkRequestParametersAllNotNull(propNamesPar);
			return getProjectProperty(propNamesCompact, projectName);
		}

		else if (request.equals(Req.setProjectPropertyRequest)) {
			String propName = setHttpPar(propNamePar);
			String propValue = setHttpPar(propValuePar);
			checkRequestParametersAllNotNull(propNamePar, propValuePar);
			return setProjectProperty(propName, propValue);
		}

		else if (request.equals(Req.getCurrentProjectRequest)) {
			return getCurrentProject();
		}

		else if (request.equals(Req.repairProjectRequest)) {
			String projectName = setHttpPar(projectNamePar);
			return repairProject(projectName);
		}

		else
			return servletUtilities.createNoSuchHandlerExceptionResponse(request);
	}
	
	
	public Response isCurrentProjectActive() {
		if (ProjectManager.getCurrentProject()!=null)
			return createBooleanResponse(true);
		else
			return createBooleanResponse(false);	
	}

	public Response repairProject(String projectName) {
		String request = Req.repairProjectRequest;
		XMLResponseREPLY resp = servletUtilities.createReplyResponse(request, RepliesStatus.ok);
		try {
			UpdateRoutines.repairProject(projectName);
			return resp;
		} catch (IOException e) {
			return logAndSendException(request, e, "unable to access property file for project: "
					+ projectName + " (which seems however to exist)");
		} catch (InvalidProjectNameException e) {
			return logAndSendException(request, e,
					"UPDATING OLD PROJECT TO NEW FORMAT: strangely, the project name is invalid");
		} catch (ProjectInexistentException e) {
			return logAndSendException(request, e, "UPDATING OLD PROJECT TO NEW FORMAT: strangely, project: "
					+ projectName + " does not exist, while it has been previously checked for existence");
		} catch (ProjectInconsistentException e) {
			return logAndSendException(request, e,
					"the project was in a inconsistent state which I'm unable to repair: " + e.getMessage());
		}
	}

	public Response getCurrentProject() {
		try {
		String request = Req.getCurrentProjectRequest;
		Project<? extends RDFModel> proj = ProjectManager.getCurrentProject();
		if (proj==null)
			return servletUtilities.createReplyResponse(request, RepliesStatus.fail, "no project currently loaded!");
		
		XMLResponseREPLY resp = servletUtilities.createReplyResponse(request, RepliesStatus.ok);
		Element dataElem = resp.getDataElement();
		String projName = proj.getName();
		Element projElem;

		if (projName == null) {
			projElem = XMLHelp.newElement(dataElem, projectTag);
			projElem.setAttribute("exists", "false");
		} else {
			projElem = XMLHelp.newElement(dataElem, projectTag, projName);
			projElem.setAttribute("exists", "true");
		}
		
		projElem.setAttribute("type", proj.getType());
		projElem.setAttribute("ontoType", proj.getModelType().getCanonicalName());

		return resp;
		} catch(ProjectInconsistentException e) {
			return logAndSendException(e);
		}
	}

	@SuppressWarnings("unchecked")
	public Response listProjects() {
		String request = Req.listProjectsRequest;
		Collection<AbstractProject> projects;
		try {
			projects = ProjectManager.listProjects();
			XMLResponseREPLY resp = servletUtilities.createReplyResponse(request, RepliesStatus.ok);
			Element dataElem = resp.getDataElement();

			for (AbstractProject absProj : projects) {
				Element projElem = XMLHelp.newElement(dataElem, projectTag, absProj.getName());
				if (absProj instanceof Project<?>) {
					Project<? extends RDFModel> proj = (Project<? extends RDFModel>) absProj;
					try {
						projElem.setAttribute(ontoTypeAttr, ((Project<?>) proj).getModelType().getName());
						String ontMgr = ((Project<?>) proj).getOntologyManagerImplID();
						projElem.setAttribute(ontMgrAttr, ontMgr);
						String mConfID = ((Project<?>) proj).getModelConfigurationID();
						projElem.setAttribute(modelConfigAttr, mConfID);
						projElem.setAttribute(typeAttr, ((Project<?>) proj).getType());

						projElem.setAttribute(statusAttr, "ok");
					} catch (DOMException e) {
						projElem.setAttribute(statusAttr, "error");
						projElem.setAttribute(statusMsgAttr,
								"problem when building XML response for this project");
					} catch (ProjectInconsistentException e) {
						projElem.setAttribute(statusAttr, "error");
						projElem.setAttribute(statusMsgAttr, e.getMessage());
					}

				} else
					// proj instanceof CorruptedProject
					projElem.setAttribute(statusAttr, "corrupted");
			}
			return resp;
		} catch (ProjectAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e.toString());
		}
	}

	/**
	 * opens an already built project inside Semantic Turkey projects' list
	 * 
	 * @param projectName
	 * @return
	 */
	public Response openProject(String projectName) {

		String request = Req.openProjectRequest;
		logger.info("requested to open project:  " + projectName);

		try {
			Project<?> proj = ProjectManager.openProject(projectName);
			XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request,
					RepliesStatus.ok);
			Element dataElement = response.getDataElement();
			XMLHelp.newElement(dataElement, "type", proj.getType());
			return response;

		} catch (Exception e) {
			logger.error(e.getMessage());
			e.printStackTrace(System.err);
			return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
		}

	}

	/**
	 * deletes an already built project inside Semantic Turkey projects' list
	 * 
	 * @param projectName
	 * @return
	 */
	public Response deleteProject(String projectName) {

		String request = Req.deleteProjectRequest;
		logger.info("requested to delete project:  " + projectName);

		try {
			ProjectManager.deleteProject(projectName);
		} catch (Exception e) {
			logger.error(e.getMessage());
			e.printStackTrace(System.err);
			return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
		}

		return ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);
	}

	/**
	 * saves state of currently loaded project <code>projectName</code>
	 * 
	 * @param projectName
	 * @return
	 */
	public Response saveProject(String projName) {
		// now working only for current project
		String request = Req.saveProjectRequest;
		logger.info("requested to save project: " + projName);
		Project<? extends RDFModel> proj = ProjectManager.getCurrentProject();

		if (projName != null && !projName.equals(proj.getName())) {
			// proj = getLoadedProject(projName)
			// this case will be available when multiple project management will be activated
		}

		if (!(proj instanceof SaveToStoreProject<?>))
			return servletUtilities.createExceptionResponse(request,
					"non-sense request: this is not a saveable project!");

		try {
			((SaveToStoreProject<?>) proj).save();
		} catch (ProjectUpdateException e) {
			logger.error(e.toString());
			e.printStackTrace(System.err);
			return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
		}

		return ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);
	}

	/**
	 * saves project <code>projectName</code> to <code>newProject</code>
	 * 
	 * @param projectName
	 * @return
	 */
	public Response saveProjectAs(String newProjectName) {

		logger.info("requested to save current project as project: " + newProjectName);

		String projectName = ProjectManager.getCurrentProject().getName();
		try {

			if (ProjectManager.existsProject(newProjectName)) {
				return servletUtilities.createReplyFAIL(Req.saveProjectAsRequest, "project " + newProjectName
						+ " already exists!");
			}

			ProjectManager.closeCurrentProject();
			ProjectManager.cloneProjectToNewProject(projectName, newProjectName);
			ProjectManager.openProject(newProjectName);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (InvalidProjectNameException e) {
			return logAndSendException(e);
		} catch (DuplicatedResourceException e) {
			return logAndSendException(e);
		} catch (IOException e) {
			return logAndSendException(e);
		} catch (UnavailableResourceException e) {
			return logAndSendException(e);
		} catch (ProjectAccessException e) {
			return logAndSendException(e);
		} catch (ProjectInexistentException e) {
			return logAndSendException(
					e,
					"weird error: ProjectManager reported that it is impossible to clone the current project because it does not exist!");
		}

		return servletUtilities.createReplyResponse(Req.saveProjectAsRequest, RepliesStatus.ok);
	}

	/**
	 * saves project <code>projectName</code> to <code>newProject</code>
	 * 
	 * @param projectName
	 * @return
	 */
	public Response cloneProject(String projectName, String newProjectName) {

		String request = Req.cloneProjectRequest;
		logger.info("requested to export current project");

		try {
			ProjectManager.cloneProjectToNewProject(projectName, newProjectName);
		} catch (Exception e) {
			logger.error(e.getMessage());
			e.printStackTrace(System.err);
			return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
		}

		return ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);
	}

	/**
	 * exports the current project to a given project file in Semantic Turkey project archive format
	 * 
	 * @param projectName
	 * @return
	 */
	public Response exportProject(String projectFileName) {

		String request = Req.exportProjectRequest;
		logger.info("requested to export current project");

		try {
			File projectFile = new File(projectFileName);
			ProjectManager.exportCurrentProject(projectFile);
		} catch (Exception e) {
			logger.error(e.toString());
			e.printStackTrace(System.err);
			return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
		}

		return ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);
	}

	/**
	 * exports the current project to a given project file in Semantic Turkey project archive format
	 * 
	 * @param projectName
	 * @return
	 */
	public Response importProject(String projectFileName, String newProjectName) {

		String request = Req.importProjectRequest;
		logger.info("requested to import project from file: " + projectFileName);

		try {
			File projectFile = new File(projectFileName);
			ProjectManager.importProject(projectFile, newProjectName);

		} catch (DuplicatedResourceException e) {
			return ServletUtilities.getService().createReplyResponse(request, RepliesStatus.fail,
					e.getMessage());

		} catch (Exception e) {
			logger.error(e.toString());
			e.printStackTrace(System.err);
			return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
		}

		return ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);
	}

	private Response recoverFromFailedProjectCreation(String request, String projectName, String intendedMsg) {
		try {
			logger.error("not able to open project: " + projectName + "; raised exception: " + intendedMsg);

			logger.error("now deleting project folder");
			ProjectManager.deleteProject(projectName);
		} catch (ProjectDeletionException e1) {
			return ServletUtilities
					.getService()
					.createExceptionResponse(
							request,
							"a problem raised when creating the project, however, we were not able to delete the folder which has been created for it; please delete it manually");
		}
		return ServletUtilities.getService().createExceptionResponse(request, intendedMsg);
	}

	public static Properties resolveConfigParameters(String configParameters) {
		Properties props = new Properties();
		if (configParameters != null) {
			String[] splits = configParameters.split("\\|_\\|");
			for (String split : splits) {
				String[] nameValue = split.split(":::");
				props.setProperty(nameValue[0], nameValue[1]);
			}
		}
		return props;
	}

	/**
	 * creates and opens a new empty project
	 * 
	 * @param projectName
	 * @param baseuri
	 * @param ontmanager
	 *            the id of the ontmanager implementation which will be used to manage the ontology
	 * @param projectType
	 *            the string expression for one of the defined {@link ProjectType}s
	 * @return
	 */
	public Response newEmptyProject(String projectName, String ontologyType, String baseuri,
			String ontmanager, String modelConfigurationClass, String configPars) {

		String request = Req.createNewProjectRequest;
		logger.info("requested to create new project with name:  " + projectName);
		logger.debug("ontologyType: " + ontologyType);
		try {
			Class<? extends RDFModel> modelType = ModelTypeRegistry.getModelClass(ontologyType);

			Properties modelConfiguration = resolveConfigParameters(configPars);

			Project<?> proj = ProjectManager.createProject(projectName, modelType, baseuri, ontmanager,
					modelConfigurationClass, modelConfiguration);

			XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request,
					RepliesStatus.ok);
			Element dataElement = response.getDataElement();
			XMLHelp.newElement(dataElement, "type", proj.getType());
			return response;

		} catch (InvalidProjectNameException e) {
			logger.error(e.getMessage());
			return servletUtilities.createExceptionResponse(request, e.toString());
		} catch (RuntimeException e) {
			e.printStackTrace(System.err);
			recoverFromFailedProjectCreation(request, projectName, "");
			throw e;
		} catch (DuplicatedResourceException e) {
			logger.error(e.getMessage());
			// if the project already existed, it does need to be deleted!!!
			return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
		} catch (Exception e) {
			logger.error("exception when creating a new empty project: " + e + "\nexception type: "
					+ e.getClass());
			e.printStackTrace(System.err);
			return recoverFromFailedProjectCreation(request, projectName, e.getMessage());
		}
	}

	/**
	 * creates a new Project by loading all rdf data from file <code>file</code>
	 * 
	 * @param projectName
	 * @param baseuri
	 * @param ontmanager
	 * @param projectType
	 * @param file
	 * @return
	 */
	public Response newProjectFromFile(String projectName, String ontologyType, String baseuri,
			String ontmanager, String modelConfigurationClass, String configPars, String file) {

		String request = Req.createNewProjectFromFileRequest;
		logger.info("requested to create new project with name:  " + projectName + " from file: " + file);

		try {
			File ontFileToImport = new File(file);
			Class<? extends RDFModel> modelType;
			if (ontologyType != null)
				modelType = OWLModel.class;
			else
				modelType = ModelTypeRegistry.getModelClass(ontologyType);

			Properties modelConfiguration = resolveConfigParameters(configPars);

			Project<?> proj = ProjectManager.createProject(projectName, modelType, baseuri, ontmanager,
					modelConfigurationClass, modelConfiguration);

			logger.info("project: " + projectName + " created, importing rdf data from file: " + file);
			proj.getOntModel().addRDF(ontFileToImport, baseuri,
					RDFFormat.guessRDFFormatFromFile(ontFileToImport), NodeFilters.MAINGRAPH);
			// RDFFormat.RDFXML, NodeFilters.MAINGRAPH);
			logger.info("rdf data imported from file: " + file);

			XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request,
					RepliesStatus.ok);
			Element dataElement = response.getDataElement();
			XMLHelp.newElement(dataElement, "type", proj.getType());
			return response;

		} catch (RuntimeException e) {
			logger.error(Utilities.printFullStackTrace(e));
			recoverFromFailedProjectCreation(request, projectName, "");
			throw e;
		} catch (DuplicatedResourceException e) {
			logger.error(e.getMessage());
			// if the project already existed, it does need to be deleted!!!
			return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
		} catch (Exception e) {
			logger.error("exception when creating a new empty project: " + e.getMessage()
					+ "\nexception type: " + e.getClass());
			return recoverFromFailedProjectCreation(request, projectName, e.getMessage());
		}
	}

	/**
	 * closes the currently loaded project
	 * 
	 * @param projectName
	 * @return
	 */
	public Response closeCurrentProject() {

		String request = Req.closeProjectRequest;
		logger.info("requested to close current project");

		try {
			ProjectManager.closeCurrentProject();
		} catch (Exception e) {
			logger.info(e.getMessage());
			return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
		}

		return ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);
	}

	/**
	 * this service returns values associated to properties of a given project returns a response with
	 * elements called {@link #propertyTag} with attributes {@link #propNameAttr} for property name and
	 * 
	 * @param propNamesCompact
	 *            a ";" separated list of property names
	 * @param projName
	 *            (optional)the project queried for properties (if null, current project is queried)
	 * @return
	 */
	public Response getProjectProperty(String propNamesCompact, String projName) {
		Project<? extends RDFModel> proj = ProjectManager.getCurrentProject();

		String[] propNames = propNamesCompact.split(";");
		String[] propValues = new String[propNames.length];

		if (projName == null || projName.equals(proj.getName())) {
			for (int i = 0; i < propNames.length; i++)
				propValues[i] = proj.getProperty(propNames[i]);
		} else
			try {
				for (int i = 0; i < propNames.length; i++)
					propValues[i] = ProjectManager.getProjectProperty(projName, propNames[i]);
			} catch (IOException e) {
				return logAndSendException(e);
			} catch (InvalidProjectNameException e) {
				return logAndSendException(e);
			} catch (ProjectInexistentException e) {
				return logAndSendException(e);
			}

		XMLResponseREPLY resp = servletUtilities.createReplyResponse(Req.getProjectPropertyRequest,
				RepliesStatus.ok);
		Element dataElem = resp.getDataElement();

		for (int i = 0; i < propValues.length; i++) {
			Element projElem = XMLHelp.newElement(dataElem, propertyTag);
			if (proj instanceof Project<?>) {
				projElem.setAttribute(propNameAttr, propNames[i]);
				projElem.setAttribute(propValueAttr, propValues[i]);
			}
		}

		return resp;

	}

	// the following service does not allow to modify properties of closed projects, as that kind of
	// modification allows for changing even syste, properties

	/**
	 * This service sets the value of a property of the current project.
	 * 
	 * @param propName
	 * @param propValue
	 * @return
	 */
	public Response setProjectProperty(String propName, String propValue) {
		Project<? extends RDFModel> currProj = ProjectManager.getCurrentProject();
		try {
			currProj.setProperty(propName, propValue);
		} catch (ProjectUpdateException e) {
			return logAndSendException(e);
		} catch (ReservedPropertyUpdateException e) {
			return servletUtilities.createReplyResponse(Req.setProjectPropertyRequest, RepliesStatus.fail,
					e.getMessage());
		}

		return servletUtilities.createReplyResponse(Req.setProjectPropertyRequest, RepliesStatus.ok);

	}
}
