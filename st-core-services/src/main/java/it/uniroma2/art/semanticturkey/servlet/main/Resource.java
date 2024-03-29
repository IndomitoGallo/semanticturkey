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
 * Contributor(s): Andrea Turbati turbati@info.uniroma2.it
 */
package it.uniroma2.art.semanticturkey.servlet.main;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.exceptions.QueryEvaluationException;
import it.uniroma2.art.owlart.exceptions.UnsupportedQueryLanguageException;
import it.uniroma2.art.owlart.filter.NoLanguageResourcePredicate;
import it.uniroma2.art.owlart.filter.NoSubclassPredicate;
import it.uniroma2.art.owlart.filter.NoSubpropertyPredicate;
import it.uniroma2.art.owlart.filter.NoTypePredicate;
import it.uniroma2.art.owlart.filter.ResourceOfATypePredicate;
import it.uniroma2.art.owlart.filter.StatementWithAnyOfGivenPredicates_Predicate;
import it.uniroma2.art.owlart.filter.StatementWithDatatypePropertyPredicate_Predicate;
import it.uniroma2.art.owlart.filter.SubPropertyOf_Predicate;
import it.uniroma2.art.owlart.model.ARTLiteral;
import it.uniroma2.art.owlart.model.ARTNode;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTStatement;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.DirectReasoning;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.models.SKOSModel;
import it.uniroma2.art.owlart.navigation.ARTLiteralIterator;
import it.uniroma2.art.owlart.navigation.ARTNodeIterator;
import it.uniroma2.art.owlart.navigation.ARTResourceIterator;
import it.uniroma2.art.owlart.navigation.ARTStatementIterator;
import it.uniroma2.art.owlart.navigation.ARTURIResourceIterator;
import it.uniroma2.art.owlart.navigation.RDFIterator;
import it.uniroma2.art.owlart.query.GraphQuery;
import it.uniroma2.art.owlart.query.MalformedQueryException;
import it.uniroma2.art.owlart.utilities.ModelUtilities;
import it.uniroma2.art.owlart.utilities.RDFIterators;
import it.uniroma2.art.owlart.vocabulary.OWL;
import it.uniroma2.art.owlart.vocabulary.RDF;
import it.uniroma2.art.owlart.vocabulary.RDFResourceRolesEnum;
import it.uniroma2.art.owlart.vocabulary.RDFS;
import it.uniroma2.art.owlart.vocabulary.XmlSchema;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.exceptions.IncompatibleRangeException;
import it.uniroma2.art.semanticturkey.exceptions.NonExistingRDFResourceException;
import it.uniroma2.art.semanticturkey.filter.NoSystemResourcePredicate;
import it.uniroma2.art.semanticturkey.filter.StatementWithAProperty_Predicate;
import it.uniroma2.art.semanticturkey.ontology.model.PredicateObjectsList;
import it.uniroma2.art.semanticturkey.ontology.model.PredicateObjectsListFactory;
import it.uniroma2.art.semanticturkey.ontology.utilities.RDFUtilities;
import it.uniroma2.art.semanticturkey.ontology.utilities.RDFXMLHelp;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFNode;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFNodeFactory;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFResource;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.main.filters.StatementWithSubPropertyPredicate_Predicate;
import it.uniroma2.art.semanticturkey.utilities.PropertyShowOrderComparator;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.STVocabUtilities;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.w3c.dom.DOMException;
import org.w3c.dom.Element;

import com.google.common.base.Predicate;
import com.google.common.base.Predicates;
import com.google.common.collect.HashMultimap;
import com.google.common.collect.Iterators;
import com.google.common.collect.Multimap;

@Component
public class Resource extends ServiceAdapter {

	/**
	 * a property filter which removes base language properties such as rdf:type, rdfs:subClassOf and
	 * rdfs:subClassOf
	 */
	protected ArrayList<Predicate<ARTResource>> basePropertyPruningPredicates;

	protected ArrayList<ARTURIResource> bannedPredicatesForResourceDescription;

