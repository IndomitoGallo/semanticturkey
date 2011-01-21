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
import it.uniroma2.art.owlart.model.ARTLiteral;
import it.uniroma2.art.owlart.model.ARTNode;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.SKOSModel;
import it.uniroma2.art.owlart.navigation.ARTStatementIterator;
import it.uniroma2.art.owlart.navigation.ARTURIResourceIterator;
import it.uniroma2.art.owlart.vocabulary.RDFS;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.DOMException;
import org.w3c.dom.Element;

/**
 * @author Luca Mastrogiovanni <luca.mastrogiovanni@caspur.it>
 * 
 */
public class SKOS extends Resource {

	protected static Logger logger = LoggerFactory.getLogger(SKOS.class);

	// REQUESTS
	public static class Req {
		// GET REQUESTS
		public static final String getAllSchemesListRequest = "getAllSchemesList";
		public static final String getConceptsTreeRequest = "getConceptsTree";
		public static final String getNarrowerConceptsRequest = "getNarrowerConcepts";

		// ADD REQUESTS
		public static final String addConceptRequest = "addConcept";
		public static final String addSemanticRelationRequest = "addSemanticRelation";

		// CREATE REQUESTS
		public static final String createNarrowerConceptRequest = "createNarrowerConcept";
		public static final String createBroaderConceptRequest = "createBroaderConcept";
		public static final String createSchemeRequest = "createScheme";

		// REMOVE REQUESTS
		public static final String removeConceptRequest = "removeConcept";

	}

	// PARS
	public static class Par {
		final static public String concept = "concept";
		final static public String conceptFrom = "conceptFrom";
		final static public String semanticRelation = "semanticRelation";
		final static public String conceptTo = "conceptTo";
		final static public String schemeName = "schemeName";
		final static public String langTag = "langTag";
		final static public String conceptName = "conceptName";
		final static public String rdfsLabel = "rdfsLabel";
		final static public String rdfsLabelLanguage = "rdfsLabelLanguage";
		final static public String preferredLabel = "preferredLabel";
		final static public String preferredLabelLanguage = "preferredLabelLanguage";
		final static public String newConcept = "newConcept";
		final static public String relatedConcept = "relatedConcept";

	}

	// if any language is specified use english...
	private static String LANGUAGE_TAG = "en";

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
		ServletUtilities servletUtilities = new ServletUtilities();
		// all new fashoned requests are put inside these grace brackets
		if (request == null)
			return ServletUtilities.getService().createNoSuchHandlerExceptionResponse(request);

