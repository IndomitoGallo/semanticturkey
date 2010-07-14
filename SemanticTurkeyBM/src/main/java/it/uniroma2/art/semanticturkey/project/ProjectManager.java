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
 * The Original Code is Semantic Turkey.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2009.
 * All Rights Reserved.
 *
 * Semantic Turkey was developed by the Artificial Intelligence Research Group
 * (art.uniroma2.it) at the University of Roma Tor Vergata
 * Current information about Semantic Turkey can be obtained at 
 * http://semanticturkey.uniroma2.it
 *
 */

/*
 * Contributor(s): Armando Stellato stellato@info.uniroma2.it
 */
package it.uniroma2.art.semanticturkey.project;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.exceptions.ModelCreationException;
import it.uniroma2.art.owlart.exceptions.ModelUpdateException;
import it.uniroma2.art.owlart.exceptions.UnavailableResourceException;
import it.uniroma2.art.owlart.exceptions.UnsupportedRDFFormatException;
import it.uniroma2.art.owlart.io.RDFFormat;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.utilities.ModelUtilities;
import it.uniroma2.art.semanticturkey.exceptions.DuplicatedResourceException;
import it.uniroma2.art.semanticturkey.exceptions.InvalidProjectNameException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectAccessException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectCreationException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectDeletionException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectIncompatibleException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectInconsistentException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectInexistentException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectUpdateException;
import it.uniroma2.art.semanticturkey.ontology.NSPrefixMappings;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.utilities.Utilities;

import java.io.BufferedOutputStream;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.lang.instrument.IllegalClassFormatException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * a manager/factory class for creating new projects, for retrieving existing ones or for accessing the
 * currently loaded project
 * 
 * @author Armando Stellato
 */
public class ProjectManager {

	public static enum ProjectType {
		continuosEditing, saveToStore
	}

	public static final String triples_exchange_FileName = "ontology.nt";
	public static final String mainProjectName = "project-main";

	private static Project<? extends RDFModel> _currentProject;

	protected static Logger logger = LoggerFactory.getLogger(ProjectManager.class);

	public static Collection<AbstractProject> listProjects() throws ProjectAccessException {
		ArrayList<AbstractProject> projects = new ArrayList<AbstractProject>();
		List<File> projectDirs = null;
		try {
			projectDirs = Utilities.listDirectoryContentAsFiles(Resources.getProjectsDir(), false, true,
					false);
		} catch (IOException e) {
			throw new ProjectAccessException(e);
		}
		for (File projDir : projectDirs) {
			AbstractProject proj = null;
			try {
				proj = getProjectDescription(projDir.getName());
				// proj = new CorruptedProject(projDir.getName(), projDir, new Exception("pippo"));
			} catch (Exception e) {
				proj = new CorruptedProject(projDir.getName(), projDir, e);
			}

			projects.add(proj);
		}
		// tutte queste le devo riscrivere per produrre una descrizione di progetto corrotto
		// che andrò a creare come sottoclasse di Project
		return projects;
	}

	/**
	 * as for {@link #createProject(String, Class, String, String, String, ProjectType)} with defaultNamespace
	 * automatically assigned from the baseuri
	 * 
	 * @param projectName
	 * @param ontManagerID
	 * @return
	 * @throws DuplicatedResourceException
	 * @throws InvalidProjectNameException
	 * @throws ProjectCreationException
	 * @throws ProjectUpdateException
	 * @throws ProjectInconsistentException
	 */
	public static <MODELTYPE extends RDFModel> Project<MODELTYPE> createProject(String projectName,
			Class<MODELTYPE> modelType, String baseURI, String ontManagerID, ProjectType type)
			throws DuplicatedResourceException, InvalidProjectNameException, ProjectCreationException,
			ProjectInconsistentException, ProjectUpdateException {
		return createProject(projectName, modelType, baseURI, ModelUtilities
				.createDefaultNamespaceFromBaseURI(baseURI), ontManagerID, type);
	}

