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

import java.util.HashSet;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
import it.uniroma2.art.owlart.vocabulary.OWL;
import it.uniroma2.art.owlart.vocabulary.RDF;
import it.uniroma2.art.owlart.vocabulary.RDFS;
import it.uniroma2.art.owlart.vocabulary.VocabularyTypesEnum;
import it.uniroma2.art.owlart.vocabulary.XmlSchema;
import it.uniroma2.art.semanticturkey.exceptions.IncompatibleRangeException;

public class RDFUtilities {

	protected static Logger logger = LoggerFactory.getLogger(RDFUtilities.class);

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
	 * <li><code>plainLiteral </code>: plainLiterals are admitted as possible values</li>
	 * <li><code>typedLiteral </code>: typedLiteral (of the given range) are admitted as values</li>
	 * <li><code>literal 	  </code>: literals (both typed - of any type - and plain) are admitted as values</li>
	 * <li><code>dataRange    </code>: literals specified by the given range are admitted</li>
	 * <li><code>resource     </code>: the property points to resources</li>
	 * <li><code>undetermined </code>: the range is undetermined, any kind of object can be referenced through
	 * it</li>
	 * </ul>
	 * 
	 * on the type of values admitted by a given resource specified as the range of a property
	 * 
	 * @param model
	 * @param range
	 * @return
	 * @throws ModelAccessException
	 * @throws IncompatibleRangeException
	 */
	public static VocabularyTypesEnum getRangeType(OWLModel model, ARTURIResource property,
			HashSet<ARTResource> rangesSet) throws ModelAccessException, IncompatibleRangeException {

		// related to those annotation properties from RDFS/OWL vocabularies for which the range is known
		// "de facto", though never declared
		VocabularyTypesEnum specialCase = getRangeTypeSpecialCase(property);
		if (specialCase != null)
			return specialCase;

		if (rangesSet.isEmpty()) {
			return getInferredAndCompatiblePropertyRange(model, property, VocabularyTypesEnum.undetermined);
		}

		ARTResource range = rangesSet.iterator().next();

		if (range.isURIResource()) {
			if (XmlSchema.Res.isXMLDatatype(range.asURIResource()))
				return getInferredAndCompatiblePropertyRange(model, property,
						VocabularyTypesEnum.typedLiteral);
			if (range.equals(RDF.Res.PLAINLITERAL))
				return getInferredAndCompatiblePropertyRange(model, property,
						VocabularyTypesEnum.plainLiteral);
			if (range.equals(RDFS.Res.LITERAL))
				return getInferredAndCompatiblePropertyRange(model, property, VocabularyTypesEnum.literal);
		}

		// has to be tested in any case: though it is not common, even a URI can be a dataRange
		if (model.isDataRange(range, NodeFilters.MAINGRAPH))
			return getInferredAndCompatiblePropertyRange(model, property, VocabularyTypesEnum.dataRange);

		return VocabularyTypesEnum.resource;
	}

	private static VocabularyTypesEnum getRangeTypeSpecialCase(ARTURIResource property) {
		if (property.equals(OWL.Res.VERSIONINFO) || property.equals(RDFS.Res.LABEL)
				|| property.equals(RDFS.Res.COMMENT))
			return VocabularyTypesEnum.plainLiteral;
		if (property.equals(RDFS.Res.SEEALSO) || property.equals(RDFS.Res.ISDEFINEDBY))
			return VocabularyTypesEnum.resource;
		return null;
	}

	private static VocabularyTypesEnum getInferredAndCompatiblePropertyRange(OWLModel model,
			ARTURIResource property, VocabularyTypesEnum suggestedType) throws ModelAccessException,
			IncompatibleRangeException {
		if (suggestedType == VocabularyTypesEnum.undetermined) {
			if (model.isObjectProperty(property))
				return VocabularyTypesEnum.resource;
			if (model.isDatatypeProperty(property))
				return VocabularyTypesEnum.literal;
		} else if (suggestedType == VocabularyTypesEnum.literal
				|| suggestedType == VocabularyTypesEnum.plainLiteral
				|| suggestedType == VocabularyTypesEnum.typedLiteral
				|| suggestedType == VocabularyTypesEnum.dataRange) {
			if (model.isObjectProperty(property))
				throw new IncompatibleRangeException(property, suggestedType);
		} else if (suggestedType == VocabularyTypesEnum.resource) {
			if (model.isDatatypeProperty(property))
				throw new IncompatibleRangeException(property, suggestedType);
		}
		logger.debug("no contraint from given property, using range type inferred from range object: "
				+ suggestedType);
		return suggestedType;
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
