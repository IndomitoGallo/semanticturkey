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
package it.uniroma2.art.semanticturkey.filter;

import com.google.common.base.Predicate;

import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.semanticturkey.vocabulary.STVocabUtilities;


/**
 * @author Armando Stellato
 *
 */
public class NoSystemResourcePredicate implements Predicate<ARTResource> {

	public static final NoSystemResourcePredicate noSysResPred = new NoSystemResourcePredicate();


	public boolean apply(ARTResource res) {
		//System.out.println("checking if " + res + " is a System Resource: " + VocabUtilities.isSystemResource((STResource)res));
        if ( STVocabUtilities.isHiddenResource((ARTResource)res) )
			return false;
		else
			return true;
	}
}