	/**
	 * as for {@link #createProject(String, Class, File, String, String, String, ProjectType)} but the
	 * directory of the project bears the name of the project itself. You should normally use this method to
	 * create new projects which are expected to be found by the main system
	 * 
	 * @param projectName
	 * @param ontManagerID
	 * @return
	 * @throws DuplicatedResourceException
	 * @throws InvalidProjectNameException
	 * @throws ProjectCreationException
	 * @throws ProjectUpdateException
	 * @throws ProjectInconsistentException
	 */
	public static <MODELTYPE extends RDFModel> Project<MODELTYPE> createProject(String projectName,
			Class<MODELTYPE> modelType, String baseURI, String defaultNamespace, String ontManagerID,
			ProjectType type) throws DuplicatedResourceException, InvalidProjectNameException,
			ProjectCreationException, ProjectInconsistentException, ProjectUpdateException {
		if (!validProjectName(projectName)) {
			logger.error("invalid project name: " + projectName);
			throw new InvalidProjectNameException(projectName);
		}
		File projectDir = new File(Resources.getProjectsDir(), projectName);
		return createProject(projectName, modelType, projectDir, baseURI, defaultNamespace, ontManagerID,
				type);
	}

	/**
	 * creates a new Project. The project is installed in the projects directory, which is located inside the
	 * SemanticTurkeyData directory of your Firefox profile. This method sets up all the necessary files which
	 * characterize projects and then generates a new instance on the initialized folder
	 * <p>
	 * <em>Note: by using this method you may create projects in any place in the file system, and Semantic
	 * Turkey won't be able to localize them. For this reason, it should only be used by Semantic Turkey
	 * extensions which are adopting a new project folder, providing also dedicated API to access/manage its
	 * projects.<br/>
	 * use {@link #createProject(String, String, String, ProjectType)} or {@link #createProject(String, String,
	 * String, String, ProjectType)} to create a new project</em>
	 * </p>
	 * 
	 * @param projectName
	 * @return the created project
	 * @throws DuplicatedResourceException
	 *             thrown when attempting to build a new project with the same name of an existing one
	 * @throws InvalidProjectNameException
	 *             if the project name cannot be used to create a directory
	 * @throws ProjectCreationException
	 *             any other exception occurring while creating the project
	 * @throws ProjectUpdateException
	 * @throws ProjectInconsistentException
	 */
	public static <MODELTYPE extends RDFModel> Project<MODELTYPE> createProject(String projectName,
			Class<MODELTYPE> modelType, File projectDir, String baseURI, String defaultNamespace,
			String ontManagerID, ProjectType type) throws DuplicatedResourceException,
			InvalidProjectNameException, ProjectCreationException, ProjectInconsistentException,
			ProjectUpdateException {

		prepareProjectFiles(projectName, modelType, projectDir, baseURI, defaultNamespace, ontManagerID, type);

		return activateProjectFromDir(projectName, projectDir, ontManagerID, type);

	}

	private static <MODELTYPE extends RDFModel> void prepareProjectFiles(String projectName,
			Class<MODELTYPE> modelType, File projectDir, String baseURI, String defaultNamespace,
			String ontManagerID, ProjectType type) throws DuplicatedResourceException,
			ProjectCreationException {
		if (projectDir.exists())
			throw new DuplicatedResourceException("project: " + projectName
					+ "already exists; choose a different project name for a new project");

		projectDir.mkdir();
		File storeDir = new File(projectDir, Project.PROJECT_STORE_DIR_NAME);
		storeDir.mkdir();
		File info_stp = new File(projectDir, Project.INFOFILENAME);
		try {
			// STP file containing properties for the loaded project
			logger.debug("creating project file: " + info_stp);
			info_stp.createNewFile();
			logger.debug("project file: " + info_stp + " created");
			// here we write directly on the file; once the project is loaded, it will be handled internally
			// as a property file
			BufferedWriter out = new BufferedWriter(new FileWriter(info_stp));
			out.write(Project.ONTOLOGY_MANAGER_ID_PROP + "=" + escape(ontManagerID) + "\n");
			out.write(Project.BASEURI_PROP + "=" + escape(baseURI) + "\n");
			out.write(Project.DEF_NS_PROP + "=" + escape(defaultNamespace) + "\n");
			out.write(Project.PROJECT_TYPE + "=" + type + "\n");
			out.write(Project.PROJECT_MODEL_TYPE + "=" + modelType.getName() + "\n");
			out.write(Project.PROJECT_NAME_PROP + "=" + projectName + "\n");
			out.close();

			// Prefix Mapping file creation
			File prefixMappingFile = new File(projectDir, NSPrefixMappings.prefixMappingFileName);
			prefixMappingFile.createNewFile();

			logger.debug("all project info have been built");

		} catch (IOException e) {
			Utilities.deleteDir(projectDir); // if something fails, deletes everything
			logger.debug("directory: " + info_stp + " deleted due to project creation fail");
			throw new ProjectCreationException(e);
		}
	}

