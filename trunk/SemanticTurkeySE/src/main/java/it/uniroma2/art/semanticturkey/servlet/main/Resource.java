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
package it.uniroma2.art.semanticturkey.servlet.main;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.filter.NoLanguageResourcePredicate;
import it.uniroma2.art.owlart.filter.NoSubclassPredicate;
import it.uniroma2.art.owlart.filter.NoSubpropertyPredicate;
import it.uniroma2.art.owlart.filter.NoTypePredicate;
import it.uniroma2.art.owlart.filter.URIResourcePredicate;
import it.uniroma2.art.owlart.model.ARTLiteral;
import it.uniroma2.art.owlart.model.ARTNode;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTStatement;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.DirectReasoning;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.navigation.ARTResourceIterator;
import it.uniroma2.art.owlart.navigation.ARTStatementIterator;
import it.uniroma2.art.owlart.utilities.ModelUtilities;
import it.uniroma2.art.owlart.utilities.RDFIterators;
import it.uniroma2.art.owlart.vocabulary.OWL;
import it.uniroma2.art.owlart.vocabulary.RDF;
import it.uniroma2.art.owlart.vocabulary.RDFS;
import it.uniroma2.art.owlart.vocabulary.RDFTypesEnum;
import it.uniroma2.art.owlart.vocabulary.VocabularyTypesInts;
import it.uniroma2.art.semanticturkey.exceptions.IncompatibleRangeException;
import it.uniroma2.art.semanticturkey.filter.NoSystemResourcePredicate;
import it.uniroma2.art.semanticturkey.ontology.utilities.RDFUtilities;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.PropertyShowOrderComparator;
import it.uniroma2.art.semanticturkey.utilities.RDFXMLHelp;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.STVocabUtilities;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Element;

import com.google.common.base.Predicate;
import com.google.common.base.Predicates;
import com.google.common.collect.HashMultimap;
import com.google.common.collect.Iterators;
import com.google.common.collect.Multimap;

public abstract class Resource extends ServiceAdapter {

	private ArrayList<Predicate<ARTResource>> basePropertyPruningPredicates;

	private ArrayList<ARTURIResource> bannedPredicatesForResourceDescription;

	public Resource(String id) {
		super(id);
		basePropertyPruningPredicates = new ArrayList<Predicate<ARTResource>>();
		basePropertyPruningPredicates.add(NoTypePredicate.noTypePredicate);
		basePropertyPruningPredicates.add(NoSubclassPredicate.noSubclassPredicate);
		basePropertyPruningPredicates.add(NoSubpropertyPredicate.noSubpropertyPredicate);

	}

	protected static Logger logger = LoggerFactory.getLogger(Resource.class);
	public static final String templateandvalued = "templateandvalued";

	public static final String propertyDescriptionRequest = "getPropDescription";
	public static final String classDescriptionRequest = "getClsDescription";
	public static final String individualDescriptionRequest = "getIndDescription";
	public static final String ontologyDescriptionRequest = "getOntologyDescription";

	protected String getExactResourceDescriptionRequest(int restype) {
		switch (restype) {
		case VocabularyTypesInts.cls:
			return classDescriptionRequest;
		case VocabularyTypesInts.property:
			return propertyDescriptionRequest;
		case VocabularyTypesInts.individual:
			return individualDescriptionRequest;
		case VocabularyTypesInts.ontology:
			return ontologyDescriptionRequest;
		default:
			return null;
		}
	}

	/**
	 * 
	 * 
	 * @param resourceQName
	 * @param restype
	 *            the type considered for inspecting the resource. Since each resource may have more than one
	 *            type (for example, an individual can also be a class)
	 * @param method
	 *            if it is equal to "templateandvalued", then also property values for this resources are
	 *            reported
	 * @return
	 */
	protected Response getResourceDescription(String resourceQName, int restype, String method) {
		OWLModel ontModel = ProjectManager.getCurrentProject().getOWLModel();
		ARTResource resource;
		try {
			resource = ontModel.createURIResource(ontModel.expandQName(resourceQName));
			HashSet<ARTURIResource> properties = new HashSet<ARTURIResource>();

			// TEMPLATE PROPERTIES (properties which can be shown since the selected instance has at least a
			// type which falls in their domain)
			extractTemplateProperties(ontModel, resource, properties);

			// VALUED PROPERTIES (properties over which the selected instance has one or more values)
			Multimap<ARTURIResource, ARTNode> propertyValuesMap = HashMultimap.create();
			// if I want the collection of values for each property to be a set, i could use MultiValueMap,
			// and define an HashSet Factory
			if (method.equals(templateandvalued)) {
				extractValuedProperties(ontModel, resource, properties, propertyValuesMap);
			}
			// XML COMPILATION SECTION
			return getXMLResourceDescription(ontModel, resource, restype, method, properties,
					propertyValuesMap);

		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(
					getExactResourceDescriptionRequest(restype), e);
		}

	}

