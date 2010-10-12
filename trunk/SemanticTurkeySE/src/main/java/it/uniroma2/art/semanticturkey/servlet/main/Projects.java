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
import it.uniroma2.art.semanticturkey.exceptions.ProjectCreationException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectDeletionException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectInconsistentException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectInexistentException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectUpdateException;
import it.uniroma2.art.semanticturkey.ontology.ModelTypeRegistry;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.AbstractProject;
import it.uniroma2.art.semanticturkey.project.Project;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.project.SaveToStoreProject;
import it.uniroma2.art.semanticturkey.project.ProjectManager.ProjectType;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.io.File;
import java.io.IOException;
import java.util.Collection;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.DOMException;
import org.w3c.dom.Element;

public class Projects extends ServiceAdapter {
	protected static Logger logger = LoggerFactory.getLogger(Projects.class);

	// requests
	public static class Req {
		public final static String openProjectRequest = "openProject";
		public final static String openMainProjectRequest = "openMainProject";
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
		public final static String getCurrentProjectRequest = "getCurrentProject";
	}

	// parameters
	public final static String baseuriPar = "baseuri";
	public final static String ontmanagerPar = "ontmanager";
	public final static String projectNamePar = "name";
	public final static String newProjectNamePar = "newName";
	public final static String ontologyTypePar = "ontologyType";
	public final static String projectTypePar = "type";
	public final static String ontFilePar = "file";
	public final static String projectFilePar = "projfile";
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
	public final static String statusAttr = "status";
	public final static String statusMsgAttr = "stMsg";

	// parameters

	public Projects(String id) {
		super(id);
	}

	public Response getResponse() {
		String request = setHttpPar("request");
		try {
			if (request.equals(Req.openProjectRequest)) {
				String projectName = setHttpPar(projectNamePar);
				checkRequestParametersAllNotNull(projectNamePar);
				return openProject(projectName);
			}

			else if (request.equals(Req.openMainProjectRequest)) {
				return openMainProject();
			}

			else if (request.equals(Req.createNewProjectRequest)) {
				String projectName = setHttpPar(projectNamePar);
				String ontologyType = setHttpPar(ontologyTypePar);
				String baseuri = setHttpPar(baseuriPar);
				String ontmanager = setHttpPar(ontmanagerPar);
				String projectType = setHttpPar(projectTypePar);
				checkRequestParametersAllNotNull(projectNamePar, baseuriPar, ontmanagerPar, projectTypePar);
				return newEmptyProject(projectName, ontologyType, baseuri, ontmanager, projectType);
			}

			else if (request.equals(Req.createNewProjectFromFileRequest)) {
				String projectName = setHttpPar(projectNamePar);
				String ontologyType = setHttpPar(ontologyTypePar); // not checked for existence
				String baseuri = setHttpPar(baseuriPar);
				String ontmanager = setHttpPar(ontmanagerPar);
				String projectType = setHttpPar(projectTypePar);
				String ontFile = setHttpPar(ontFilePar);
				checkRequestParametersAllNotNull(projectNamePar, baseuriPar, ontmanagerPar, projectTypePar,
						ontFilePar);
				return newProjectFromFile(projectName, ontologyType, baseuri, ontmanager, projectType,
						ontFile);
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

			else if (request.equals(Req.getCurrentProjectRequest)) {
				return getCurrentProject();
			}

			else
				return servletUtilities.createNoSuchHandlerExceptionResponse(request);
		} catch (HTTPParameterUnspecifiedException e) {
			return servletUtilities.createUndefinedHttpParameterExceptionResponse(request, e);
		}
	}

	public Response getCurrentProject() {
		String request = Req.getCurrentProjectRequest;
		Project<? extends RDFModel> proj = ProjectManager.getCurrentProject();
		XMLResponseREPLY resp = servletUtilities.createReplyResponse(request, RepliesStatus.ok);
		Element dataElem = resp.getDataElement();

		String projName = proj.getName();
		if (projName == null) {
			Element projElem = XMLHelp.newElement(dataElem, projectTag);
			projElem.setAttribute("exists", "false");
		} else {
			Element projElem = XMLHelp.newElement(dataElem, projectTag, projName);
			projElem.setAttribute("exists", "true");
		}
		return resp;
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
						projElem.setAttribute(ontoTypeAttr, ((Project) proj).getModelType().getName());
						projElem.setAttribute(statusAttr, "ok");
					} catch (DOMException e) {
						projElem.setAttribute(statusAttr, "error");
						projElem.setAttribute(statusMsgAttr, "unrecognized ontology type");
					} catch (ProjectInconsistentException e) {
						projElem.setAttribute(statusAttr, "error");
						projElem.setAttribute(statusMsgAttr, "unrecognized ontology type");
					}
					projElem.setAttribute(ontMgrAttr, ((Project) proj).getOntologyManagerImplID());
					projElem.setAttribute(typeAttr, ((Project) proj).getType());
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
	 * opens the main project of Semantic Turkey
	 * 
	 * @return
	 */
	public Response openMainProject() {

		String request = Req.openMainProjectRequest;
		logger.info("requested to open main project");

		try {
			ProjectManager.openMainProject();
		} catch (ProjectCreationException e) {
			logger.error("", e);
			return ServletUtilities.getService().createExceptionResponse(request, e.toString());
		} catch (ProjectInexistentException e) {
			logger.error("", e);
			return ServletUtilities.getService().createExceptionResponse(request, e.toString());
		}

		return ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);
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
			ProjectManager.openProject(projectName);
		} catch (Exception e) {
			logger.error(e.getMessage());
			e.printStackTrace(System.err);
			return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
		}