	private static <MODELTYPE extends RDFModel> Project<MODELTYPE> activateProjectFromDir(String projectName,
			File projectDir, String ontManagerID, ProjectType type) throws ProjectCreationException,
			ProjectInconsistentException, ProjectUpdateException {
		try {
			Project<MODELTYPE> proj;
			if (type == ProjectType.continuosEditing)
				proj = new PersistentStoreProject<MODELTYPE>(projectName, projectDir);
			else
				proj = new SaveToStoreProject<MODELTYPE>(projectName, projectDir);
			logger.debug("project " + projectName + " initialized as a " + type + " project");
			proj.activate();
			logger.debug("project " + projectName + " activated");
			confirmProject(proj);
			logger.debug("project : " + projectName + " created");
			return proj;

		} catch (ModelCreationException e) {
			Utilities.deleteDir(projectDir);
			throw new ProjectCreationException(e);
		} catch (ProjectIncompatibleException e) {
			Utilities.deleteDir(projectDir);
			throw new ProjectCreationException(
					"it is not possible to create a project with OntologyManager: " + ontManagerID
							+ "because no bundle with such ID has been loaded by OSGi");
		}
	}

	/**
	 * this method creates the main project, which is located in a dedicated folder out of the standard
	 * project folder
	 * 
	 * @param baseURI
	 * @param defaultNamespace
	 * @param ontManagerID
	 * @return
	 * @throws ProjectInconsistentException
	 * @throws ProjectUpdateException
	 */
	public static Project<OWLModel> createMainProject(String baseURI, String defaultNamespace,
			String ontManagerID) throws ProjectInconsistentException, ProjectUpdateException {

		try {
			return createProject(Resources.mainProjectName, OWLModel.class, Resources.getMainProjectDir(),
					baseURI, defaultNamespace, ontManagerID, ProjectType.continuosEditing);
		} catch (DuplicatedResourceException e) {
			throw new ProjectInconsistentException(
					"inconsistent load of main project: reported error is an attempt to overwrite the main project, but this should never happen\n"
							+ e);
		} catch (InvalidProjectNameException e) {
			throw new ProjectInconsistentException("inconsistent load of main project, reason:\n"
					+ e.getMessage());
		} catch (ProjectCreationException e) {
			throw new ProjectInconsistentException("inconsistent load of main project, reason:\n"
					+ e.getMessage());
		}

	}

	/**
	 * opens an already created project, with name <code>projectName</code>
	 * 
	 * @param projectName
	 * @return
	 * @throws ProjectAccessException
	 * @throws ProjectAccessException
	 */
	public static Project<? extends RDFModel> openProject(String projectName) throws ProjectAccessException {
		Project<? extends RDFModel> proj;
		try {
			proj = getProjectDescription(projectName);
			proj.activate();
			confirmProject(proj);
			return proj;
		} catch (Exception e) {
			throw new ProjectAccessException(e);
		}
	}

