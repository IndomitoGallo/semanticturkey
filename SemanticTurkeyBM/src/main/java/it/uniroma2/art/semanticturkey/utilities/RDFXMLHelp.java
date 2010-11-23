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
  * The Original Code is Semantic Turkey.
  *
  * The Initial Developer of the Original Code is University of Roma Tor Vergata.
  * Portions created by University of Roma Tor Vergata are Copyright (C) 2010.
  * All Rights Reserved.
  *
  * Semantic Turkey was developed by the Artificial Intelligence Research Group
  * (art.uniroma2.it) at the University of Roma Tor Vergata
  * Current information about Semantic Turkey can be obtained at 
  * http://semanticturkey.uniroma2.it
  *
  */

package it.uniroma2.art.semanticturkey.utilities;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.vocabulary.VocabularyTypesEnum;
import it.uniroma2.art.semanticturkey.ontology.utilities.RDFUtilities;

import org.w3c.dom.DOMException;
import org.w3c.dom.Element;

public class RDFXMLHelp {

	public static Element addRDFNodeXMLElement(Element parent, OWLModel model, ARTResource range,
			boolean visualization) throws DOMException, ModelAccessException  {
		Element resourceElement;
		if (range.isURIResource()) {
			resourceElement = XMLHelp.newElement(parent, VocabularyTypesEnum.uri.toString());
			String uri = range.asURIResource().getURI();
			resourceElement.setTextContent(uri);			
		}
		else {
			resourceElement = XMLHelp.newElement(parent, VocabularyTypesEnum.bnode.toString());
			resourceElement.setTextContent(range.asBNode().getID());
		}

		if (visualization) {
			resourceElement.setAttribute("show", RDFUtilities.renderRDFNode(model, range));
		}
		
		return resourceElement;
	}
	
	

	
	
	
}