	// TODO generate specific filters for classes, properties and individuals
	/**
	 * this part runs across all the types of the explored resource, reporting all the properties
	 * comprehending one of these types in their domain
	 * 
	 * @param ontModel
	 * @param resource
	 * @param properties
	 * @throws ModelAccessException
	 */
	protected void extractTemplateProperties(OWLModel ontModel, ARTResource resource,
			HashSet<ARTURIResource> properties) throws ModelAccessException {

		Collection<ARTResource> types = RDFIterators.getCollectionFromIterator(ontModel.listTypes(resource,
				true));

		// TYPES FILTER preparation
		// gets only domain types, no rdf/rdfs/owl language classes cited in the types nor, if in userStatus,
		// any type class from any application ontology
		Predicate<ARTResource> typesFilter = NoLanguageResourcePredicate.nlrPredicate;
		typesFilter = Predicates.and(typesFilter, NoSystemResourcePredicate.noSysResPred);

		// PROPERTIES FILTER preparation
		// template props are pruned of type/subclass/subproperty declarations
		Collection<Predicate<ARTResource>> prunedPredicates = new ArrayList<Predicate<ARTResource>>();
		prunedPredicates.addAll(basePropertyPruningPredicates);
		prunedPredicates.add(NoSystemResourcePredicate.noSysResPred);
		Predicate<ARTURIResource> propsExclusionPredicate = Predicates.and(prunedPredicates);

		logger.debug("types for " + resource + ": " + types);
		Iterator<ARTResource> filteredTypesIterator = Iterators.filter(types.iterator(), typesFilter);
		while (filteredTypesIterator.hasNext()) {
			ARTResource typeCls = (ARTResource) filteredTypesIterator.next();
			if (typeCls.isURIResource()) {
				Iterator<ARTURIResource> filteredPropsIterator = Iterators.filter(ontModel
						.listPropertiesForDomainClass(typeCls, true), propsExclusionPredicate);
				while (filteredPropsIterator.hasNext()) {
					properties.add(filteredPropsIterator.next());
				}
			}
		}
	}

	// TODO generate specific filters for classes, properties and individuals
	protected void extractValuedProperties(OWLModel ontModel, ARTResource resource,
			HashSet<ARTURIResource> properties, Multimap<ARTURIResource, ARTNode> propertyValuesMap)
			throws ModelAccessException {
		ARTStatementIterator stit = ontModel.listStatements(resource, NodeFilters.ANY, NodeFilters.ANY, true);

		bannedPredicatesForResourceDescription = new ArrayList<ARTURIResource>();
		bannedPredicatesForResourceDescription.add(RDFS.Res.DOMAIN);
		bannedPredicatesForResourceDescription.add(RDFS.Res.RANGE);
		bannedPredicatesForResourceDescription.add(RDF.Res.TYPE);
		bannedPredicatesForResourceDescription.add(OWL.Res.INVERSEOF);
		bannedPredicatesForResourceDescription.add(RDFS.Res.SUBPROPERTYOF);
		bannedPredicatesForResourceDescription.add(RDFS.Res.SUBCLASSOF);
		bannedPredicatesForResourceDescription.add(OWL.Res.IMPORTS);

		while (stit.hasNext()) {
			ARTStatement st = stit.next();
			ARTURIResource valuedProperty = st.getPredicate();

			if (!bannedPredicatesForResourceDescription.contains(valuedProperty)
					&& !STVocabUtilities.isHiddenResource(valuedProperty)) {
				logger.debug("adding " + st.getObject() + " to " + valuedProperty + " bucket");
				properties.add(valuedProperty);
				propertyValuesMap.put(valuedProperty, st.getObject());
			}
		}
	}