	/**
	 * this method opens the main project, which is used in continuous editing mode, that is: it is
	 * automatically loaded when Semantic Turkey is being activated
	 * 
	 * @return
	 * @throws ProjectInexistentException
	 * @throws ProjectCreationException
	 */
	public static Project<OWLModel> openMainProject() throws ProjectCreationException,
			ProjectInexistentException {
		logger.debug("opening main project");
		File projectDir = Resources.getMainProjectDir();
		if (!projectDir.exists())
			throw new ProjectInexistentException("the directory for the main project does not exist");
		Project<OWLModel> proj = new PersistentStoreProject<OWLModel>(Resources.mainProjectName, Resources
				.getMainProjectDir());
		confirmProject(proj);
		try {
			proj.activate();
		} catch (ProjectIncompatibleException e) {
			throw new ProjectCreationException(e);
		} catch (ProjectInconsistentException e) {
			throw new ProjectCreationException(e);
		} catch (ModelCreationException e) {
			throw new ProjectCreationException(e);
		} catch (ProjectUpdateException e) {
			throw new ProjectCreationException(e);
		}
		return proj;
	}

	private static <MODELTYPE extends RDFModel> void confirmProject(Project<MODELTYPE> proj) {
		_currentProject = proj;
	}

	/**
	 * gets the currently loaded project
	 * 
	 * @return
	 */
	public static Project<? extends RDFModel> getCurrentProject() {
		return _currentProject;
	}

	public static boolean existsProject(String projectName) {
		File projectDir = getProjectDir(projectName);
		return (projectDir.exists());
	}

	/**
	 * this method copies a project to another location. You need to assure that <code>projectName</code> is
	 * not the name of the project currently being loaded
	 * 
	 * @param projectName
	 * @param newProjectName
	 * @throws InvalidProjectNameException
	 * @throws DuplicatedResourceException
	 * @throws IOException
	 * @throws UnavailableResourceException
	 */
	public static void cloneProjectToNewProject(String projectName, String newProjectName)
			throws InvalidProjectNameException, DuplicatedResourceException, IOException,
			UnavailableResourceException {

		logger.debug("cloning project: " + projectName + " to project: " + newProjectName);

		if (!validProjectName(newProjectName))
			throw new InvalidProjectNameException(projectName);

		File oldProjectDir = getProjectDir(projectName);
		File newProjectDir = getProjectDir(newProjectName);

		if (!oldProjectDir.exists())
			throw new UnavailableResourceException("project: " + projectName + " does not exists!");

		if (newProjectDir.exists())
			throw new DuplicatedResourceException("project: " + projectName
					+ "already exists; choose a different project name for a new project");

		Utilities.recursiveCopy(oldProjectDir, newProjectDir);
		setProjectProperty(newProjectName, Project.PROJECT_NAME_PROP, newProjectName);
	}

	/**
	 * returns the directory of a project given its name. This is based on the assumption that the project
	 * directory is assigned on the basis of project's name (as done by the ProjectManager).<br/>
	 * <em>Note that this method does not guarantees that the project dir (and thus the project) exists</em>
	 * 
	 * @param projectName
	 * @return
	 */
	public static File getProjectDir(String projectName) {
		if (projectName.equals(mainProjectName))
			return Resources.getMainProjectDir();
		else
			return new File(Resources.getProjectsDir(), projectName);
	}

	public static void deleteProject(String projectName) throws ProjectDeletionException {
		File projectDir = new File(Resources.getProjectsDir(), projectName);
		if (!projectDir.exists())
			throw new IllegalAccessError("project: " + projectName + " does not exist; cannot delete it");
		if (_currentProject != null && _currentProject.getName().equals(projectName))
			throw new ProjectDeletionException("cannot delete a project while it is loaded");
		if (!Utilities.deleteDir(projectDir))
			throw new ProjectDeletionException("unable to delete project: " + projectName);
	}

	public static void closeCurrentProject() throws ModelUpdateException {
		_currentProject.getOntModel().close();
		_currentProject = null;
	}

	public static void exportCurrentProject(File semTurkeyProjectFile) throws IOException,
			ModelAccessException, UnsupportedRDFFormatException {
		File tempDir = Resources.createTempDir();
		Utilities.copy(_currentProject.infoSTPFile, new File(tempDir, _currentProject.infoSTPFile.getName()));
		Utilities.copy(_currentProject.nsPrefixMappingsPersistence.getFile(), new File(tempDir,
				_currentProject.nsPrefixMappingsPersistence.getFile().getName()));
		_currentProject.ontManager.writeRDFOnFile(new File(tempDir, triples_exchange_FileName),
				RDFFormat.NTRIPLES);
		Utilities
				.createZipFile(tempDir, semTurkeyProjectFile, false, true, "Semantic Turkey Project Archive");
		tempDir.delete();
		tempDir.deleteOnExit();
	}

