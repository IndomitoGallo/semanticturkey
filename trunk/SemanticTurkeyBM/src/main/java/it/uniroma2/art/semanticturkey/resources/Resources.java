/*
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License");  you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
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
package it.uniroma2.art.semanticturkey.resources;

import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
import it.uniroma2.art.semanticturkey.utilities.Utilities;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author Armando Stellato
 * 
 */
public class Resources {

	private static final String _sourceUserDirectoryRelPath = "/components/data";
	private static String _sourceUserDirectoryPath;
	private static final String _userDirectorytRelPath = "/../../SemanticTurkeyData";
	private static String _userDirectoryPath;

	private static String _extensionPath;

	private static final String _ontLibraryDirLocalName = "ontlibrary";
	private static final String _ontTempDirLocalName = "ont-temp";
	private static final String _ontMirrorDirDefaultLocationLocalName = "ontologiesMirror";
	private static final String _projectsDirName = "projects";
	public static final String mainProjectName = "project-main";

	private static String _ontLibraryDir;

	private static String _ontTempDir;

	private static String _ontMirrorDirDefaultLocation;

	private static String _semTurkeyPropertyFile;
	private static String _annotOntologyFile;
	private static String _owlDefinitionFile;
	private static String _ontologiesMirrorFile;

	protected static Logger logger = LoggerFactory.getLogger(Resources.class);

	public static void initializeUserResources() throws STInitializationException {

		logger.info("initializing resources");
		logger.info("extension path: " + getExtensionPath());

		_sourceUserDirectoryPath = getExtensionPath() + _sourceUserDirectoryRelPath;
		logger.info("user directory template: " + _sourceUserDirectoryPath);

		_userDirectoryPath = getExtensionPath() + _userDirectorytRelPath;
		logger.info("user directory: " + _userDirectoryPath);

		_ontLibraryDir = _userDirectoryPath + "/" + _ontLibraryDirLocalName;
		_ontTempDir = _userDirectoryPath + "/" + _ontTempDirLocalName;
		_ontMirrorDirDefaultLocation = _userDirectoryPath + "/" + _ontMirrorDirDefaultLocationLocalName;
		_owlDefinitionFile = _ontLibraryDir + "/owl.rdfs";
		_annotOntologyFile = _ontLibraryDir + "/annotation.owl";
		_ontologiesMirrorFile = _userDirectoryPath + "/" + "OntologiesMirror.xml";
		_semTurkeyPropertyFile = _userDirectoryPath + "/" + "sturkey.properties";

		File userDirectory = new File(_userDirectoryPath);
		if (!userDirectory.exists()) {
			try {
				// first Copy Of User Resources
				Utilities.recursiveCopy(new File(_sourceUserDirectoryPath), new File(_userDirectoryPath));
				Config.initialize(_semTurkeyPropertyFile);
			} catch (IOException e) {
				throw new STInitializationException(
						"initial copy of Semantic Turkey resources failed during first install: "
								+ e.getMessage());
			}
		} else {
			try {
				Config.initialize(_semTurkeyPropertyFile);
				UpdateRoutines.startUpdatesCheckAndRepair();
			} catch (FileNotFoundException e) {
				throw new STInitializationException(
						"Semantic Turkey initilization failed: unable to find Semantic Turkey Configuration File: "
								+ _semTurkeyPropertyFile);
			} catch (IOException e) {
				throw new STInitializationException("Semantic Turkey initilization failed: " + e.getMessage());
			}

		}

		try {
			OntologiesMirror.setOntologiesMirrorRegistry(_ontologiesMirrorFile);
		} catch (FileNotFoundException e1) {
			e1.printStackTrace();
		} catch (IOException e1) {
			e1.printStackTrace();
		}
	}

	public static String getSemTurkeyDataDir() {
		return _userDirectoryPath;
	}

	public static String getAnnotOntologyFile() {
		return _annotOntologyFile;
	}

	public static File getOWLDefinitionFile() {
		return new File(_owlDefinitionFile);
	}

	/**
	 * @return the ontLibraryDir
	 */
	public static String getOntLibraryDir() {
		return _ontLibraryDir;
	}

	/**
	 * @param ontLibraryDir
	 *            the ontLibraryDir to set
	 */
	public static void setOntLibraryDir(String ontLibraryDir) {
		Resources._ontLibraryDir = ontLibraryDir;
	}

	/**
	 * as from sturkey.properties property: ontologiesMirrorLocation if property is set to default, then its
	 * value is ontologiesMirror dir inside the ontDir directory (delegating to
	 * Config.getOntologiesMirrorLocation, which reads the property file)
	 * 
	 * @return
	 */
	public static String getOntologiesMirrorDir() {
		return Config.getOntologiesMirrorLocation();
	}

	public static void setExtensionPath(String userDataPath) {
		logger.debug("setting extension path to: " + userDataPath);
		_extensionPath = userDataPath;
	}

	public static String getExtensionPath() {
		return _extensionPath;
	}

	public static String getXSLDirectoryPath() {
		return getExtensionPath() + "/components/lib/xsl/";
	}

	/**
	 * @return the _ontTempDir
	 */
	public static String getOntTempDir() {
		return _ontTempDir;
	}

	/**
	 * @param tempDir
	 *            the _ontTempDir to set
	 */
	public static void setOntTempDir(String tempDir) {
		_ontTempDir = tempDir;
	}

	/**
	 * @return the _ontMirrorDirDefaultLocation
	 */
	static String getOntMirrorDirDefaultLocation() {
		return _ontMirrorDirDefaultLocation;
	}

	public static File getProjectsDir() {
		return new File(_userDirectoryPath, _projectsDirName);
	}

	public static File getMainProjectDir() {
		return new File(_userDirectoryPath, mainProjectName);
	}

	/**
	 * this method is used to get the path of a new temp file to be used for whatever reason (the file is
	 * stored in the default temp file directory of Semantic Turkey
	 * 
	 * @return the path to the temp file
	 * @throws IOException
	 */
	public static File createTempDir() throws IOException {
		UUID uuid;
		String tempFilePath;
		File tempDir;
		do {
			uuid = UUID.randomUUID();
			tempFilePath = Resources.getOntTempDir() + "/" + uuid;
			tempDir = new File(tempFilePath);
		} while (tempDir.exists());
		if (tempDir.mkdir())
			return tempDir;
		else
			throw new IOException("unable to create tempdir for building the exported project");
	}

}
