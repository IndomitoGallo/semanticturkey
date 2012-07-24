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
package it.uniroma2.art.semanticturkey.servlet.main;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.exceptions.ModelUpdateException;
import it.uniroma2.art.owlart.filter.ConceptsInSchemePredicate;
import it.uniroma2.art.owlart.filter.RootConceptsPredicate;
import it.uniroma2.art.owlart.model.ARTLiteral;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.models.SKOSModel;
import it.uniroma2.art.owlart.navigation.ARTLiteralIterator;
import it.uniroma2.art.owlart.navigation.ARTURIResourceIterator;
import it.uniroma2.art.owlart.utilities.RDFIterators;
import it.uniroma2.art.owlart.vocabulary.RDFResourceRolesEnum;
import it.uniroma2.art.semanticturkey.exceptions.DuplicatedResourceException;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.exceptions.NonExistingRDFResourceException;
import it.uniroma2.art.semanticturkey.ontology.utilities.RDFXMLHelp;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFLiteral;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFNodeFactory;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFResource;
import it.uniroma2.art.semanticturkey.project.Project;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.DOMException;
import org.w3c.dom.Element;

import com.google.common.base.Predicate;
import com.google.common.collect.Iterators;

public class SKOS extends Resource {

	protected static Logger logger = LoggerFactory.getLogger(SKOS.class);

	// REQUESTS
	public static class Req {
		// GET REQUESTS
		public static final String getTopConceptsRequest = "getTopConcepts";
		public static final String getBroaderConceptsRequest = "getBroaderConcepts";
		public static final String getNarrowerConceptsRequest = "getNarrowerConcepts";
		public static final String getAllSchemesListRequest = "getAllSchemesList";
		public static final String getPrefLabelRequest = "getPrefLabel";
		public static final String getAltLabelsRequest = "getAltLabels";
		public static final String getSchemesMatrixPerConceptRequest = "getSchemesMatrixPerConceptRequest";

		// IS REQUESTS
		public static final String isTopConceptRequest = "isTopConcept";

		// ADD REQUESTS
		public static final String addTopConceptRequest = "addTopConcept";
		public static final String addBroaderConceptRequest = "addBroaderConcept";
		public static final String addConceptToSchemeRequest = "addConceptToScheme";
		public static final String setPrefLabelRequest = "setPrefLabel";
		public static final String addAltLabelRequest = "addAltLabel";

		// CREATE REQUESTS
		public static final String createConceptRequest = "createConcept";
		public static final String createSchemeRequest = "createScheme";

		// REMOVE REQUESTS
		public static final String removeTopConceptRequest = "removeTopConcept";
		public static final String deleteConceptRequest = "deleteConcept";
		public static final String deleteSchemeRequest = "deleteScheme";
		public static final String removePrefLabelRequest = "removePrefLabel";
		public static final String removeAltLabelRequest = "removeAltLabel";
		public static final String removeConceptFromSchemeRequest = "removeConceptFromScheme";
		public static final String removeBroaderConcept = "removeBroaderConcept";

		// MODIFY REQUESTS
		public static final String assignHierarchyToSchemeRequest = "assignHierarchyToScheme";

		// TREE (ONLY FOR DEBUGGING)
		public static final String showSKOSConceptsTreeRequest = "showSKOSConceptsTree";
	}

	// PARS
	public static class Par {
		final static public String broaderConcept = "broaderConcept";
		final static public String concept = "concept";
		final static public String conceptFrom = "conceptFrom";
		final static public String conceptTo = "conceptTo";
		final static public String forceDeleteDanglingConcepts = "forceDeleteDanglingConcepts";
		final static public String setForceDeleteDanglingConcepts = "setForceDeleteDanglingConcepts";
		final static public String label = "label";
		final static public String langTag = "lang";
		final static public String newConcept = "newConcept";
		final static public String prefLabel = "prefLabel";
		final static public String relatedConcept = "relatedConcept";
		final static public String semanticRelation = "semanticRelation";
		final static public String scheme = "scheme";
		final static public String sourceScheme = "sourceScheme";
		final static public String targetScheme = "targetScheme";
		final static public String treeView = "treeView";
	}

	public SKOS(String id) {
		super(id);
	}

	protected Logger getLogger() {
		return logger;
	}

