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
import it.uniroma2.art.owlart.models.SKOSModel;
import it.uniroma2.art.owlart.navigation.ARTLiteralIterator;
import it.uniroma2.art.owlart.navigation.ARTURIResourceIterator;
import it.uniroma2.art.owlart.utilities.RDFIterators;
import it.uniroma2.art.owlart.vocabulary.RDFResourceRolesEnum;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.exceptions.NonExistingRDFResourceException;
import it.uniroma2.art.semanticturkey.ontology.utilities.RDFXMLHelp;
import it.uniroma2.art.semanticturkey.project.Project;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.util.Arrays;
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
		public static final String getNarrowerConceptsRequest = "getNarrowerConcepts";
		public static final String getAllSchemesListRequest = "getAllSchemesList";
		public static final String getPrefLabelRequest = "getPrefLabel";
		public static final String getAltLabelsRequest = "getAltLabels";
		public static final String getSchemesMatrixPerConceptRequest = "getSchemesMatrixPerConceptRequest";

		// ADD REQUESTS
		public static final String addBroaderConceptRequest = "addBroaderConcept";
		public static final String addConceptToSchemeRequest = "addConceptToScheme";
		public static final String setPrefLabelRequest = "setPrefLabel";
		public static final String addAltLabelRequest = "addAltLabel";

		// CREATE REQUESTS
		public static final String createConceptRequest = "createConcept";
		public static final String createSchemeRequest = "createScheme";

		// REMOVE REQUESTS
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
		final static public String treeView = "treeView";
	}

	// if any language is specified use english...
	private static String DEF_LANGUAGE_TAG = "en";

	public SKOS(String id) {
		super(id);
	}

	public Logger getLogger() {
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
			logger.debug("SKOS.getAllSchemesListRequest:" + response);

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
			logger.debug("SKOS.getTopConceptsRequest:" + response);
			response = getTopConcepts(schemaURI, defaultLanguage);

		} else if (request.equals(Req.getNarrowerConceptsRequest)) {
			String conceptName = setHttpPar(Par.concept);
			String schemeName = setHttpPar(Par.scheme);
			boolean treeView = setHttpBooleanPar(Par.treeView);
			String defaultLanguage = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.concept);
			logger.debug("SKOS.getNarrowerConceptsRequest:" + response);
			response = getNarrowerConcepts(conceptName, schemeName, treeView, defaultLanguage);

		} else if (request.equals(Req.getPrefLabelRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag);
			logger.debug("SKOS." + Req.getPrefLabelRequest + ":\n" + response);
			response = getPrefLabel(skosConceptName, lang);

		} else if (request.equals(Req.getAltLabelsRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag);
			logger.debug("SKOS." + Req.getAltLabelsRequest + ":\n" + response);
			response = listAltLabels(skosConceptName, lang);

		} else if (request.equals(Req.getSchemesMatrixPerConceptRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag);
			logger.debug("SKOS." + Req.getSchemesMatrixPerConceptRequest + ":\n" + response);
			response = getSchemesMatrixPerConcept(skosConceptName, lang);

			// REMOVE SKOS METHODS
		} else if (request.equals(Req.deleteConceptRequest)) {
			String concept = setHttpPar(Par.concept);
			checkRequestParametersAllNotNull(Par.concept);
			logger.debug("SKOS.removeConceptRequest:" + response);
			response = deleteConcept(concept);

		} else if (request.equals(Req.deleteSchemeRequest)) {
			String scheme = setHttpPar(Par.scheme);
			boolean setForceDeleteDanglingConcepts = setHttpBooleanPar(Par.setForceDeleteDanglingConcepts);
			boolean forceDeleteDanglingConcepts = setHttpBooleanPar(Par.forceDeleteDanglingConcepts);
			checkRequestParametersAllNotNull(Par.scheme);
			logger.debug("SKOS.deleteSchemeRequest:" + response);
			response = deleteScheme(scheme, setForceDeleteDanglingConcepts, forceDeleteDanglingConcepts);

		} else if (request.equals(Req.removePrefLabelRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			String label = setHttpPar(Par.label);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag, Par.label);
			logger.debug("SKOS." + Req.removePrefLabelRequest + ":\n" + response);
			response = removePrefLabel(skosConceptName, label, lang);

		} else if (request.equals(Req.removeAltLabelRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			String label = setHttpPar(Par.label);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag, Par.label);
			logger.debug("SKOS." + Req.removeAltLabelRequest + ":\n" + response);
			response = removeAltLabel(skosConceptName, label, lang);

		} else if (request.equals(Req.removeConceptFromSchemeRequest)) {
			String concept = setHttpPar(Par.concept);
			String scheme = setHttpPar(Par.scheme);
			checkRequestParametersAllNotNull(Par.concept, Par.scheme);
			logger.debug("SKOS.removeConceptFromSchemeRequest:" + response);
			response = removeConceptFromScheme(concept, scheme);

			// ADD SKOS METHODS
		} else if (request.equals(Req.addBroaderConceptRequest)) {
			// newConcept, relatedConcept,rdfsLabel,
			// rdfsLabelLanguage,preferredLabel,preferredLabelLanguage
			String concept = setHttpPar(Par.concept);
			String broaderConcept = setHttpPar(Par.broaderConcept);
			checkRequestParametersAllNotNull(Par.concept, Par.broaderConcept);
			logger.debug("SKOS.addBroaderConceptRequest:" + response);
			response = addBroaderConcept(concept, broaderConcept);

		} else if (request.equals(Req.addConceptToSchemeRequest)) {
			String concept = setHttpPar(Par.concept);
			String scheme = setHttpPar(Par.scheme);
			checkRequestParametersAllNotNull(Par.concept, Par.scheme);
			logger.debug("SKOS.addConceptToSchemeRequest:" + response);
			response = addConceptToScheme(concept, scheme);

		} else if (request.equals(Req.setPrefLabelRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			String label = setHttpPar(Par.label);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag, Par.label);
			logger.debug("SKOS." + Req.setPrefLabelRequest + ":\n" + response);
			response = setPrefLabel(skosConceptName, label, lang);

		} else if (request.equals(Req.addAltLabelRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			String label = setHttpPar(Par.label);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag, Par.label);
			logger.debug("SKOS." + Req.addAltLabelRequest + ":\n" + response);
			response = addAltLabel(skosConceptName, label, lang);

			// CREATE SKOS METHODS

		} else if (request.equals(Req.createConceptRequest)) {
			String conceptName = setHttpPar(Par.concept);
			String broaderConceptName = setHttpPar(Par.broaderConcept);
			String schemeName = setHttpPar(Par.scheme);
			String prefLabel = setHttpPar(Par.prefLabel);
			String prefLabelLanguage = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.concept, Par.scheme);
			logger.debug("SKOS.createConceptRequest:" + response);
			response = createConcept(conceptName, broaderConceptName, schemeName, prefLabel,
					prefLabelLanguage);

		} else if (request.equals(Req.createSchemeRequest)) {
			String schemeName = setHttpPar(Par.scheme);
			String preferredLabel = setHttpPar(Par.prefLabel);
			String preferredLabelLanguage = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.scheme);
			logger.debug("SKOS.createSchemeRequest:" + response);
			response = createConceptScheme(schemeName, preferredLabel, preferredLabelLanguage);

			// MODIFY

		} else if (request.equals(Req.assignHierarchyToSchemeRequest)) {
			String conceptName = setHttpPar(Par.concept);
			String schemeName = setHttpPar(Par.scheme);
			checkRequestParametersAllNotNull(Par.concept, Par.scheme);
			logger.debug(Req.assignHierarchyToSchemeRequest + ":\n" + response);
			response = assignHierarchyToScheme(conceptName, schemeName);

		} else if (request.equals(Req.showSKOSConceptsTreeRequest)) {
			String schemeName = setHttpPar(Par.scheme);
			checkRequestParametersAllNotNull(Par.scheme);
			response = showSKOSConceptsTree(schemeName);
		} else if (request.equals(Req.removeBroaderConcept)) {
			String conceptName = setHttpPar(Par.concept);
			String broaderConceptName = setHttpPar(Par.broaderConcept);
			checkRequestParametersAllNotNull(Par.concept, Par.broaderConcept);
			logger.debug(Req.removeBroaderConcept + ":\n" + response);
			response = removeBroaderConcept(conceptName, broaderConceptName);
		}

		else
			return servletUtilities.createNoSuchHandlerExceptionResponse(request);

		this.fireServletEvent();
		return response;
	}

	private Response removeBroaderConcept(String conceptName, String broaderConceptName) {
		SKOSModel skosModel = getSKOSModel();
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {
			ARTResource[] graphs = getUserNamedGraphs();
			ARTURIResource concept = retrieveExistingResource(skosModel, conceptName, graphs);
			ARTURIResource broaderConcept = retrieveExistingResource(skosModel, broaderConceptName, graphs);

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

	public Response assignHierarchyToScheme(String conceptName, String schemeName) {
		SKOSModel skosModel = getSKOSModel();
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {
			ARTResource[] graphs = getUserNamedGraphs();
			ARTURIResource concept = retrieveExistingResource(skosModel, conceptName, graphs);
			ARTURIResource scheme = retrieveExistingResource(skosModel, schemeName, graphs);
			assignHierarchyToSchemeRecursive(skosModel, concept, scheme, graphs);
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		}
		return response;
	}

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
			ARTURIResource skosConcept = retrieveExistingResource(skosModel, skosConceptName, graphs);
			Collection<ARTURIResource> schemesForConcept = RDFIterators.getCollectionFromIterator(skosModel
					.listAllSchemesForConcept(skosConcept, graphs));
			ARTURIResourceIterator schemes = skosModel.listAllSchemes(graphs);
			while (schemes.streamOpen()) {
				ARTURIResource scheme = schemes.getNext();
				Element schemeElem = RDFXMLHelp.addRDFNodeXMLElement(dataElement, skosModel, scheme, false,
						true);
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
				ARTURIResource skosScheme = retrieveExistingResource(skosModel, schemaUri,
						getUserNamedGraphs());
				it = skosModel.listTopConceptsInScheme(skosScheme, true, getUserNamedGraphs());
			} else {
				// TODO move to OWLART?
				it = getTopConcepts();
			}

			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
			Element dataElement = response.getDataElement();
			makeConceptListXML(skosModel, dataElement, it, true, defaultLanguage);
			return response;

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}

	}

	// TODO maybe it is the case to move it to OWLART...
	/**
	 * 
	 * 
	 * @param defaultLanguage
	 * @return
	 * @throws ModelAccessException
	 */
	public ARTURIResourceIterator getTopConcepts() throws ModelAccessException {
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
			ARTURIResource concept = retrieveExistingResource(skosModel, conceptName, graphs);
			if (skosModel.listNarrowerConcepts(concept, false, true, getUserNamedGraphs()).streamOpen()) {
				return createReplyFAIL("concept: " + conceptName + " has narrower graphs; delete them before");
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

			SKOSModel skosModel = getSKOSModel();
			ARTURIResource scheme = skosModel.retrieveURIResource(skosModel.expandQName(schemeName),
					getUserNamedGraphs());
			if (scheme == null || !skosModel.isSKOSConceptScheme(scheme, getUserNamedGraphs()))
				return logAndSendException("resource" + scheme + " does not exist or is not a scheme");

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
		}
		return response;
	}

	public Response createConceptScheme(String schemeQName, String prefLabel, String lang) {
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		logger.debug("new scheme name: " + schemeQName);

		try {

			SKOSModel skosModel = getSKOSModel();
			ARTURIResource newScheme = skosModel.createURIResource(skosModel.expandQName(schemeQName));

			// add a new concept scheme...
			skosModel.addSKOSConceptScheme(newScheme, getWorkingGraph());

			// add skos:preferredLabel
			if (prefLabel != null && prefLabel.length() > 0) {
				skosModel.setPrefLabel(newScheme, prefLabel, lang != null && lang.length() > 0 ? lang : "en",
						getWorkingGraph());
			}

			Element dataElement = response.getDataElement();
			Element conceptElement = XMLHelp.newElement(dataElement, "scheme");
			makeConceptXML(skosModel, newScheme, conceptElement, false, lang);

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
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
			ARTURIResource concept = retrieveExistingResource(skosModel, conceptQName, getUserNamedGraphs());
			ARTURIResource broaderConcept = retrieveExistingResource(skosModel, braoderConceptQName,
					getUserNamedGraphs());

			skosModel.addBroaderConcept(concept, broaderConcept, getWorkingGraph());

			Element dataElement = response.getDataElement();
			Element conceptElement = XMLHelp.newElement(dataElement, "concept");
			makeConceptXML(skosModel, concept, conceptElement, false, "");

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
		logger.debug("concept: " + conceptQName);
		logger.debug("scheme: " + schemeQName);

		try {

			SKOSModel skosModel = getSKOSModel();
			ARTURIResource concept = skosModel.retrieveURIResource(skosModel.expandQName(conceptQName),
					getUserNamedGraphs());
			ARTURIResource scheme = skosModel.retrieveURIResource(skosModel.expandQName(schemeQName));

			if (concept == null)
				return logAndSendException(concept + " is not present in the scheme");
			if (scheme == null)
				return logAndSendException(scheme + " is not present in the scheme");

			skosModel.addConceptToScheme(concept, scheme, getWorkingGraph());

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		}
		return response;
	}

	public Response removeConceptFromScheme(String conceptQName, String schemeQName) {
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		logger.debug("concept: " + conceptQName);
		logger.debug("scheme: " + schemeQName);

		try {

			SKOSModel skosModel = getSKOSModel();
			ARTURIResource concept = skosModel.retrieveURIResource(skosModel.expandQName(conceptQName),
					getUserNamedGraphs());
			ARTURIResource scheme = skosModel.retrieveURIResource(skosModel.expandQName(schemeQName));

			if (concept == null)
				return logAndSendException(concept + " is not present in the scheme");
			if (scheme == null)
				return logAndSendException(scheme + " is not present in the scheme");

			skosModel.removeConceptFromScheme(concept, scheme, getWorkingGraph());

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
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

			ARTURIResource newConcept = skosModel.createURIResource(skosModel.expandQName(conceptName));
			if (skosModel.existsResource(newConcept, graphs)) {
				return logAndSendException("not possible to create: " + newConcept
						+ "; there is a resource with the same name!");
			}

			ARTURIResource superConcept;
			if (superConceptName != null)
				superConcept = retrieveExistingResource(skosModel, superConceptName, graphs);
			else
				superConcept = NodeFilters.NONE;

			ARTURIResource conceptScheme;
			try {
				conceptScheme = retrieveExistingResource(skosModel, schemeName, graphs);
			} catch (NonExistingRDFResourceException e) {
				return logAndSendException("scheme: " + schemeName + "does not exist in graphs: "
						+ Arrays.toString(graphs));
			}

			// add new concept...
			logger.debug("adding concept to graph: " + wrkGraph);
			skosModel.addConceptToScheme(newConcept.getURI(), superConcept, conceptScheme, wrkGraph);

			// add skos:preferredLabel
			if (prefLabel != null && prefLabel.length() > 0) {
				skosModel.setPrefLabel(newConcept, prefLabel, prefLabelLang != null
						&& prefLabelLang.length() > 0 ? prefLabelLang : DEF_LANGUAGE_TAG, wrkGraph);
			}

			Element dataElement = response.getDataElement();
			Element conceptElement = XMLHelp.newElement(dataElement, "concept");
			makeConceptXML(skosModel, newConcept, conceptElement, false, prefLabelLang);

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
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
			Element dataElement = response.getDataElement();
			ARTURIResource concept = retrieveExistingResource(skosModel, conceptName, getUserNamedGraphs());
			ARTURIResourceIterator unfilteredIt = skosModel.listNarrowerConcepts(concept, false, true,
					getUserNamedGraphs());
			Iterator<ARTURIResource> it;
			if (schemeName != null) {
				ARTURIResource scheme = retrieveExistingResource(skosModel, schemeName, getUserNamedGraphs());
				it = Iterators.filter(unfilteredIt,
						ConceptsInSchemePredicate.getFilter(skosModel, scheme, getUserNamedGraphs()));
			} else {
				it = unfilteredIt;
			}
			makeConceptListXML(skosModel, dataElement, it, TreeView, defaultLanguage);
			unfilteredIt.close();
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

		logger.debug("[getAllSchemesList] defaultLanguage: " + defaultLanguage);

		Element dataElement = response.getDataElement();
		dataElement.setAttribute("type", "SchemePanel");
		Element root = XMLHelp.newElement(dataElement, "SKOSScheme");
		try {
			ARTURIResourceIterator it = skosModel.listAllSchemes(getUserNamedGraphs());
			Element instancesElement = XMLHelp.newElement(root, "Schemes");
			while (it.streamOpen()) {
				ARTURIResource resource = it.next();
				String uri = skosModel.getQName(resource.asURIResource().getURI());
				Element element = XMLHelp.newElement(instancesElement, "Scheme");
				element.setAttribute("name", skosModel.getQName(resource.getURI()));
				element.setAttribute("uri", uri);
				element.setAttribute("label", getConceptLabel(resource, defaultLanguage));
			}

		} catch (ModelAccessException e) {
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
		Element dataElement = response.getDataElement();
		try {
			ARTURIResource skosConcept = ontModel.createURIResource(ontModel.expandQName(skosConceptName));
			ARTLiteral prefLabel = ontModel.getPrefLabel(skosConcept, lang, true, getUserNamedGraphs());
			RDFXMLHelp.addRDFNodeXMLElement(dataElement, ontModel, prefLabel, false, false);
		} catch (ModelAccessException e) {
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
	public Response listAltLabels(String skosConceptName, String lang) {

		SKOSModel ontModel = getSKOSModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		try {
			ARTURIResource skosConcept = ontModel.createURIResource(ontModel.expandQName(skosConceptName));
			ARTLiteralIterator altLabels = ontModel.listAltLabels(skosConcept, lang, true,
					getUserNamedGraphs());
			while (altLabels.streamOpen()) {
				RDFXMLHelp.addRDFNodeXMLElement(dataElement, ontModel, altLabels.getNext(), false, false);
			}
			altLabels.close();
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		}
		return response;
	}

	// private supporting methods

	// don't like this one...
	/**
	 * Return a human-readable representation for concept <code>concept</code>
	 * 
	 * @param concept
	 *            concept
	 * @return preferred label
	 * @throws ModelAccessException
	 */
	private String getConceptLabel(ARTURIResource concept, String defaultLanguage)
			throws ModelAccessException {
		if (defaultLanguage == null || defaultLanguage.length() == 0)
			defaultLanguage = DEF_LANGUAGE_TAG;
		String preferredLabel = null;

		SKOSModel skosModel = getSKOSModel();

		// load preferredLabel...
		ARTLiteral lbl = skosModel.getPrefLabel(concept, defaultLanguage, true, getUserNamedGraphs());
		if (lbl != null) {
			preferredLabel = lbl.getLabel();
		}
		return preferredLabel;
	}

	private void recursiveCreateSKOSConceptsTree(SKOSModel ontModel, ARTURIResource concept, Element element)
			throws DOMException, ModelAccessException {
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

	private void makeConceptListXML(SKOSModel skosModel, Element dataElement, Iterator<ARTURIResource> it,
			boolean treeView, String defaultLanguage) throws DOMException, ModelAccessException {
		while (it.hasNext()) {
			ARTURIResource concept = it.next();
			Element conceptElement = XMLHelp.newElement(dataElement, "concept");
			makeConceptXML(skosModel, concept, conceptElement, treeView, defaultLanguage);
		}
	}

	// TODO good idea to have a single method for XML-rendering concepts, but I don't like the fact that it
	// requires further querying over the model, as its data is already know in most of the cases of its use
	// (since they are write methods which end up in retrieving the same data that they have just added).
	// Also, when a concept has just been added, there's no need to understand if it has children
	//
	// ALSO, we can use the pretty print of resources made available on the basic semantic turkey
	// RDFXMLHelp class, but I would add some way to specify in advance that we are speaking about concepts
	// instead of making all the investigation to discover the object nature
	// Also, maybe for the tree is ok to use this specific method
	private void makeConceptXML(SKOSModel skosModel, ARTURIResource concept, Element conceptElement,
			boolean treeView, String defaultLanguage) throws DOMException, ModelAccessException {
		conceptElement.setAttribute("name", skosModel.getQName(concept.getURI()));
		conceptElement.setAttribute("uri", concept.getURI());

		if (treeView) {
			ARTURIResourceIterator it2 = skosModel.listNarrowerConcepts(concept, false, true,
					getUserNamedGraphs());
			if (it2.streamOpen()) {
				conceptElement.setAttribute("more", "1");
				it2.close();
			} else
				conceptElement.setAttribute("more", "0");
		}
		conceptElement.setAttribute("label", getConceptLabel(concept, defaultLanguage));
	}

	@SuppressWarnings("unchecked")
	protected SKOSModel getSKOSModel() {
		return ((Project<SKOSModel>) ProjectManager.getCurrentProject()).getOntModel();
	}

}
