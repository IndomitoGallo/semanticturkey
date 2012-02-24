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
import it.uniroma2.art.owlart.models.UnloadableModelConfigurationException;
import it.uniroma2.art.owlart.models.UnsupportedModelConfigurationException;
import it.uniroma2.art.owlart.models.conf.ModelConfiguration;
import it.uniroma2.art.owlart.models.conf.PersistenceModelConfiguration;
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
import it.uniroma2.art.semanticturkey.ontology.OntologyManagerFactory;
import it.uniroma2.art.semanticturkey.plugin.PluginManager;
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
import java.util.Date;
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

	/**
	 * provides the lists of available projects (stored in the projects directory of Semantic Turkey)
	 * 
	 * @return
	 * @throws ProjectAccessException
	 */
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
			} catch (Exception e) {
				proj = new CorruptedProject(projDir.getName(), projDir, e);
			}

			projects.add(proj);
		}

		return projects;
	}

	/**
	 * a shortcut for {@link #createProject(String, Class, String, String, String, String, Properties)} with
	 * defaultNamespace automatically assigned from the baseuri
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
			Class<MODELTYPE> modelType, String baseURI, String ontManagerFactoryID,
			String modelConfigurationClass, Properties modelConfiguration)
			throws DuplicatedResourceException, InvalidProjectNameException, ProjectCreationException,
			ProjectInconsistentException, ProjectUpdateException {
		return createProject(projectName, modelType, baseURI, ModelUtilities
				.createDefaultNamespaceFromBaseURI(baseURI), ontManagerFactoryID, modelConfigurationClass,
				modelConfiguration);
	}

	/**
	 * as for {@link #createProject(String, Class, File, String, String, String, String, Properties)} but the
	 * directory of the project bears the name of the project itself and is located inside the
	 * SemanticTurkeyData directory of your Firefox profile. You should normally use this method to create new
	 * projects which are expected to be found by the main system
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
			Class<MODELTYPE> modelType, String baseURI, String defaultNamespace, String ontManagerFactoryID,
			String modelConfigurationClass, Properties modelConfiguration)
			throws DuplicatedResourceException, InvalidProjectNameException, ProjectCreationException,
			ProjectInconsistentException, ProjectUpdateException {

		File projectDir = resolveProjectNameToDir(projectName);

		return createProject(projectName, modelType, projectDir, baseURI, defaultNamespace,
				ontManagerFactoryID, modelConfigurationClass, modelConfiguration);
	}

	/**
	 * This method sets up all the necessary files which characterize projects and then generates a new
	 * instance on the initialized folder
	 * <p>
	 * <em>Note: by using this method you may create projects in any place in the file system, and Semantic
	 * Turkey won't be able to localize them. For this reason, it should only be used by Semantic Turkey
	 * extensions which are adopting a new project folder, providing also dedicated API to access/manage its
	 * projects.<br/>
	 * use {@link #createProject(String, Class, String, String, String, Properties)} or
	 * {@link #createProject(String, Class, String, String, String, String, Properties)}
	 * to create a new project</em>
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
	 * @throws DuplicatedResourceException
	 * @throws ProjectUpdateException
	 * @throws ProjectInconsistentException
	 */
	public static <MODELTYPE extends RDFModel> Project<MODELTYPE> createProject(String projectName,
			Class<MODELTYPE> modelType, File projectDir, String baseURI, String defaultNamespace,
			String ontManagerFactoryID, String modelConfigurationClassName, Properties modelConfiguration)
			throws ProjectCreationException {

		try {
			logger.debug("creating project: " + projectName);
			OntologyManagerFactory<ModelConfiguration> ontMgrFact = PluginManager
					.getOntManagerImpl(ontManagerFactoryID);
			logger.debug("loaded ontMgrFactory: " + ontMgrFact);

			ModelConfiguration mConf = ontMgrFact.createModelConfigurationObject(modelConfigurationClassName);

			ProjectType projType;

			if ((mConf instanceof PersistenceModelConfiguration)
					&& ((PersistenceModelConfiguration) mConf).isPersistent()) {
				projType = ProjectType.continuosEditing;
			} else {
				projType = ProjectType.saveToStore;
			}

			logger.debug("building project directory");
			prepareProjectFiles(projectName, modelType, projectDir, baseURI, defaultNamespace,
					ontManagerFactoryID, modelConfigurationClassName, modelConfiguration, projType);

			logger.debug("activating project");
			return activateProject(projectName);

		} catch (UnsupportedModelConfigurationException e) {
			throw new ProjectCreationException(e);
		} catch (UnloadableModelConfigurationException e) {
			throw new ProjectCreationException(e);
		} catch (UnavailableResourceException e) {
			throw new ProjectCreationException(e);
		} catch (ClassNotFoundException e) {
			throw new ProjectCreationException(e);
		} catch (RuntimeException e) {
			e.printStackTrace(System.err);
			throw new ProjectCreationException("unforeseen runtime exception: " + e + ": " + e.getMessage());
		} catch (ProjectInconsistentException e) {
			throw new ProjectCreationException(e);
		} catch (ProjectUpdateException e) {
			throw new ProjectCreationException(e);
		} catch (InvalidProjectNameException e) {
			throw new ProjectCreationException(e);
		} catch (ProjectInexistentException e) {
			throw new ProjectCreationException(e);
		} catch (ProjectAccessException e) {
			throw new ProjectCreationException(e);
		} catch (DuplicatedResourceException e) {
			throw new ProjectCreationException(e);
		}
	}

	private static <MODELTYPE extends RDFModel> void prepareProjectFiles(String projectName,
			Class<MODELTYPE> modelType, File projectDir, String baseURI, String defaultNamespace,
			String ontManagerID, String modelConfigurationClass, Properties modelConfiguration,
			ProjectType type) throws DuplicatedResourceException, ProjectCreationException {
		if (projectDir.exists())
			throw new DuplicatedResourceException("project: " + projectName
					+ "already exists; choose a different project name for a new project");

		projectDir.mkdir();
		File storeDir = new File(projectDir, Project.PROJECT_STORE_DIR_NAME);
		storeDir.mkdir();
		File info_stp = new File(projectDir, Project.INFOFILENAME);
		try {
			// STP file containing properties for the loaded project
			logger.debug("creating project info file: " + info_stp);
			info_stp.createNewFile();
			logger.debug("project info file: " + info_stp + " created");
			// here we write directly on the file; once the project is loaded, it will be handled internally
			// as a property file
			BufferedWriter out = new BufferedWriter(new FileWriter(info_stp));
			out.write(Project.ONTOLOGY_MANAGER_ID_PROP + "=" + escape(ontManagerID) + "\n");
			out.write(Project.MODELCONFIG_ID + "=" + escape(modelConfigurationClass) + "\n");
			out.write(Project.BASEURI_PROP + "=" + escape(baseURI) + "\n");
			out.write(Project.DEF_NS_PROP + "=" + escape(defaultNamespace) + "\n");
			out.write(Project.PROJECT_TYPE + "=" + type + "\n");
			out.write(Project.PROJECT_MODEL_TYPE + "=" + modelType.getName() + "\n");
			out.write(Project.PROJECT_NAME_PROP + "=" + projectName + "\n");
			out.write(Project.TIMESTAMP_PROP + "=" + Long.toString(new Date().getTime()));
			out.close();

			logger.debug("project creation: all project properties have been stored");

			// Prefix Mapping file creation
			File prefixMappingFile = new File(projectDir, NSPrefixMappings.prefixMappingFileName);
			prefixMappingFile.createNewFile();

			// Model COnfiguration file creation
			File modelConfigurationFile = new File(projectDir, Project.MODELCONFIG_FILENAME);
			modelConfigurationFile.createNewFile();

			FileWriter fw = new FileWriter(modelConfigurationFile);
			modelConfiguration.store(fw, "model configuration, initialized from project initialization");
			fw.close();

			logger.debug("all project info have been built");

		} catch (IOException e) {
			Utilities.deleteDir(projectDir); // if something fails, deletes everything
			logger.debug("directory: " + info_stp + " deleted due to project creation fail");
			throw new ProjectCreationException(e);
		}
	}

	private static <MODELTYPE extends RDFModel> Project<MODELTYPE> activateProject(String projectName)
			throws ProjectCreationException, ProjectInconsistentException, ProjectUpdateException,
			InvalidProjectNameException, ProjectInexistentException, ProjectAccessException,
			UnsupportedModelConfigurationException, UnloadableModelConfigurationException {
		Project<MODELTYPE> proj = getProjectDescription(projectName);

		try {
			logger.debug("project " + projectName + " initialized as a " + proj.getType() + " project");

			proj.activate();
			logger.debug("project " + projectName + " activated");

			confirmProject(proj);
			logger.debug("project : " + projectName + " created");

			return proj;

		} catch (ModelCreationException e) {
			Utilities.deleteDir(resolveProjectNameToDir(projectName));
			throw new ProjectCreationException(e);
		} catch (ProjectIncompatibleException e) {
			Utilities.deleteDir(resolveProjectNameToDir(projectName));
			throw new ProjectCreationException(
					"it is not possible to create a project with OntologyManager: " + "---"
							+ "because no bundle with such ID has been loaded by OSGi");
		} catch (UnavailableResourceException e) {
			throw new ProjectCreationException(e);
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
			String ontManagerID, String modelConfigurationClass, Properties configuration)
			throws ProjectInconsistentException, ProjectUpdateException {

		try {
			return createProject(Resources.mainProjectName, OWLModel.class, baseURI, defaultNamespace,
					ontManagerID, modelConfigurationClass, configuration);
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
	 * opens the main project
	 * 
	 * @return
	 * @throws ProjectAccessException
	 * @throws ProjectAccessException
	 * @throws ProjectInexistentException
	 */
	public static Project<? extends RDFModel> openMainProject() throws ProjectAccessException,
			ProjectInexistentException {
		return openProject(ProjectManager.mainProjectName);
	}

	/**
	 * opens an already created project, with name <code>projectName</code>
	 * 
	 * @param projectName
	 * @return
	 * @throws ProjectAccessException
	 * @throws ProjectAccessException
	 * @throws ProjectInexistentException
	 */
	public static Project<? extends RDFModel> openProject(String projectName) throws ProjectAccessException,
			ProjectInexistentException {
		try {
			return activateProject(projectName);
		} catch (ProjectCreationException e) {
			throw new ProjectAccessException(e);
		} catch (ProjectInconsistentException e) {
			throw new ProjectAccessException(e);
		} catch (ProjectUpdateException e) {
			throw new ProjectAccessException(e);
		} catch (InvalidProjectNameException e) {
			throw new ProjectAccessException(e);
		} catch (UnsupportedModelConfigurationException e) {
			throw new ProjectAccessException(e);
		} catch (UnloadableModelConfigurationException e) {
			throw new ProjectAccessException(e);
		}
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

	public static boolean existsProject(String projectName) throws InvalidProjectNameException {
		File projectDir = resolveProjectNameToDir(projectName);
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
	 * @throws ProjectInexistentException
	 */
	public static void cloneProjectToNewProject(String projectName, String newProjectName)
			throws InvalidProjectNameException, DuplicatedResourceException, IOException,
			UnavailableResourceException, ProjectInexistentException {

		logger.debug("cloning project: " + projectName + " to project: " + newProjectName);

		if (!validProjectName(newProjectName))
			throw new InvalidProjectNameException(projectName);

		File oldProjectDir = getProjectDir(projectName);
		File newProjectDir = resolveProjectNameToDir(newProjectName);

		if (newProjectDir.exists())
			throw new DuplicatedResourceException("project: " + projectName
					+ "already exists; choose a different project name for a new project");

		Utilities.recursiveCopy(oldProjectDir, newProjectDir);
		setProjectProperty(newProjectName, Project.PROJECT_NAME_PROP, newProjectName);
	}

	/**
	 * This method:
	 * <ul>
	 * <li>invokes {@link #resolveProjectNameToDir(String)} and gets the project dir associated to that name</li>
	 * <li>returns the directory if the project exists, otherwise throws a {@link ProjectInexistentException}</li>
	 * </ul>
	 * 
	 * @param projectName
	 * @return
	 * @throws InvalidProjectNameException
	 * @throws ProjectInexistentException
	 */
	public static File getProjectDir(String projectName) throws InvalidProjectNameException,
			ProjectInexistentException {
		File projectDir = resolveProjectNameToDir(projectName);
		if (!projectDir.exists())
			throw new ProjectInexistentException("Project: " + " does not exist");
		return projectDir;
	}

	/**
	 * returns the directory of a project given its name. This is based on the assumption that the project
	 * directory is assigned on the basis of project's name (as done by the ProjectManager).<br/>
	 * <em>Note that this method does not guarantees that the project dir (and thus the project) exists</em>
	 * 
	 * @param projectName
	 * @return
	 * @throws InvalidProjectNameException
	 */
	public static File resolveProjectNameToDir(String projectName) throws InvalidProjectNameException {
		if (!validProjectName(projectName))
			throw new InvalidProjectNameException();
		if (projectName.equals(mainProjectName))
			return Resources.getMainProjectDir();
		else
			return new File(Resources.getProjectsDir(), projectName);
	}

	public static void deleteProject(String projectName) throws ProjectDeletionException {
		File projectDir;
		try {
			projectDir = getProjectDir(projectName);
		} catch (InvalidProjectNameException e) {
			throw new ProjectDeletionException("project name: " + projectName + " is not a valid name; cannot delete that project");
		} catch (ProjectInexistentException e) {
			throw new ProjectDeletionException("project: " + projectName + " does not exist; cannot delete it");
		}
			
		if (_currentProject != null && _currentProject.getName().equals(projectName))
			throw new ProjectDeletionException("cannot delete a project while it is loaded");
		if (!Utilities.deleteDir(projectDir))
			throw new ProjectDeletionException("unable to delete project: " + projectName);
	}

	public static void closeCurrentProject() throws ModelUpdateException {
		logger.debug("closing current project: " + _currentProject.getName());
		_currentProject.getOntModel().close();
		_currentProject = null;
	}

	public static void exportCurrentProject(File semTurkeyProjectFile) throws IOException,
			ModelAccessException, UnsupportedRDFFormatException {
		File tempDir = Resources.createTempDir();
		Utilities.copy(_currentProject.infoSTPFile, new File(tempDir, _currentProject.infoSTPFile.getName()));
		Utilities.copy(_currentProject.nsPrefixMappingsPersistence.getFile(), new File(tempDir,
				_currentProject.nsPrefixMappingsPersistence.getFile().getName()));
		Utilities.copy(_currentProject.modelConfigFile, new File(tempDir, _currentProject.modelConfigFile
				.getName()));
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
			ModelUpdateException, InvalidProjectNameException {
		File tempDir = Resources.createTempDir();
		Utilities.unZip(semTurkeyProjectFile.getPath(), tempDir);

		// change imported project name to newly created one
		File infoSTPFile = new File(tempDir, Project.INFOFILENAME);
		Properties stp_properties = new Properties();
		FileInputStream fis = new FileInputStream(infoSTPFile);
		stp_properties.load(fis);
		fis.close();
		if (name == null)
			name = stp_properties.getProperty(Project.PROJECT_NAME_PROP);

		// copy temporary unzipped project to new import position
		File newProjDir = new File(Resources.getProjectsDir(), name);
		if (newProjDir.exists())
			throw new DuplicatedResourceException("project with name: " + name
					+ " already exists, please choose another name for the imported project");
		else if (!newProjDir.mkdirs())
			throw new ProjectCreationException("unable to create project with name: " + name);

		// copying separate files from imported project into new one
		// TODO why not first copying the whole temp directory and then make changes?
		Utilities.copy(infoSTPFile, new File(newProjDir, infoSTPFile.getName()));
		Utilities.copy(new File(tempDir, NSPrefixMappings.prefixMappingFileName), new File(newProjDir,
				NSPrefixMappings.prefixMappingFileName));
		Utilities.copy(new File(tempDir, Project.MODELCONFIG_FILENAME), new File(newProjDir,
				Project.MODELCONFIG_FILENAME));

		// ProjectType projectType = ProjectType.valueOf(stp_properties.getProperty(Project.PROJECT_TYPE));
		// String ontManagerID = stp_properties.getProperty(Project.ONTOLOGY_MANAGER_ID_PROP);
		// logger.info("type: " + projectType);

		File storeDir = new File(newProjDir, Project.PROJECT_STORE_DIR_NAME);
		storeDir.mkdir();

		Project<? extends RDFModel> newProj;
		try {
			newProj = activateProject(name);
			newProj.setName(name);

			newProj.getOntologyManager().loadOntologyData(new File(tempDir, triples_exchange_FileName),
					newProj.getBaseURI(), RDFFormat.NTRIPLES);

			tempDir.delete();
			tempDir.deleteOnExit();
		} catch (ProjectInexistentException e) {
			throw new ProjectCreationException("Error while importing project from file: "
					+ semTurkeyProjectFile
					+ ". New project data should have been created while it is not; unable to load the it");
		} catch (ProjectAccessException e) {
			throw new ProjectCreationException("unable to access data from project: " + name
					+ " imported from file: " + semTurkeyProjectFile);
		} catch (UnsupportedModelConfigurationException e) {
			throw new ProjectCreationException(e);
		} catch (UnloadableModelConfigurationException e) {
			throw new ProjectCreationException(e);
		}

	}

	public static <MODELTYPE extends RDFModel> Project<MODELTYPE> getProjectDescription(String projectName)
			throws InvalidProjectNameException, ProjectInexistentException, ProjectAccessException {
		logger.info("opening project: " + projectName);

		File projectDir = getProjectDir(projectName);

		logger.debug("project dir: " + projectDir);

		Project<MODELTYPE> proj;

		ProjectType type;
		try {
			type = getProjectType(projectName);
			logger.debug("project type:" + type);
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
	 * @throws InvalidProjectNameException
	 * @throws ProjectInexistentException
	 */
	public static void setProjectProperty(String projectName, String property, String propValue)
			throws IOException, InvalidProjectNameException, ProjectInexistentException {
		
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
	 * @throws InvalidProjectNameException
	 * @throws ProjectInexistentException
	 */
	public static String getProjectProperty(String projectName, String property) throws IOException,
			InvalidProjectNameException, ProjectInexistentException {
		File projectDir = getProjectDir(projectName);
		File infoSTPFile = new File(projectDir, Project.INFOFILENAME);
		Properties stp_properties = new Properties();
		FileInputStream fis = new FileInputStream(infoSTPFile);
		stp_properties.load(fis);
		fis.close();
		return stp_properties.getProperty(property);
	}

	/**
	 * as for {@link #getProjectProperty(String, String) but throws a {@link ProjectInconsistentException} if
	 * the property has a null value}
	 * 
	 * @param projectName
	 * @param property
	 * @return
	 * @throws ProjectInconsistentException
	 * @throws IOException
	 * @throws InvalidProjectNameException
	 * @throws ProjectInexistentException
	 */
	public static String getRequiredProjectProperty(String projectName, String property)
			throws ProjectInconsistentException, IOException, InvalidProjectNameException,
			ProjectInexistentException {
		String propValue = getProjectProperty(projectName, property);
		if (propValue != null)
			return propValue;
		else
			throw new ProjectInconsistentException("missing required " + property
					+ " value from description of project: " + projectName);
	}

	/**
	 * return the id of the project manager implementation adopted by project <code>projectName</code>
	 * 
	 * @param projectName
	 * @return
	 * @throws IOException
	 * @throws ProjectInexistentException
	 * @throws InvalidProjectNameException
	 * @throws ProjectInconsistentException
	 */
	public static String getProjectOntologyManagerID(String projectName) throws IOException,
			InvalidProjectNameException, ProjectInexistentException, ProjectInconsistentException {
		return getRequiredProjectProperty(projectName, Project.ONTOLOGY_MANAGER_ID_PROP);
	}

	/**
	 * gets the type fo the project. It is not applicable for the main project, which is anyway assumed to be
	 * always a {@link PersistentStoreProject}
	 * 
	 * @param projectName
	 * @return
	 * @throws IOException
	 * @throws ProjectInexistentException
	 * @throws InvalidProjectNameException
	 * @throws ProjectInconsistentException 
	 * @throws FileNotFoundException
	 */
	public static ProjectType getProjectType(String projectName) throws IOException,
			InvalidProjectNameException, ProjectInexistentException, ProjectInconsistentException {
		String propValue = getRequiredProjectProperty(projectName, Project.PROJECT_TYPE);
		return Enum.valueOf(ProjectType.class, propValue);
	}

	/**
	 * gets the model type for the project. It is not applicable for the main project, which is anyway assumed
	 * to be always a {@link OWLModel}
	 * 
	 * @param projectName
	 * @return
	 * @throws IOException
	 * @throws ClassNotFoundException
	 * @throws IllegalClassFormatException
	 * @throws ProjectInexistentException
	 * @throws InvalidProjectNameException
	 * @throws ProjectAccessException
	 * @throws ProjectInconsistentException 
	 * @throws FileNotFoundException
	 */
	// this warning is already checked through the "isAssignableFrom" "if test"
	public static Class<? extends RDFModel> getProjectModelType(String projectName)
			throws InvalidProjectNameException, ProjectInexistentException, ProjectAccessException, ProjectInconsistentException {
		try {
			String propValue = getRequiredProjectProperty(projectName, Project.PROJECT_MODEL_TYPE);
			return deserializeModelType(propValue);
		} catch (ClassNotFoundException e) {
			throw new ProjectAccessException("class for model type defined in project: " + projectName
					+ " is not available among current model classes");
		} catch (IllegalClassFormatException e) {
			throw new ProjectAccessException(e);
		} catch (IOException e) {
			throw new ProjectAccessException(e);
		}
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
	 * @throws ProjectInexistentException
	 * @throws InvalidProjectNameException
	 */
	public static String getProjectBaseURI(String projectName) throws IOException,
			InvalidProjectNameException, ProjectInexistentException {
		return getProjectProperty(projectName, Project.BASEURI_PROP);
	}

	/**
	 * gets the default namespace of the project with name <code>projectName</code>. Use
	 * {@link Project#getDefaultNamespace()} if the project is currently loaded
	 * 
	 * @param projectName
	 * @return
	 * @throws IOException
	 * @throws ProjectInexistentException
	 * @throws InvalidProjectNameException
	 */
	public static String getProjectDefaultNamespace(String projectName) throws IOException,
			InvalidProjectNameException, ProjectInexistentException {
		return getProjectProperty(projectName, Project.DEF_NS_PROP);
	}

	/**
	 * gets the timestamp of the project with name <code>projectName</code>. Use
	 * {@link Project#getTimeStamp()} if the project is currently loaded
	 * 
	 * @param projectName
	 * @return
	 * @throws ProjectInexistentException
	 * @throws InvalidProjectNameException
	 * @throws IOException
	 * @throws IOException
	 */
	public static long getProjectTimeStamp(String projectName) throws IOException,
			InvalidProjectNameException, ProjectInexistentException {
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
