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
import it.uniroma2.art.owlart.model.ARTStatement;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.DirectReasoning;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.models.RDFSModel;
import it.uniroma2.art.owlart.navigation.ARTLiteralIterator;
import it.uniroma2.art.owlart.navigation.ARTNodeIterator;
import it.uniroma2.art.owlart.navigation.ARTResourceIterator;
import it.uniroma2.art.owlart.navigation.ARTStatementIterator;
import it.uniroma2.art.owlart.utilities.ModelUtilities;
import it.uniroma2.art.owlart.utilities.PropertyChainsTree;
import it.uniroma2.art.owlart.vocabulary.RDFResourceRolesEnum;
import it.uniroma2.art.owlart.vocabulary.RDFTypesEnum;
import it.uniroma2.art.owlart.vocabulary.XmlSchema;
import it.uniroma2.art.semanticturkey.exceptions.DuplicatedResourceException;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.exceptions.NonExistingRDFResourceException;
import it.uniroma2.art.semanticturkey.ontology.utilities.RDFXMLHelp;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFNodeFactory;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFResource;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponse;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Element;

import com.google.common.base.Function;
import com.google.common.collect.Iterators;

/**
 * Service which managing annotation requests
 * 
 * @author Armando Stellato
 * @author Andrea Turbati (moved the service to OSGi extension framework)
 */
public class Annotation extends ServiceAdapter {

	public static final String getPageAnnotationsRequest = "getPageAnnotations";
	public static final String chkAnnotationsRequest = "chkAnnotations";
	public static final String chkBookmarksRequest = "chkBookmarks";
	public static final String removeAnnotationRequest = "removeAnnotation";
	public static final String createAndAnnotateRequest = "createAndAnnotate";
	public static final String addAnnotationRequest = "addAnnotation";
	public static final String relateAndAnnotateRequest = "relateAndAnnotate";
	public static final String bookmarkPageRequest = "bookmarkPage";
	public static final String getBookmarksByTopicRequest = "getBookmarksByTopic";
	public static final String getPageTopicsRequest = "getPageTopics";
	public static final String getAllBookmarksRequest = "getAllBookmarks";
	public static final String removeBookmarkRequest = "removeBookmark";
 	// parameters
	public static final String annotQNameString = "annotQName";
	public static final String textString = "text";
	public static final String op = "op";
	public static final String topic = "topic";
	public static final String topicsList = "topics";

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

	private static String datePropName = "http://purl.org/dc/terms/date";

