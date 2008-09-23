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

import org.apache.commons.collections.Predicate;

import it.uniroma2.art.semanticturkey.vocabulary.STVocabUtilities;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.vocabulary.VocabUtilities;

/**
 * @author Armando Stellato
 *
 */
public class DomainResourcePredicate implements Predicate {

	public static final DomainResourcePredicate domResPredicate = new DomainResourcePredicate();

	public boolean evaluate(Object res) {
        if ( VocabUtilities.isLanguageResource((ARTResource)res) || STVocabUtilities.isSystemResource((ARTResource)res))
			return false;
		else
			return true;
	}
}
