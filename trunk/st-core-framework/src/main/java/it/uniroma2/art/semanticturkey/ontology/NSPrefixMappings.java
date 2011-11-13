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
  * (ai-nlp.info.uniroma2.it) at the University of Roma Tor Vergata
  * Current information about SemanticTurkey can be obtained at 
  * http//ai-nlp.info.uniroma2.it/software/...
  *
  */

  /*
   * Contributor(s): Armando Stellato stellato@info.uniroma2.it
  */
package it.uniroma2.art.semanticturkey.ontology;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.Set;


/**
 * @author Armando Stellato
 *
 */
public class NSPrefixMappings {

    private Properties namespacePrefixMap;
    private HashMap<String, String> prefixNamespaceMap;
	private File nsPrefixMappingFile;
	public final static String prefixMappingFileName = "PrefixMappings.xml";
	private boolean persistMode;
	//protected static Logger logger = LoggerFactory.getLogger(NSPrefixMappings.class);
		
	
	public NSPrefixMappings(File persistenceDirectory, boolean persistMode) throws IOException {
		this.persistMode = persistMode;
	    namespacePrefixMap = new Properties();
	    prefixNamespaceMap = new HashMap<String, String>();
        nsPrefixMappingFile = new File(persistenceDirectory, "/" + prefixMappingFileName);        
        try {
            FileInputStream input = new FileInputStream(nsPrefixMappingFile);
            namespacePrefixMap.load(input);            
            Set<Object> namespaces = namespacePrefixMap.keySet();
            for (Object ns : namespaces)
                prefixNamespaceMap.put(namespacePrefixMap.getProperty((String)ns), (String)ns);
            input.close();
        } catch (FileNotFoundException e1) {
            nsPrefixMappingFile.createNewFile();
        }
        /*
        logger.debug("prefix mapping initialized:\n" +
        		"namespacePrefixMap:\n" +
        		namespacePrefixMap + "\n\n" +
        		"prefixNamespaceMap:\n" +
        		prefixNamespaceMap 
        		);
        		*/
	}

	
	public void updatePrefixMappingRegistry() throws NSPrefixMappingUpdateException {
		FileOutputStream os;
        try {
            os = new FileOutputStream(nsPrefixMappingFile);
            //properties.storeToXML(os, "local cache references for mirroring remote ontologies");
            namespacePrefixMap.store(os, "local cache references mappings between prefixes and namespace");
            os.close();
        } catch (FileNotFoundException e) {
            throw new NSPrefixMappingUpdateException("synchronization with persistent namespace-prefix mapping repository failed; mappings may result different upon reloading the ontology");
        } catch (IOException e) {
            throw new NSPrefixMappingUpdateException("synchronization with persistent namespace-prefix mapping repository failed; mappings may result different upon reloading the ontology");
        }

	}
	
	
    public void setNSPrefixMapping(String namespace, String newPrefix) throws NSPrefixMappingUpdateException {
        String oldPrefix = namespacePrefixMap.getProperty(namespace);        
        if (oldPrefix!=null)
            prefixNamespaceMap.remove(oldPrefix);
        namespacePrefixMap.setProperty(namespace, newPrefix);        
        prefixNamespaceMap.put(newPrefix, namespace);
        if (persistMode) updatePrefixMappingRegistry();
    }
	
	
	public void removeNSPrefixMapping(String namespace) throws NSPrefixMappingUpdateException {
		String prefix = namespacePrefixMap.getProperty(namespace);
		if (prefix==null)
		    throw new NSPrefixMappingUpdateException("inconsistency error: prefix-mapping table does not contain this namespace");
	    namespacePrefixMap.remove(namespace);
		prefixNamespaceMap.remove(prefix);
		if (persistMode) updatePrefixMappingRegistry();
	}
	
	public String getNamespaceFromPrefix(String prefix) {
		return (String)prefixNamespaceMap.get(prefix);
	}
	
    public String getPrefixFromNamespace(String namespace) {
        return (String)namespacePrefixMap.get(namespace);
    }   
	
	/**
	 * @return a <code>map</code> with prefixes as keys and namespaces as values
	 */
	public Map<String,String> getNSPrefixMappingTable() {
		return prefixNamespaceMap;
	}
    
    public void clearNSPrefixMappings() throws NSPrefixMappingUpdateException {
        prefixNamespaceMap.clear();
        if (persistMode) updatePrefixMappingRegistry();
        /* there should be no need of recreating the file. the update on the clear map should overwriting everything with a cleaned map
        if (persistMode) {
	        nsPrefixMappingFile.delete();
	        try {
				nsPrefixMappingFile.createNewFile();
			} catch (IOException e) {
				e.printStackTrace();
				throw new ModelUpdateException(e.getMessage());
			}
        }
        */
    }
    
    /**
     * @return the file where prefix mappings customized by the user are being persisted
     */
    public File getFile() {
    	return nsPrefixMappingFile;
    }
	
}