	protected ServletUtilities servletUtilities;
	protected PropertyChainsTree deletePropertyPropagationTreeForAnnotations;

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
		deletePropertyPropagationTreeForAnnotations = new PropertyChainsTree();
		deletePropertyPropagationTreeForAnnotations.addChainedProperty(SemAnnotVocab.Res.location);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter#getResponse()
	 */
	public Response getPreCheckedResponse(String request) throws HTTPParameterUnspecifiedException {
		Response response = null;

		if (request.equals(getPageAnnotationsRequest)) {
			String urlPage = setHttpPar(urlPageField);
			response = getPageAnnotations(urlPage);
		} else if (request.equals(bookmarkPageRequest)) {
			String pageURL = setHttpPar(urlPageField);
			String title = setHttpPar(titleField);
			String topics = setHttpPar(topicsList);
			checkRequestParametersAllNotNull(urlPageField, titleField, topicsList);
			response = bookmarkPage(pageURL, title, topics);
		} else if (request.equals(getBookmarksByTopicRequest)) {
			String topicName = setHttpPar(topic);
			checkRequestParametersAllNotNull(topic);
			response = getBookmarksByTopic(topicName);
		} else if(request.equals(removeBookmarkRequest)) {
			String urlPage = setHttpPar(urlPageField);
			String topic = setHttpPar(Annotation.topic);
			checkRequestParametersAllNotNull(urlPageField, Annotation.topic);
			
			response = removeBookmark(urlPage, topic);
		} else if(request.equals(getPageTopicsRequest)) {
			String urlPage = setHttpPar(urlPageField);
			checkRequestParametersAllNotNull(urlPageField);
			response = getPageTopics(urlPage);
		} else if (request.equals(getAllBookmarksRequest)) {
			response = getAllBookmarks();
		} else if (request.equals(chkAnnotationsRequest)) {
			String urlPage = setHttpPar(urlPageField);
			checkRequestParametersAllNotNull(urlPageField);
			response = chkPageForAnnotations(urlPage);
		} else if (request.equals(chkBookmarksRequest)) {
			String urlPage = setHttpPar(urlPageField);
			checkRequestParametersAllNotNull(urlPageField);
			response = chkBookmarks(urlPage);
		} else if (request.equals(removeAnnotationRequest)) {
			String annotQName = setHttpPar(annotQNameString);
			response = removeAnnotation(annotQName);
		} else if (request.equals(createAndAnnotateRequest)) {

			String clsQName = setHttpPar(clsQNameField);
			String instanceQName = setHttpPar(instanceQNameField);

			String urlPage = setHttpPar(urlPageField);
			String title = setHttpPar(titleField);

			response = dragDropSelectionOverClass(instanceQName, clsQName, urlPage, title);

		} else if (request.equals(addAnnotationRequest)) {
			String urlPage = setHttpPar(urlPageField);
			String instanceQName = setHttpPar(instanceQNameField);
			String text = setHttpPar(textString);
			String textEncoded = servletUtilities.encodeLabel(text);
			String title = setHttpPar(titleField);

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

		} else
			return ServletUtilities.getService().createNoSuchHandlerExceptionResponse(request);

		this.fireServletEvent();
		return response;
	}