	protected Response getXMLResourceDescription(OWLModel ontModel, ARTResource resource, int restype,
			String method, HashSet<ARTURIResource> properties,
			Multimap<ARTURIResource, ARTNode> propertyValuesMap) {
		ArrayList<ARTURIResource> sortedProperties = new ArrayList<ARTURIResource>(properties);
		logger.debug("sortedProperties: " + sortedProperties);
		Collections.sort(sortedProperties, new PropertyShowOrderComparator(ontModel));

		// RESPONSE PREPARATION
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(
				getExactResourceDescriptionRequest(restype), RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		dataElement.setAttribute("type", method);

		String request = getExactResourceDescriptionRequest(restype);

		// TYPES
		System.out.println("method = " + method);
		if (method.equals(templateandvalued)) {
			Element typesElement = XMLHelp.newElement(dataElement, "Types");

			// TODO filter on admin also here
			try {
				Collection<ARTResource> directTypes = RDFIterators
						.getCollectionFromIterator(((DirectReasoning) ontModel).listDirectTypes(resource));
				Collection<ARTResource> directExplicitTypes = RDFIterators.getCollectionFromIterator(ontModel
						.listTypes(resource, false));

				for (ARTResource type : directTypes) {
					// TODO remove when unnamed types are supported
					if (type.isURIResource()) {
						Element typeElem = XMLHelp.newElement(typesElement, "Type");
						typeElem.setAttribute("class", ontModel.getQName(type.asURIResource().getURI()));
						String explicit;
						if (directExplicitTypes.contains(type))
							explicit = "true";
						else
							explicit = "false";
						typeElem.setAttribute("explicit", explicit);
					}
				}
			} catch (ModelAccessException e) {
				return ServletUtilities.getService().createExceptionResponse(request, e);
			}

		}

		// SUPERTYPES
		if (method.equals(templateandvalued) && restype != VocabularyTypesInts.individual) {
			Element superTypesElem = XMLHelp.newElement(dataElement, "SuperTypes");
			try {
				getSuperTypes(ontModel, resource, restype, superTypesElem);
			} catch (ModelAccessException e) {
				return ServletUtilities.getService().createExceptionResponse(request, e);
			}
		}

		// PROPERTY DOMAIN/RANGE, FACETS
		if (restype == VocabularyTypesInts.property)
			try {
				enrichXMLForProperty(ontModel, resource.asURIResource(), dataElement);
			} catch (ModelAccessException e) {
				return ServletUtilities.getService().createExceptionResponse(request, e);
			}

		// OTHER PROPERTIES

		Element propertiesElement = XMLHelp.newElement(dataElement, "Properties");

		try {
			for (ARTURIResource prop : sortedProperties) {
				Element propertyElem = XMLHelp.newElement(propertiesElement, "Property");
				propertyElem.setAttribute("name", ontModel.getQName(prop.getURI()));

				if (ontModel.isDatatypeProperty(prop)) {
					propertyElem.setAttribute("type", "owl:DatatypeProperty");
				} else if (ontModel.isObjectProperty(prop)) {
					propertyElem.setAttribute("type", "owl:ObjectProperty");
				} else if (ontModel.isAnnotationProperty(prop)) {
					propertyElem.setAttribute("type", "owl:AnnotationProperty");
				} else if (ontModel.isProperty(prop)) {
					propertyElem.setAttribute("type", "rdf:Property");
				} else {
					propertyElem.setAttribute("type", "unknown"); // this is just a safe exit for discovering
					// bugs, all of them should fall into one
					// of the above 4 property types
				}

				if (propertyValuesMap.containsKey(prop)) // if the property has a a value, which has been
					// collected before
					for (ARTNode value : (Collection<ARTNode>) propertyValuesMap.get(prop)) {
						logger.debug("resource viewer: writing value: " + value + " for property: " + prop);
						
						Element valueElem = RDFXMLHelp.addRDFNodeXMLElement(propertyElem, ontModel, value, true, true);
						
						// EXPLICIT-STATUS ASSIGNMENT
						valueElem.setAttribute("explicit", checkExplicit(ontModel, resource, prop, value));
					}
			}

		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e);
		}
		return response;

	}

	private String checkExplicit(OWLModel ontModel, ARTResource subj, ARTURIResource pred, ARTNode obj)
			throws ModelAccessException {
		if (ontModel.hasTriple(subj, pred, obj, false, NodeFilters.MAINGRAPH))
			return "true";
		else
			return "false";
	}

