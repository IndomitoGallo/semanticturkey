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

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

import com.sun.corba.se.spi.activation.Repository;

import it.uniroma2.art.semanticturkey.repository.STRepositoryManager;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.ontapi.ARTRepository;

/**
 * @author Armando Stellato
 *
 */
public class Resources {
	
	private static String _sourceUserDirectorytRelPath = "/components/data";
	private static String _sourceUserDirectoryPath;
	private static String _userDirectorytRelPath = "/../../SemanticTurkeyData";
	private static String _userDirectoryPath;
	
	private static String _extensionPath;	
		
	private static String _ontLibraryDirLocalName = "ontlibrary";
	private static String _ontLibraryDir;
	private static String _ontTempDirLocalName = "ont-temp";
	private static String _ontTempDir;
	private static String _ontMirrorDirDefaultLocationLocalName = "ontologiesMirror";
	private static String _ontMirrorDirDefaultLocation;
	
	private static String _semTurkeyPropertyFile;
	private static String _annotOntologyFile;
	private static String _owlDefinitionFile;
	private static String _importMemPropertyFile;
	private static String _ontologiesMirrorFile;
	
	
	
	private static STRepositoryManager _repositoryFactory;
	private static ARTRepository _repository;
	

	public static void initializeUserResources() {
		_userDirectoryPath = getExtensionPath() + _userDirectorytRelPath;

		_ontLibraryDir=_userDirectoryPath+ "/" + _ontLibraryDirLocalName;
		_ontTempDir=_userDirectoryPath + "/" + _ontTempDirLocalName;
		_ontMirrorDirDefaultLocation = _userDirectoryPath + "/" + _ontMirrorDirDefaultLocationLocalName;
		_owlDefinitionFile=_ontLibraryDir+"/owl.rdfs";
		_annotOntologyFile=_ontLibraryDir+"/annotation.owl";
		_importMemPropertyFile = _userDirectoryPath + "/" + "importMem.properties";
		_ontologiesMirrorFile = _userDirectoryPath + "/" + "OntologiesMirror.xml";
		_semTurkeyPropertyFile = _userDirectoryPath + "/" + "sturkey.properties";
		
		File userDirectory = new File(_userDirectoryPath);
		if (!userDirectory.exists()) {
			userDirectory.mkdir();
			try {
				firstCopyOfUserResources();
			} catch (IOException e) {
				// STARRED TODO change with a throw properly catched somewhere else!
				e.printStackTrace();
			}
		}
		
		try {
			Config.initialize(_semTurkeyPropertyFile);
			ImportMem.setImportMemFile(_importMemPropertyFile);
			OntologiesMirror.setOntologiesMirrorRegistry(_ontologiesMirrorFile);
		} catch (FileNotFoundException e1) {
			e1.printStackTrace();
		} catch (IOException e1) {
			e1.printStackTrace();
		}
	}
	
	
	private static void firstCopyOfUserResources() throws IOException {

		_sourceUserDirectoryPath = getExtensionPath() + _sourceUserDirectorytRelPath;
		
		File ontTempDir = new File(_ontTempDir);
		ontTempDir.mkdir();
		File ontLibraryDir = new File(_ontLibraryDir);
		ontLibraryDir.mkdir();
		File ontMirrorDefaultDir = new File(_ontMirrorDirDefaultLocation);
		ontMirrorDefaultDir.mkdir();
		
		String sourceOntLibraryDir = _sourceUserDirectoryPath + "/" + _ontLibraryDirLocalName;		
		Utilities.copy(sourceOntLibraryDir+"/owl.rdfs", _owlDefinitionFile);
		Utilities.copy(sourceOntLibraryDir+"/annotation.owl", _annotOntologyFile);
		
		File importMemPropertyFile = new File(_importMemPropertyFile);
		importMemPropertyFile.createNewFile();

		File ontologiesMirrorFile = new File(_ontologiesMirrorFile);
		ontologiesMirrorFile.createNewFile();	
		
		Utilities.copy(_sourceUserDirectoryPath + "/sturkey.properties", _semTurkeyPropertyFile);
		
	}
	
	
	public static void setOntologyDir(String ontwdir) {
		_userDirectoryPath = ontwdir;
	}
	
	public static String getOntologyDir() {
		return _userDirectoryPath;
	}

	public static void setAnnotOntologyFile(String ontFile) {
		Resources._annotOntologyFile = ontFile;
	}
	 
	public static String getAnnotOntologyFile() {
		return _annotOntologyFile;
	}
	
	public static void setOWLDefinitionFile(String ontFile) {
		Resources._owlDefinitionFile = ontFile;
	}
	 
	public static String getOWLDefinitionFile() {
		return _owlDefinitionFile;
	}
	
	
	public static ARTRepository getRepository() {
		return _repository;
	}

	public static void setRepository(ARTRepository repository) {
		_repository = repository;
	}

	/**
	 * @return the ontLibraryDir
	 */
	public static String getOntLibraryDir() {
		return _ontLibraryDir;
	}

	/**
	 * @param ontLibraryDir the ontLibraryDir to set
	 */
	public static void setOntLibraryDir(String ontLibraryDir) {
		Resources._ontLibraryDir = ontLibraryDir;
	}

	/**
	 * as from sturkey.properties property: ontologiesMirrorLocation
	 * if property is set to default, then its value is ontologiesMirror dir inside the ontDir directory
	 * (delegating to Config.getOntologiesMirrorLocation, which reads the property file)
	 * @return
	 */
	public static String getOntologiesMirrorDir() {
		return Config.getOntologiesMirrorLocation();
	}

	public static void setExtensionPath(String userDataPath) {
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
	 * @param tempDir the _ontTempDir to set
	 */
	public static void setOntTempDir(String tempDir) {
		_ontTempDir = tempDir;
	}

	/**
	 * @return the _repositoryFactory
	 */
	public static STRepositoryManager getRepositoryManager() {
		return _repositoryFactory;
	}

	/**
	 * @param factory the _repositoryFactory to set
	 */
	public static void setRepositoryManager(STRepositoryManager factory) {
		_repositoryFactory = factory;
	}


	/**
	 * @return the _ontMirrorDirDefaultLocation
	 */
	static String getOntMirrorDirDefaultLocation() {
		return _ontMirrorDirDefaultLocation;
	}
	
	public static String getWorkingOntologyURI() {
		return _repository.getBaseURI();
	}
	
	
}