	public static void importProject(File semTurkeyProjectFile, String name) throws IOException,
			ModelAccessException, UnsupportedRDFFormatException, ProjectCreationException,
			DuplicatedResourceException, ProjectInconsistentException, ProjectUpdateException,
			ModelUpdateException {
		File tempDir = Resources.createTempDir();
		Utilities.unZip(semTurkeyProjectFile.getPath(), tempDir);

		File infoSTPFile = new File(tempDir, Project.INFOFILENAME);
		Properties stp_properties = new Properties();
		stp_properties.load(new FileInputStream(infoSTPFile));
		if (name == null)
			name = stp_properties.getProperty(Project.PROJECT_NAME_PROP);
		File newProjDir = new File(Resources.getProjectsDir(), name);
		if (newProjDir.exists())
			throw new DuplicatedResourceException("project with name: " + name
					+ " already exists, please choose another name for the imported project");
		else if (!newProjDir.mkdirs())
			throw new ProjectCreationException("unable to create project with name: " + name);
		Utilities.copy(infoSTPFile, new File(newProjDir, infoSTPFile.getName()));
		Utilities.copy(new File(tempDir, NSPrefixMappings.prefixMappingFileName), new File(newProjDir,
				NSPrefixMappings.prefixMappingFileName));

		ProjectType projectType = ProjectType.valueOf(stp_properties.getProperty(Project.PROJECT_TYPE));
		String ontManagerID = stp_properties.getProperty(Project.ONTOLOGY_MANAGER_ID_PROP);

		logger.info("type: " + projectType);

		File storeDir = new File(newProjDir, Project.PROJECT_STORE_DIR_NAME);
		storeDir.mkdir();

		/*
		 * String modelTypeString = stp_properties.getProperty(Project.PROJECT_MODEL_TYPE); try { Class<?
		 * extends RDFModel> modelType = deserializeModelType(modelTypeString); } catch
		 * (ClassNotFoundException e) { throw new ProjectInconsistentException(e); } catch
		 * (IllegalClassFormatException e) { throw new ProjectInconsistentException(e); }
		 */

		Project<? extends RDFModel> newProj = activateProjectFromDir(name, newProjDir, ontManagerID,
				projectType);
		newProj.setName(name);

		newProj.ontManager.loadOntologyData(new File(tempDir, triples_exchange_FileName), newProj
				.getBaseURI(), RDFFormat.NTRIPLES);

		tempDir.delete();
		tempDir.deleteOnExit();

		/*
		 * Utilities.copy(_currentProject.infoSTPFile, new File(tempDir,
		 * _currentProject.infoSTPFile.getName()));
		 * Utilities.copy(_currentProject.nsPrefixMappingsPersistence.getFile(), new File(tempDir,
		 * _currentProject.nsPrefixMappingsPersistence.getFile().getName()));
		 * _currentProject.ontManager.writeRDFOnFile(new File(tempDir, "ontology.nt"), RDFFormat.NTRIPLES);
		 * Utilities.createZipFile(tempDir, semTurkeyProjectFile, false, true,
		 * "Semantic Turkey Project Archive"); tempDir.delete();
		 */
	}

	public static <MODELTYPE extends RDFModel> Project<MODELTYPE> getProjectDescription(String projectName)
			throws InvalidProjectNameException, ProjectInexistentException, ProjectAccessException {
		logger.info("opening project: " + projectName);
		if (!validProjectName(projectName))
			throw new InvalidProjectNameException();
		File projectDir = new File(Resources.getProjectsDir(), projectName);
		if (!projectDir.exists())
			throw new ProjectInexistentException("Project: " + " does not exist");
		Project<MODELTYPE> proj;

		ProjectType type;
		try {
			type = getProjectType(projectName);
			if (type == ProjectType.continuosEditing)
				proj = new PersistentStoreProject<MODELTYPE>(projectName, projectDir);
			else
				proj = new SaveToStoreProject<MODELTYPE>(projectName, projectDir);
			logger.info("created project description for: " + proj);
			return proj;
		} catch (Exception e) {
			throw new ProjectAccessException(e);
		}
	}

