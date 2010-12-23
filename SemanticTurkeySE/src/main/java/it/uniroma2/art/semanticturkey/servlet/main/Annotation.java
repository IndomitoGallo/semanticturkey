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
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.utilities.ModelUtilities;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.models.DirectReasoning;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.navigation.ARTLiteralIterator;
import it.uniroma2.art.owlart.navigation.ARTResourceIterator;
import it.uniroma2.art.owlart.utilities.DeletePropagationPropertyTree;
import it.uniroma2.art.owlart.vocabulary.RDFTypesEnum;
import it.uniroma2.art.semanticturkey.SemanticTurkeyOperations;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.w3c.dom.Element;

/**
 * Service which managing annotation requests
 * 
 * @author Armando Stellato
 * @author Andrea Turbati (moved the service to OSGi extension framework)
 */
public class Annotation extends ServiceAdapter {

	public static final String getPageAnnotationsRequest = "getPageAnnotations";
	public static final String chkAnnotationsRequest = "chkAnnotations";
	public static final String removeAnnotationRequest = "removeAnnotation";
	public static final String createAndAnnotateRequest = "createAndAnnotate";
	public static final String addAnnotationRequest = "addAnnotation";
	public static final String relateAndAnnotateRequest = "relateAndAnnotate";

	// parameters
	public static final String urlPageString = "urlPage";
	public static final String titleString = "title";
	public static final String annotQNameString = "annotQName";
	public static final String textString = "text";
	public static final String op = "op";

	public static final String clsQNameField = "clsQName";
	public static final String instanceQNameField = "instanceQName";
	public static final String objectClsNameField = "objectClsName";
	public static final String objectQNameField = "objectQName";
	public static final String urlPageField = "urlPage";
	public static final String titleField = "title";
	public static final String propertyQNameField = "propertyQName";
	public static final String langField = "lang";
	public static final String valueType = "type";

	// parameter values
	public static final String bindCreate = "bindCreate";
	public static final String bindAnnot = "bindAnnot";

	protected static Logger logger = LoggerFactory.getLogger(Annotation.class);

	protected ServletUtilities servletUtilities;
	protected DeletePropagationPropertyTree deletePropertyPropagationTreeForAnnotations;

	/**
	 * this service is in charge of managing annotation actions over ontology resources
	 * 
	 * @param id
	 */
	public Annotation(String id) {
		super(id);
		servletUtilities = ServletUtilities.getService();
	}

	public Logger getLogger() {
		return logger;
	}