	protected void injectPropertyDomainXML(OWLModel ontModel, ARTURIResource property, Element treeElement)
			throws ModelAccessException {
		Element domainsElement = XMLHelp.newElement(treeElement, "domains");
		ARTResourceIterator domains = ontModel.listPropertyDomains(property, true, NodeFilters.MAINGRAPH);
		Iterator<ARTResource> filteredDomains = Iterators.filter(domains, URIResourcePredicate.uriFilter);
		Collection<ARTResource> explicitDomains = RDFIterators.getCollectionFromIterator(ontModel
				.listPropertyDomains(property, false, NodeFilters.MAINGRAPH));
		System.out.println("explicitDomains: " + explicitDomains);
		while (filteredDomains.hasNext()) {
			ARTResource nextDomain = filteredDomains.next();
			logger.debug("checking domain: " + nextDomain);
			if (nextDomain.isURIResource()) { // TODO waiting for anonymous resources support
				Element domainElement = XMLHelp.newElement(domainsElement, "domain");
				domainElement.setAttribute("name", ontModel.getQName(nextDomain.asURIResource().getURI()));
				if (explicitDomains.contains(nextDomain))
					domainElement.setAttribute("explicit", "true");
				else
					domainElement.setAttribute("explicit", "false");
			}
		}
		domains.close();
	}

	protected void injectPropertyRangeXML(OWLModel ontModel, ARTURIResource property, Element treeElement,
			boolean visualization) throws ModelAccessException {
		Element rangesElement = XMLHelp.newElement(treeElement, "ranges");
		ARTResourceIterator ranges = ontModel.listPropertyRanges(property, true, NodeFilters.MAINGRAPH);
		Collection<ARTResource> explicitRanges = RDFIterators.getCollectionFromIterator(ontModel
				.listPropertyRanges(property, false, NodeFilters.MAINGRAPH));
		HashSet<ARTResource> rangesSet = new HashSet<ARTResource>();

		while (ranges.hasNext()) {
			ARTResource nextRange = ranges.next();
			rangesSet.add(nextRange);
			Element rangeElement = RDFXMLHelp.addRDFNodeXMLElement(rangesElement, ontModel, nextRange, true, 
					visualization);
			if (explicitRanges.contains(nextRange))
				rangeElement.setAttribute("explicit", "true");
			else
				rangeElement.setAttribute("explicit", "false");
		}
		ranges.close();
		
		try {
			rangesElement.setAttribute("rngType", RDFUtilities.getRangeType(ontModel, property, rangesSet)
					.toString());
		} catch (IncompatibleRangeException e) {
			rangesElement.setAttribute("rngType", "inconsistent");
		}
	}

