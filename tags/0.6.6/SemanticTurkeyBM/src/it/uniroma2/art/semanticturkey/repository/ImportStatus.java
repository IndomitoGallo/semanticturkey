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

import it.uniroma2.art.semanticturkey.resources.OntFile;

/**
 * @author Armando Stellato
 *
 */
public class ImportStatus {

	public static int LOCAL=0;
	public static int WEB=1;
	public static int NULL=2;
	public static int FAILED=3;
	
	/**
	 * it explains whether a given import is LOCAL, WEB, NULL or FAILED 
	 */
	private int status;
	/**
	 * this contains only the name of the file; complete path is resolved by the application on the basis of the <code>status<variable>
	 */
	private OntFile cacheFile; 
	
	public ImportStatus(int status, OntFile file) {
		this.status=status;
		cacheFile=file;
	}

	/**
	 * @return the cacheFile, this is only the name of the file; complete path is resolved by the application on the basis of the <code>status<variable>
	 */
	public OntFile getCacheFile() {
		return cacheFile;
	}

	/**
	 * sets the cache file for this importStatus
	 * @param cacheFile
	 */
	public void setCacheFile(OntFile cacheFile) {
		this.cacheFile = cacheFile;
	}
	
	
	/**
	 * @return the status of the import, it explains whether a given import is LOCAL, WEB, NULL or FAILED 
	 */
	public int getStatus() {
		return status;
	}
	
	/**
	 * @return sets the status of this import, with values ranging from LOCAL, WEB, NULL or FAILED 
	 */
	public void setStatus(int status) {
		this.status = status;
	}
	
	/**
	 * @return sets the global status of this import, with values ranging from LOCAL, WEB, NULL or FAILED and specifying the cacheFile 
	 */	
	public void setStatus(int status, OntFile cacheFile) {
		this.status = status;
		this.cacheFile = cacheFile;
	}
	
}