	private Response chkBookmarks(String urlPage) {
		OWLModel ontModel = getOWLModel();

		XMLResponseREPLY response = createBooleanResponse(false);

		ARTLiteral urlPageLiteral = ontModel.createLiteral(urlPage);
		ARTResourceIterator collectionIterator;
		ARTResource webPage = null;
		try {
			collectionIterator = ontModel.listSubjectsOfPredObjPair(SemAnnotVocab.Res.url, urlPageLiteral,
					true, getUserNamedGraphs());
			while (collectionIterator.hasNext()) {
				webPage = (ARTResource) collectionIterator.next();
			}
			if (webPage == null) {
				return response;
			}
			
			boolean hasBookmarks = ontModel.hasTriple(webPage, SemAnnotVocab.Res.topic, NodeFilters.ANY, true, getUserNamedGraphs());
			
			if (hasBookmarks) {
				response = createBooleanResponse(true);
			}
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		
		return response;
	}

	static private class NodeToResource implements Function<ARTNode, ARTURIResource>{

		public ARTURIResource apply(ARTNode arg) {
			return arg.asURIResource();
		}

	}
	
	private Response getPageTopics(String urlPage) {
		OWLModel ontModel = getOWLModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

		Element dataElement = response.getDataElement();

		ARTLiteral urlPageLiteral = ontModel.createLiteral(urlPage);
		ARTResourceIterator collectionIterator;
		ARTResource webPage = null;
		try {
			collectionIterator = ontModel.listSubjectsOfPredObjPair(SemAnnotVocab.Res.url, urlPageLiteral,
					true, getUserNamedGraphs());
			while (collectionIterator.hasNext()) {
				webPage = (ARTResource) collectionIterator.next();
			}
			if (webPage == null) {
				return response;
			}
			
			ARTNodeIterator topicIterator = ontModel.listValuesOfSubjPredPair(webPage, SemAnnotVocab.Res.topic, true, getUserNamedGraphs());
			Iterator<ARTURIResource> filteredIterator =  Iterators.transform(topicIterator, new NodeToResource());
			
			Collection<STRDFResource> topicCollection = STRDFNodeFactory.createEmptyResourceCollection();

			while (filteredIterator.hasNext()) {
				ARTURIResource resource = filteredIterator.next();
				
				STRDFResource stResource = STRDFNodeFactory.createSTRDFResource(resource, 
						ModelUtilities.getResourceRole(resource, ontModel), 
						true, ontModel.getQName(resource.getURI()));
				topicCollection.add(stResource);
			}
			
			RDFXMLHelp.addRDFNodes(dataElement, topicCollection);
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		
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
		OWLModel ontModel = getOWLModel();
		
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

		Element dataElement = response.getDataElement();

		ARTLiteral urlPageLiteral = ontModel.createLiteral(urlPage);
		ARTResourceIterator collectionIterator;
		ARTResource webPage = null;
		try {
			collectionIterator = ontModel.listSubjectsOfPredObjPair(SemAnnotVocab.Res.url, urlPageLiteral,
					true, getUserNamedGraphs());
			while (collectionIterator.hasNext()) {
				webPage = (ARTResource) collectionIterator.next();
			}
			if (webPage == null) {
				return response;
			}
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}

		ARTResourceIterator semanticAnnotationsIterator;
		try {
			semanticAnnotationsIterator = ontModel.listSubjectsOfPredObjPair(SemAnnotVocab.Res.location,
					webPage, true, getUserNamedGraphs());
			while (semanticAnnotationsIterator.streamOpen()) {
				ARTResource semanticAnnotation = semanticAnnotationsIterator.getNext().asURIResource();
				ARTLiteralIterator lexicalizationIterator = ontModel.listValuesOfSubjDTypePropertyPair(
						semanticAnnotation, SemAnnotVocab.Res.text, true, getUserNamedGraphs());
				ARTLiteral lexicalization = lexicalizationIterator.getNext(); // there is at least one and no
				// more than one lexicalization
				// for each semantic annotation
				Element annotationElement = XMLHelp.newElement(dataElement, "Annotation");
				annotationElement.setAttribute("id",
						ontModel.getQName(semanticAnnotation.asURIResource().getURI()));
				annotationElement.setAttribute("value", lexicalization.getLabel());
				ARTURIResource annotatedResource = ontModel
						.listSubjectsOfPredObjPair(SemAnnotVocab.Res.annotation, semanticAnnotation, true,
								getUserNamedGraphs()).getNext().asURIResource();
				// there is at least one and no more than one referenced resource for each semantic annotation
				annotationElement.setAttribute("resource", ontModel.getQName(annotatedResource.getURI()));
			}
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}

		return response;
	}

	public Response getBookmarksByTopic(String topicName) {
		OWLModel ontModel = getOWLModel();

		ARTURIResource dateProp = ontModel.createURIResource(datePropName);

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {
			ARTResource[] graphs = getUserNamedGraphs();

			ARTURIResource topic = ontModel.retrieveURIResource(ontModel.expandQName(topicName),
					getUserNamedGraphs());
			if (topic == null)
				return logAndSendException("there is no topic called: " + ontModel.expandQName(topicName));

			ARTResourceIterator pageIterator = ontModel.listSubjectsOfPredObjPair(SemAnnotVocab.Res.topic,
					topic, true, getUserNamedGraphs());

			Element dataElement = response.getDataElement();

			while (pageIterator.hasNext()) {
				ARTResource page = pageIterator.getNext();
				Element pageElement = XMLHelp.newElement(dataElement, "page");

				ARTLiteralIterator dateIterator = ontModel.listValuesOfSubjDTypePropertyPair(page, dateProp,
						true, graphs);
				pageElement.setAttribute("time", dateIterator.getNext().toString());
				dateIterator.close();

				ARTLiteralIterator urlIterator = ontModel.listValuesOfSubjDTypePropertyPair(page,
						SemAnnotVocab.Res.url, true, graphs);
				pageElement.setAttribute("url", urlIterator.getNext().toString());
				urlIterator.close();

				ARTLiteralIterator titleIterator = ontModel.listValuesOfSubjDTypePropertyPair(page,
						SemAnnotVocab.Res.title, true, graphs);
				pageElement.setAttribute("title", titleIterator.getNext().getLabel());
				titleIterator.close();

			}
			pageIterator.close();

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	public Response getAllBookmarks() {
		OWLModel ontModel = getOWLModel();

		ARTURIResource dateProp = ontModel.createURIResource(datePropName);

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {
			ARTResource[] graphs = getUserNamedGraphs();

			ARTStatementIterator bookmarkRelationsIterator = ontModel.listStatements(NodeFilters.ANY,
					SemAnnotVocab.Res.topic, NodeFilters.ANY, true, getUserNamedGraphs());

			Element dataElement = response.getDataElement();

			while (bookmarkRelationsIterator.hasNext()) {
				ARTStatement rel = bookmarkRelationsIterator.getNext();
				ARTResource page = rel.getSubject();
				Element pageElement = XMLHelp.newElement(dataElement, "page");

				pageElement
						.setAttribute("topic", ontModel.getQName(rel.getObject().asURIResource().getURI()));

				ARTLiteralIterator dateIterator = ontModel.listValuesOfSubjDTypePropertyPair(page, dateProp,
						true, graphs);
				pageElement.setAttribute("time", dateIterator.getNext().toString());
				dateIterator.close();

				ARTLiteralIterator urlIterator = ontModel.listValuesOfSubjDTypePropertyPair(page,
						SemAnnotVocab.Res.url, true, graphs);
				pageElement.setAttribute("url", urlIterator.getNext().toString());
				urlIterator.close();

				ARTLiteralIterator titleIterator = ontModel.listValuesOfSubjDTypePropertyPair(page,
						SemAnnotVocab.Res.title, true, graphs);
				pageElement.setAttribute("title", titleIterator.getNext().getLabel());
				titleIterator.close();

			}
			bookmarkRelationsIterator.close();

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
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
		RDFModel ontModel = getOWLModel();

		ARTLiteral urlPageLiteral = ontModel.createLiteral(urlPage);
		ARTResourceIterator collectionIterator;
		try {
			collectionIterator = ontModel.listSubjectsOfPredObjPair(SemAnnotVocab.Res.url, urlPageLiteral,
					true, getUserNamedGraphs());
			RepliesStatus reply;
			if (collectionIterator.streamOpen())
				reply = RepliesStatus.ok;
			else
				reply = RepliesStatus.fail;
			return servletUtilities.createReplyResponse(request, reply);

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
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
		RDFModel ontModel = getOWLModel();

		ARTURIResource annot;

		try {
			annot = ontModel.createURIResource(ontModel.expandQName(annotQName));
			if (annot == null)
				return servletUtilities.createExceptionResponse(request,
						"selected annotation is not present in the ontology");

			if (deletePropertyPropagationTreeForAnnotations == null)
				initializeDeletePropertyPropagationTreeForAnnotations();

			logger.debug("removing annotation: " + annot);

			ModelUtilities.deepDeleteIndividual(annot, ontModel, deletePropertyPropagationTreeForAnnotations,
					getWorkingGraph());

			return ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);

		} catch (ModelAccessException mae) {
			return logAndSendException(mae);
		} catch (ModelUpdateException mue) {
			return logAndSendException(mue);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
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
		logger.debug("dragged: " + instanceQName + " over class: " + clsQName + " on url: " + urlPage
				+ " with title: " + title);
		String handledUrlPage = urlPage.replace(":", "%3A");
		handledUrlPage = handledUrlPage.replace("/", "%2F");
		RDFModel ontModel = getOWLModel();
		try {
			ARTURIResource instance = createNewResource(ontModel, instanceQName, getUserNamedGraphs());
			String instanceURI = instance.getURI();
			ARTURIResource cls = retrieveExistingURIResource(ontModel, clsQName, getUserNamedGraphs());
			ontModel.addInstance(instanceURI, cls, getWorkingGraph());
			logger.debug("created new instance: " + instanceURI + " for class: " + cls);
			createLexicalization(ontModel, instance, instanceQName, urlPage, title, getWorkingGraph());
		} catch (ModelUpdateException e) {
			logger.error("instance creation error", e);
			return logAndSendException("instance creation error: " + e.getMessage());
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (DuplicatedResourceException e) {
			return logAndSendException("there is another resource with the same name!");
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}

		try {
			return updateClassOnTree(clsQName, instanceQName);
		} catch (ModelAccessException e) {
			return logAndSendException("annotation created but failed to update the number of instances on class: "
					+ clsQName + "\n" + e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
	}

	// TODO this is the copy of the same method present in the Cls servlet. Factorize it somehow
	/**
	 * @param clsQName
	 * @param instanceName
	 * @return
	 * @throws ModelAccessException
	 * @throws NonExistingRDFResourceException
	 */
	public Response updateClassOnTree(String clsQName, String instanceName) throws ModelAccessException,
			NonExistingRDFResourceException {
		/*ServletUtilities servletUtilities = new ServletUtilities();
		XMLResponseREPLY response = servletUtilities.createReplyResponse(createAndAnnotateRequest,
				RepliesStatus.ok);
		Element dataElement = response.getDataElement();

		RDFModel ontModel = getOWLModel();
		Element clsElement = XMLHelp.newElement(dataElement, "Class");
		clsElement.setAttribute("clsName", clsQName);
		ARTResource cls = ontModel.createURIResource(ontModel.expandQName(clsQName));

		String numTotInst = ""
				+ ModelUtilities.getNumberOfClassInstances(((DirectReasoning) ontModel), cls, true,
						getUserNamedGraphs());

		clsElement.setAttribute("numTotInst", numTotInst);
		Element instanceElement = XMLHelp.newElement(dataElement, "Instance");
		instanceElement.setAttribute("instanceName", servletUtilities.decodeLabel(instanceName));
		return response;*/
		RDFSModel ontModel = (RDFSModel) ProjectManager.getCurrentProject().getOntModel();
		try {
			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
			Element dataElement = response.getDataElement();
			
			Element clsElement = XMLHelp.newElement(dataElement, "Class");
			String clsURI = ontModel.expandQName(clsQName);
			ARTResource cls = ontModel.createURIResource(clsURI);
			ARTResource wgraph = getWorkingGraph();
			ARTResource[] graphs = getUserNamedGraphs();
			STRDFResource stClass = STRDFNodeFactory.createSTRDFResource(ontModel, cls,
					ModelUtilities.getResourceRole(cls, ontModel), 
					servletUtilities.checkWritable(ontModel, cls, wgraph), false);
			Cls.decorateWithNumberOfIstances(ontModel, stClass, graphs);
			Cls.setRendering(ontModel, stClass, null, null, graphs);
			RDFXMLHelp.addRDFNode(clsElement, stClass);
			
			Element instanceElement = XMLHelp.newElement(dataElement, "Instance");
			ARTURIResource instanceRes = ontModel.createURIResource(ontModel.expandQName(instanceName));
			STRDFResource stInstance = STRDFNodeFactory.createSTRDFResource(ontModel, instanceRes,
					ModelUtilities.getResourceRole(instanceRes, ontModel), 
					servletUtilities.checkWritable(ontModel, instanceRes, wgraph), false);
			Cls.setRendering(ontModel, stInstance, null, null, graphs);
			RDFXMLHelp.addRDFNode(instanceElement, stInstance);
			return response;
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		}
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
		RDFModel ontModel = getOWLModel();
		try {
			ARTURIResource subjectInstance = retrieveExistingURIResource(ontModel, subjectInstanceQName,
					getUserNamedGraphs());
			createLexicalization(ontModel, subjectInstance, lexicalizationEncoded, urlPage, title,
					getWorkingGraph());
		} catch (ModelUpdateException e) {
			return logAndSendException("lexicalization creation error: " + e.getMessage());
		} catch (ModelAccessException e) {
			return logAndSendException("lexicalization creation error: " + e.getMessage());
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		logger.debug("annotation taken");
		return createReplyResponse(RepliesStatus.ok);
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
		OWLModel ontModel = getOWLModel();
		ARTURIResource property;

		try {
			property = ontModel.createURIResource(ontModel.expandQName(predicatePropertyQName));
			ARTResource rangeClsRes = null;
			ARTResource wgraph = getWorkingGraph();
			ARTResource[] graphs = getUserNamedGraphs();

			if (ontModel.isDatatypeProperty(property, graphs)
					|| ontModel.isAnnotationProperty(property, graphs) || type == RDFTypesEnum.literal) {
				logger.debug("adding value to a literal valued property ");
				ARTURIResource subjectInstanceEncodedRes = ontModel.createURIResource(ontModel
						.expandQName(subjectInstanceQName));
				try {
					if (ontModel.isAnnotationProperty(property, graphs)) {
						logger.debug("adding value" + objectInstanceQName
								+ "to annotation property with lang: ");
						ontModel.instantiatePropertyWithPlainLiteral(subjectInstanceEncodedRes, property,
								objectInstanceQName, lang, wgraph);
					} else { // Datatype or simple property
						logger.debug("adding value" + objectInstanceQName + "to datatype property");
						ontModel.instantiatePropertyWithPlainLiteral(subjectInstanceEncodedRes, property,
								objectInstanceQName, wgraph);
					}
				} catch (ModelUpdateException e) {
					return logAndSendException("literal creation error: " + e.getMessage());
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
					ARTURIResource objectInstance = createNewResource(ontModel, objectInstanceQName,
							getUserNamedGraphs());
					ontModel.addInstance(objectInstance.getURI(), rangeClsRes, wgraph);
					createLexicalization(ontModel, objectInstance, objectInstanceQName, urlPage, title,
							wgraph);
					logger.debug("instance: " + objectInstanceQName + " created and lexicalization taken");
				} catch (ModelUpdateException e) {
					return logAndSendException("Instance creation error: " + e.getMessage());
				} catch (DuplicatedResourceException e) {
					return logAndSendException("there is a resource with the same name of: "
							+ objectInstanceQName);
				}
				ARTURIResource subjectInstanceRes = ontModel.createURIResource(ontModel
						.expandQName(subjectInstanceQName));
				ARTURIResource objectInstanceRes = ontModel.createURIResource(ontModel
						.expandQName(objectInstanceQName));
				ontModel.instantiatePropertyWithResource(subjectInstanceRes, property, objectInstanceRes,
						wgraph);
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
				ARTResourceIterator it = ((DirectReasoning) ontModel)
						.listDirectInstances(rangeClsRes, graphs);
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
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
	}

	public Response addNewAnnotationForSelectedInstanceAndRelateToDroppedInstance(
			String subjectInstanceQName, String predicatePropertyQName, String objectInstanceQName,
			String lexicalization, String urlPage, String title) {
		RDFModel ontModel = getOWLModel();

		try {
			ARTResource wgraph = getWorkingGraph();

			ARTURIResource property = ontModel
					.createURIResource(ontModel.expandQName(predicatePropertyQName));
			ARTURIResource objectInstance = retrieveExistingURIResource(ontModel, objectInstanceQName,
					getUserNamedGraphs());
			createLexicalization(ontModel, objectInstance, lexicalization, urlPage, title, wgraph);
			ARTResource subjectInstanceRes = ontModel.createURIResource(ontModel
					.expandQName(subjectInstanceQName));
			ARTResource objectInstanceRes = ontModel.createURIResource(ontModel
					.expandQName(objectInstanceQName));
			ontModel.addTriple(subjectInstanceRes, property, objectInstanceRes);
		} catch (ModelUpdateException e) {
			return logAndSendException("Instance creation error: " + e.getMessage());
		} catch (ModelAccessException e) {
			return logAndSendException("Ontology Access error: " + e.getMessage());
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}

		return createReplyResponse(RepliesStatus.ok);

	}

	public Response bookmarkPage(String pageURL, String title, String topicsString) {
		RDFModel ontModel = getOWLModel();
		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		
		try {
			ARTResource wgraph = getWorkingGraph();
			ARTResource[] graphs = getUserNamedGraphs();
			ARTResource webPageInstance = createWebPage(ontModel, pageURL, title, wgraph);
			String[] topicsStringArray = topicsString.split("\\|_\\|");
			ArrayList<ARTURIResource> topics = new ArrayList<ARTURIResource>();
			for (String topicName : topicsStringArray) {
				ARTURIResource topic = retrieveExistingURIResource(ontModel, topicName, graphs);
				topics.add(topic);
			}
			tagPageWithTopics(ontModel, webPageInstance, topics, wgraph);

			Collection<STRDFResource> topicCollection = STRDFNodeFactory.createEmptyResourceCollection();

			for(ARTURIResource topic : topics) {				
				STRDFResource stResource = STRDFNodeFactory.createSTRDFResource(topic, 
						ModelUtilities.getResourceRole(topic, ontModel), 
						true, ontModel.getQName(topic.getURI()));
				topicCollection.add(stResource);
			}
			
			RDFXMLHelp.addRDFNodes(dataElement, topicCollection);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}

		return response;
	}

	public Response removeBookmark(String urlPage, String topic) {
		try {
			XMLResponse response = createReplyResponse(RepliesStatus.ok);
			
			OWLModel ontModel = getOWLModel();
			
			ARTResourceIterator collectionIterator = ontModel.listSubjectsOfPredObjPair(SemAnnotVocab.Res.url,
					ontModel.createLiteral(urlPage), true, getUserNamedGraphs());
			
			ARTURIResource webPageInstanceRes = null;
			
			if (collectionIterator.streamOpen()) {
				webPageInstanceRes = collectionIterator.getNext().asURIResource();
			}
			
			if (webPageInstanceRes == null) {
				return createReplyFAIL("Web page <" + urlPage + "> does not exist");
			}
			
			ARTURIResource topicResource = ontModel.createURIResource(topic);
			
			ontModel.deleteStatement(ontModel.createStatement(webPageInstanceRes, SemAnnotVocab.Res.topic, topicResource), getWorkingGraph());
		
			return response;
		} catch (Exception e) {
			return logAndSendException(e);
		}	
	}
	public void createLexicalization(RDFModel model, ARTURIResource instance, String lexicalization,
			String pageURL, String title, ARTResource... graphs) throws ModelUpdateException,
			ModelAccessException {
		logger.debug("creating lexicalization: " + lexicalization + " for instance: " + instance
				+ " on url: " + pageURL + " with title: " + title);
		ARTResource webPageInstance = createWebPage(model, pageURL, title, graphs);
		logger.debug("creating Semantic Annotation for: instQName: " + instance + " lexicalization: "
				+ lexicalization + " webPageInstance " + webPageInstance);
		createSemanticAnnotation(model, instance, lexicalization, webPageInstance, graphs);
	}

	public ARTResource createWebPage(RDFModel model, String urlPage, String title, ARTResource... graphs)
			throws ModelUpdateException, ModelAccessException {
		logger.debug("creating Web Page Instance for page: " + urlPage + " with title: " + title);
		ARTURIResource webPageInstanceRes = null;

		ARTResourceIterator collectionIterator;
		try {
			collectionIterator = model.listSubjectsOfPredObjPair(SemAnnotVocab.Res.url,
					model.createLiteral(urlPage), true);
			// iterator();
			if (collectionIterator.streamOpen()) {
				webPageInstanceRes = collectionIterator.getNext().asURIResource();
				logger.debug("found web page: "
						+ webPageInstanceRes.getLocalName()
						+ model.listValuesOfSubjPredPair(webPageInstanceRes, SemAnnotVocab.Res.url, true)
								.getNext());
			}
		} catch (ModelAccessException e) {
			throw new ModelUpdateException(e);
		}

		if (webPageInstanceRes == null) {
			logger.debug("web page not found;");
			String webPageInstanceID = generateNewSemanticAnnotationUUID(model);

			logger.debug("creating WebPage. webPageInstanceId: " + webPageInstanceID + " webPageRes: "
					+ SemAnnotVocab.Res.WebPage);
			String webPageURI = model.getDefaultNamespace() + webPageInstanceID;
			model.addInstance(webPageURI, SemAnnotVocab.Res.WebPage);
			webPageInstanceRes = model.createURIResource(webPageURI);

			model.addTriple(webPageInstanceRes, SemAnnotVocab.Res.url, model.createLiteral(urlPage), graphs);
			if (!title.equals("")) {
				model.addTriple(webPageInstanceRes, SemAnnotVocab.Res.title, model.createLiteral(title),
						graphs);
			}
			model.addTriple(webPageInstanceRes, model.createURIResource(datePropName),
					model.createLiteral(XmlSchema.formatCurrentUTCDateTime(), XmlSchema.Res.DATETIME), graphs);
		}

		return webPageInstanceRes;

	}

	public void tagPageWithTopics(RDFModel model, ARTResource webPageInstanceRes,
			Collection<ARTURIResource> topics, ARTResource... graphs) throws ModelUpdateException,
			ModelAccessException {
		for (ARTURIResource topic : topics) {
			model.addTriple(webPageInstanceRes, SemAnnotVocab.Res.topic, topic, graphs);
		}
	}

	public void createSemanticAnnotation(RDFModel model, ARTURIResource individual, String lexicalization,
			ARTResource webPageInstanceRes, ARTResource... graphs) throws ModelUpdateException,
			ModelAccessException {

		String semanticAnnotationID = generateNewSemanticAnnotationUUID(model);

		model.addInstance(model.getDefaultNamespace() + semanticAnnotationID,
				SemAnnotVocab.Res.SemanticAnnotation, graphs);

		ARTResource semanticAnnotationInstanceRes = model.createURIResource(model.getDefaultNamespace()
				+ semanticAnnotationID);
		logger.debug("creating lexicalization: semAnnotInstanceRes: " + semanticAnnotationInstanceRes + "");
		model.addTriple(semanticAnnotationInstanceRes, SemAnnotVocab.Res.text,
				model.createLiteral(lexicalization), graphs);

		model.addTriple(semanticAnnotationInstanceRes, SemAnnotVocab.Res.location, webPageInstanceRes, graphs);

		model.addTriple(individual, SemAnnotVocab.Res.annotation, semanticAnnotationInstanceRes, graphs);
	}

	public String generateNewSemanticAnnotationUUID(RDFModel model) throws ModelAccessException {
		UUID semanticAnnotationInstanceID;
		ARTResource semanticAnnotationInstance;
		String defNameSpace;
		do {
			semanticAnnotationInstanceID = UUID.randomUUID();
			defNameSpace = model.getDefaultNamespace();
			logger.debug("trying to create random name for URIResource with namespace: " + defNameSpace
					+ " and UUID: " + semanticAnnotationInstanceID);
			semanticAnnotationInstance = model.retrieveURIResource(model.getDefaultNamespace()
					+ semanticAnnotationInstanceID.toString());
		} while (semanticAnnotationInstance != null);
		return semanticAnnotationInstanceID.toString();
	}

}
