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
package it.uniroma2.art.semanticturkey.ontology;

import it.uniroma2.art.semanticturkey.resources.OntFile;

/**
 * @author Armando Stellato
 *
 */
public class ImportStatus {

	public enum Values {
		LOCAL, WEB, NULL, FAILED, NG,
		UNASSIGNED
	}
		
	/**
	 * it explains whether a given import is LOCAL, WEB, NULL or FAILED 
	 */
	private Values status=Values.UNASSIGNED;
	/**
	 * this contains only the name of the file; complete path is resolved by the application on the basis of the <code>status<variable>
	 */
	private OntFile cacheFile; 
	
	/**
	 * a narrative description for the failed entry;
	 */
	private String reason;
	
	public ImportStatus(Values status, OntFile file) {
		this.status=status;
		cacheFile=file;
	}

	/**
	 * constructor user for specyfing FAILED import status
	 * @param reason an explication for the failed import
	 */
	private ImportStatus(String reason) {
		this.status=Values.FAILED;
		cacheFile=null;
		this.reason = reason;
	}
	
	public static ImportStatus createFailedStatus(String reason) {
		return new ImportStatus(reason);
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
	public Values getValue() {
		return status;
	}
	
	
	/**
	 * @return the reason for the failed import (<code>null</code> if status!=FAILED) 
	 */
	public String getReason() {
		return reason;
	}
	
	/**
	 * @return sets the status of this import, with values ranging from LOCAL, WEB, NULL or FAILED 
	 */
	public void setValue(Values status) {
		this.status = status;
		this.cacheFile = null;
		this.reason = null;
	}
	
	/**
	 * @return sets the global status of this import, with values ranging from LOCAL, WEB, NULL or FAILED and specifying the cacheFile 
	 */	
	public void setValue(Values status, OntFile cacheFile) {
		this.status = status;
		this.cacheFile = cacheFile;
		this.reason = null;
	}
	
	/**
	 * @return sets the global status of this import, with values ranging from LOCAL, WEB, NULL or FAILED and specifying the cacheFile 
	 */	
	public void setFailed(String reason) {
		this.status = Values.FAILED;
		this.cacheFile = null;
		this.reason = reason;
	}	
	
	
}