	protected void initializeDeletePropertyPropagationTreeForAnnotations() {
		deletePropertyPropagationTreeForAnnotations = new DeletePropagationPropertyTree();
		deletePropertyPropagationTreeForAnnotations.addChild(SemAnnotVocab.Res.location);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter#getResponse()
	 */
	public Response getPreCheckedResponse(String request) throws HTTPParameterUnspecifiedException {
		Response response = null;

		if (request.equals(getPageAnnotationsRequest)) {
			String urlPage = setHttpPar(urlPageString);
			response = getPageAnnotations(urlPage);
		} else if (request.equals(chkAnnotationsRequest)) {
			String urlPage = setHttpPar(urlPageString);
			checkRequestParametersAllNotNull(urlPageString);
			response = chkPageForAnnotations(urlPage);
		} else if (request.equals(removeAnnotationRequest)) {
			String annotQName = setHttpPar(annotQNameString);
			response = removeAnnotation(annotQName);
		} else if (request.equals(createAndAnnotateRequest)) {

			String clsQName = setHttpPar(clsQNameField);
			String instanceNameEncoded = servletUtilities.encodeLabel(setHttpPar(instanceQNameField));

			String urlPage = setHttpPar(urlPageString);
			String title = setHttpPar(titleString);

			response = dragDropSelectionOverClass(instanceNameEncoded, clsQName, urlPage, title);

		} else if (request.equals(addAnnotationRequest)) {
			String urlPage = setHttpPar(urlPageString);
			String instanceQName = setHttpPar(instanceQNameField);
			String text = setHttpPar(textString);
			String textEncoded = servletUtilities.encodeLabel(text);
			String title = setHttpPar(titleString);

			response = annotateInstanceWithDragAndDrop(instanceQName, textEncoded, urlPage, title);
		} else if (request.equals(relateAndAnnotateRequest)) {
			String subjectInstanceQName = setHttpPar(instanceQNameField);
			String predicatePropertyName = setHttpPar(propertyQNameField);
			String objectInstanceName = setHttpPar(objectQNameField);
			String objectInstanceNameEncoded = servletUtilities.encodeLabel(objectInstanceName);
			String urlPage = setHttpPar(urlPageField);
			String title = setHttpPar(titleField);
			String valueTypeStr = setHttpPar(valueType);
			RDFTypesEnum type = (valueTypeStr == null) ? null : RDFTypesEnum.valueOf(valueTypeStr);
			String op = setHttpPar("op");
			checkRequestParametersAllNotNull(instanceQNameField, propertyQNameField, urlPageField, titleField);

			if (op.equals("bindCreate")) {
				String rangeClsName = setHttpPar(objectClsNameField);
				String lang = setHttpPar(langField);
				return bindAnnotatedObjectToNewInstanceAndRelateToDroppedInstance(subjectInstanceQName,
						predicatePropertyName, objectInstanceNameEncoded, type, rangeClsName, urlPage, title,
						lang);
			}

			if (op.equals("bindAnnot")) {
				String annotation = setHttpPar("lexicalization");
				return addNewAnnotationForSelectedInstanceAndRelateToDroppedInstance(subjectInstanceQName,
						predicatePropertyName, objectInstanceNameEncoded, annotation, urlPage, title);
			}

			//  

		} else
			return ServletUtilities.getService().createNoSuchHandlerExceptionResponse(request);

		this.fireServletEvent();
		return response;
	}

	/**
	 * this service returns all previous annotations taken into the page associated to the given url
	 * 
	 * <Tree type="Annotations"> <Annotation id="04282b25-2f32-421e-8418-9317e3ef8553"
	 * resource="Armando Stellato" value="Armando Stellato"/> <Annotation
	 * id="57a6c560-e1e4-4f3a-a1ba-00fc874e1c71" resource="Marco Pennacchiotti" value="Marco Pennacchiotti"/>
	 * <Annotation id="86398074-bb67-4986-86df-bcb8b414a91a" resource="University of Rome, Tor Vergata"
	 * value="University of Rome, Tor Vergata"/> </Tree>
	 * 
	 * @param urlPage
	 *            the url of the page which is searched for existing annotations
	 * @return
	 */
	public Response getPageAnnotations(String urlPage) {
		OWLModel ontModel = (OWLModel) ProjectManager.getCurrentProject().getOntModel();
		ServletUtilities servletUtilities = ServletUtilities.getService();

		XMLResponseREPLY response = servletUtilities.createReplyResponse(getPageAnnotationsRequest,
				RepliesStatus.ok);

		Element dataElement = response.getDataElement();

		ARTLiteral urlPageLiteral = ontModel.createLiteral(urlPage);
		ARTResourceIterator collectionIterator;
		ARTResource webPage = null;
		try {
			collectionIterator = ontModel.listSubjectsOfPredObjPair(SemAnnotVocab.Res.url, urlPageLiteral,
					true);
			while (collectionIterator.hasNext()) {
				webPage = (ARTResource) collectionIterator.next();
			}
			if (webPage == null) {
				return response;
			}
		} catch (ModelAccessException e) {
			return servletUtilities.createExceptionResponse(getPageAnnotationsRequest, e);
		}

		ARTResourceIterator semanticAnnotationsIterator;
		try {
			semanticAnnotationsIterator = ontModel.listSubjectsOfPredObjPair(SemAnnotVocab.Res.location,
					webPage, true);
			while (semanticAnnotationsIterator.streamOpen()) {
				ARTResource semanticAnnotation = semanticAnnotationsIterator.getNext().asURIResource();
				ARTLiteralIterator lexicalizationIterator = ontModel.listValuesOfSubjDTypePropertyPair(
						semanticAnnotation, SemAnnotVocab.Res.text, true);
				ARTLiteral lexicalization = lexicalizationIterator.getNext(); // there is at least one and no
				// more than one lexicalization
				// for each semantic annotation
				Element annotationElement = XMLHelp.newElement(dataElement, "Annotation");
				annotationElement.setAttribute("id", ontModel.getQName(semanticAnnotation.asURIResource()
						.getURI()));
				annotationElement.setAttribute("value", lexicalization.getLabel());
				ARTURIResource annotatedResource = ontModel.listSubjectsOfPredObjPair(
						SemAnnotVocab.Res.annotation, semanticAnnotation, true).getNext().asURIResource();
				// there is at least one and no more than one referenced resource for each semantic annotation
				annotationElement.setAttribute("resource", ontModel.getQName(annotatedResource.getURI()));
			}
		} catch (ModelAccessException e) {
			return servletUtilities.createExceptionResponse(getPageAnnotationsRequest, e);
		}

		return response;
	}

	/**
	 * informs the client if the requested page contains annotations
	 * 
	 * <Tree type="Ack" request="chkAnnotations"> <result status="yes"/> //or "no" </Tree>
	 * 
	 * @param urlPage
	 * @return
	 */
	public Response chkPageForAnnotations(String urlPage) {
		String request = chkAnnotationsRequest;
		RDFModel ontModel = ProjectManager.getCurrentProject().getOntModel();

		ARTLiteral urlPageLiteral = ontModel.createLiteral(urlPage);
		ARTResourceIterator collectionIterator;
		try {
			collectionIterator = ontModel.listSubjectsOfPredObjPair(SemAnnotVocab.Res.url, urlPageLiteral,
					true);
			RepliesStatus reply;
			if (collectionIterator.streamOpen())
				reply = RepliesStatus.ok;
			else
				reply = RepliesStatus.fail;
			return ServletUtilities.getService().createReplyResponse(request, reply);

		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(chkAnnotationsRequest, e);
		}
	}

	/**
	 * tells the server to remove an annotation; the answer informs the client of the success of this removal
	 * 
	 * <Tree type="Ack" request="removeAnnotation"> <result status="yes"/> //or "no" </Tree>
	 * 
	 * @param annotQName
	 * @return
	 */
	public Response removeAnnotation(String annotQName) {
		String request = removeAnnotationRequest;
		logger.debug("replying to \"removeAnnotation(" + annotQName + ")\".");
		RDFModel ontModel = ProjectManager.getCurrentProject().getOntModel();

		ARTURIResource annot;

		try {
			annot = ontModel.createURIResource(ontModel.expandQName(annotQName));
			if (annot == null)
				return servletUtilities.createExceptionResponse(request,
						"selected annotation is not present in the ontology");

			if (deletePropertyPropagationTreeForAnnotations == null)
				initializeDeletePropertyPropagationTreeForAnnotations();

			logger.debug("removing annotation: " + annot);

			ModelUtilities.deepDeleteIndividual(annot, ontModel, deletePropertyPropagationTreeForAnnotations);

			return ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);

		} catch (ModelAccessException mae) {
			return ServletUtilities.getService().createExceptionResponse(request, mae);
		} catch (ModelUpdateException mue) {
			return ServletUtilities.getService().createExceptionResponse(request, mue);
		}

	}

