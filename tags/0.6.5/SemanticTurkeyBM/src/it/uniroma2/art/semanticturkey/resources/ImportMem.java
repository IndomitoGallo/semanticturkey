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

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Properties;

/**
 * @author Armando Stellato
 *
 */
public class ImportMem {

	static String _importMemFilePath;
	//TODO maybe it is better to handle this property file like the one in OntologiesMirror.java, with a static Properties field
	
	/**
	 * @param importMemFile the importMemFile to set
	 */
	static void setImportMemFile(String importMemFile) {
		ImportMem._importMemFilePath = importMemFile;
	}
	
	public static String getImportMem() throws IOException {
		Properties properties = new Properties();
		FileInputStream is = new FileInputStream(_importMemFilePath);
		properties.load(is);
		is.close();
        String importMem = (String)properties.get("importMem");
        if (importMem==null || importMem.equals(""))
            return "noImports";
        else
            return importMem;
	}
	
	/**
	 * completely rewrites the ImportMem File (for debugging only, not to be used during normal operations)
	 * 
	 * @param newImportMem a new set of uris (with ";" separation) 
	 * @throws IOException
	 */
	public static void updateImportMemFile(String newImportMem) throws IOException {
		Properties properties = new Properties();
		properties.setProperty("importMem", newImportMem);
		FileOutputStream os = new FileOutputStream(_importMemFilePath);
		//properties.storeToXML(os, "local cache references for mirroring remote ontologies");
		properties.store(os, "last imported baseuris for current repository");
		os.close();
	}
	
	public static void clearImportMem() throws IOException {
		updateImportMemFile("");
	}
	
	
	/**
	 * gets a new import to be added to the list of existing ontology imports
	 * 
	 * @param newImport just the uri of a new ontology
	 * @throws IOException
	 */
	public static void addImportToImportMemFile(String newImport) throws IOException {
		System.out.println("ADDIMPORTTOIMPORTMEMFILE INVOKED");
		System.out.flush();
		Properties properties = new Properties();
		FileInputStream is = new FileInputStream(_importMemFilePath);
		properties.load(is);
		is.close();
		String oldImportMem = (String)properties.get("importMem");

		properties = new Properties();
		System.out.println("OLD IMPORT MEM" + oldImportMem);
        if (oldImportMem==null || oldImportMem.equals(""))
            properties.setProperty("importMem", newImport);
        else if (oldImportMem.contains(newImport))
        	throw new ImportMemException("trying to add an already imported ontology (" + newImport + ") on the ImportMem registry: ");
        else
           properties.setProperty("importMem", oldImportMem+";"+newImport);
		FileOutputStream os = new FileOutputStream(_importMemFilePath);
		//properties.storeToXML(os, "local cache references for mirroring remote ontologies");
		properties.store(os, "last imported baseuris for current repository");
		os.close();
	}	
		
	
	/**
	 * removes an imported ontology from the list of existing ontology imports
	 * 
	 * @param uriToBeRemoved just the uri to be removed from the ImportMem File
	 * @throws IOException
	 */
	public static void removeURIFromImportMemFile(String uriToBeRemoved) throws IOException {
		Properties properties = new Properties();
		FileInputStream is = new FileInputStream(_importMemFilePath);
		properties.load(is);
		is.close();
		String oldImportMem = (String)properties.get("importMem");

		properties = new Properties();
        if (oldImportMem!=null) {	//checks if there is something to search for deletion
        	String newImportMem;
        	newImportMem = oldImportMem.replaceAll(uriToBeRemoved+";", "");		//first tries to delete the uri if it is in a position between 1 and n-1 (when there're at least two imports) 
        	if (newImportMem.equals(oldImportMem)) {
        		newImportMem = oldImportMem.replaceAll(";"+uriToBeRemoved, "");	//if it is not, it checks if the searched uri is the last one in the import sequence        		
        	}
        	if (newImportMem.equals(oldImportMem))
        		newImportMem = oldImportMem.replaceAll(uriToBeRemoved, "");	//third attempt, to be used only after the first two (because it assumes that the uri to be removed is the sole import present in the property file)
        	if (!newImportMem.equals(oldImportMem)) {	//if the uri has been deleted in the first, second or third attempt, it rewrites the property file
	        	properties.setProperty("importMem", newImportMem);
				FileOutputStream os = new FileOutputStream(_importMemFilePath);
				//properties.storeToXML(os, "local cache references for mirroring remote ontologies");
				properties.store(os, "last imported baseuris for current repository");
				os.close();
        	}
        }
	}
	
}