		// GET SKOS METHODS
		if (request.equals(Req.getAllSchemesListRequest)) {
			String defaultLanguage = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.langTag);
			response = getAllSchemesList(defaultLanguage);
			logger.debug("SKOS.getAllSchemesListRequest:" + response);
		} else if (request.equals(Req.getConceptsTreeRequest)) {
			String schemaURI = setHttpPar(Par.schemeName);
			String defaultLanguage = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.schemeName);
			logger.debug("SKOS.getAllSchemesListRequest:" + response);
			response = getConceptsTreeRequest(schemaURI, defaultLanguage);
		} else if (request.equals(Req.getNarrowerConceptsRequest)) {
			String conceptName = setHttpPar(Par.conceptName);
			String defaultLanguage = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.conceptName);
			logger.debug("SKOS.getNarrowerConceptsRequest:" + response);
			response = getNarrowerConceptsRequest(conceptName, defaultLanguage);

			// REMOVE SKOS METHODS
		} else if (request.equals(Req.removeConceptRequest)) {
			String concept = setHttpPar(Par.concept);
			checkRequestParametersAllNotNull(Par.concept);
			logger.debug("SKOS.removeConceptRequest:" + response);
			response = removeConcept(concept);

			// ADD SKOS METHODS
		} else if (request.equals(Req.addConceptRequest)) {
			String conceptName = setHttpPar(Par.conceptName);
			String schemeName = setHttpPar(Par.schemeName);
			String rdfsLabel = setHttpPar(Par.rdfsLabel);
			String rdfsLabelLanguage = setHttpPar(Par.rdfsLabelLanguage);
			String preferredLabel = setHttpPar(Par.preferredLabel);
			String preferredLabelLanguage = setHttpPar(Par.preferredLabelLanguage);
			checkRequestParametersAllNotNull(Par.conceptName, Par.schemeName);
			logger.debug("SKOS.addConceptRequest:" + response);
			response = addConcept(conceptName, schemeName, rdfsLabel, rdfsLabelLanguage, preferredLabel,
					preferredLabelLanguage);
		} else if (request.equals(Req.addSemanticRelationRequest)) {
			String conceptFrom = setHttpPar(Par.conceptFrom);
			String conceptTo = setHttpPar(Par.conceptTo);
			String semanticRelation = setHttpPar(Par.semanticRelation);
			checkRequestParametersAllNotNull(Par.conceptFrom, Par.conceptTo, Par.semanticRelation);
			logger.debug("SKOS.addSemanticRelationRequest:" + response);
			response = addSemanticRelation(conceptFrom, semanticRelation, conceptTo);

			// CREATE SKOS METHODS
		} else if (request.equals(Req.createNarrowerConceptRequest)) {
			// newConcept, relatedConcept,rdfsLabel,
			// rdfsLabelLanguage,preferredLabel,preferredLabelLanguage
			String newConcept = setHttpPar(Par.newConcept);
			String relatedConcept = setHttpPar(Par.relatedConcept);
			String schemeName = setHttpPar(Par.schemeName);
			String rdfsLabel = setHttpPar(Par.rdfsLabel);
			String rdfsLabelLanguage = setHttpPar(Par.rdfsLabelLanguage);
			String preferredLabel = setHttpPar(Par.preferredLabel);
			String preferredLabelLanguage = setHttpPar(Par.preferredLabelLanguage);
			checkRequestParametersAllNotNull(Par.newConcept, Par.relatedConcept, Par.schemeName);
			logger.debug("SKOS.createNarrowerConceptRequest:" + response);
			response = addNarrowerConcept(newConcept, schemeName, relatedConcept, rdfsLabel,
					rdfsLabelLanguage, preferredLabel, preferredLabelLanguage);
		} else if (request.equals(Req.createBroaderConceptRequest)) {
			// newConcept, relatedConcept,rdfsLabel,
			// rdfsLabelLanguage,preferredLabel,preferredLabelLanguage
			String newConcept = setHttpPar(Par.newConcept);
			String relatedConcept = setHttpPar(Par.relatedConcept);
			String schemeName = setHttpPar(Par.schemeName);
			String rdfsLabel = setHttpPar(Par.rdfsLabel);
			String rdfsLabelLanguage = setHttpPar(Par.rdfsLabelLanguage);
			String preferredLabel = setHttpPar(Par.preferredLabel);
			String preferredLabelLanguage = setHttpPar(Par.preferredLabelLanguage);
			checkRequestParametersAllNotNull(Par.newConcept, Par.relatedConcept, Par.schemeName);
			logger.debug("SKOS.createBroaderConceptRequest:" + response);
			response = addBroaderConcept(newConcept, schemeName, relatedConcept, rdfsLabel,
					rdfsLabelLanguage, preferredLabel, preferredLabelLanguage);
		} else if (request.equals(Req.createSchemeRequest)) {
			String schemeName = setHttpPar(Par.schemeName);
			String rdfsLabel = setHttpPar(Par.rdfsLabel);
			String rdfsLabelLanguage = setHttpPar(Par.rdfsLabelLanguage);
			String preferredLabel = setHttpPar(Par.preferredLabel);
			String preferredLabelLanguage = setHttpPar(Par.preferredLabelLanguage);
			checkRequestParametersAllNotNull(Par.schemeName);
			logger.debug("SKOS.createSchemeRequest:" + response);
			response = addConceptScheme(schemeName, rdfsLabel, rdfsLabelLanguage, preferredLabel,
					preferredLabelLanguage);
		} else
			return ServletUtilities.getService().createNoSuchHandlerExceptionResponse(request);

		this.fireServletEvent();
		return response;
	}

	public Response removeConcept(String concept) {
		ResponseREPLY response = ServletUtilities.getService().createReplyResponse(Req.removeConceptRequest,
				RepliesStatus.ok);
		logger.debug("remove concept");
		logger.debug("concept: " + concept);

		try {

			SKOSModel skosModel = (SKOSModel) ProjectManager.getCurrentProject().getOntModel();
			ARTURIResource subject = skosModel.createURIResource(skosModel.expandQName(concept));

			skosModel.removeConcept(subject, NodeFilters.MAINGRAPH);

		} catch (ModelAccessException e) {
			return servletUtilities.createExceptionResponse(Req.addConceptRequest, e);
		} catch (ModelUpdateException e) {
			return servletUtilities.createExceptionResponse(Req.addConceptRequest, e);
		}
		return response;
	}

	public Response addSemanticRelation(String conceptFrom, String semanticRelation, String conceptTo) {
		ResponseREPLY response = ServletUtilities.getService().createReplyResponse(
				Req.addSemanticRelationRequest, RepliesStatus.ok);
		logger.debug("add semantic relation");
		logger.debug("conceptFrom: " + conceptFrom);
		logger.debug("semanticRelation: " + semanticRelation);
		logger.debug("conceptTo: " + conceptTo);

		try {

			SKOSModel skosModel = (SKOSModel) ProjectManager.getCurrentProject().getOntModel();
			ARTResource subject = skosModel.createURIResource(skosModel.expandQName(conceptFrom));
			ARTURIResource predicate = skosModel.createURIResource(skosModel.expandQName(semanticRelation));
			ARTResource object = skosModel.createURIResource(skosModel.expandQName(conceptTo));

			// add relation
			skosModel.addTriple(subject, predicate, object, NodeFilters.MAINGRAPH);

		} catch (ModelAccessException e) {
			return servletUtilities.createExceptionResponse(Req.addConceptRequest, e);
		} catch (ModelUpdateException e) {
			return servletUtilities.createExceptionResponse(Req.addConceptRequest, e);
		}
		return response;
	}

	public Response addConceptScheme(String schemeQName, String rdfsLabel, String rdfsLabelLanguage,
			String preferredLabel, String preferredLabelLanguage) {
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(
				Req.createSchemeRequest, RepliesStatus.ok);
		logger.debug("new scheme name: " + schemeQName);

		try {

			SKOSModel skosModel = (SKOSModel) ProjectManager.getCurrentProject().getOntModel();
			ARTURIResource newScheme = skosModel.createURIResource(skosModel.expandQName(schemeQName));

			// add a new concept scheme...
			skosModel.addSKOSConceptScheme(newScheme, NodeFilters.MAINGRAPH);

			// add skos:preferredLabel
			if (preferredLabel != null && preferredLabel.length() > 0) {
				skosModel.setPrefLabel(newScheme, preferredLabel, preferredLabelLanguage != null
						&& preferredLabelLanguage.length() > 0 ? preferredLabelLanguage : "en",
						NodeFilters.MAINGRAPH);
			}
			// add rdfs:label
			if (rdfsLabel != null && rdfsLabel.length() > 0) {
				skosModel.addLabel(newScheme, rdfsLabel, rdfsLabelLanguage != null
						&& rdfsLabelLanguage.length() > 0 ? rdfsLabelLanguage : "en", NodeFilters.MAINGRAPH);
			}

			Element dataElement = response.getDataElement();
			Element conceptElement = XMLHelp.newElement(dataElement, "scheme");
			makeConceptXML(skosModel, newScheme, conceptElement, rdfsLabelLanguage);

		} catch (ModelAccessException e) {
			return servletUtilities.createExceptionResponse(Req.addConceptRequest, e);
		} catch (ModelUpdateException e) {
			return servletUtilities.createExceptionResponse(Req.addConceptRequest, e);
		}
		return response;
	}

	public Response addBroaderConcept(String newConceptQName, String schemeName, String relatedConceptQName,
			String rdfsLabel, String rdfsLabelLanguage, String preferredLabel, String preferredLabelLanguage) {
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(
				Req.getNarrowerConceptsRequest, RepliesStatus.ok);
		logger.debug("newConcept: " + newConceptQName);
		logger.debug("relatedConcept: " + relatedConceptQName);
		logger.debug("schemeName: " + schemeName);

		try {

			SKOSModel skosModel = (SKOSModel) ProjectManager.getCurrentProject().getOntModel();
			ARTURIResource newConcept = skosModel.createURIResource(skosModel.expandQName(newConceptQName));
			ARTURIResource relatedConcept = skosModel.createURIResource(skosModel
					.expandQName(relatedConceptQName));
			ARTURIResource scheme = skosModel.createURIResource(skosModel.expandQName(schemeName));

			// add new concept...
			skosModel.setDefaultScheme(scheme);

			// scorro i concetti broader di relatedConcept ed elimino la relazione <relatedConcept
			// skos:broader ?x>,
			// sucessivamente viene creata una nuova tripla <newConcept skos:broader ?x>,
			ARTURIResourceIterator itUri = skosModel.listBroaderConcepts(relatedConcept, false, true,
					NodeFilters.MAINGRAPH);
			while (itUri.streamOpen()) {
				ARTURIResource broader = itUri.next();
				// remoe narrower an broader links
				skosModel.removeBroaderConcept(relatedConcept, broader, NodeFilters.MAINGRAPH);
				skosModel.removeNarroweConcept(broader, relatedConcept, NodeFilters.MAINGRAPH);

				skosModel.addBroaderConcept(newConcept, broader, NodeFilters.MAINGRAPH);
				// TODO: rimuovere questa riga deve funzionare il reasoning...
				skosModel.addNarrowerConcept(broader, newConcept, NodeFilters.MAINGRAPH);
			}
			itUri.close();
			skosModel.addBroaderConcept(relatedConcept, newConcept, NodeFilters.MAINGRAPH);
			// TODO: rimuovere questa riga deve funzionare il reasoning...
			skosModel.addNarrowerConcept(newConcept, relatedConcept, NodeFilters.MAINGRAPH);

			// add skos:preferredLabel
			if (preferredLabel != null && preferredLabel.length() > 0) {
				skosModel.setPrefLabel(newConcept, preferredLabel, preferredLabelLanguage != null
						&& preferredLabelLanguage.length() > 0 ? preferredLabelLanguage : "en",
						NodeFilters.MAINGRAPH);
			}
			// add rdfs:label
			if (rdfsLabel != null && rdfsLabel.length() > 0) {
				skosModel.addLabel(newConcept, rdfsLabel, rdfsLabelLanguage != null
						&& rdfsLabelLanguage.length() > 0 ? rdfsLabelLanguage : "en", NodeFilters.MAINGRAPH);
			}

			Element dataElement = response.getDataElement();
			Element conceptElement = XMLHelp.newElement(dataElement, "concept");
			makeConceptXML(skosModel, newConcept, conceptElement, rdfsLabelLanguage);

		} catch (ModelAccessException e) {
			return servletUtilities.createExceptionResponse(Req.addConceptRequest, e);
		} catch (ModelUpdateException e) {
			return servletUtilities.createExceptionResponse(Req.addConceptRequest, e);
		}
		return response;
	}

	public Response addNarrowerConcept(String newConceptQName, String schemeName, String relatedConceptQName,
			String rdfsLabel, String rdfsLabelLanguage, String preferredLabel, String preferredLabelLanguage) {
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(
				Req.getNarrowerConceptsRequest, RepliesStatus.ok);
		logger.debug("newConcept: " + newConceptQName);
		logger.debug("relatedConcept: " + relatedConceptQName);
		logger.debug("schemeName: " + schemeName);

		try {
			SKOSModel skosModel = (SKOSModel) ProjectManager.getCurrentProject().getOntModel();
			ARTURIResource newConcept = skosModel.createURIResource(skosModel.expandQName(newConceptQName));
			ARTURIResource relatedConcept = skosModel.createURIResource(skosModel
					.expandQName(relatedConceptQName));
			ARTURIResource scheme = skosModel.createURIResource(skosModel.expandQName(schemeName));

			// add new concept...
			skosModel.setDefaultScheme(scheme);
			skosModel.addConcept(newConcept.getURI(), relatedConcept, NodeFilters.MAINGRAPH);

			// TODO: rimuovere questa riga deve funzionare il reasoning...
			skosModel.addNarrowerConcept(relatedConcept, newConcept, NodeFilters.MAINGRAPH);

			// add skos:preferredLabel
			if (preferredLabel != null && preferredLabel.length() > 0) {
				skosModel.setPrefLabel(newConcept, preferredLabel, preferredLabelLanguage != null
						&& preferredLabelLanguage.length() > 0 ? preferredLabelLanguage : "en",
						NodeFilters.MAINGRAPH);
			}
			// add rdfs:label
			if (rdfsLabel != null && rdfsLabel.length() > 0) {
				skosModel.addLabel(newConcept, rdfsLabel, rdfsLabelLanguage != null
						&& rdfsLabelLanguage.length() > 0 ? rdfsLabelLanguage : "en", NodeFilters.MAINGRAPH);
			}

			Element dataElement = response.getDataElement();
			Element conceptElement = XMLHelp.newElement(dataElement, "concept");
			makeConceptXML(skosModel, newConcept, conceptElement, rdfsLabelLanguage);

		} catch (ModelAccessException e) {
			return servletUtilities.createExceptionResponse(Req.addConceptRequest, e);
		} catch (ModelUpdateException e) {
			return servletUtilities.createExceptionResponse(Req.addConceptRequest, e);
		}
		return response;
	}

	public Response addConcept(String conceptName, String schemeName, String rdfsLabel,
			String rdfsLabelLanguage, String preferredLabel, String preferredLabelLanguage) {
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(
				Req.getNarrowerConceptsRequest, RepliesStatus.ok);
		logger.debug("conceptName: " + conceptName);
		logger.debug("schemeName: " + schemeName);

		try {
			SKOSModel skosModel = (SKOSModel) ProjectManager.getCurrentProject().getOntModel();
			ARTURIResource newConcept = skosModel.createURIResource(skosModel.expandQName(conceptName));
			ARTURIResource conceptScheme = skosModel.createURIResource(skosModel.expandQName(schemeName));

			// add new concept...
			skosModel.addConceptToScheme(newConcept.getURI(), NodeFilters.NONE, conceptScheme,
					NodeFilters.MAINGRAPH);

			// TODO: rimuovere questa riga deve funzionare il reasoning...
			skosModel.addTriple(conceptScheme, it.uniroma2.art.owlart.vocabulary.SKOS.Res.HASTOPCONCEPT,
					newConcept, NodeFilters.MAINGRAPH);

			// add skos:preferredLabel
			if (preferredLabel != null && preferredLabel.length() > 0) {
				skosModel.setPrefLabel(newConcept, preferredLabel, preferredLabelLanguage != null
						&& preferredLabelLanguage.length() > 0 ? preferredLabelLanguage : "en",
						NodeFilters.MAINGRAPH);
			}
			// add rdfs:label
			if (rdfsLabel != null && rdfsLabel.length() > 0) {
				skosModel.addLabel(newConcept, rdfsLabel, rdfsLabelLanguage != null
						&& rdfsLabelLanguage.length() > 0 ? rdfsLabelLanguage : "en", NodeFilters.MAINGRAPH);
			}

			Element dataElement = response.getDataElement();
			Element conceptElement = XMLHelp.newElement(dataElement, "concept");
			makeConceptXML(skosModel, newConcept, conceptElement, rdfsLabelLanguage);

		} catch (ModelAccessException e) {
			return servletUtilities.createExceptionResponse(Req.addConceptRequest, e);
		} catch (ModelUpdateException e) {
			return servletUtilities.createExceptionResponse(Req.addConceptRequest, e);
		}
		return response;
	}

	public Response getNarrowerConceptsRequest(String conceptName, String defaultLanguage) {
		SKOSModel skosModel = (SKOSModel) ProjectManager.getCurrentProject().getOntModel();
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(
				Req.getNarrowerConceptsRequest, RepliesStatus.ok);
		try {

			// TODO: il corpo di questo metodo è praticamente uguale a quello di getConceptsTreeRequest farne
			// uno soloe...
			Element dataElement = response.getDataElement();
			ARTURIResource concept = skosModel.createURIResource(skosModel.expandQName(conceptName));
			ARTURIResourceIterator it = skosModel.listNarrowerConcepts(concept, false, true,
					NodeFilters.MAINGRAPH);

			makeConceptListXML(skosModel, dataElement, it, defaultLanguage);

		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(Req.getNarrowerConceptsRequest, e);
		}
		return response;

	}

	private void makeConceptListXML(SKOSModel skosModel, Element dataElement, ARTURIResourceIterator it,
			String defaultLanguage) throws DOMException, ModelAccessException {
		while (it.streamOpen()) {
			ARTURIResource concept = it.next();
			Element conceptElement = XMLHelp.newElement(dataElement, "concept");
			makeConceptXML(skosModel, concept, conceptElement, defaultLanguage);
		}
		it.close();
	}

	private void makeConceptXML(SKOSModel skosModel, ARTURIResource concept, Element conceptElement,
			String defaultLanguage) throws DOMException, ModelAccessException {
		conceptElement.setAttribute("name", skosModel.getQName(concept.getURI()));
		conceptElement.setAttribute("uri", concept.getURI());
		ARTURIResourceIterator it2 = skosModel.listNarrowerConcepts(concept, false, true,
				NodeFilters.MAINGRAPH);
		if (it2.streamOpen()) {
			conceptElement.setAttribute("more", "1");
			it2.close();
		} else
			conceptElement.setAttribute("more", "0");
		conceptElement.setAttribute("label", getConceptLabel(concept, defaultLanguage));
	}

	public Response getConceptsTreeRequest(String schemaUri, String defaultLanguage) {
		SKOSModel skosModel = (SKOSModel) ProjectManager.getCurrentProject().getOntModel();
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(
				Req.getConceptsTreeRequest, RepliesStatus.ok);
		try {

			Element dataElement = response.getDataElement();
			ARTURIResource skosScheme = skosModel.createURIResource(skosModel.expandQName(schemaUri));
			ARTURIResourceIterator it = skosModel.listTopConceptsInScheme(skosScheme, true,
					NodeFilters.MAINGRAPH);

			makeConceptListXML(skosModel, dataElement, it, defaultLanguage);

		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(Req.getAllSchemesListRequest, e);
		}
		return response;
	}

	public Response getAllSchemesList(String defaultLanguage) {
		SKOSModel skosModel = (SKOSModel) ProjectManager.getCurrentProject().getOntModel();
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(
				Req.getAllSchemesListRequest, RepliesStatus.ok);

		logger.debug("[getAllSchemesList] defaultLanguage: " + defaultLanguage);

		Element dataElement = response.getDataElement();
		dataElement.setAttribute("type", "SchemePanel");
		Element root = XMLHelp.newElement(dataElement, "SKOSScheme");
		try {
			ARTURIResourceIterator it = skosModel.listAllSchemes(NodeFilters.MAINGRAPH);
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
			return ServletUtilities.getService().createExceptionResponse(Req.getAllSchemesListRequest, e);
		}
		return response;
	}

	/**
	 * Return the rdfs:label or preferred label associate at the concept <code>concept</code>
	 * 
	 * @param concept
	 *            concept
	 * @return preferred label
	 * @throws ModelAccessException
	 */
	private String getConceptLabel(ARTURIResource concept, String defaultLanguage)
			throws ModelAccessException {
		if (defaultLanguage == null || defaultLanguage.length() == 0)
			defaultLanguage = LANGUAGE_TAG;
		String rdfsLabel = null;
		String rdfsLabelNullLanguage = null;
		String preferredLabel = null;

		SKOSModel skosModel = (SKOSModel) ProjectManager.getCurrentProject().getOntModel();

		// load rdfs label...
		ARTStatementIterator rdfsLabelIt = skosModel.listStatements(concept, RDFS.Res.LABEL, NodeFilters.ANY,
				true, NodeFilters.MAINGRAPH);
		while (rdfsLabelIt.streamOpen()) {
			ARTNode node = rdfsLabelIt.next().getObject();
			if (node.asLiteral().getLanguage() == null || node.asLiteral().getLanguage().length() == 0) {
				rdfsLabelNullLanguage = node.asLiteral().getLabel();
			} else if (node.asLiteral().getLanguage().equals(defaultLanguage)) {
				rdfsLabel = node.asLiteral().getLabel();
			}
		}

		rdfsLabelIt.close();
		if (rdfsLabel == null && rdfsLabelNullLanguage != null)
			rdfsLabel = rdfsLabelNullLanguage;

		// load preferredLabel...
		ARTLiteral node = skosModel.getPrefLabel(concept, defaultLanguage, true, NodeFilters.MAINGRAPH);
		if (node != null) {
			preferredLabel = node.asLiteral().getLabel();
		}
		return (preferredLabel != null) ? preferredLabel : (rdfsLabel != null ? rdfsLabel : "");
	}
}
