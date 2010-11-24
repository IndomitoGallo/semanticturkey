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

package it.uniroma2.art.semanticturkey.ontology.utilities;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.exceptions.UnavailableResourceException;
import it.uniroma2.art.owlart.model.ARTBNode;
import it.uniroma2.art.owlart.model.ARTNode;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.navigation.ARTLiteralIterator;
import it.uniroma2.art.owlart.vocabulary.RDF;
import it.uniroma2.art.owlart.vocabulary.VocabularyTypesEnum;
import it.uniroma2.art.owlart.vocabulary.XmlSchema;

public class RDFUtilities {

	// TODO this should be provided in next version of OWL ART API
	public static String renderRDFNode(OWLModel model, ARTURIResource resource) throws ModelAccessException {
		return model.getQName(resource.getURI());
	}

	// TODO this should be provided in next version of OWL ART API
	// only dataRange is rendered at the moment
	public static String renderRDFNode(OWLModel model, ARTBNode node) throws ModelAccessException {
		if (model.isDataRange(node)) {
			ARTLiteralIterator it = model.parseDataRange(node, NodeFilters.MAINGRAPH);
			StringBuffer buffy;
			if (!it.streamOpen())
				buffy = new StringBuffer("{ }");
			else {
				buffy = new StringBuffer("{" + it.getNext());
				while (it.streamOpen()) {
					buffy.append(", " + it.getNext().getLabel());
				}
				buffy.append("}");
			}
			it.close();
			return buffy.toString();
		} else {
			return node.getID();
		}
	}

	// TODO this should be provided in next version of OWL ART API
	public static String renderRDFNode(OWLModel model, ARTNode node) throws ModelAccessException {
		if (node.isURIResource())
			return renderRDFNode(model, node.asURIResource());
		if (node.isBlank())
			return renderRDFNode(model, node.asBNode());
		else
			return node.asLiteral().getLabel(); // Literal
	}

	/**
	 * returns one of:
	 * <ul>
	 * <li>typedLiteral</li>
	 * <li>dataRange</li>
	 * <li>plainLiteral</li>
	 * <li>resource</li>
	 * </ul>
	 * 
	 * on the type of values admitted by a given resource specified as the range of a property
	 * 
	 * @param model
	 * @param range
	 * @return
	 * @throws ModelAccessException
	 */
	public static VocabularyTypesEnum getRangeType(OWLModel model, ARTResource range)
			throws ModelAccessException {
		if (range.isURIResource()) {
			if (XmlSchema.Res.isXMLDatatype(range.asURIResource()))
				return VocabularyTypesEnum.typedLiteral;
			if (range.equals(RDF.Res.PLAINLITERAL))
				return VocabularyTypesEnum.plainLiteral;
		}
		// has to be tested in any case: though it is not common, even a URI can be a dataRange
		if (model.isDataRange(range, NodeFilters.MAINGRAPH))
			return VocabularyTypesEnum.dataRange;
		return VocabularyTypesEnum.resource;
	}

	
	public static ARTResource retrieveResource(RDFModel model, String URI_ID, VocabularyTypesEnum type)
			throws ModelAccessException, UnavailableResourceException {
		ARTResource res;
		if (type == VocabularyTypesEnum.uri) {
			res = model.retrieveURIResource(URI_ID);
		} else if (type == VocabularyTypesEnum.bnode) {
			res = model.retrieveBNode(URI_ID);
		} else
			throw new IllegalArgumentException("type: \"" + type + "\" is not allowed: either uri or bnode");

		if (res != null)
			return res;
		else
			throw new UnavailableResourceException("resource identified with: " + URI_ID
					+ " is not availabe in the RDF repository");
	}

}