	@Autowired
	public Resource(@Value("Resource") String id) {
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
	public static final String conceptDescriptionRequest = "getConceptDescription";
	public static final String individualDescriptionRequest = "getIndDescription";
	public static final String ontologyDescriptionRequest = "getOntologyDescription";
	public static final String conceptSchemeDescriptionRequest = "getConceptSchemeDescription";

	public static final String langTag = "lang";

	public static class Req {
		public static final String getPropertyValuesRequest = "getPropertyValues";
		public static final String getPropertyValuesCountRequest = "getPropertyValuesCount";
		public static final String getValuesOfPropertiesRequest = "getValuesOfProperties";
		public static final String getValuesOfPropertiesCountRequest = "getValuesOfPropertiesCount";
		public static final String getTemplatePropertiesRequest = "getTemplateProperties";
		public static final String getValuesOfDatatypePropertiesRequest = "getValuesOfDatatypeProperties";
		public static final String getRoleRequest = "getRole";
	}

	public static class Par {
		public static final String resource = "resource";
		public static final String role = "role";
		public static final String property = "property";
		public static final String properties = "properties";
		public static final String explicit = "explicit";
		public static final String subProp = "subProp";
		public static final String subPropOf = "subPropOf";
		public static final String excludePropItSelf = "excludePropItSelf";
		public static final String excludedProps = "excludedProps";
		public static final String notSubPropOf = "notSubPropOf";
	}

	protected Logger getLogger() {
		return logger;
	}

	public Response getPreCheckedResponse(String request) throws HTTPParameterUnspecifiedException {
		logger.debug("request to Resource");

		Response response = null;
		// all new fashioned requests are put inside these grace brackets
		if (request == null)
			return servletUtilities.createNoSuchHandlerExceptionResponse(request);

		else if (request.equals(Req.getPropertyValuesRequest)) {
			String resourceName = setHttpPar(Par.resource);
			String propertyName = setHttpPar(Par.property);
			checkRequestParametersAllNotNull(Par.resource, Par.property);
			response = getPropertyValues(resourceName, propertyName);
		} else if (request.equals(Req.getPropertyValuesCountRequest)) {
			String resourceName = setHttpPar(Par.resource);
			String propertyName = setHttpPar(Par.property);
			boolean explicit = setHttpBooleanPar(Par.explicit);
			checkRequestParametersAllNotNull(Par.resource, Par.property);
			response = getPropertyValuesCount(resourceName, propertyName, explicit);
		} else if (request.equals(Req.getValuesOfPropertiesRequest)) {
			String resourceName = setHttpPar(Par.resource);
			String propertiesNames = setHttpPar(Par.properties);
			boolean subproperties = setHttpBooleanPar(Par.subProp);
			boolean excludePropItSelf = setHttpBooleanPar(Par.excludePropItSelf, false);
			String excludedProps = setHttpPar(Par.excludedProps);
			checkRequestParametersAllNotNull(Par.resource, Par.properties);
			response = getValuesOfProperties(resourceName, propertiesNames, subproperties, excludePropItSelf,
					excludedProps);
		} else if (request.equals(Req.getValuesOfPropertiesCountRequest)) {
			String resourceName = setHttpPar(Par.resource);
			String propertiesNames = setHttpPar(Par.properties);
			boolean subproperties = setHttpBooleanPar(Par.subProp);
			boolean excludePropItSelf = setHttpBooleanPar(Par.excludePropItSelf, false);
			String excludedProps = setHttpPar(Par.excludedProps);
			checkRequestParametersAllNotNull(Par.resource, Par.properties);
			response = getValuesOfPropertiesCount(resourceName, propertiesNames, subproperties,
					excludePropItSelf, excludedProps);
		} else if (request.equals(Req.getTemplatePropertiesRequest)) {
			String resourceQName = setHttpPar(Par.resource);
			String roleString = setHttpPar(Par.role);
			RDFResourceRolesEnum role = (roleString != null) ? RDFResourceRolesEnum.valueOf(roleString)
					: null;
			String rootProps = setHttpPar(Par.subPropOf);
			String excludedRootProps = setHttpPar(Par.notSubPropOf);
			checkRequestParametersAllNotNull(Par.resource);
			response = getTemplateProperties(resourceQName, role, rootProps, excludedRootProps);
		} else if (request.equals(Req.getValuesOfDatatypePropertiesRequest)) {
			String resourceName = setHttpPar(Par.resource);
			String excludedProps = setHttpPar(Par.excludedProps);
			checkRequestParametersAllNotNull(Par.resource);
			response = getValuesOfDatatypeProperties(resourceName, excludedProps);
		} else if (request.equals(Req.getRoleRequest )) {
			String resourceName = setHttpPar(Par.resource);
			response = getRole(resourceName);
		} else
			return servletUtilities.createNoSuchHandlerExceptionResponse(request);

		this.fireServletEvent();
		return response;
	}

	private Response getRole(String resourceName) {
		OWLModel model = getOWLModel();
		ARTResource[] graphs;
		try {
			graphs = getUserNamedGraphs();
			ARTResource resource = retrieveExistingResource(model, resourceName, graphs);
			RDFResourceRolesEnum role = ModelUtilities.getResourceRole(resource, model);
			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
			Element data = response.getDataElement();
			Element roleElement = XMLHelp.newElement(data, "value", role.toString());
			roleElement.setAttribute("type", XmlSchema.STRING);
			return response;
		} catch (NonExistingRDFResourceException e) {
			e.printStackTrace();
			return logAndSendException(e);
		} catch (ModelAccessException e) {
			e.printStackTrace();
			return logAndSendException(e);
		}
	}

	public Response getPropertyValues(String resourceName, String propertyName) {
		OWLModel model = getOWLModel();
		ARTResource[] graphs;
		try {
			graphs = getUserNamedGraphs();
			ARTResource resource = retrieveExistingResource(model, resourceName, graphs);
			ARTURIResource property = model.createURIResource(propertyName);
			ARTNodeIterator it = model.listValuesOfSubjPredPair(resource, property, true, graphs);

			Collection<ARTNode> explicitValues = RDFIterators.getCollectionFromIterator(model
					.listValuesOfSubjPredPair(resource, property, false, getWorkingGraph()));

			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

			Collection<STRDFNode> values = STRDFNodeFactory.createEmptyNodeCollection();
			while (it.streamOpen()) {
				ARTNode next = it.getNext();
				boolean explicit;
				if (explicitValues.contains(next))
					explicit = true;
				else
					explicit = false;
				values.add(STRDFNodeFactory.createSTRDFNode(model, next, true, explicit, true));
			}
			it.close();
			RDFXMLHelp.addRDFNodes(response, values);
			return response;

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
	}

	public Response getPropertyValuesCount(String resourceName, String propertyName, boolean explicit) {
		OWLModel model = getOWLModel();
		ARTResource[] graphs;
		try {
			graphs = getUserNamedGraphs();
			ARTResource resource = retrieveExistingResource(model, resourceName, graphs);
			ARTURIResource property = model.createURIResource(propertyName);
			ARTNodeIterator it = model.listValuesOfSubjPredPair(resource, property, !explicit, graphs);

			Collection<ARTNode> values = RDFIterators.getCollectionFromIterator(it);

			XMLResponseREPLY response = createIntegerResponse(values.size());
			return response;

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
	}

	public Response getValuesOfProperties(String resourceName, String propertiesNames, boolean subProp,
			boolean excludePropItSelf, String excludedProps) {
		try {

			ARTResource[] graphs;
			graphs = getUserNamedGraphs();

			OWLModel model = getOWLModel();
			ARTResource resource = retrieveExistingResource(model, resourceName, graphs);
			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

			if (excludePropItSelf && !subProp) {
				response.setReplyStatusFAIL("It is not possible to exclude the property(ies) itself "
						+ "(themself) and the subProp as well");
				return response;
			}

			String resourceURI = resource.getNominalValue();

			String query;

			query = "CONSTRUCT { <" + resourceURI + ">  ?prop ?value}" + "\nWHERE {";

			boolean first = true;
			if (!excludePropItSelf) {
				for (String propName : propertiesNames.split("\\|_\\|")) {
					if (!first)
						query += "\nUNION";
					else
						first = false;
					query += "\n{<" + resourceURI + "> <" + model.expandQName(propName) + "> ?value . "
							+ "\nBIND ((<" + model.expandQName(propName) + ">) AS ?prop)}";
				}
			}

			if (subProp) {
				for (String propName : propertiesNames.split("\\|_\\|")) {
					if (!first)
						query += "\nUNION";
					else
						first = false;
					query += "\n{?prop <http://www.w3.org/2000/01/rdf-schema#subPropertyOf>+ <"
							+ model.expandQName(propName) + "> . " + "\n<" + resourceURI + "> ?prop ?value ."
							+ "\nFILTER(?prop != <" + model.expandQName(propName) + "> ) }";
				}
			}

			query += "\n}";
			logger.debug("query = " + query);

			GraphQuery graphQuery = model.createGraphQuery(query);
			ARTStatementIterator inferretIt = graphQuery.evaluate(true);
			ARTStatementIterator explicitIt = graphQuery.evaluate(false);

			// remove the excluded properties from the inferred list/iterator
			List<String> excludedPropList = new ArrayList<String>();
			if (excludedProps != null) {
				for (String propName : excludedProps.split("\\|_\\|")) {
					excludedPropList.add(model.expandQName(propName));
				}
			}

			List<ARTStatement> inferredList = new ArrayList<ARTStatement>();
			while (inferretIt.hasNext()) {
				ARTStatement stat = inferretIt.getNext();
				String predURI = stat.getPredicate().getURI();
				if (!excludedPropList.contains(predURI)) {
					inferredList.add(stat);
				}
			}
			inferretIt.close();

			PredicateObjectsList predObjList = PredicateObjectsListFactory.createPredicateObjectsList(model,
					RDFResourceRolesEnum.property,
					RDFIterators.createARTStatementIterator(inferredList.iterator()), explicitIt);

			explicitIt.close();

			RDFXMLHelp.addPredicateObjectList(response, predObjList);

			return response;
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		} catch (UnsupportedQueryLanguageException e) {
			return logAndSendException(e);
		} catch (MalformedQueryException e) {
			return logAndSendException(e);
		} catch (QueryEvaluationException e) {
			return logAndSendException(e);
		}
	}

	public Response getValuesOfPropertiesHierarchically(String resourceName, String propertiesNames,
			boolean subProp, boolean excludePropItSelf, String excludedProps) {
		String[] propsNames = propertiesNames.split("\\|_\\|");
		OWLModel model = getOWLModel();
		ARTResource[] graphs;
		HashSet<String> excludedPropSet = new HashSet<String>();
		try {
			graphs = getUserNamedGraphs();
			ARTResource resource = retrieveExistingResource(model, resourceName, graphs);
			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

			Element dataElement = response.getDataElement();

			if (excludedProps != null) {
				for (String excludedPropName : excludedProps.split("\\|_\\|"))
					excludedPropSet.add(model.expandQName(excludedPropName));
			}

			for (String propName : propsNames) {

				ARTURIResource property = model.createURIResource(model.expandQName(propName));
				getValuesOfPropertiesHierarchically(resource, property, subProp, excludePropItSelf, graphs,
						model, dataElement, excludedPropSet);
			}
			return response;

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
	}

	private void getValuesOfPropertiesHierarchically(ARTResource resource, ARTURIResource property,
			boolean subProp, boolean excludePropItSelf, ARTResource[] graphs, OWLModel model,
			Element dataElement, HashSet<String> excludedPropSet) throws NonExistingRDFResourceException,
			ModelAccessException {

		if (excludedPropSet.contains(property.getURI()))
			return;

		Element extCollection = XMLHelp.newElement(dataElement, "collection");
		Element propValuesElem = XMLHelp.newElement(extCollection, "propertyValues");

		Element propElem = XMLHelp.newElement(propValuesElem, "property");
		RDFXMLHelp.addRDFResource(propElem, STRDFNodeFactory.createSTRDFURI(property, true));

		if (excludePropItSelf == false) {
			Element valuesElem = XMLHelp.newElement(propValuesElem, "values");
			ARTNodeIterator it = model.listValuesOfSubjPredPair(resource, property, true, graphs);
			Collection<ARTNode> explicitValues = RDFIterators.getCollectionFromIterator(model
					.listValuesOfSubjPredPair(resource, property, false, getWorkingGraph()));

			Collection<STRDFNode> values = STRDFNodeFactory.createEmptyNodeCollection();
			while (it.streamOpen()) {
				ARTNode next = it.getNext();
				boolean explicit;
				if (explicitValues.contains(next))
					explicit = true;
				else
					explicit = false;
				values.add(STRDFNodeFactory.createSTRDFNode(model, next, true, explicit, true));
			}
			it.close();
			RDFXMLHelp.addRDFNodes(valuesElem, values);
		}

		if (subProp) {
			ARTURIResourceIterator iter = ((DirectReasoning) model).listDirectSubProperties(property, graphs);
			while (iter.hasNext()) {
				ARTURIResource subPropRes = iter.next();
				getValuesOfPropertiesHierarchically(resource, subPropRes, subProp, false, graphs, model,
						propValuesElem, excludedPropSet);
			}

		}
	}

	public Response getValuesOfPropertiesCount(String resourceName, String propertiesNames, boolean subProp,
			boolean excludePropItSelf, String excludedProps) {

		OWLModel model = getOWLModel();
		try {

			ARTResource[] graphs;

			graphs = getUserNamedGraphs();
			ARTResource resource = retrieveExistingResource(model, resourceName, graphs);
			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

			if (excludePropItSelf && !subProp) {
				response.setReplyStatusFAIL("It is not possible to exclude the property(ies) itsself "
						+ "(themself) and the subProp as well");
				return response;
			}

			// getting inferred triples but filtered
			ARTStatementIterator inferredTriples = model.listStatements(resource, NodeFilters.ANY,
					NodeFilters.ANY, true, graphs);

			// basic filter on subproperties prop values. There can be more than one properties
			Predicate<ARTStatement> statementFilter = null;
			HashSet<ARTURIResource> propSet = new HashSet<ARTURIResource>();
			for (String propName : propertiesNames.split("\\|_\\|"))
				propSet.add(model.createURIResource(model.expandQName(propName)));
			if (subProp) {
				statementFilter = StatementWithSubPropertyPredicate_Predicate.getFilter(model, propSet,
						excludePropItSelf, getUserNamedGraphs());
			} else { // subProp == false
				statementFilter = StatementWithAnyOfGivenPredicates_Predicate.getFilter(propSet);
			}

			if (excludedProps != null) {
				HashSet<ARTURIResource> excludedPropSet = new HashSet<ARTURIResource>();
				for (String excludedPropName : excludedProps.split("\\|_\\|"))
					excludedPropSet.add(model.createURIResource(model.expandQName(excludedPropName)));
				// only in case excludedProps is being specified, then the statementFilter is enriched with a
				// negative filter on the set of excluded properties
				statementFilter = Predicates.and(statementFilter, Predicates
						.not(StatementWithAnyOfGivenPredicates_Predicate.getFilter(excludedPropSet)));
			}

			// only the inferred statement iterator is being filtered, as it is the one being used for
			// reporting results, the explicit statement iterator is instead only used to check which of the
			// above statements are explicit
			Iterator<ARTStatement> inferredFilteredOnSubPropTriples = Iterators.filter(inferredTriples,
					statementFilter);

			ARTStatementIterator explicitStatements = model.listStatements(resource, NodeFilters.ANY,
					NodeFilters.ANY, false, getWorkingGraph());

			PredicateObjectsList predObjList = PredicateObjectsListFactory.createPredicateObjectsList(model,
					RDFResourceRolesEnum.property,
					RDFIterators.createARTStatementIterator(inferredFilteredOnSubPropTriples),
					explicitStatements);

			// TODO
			// createPredicateObjectsList automatically closes the input iterator, but the iterator passed to
			// it is a wrapper around the standard iterator wrapped-in-turn around inferredDatatypedTriples.
			// This is a clear example of why I should write my own filtering iterator, maybe through a
			// filterIterator(RDFIterator, predicate) put in RDFIterators.
			// class "Predicate" from lib google-collections may still be used
			inferredTriples.close();

			Element dataElement = response.getDataElement();
			Element extCollection = XMLHelp.newElement(dataElement, "collection");
			for (STRDFResource pred : predObjList.getPredicates()) {
				Collection<STRDFNode> values = predObjList.getValues(pred);
				int countExplicit = 0, countTotal = 0;
				for (STRDFNode value : values) {
					++countTotal;
					if (value.isExplicit())
						++countExplicit;
				}

				pred.setInfo("valuesCount", countTotal + "");
				pred.setInfo("valuesExplicitCount", countExplicit + "");
				RDFXMLHelp.addRDFNode(extCollection, pred);
			}

			return response;
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
	}

	public Response getValuesOfPropertiesHierarchicallyCount(String resourceName, String propertiesNames,
			boolean subProp, boolean excludePropItSelf, String excludedProps) {
		String[] propsNames = propertiesNames.split("\\|_\\|");
		OWLModel model = getOWLModel();
		ARTResource[] graphs;
		HashSet<String> excludedPropSet = new HashSet<String>();
		try {
			graphs = getUserNamedGraphs();
			ARTResource resource = retrieveExistingResource(model, resourceName, graphs);
			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

			Element dataElement = response.getDataElement();

			if (excludedProps != null) {
				for (String excludedPropName : excludedProps.split("\\|_\\|"))
					excludedPropSet.add(model.expandQName(excludedPropName));
			}

			for (String propName : propsNames) {
				ARTURIResource property = model.createURIResource(model.expandQName(propName));
				getValuesOfPropertiesHierarchicallyCount(resource, property, subProp, excludePropItSelf,
						graphs, model, dataElement, excludedPropSet);
			}
			return response;

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
	}

	private void getValuesOfPropertiesHierarchicallyCount(ARTResource resource, ARTURIResource property,
			boolean subProp, boolean excludePropItSelf, ARTResource[] graphs, OWLModel model,
			Element outerElement, HashSet<String> excludedPropSet) throws ModelAccessException {

		if (excludedPropSet.contains(property.getURI()))
			return;

		Element extCollection = XMLHelp.newElement(outerElement, "collection");
		Element propValuesElem = XMLHelp.newElement(extCollection, "propertyValues");

		Element propElem = XMLHelp.newElement(propValuesElem, "property");

		RDFXMLHelp.addRDFResource(propElem, STRDFNodeFactory.createSTRDFURI(property, true));

		ARTNodeIterator it = model.listValuesOfSubjPredPair(resource, property, true, graphs);
		Collection<ARTNode> explicitValues = RDFIterators.getCollectionFromIterator(model
				.listValuesOfSubjPredPair(resource, property, false, graphs));

		int contAll = 0;
		int contExplicit = 0;

		if (excludePropItSelf == false) {
			while (it.streamOpen()) {
				ARTNode artNode = it.getNext();
				++contAll;
				if (explicitValues.contains(artNode))
					++contExplicit;
			}
			XMLHelp.newElement(propValuesElem, "valuesCount", contAll + "");
			XMLHelp.newElement(propValuesElem, "valuesExplicitCount", contExplicit + "");

			it.close();
		}

		if (subProp) {
			ARTURIResourceIterator iter = ((DirectReasoning) model).listDirectSubProperties(property, graphs);
			while (iter.hasNext()) {
				ARTURIResource subPropRes = iter.next();
				getValuesOfPropertiesHierarchicallyCount(resource, subPropRes, subProp, false, graphs, model,
						propValuesElem, excludedPropSet);
			}
		}
	}

	protected Response getValuesOfDatatypeProperties(String resourceName, String excludedProps) {

		OWLModel model = getOWLModel();

		try {

			ARTResource[] graphs;

			graphs = getUserNamedGraphs();
			ARTResource resource = retrieveExistingResource(model, resourceName, graphs);
			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

			// getting inferred triples but filtered
			ARTStatementIterator inferredTriples = model.listStatements(resource, NodeFilters.ANY,
					NodeFilters.ANY, true, graphs);

			// basic filter on datatype prop values
			Predicate<ARTStatement> statementFilter = StatementWithDatatypePropertyPredicate_Predicate
					.getFilter(model);

			// prepare a statement filter which excludes triples where the property is a subprop of one of the
			// excluded ones
			HashSet<ARTURIResource> excludedPropSet = parseURIResourceSet(model, excludedProps);
			if (excludedPropSet != null) {
				// only in case excludedProps is being specified, then the statementFilter is enriched with a
				// negative filter on the set of excluded properties
				logger.debug("excluded props from getValuesOfDatatypeProperties: " + excludedPropSet);
				for (ARTURIResource excludedProp : excludedPropSet) {
					statementFilter = Predicates.and(statementFilter,
							Predicates.not(StatementWithAProperty_Predicate.getFilter(model, excludedProp)));
				}
			}

			// only the inferred statement iterator is being filtered, as it is the one being used for
			// reporting results, the explicit statement iterator is instead only used to check which of the
			// above statements are explicit
			Iterator<ARTStatement> inferredFilteredDatatypeTriples = Iterators.filter(inferredTriples,
					statementFilter);

			ARTStatementIterator explicitStatements = model.listStatements(resource, NodeFilters.ANY,
					NodeFilters.ANY, false, getWorkingGraph());

			PredicateObjectsList predObjList = PredicateObjectsListFactory.createPredicateObjectsList(model,
					RDFResourceRolesEnum.datatypeProperty,
					RDFIterators.createARTStatementIterator(inferredFilteredDatatypeTriples),
					explicitStatements);

			// TODO
			// createPredicateObjectsList automatically closes the input iterator, but the iterator passed to
			// it is a wrapper around the standard iterator wrapped-in-turn around inferredDatatypedTriples.
			// This is a clear example of why I should write my own filtering iterator, maybe through a
			// filterIterator(RDFIterator, predicate) put in RDFIterators.
			// class "Predicate" from lib google-collections may still be used
			inferredTriples.close();

			RDFXMLHelp.addPredicateObjectList(response, predObjList);

			return response;

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
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
	protected Response getResourceDescription(String resourceQName, RDFResourceRolesEnum restype,
			String method) {
		RDFModel ontModel = ProjectManager.getCurrentProject().getOntModel();
		logger.debug("class for the ontModel is: " + ontModel.getClass());
		OWLModel owlModel = ProjectManager.getCurrentProject().getOWLModel();

		ARTResource resource;
		try {
			ARTResource[] graphs = getUserNamedGraphs();
			resource = retrieveExistingURIResource(ontModel, resourceQName, graphs);
			HashSet<ARTURIResource> properties = new HashSet<ARTURIResource>();

			// TEMPLATE PROPERTIES (properties which can be shown since the
			// selected instance has at least a
			// type which falls in their domain)
			extractTemplateProperties(owlModel, resource, null, properties, null, null, graphs);

			// VALUED PROPERTIES (properties over which the selected instance
			// has one or more values)
			Multimap<ARTURIResource, ARTNode> propertyValuesMap = HashMultimap.create();
			// if I want the collection of values for each property to be a set,
			// i could use MultiValueMap,
			// and define an HashSet Factory
			if (method.equals(templateandvalued)) {
				extractValuedProperties(owlModel, restype, resource, properties, propertyValuesMap, graphs);
			}
			// XML COMPILATION SECTION
			return getXMLResourceDescription(ontModel, resource, restype, method, properties,
					propertyValuesMap, graphs);

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}

	}

	protected HashSet<ARTURIResource> parseURIResourceSet(RDFModel model, String uris)
			throws ModelAccessException {
		if (uris == null)
			return null;
		HashSet<ARTURIResource> uriSet = new HashSet<ARTURIResource>();
		for (String rootPropName : uris.split("\\|_\\|"))
			uriSet.add(model.createURIResource(model.expandQName(rootPropName)));
		return uriSet;
	}

	public Response getTemplateProperties(String resourceQName, RDFResourceRolesEnum role,
			String rootPropsString, String excludedRootPropsString) {
		OWLModel ontModel = ProjectManager.getCurrentProject().getOWLModel();
		ARTResource[] graphs;
		try {
			graphs = getUserNamedGraphs();
			ARTResource resource = retrieveExistingResource(ontModel, resourceQName, graphs);

			HashSet<ARTURIResource> rootProps = parseURIResourceSet(ontModel, rootPropsString);
			HashSet<ARTURIResource> excludedRootProps = parseURIResourceSet(ontModel, excludedRootPropsString);

			HashSet<ARTURIResource> props = extractTemplateProperties(ontModel, resource, role, rootProps,
					excludedRootProps, graphs);
			Collection<STRDFResource> result = STRDFNodeFactory.createEmptyResourceCollection();

			if (role == null) {
				// if all properties, then compute the role
				for (ARTURIResource prop : props) {
					result.add(STRDFNodeFactory.createSTRDFURI(prop,
							ModelUtilities.getPropertyRole(prop, ontModel), true,
							ontModel.getQName(prop.getURI())));
				}
			} else {
				// if filtered from a specific type, then forward the role to the ST RDF URI
				for (ARTURIResource prop : props) {
					result.add(STRDFNodeFactory.createSTRDFURI(prop, role, true,
							ontModel.getQName(prop.getURI())));
				}
			}

			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
			RDFXMLHelp.addRDFNodes(response, result);
			return response;

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
	}

	/**
	 * same as
	 * {@link #extractTemplateProperties(OWLModel, ARTResource, RDFResourceRolesEnum, HashSet, HashSet, HashSet, ARTResource...)}
	 * but it builds internally the HashSet where to store the properties, and returns it.
	 * 
	 * @param ontModel
	 * @param resource
	 * @param role
	 * @param rootProps
	 * @param excludedRootProps
	 * @param graphs
	 * @return
	 * @throws ModelAccessException
	 */
	protected HashSet<ARTURIResource> extractTemplateProperties(OWLModel ontModel, ARTResource resource,
			RDFResourceRolesEnum role, HashSet<ARTURIResource> rootProps,
			HashSet<ARTURIResource> excludedRootProps, ARTResource... graphs) throws ModelAccessException {
		HashSet<ARTURIResource> properties = new HashSet<ARTURIResource>();
		extractTemplateProperties(ontModel, resource, role, properties, rootProps, excludedRootProps, graphs);
		return properties;
	}

	// TODO generate specific filters for classes, properties and individuals
	/**
	 * this part runs across all the types of the explored resource, reporting all the properties
	 * comprehending one of these types in their domain and storing them into <code>targetProperties</code>
	 * 
	 * @param ontModel
	 * @param resource
	 * @param role
	 * @param targetProperties
	 * @param rootProps
	 * @param excludedRootProps
	 * @param graphs
	 * @throws ModelAccessException
	 */
	protected void extractTemplateProperties(OWLModel ontModel, ARTResource resource,
			RDFResourceRolesEnum role, HashSet<ARTURIResource> targetProperties,
			HashSet<ARTURIResource> rootProps, HashSet<ARTURIResource> excludedRootProps,
			ARTResource... graphs) throws ModelAccessException {

		// by first, the specified role must be either null (all properties) or any of the property related
		// roles
		if (role != null && !role.isProperty())
			throw new IllegalArgumentException("role: " + role + " is not a property role");

		ARTResourceIterator types = ontModel.listTypes(resource, true, graphs);
		extractPropertiesForDomains(ontModel, types, role, targetProperties, rootProps, excludedRootProps,
				graphs);
		types.close();
	}

	public Response getPropertiesForDomains(String classNames, RDFResourceRolesEnum role,
			String rootPropsString, String excludedRootPropsString) {
		OWLModel ontModel = ProjectManager.getCurrentProject().getOWLModel();
		ARTResource[] graphs;
		try {
			graphs = getUserNamedGraphs();

			HashSet<ARTURIResource> domains = parseURIResourceSet(ontModel, classNames);
			ARTURIResourceIterator domainsIterator = RDFIterators.createARTURIResourceIterator(domains
					.iterator());

			HashSet<ARTURIResource> rootProps = parseURIResourceSet(ontModel, rootPropsString);
			HashSet<ARTURIResource> excludedRootProps = parseURIResourceSet(ontModel, excludedRootPropsString);

			HashSet<ARTURIResource> props = extractPropertiesForDomains(ontModel, domainsIterator, role,
					rootProps, excludedRootProps, graphs);
			Collection<STRDFResource> result = STRDFNodeFactory.createEmptyResourceCollection();

			if (role == null) {
				// if all properties, then compute the role
				for (ARTURIResource prop : props) {
					result.add(STRDFNodeFactory.createSTRDFURI(prop,
							ModelUtilities.getPropertyRole(prop, ontModel), true,
							ontModel.getQName(prop.getURI())));
				}
			} else {
				// if filtered from a specific type, then forward the role to the ST RDF URI
				for (ARTURIResource prop : props) {
					result.add(STRDFNodeFactory.createSTRDFURI(prop, role, true,
							ontModel.getQName(prop.getURI())));
				}
			}

			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
			RDFXMLHelp.addRDFNodes(response, result);
			return response;

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
	}

	/**
	 * same as
	 * {@link #extractPropertiesForDomains(OWLModel, ARTResourceIterator, RDFResourceRolesEnum, HashSet, HashSet, HashSet, ARTResource...)}
	 * but it builds internally the HashSet where to store the properties, and returns it.
	 * 
	 * @param ontModel
	 * @param domains
	 *            this iterator is not closed at the end of this method, so remember to close it
	 * @param role
	 * @param rootProps
	 * @param excludedRootProps
	 * @param graphs
	 * @return
	 * @throws ModelAccessException
	 */
	protected HashSet<ARTURIResource> extractPropertiesForDomains(OWLModel ontModel,
			RDFIterator<? extends ARTResource> domains, RDFResourceRolesEnum role,
			HashSet<ARTURIResource> rootProps, HashSet<ARTURIResource> excludedRootProps,
			ARTResource... graphs) throws ModelAccessException {
		HashSet<ARTURIResource> properties = new HashSet<ARTURIResource>();
		extractPropertiesForDomains(ontModel, domains, role, properties, rootProps, excludedRootProps, graphs);
		return properties;
	}

	public void extractPropertiesForDomains(OWLModel ontModel, RDFIterator<? extends ARTResource> domains,
			RDFResourceRolesEnum role, HashSet<ARTURIResource> targetProperties,
			HashSet<ARTURIResource> rootProps, HashSet<ARTURIResource> excludedRootProps,
			ARTResource... graphs) throws ModelAccessException {
		// by first, the specified role must be either null (all properties) or any of the property related
		// roles
		if (role != null && !role.isProperty())
			throw new IllegalArgumentException("role: " + role + " is not a property role");

		// **** TYPES FILTER preparation ****

		// gets only domain types, no rdf/rdfs/owl language classes cited in the
		// types nor, if in userStatus,
		// any type class from any application ontology
		Predicate<ARTResource> typesFilter = NoLanguageResourcePredicate.nlrPredicate;
		typesFilter = Predicates.and(typesFilter, NoSystemResourcePredicate.noSysResPred);

		// **** PROPERTIES FILTER preparation ****

		// I had to made this very strange thing using "super", as I was not able to mix predicates on
		// ARTResource and ARTURIResource by use of <? extends ARTResource>
		Collection<Predicate<? super ARTURIResource>> pruningPredicates = new ArrayList<Predicate<? super ARTURIResource>>();
		// template props are pruned of type/subclass/subproperty declarations
		pruningPredicates.addAll(basePropertyPruningPredicates);
		pruningPredicates.add(NoSystemResourcePredicate.noSysResPred);
		// if null, all kind of properties are ok, no filtering
		if (role != null)
			pruningPredicates.add(ResourceOfATypePredicate.getPredicate(ontModel, role.getRDFURIResource()));

		if (rootProps != null) {
			for (ARTURIResource prop : rootProps)
				pruningPredicates.add(SubPropertyOf_Predicate.getPredicate(ontModel, prop));
		}

		if (excludedRootProps != null) {
			for (ARTURIResource prop : excludedRootProps)
				pruningPredicates.add(Predicates.not(SubPropertyOf_Predicate.getPredicate(ontModel, prop)));
		}

		Predicate<ARTURIResource> propsExclusionPredicate = Predicates.and(pruningPredicates);

		logger.debug("getting properties which have domain set on the following types: " + domains);
		Iterator<? extends ARTResource> filteredTypesIterator = Iterators.filter(domains, typesFilter);
		while (filteredTypesIterator.hasNext()) {
			ARTResource typeCls = (ARTResource) filteredTypesIterator.next();
			if (typeCls.isURIResource()) {
				Iterator<ARTURIResource> filteredPropsIterator = Iterators
						.filter(ontModel.listPropertiesForDomainClass(typeCls, true, graphs),
								propsExclusionPredicate);
				while (filteredPropsIterator.hasNext()) {
					targetProperties.add(filteredPropsIterator.next());
				}
			}
		}
	}

	// TODO generate specific filters for classes, properties and individuals
	protected void extractValuedProperties(OWLModel ontModel, RDFResourceRolesEnum restype,
			ARTResource resource, HashSet<ARTURIResource> properties,
			Multimap<ARTURIResource, ARTNode> propertyValuesMap, ARTResource... graphs)
			throws ModelAccessException {
		ARTStatementIterator stit = ontModel.listStatements(resource, NodeFilters.ANY, NodeFilters.ANY, true,
				graphs);

		bannedPredicatesForResourceDescription = new ArrayList<ARTURIResource>();

		bannedPredicatesForResourceDescription.add(RDF.Res.TYPE);

		if (restype == RDFResourceRolesEnum.ontology) {
			bannedPredicatesForResourceDescription.add(OWL.Res.IMPORTS);
		} else if (restype == RDFResourceRolesEnum.cls) {
			bannedPredicatesForResourceDescription.add(RDFS.Res.SUBCLASSOF);
		} else if (restype == RDFResourceRolesEnum.property) {
			bannedPredicatesForResourceDescription.add(RDFS.Res.SUBPROPERTYOF);
			bannedPredicatesForResourceDescription.add(RDFS.Res.DOMAIN);
			bannedPredicatesForResourceDescription.add(RDFS.Res.RANGE);
			bannedPredicatesForResourceDescription.add(OWL.Res.INVERSEOF);
		} else if (restype == RDFResourceRolesEnum.concept) {
			bannedPredicatesForResourceDescription.add(it.uniroma2.art.owlart.vocabulary.SKOS.Res.BROADER);
			bannedPredicatesForResourceDescription
					.add(it.uniroma2.art.owlart.vocabulary.SKOS.Res.BROADERTRANSITIVE);
			bannedPredicatesForResourceDescription.add(it.uniroma2.art.owlart.vocabulary.SKOS.Res.PREFLABEL);
			// bannedPredicatesForResourceDescription.add(it.uniroma2.art.owlart.vocabulary.SKOS.Res.ALTLABEL);
		} else if (restype == RDFResourceRolesEnum.conceptScheme) {
			bannedPredicatesForResourceDescription.add(it.uniroma2.art.owlart.vocabulary.SKOS.Res.PREFLABEL);
			bannedPredicatesForResourceDescription
					.add(it.uniroma2.art.owlart.vocabulary.SKOS.Res.HASTOPCONCEPT);
		}

		boolean bnodeFilter = setHttpBooleanPar("bnodeFilter");

		while (stit.hasNext()) {
			ARTStatement st = stit.next();
			ARTURIResource valuedProperty = st.getPredicate();

			if (!bannedPredicatesForResourceDescription.contains(valuedProperty)
					&& !STVocabUtilities.isHiddenResource(valuedProperty)) {

				ARTNode value = st.getObject();

				if (!bnodeFilter || !value.isBlank()) {
					logger.debug("adding " + st.getObject() + " to " + valuedProperty + " bucket");
					properties.add(valuedProperty);
					propertyValuesMap.put(valuedProperty, value);
				}
			}
		}
	}

	protected Response getXMLResourceDescription(RDFModel ontModel, ARTResource resource,
			RDFResourceRolesEnum restype, String method, HashSet<ARTURIResource> properties,
			Multimap<ARTURIResource, ARTNode> propertyValuesMap, ARTResource... graphs) {

		OWLModel owlModel = toOWLModel(ontModel);
		ArrayList<ARTURIResource> sortedProperties = new ArrayList<ARTURIResource>(properties);
		logger.debug("sortedProperties: " + sortedProperties);
		Collections.sort(sortedProperties, new PropertyShowOrderComparator(owlModel));

		// RESPONSE PREPARATION
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		dataElement.setAttribute("type", method);

		System.out.println("method = " + method);
		if (method.equals(templateandvalued)) {
			try {

				// **********
				// TYPES
				Element typesElement = XMLHelp.newElement(dataElement, "Types");

				// TODO filter on admin also here

				Collection<ARTResource> directTypes = RDFIterators
						.getCollectionFromIterator(((DirectReasoning) ontModel).listDirectTypes(resource,
								graphs));
				Collection<ARTResource> directExplicitTypes = RDFIterators.getCollectionFromIterator(ontModel
						.listTypes(resource, false, getWorkingGraph()));

				Collection<STRDFResource> stTypes = STRDFNodeFactory.createEmptyResourceCollection();
				for (ARTResource type : directTypes) {
					// TODO remove when unnamed types are supported
					stTypes.add(STRDFNodeFactory.createSTRDFResource(ontModel, type, true,
							directExplicitTypes.contains(type), true));
				}

				RDFXMLHelp.addRDFNodes(typesElement, stTypes);

				// **********
				// SUPERTYPES
				if (restype == RDFResourceRolesEnum.cls || restype == RDFResourceRolesEnum.property
						|| restype == RDFResourceRolesEnum.concept) {
					Element superTypesElem = XMLHelp.newElement(dataElement, "SuperTypes");
					collectParents(owlModel, resource, restype, superTypesElem, graphs);
				}

				// LABELS
				if (restype == RDFResourceRolesEnum.concept || restype == RDFResourceRolesEnum.conceptScheme) {
					Element prefLabelsElem = XMLHelp.newElement(dataElement, "prefLabels");
					collectPrefLabels((SKOSModel) ontModel, resource.asURIResource(), restype,
							prefLabelsElem, graphs);
				}

				// TOPCONCEPTS
				if (restype == RDFResourceRolesEnum.conceptScheme) {
					Element topConceptsElem = XMLHelp.newElement(dataElement, "topConcepts");
					collectTopConcepts((SKOSModel) ontModel, resource.asURIResource(), restype,
							topConceptsElem, graphs);
				}

			} catch (ModelAccessException e) {
				return logAndSendException(e);
			} catch (NonExistingRDFResourceException e) {
				return logAndSendException(e);
			}
		}

		// PROPERTY DOMAIN/RANGE, FACETS
		try {

			if (restype == RDFResourceRolesEnum.property)
				enrichXMLForProperty(owlModel, resource.asURIResource(), dataElement, graphs);

			if (restype == RDFResourceRolesEnum.ontology) {
				Element importsElem = XMLHelp.newElement(dataElement, "Imports");
				collectImports(owlModel, resource.asURIResource(), importsElem, graphs);
			}

			// OTHER PROPERTIES

			Element propertiesElement = XMLHelp.newElement(dataElement, "Properties");

			for (ARTURIResource prop : sortedProperties) {
				Element propertyElem = XMLHelp.newElement(propertiesElement, "Property");
				propertyElem.setAttribute("name", ontModel.getQName(prop.getURI()));

				if (owlModel.isDatatypeProperty(prop, graphs)) {
					propertyElem.setAttribute("type", "owl:DatatypeProperty");
				} else if (owlModel.isObjectProperty(prop, graphs)) {
					propertyElem.setAttribute("type", "owl:ObjectProperty");
				} else if (owlModel.isAnnotationProperty(prop, graphs)) {
					propertyElem.setAttribute("type", "owl:AnnotationProperty");
				} else if (owlModel.isOntologyProperty(prop, graphs)) {
					propertyElem.setAttribute("type", "owl:OntologyProperty");
				} else if (owlModel.isProperty(prop, graphs)) {
					propertyElem.setAttribute("type", "rdf:Property");
				} else {
					propertyElem.setAttribute("type", "unknown"); // this is
																	// just a
																	// safe exit
																	// for
																	// discovering
					// bugs, all of them should fall into one
					// of the above 4 property types
				}

				if (propertyValuesMap.containsKey(prop)) // if the property has
															// a a value, which
															// has been
					// collected before
					for (ARTNode value : (Collection<ARTNode>) propertyValuesMap.get(prop)) {
						logger.debug("resource viewer: writing value: " + value + " for property: " + prop);

						Element valueElem = RDFXMLHelp.addRDFNode(propertyElem, ontModel, value, true, true);

						// EXPLICIT-STATUS ASSIGNMENT
						valueElem.setAttribute("explicit", checkExplicit(owlModel, resource, prop, value));
					}
			}

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (DOMException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;

	}

	private String checkExplicit(OWLModel ontModel, ARTResource subj, ARTURIResource pred, ARTNode obj)
			throws ModelAccessException, NonExistingRDFResourceException {
		if (ontModel.hasTriple(subj, pred, obj, false, getWorkingGraph()))
			return "true";
		else
			return "false";
	}

	protected void injectPropertyDomainXML(OWLModel ontModel, ARTURIResource property, Element treeElement,
			boolean visualization, boolean minimize) throws ModelAccessException,
			NonExistingRDFResourceException {
		ARTResource wgraph = getWorkingGraph();
		Element domainsElement = XMLHelp.newElement(treeElement, "domains");
		// TODO clearly reasoning=true requires the sole main graph (which
		// contains reasoned triples too) but,
		// what to do when the wgraph is not the main graph?

		Set<ARTResource> domains = RDFIterators.getSetFromIterator(ontModel.listPropertyDomains(property,
				true, wgraph));
		Collection<ARTResource> explicitDomains = RDFIterators.getCollectionFromIterator(ontModel
				.listPropertyDomains(property, false, wgraph));
		logger.debug("explicitDomains: " + explicitDomains);

		if (minimize)
			minimizeDomainsRanges(domains);

		for (ARTResource nextDomain : domains) {
			Element domainElement = RDFXMLHelp.addRDFNode(domainsElement, ontModel, nextDomain, true,
					visualization);
			if (explicitDomains.contains(nextDomain))
				domainElement.setAttribute("explicit", "true");
			else
				domainElement.setAttribute("explicit", "false");
		}
	}

	protected void injectPropertyRangeXML(OWLModel ontModel, ARTURIResource property, Element treeElement,
			boolean visualization, boolean minimize) throws ModelAccessException,
			NonExistingRDFResourceException {
		ARTResource wgraph = getWorkingGraph();
		Element rangesElement = XMLHelp.newElement(treeElement, "ranges");
		// TODO check todo when wgraph!=MAINGRAPH
		Set<ARTResource> ranges = RDFIterators.getSetFromIterator(ontModel.listPropertyRanges(property, true,
				wgraph));
		Collection<ARTResource> explicitRanges = RDFIterators.getCollectionFromIterator(ontModel
				.listPropertyRanges(property, false, wgraph));

		if (minimize)
			minimizeDomainsRanges(ranges);

		for (ARTResource nextRange : ranges) {
			Element rangeElement = RDFXMLHelp.addRDFNode(rangesElement, ontModel, nextRange, true,
					visualization);
			if (explicitRanges.contains(nextRange))
				rangeElement.setAttribute("explicit", "true");
			else
				rangeElement.setAttribute("explicit", "false");
		}

		try {
			rangesElement.setAttribute("rngType", RDFUtilities.getRangeType(ontModel, property, ranges)
					.toString());
		} catch (IncompatibleRangeException e) {
			rangesElement.setAttribute("rngType", "inconsistent");
		}
	}

	private void minimizeDomainsRanges(Set<ARTResource> typesSet) {
		// TODO this should be replaced by an efficient procedure for producing the shortest number of ranges
		// which are NOT in a hierarchical relationship among them has to be found. This can be complemented
		// with quick heuristics. I'll write a few heuristic first, so this will not be a complete filter

		// TODO also, restrictions should be reduced to a set of elements (it is possible, on a first attempt,
		// that both OR and AND of types are translated to their sequence, as it is then up to the user, in
		// case of an AND, to take an instance which respects all the ANDed types.

		typesSet.remove(RDFS.Res.LITERAL);
		if (typesSet.contains(RDFS.Res.RESOURCE) && typesSet.contains(OWL.Res.THING))
			typesSet.remove(RDFS.Res.RESOURCE);
	}

	private void enrichXMLForProperty(OWLModel ontModel, ARTURIResource property, Element treeElement,
			ARTResource... graphs) throws ModelAccessException, NonExistingRDFResourceException {

		ARTResource wgraph = getWorkingGraph();
		// DOMAIN AND RANGES
		injectPropertyDomainXML(ontModel, property, treeElement, true, true);
		injectPropertyRangeXML(ontModel, property, treeElement, true, true);

		// FACETS
		Element facetsElement = XMLHelp.newElement(treeElement, "facets");

		if (ontModel.isSymmetricProperty(property, graphs)) {
			Element symmetricPropElement = XMLHelp.newElement(facetsElement, "symmetric");
			symmetricPropElement.setAttribute("value", "true");
			if (ontModel.hasTriple(property, RDF.Res.TYPE, OWL.Res.SYMMETRICPROPERTY, false, wgraph))
				symmetricPropElement.setAttribute("explicit", "true");
			else
				symmetricPropElement.setAttribute("explicit", "false");
		}
		if (ontModel.isFunctionalProperty(property, graphs)) {
			Element functionalPropElement = XMLHelp.newElement(facetsElement, "functional");
			functionalPropElement.setAttribute("value", "true");
			if (ontModel.hasTriple(property, RDF.Res.TYPE, OWL.Res.FUNCTIONALPROPERTY, false, wgraph))
				functionalPropElement.setAttribute("explicit", "true");
			else
				functionalPropElement.setAttribute("explicit", "false");
		}
		if (ontModel.isInverseFunctionalProperty(property, graphs)) {
			Element inverseFunctionalPropElement = XMLHelp.newElement(facetsElement, "inverseFunctional");
			inverseFunctionalPropElement.setAttribute("value", "true");
			if (ontModel.hasTriple(property, RDF.Res.TYPE, OWL.Res.INVERSEFUNCTIONALPROPERTY, false, wgraph))
				inverseFunctionalPropElement.setAttribute("explicit", "true");
			else
				inverseFunctionalPropElement.setAttribute("explicit", "false");
		}
		if (ontModel.isTransitiveProperty(property, graphs)) {
			Element transitivePropElement = XMLHelp.newElement(facetsElement, "transitive");
			transitivePropElement.setAttribute("value", "true");
			if (ontModel.hasTriple(property, RDF.Res.TYPE, OWL.Res.TRANSITIVEPROPERTY, false, wgraph))
				transitivePropElement.setAttribute("explicit", "true");
			else
				transitivePropElement.setAttribute("explicit", "false");
		}
		ARTStatementIterator iterator = ontModel.listStatements(property, OWL.Res.INVERSEOF, NodeFilters.ANY,
				true, graphs);
		if (iterator.streamOpen()) {
			Element inverseHeaderElement = XMLHelp.newElement(facetsElement, "inverseOf");
			while (iterator.streamOpen()) {
				ARTURIResource inverseProp = iterator.getNext().getObject().asURIResource();

				Element transitivePropElement = RDFXMLHelp.addRDFURIResource(inverseHeaderElement, ontModel,
						inverseProp, RDFResourceRolesEnum.objectProperty, true);
				if (ontModel.hasTriple(property, OWL.Res.INVERSEOF, inverseProp, false, wgraph))
					transitivePropElement.setAttribute("explicit", "true");
				else
					transitivePropElement.setAttribute("explicit", "false");
			}
		}
		iterator.close();
	}

	public Response getSuperTypes(String resourceQName, RDFResourceRolesEnum resType) {
		logger.debug("getting supertypes of: " + resourceQName);
		OWLModel ontModel = ProjectManager.getCurrentProject().getOWLModel();

		try {
			ARTResource[] graphs = getUserNamedGraphs();
			ARTURIResource cls = retrieveExistingURIResource(ontModel, resourceQName, graphs);
			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
			Element dataElement = response.getDataElement();
			collectParents(ontModel, cls, resType, dataElement, graphs);
			return response;
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
	}

	// *******************
	// FACILITY METHODS
	// *******************

	protected void collectParents(OWLModel ontModel, ARTResource resource, RDFResourceRolesEnum restype,
			Element superTypesElem, ARTResource... graphs) throws ModelAccessException,
			NonExistingRDFResourceException {
		// TODO filter on admin also here
		Collection<? extends ARTResource> directSuperTypes;
		Collection<? extends ARTResource> directExplicitSuperTypes;

		ARTResource wgraph = getWorkingGraph();

		if (restype == RDFResourceRolesEnum.cls) {
			directSuperTypes = RDFIterators.getSetFromIterator(((DirectReasoning) ontModel)
					.listDirectSuperClasses(resource, graphs));
			directExplicitSuperTypes = RDFIterators.getCollectionFromIterator(ontModel.listSuperClasses(
					resource, false, wgraph));
		} else if (restype == RDFResourceRolesEnum.property) {
			directSuperTypes = RDFIterators.getSetFromIterator(((DirectReasoning) ontModel)
					.listDirectSuperProperties(resource, graphs));
			directExplicitSuperTypes = RDFIterators.getCollectionFromIterator(ontModel.listSuperProperties(
					resource.asURIResource(), false, wgraph));
		} else { // should be - by exclusion - skos concepts
			directSuperTypes = RDFIterators.getSetFromIterator(((SKOSModel) ontModel).listBroaderConcepts(
					resource.asURIResource(), false, true, graphs));
			directExplicitSuperTypes = RDFIterators.getCollectionFromIterator(((SKOSModel) ontModel)
					.listBroaderConcepts(resource.asURIResource(), false, false, wgraph));
			// TODO check if to be implemented better. For the moment, we
			// retrieve only explicit, so all of
			// them are explicit
		}

		Collection<STRDFResource> superTypes = STRDFNodeFactory.createEmptyResourceCollection();
		for (ARTResource superType : directSuperTypes) {
			STRDFResource res = STRDFNodeFactory.createSTRDFResource(ontModel, superType, true,
					directExplicitSuperTypes.contains(superType), true);
			Cls.setRendering(ontModel, res, null, null, graphs);
			superTypes.add(res);
		}

		RDFXMLHelp.addRDFNodes(superTypesElem, superTypes);
	}

	protected void collectPrefLabels(SKOSModel ontModel, ARTURIResource resource,
			RDFResourceRolesEnum restype, Element prefLabelsElem, ARTResource... graphs) throws DOMException,
			ModelAccessException {
		ARTLiteralIterator prefLabels;

		prefLabels = ontModel.listPrefLabels(resource, true, graphs);

		while (prefLabels.streamOpen()) {
			ARTLiteral prefLabel = prefLabels.getNext();
			RDFXMLHelp.addRDFNode(prefLabelsElem, prefLabel);
		}
	}

	protected void collectTopConcepts(SKOSModel ontModel, ARTURIResource resource,
			RDFResourceRolesEnum restype, Element topConceptsElem, ARTResource... graphs)
			throws ModelAccessException {

		ARTURIResourceIterator topConcepts;

		topConcepts = ontModel.listTopConceptsInScheme(resource, true, graphs);

		Collection<STRDFResource> topSTConcepts = STRDFNodeFactory.createEmptyResourceCollection();
		while (topConcepts.streamOpen()) {
			ARTURIResource topConcept = topConcepts.getNext();
			topSTConcepts.add(STRDFNodeFactory.createSTRDFResource(ontModel, topConcept,
					ModelUtilities.getResourceRole(topConcept, ontModel), true, true));
		}
		topConcepts.close();

		RDFXMLHelp.addRDFNodes(topConceptsElem, topSTConcepts);
	}

	protected void collectImports(OWLModel ontModel, ARTURIResource ontology, Element importsElem,
			ARTResource... graphs) throws ModelAccessException {

		Collection<ARTURIResource> imports;

		imports = RDFIterators.getCollectionFromIterator(ontModel.listOntologyImports(ontology, graphs));

		Collection<STRDFResource> topSTConcepts = STRDFNodeFactory.createEmptyResourceCollection();
		for (ARTURIResource importedOntology : imports) {

			topSTConcepts.add(STRDFNodeFactory.createSTRDFResource(ontModel, importedOntology,
					ModelUtilities.getResourceRole(importedOntology, ontModel), true, true));

		}
		RDFXMLHelp.addRDFNodes(importsElem, topSTConcepts);
	}

	protected String getLanguagePref() {
		String lang = httpParameters.get(langTag);
		return lang != null ? lang : "en";
	}

	// assuming that the input model is an OWL or a SKOS(SKOSXL) one
	public OWLModel toOWLModel(RDFModel model) {
		if (model instanceof OWLModel)
			return (OWLModel) model;
		else
			// if (proj.getOntologyType().equals(OntologyType.SKOS))
			return ((SKOSModel) model).getOWLModel();
	}

	// ******************************
	// OLD METHODS, not used anymore
	// ******************************

	public Response getValuesOfProperties_NO_SPARQL(String resourceName, String propertiesNames,
			boolean subProp, boolean excludePropItSelf, String excludedProps) {
		OWLModel model = getOWLModel();
		try {

			ARTResource[] graphs;

			graphs = getUserNamedGraphs();
			ARTResource resource = retrieveExistingResource(model, resourceName, graphs);
			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

			if (excludePropItSelf && !subProp) {
				response.setReplyStatusFAIL("It is not possible to exclude the property(ies) itself "
						+ "(themself) and the subProp as well");
				return response;
			}

			// getting inferred triples but filtered
			ARTStatementIterator inferredTriples = model.listStatements(resource, NodeFilters.ANY,
					NodeFilters.ANY, true, graphs);

			// basic filter on subproperties prop values. There can be more than one properties
			Predicate<ARTStatement> statementFilter = null;
			HashSet<ARTURIResource> propSet = new HashSet<ARTURIResource>();
			for (String propName : propertiesNames.split("\\|_\\|"))
				propSet.add(model.createURIResource(model.expandQName(propName)));

			if (subProp) {
				statementFilter = StatementWithSubPropertyPredicate_Predicate.getFilter(model, propSet,
						excludePropItSelf, getUserNamedGraphs());
			} else { // subProp == false
				statementFilter = StatementWithAnyOfGivenPredicates_Predicate.getFilter(propSet);
			}

			if (excludedProps != null) {
				HashSet<ARTURIResource> excludedPropSet = new HashSet<ARTURIResource>();
				for (String excludedPropName : excludedProps.split("\\|_\\|"))
					excludedPropSet.add(model.createURIResource(model.expandQName(excludedPropName)));
				// only in case excludedProps is being specified, then the statementFilter is enriched with a
				// negative filter on the set of excluded properties
				statementFilter = Predicates.and(statementFilter, Predicates
						.not(StatementWithAnyOfGivenPredicates_Predicate.getFilter(excludedPropSet)));
			}

			// only the inferred statement iterator is being filtered, as it is the one being used for
			// reporting results, the explicit statement iterator is instead only used to check which of the
			// above statements are explicit
			Iterator<ARTStatement> inferredFilteredOnSubPropTriples = Iterators.filter(inferredTriples,
					statementFilter);

			ARTStatementIterator explicitStatements = model.listStatements(resource, NodeFilters.ANY,
					NodeFilters.ANY, false, getWorkingGraph());

			PredicateObjectsList predObjList = PredicateObjectsListFactory.createPredicateObjectsList(model,
					RDFResourceRolesEnum.property,
					RDFIterators.createARTStatementIterator(inferredFilteredOnSubPropTriples),
					explicitStatements);

			// TODO
			// createPredicateObjectsList automatically closes the input iterator, but the iterator passed to
			// it is a wrapper around the standard iterator wrapped-in-turn around inferredDatatypedTriples.
			// This is a clear example of why we should write my own filtering iterator, maybe through a
			// filterIterator(RDFIterator, predicate) put in RDFIterators.
			// class "Predicate" from lib google-collections may still be used
			inferredTriples.close();

			RDFXMLHelp.addPredicateObjectList(response, predObjList);

			return response;
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
	}

}