	/**
	 * creates an instance with associated annotation from the current web page
	 * <p>
	 * note that the parameter instanceQName is handled like a Qname, but it is the selection dragged from the
	 * web browser
	 * </p>
	 * 
	 * <Tree type="update_cls"> <Class clsName="rtv:Person" numTotInst="1"/> <Instance
	 * instanceName="Armando Stellato"/> </Tree>
	 * 
	 * @return
	 */
	public Response dragDropSelectionOverClass(String instanceQName, String clsQName, String urlPage,
			String title) {
		ServletUtilities servletUtilities = ServletUtilities.getService();
		logger.debug("dragged: " + instanceQName + " over class: " + clsQName + " on url: " + urlPage
				+ " with title: " + title);
		String handledUrlPage = urlPage.replace(":", "%3A");
		handledUrlPage = handledUrlPage.replace("/", "%2F");
		RDFModel ontModel = ProjectManager.getCurrentProject().getOntModel();
		try {
			String instanceURI = ontModel.expandQName(instanceQName);
			ARTURIResource instanceRes = ontModel.retrieveURIResource(instanceURI);
			if (instanceRes != null)
				return servletUtilities.createExceptionResponse(createAndAnnotateRequest,
						"there is another resource with the same name!");

			ARTURIResource cls = ontModel.createURIResource(ontModel.expandQName(clsQName));
			ontModel.addInstance(instanceURI, cls);
			logger.debug("created new instance: " + instanceURI + " for class: " + cls);
			SemanticTurkeyOperations.createLexicalization(ontModel, instanceQName, instanceQName, urlPage,
					title);
		} catch (ModelUpdateException e) {
			logger.error("instance creation error", e);
			return servletUtilities.createExceptionResponse(createAndAnnotateRequest,
					"instance creation error: " + e.getMessage());
		} catch (ModelAccessException e) {
			return servletUtilities.createExceptionResponse(createAndAnnotateRequest, e);
		}

		try {
			return updateClassOnTree(clsQName, instanceQName);
		} catch (ModelAccessException e) {
			return servletUtilities.createExceptionResponse(createAndAnnotateRequest,
					"annotation created but failed to update the number of instances on class: " + clsQName
							+ "\n" + e);
		}
	}

