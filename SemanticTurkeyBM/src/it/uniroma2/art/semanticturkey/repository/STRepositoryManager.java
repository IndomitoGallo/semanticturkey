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
package it.uniroma2.art.semanticturkey.repository;

import it.uniroma2.art.semanticturkey.exceptions.ImportManagementException;
import it.uniroma2.art.semanticturkey.resources.MirroredOntologyFile;
import it.uniroma2.art.semanticturkey.resources.OntFile;
import it.uniroma2.art.semanticturkey.resources.OntTempFile;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.exceptions.RepositoryCreationException;
import it.uniroma2.art.ontapi.exceptions.RepositoryNotAccessibleException;
import it.uniroma2.art.ontapi.exceptions.RepositoryUpdateException;


import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.Collection;
import java.util.UUID;

import org.w3c.dom.Document;

/**
 * @author Armando Stellato
 *
 */
public abstract class STRepositoryManager {
	
    
	abstract public String getId();
	
	/**
     * TODO modify this to get a series of parameters, because their number and type depends on specific type of repository
	 * @param baseuri  the baseuri of the repository
	 * @param repositoryDirectory  the baseuri of 
	 * @return
	 * @throws RepositoryCreationException
	 */
	abstract public ARTRepository loadRepository(String baseuri, String repositoryDirectory) throws RepositoryCreationException;

    abstract public void addOntologyImportFromWebToLocalFile(String baseURI, String sourceURL, String localFile)  throws MalformedURLException, RepositoryUpdateException; 
    
    abstract public void addOntologyImportFromWeb(String baseURI, String sourceURL) throws MalformedURLException, RepositoryUpdateException;
    
    abstract public void addOntologyImportFromLocalFile(String baseURI, String fromLocalFilePath, String toLocalFile) throws MalformedURLException, RepositoryUpdateException;
    
    abstract public void addOntologyImportFromMirror(String baseURI, String toLocalFile) throws MalformedURLException, RepositoryUpdateException;

    
	/**
	 * downloads an ontology which is in the import list as a FAILED import from web to the mirror (needs to specify an alternative URL, because the baseURI failed)
	 * 
	 * @param method
	 * @param baseURI
	 * @param fromLocalFilePath
	 * @param localFile
	 * @throws RepositoryUpdateException 
	 */
	abstract public void downloadImportedOntologyFromWebToMirror(String baseURI, String altURL, String toLocalFile) throws RepositoryUpdateException, ImportManagementException;
	
    /**
     * downloads an ontology which is in the import list as a FAILED import from web (needs to specify an alternative URL, because the baseURI failed)
     * 
     * @param altURL
     * @throws MalformedURLException
     * @throws RepositoryUpdateException
     */
    abstract public void downloadImportedOntologyFromWeb(String baseURI, String altURL) throws MalformedURLException, RepositoryUpdateException, ImportManagementException;
        
    /**
     * downloads an ontology which is in the import list as a FAILED import, from a local file
     * 
     * @param altURL
     * @param fromLocalFilePath
     * @param toLocalFile
     * @throws MalformedURLException
     * @throws RepositoryUpdateException
     */
    abstract public void getImportedOntologyFromLocalFile(String baseURI, String fromLocalFilePath, String toLocalFile) throws MalformedURLException, RepositoryUpdateException, ImportManagementException;

    /**
     * mirrors an ontology which has already been successfully imported from the web
     * @throws ImportManagementException 
     * @throws RepositoryUpdateException 
     */
    abstract public void mirrorOntology(String baseURI, String toLocalFile) throws ImportManagementException, RepositoryUpdateException;
  
    
    abstract public void removeOntologyImport(String uriToBeRemoved) throws IOException, RepositoryUpdateException, RepositoryCreationException;
    
    abstract public ImportStatus getImportStatus(String baseURI);
    
    abstract public Document writeRDFonDocument(ARTRepository r) throws Exception;
    
    abstract public void writeRDFOnFile(File outPutFile) throws Exception;
    
    abstract public void clearRepository() throws RepositoryCreationException, RepositoryUpdateException;
    
    abstract public void loadOntologyData(File inputFile, String baseURI) throws FileNotFoundException, IOException, RepositoryNotAccessibleException, RepositoryCreationException;
    
    /**
     * this method is used to get the path of a new temp file to be used for whatever reason (the file is stored in the default temp file directory of Semantic Turkey 
     * @return the path to the temp file
     */
    public static OntTempFile getTempFileEntry() {
        UUID uuid;
        String tempFilePath;
        File tempFile;
        do {
            uuid = UUID.randomUUID();
            tempFilePath = Resources.getOntTempDir()+"/"+uuid+".owl";
            tempFile = new File(tempFilePath);
        }
        while (tempFile.exists());
        return new OntTempFile(uuid+".owl");
    }
    
}