	private void enrichXMLForProperty(OWLModel ontModel, ARTURIResource property, Element treeElement)
			throws ModelAccessException {

		// DOMAIN AND RANGES
		injectPropertyDomainXML(ontModel, property, treeElement);
		injectPropertyRangeXML(ontModel, property, treeElement, true);

		// FACETS
		Element facetsElement = XMLHelp.newElement(treeElement, "facets");

		if (ontModel.isSymmetricProperty(property)) {
			Element symmetricPropElement = XMLHelp.newElement(facetsElement, "symmetric");
			symmetricPropElement.setAttribute("value", "true");
			if (ontModel.hasTriple(property, RDF.Res.TYPE, OWL.Res.SYMMETRICPROPERTY, false,
					NodeFilters.MAINGRAPH))
				symmetricPropElement.setAttribute("explicit", "true");
			else
				symmetricPropElement.setAttribute("explicit", "false");
		}
		if (ontModel.isFunctionalProperty(property)) {
			Element functionalPropElement = XMLHelp.newElement(facetsElement, "functional");
			functionalPropElement.setAttribute("value", "true");
			if (ontModel.hasTriple(property, RDF.Res.TYPE, OWL.Res.FUNCTIONALPROPERTY, false,
					NodeFilters.MAINGRAPH))
				functionalPropElement.setAttribute("explicit", "true");
			else
				functionalPropElement.setAttribute("explicit", "false");
		}
		if (ontModel.isInverseFunctionalProperty(property)) {
			Element inverseFunctionalPropElement = XMLHelp.newElement(facetsElement, "inverseFunctional");
			inverseFunctionalPropElement.setAttribute("value", "true");
			if (ontModel.hasTriple(property, RDF.Res.TYPE, OWL.Res.INVERSEFUNCTIONALPROPERTY, false,
					NodeFilters.MAINGRAPH))
				inverseFunctionalPropElement.setAttribute("explicit", "true");
			else
				inverseFunctionalPropElement.setAttribute("explicit", "false");
		}
		if (ontModel.isTransitiveProperty(property)) {
			Element transitivePropElement = XMLHelp.newElement(facetsElement, "transitive");
			transitivePropElement.setAttribute("value", "true");
			if (ontModel.hasTriple(property, RDF.Res.TYPE, OWL.Res.TRANSITIVEPROPERTY, false,
					NodeFilters.MAINGRAPH))
				transitivePropElement.setAttribute("explicit", "true");
			else
				transitivePropElement.setAttribute("explicit", "false");
		}
		ARTStatementIterator iterator = ontModel.listStatements(property, OWL.Res.INVERSEOF, NodeFilters.ANY,
				true);
		if (iterator.hasNext()) {
			Element inverseHeaderElement = XMLHelp.newElement(facetsElement, "inverseOf");
			while (iterator.hasNext()) {
				ARTURIResource inverseProp = iterator.next().getObject().asURIResource();
				Element transitivePropElement = XMLHelp.newElement(inverseHeaderElement, "Value");
				transitivePropElement.setAttribute("value", ontModel.getQName(inverseProp.getURI()));
				if (ontModel.hasTriple(property, OWL.Res.INVERSEOF, inverseProp, false, NodeFilters.ANY))
					transitivePropElement.setAttribute("explicit", "true");
				else
					transitivePropElement.setAttribute("explicit", "false");
			}
		}

	}

	public Response getSuperTypes(String request, String resourceQName, int resType) {
		logger.debug("getting supertypes of: " + resourceQName);
		OWLModel ontModel = ProjectManager.getCurrentProject().getOWLModel();
		logger.debug("ontModel: " + ontModel);
		try {

			String newClassURI = ontModel.expandQName(resourceQName);
			ARTURIResource cls = ontModel.createURIResource(newClassURI);
			boolean exists = ModelUtilities.checkExistingResource(ontModel, cls);
			if (!exists) {
				logger.error("there is no resource with name: " + resourceQName);
				return servletUtilities.createExceptionResponse(request, "there is no resource with name: "
						+ resourceQName);
			}
			XMLResponseREPLY response = servletUtilities.createReplyResponse(request, RepliesStatus.ok);
			Element dataElement = response.getDataElement();
			getSuperTypes(ontModel, cls, resType, dataElement);
			return response;
		} catch (ModelAccessException e) {
			logger.error(request + ":" + e);
			return ServletUtilities.getService().createExceptionResponse(request, e);
		}
	}

	protected void getSuperTypes(OWLModel ontModel, ARTResource resource, int restype, Element superTypesElem)
			throws ModelAccessException {
		// TODO filter on admin also here
		Collection<? extends ARTResource> directSuperTypes;
		Collection<? extends ARTResource> directExplicitSuperTypes;

		if (restype == VocabularyTypesInts.cls) {
			directSuperTypes = RDFIterators.getCollectionFromIterator(((DirectReasoning) ontModel)
					.listDirectSuperClasses(resource));
			directExplicitSuperTypes = RDFIterators.getCollectionFromIterator(ontModel.listSuperClasses(
					resource, false));
		} else { // should be - by exclusion - properties
			directSuperTypes = RDFIterators.getCollectionFromIterator(((DirectReasoning) ontModel)
					.listDirectSuperProperties(resource));
			directExplicitSuperTypes = RDFIterators.getCollectionFromIterator(ontModel.listSuperProperties(
					resource.asURIResource(), false));
		}

		for (ARTResource superType : directSuperTypes) {
			if (superType.isURIResource()) // TODO STARRED: improve to add support for restrictions...
			{
				Element superTypeElem = XMLHelp.newElement(superTypesElem, "SuperType");
				superTypeElem.setAttribute("resource", ontModel.getQName(superType.asURIResource().getURI()));
				String explicit;
				if (directExplicitSuperTypes.contains(superType))
					explicit = "true";
				else
					explicit = "false";
				superTypeElem.setAttribute("explicit", explicit);
			}
		}
	}

}
