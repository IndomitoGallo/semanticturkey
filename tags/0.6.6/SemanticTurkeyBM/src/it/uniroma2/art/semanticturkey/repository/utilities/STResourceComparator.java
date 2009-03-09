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

package it.uniroma2.art.semanticturkey.repository.utilities;

import it.uniroma2.art.ontapi.ARTResource;

import java.util.Comparator;


/**
 *  è utilizzato come parametro,insieme,alla list da ordinare 
 * per la funzione sort di Collection*/
/**
 * @author Armando Stellato
 *
 */
public class STResourceComparator implements Comparator<ARTResource> {

	/**
	 *  è utilizzato come parametro,insieme,alla list da ordinare 
	 * per la funzione sort di Collection*/
	public int compare(ARTResource arg0, ARTResource arg1) {
		return (arg0).getLocalName().compareTo((arg1).getLocalName());
	}
}