	public static boolean validProjectName(String projectName) {
		logger.debug("checking if name: " + projectName + " is a valid project name");
		if (projectName.matches(".*[:\\\\/*?\"<>|].*"))
			return false;
		if (projectName.equals(mainProjectName))
			return false;
		logger.debug("name is valid");
		return true;
	}

	/**
	 * sets the value of the given property <code>property</code> for project with name
	 * <code>projectName</code>
	 * <p>
	 * use specific get methods for standard project properties; this method is left public to support
	 * customized properties defined over projects
	 * </p>
	 * 
	 * @param projectName
	 * @param property
	 * @param propValue
	 * @return
	 * @throws IOException
	 */
	public static void setProjectProperty(String projectName, String property, String propValue)
			throws IOException {
		logger.debug("setting property: " + property + " of project: " + projectName + " to value: "
				+ propValue);
		File projectDir = getProjectDir(projectName);
		logger.debug("projectDir: " + projectDir);
		File infoSTPFile = new File(projectDir, Project.INFOFILENAME);
		logger.debug("infoSTPFile: " + infoSTPFile);
		Properties stp_properties = new Properties();
		stp_properties.load(new FileInputStream(infoSTPFile));
		stp_properties.setProperty(property, propValue);
		stp_properties.store(new BufferedOutputStream(new FileOutputStream(infoSTPFile)), "");
	}

	/**
	 * gets the value of the given property <code>property</code> for project with name
	 * <code>projectName</code>
	 * <p>
	 * use specific get methods for standard project properties; this method is left public to support
	 * customized properties defined over projects
	 * </p>
	 * 
	 * @param projectName
	 * @param property
	 * @return
	 * @throws IOException
	 */
	public static String getProjectProperty(String projectName, String property) throws IOException {
		File projectDir = getProjectDir(projectName);
		File infoSTPFile = new File(projectDir, Project.INFOFILENAME);
		Properties stp_properties = new Properties();
		FileInputStream fis = new FileInputStream(infoSTPFile);
		stp_properties.load(fis);
		fis.close();
		return stp_properties.getProperty(property);
	}

	/**
	 * return the id of the project manager implementation adopted by project <code>projectName</code>
	 * 
	 * @param projectName
	 * @return
	 * @throws IOException
	 */
	public static String getProjectOntologyManagerID(String projectName) throws IOException {
		return getProjectProperty(projectName, Project.ONTOLOGY_MANAGER_ID_PROP);
	}

	/**
	 * gets the type fo the project. It is not applicable for the main project, which is anyway assumed to be
	 * always a {@link PersistentStoreProject}
	 * 
	 * @param projectName
	 * @return
	 * @throws IOException
	 * @throws FileNotFoundException
	 */
	public static ProjectType getProjectType(String projectName) throws IOException {
		String propValue = getProjectProperty(projectName, Project.PROJECT_TYPE);
		return Enum.valueOf(ProjectType.class, propValue);
	}

	/**
	 * gets the model type fo the project. It is not applicable for the main project, which is anyway assumed
	 * to be always a {@link OWLModel}
	 * 
	 * @param projectName
	 * @return
	 * @throws IOException
	 * @throws ClassNotFoundException
	 * @throws IllegalClassFormatException
	 * @throws FileNotFoundException
	 */
	// this warning is already checked through the "isAssignableFrom" "if test"
	public static Class<? extends RDFModel> getProjectModelType(String projectName) throws IOException,
			ClassNotFoundException, IllegalClassFormatException {
		String propValue = getProjectProperty(projectName, Project.PROJECT_MODEL_TYPE);
		return deserializeModelType(propValue);
	}

