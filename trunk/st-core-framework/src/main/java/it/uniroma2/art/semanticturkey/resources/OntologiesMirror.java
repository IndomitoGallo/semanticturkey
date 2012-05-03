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
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Hashtable;
import java.util.Properties;

/**
 * @author Armando Stellato
 *
 */
public class OntologiesMirror {

	private static Properties properties;
	private static File ontologyMirrorFile;
	
	static void setOntologiesMirrorRegistry(File ontologyMirrorFile) throws IOException {
		properties = new Properties();
		OntologiesMirror.ontologyMirrorFile = ontologyMirrorFile;
		properties.load(new FileInputStream(ontologyMirrorFile));
	}
	
	private static void updateOntologiesMirrorRegistry() throws IOException {
		FileOutputStream os = new FileOutputStream(ontologyMirrorFile);
		//properties.storeToXML(os, "local cache references for mirroring remote ontologies");
		properties.store(os, "local cache references for mirroring remote ontologies");
		os.close();
	}
	
	
	public static void addCachedOntologyEntry(String baseURI, MirroredOntologyFile cacheFile) {
		properties.setProperty(baseURI, cacheFile.getLocalName());
		try {
			updateOntologiesMirrorRegistry();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	public static void removeCachedOntologyEntry(String baseURI) {
		properties.remove(baseURI);
		try {
			updateOntologiesMirrorRegistry();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	public static String getMirroredOntologyEntry(String baseURI) {
		return (String)properties.get(baseURI);
	}	
	
	public static File getMirroredOntologyFile(String baseURI) {
		return new File(Resources.getOntologiesMirrorDir() + "/" + (String)properties.get(baseURI));
	}
	
	public static Hashtable<Object,Object> getFullMirror() {
		return properties;
	}
	
}
