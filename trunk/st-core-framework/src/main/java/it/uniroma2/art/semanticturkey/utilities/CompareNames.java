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

package it.uniroma2.art.semanticturkey.utilities;

import com.wcohen.ss.JaroWinkler;
import com.wcohen.ss.api.StringWrapper;

/**applies JaroWinkler string similarity method to two given strings  
 */
/**
 * @author Armando Stellato
 *
 */
public class CompareNames {

	/**
	 * return the similarity score between two given strings
	 * 
	 *@param str1 String
	 *@param str2 String */
	public static double compareSimilarNames(String str1, String str2) {				
		str1 = str1.toLowerCase();
		str2 = str2.toLowerCase();
		JaroWinkler jaroWinkler = new JaroWinkler();		
		StringWrapper stringWrapper1 = jaroWinkler.prepare(str1);
		StringWrapper stringWrapper2 = jaroWinkler.prepare(str2);
		return jaroWinkler.score(stringWrapper1, stringWrapper2);		
	}
}