	@SuppressWarnings("unchecked")
	private static Class<? extends RDFModel> deserializeModelType(String modelTypeName)
			throws ClassNotFoundException, IllegalClassFormatException {
		Class<?> modelType = Class.forName(modelTypeName);
		// this should check that the returned model is a subclass of RDFModel
		if (RDFModel.class.isAssignableFrom(modelType))
			return (Class<? extends RDFModel>) modelType;
		else
			throw new IllegalClassFormatException(
					"ModelType assigned to this project is a legal java class, but is not a known RDFModel subclass");
	}

	/**
	 * gets the baseuri of the project with name <code>projectName</code>. Use {@link Project#getBaseURI()} if
	 * the project is currently loaded
	 * 
	 * @param projectName
	 * @return
	 * @throws IOException
	 */
	public static String getProjectBaseURI(String projectName) throws IOException {
		return getProjectProperty(projectName, Project.BASEURI_PROP);
	}

	/**
	 * gets the default namespace of the project with name <code>projectName</code>. Use
	 * {@link Project#getDefaultNamespace()} if the project is currently loaded
	 * 
	 * @param projectName
	 * @return
	 * @throws IOException
	 */
	public static String getProjectDefaultNamespace(String projectName) throws IOException {
		return getProjectProperty(projectName, Project.DEF_NS_PROP);
	}

	/**
	 * gets the timestamp of the project with name <code>projectName</code>. Use
	 * {@link Project#getTimeStamp()} if the project is currently loaded
	 * 
	 * @param projectName
	 * @return
	 * @throws IOException
	 */
	public static long getProjectTimeStamp(String projectName) throws IOException {
		String propValue = getProjectProperty(projectName, Project.TIMESTAMP_PROP);
		return Long.parseLong(propValue);
	}

	public static String escape(String in) {
		return saveConvert(in, false, false);
	}

	// the methods below come from the Property class in standard java distribution

	/*
	 * Converts unicodes to encoded &#92;uxxxx and escapes special characters with a preceding slash
	 */
	private static String saveConvert(String theString, boolean escapeSpace, boolean escapeUnicode) {
		int len = theString.length();
		int bufLen = len * 2;
		if (bufLen < 0) {
			bufLen = Integer.MAX_VALUE;
		}
		StringBuffer outBuffer = new StringBuffer(bufLen);

		for (int x = 0; x < len; x++) {
			char aChar = theString.charAt(x);
			// Handle common case first, selecting largest block that
			// avoids the specials below
			if ((aChar > 61) && (aChar < 127)) {
				if (aChar == '\\') {
					outBuffer.append('\\');
					outBuffer.append('\\');
					continue;
				}
				outBuffer.append(aChar);
				continue;
			}
			switch (aChar) {
			case ' ':
				if (x == 0 || escapeSpace)
					outBuffer.append('\\');
				outBuffer.append(' ');
				break;
			case '\t':
				outBuffer.append('\\');
				outBuffer.append('t');
				break;
			case '\n':
				outBuffer.append('\\');
				outBuffer.append('n');
				break;
			case '\r':
				outBuffer.append('\\');
				outBuffer.append('r');
				break;
			case '\f':
				outBuffer.append('\\');
				outBuffer.append('f');
				break;
			case '=': // Fall through
			case ':': // Fall through
			case '#': // Fall through
			case '!':
				outBuffer.append('\\');
				outBuffer.append(aChar);
				break;
			default:
				if (((aChar < 0x0020) || (aChar > 0x007e)) & escapeUnicode) {
					outBuffer.append('\\');
					outBuffer.append('u');
					outBuffer.append(toHex((aChar >> 12) & 0xF));
					outBuffer.append(toHex((aChar >> 8) & 0xF));
					outBuffer.append(toHex((aChar >> 4) & 0xF));
					outBuffer.append(toHex(aChar & 0xF));
				} else {
					outBuffer.append(aChar);
				}
			}
		}
		return outBuffer.toString();
	}

	/**
	 * Convert a nibble to a hex character
	 * 
	 * @param nibble
	 *            the nibble to convert.
	 */
	private static char toHex(int nibble) {
		return hexDigit[(nibble & 0xF)];
	}

	/** A table of hex digits */
	private static final char[] hexDigit = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C',
			'D', 'E', 'F' };

}