	@Override
	public Response getPreCheckedResponse(String request) throws HTTPParameterUnspecifiedException {
		logger.debug("request to skos");

		Response response = null;
		// all new fashioned requests are put inside these grace brackets
		if (request == null)
			return servletUtilities.createNoSuchHandlerExceptionResponse(request);

		// GET SKOS METHODS
		if (request.equals(Req.getAllSchemesListRequest)) {
			String defaultLanguage = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.langTag);
			response = getAllSchemesList(defaultLanguage);

		} else if (request.equals(conceptDescriptionRequest)) {
			String conceptName = setHttpPar(Par.concept);
			String method = setHttpPar("method");
			checkRequestParametersAllNotNull(Par.concept, "method");
			response = getConceptDescription(conceptName, method);

		} else if (request.equals(conceptSchemeDescriptionRequest)) {
			String schemeName = setHttpPar(Par.scheme);
			String method = setHttpPar("method");
			checkRequestParametersAllNotNull(Par.scheme, "method");
			response = getConceptSchemeDescription(schemeName, method);

		} else if (request.equals(Req.getTopConceptsRequest)) {
			String schemaURI = setHttpPar(Par.scheme);
			String defaultLanguage = setHttpPar(Par.langTag);
			response = getTopConcepts(schemaURI, defaultLanguage);

		} else if (request.equals(Req.getNarrowerConceptsRequest)) {
			String conceptName = setHttpPar(Par.concept);
			String schemeName = setHttpPar(Par.scheme);
			boolean treeView = setHttpBooleanPar(Par.treeView);
			String defaultLanguage = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.concept);
			response = getNarrowerConcepts(conceptName, schemeName, treeView, defaultLanguage);

		} else if (request.equals(Req.getBroaderConceptsRequest)) {
			String conceptName = setHttpPar(Par.concept);
			String schemeName = setHttpPar(Par.scheme);
			String defaultLanguage = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.concept);
			response = getBroaderConcepts(conceptName, schemeName, defaultLanguage);

		} else if (request.equals(Req.getPrefLabelRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag);
			response = getPrefLabel(skosConceptName, lang);

		} else if (request.equals(Req.getAltLabelsRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag);
			response = getAltLabels(skosConceptName, lang);

		} else if (request.equals(Req.getSchemesMatrixPerConceptRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag);
			response = getSchemesMatrixPerConcept(skosConceptName, lang);

			// IS METHODS
		} else if (request.equals(Req.isTopConceptRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String schemeName = setHttpPar(Par.scheme);
			checkRequestParametersAllNotNull(Par.concept, Par.scheme);
			response = isTopConcept(skosConceptName, schemeName);

			// REMOVE SKOS METHODS
		} else if (request.equals(Req.deleteConceptRequest)) {
			String concept = setHttpPar(Par.concept);
			checkRequestParametersAllNotNull(Par.concept);
			response = deleteConcept(concept);

		} else if (request.equals(Req.deleteSchemeRequest)) {
			String scheme = setHttpPar(Par.scheme);
			boolean setForceDeleteDanglingConcepts = setHttpBooleanPar(Par.setForceDeleteDanglingConcepts);
			boolean forceDeleteDanglingConcepts = setHttpBooleanPar(Par.forceDeleteDanglingConcepts);
			checkRequestParametersAllNotNull(Par.scheme);
			response = deleteScheme(scheme, setForceDeleteDanglingConcepts, forceDeleteDanglingConcepts);

		} else if (request.equals(Req.addTopConceptRequest)) {
			String scheme = setHttpPar(Par.scheme);
			String concept = setHttpPar(Par.concept);
			checkRequestParametersAllNotNull(Par.scheme, Par.concept);
			logger.debug("SKOS." + Req.addTopConceptRequest + ":\n" + response);
			response = addTopConcept(scheme, concept);
		} else if (request.equals(Req.removeTopConceptRequest)) {
			String scheme = setHttpPar(Par.scheme);
			String concept = setHttpPar(Par.concept);
			checkRequestParametersAllNotNull(Par.scheme, Par.concept);
			logger.debug("SKOS." + Req.removeTopConceptRequest + ":\n" + response);
			response = removeTopConcept(scheme, concept);
		} else if (request.equals(Req.removePrefLabelRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			String label = setHttpPar(Par.label);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag, Par.label);
			response = removePrefLabel(skosConceptName, label, lang);

		} else if (request.equals(Req.removeAltLabelRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			String label = setHttpPar(Par.label);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag, Par.label);
			response = removeAltLabel(skosConceptName, label, lang);

		} else if (request.equals(Req.removeConceptFromSchemeRequest)) {
			String concept = setHttpPar(Par.concept);
			String scheme = setHttpPar(Par.scheme);
			checkRequestParametersAllNotNull(Par.concept, Par.scheme);
			response = removeConceptFromScheme(concept, scheme);

			// ADD SKOS METHODS
		} else if (request.equals(Req.addBroaderConceptRequest)) {
			// newConcept, relatedConcept,rdfsLabel,
			// rdfsLabelLanguage,preferredLabel,preferredLabelLanguage
			String concept = setHttpPar(Par.concept);
			String broaderConcept = setHttpPar(Par.broaderConcept);
			checkRequestParametersAllNotNull(Par.concept, Par.broaderConcept);
			response = addBroaderConcept(concept, broaderConcept);

		} else if (request.equals(Req.addConceptToSchemeRequest)) {
			String concept = setHttpPar(Par.concept);
			String scheme = setHttpPar(Par.scheme);
			checkRequestParametersAllNotNull(Par.concept, Par.scheme);
			response = addConceptToScheme(concept, scheme);

		} else if (request.equals(Req.setPrefLabelRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			String label = setHttpPar(Par.label);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag, Par.label);
			response = setPrefLabel(skosConceptName, label, lang);

		} else if (request.equals(Req.addAltLabelRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			String label = setHttpPar(Par.label);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag, Par.label);
			response = addAltLabel(skosConceptName, label, lang);

			// CREATE SKOS METHODS

		} else if (request.equals(Req.createConceptRequest)) {
			String conceptName = setHttpPar(Par.concept);
			String broaderConceptName = setHttpPar(Par.broaderConcept);
			String schemeName = setHttpPar(Par.scheme);
			String prefLabel = setHttpPar(Par.prefLabel);
			String prefLabelLanguage = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.concept, Par.scheme);
			response = createConcept(conceptName, broaderConceptName, schemeName, prefLabel,
					prefLabelLanguage);

		} else if (request.equals(Req.createSchemeRequest)) {
			String schemeName = setHttpPar(Par.scheme);
			String preferredLabel = setHttpPar(Par.prefLabel);
			String preferredLabelLanguage = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.scheme);
			response = createConceptScheme(schemeName, preferredLabel, preferredLabelLanguage);

			// MODIFY

		} else if (request.equals(Req.assignHierarchyToSchemeRequest)) {
			String conceptName = setHttpPar(Par.concept);
			String sourceSchemeName = setHttpPar(Par.sourceScheme);
			String targetSchemeName = setHttpPar(Par.targetScheme);
			checkRequestParametersAllNotNull(Par.concept, Par.targetScheme);
			response = assignHierarchyToScheme(conceptName, sourceSchemeName, targetSchemeName);

		} else if (request.equals(Req.showSKOSConceptsTreeRequest)) {
			String schemeName = setHttpPar(Par.scheme);
			checkRequestParametersAllNotNull(Par.scheme);
			response = showSKOSConceptsTree(schemeName);
		} else if (request.equals(Req.removeBroaderConcept)) {
			String conceptName = setHttpPar(Par.concept);
			String broaderConceptName = setHttpPar(Par.broaderConcept);
			checkRequestParametersAllNotNull(Par.concept, Par.broaderConcept);
			response = removeBroaderConcept(conceptName, broaderConceptName);
		}

		else
			return servletUtilities.createNoSuchHandlerExceptionResponse(request);

		this.fireServletEvent();
		return response;
	}

	private Response removeTopConcept(String schemeName, String conceptName) {
		SKOSModel skosModel = getSKOSModel();
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {
			ARTResource[] graphs = getUserNamedGraphs();
			ARTURIResource scheme = retrieveExistingURIResource(skosModel, schemeName, graphs);
			ARTURIResource concept = retrieveExistingURIResource(skosModel, conceptName, graphs);

			skosModel.setTopConcept(concept, scheme, false, getWorkingGraph());
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		}
		return response;
	}

	public Response addTopConcept(String schemeName, String conceptName) {
		SKOSModel skosModel = getSKOSModel();
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {
			ARTResource[] graphs = getUserNamedGraphs();
			ARTURIResource scheme = retrieveExistingURIResource(skosModel, schemeName, graphs);
			ARTURIResource concept = retrieveExistingURIResource(skosModel, conceptName, graphs);
			skosModel.setTopConcept(concept, scheme, true, getWorkingGraph());

			RDFXMLHelp.addRDFNode(response, createSTConcept(skosModel, concept, true, null));

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		}
		return response;
	}

	public Response removeBroaderConcept(String conceptName, String broaderConceptName) {
		SKOSModel skosModel = getSKOSModel();
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {
			ARTResource[] graphs = getUserNamedGraphs();
			ARTURIResource concept = retrieveExistingURIResource(skosModel, conceptName, graphs);
			ARTURIResource broaderConcept = retrieveExistingURIResource(skosModel, broaderConceptName, graphs);

			skosModel.removeBroaderConcept(concept, broaderConcept, getWorkingGraph());
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		}
		return response;
	}

	/**
	 * given a subtree rooted on the selected concept, all of its children are assigned to scheme
	 * <code>targetScheme</code>
	 * 
	 * @param conceptName
	 * @param sourceSchemeName
	 *            if <code>!=null</code>, then the narrowers of the selected concept to be assigned to
	 *            <code>targetScheme</code> are filtered from the <code>sourceScheme</code>
	 * @param targetSchemeName
	 * @return
	 */
	public Response assignHierarchyToScheme(String conceptName, String sourceSchemeName,
			String targetSchemeName) {
		SKOSModel skosModel = getSKOSModel();
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {
			ARTResource[] graphs = getUserNamedGraphs();
			ARTURIResource concept = retrieveExistingURIResource(skosModel, conceptName, graphs);
			ARTURIResource targetScheme = retrieveExistingURIResource(skosModel, targetSchemeName, graphs);

			if (sourceSchemeName != null) {
				ARTURIResource sourceScheme = retrieveExistingURIResource(skosModel, sourceSchemeName,
						getUserNamedGraphs());
				assignHierarchyToSchemeRecursive(skosModel, concept, sourceScheme, targetScheme, graphs);
			} else {
				assignHierarchyToSchemeRecursive(skosModel, concept, targetScheme, graphs);
			}

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		}
		return response;
	}

	/**
	 * implementation of this method filters the narrower nodes which only belong to the selected
	 * <code>sourceScheme</code> before assigning them tothe <code>targetScheme</code>
	 * 
	 * @param skosModel
	 * @param concept
	 * @param sourceScheme
	 * @param targetScheme
	 * @param graphs
	 * @throws ModelAccessException
	 * @throws ModelUpdateException
	 * @throws NonExistingRDFResourceException
	 */
	private void assignHierarchyToSchemeRecursive(SKOSModel skosModel, ARTURIResource concept,
			ARTURIResource sourceScheme, ARTURIResource targetScheme, ARTResource... graphs)
			throws ModelAccessException, ModelUpdateException, NonExistingRDFResourceException {
		skosModel.addConceptToScheme(concept, targetScheme, graphs);
		ARTURIResourceIterator narrowers = skosModel.listNarrowerConcepts(concept, false, true, graphs);
		Iterator<ARTURIResource> filteredNarrowers = Iterators.filter(narrowers,
				ConceptsInSchemePredicate.getFilter(skosModel, sourceScheme, getUserNamedGraphs()));
		while (filteredNarrowers.hasNext()) {
			ARTURIResource filteredNarrower = filteredNarrowers.next();
			assignHierarchyToSchemeRecursive(skosModel, filteredNarrower, targetScheme, graphs);
		}
		narrowers.close();
	}

	/**
	 * implementation of this method assign all narrower concepts of <code>concept</code> to the specified
	 * <code>scheme</code>
	 * 
	 * @param skosModel
	 * @param concept
	 * @param scheme
	 * @param graphs
	 * @throws ModelAccessException
	 * @throws ModelUpdateException
	 */
	private void assignHierarchyToSchemeRecursive(SKOSModel skosModel, ARTURIResource concept,
			ARTURIResource scheme, ARTResource... graphs) throws ModelAccessException, ModelUpdateException {
		skosModel.addConceptToScheme(concept, scheme, graphs);
		ARTURIResourceIterator narrowers = skosModel.listNarrowerConcepts(concept, false, true, graphs);
		while (narrowers.streamOpen()) {
			ARTURIResource narrower = narrowers.getNext();
			assignHierarchyToSchemeRecursive(skosModel, narrower, scheme, graphs);
		}
		narrowers.close();
	}

	public Response getSchemesMatrixPerConcept(String skosConceptName, String lang) {
		SKOSModel skosModel = getSKOSModel();
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {
			ARTResource[] graphs = getUserNamedGraphs();
			Element dataElement = response.getDataElement();
			ARTURIResource skosConcept = retrieveExistingURIResource(skosModel, skosConceptName, graphs);
			Collection<ARTURIResource> schemesForConcept = RDFIterators.getCollectionFromIterator(skosModel
					.listAllSchemesForConcept(skosConcept, graphs));
			ARTURIResourceIterator schemes = skosModel.listAllSchemes(graphs);
			while (schemes.streamOpen()) {
				ARTURIResource scheme = schemes.getNext();
				Element schemeElem = RDFXMLHelp.addRDFNode(dataElement, skosModel, scheme, false, true);
				schemeElem.setAttribute("inScheme", (schemesForConcept.contains(scheme) ? "true" : "false"));
			}
			schemes.close();

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	public Response getTopConcepts(String schemaUri, String defaultLanguage) {
		SKOSModel skosModel = getSKOSModel();
		ARTURIResourceIterator it;
		try {
			if (schemaUri != null) {
				ARTURIResource skosScheme = retrieveExistingURIResource(skosModel, schemaUri,
						getUserNamedGraphs());
				it = skosModel.listTopConceptsInScheme(skosScheme, true, getUserNamedGraphs());
			} else {
				// TODO move to OWLART?
				it = getTopConcepts();
			}

			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

			Collection<STRDFResource> concepts = new ArrayList<STRDFResource>();

			// I would prefer to have some mappable operation, so to include the call to decorateForTreeView,
			// to a general method for creating collections of STNodes starting from iterators over ARTNodes
			while (it.hasNext()) {
				ARTURIResource concept = it.next();
				STRDFResource stConcept = createSTConcept(skosModel, concept, true, defaultLanguage);
				decorateForTreeView(skosModel, stConcept);
				concepts.add(stConcept);
			}
			it.close();

			RDFXMLHelp.addRDFNodes(response, concepts);

			return response;

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}

	}

	// TODO maybe it is the case to move it to OWLART...
	/**
	 * this method ignores the topConceptOf predicate and calculates the roots much the same way the service
	 * for classes does (only, it's relying on the skos:broader predicate instead of rdfs:subClassOf
	 * 
	 * @param defaultLanguage
	 * @return
	 * @throws ModelAccessException
	 * @throws NonExistingRDFResourceException
	 */
	public ARTURIResourceIterator getTopConcepts() throws ModelAccessException,
			NonExistingRDFResourceException {
		SKOSModel skosModel = getSKOSModel();
		ARTResource[] graphs = getUserNamedGraphs();
		Predicate<ARTURIResource> rootConceptsPred = new RootConceptsPredicate(skosModel, graphs);
		ARTURIResourceIterator concepts = skosModel.listConcepts(true, graphs);
		Iterator<ARTURIResource> filtIt;
		filtIt = Iterators.filter(concepts, rootConceptsPred);
		return RDFIterators.createARTURIResourceIterator(filtIt);
	}

	public Response getConceptDescription(String conceptName, String method) {
		logger.debug("getConceptDescription; name: " + conceptName);
		return getResourceDescription(conceptName, RDFResourceRolesEnum.concept, method);
	}

	public Response getConceptSchemeDescription(String schemeName, String method) {
		logger.debug("getConceptSchemeDescription; name: " + schemeName);
		return getResourceDescription(schemeName, RDFResourceRolesEnum.conceptScheme, method);
	}

	public Response deleteConcept(String conceptName) {
		logger.debug("delete concept: " + conceptName);

		ResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {
			SKOSModel skosModel = getSKOSModel();
			ARTResource[] graphs = getUserNamedGraphs();
			ARTURIResource concept = retrieveExistingURIResource(skosModel, conceptName, graphs);
			if (skosModel.listNarrowerConcepts(concept, false, true, getUserNamedGraphs()).streamOpen()) {
				return createReplyFAIL("concept: " + conceptName
						+ " has narrower concepts; delete them before");
			}
			skosModel.deleteConcept(concept, getWorkingGraph());
		} catch (ModelAccessException e) {
			logAndSendException(e);
		} catch (ModelUpdateException e) {
			logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			e.printStackTrace();
		}
		return response;
	}

	public Response deleteScheme(String schemeName, boolean setForceDeleteDanglingConcepts,
			boolean forceDeleteDanglingConcepts) {
		ResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		logger.debug("remove scheme: " + schemeName);
		try {
			ARTResource[] graphs = getUserNamedGraphs();

			SKOSModel skosModel = getSKOSModel();
			ARTURIResource scheme = retrieveExistingURIResource(skosModel, schemeName, graphs);
			if (!skosModel.isSKOSConceptScheme(scheme, graphs))
				return logAndSendException("resource" + scheme + " exists, but is not a scheme!");

			if (!setForceDeleteDanglingConcepts) {
				if (skosModel.listConceptsInScheme(scheme, getUserNamedGraphs()).streamOpen())
					return createReplyFAIL("the scheme is not empty. Assign dangling concepts to other"
							+ "schemes or express your preference about removing or not the dangling concepts");
			}

			skosModel.deleteScheme(scheme, forceDeleteDanglingConcepts, getWorkingGraph());

		} catch (ModelAccessException e) {
			logAndSendException(e);
		} catch (ModelUpdateException e) {
			logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			logAndSendException(e);
		}
		return response;
	}

	public Response createConceptScheme(String schemeQName, String prefLabel, String lang) {
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		logger.debug("new scheme name: " + schemeQName);

		try {

			SKOSModel skosModel = getSKOSModel();
			ARTURIResource newScheme = createNewResource(skosModel, schemeQName, getUserNamedGraphs());

			// add a new concept scheme...
			skosModel.addSKOSConceptScheme(newScheme, getWorkingGraph());
			addPrefLabel(skosModel, newScheme, prefLabel, lang);
			// add skos:preferredLabel

			// TODO this should be actually the language used to show the resource and not the language of the
			// passed prefLabel (actually, this is a new concept, but the general method, in this specific
			// case, would return the same language in case the prefLabel is given in the language used to
			// show the concept tree, or provide a qname in case the language is different (and thus the label
			// is not available 'cause the scheme has been just created in that sole different language
			RDFXMLHelp.addRDFNode(response, createSTScheme(skosModel, newScheme, true, lang));

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (DuplicatedResourceException e) {
			return logAndSendException(e);
		} catch (MissingLanguageException e) {
			return createReplyFAIL(e.getMessage());
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	public Response addBroaderConcept(String conceptQName, String braoderConceptQName) {
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		logger.debug("concept: " + conceptQName);
		logger.debug("broaderConcept: " + braoderConceptQName);

		try {

			SKOSModel skosModel = getSKOSModel();
			ARTURIResource concept = retrieveExistingURIResource(skosModel, conceptQName, getUserNamedGraphs());
			ARTURIResource broaderConcept = retrieveExistingURIResource(skosModel, braoderConceptQName,
					getUserNamedGraphs());

			skosModel.addBroaderConcept(concept, broaderConcept, getWorkingGraph());

			RDFXMLHelp.addRDFNode(response, createSTConcept(skosModel, concept, true, null));

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	public Response addConceptToScheme(String conceptQName, String schemeQName) {
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

		try {
			ARTResource[] graphs = getUserNamedGraphs();
			SKOSModel skosModel = getSKOSModel();
			ARTURIResource concept = retrieveExistingURIResource(skosModel, conceptQName, graphs);
			ARTURIResource scheme = retrieveExistingURIResource(skosModel, schemeQName, graphs);

			skosModel.addConceptToScheme(concept, scheme, getWorkingGraph());

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	public Response removeConceptFromScheme(String conceptQName, String schemeQName) {
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

		try {

			SKOSModel skosModel = getSKOSModel();
			ARTResource[] graphs = getUserNamedGraphs();
			ARTURIResource concept = retrieveExistingURIResource(skosModel, conceptQName, graphs);
			ARTURIResource scheme = retrieveExistingURIResource(skosModel, schemeQName, graphs);

			skosModel.removeConceptFromScheme(concept, scheme, getWorkingGraph());

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	public Response createConcept(String conceptName, String superConceptName, String schemeName,
			String prefLabel, String prefLabelLang) {
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		logger.debug("conceptName: " + conceptName);
		logger.debug("schemeName: " + schemeName);

		try {
			ARTResource wrkGraph = getWorkingGraph();
			SKOSModel skosModel = getSKOSModel();
			ARTResource[] graphs = getUserNamedGraphs();

			ARTURIResource newConcept = createNewResource(skosModel, conceptName, graphs);

			ARTURIResource superConcept;
			if (superConceptName != null)
				superConcept = retrieveExistingURIResource(skosModel, superConceptName, graphs);
			else
				superConcept = NodeFilters.NONE;

			ARTURIResource conceptScheme = retrieveExistingURIResource(skosModel, schemeName, graphs);

			logger.debug("adding concept to graph: " + wrkGraph);
			skosModel.addConceptToScheme(newConcept.getURI(), superConcept, conceptScheme, wrkGraph);
			addPrefLabel(skosModel, newConcept, prefLabel, prefLabelLang);

			RDFXMLHelp.addRDFNode(response, createSTConcept(skosModel, newConcept, true, prefLabelLang));

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		} catch (DuplicatedResourceException e) {
			return logAndSendException(e);
		} catch (MissingLanguageException e) {
			return logAndSendException(e);
		}
		return response;
	}

	/**
	 * get the narrower concepts of a given concept. To be used for building skos trees in UI applications.
	 * 
	 * @param conceptName
	 * @param schemeName
	 *            if !=null, filters the narrower concepts only among those who belong to the given scheme
	 * @param TreeView
	 *            if true, then information about the availability of narrower concepts of <concept> is
	 *            produced
	 * @param defaultLanguage
	 * @return
	 */
	public Response getNarrowerConcepts(String conceptName, String schemeName, boolean TreeView,
			String defaultLanguage) {
		SKOSModel skosModel = getSKOSModel();
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {

			ARTURIResource concept = retrieveExistingURIResource(skosModel, conceptName, getUserNamedGraphs());
			ARTURIResourceIterator unfilteredIt = skosModel.listNarrowerConcepts(concept, false, true,
					getUserNamedGraphs());
			Iterator<ARTURIResource> it;
			if (schemeName != null) {
				ARTURIResource scheme = retrieveExistingURIResource(skosModel, schemeName, getUserNamedGraphs());
				it = Iterators.filter(unfilteredIt,
						ConceptsInSchemePredicate.getFilter(skosModel, scheme, getUserNamedGraphs()));
			} else {
				it = unfilteredIt;
			}

			Collection<STRDFResource> concepts = STRDFNodeFactory.createEmptyResourceCollection();

			// I would prefer to have some mappable operation, so to include the call to decorateForTreeView,
			// to a general method for creating collections of STNodes starting from iterators over ARTNodes
			while (it.hasNext()) {
				ARTURIResource narrower = it.next();
				STRDFResource stConcept = createSTConcept(skosModel, narrower, true, defaultLanguage);
				if (TreeView)
					decorateForTreeView(skosModel, stConcept);
				concepts.add(stConcept);
			}

			unfilteredIt.close();

			RDFXMLHelp.addRDFNodes(response, concepts);

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	public Response getBroaderConcepts(String conceptName, String schemeName, String defaultLanguage) {
		SKOSModel skosModel = getSKOSModel();
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {

			ARTURIResource concept = retrieveExistingURIResource(skosModel, conceptName, getUserNamedGraphs());
			ARTURIResourceIterator unfilteredIt = skosModel.listBroaderConcepts(concept, false, true,
					getUserNamedGraphs());
			Iterator<ARTURIResource> it;
			if (schemeName != null) {
				ARTURIResource scheme = retrieveExistingURIResource(skosModel, schemeName, getUserNamedGraphs());
				it = Iterators.filter(unfilteredIt,
						ConceptsInSchemePredicate.getFilter(skosModel, scheme, getUserNamedGraphs()));
			} else {
				it = unfilteredIt;
			}

			Collection<STRDFResource> concepts = STRDFNodeFactory.createEmptyResourceCollection();
			while (it.hasNext()) {
				concepts.add(createSTConcept(skosModel, it.next(), true, defaultLanguage));
			}

			unfilteredIt.close();
			RDFXMLHelp.addRDFNodes(response, concepts);

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	public Response getAllSchemesList(String defaultLanguage) {
		SKOSModel skosModel = (SKOSModel) ProjectManager.getCurrentProject().getOntModel();
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

		try {
			ARTURIResourceIterator it = skosModel.listAllSchemes(getUserNamedGraphs());

			RDFXMLHelp.addRDFNodes(
					response,
					createSTSKOSResourceCollection(skosModel, it, RDFResourceRolesEnum.conceptScheme, true,
							defaultLanguage));

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	/**
	 * this is mostly to be used for debugging; use {@link #getNarrowerConcepts(String, boolean, String)} for
	 * building a tree dynamically, with each request following each tree-branch expansion
	 * 
	 * @param skosSchemeName
	 * @return
	 */
	public Response showSKOSConceptsTree(String skosSchemeName) {

		SKOSModel ontModel = getSKOSModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		Element dataElement = response.getDataElement();

		try {
			ARTURIResource scheme = ontModel.createURIResource(ontModel.expandQName(skosSchemeName));
			ARTURIResourceIterator topConceptsIt = ontModel.listTopConceptsInScheme(scheme, true,
					getUserNamedGraphs());
			while (topConceptsIt.hasNext()) {
				ARTURIResource concept = topConceptsIt.next();
				recursiveCreateSKOSConceptsTree(ontModel, concept, dataElement);
			}
			topConceptsIt.close();
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}

		return response;
	}

	/**
	 * this service sets the preferred label for a given language
	 * 
	 * @param skosConceptName
	 * @param label
	 * @param lang
	 * @return
	 */
	public Response setPrefLabel(String skosConceptName, String label, String lang) {

		SKOSModel ontModel = getSKOSModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

		try {
			ARTURIResource skosConcept = ontModel.createURIResource(ontModel.expandQName(skosConceptName));
			ontModel.setPrefLabel(skosConcept, label, lang, getWorkingGraph());
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	/**
	 * this service adds an alternative label for a given language
	 * 
	 * @param skosConceptName
	 * @param label
	 * @param lang
	 * @return
	 */
	public Response addAltLabel(String skosConceptName, String label, String lang) {

		SKOSModel ontModel = getSKOSModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

		try {
			ARTURIResource skosConcept = ontModel.createURIResource(ontModel.expandQName(skosConceptName));
			ontModel.addAltLabel(skosConcept, label, lang, getWorkingGraph());
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	/**
	 * this service removes the preferred label for a given language
	 * 
	 * @param skosConceptName
	 * @param label
	 * @param lang
	 * @return
	 */
	public Response removePrefLabel(String skosConceptName, String label, String lang) {

		SKOSModel ontModel = getSKOSModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

		try {
			ARTURIResource skosConcept = ontModel.createURIResource(ontModel.expandQName(skosConceptName));
			ontModel.removePrefLabel(skosConcept, label, lang, getWorkingGraph());
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	/**
	 * this service removes an alternative label for a given language
	 * 
	 * @param skosConceptName
	 * @param label
	 * @param lang
	 * @return
	 */
	public Response removeAltLabel(String skosConceptName, String label, String lang) {

		SKOSModel ontModel = getSKOSModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

		try {
			ARTURIResource skosConcept = ontModel.createURIResource(ontModel.expandQName(skosConceptName));
			ontModel.removeAltLabel(skosConcept, label, lang, getWorkingGraph());
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	/**
	 * this service gets the preferred label for a given language
	 * 
	 * @param skosConceptName
	 * @param label
	 * @param lang
	 * @return
	 */
	public Response getPrefLabel(String skosConceptName, String lang) {

		SKOSModel ontModel = getSKOSModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {
			ARTResource[] graphs = getUserNamedGraphs();
			ARTURIResource skosConcept = retrieveExistingURIResource(ontModel, skosConceptName, graphs);
			ARTLiteral prefLabel = ontModel.getPrefLabel(skosConcept, lang, true, graphs);

			RDFXMLHelp.addRDFNode(response, STRDFNodeFactory.createSTRDFLiteral(prefLabel, true));
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	/**
	 * this service gets a series of alternative labels for a given language
	 * 
	 * @param skosConceptName
	 * @param label
	 * @param lang
	 * @return
	 */
	public Response getAltLabels(String skosConceptName, String lang) {

		SKOSModel skosModel = getSKOSModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {
			ARTResource[] graphs = getUserNamedGraphs();

			ARTURIResource skosConcept = retrieveExistingURIResource(skosModel, skosConceptName, graphs);
			ARTLiteralIterator altLabels = skosModel.listAltLabels(skosConcept, lang, true, graphs);

			RDFXMLHelp.addRDFNodes(response, createSTLiteralCollection(skosModel, altLabels, true, lang));

			altLabels.close();
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	public Response isTopConcept(String skosConceptName, String schemeName) {
		SKOSModel skosModel = getSKOSModel();

		try {
			ARTResource[] graphs = getUserNamedGraphs();
			ARTURIResource skosConcept = retrieveExistingURIResource(skosModel, skosConceptName, graphs);
			ARTURIResource skosScheme = retrieveExistingURIResource(skosModel, schemeName, graphs);

			return createBooleanResponse(skosModel.isTopConcept(skosConcept, skosScheme, graphs));
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		}

	}

	// **************************
	// **** PRIVATE METHODS *****
	// **************************

	private void recursiveCreateSKOSConceptsTree(SKOSModel ontModel, ARTURIResource concept, Element element)
			throws DOMException, ModelAccessException, NonExistingRDFResourceException {
		Element skosElement = XMLHelp.newElement(element, "concept");
		skosElement.setAttribute("name", ontModel.getQName(concept.getURI()));

		ARTURIResourceIterator subConceptsIterator = ontModel.listNarrowerConcepts(concept, false, true,
				getUserNamedGraphs());
		Element subConceptsElem = XMLHelp.newElement(skosElement, "narrowerConcepts");
		while (subConceptsIterator.hasNext()) {
			ARTURIResource narrowerConcept = subConceptsIterator.next();
			recursiveCreateSKOSConceptsTree(ontModel, narrowerConcept, subConceptsElem);
		}
		subConceptsIterator.close();
	}

	// **************************
	// **** FACILITY METHODS ****
	// **************************

	/**
	 * @param skosModel
	 * @param resource
	 * @param role
	 * @param explicit
	 * @param defaultLanguage
	 *            if != null, the label for that language is retrieved, if ==null, the qname is added on the
	 *            <code>show</code> property of the node
	 * @return
	 * @throws ModelAccessException
	 * @throws NonExistingRDFResourceException
	 */
	private STRDFResource createSTSKOSResource(SKOSModel skosModel, ARTURIResource resource,
			RDFResourceRolesEnum role, boolean explicit, String defaultLanguage) throws ModelAccessException,
			NonExistingRDFResourceException {
		String show;
		ARTLiteral lbl = null;
		if (defaultLanguage != null)
			lbl = skosModel.getPrefLabel(resource, defaultLanguage, true, getUserNamedGraphs());
		if (lbl != null)
			show = lbl.getLabel();
		else
			show = skosModel.getQName(resource.getURI());

		return STRDFNodeFactory.createSTRDFURI(resource, role, explicit, show);
	}

	protected STRDFResource createSTConcept(SKOSModel skosModel, ARTURIResource concept, boolean explicit,
			String defaultLanguage) throws ModelAccessException, NonExistingRDFResourceException {
		return createSTSKOSResource(skosModel, concept, RDFResourceRolesEnum.concept, explicit,
				defaultLanguage);
	}

	// TODO this method would me much better in the STRDFNodeFactory class, but I need to define some standard
	// way to specify how to get the language for a node
	// I should have here too a MAP function, to add a function to be applied to all nodes in the tree
	/**
	 * this function closes the iterator <code>it</code>
	 * 
	 * @param model
	 * @param it
	 * @param role
	 * @param explicit
	 * @param lang
	 * @return
	 * @throws ModelAccessException
	 * @throws NonExistingRDFResourceException
	 */
	public Collection<STRDFResource> createSTSKOSResourceCollection(SKOSModel model,
			ARTURIResourceIterator it, RDFResourceRolesEnum role, boolean explicit, String lang)
			throws ModelAccessException, NonExistingRDFResourceException {
		Collection<STRDFResource> uris = new ArrayList<STRDFResource>();
		while (it.streamOpen()) {
			uris.add(createSTSKOSResource(model, it.getNext(), role, explicit, lang));
		}
		it.close();
		return uris;
	}

	public Collection<STRDFLiteral> createSTLiteralCollection(RDFModel model, ARTLiteralIterator it,
			boolean explicit, String lang) throws ModelAccessException {
		Collection<STRDFLiteral> uris = new ArrayList<STRDFLiteral>();
		while (it.streamOpen()) {
			uris.add(STRDFNodeFactory.createSTRDFLiteral(it.getNext(), explicit));
		}
		it.close();
		return uris;
	}

	private STRDFResource createSTScheme(SKOSModel skosModel, ARTURIResource scheme, boolean explicit,
			String defaultLanguage) throws ModelAccessException, NonExistingRDFResourceException {
		return createSTSKOSResource(skosModel, scheme, RDFResourceRolesEnum.conceptScheme, explicit,
				defaultLanguage);
	}

	protected void decorateForTreeView(SKOSModel model, STRDFResource concept) throws ModelAccessException,
			NonExistingRDFResourceException {
		ARTURIResourceIterator it = model.listNarrowerConcepts((ARTURIResource) concept.getARTNode(), false,
				true, getUserNamedGraphs());
		if (it.streamOpen()) {
			concept.setInfo("more", "1");

		} else
			concept.setInfo("more", "0");
		it.close();
	}

	private void addPrefLabel(SKOSModel skosModel, ARTURIResource res, String prefLabel, String lang)
			throws ModelAccessException, ModelUpdateException, MissingLanguageException,
			NonExistingRDFResourceException {
		if (prefLabel != null) {
			if (lang != null)
				skosModel.setPrefLabel(res, prefLabel, lang, getWorkingGraph());
			else
				throw new MissingLanguageException(res, prefLabel);
		}
	}

	public class MissingLanguageException extends Exception {

		private static final long serialVersionUID = -7921160167995875488L;

		public MissingLanguageException(ARTResource res, String label) {
			super("language for label: " + label + " to be assigned to resource: " + res
					+ " has not been specified");
		}
	}

	@SuppressWarnings("unchecked")
	public static SKOSModel getSKOSModel() {
		return ((Project<SKOSModel>) ProjectManager.getCurrentProject()).getOntModel();
	}

}
