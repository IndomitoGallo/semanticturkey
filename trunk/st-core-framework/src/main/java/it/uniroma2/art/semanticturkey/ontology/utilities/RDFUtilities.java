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
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.vocabulary.OWL;
import it.uniroma2.art.owlart.vocabulary.RDF;
import it.uniroma2.art.owlart.vocabulary.RDFS;
import it.uniroma2.art.owlart.vocabulary.RDFTypesEnum;
import it.uniroma2.art.owlart.vocabulary.XmlSchema;
import it.uniroma2.art.semanticturkey.exceptions.IncompatibleRangeException;

import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RDFUtilities {

	protected static Logger logger = LoggerFactory.getLogger(RDFUtilities.class);

	
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
	public static RDFTypesEnum getRangeType(OWLModel model, ARTURIResource property,
			Set<ARTResource> rangesSet) throws ModelAccessException, IncompatibleRangeException {

		logger.debug("determining range type for property: " + property);
		
		// related to those annotation properties from RDFS/OWL vocabularies for which the range is known
		// "de facto", though never declared
		RDFTypesEnum specialCase = getRangeTypeSpecialCase(property);
		if (specialCase != null)
			return specialCase;

		if (rangesSet.isEmpty()) {
			return getInferredAndCompatiblePropertyRange(model, property, RDFTypesEnum.undetermined);
		}

		ARTResource range = rangesSet.iterator().next();
		
		logger.debug("determing range type by checking range: " + range);

		if (range.isURIResource()) {
			if (XmlSchema.Res.isXMLDatatype(range.asURIResource()))
				return getInferredAndCompatiblePropertyRange(model, property,
						RDFTypesEnum.typedLiteral);
			if (range.equals(RDF.Res.PLAINLITERAL))
				return getInferredAndCompatiblePropertyRange(model, property,
						RDFTypesEnum.plainLiteral);
			if (range.equals(RDFS.Res.LITERAL))
				return getInferredAndCompatiblePropertyRange(model, property, RDFTypesEnum.literal);
		}

		// has to be tested in any case: though it is not common, even a URI can be a dataRange
		if (model.isDataRange(range, NodeFilters.MAINGRAPH))
			return getInferredAndCompatiblePropertyRange(model, property, RDFTypesEnum.literal);

		return RDFTypesEnum.resource;
	}

	private static RDFTypesEnum getRangeTypeSpecialCase(ARTURIResource property) {
		if (property.equals(OWL.Res.VERSIONINFO) || property.equals(RDFS.Res.LABEL)
				|| property.equals(RDFS.Res.COMMENT))
			return RDFTypesEnum.plainLiteral;
		if (property.equals(RDFS.Res.SEEALSO) || property.equals(RDFS.Res.ISDEFINEDBY))
			return RDFTypesEnum.resource;
		return null;
	}

	private static RDFTypesEnum getInferredAndCompatiblePropertyRange(OWLModel model,
			ARTURIResource property, RDFTypesEnum suggestedType) throws ModelAccessException,
			IncompatibleRangeException {
		if (suggestedType == RDFTypesEnum.undetermined) {
			if (model.isObjectProperty(property))
				return RDFTypesEnum.resource;
			if (model.isDatatypeProperty(property))
				return RDFTypesEnum.literal;
		} else if (RDFTypesEnum.isLiteral(suggestedType)) {
			if (model.isObjectProperty(property))
				throw new IncompatibleRangeException(property, suggestedType);
		} else if (suggestedType == RDFTypesEnum.resource) {
			if (model.isDatatypeProperty(property))
				throw new IncompatibleRangeException(property, suggestedType);
		}
		logger.debug("no contraint from given property, using range type inferred from range object: "
				+ suggestedType);
		return suggestedType;
	}

	public static ARTResource retrieveResource(RDFModel model, String URI_ID, RDFTypesEnum type)
			throws ModelAccessException, UnavailableResourceException {
		ARTResource res;
		if (type == RDFTypesEnum.uri) {
			res = model.retrieveURIResource(URI_ID);
		} else if (type == RDFTypesEnum.bnode) {
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