	// TODO this is the copy of the same method present in the Cls servlet. Factorize it somehow
	/**
	 * @param clsQName
	 * @param instanceName
	 * @return
	 * @throws ModelAccessException
	 */
	public Response updateClassOnTree(String clsQName, String instanceName) throws ModelAccessException {
		ServletUtilities servletUtilities = new ServletUtilities();
		XMLResponseREPLY response = servletUtilities.createReplyResponse(createAndAnnotateRequest,
				RepliesStatus.ok);
		Element dataElement = response.getDataElement();

		RDFModel ontModel = ProjectManager.getCurrentProject().getOntModel();
		Element clsElement = XMLHelp.newElement(dataElement, "Class");
		clsElement.setAttribute("clsName", clsQName);
		ARTResource cls = ontModel.createURIResource(ontModel.expandQName(clsQName));

		String numTotInst = ""
				+ ModelUtilities.getNumberOfClassInstances(((DirectReasoning) ontModel), cls, true);

		clsElement.setAttribute("numTotInst", numTotInst);
		Element instanceElement = XMLHelp.newElement(dataElement, "Instance");
		instanceElement.setAttribute("instanceName", servletUtilities.decodeLabel(instanceName));
		return response;
	}

	/**
	 * invoked when the user drags text over an instance of the ontology. A new annotation for that individual
	 * is created and a semantic bookmark is registered for that individual in the browsed page
	 * 
	 * @param subjectInstanceQName
	 * @param lexicalizationEncoded
	 * @param urlPage
	 * @param title
	 * @return
	 */
	public Response annotateInstanceWithDragAndDrop(String subjectInstanceQName,
			String lexicalizationEncoded, String urlPage, String title) {
		logger.debug("taking annotation for: url" + urlPage + " instanceQName: " + subjectInstanceQName
				+ " lexicalization: " + lexicalizationEncoded + " title: " + title);
		ServletUtilities servletUtilities = new ServletUtilities();
		RDFModel ontModel = ProjectManager.getCurrentProject().getOntModel();
		try {
			SemanticTurkeyOperations.createLexicalization(ontModel, subjectInstanceQName,
					lexicalizationEncoded, urlPage, title);
		} catch (ModelUpdateException e) {
			logger.error("lexicalization creation error: ", e);
			return servletUtilities.createExceptionResponse(addAnnotationRequest,
					"lexicalization creation error: " + e.getMessage());
		} catch (ModelAccessException e) {
			logger.error("lexicalization creation error: ", e);
			return servletUtilities.createExceptionResponse(addAnnotationRequest,
					"lexicalization creation error: " + e.getMessage());
		}
		logger.debug("annotation taken");
		return servletUtilities.createReplyResponse(addAnnotationRequest, RepliesStatus.ok);
	}