		return ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);
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

		String request = Req.saveProjectAsRequest;
		logger.info("requested to save current project as project: " + newProjectName);

		if (newProjectName.equals(ProjectManager.mainProjectName)) {
			return servletUtilities.createReplyFAIL(request, "cannot save as the main project");
		}

		if (ProjectManager.existsProject(newProjectName)) {
			return servletUtilities
					.createReplyFAIL(request, "project " + newProjectName + " already exists!");
		}

		if (!ProjectManager.validProjectName(newProjectName)) {
			return servletUtilities.createReplyFAIL(request, "name " + newProjectName
					+ " is not a valid name for a project");
		}

		String projectName = ProjectManager.getCurrentProject().getName();
		try {
			ProjectManager.closeCurrentProject();
			ProjectManager.cloneProjectToNewProject(projectName, newProjectName);
			ProjectManager.openProject(newProjectName);
		} catch (ModelUpdateException e) {
			return prepareForException(request, e);
		} catch (InvalidProjectNameException e) {
			return prepareForException(request, e);
		} catch (DuplicatedResourceException e) {
			return prepareForException(request, e);
		} catch (IOException e) {
			return prepareForException(request, e);
		} catch (UnavailableResourceException e) {
			return prepareForException(request, e);
		} catch (ProjectAccessException e) {
			return prepareForException(request, e);
		}

		return ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);
	}

	private Response prepareForException(String request, Exception e) {
		logger.error(e.toString());
		e.printStackTrace(System.err);
		return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
	}

	@SuppressWarnings("unused")
	private Response prepareForException(String request, Exception e, String msg) {
		logger.error(e.toString());
		e.printStackTrace(System.err);
		return ServletUtilities.getService().createExceptionResponse(request, msg);
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
			String ontmanager, String projectType) {

		String request = Req.createNewProjectRequest;
		logger.info("requested to create new project with name:  " + projectName);
		logger.info("project type:  " + projectType);
		logger.debug("ontologyType: " + ontologyType);
		try {
			Class<? extends RDFModel> modelType = ModelTypeRegistry.getModelClass(ontologyType);
			ProjectManager.createProject(projectName, modelType, baseuri, ontmanager, ProjectType
					.valueOf(projectType));
		} catch (InvalidProjectNameException e) {
			logger.error(e.getMessage());
			return servletUtilities.createExceptionResponse(request, e.toString());
		} catch (RuntimeException e) {
			logger.error(Utilities.printFullStackTrace(e));
			recoverFromFailedProjectCreation(request, projectName, "");
			throw e;
		} catch (DuplicatedResourceException e) {
			logger.error(e.getMessage());
			// if the project already existed, it does need to be deleted!!!
			return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
		} catch (Exception e) {
			logger.error("exception when creating a new empty project: " + e + "\nexception type: "
					+ e.getClass());
			logger.error(Utilities.printFullStackTrace(e));
			return recoverFromFailedProjectCreation(request, projectName, e.getMessage());
		}

		return ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);
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
			String ontmanager, String projectType, String file) {

		String request = Req.createNewProjectFromFileRequest;
		logger.info("requested to create new project with name:  " + projectName + " from file: " + file);
		logger.info("project type:  " + projectType);

		try {
			File ontFileToImport = new File(file);
			Class<? extends RDFModel> modelType;
			if (ontologyType != null)
				modelType = OWLModel.class;
			else
				modelType = ModelTypeRegistry.getModelClass(ontologyType);

			ProjectManager.createProject(projectName, modelType, baseuri, ontmanager, ProjectType
					.valueOf(projectType));
			logger.info("project: " + projectName + " created, importing rdf data from file: " + file);
			ProjectManager.getCurrentProject().getOntModel().addRDF(ontFileToImport, baseuri,
					RDFFormat.guessRDFFormatFromFile(ontFileToImport), NodeFilters.MAINGRAPH);
			// RDFFormat.RDFXML, NodeFilters.MAINGRAPH);
			logger.info("rdf data imported from file: " + file);

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

		return ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);
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
		String request = Req.getProjectPropertyRequest;
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
				e.printStackTrace();
				logger.error("" + e);
				return servletUtilities.createExceptionResponse(request, e.toString());
			}

		XMLResponseREPLY resp = servletUtilities.createReplyResponse(request, RepliesStatus.ok);
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
}
