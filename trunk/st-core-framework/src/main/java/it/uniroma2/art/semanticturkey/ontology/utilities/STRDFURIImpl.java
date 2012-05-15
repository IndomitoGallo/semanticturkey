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
  * The Original Code is st-core-framework.
  *
  * The Initial Developer of the Original Code is University of Roma Tor Vergata.
  * Portions created by University of Roma Tor Vergata are Copyright (C) 2012.
  * All Rights Reserved.
  *
  * st-core-framework was developed by the Artificial Intelligence Research Group
  * (ai-nlp.info.uniroma2.it) at the University of Roma Tor Vergata
  * Current information about st-core-framework can be obtained at 
  * http//ai-nlp.info.uniroma2.it/software/...
  *
  */

  /*
   * Contributor(s): Armando Stellato stellato@info.uniroma2.it
  */
package it.uniroma2.art.semanticturkey.ontology.utilities;

import it.uniroma2.art.owlart.io.RDFNodeSerializer;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.vocabulary.RDFResourceRolesEnum;


public class STRDFURIImpl extends STRDFResourceImpl implements STRDFResource {

	RDFResourceRolesEnum role;
	
	STRDFURIImpl(ARTURIResource node, RDFResourceRolesEnum role, boolean explicit) {
		super(node, role, explicit);
	}
	
	STRDFURIImpl(ARTURIResource node, RDFResourceRolesEnum role, boolean explicit, String show) {
		super(node, role, explicit, show);
	}
	
	public String toNT() {
		return RDFNodeSerializer.toNT((ARTURIResource)node);
	}

	
}