	// ricordarsi che qui c'è una sola request che gestisce due cose (dipende dall'op)
	/**
	 * invoked when the user annotates new text which is dragged upon an individual to create a new individual
	 * which is bound to the first one through a given property
	 * 
	 * <Tree type="bindAnnotToNewInstance"> <Class clsName="rtv:Organization" numTotInst="1"/> <Instance
	 * instanceName="University of Rome, Tor Vergata"/> </Tree>
	 * 
	 * @param subjectInstanceQName
	 * @param predicatePropertyQName
	 * @param objectInstanceQName
	 * @param rangeClsQName
	 * @param urlPage
	 * @param title
	 * @return
	 */
	public Response bindAnnotatedObjectToNewInstanceAndRelateToDroppedInstance(String subjectInstanceQName,
			String predicatePropertyQName, String objectInstanceQName, RDFTypesEnum type,
			String rangeClsQName, String urlPage, String title, String lang) {
		ServletUtilities servletUtilities = new ServletUtilities();
		OWLModel ontModel = ProjectManager.getCurrentProject().getOWLModel();
		ARTURIResource property;

		try {
			property = ontModel.createURIResource(ontModel.expandQName(predicatePropertyQName));
			ARTResource rangeClsRes = null;

			if (ontModel.isDatatypeProperty(property) || ontModel.isAnnotationProperty(property)
					|| type == RDFTypesEnum.literal) {
				logger.debug("adding value to a literal valued property ");
				ARTURIResource subjectInstanceEncodedRes = ontModel.createURIResource(ontModel
						.expandQName(subjectInstanceQName));
				try {
					if (ontModel.isAnnotationProperty(property)) {
						logger.debug("adding value" + objectInstanceQName
								+ "to annotation property with lang: ");
						ontModel.instantiatePropertyWithPlainLiteral(subjectInstanceEncodedRes, property,
								objectInstanceQName, lang);
					} else { // Datatype or simple property
						logger.debug("adding value" + objectInstanceQName + "to datatype property");
						ontModel.instantiatePropertyWithPlainLiteral(subjectInstanceEncodedRes, property,
								objectInstanceQName);
					}
				} catch (ModelUpdateException e) {
					logger.error("literal creation error: " + e.getMessage(), e);
					return servletUtilities.createExceptionResponse(relateAndAnnotateRequest,
							"literal creation error: " + e.getMessage());
				}
			} else {
				String rangeClsURI = ontModel.expandQName(rangeClsQName);
				logger.debug("rangeClsQName: " + rangeClsQName + " uri: " + rangeClsURI);
				rangeClsRes = ontModel.createURIResource(rangeClsURI);
				if (rangeClsRes == null) {
					logger.debug("there is no class named: " + rangeClsURI + " !");
					return servletUtilities.createExceptionResponse(relateAndAnnotateRequest,
							"there is no class named: " + rangeClsURI + " !");
				}

				try {
					ontModel.addInstance(ontModel.expandQName(objectInstanceQName), rangeClsRes);
					SemanticTurkeyOperations.createLexicalization(ontModel, objectInstanceQName,
							objectInstanceQName, urlPage, title);
					logger.debug("instance: " + objectInstanceQName + " created and lexicalization taken");
				} catch (ModelUpdateException e) {
					logger.error("Instance creation error: ", e);
					return servletUtilities.createExceptionResponse(relateAndAnnotateRequest,
							"Instance creation error: " + e.getMessage());
				}
				ARTURIResource subjectInstanceRes = ontModel.createURIResource(ontModel
						.expandQName(subjectInstanceQName));
				ARTURIResource objectInstanceRes = ontModel.createURIResource(ontModel
						.expandQName(objectInstanceQName));
				ontModel.instantiatePropertyWithResource(subjectInstanceRes, property, objectInstanceRes);
				logger.debug("property: " + property + " istantiated with value: " + objectInstanceRes
						+ " on subject: " + subjectInstanceRes);
			}

			XMLResponseREPLY response = servletUtilities.createReplyResponse(relateAndAnnotateRequest,
					RepliesStatus.ok);
			Element dataElement = response.getDataElement();
			dataElement.setAttribute("op", "bindAnnotToNewInstance");
			// NScarpato 27/05/2007 add numTotInst attribute (TODO rimuoverlo dopo aver controllato che non
			// serva da nessuna parte)
			if (rangeClsRes != null) {
				Element clsElement = XMLHelp.newElement(dataElement, "Class");
				clsElement.setAttribute("clsName", rangeClsQName);
				ARTResourceIterator it = ((DirectReasoning) ontModel).listDirectInstances(rangeClsRes);
				int instCounter = 0;
				while (it.streamOpen()) {
					instCounter++;
					it.getNext();
				}
				clsElement.setAttribute("numTotInst", "" + instCounter);
			}
			Element instanceElement = XMLHelp.newElement(dataElement, "Instance");
			instanceElement.setAttribute("instanceName", servletUtilities.decodeLabel(objectInstanceQName));
			return response;

		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(relateAndAnnotateRequest, e);
		} catch (ModelUpdateException e) {
			return ServletUtilities.getService().createExceptionResponse(relateAndAnnotateRequest, e);
		}
	}

	public Response addNewAnnotationForSelectedInstanceAndRelateToDroppedInstance(
			String subjectInstanceQName, String predicatePropertyQName, String objectInstanceQName,
			String lexicalization, String urlPage, String title) {
		ServletUtilities servletUtilities = new ServletUtilities();
		RDFModel ontModel = ProjectManager.getCurrentProject().getOntModel();

		try {
			ARTURIResource property = ontModel
					.createURIResource(ontModel.expandQName(predicatePropertyQName));
			SemanticTurkeyOperations.createLexicalization(ontModel, objectInstanceQName, lexicalization,
					urlPage, title);
			ARTResource subjectInstanceRes = ontModel.createURIResource(ontModel
					.expandQName(subjectInstanceQName));
			ARTResource objectInstanceRes = ontModel.createURIResource(ontModel
					.expandQName(objectInstanceQName));
			ontModel.addTriple(subjectInstanceRes, property, objectInstanceRes);
		} catch (ModelUpdateException e) {
			logger.error("Instance creation error: ", e);
			return servletUtilities.createExceptionResponse(relateAndAnnotateRequest,
					"Instance creation error: " + e.getMessage());
		} catch (ModelAccessException e) {
			logger.error("Ontology Access error: ", e);
			return servletUtilities.createExceptionResponse(relateAndAnnotateRequest,
					"Ontology Access error: " + e.getMessage());
		}

		return servletUtilities.createReplyResponse(relateAndAnnotateRequest, RepliesStatus.ok);

	}

}
