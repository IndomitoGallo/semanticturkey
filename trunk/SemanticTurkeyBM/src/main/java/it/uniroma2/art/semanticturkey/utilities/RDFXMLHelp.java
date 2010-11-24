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
import it.uniroma2.art.owlart.model.ARTLiteral;
import it.uniroma2.art.owlart.model.ARTNode;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.vocabulary.VocabularyTypesEnum;
import it.uniroma2.art.semanticturkey.ontology.utilities.RDFUtilities;

import org.w3c.dom.DOMException;
import org.w3c.dom.Element;

public class RDFXMLHelp {

	public static Element addRDFNodeXMLElement(Element parent, OWLModel model, ARTNode range,
			boolean visualization) throws DOMException, ModelAccessException {
		Element nodeElement;
		if (range.isURIResource()) {
			nodeElement = XMLHelp.newElement(parent, VocabularyTypesEnum.uri.toString());
			String uri = range.asURIResource().getURI();
			nodeElement.setTextContent(uri);
		} else if (range.isBlank()) {
			nodeElement = XMLHelp.newElement(parent, VocabularyTypesEnum.bnode.toString());
			nodeElement.setTextContent(range.asBNode().getID());
		} else {
			// literal
			ARTLiteral lit = range.asLiteral();
			ARTURIResource dt = lit.getDatatype();
			if (dt!=null) {
				nodeElement = XMLHelp.newElement(parent, VocabularyTypesEnum.typedLiteral.toString());
				nodeElement.setAttribute("type", dt.getURI());
				if (visualization)
					nodeElement.setAttribute("typeQName", model.getQName(dt.getURI()));
			} else {
				nodeElement = XMLHelp.newElement(parent, VocabularyTypesEnum.plainLiteral.toString());
				String lang = lit.getLanguage();
				if (lang!=null)
					nodeElement.setAttribute("lang", lang);
			}
			nodeElement.setTextContent(lit.getLabel());
		}

		if (visualization) {
			nodeElement.setAttribute("show", RDFUtilities.renderRDFNode(model, range));
		}

		return nodeElement;
	}

}
