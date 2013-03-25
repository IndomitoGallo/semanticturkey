package it.uniroma2.art.semanticturkey.servlet.main;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.exceptions.ModelUpdateException;
import it.uniroma2.art.owlart.filter.ResourceOfATypePredicate;
import it.uniroma2.art.owlart.model.ARTLiteral;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.navigation.ARTLiteralIterator;
import it.uniroma2.art.owlart.navigation.ARTResourceIterator;
import it.uniroma2.art.owlart.utilities.ModelUtilities;
import it.uniroma2.art.owlart.utilities.PropertyChainsTree;
import it.uniroma2.art.semanticturkey.SemanticTurkeyOperations;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.exceptions.NonExistingRDFResourceException;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.w3c.dom.Element;

@Component
public class RangeAnnotation extends ServiceAdapter {

	protected static Logger logger = LoggerFactory.getLogger(Annotation.class);

	// REQUESTS
	public static class Req {
		public static final String getPageAnnotationsRequest = "getPageAnnotations";
		public static final String chkAnnotationsRequest = "chkAnnotations";
		public static final String addAnnotationRequest = "addAnnotation";
		public static final String deleteAnnotationRequest = "deleteAnnotation";
	}

	// PARS
	public static class Par {
		public static final String id = "id";
		public static final String urlPage = "urlPage";
		public static final String lexicalization = "lexicalization";
		public static final String resource = "resource";
		public static final String title = "title";
		public static final String range = "range";
	}

	private PropertyChainsTree deletePropertyChainsForAnnotations;

	@Autowired
	public RangeAnnotation(@Value("RangeAnnotation") String id) {
		super(id);

		deletePropertyChainsForAnnotations = new PropertyChainsTree();
		deletePropertyChainsForAnnotations
				.addChainedProperty(SemAnnotVocab.Res.location);
		deletePropertyChainsForAnnotations
				.addChainedProperty(SemAnnotVocab.Res.range);
	}

	@Override
	protected Response getPreCheckedResponse(String request)
			throws HTTPParameterUnspecifiedException {
		Response response = null;

		if (request.equals(Req.chkAnnotationsRequest)) {
			String urlPage = setHttpPar(Par.urlPage);
			checkRequestParametersAllNotNull(Par.urlPage);

			response = chkAnnotations(urlPage);
		} else if (request.equals(Req.getPageAnnotationsRequest)) {
			String urlPage = setHttpPar(Par.urlPage);
			checkRequestParametersAllNotNull(Par.urlPage);

			response = getPageAnnotations(urlPage);
		} else if (request.equals(Req.addAnnotationRequest)) {
			String resource = setHttpPar(Par.resource);
			String lexicalization = setHttpPar(Par.lexicalization);
			String urlPage = setHttpPar(Par.urlPage);
			String title = setHttpPar(Par.title);
			String range = setHttpPar(Par.range);
			checkRequestParametersAllNotNull(Par.resource, Par.lexicalization,
					Par.urlPage, Par.title, Par.range);

			return addAnnotation(resource, lexicalization, urlPage, title,
					range);
		} else if (request.equals(Req.deleteAnnotationRequest)) {
			String id = setHttpPar(Par.id);
			checkRequestParametersAllNotNull(Par.id);

			return deleteAnnotation(id);
		} else
			return ServletUtilities.getService()
					.createNoSuchHandlerExceptionResponse(request);

		this.fireServletEvent();
		return response;
	}

	private Response deleteAnnotation(String id) {
		try {
			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
			ARTResource annotation = retrieveExistingResource(getOWLModel(),
					id, getWorkingGraph());

			ModelUtilities.deepDeleteIndividual(annotation, getOWLModel(),
					deletePropertyChainsForAnnotations, getWorkingGraph());

			return response;
		} catch (Exception e) {
			return logAndSendException(e);
		}
	}

	private Response chkAnnotations(String urlPage) {
		String request = Req.chkAnnotationsRequest;
		RDFModel ontModel = ProjectManager.getCurrentProject().getOntModel();

		ARTLiteral urlPageLiteral = ontModel.createLiteral(urlPage);
		ARTResourceIterator collectionIterator;
		try {
			collectionIterator = ontModel.listSubjectsOfPredObjPair(
					SemAnnotVocab.Res.url, urlPageLiteral, true);
			// this predicate filters out annotations which are not
			// RangeAnnotations
			ResourceOfATypePredicate rangeAnnotationPredicate = ResourceOfATypePredicate
					.getPredicate(ontModel, SemAnnotVocab.Res.RangeAnnotation);
			boolean rangeAnnotationFound = false;
			while (collectionIterator.hasNext()) {
				if (rangeAnnotationPredicate
						.apply((ARTResource) collectionIterator.next())) {
					rangeAnnotationFound = true;
					break;
				}
			}
			RepliesStatus reply;

			if (rangeAnnotationFound)
				reply = RepliesStatus.ok;
			else
				reply = RepliesStatus.fail;
			return servletUtilities.createReplyResponse(request, reply);

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		}
	}

	private Response getPageAnnotations(String urlPage) {
		OWLModel ontModel = getOWLModel();

		XMLResponseREPLY response = servletUtilities.createReplyResponse(
				Req.getPageAnnotationsRequest, RepliesStatus.ok);

		Element dataElement = response.getDataElement();

		ARTLiteral urlPageLiteral = ontModel.createLiteral(urlPage);
		ARTResourceIterator collectionIterator;
		ARTResource webPage = null;
		ResourceOfATypePredicate rangeAnnotationPredicate = ResourceOfATypePredicate
				.getPredicate(ontModel, SemAnnotVocab.Res.RangeAnnotation);
		try {
			collectionIterator = ontModel.listSubjectsOfPredObjPair(
					SemAnnotVocab.Res.url, urlPageLiteral, true);
			while (collectionIterator.hasNext()) {
				webPage = (ARTResource) collectionIterator.next();
			}
			if (webPage == null) {
				return response;
			}
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		}

		ARTResourceIterator semanticAnnotationsIterator;
		try {
			semanticAnnotationsIterator = ontModel.listSubjectsOfPredObjPair(
					SemAnnotVocab.Res.location, webPage, true);
			while (semanticAnnotationsIterator.streamOpen()) {
				ARTResource semanticAnnotation = semanticAnnotationsIterator
						.getNext().asURIResource();
				ARTLiteralIterator lexicalizationIterator = ontModel
						.listValuesOfSubjDTypePropertyPair(semanticAnnotation,
								SemAnnotVocab.Res.text, true);
				ARTLiteral lexicalization = lexicalizationIterator.getNext(); // there
																				// is
																				// at
																				// least
																				// one
																				// and
																				// no
				// more than one lexicalization
				// for each semantic annotation
				if (rangeAnnotationPredicate.apply(semanticAnnotation)) {
					Element annotationElement = XMLHelp.newElement(dataElement,
							"RangeAnnotation");
					annotationElement.setAttribute("id", ontModel
							.getQName(semanticAnnotation.asURIResource()
									.getURI()));
					annotationElement.setAttribute("value",
							lexicalization.getLabel());
					ARTURIResource annotatedResource = ontModel
							.listSubjectsOfPredObjPair(
									SemAnnotVocab.Res.annotation,
									semanticAnnotation, true).getNext()
							.asURIResource();
					// there is at least one and no more than one referenced
					// resource for each semantic
					// annotation
					annotationElement.setAttribute("resource",
							ontModel.getQName(annotatedResource.getURI()));
					ARTLiteral range = ontModel
							.listValuesOfSubjDTypePropertyPair(
									semanticAnnotation,
									SemAnnotVocab.Res.range, true).getNext();
					annotationElement.setAttribute("range", range.getLabel());
				}
			}
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		}

		return response;
	}

	public Response addAnnotation(String resource, String lexicalization,
			String urlPage, String title, String range) {
		try {
			logger.debug("taking annotation for: url" + urlPage
					+ " instanceQName: " + resource + " lexicalization: "
					+ lexicalization + " title: " + title);

			ServletUtilities servletUtilities = new ServletUtilities();
			RDFModel ontModel = ProjectManager.getCurrentProject()
					.getOntModel();

			ARTResource artResource = retrieveExistingResource(ontModel,
					resource, getUserNamedGraphs());

			logger.debug("creating lexicalization: " + lexicalization
					+ " for instance: " + artResource + " on url: " + urlPage
					+ " with title: " + title);

			ARTResource webPageInstance = SemanticTurkeyOperations
					.createWebPage(ontModel, urlPage, title);

			logger.debug("creating Semantic Annotation for: instQName: "
					+ artResource + " lexicalization: " + lexicalization
					+ " webPageInstance " + webPageInstance);

			String semanticAnnotationID = SemanticTurkeyOperations
					.generateNewSemanticAnnotationUUID(ontModel);

			ARTResource semanticAnnotationInstanceRes = ontModel
					.createURIResource(ontModel.getDefaultNamespace()
							+ semanticAnnotationID);

			ontModel.addInstance(
					semanticAnnotationInstanceRes.getNominalValue(),
					SemAnnotVocab.Res.RangeAnnotation, getWorkingGraph());

			logger.debug("creating lexicalization: semAnnotInstanceRes: "
					+ semanticAnnotationInstanceRes + "");
			ontModel.addTriple(semanticAnnotationInstanceRes,
					SemAnnotVocab.Res.text,
					ontModel.createLiteral(lexicalization));

			ontModel.addTriple(semanticAnnotationInstanceRes,
					SemAnnotVocab.Res.location, webPageInstance,
					getWorkingGraph());
			ontModel.addTriple(semanticAnnotationInstanceRes,
					SemAnnotVocab.Res.range, ontModel.createLiteral(range),
					getWorkingGraph());

			ontModel.addTriple(artResource, SemAnnotVocab.Res.annotation,
					semanticAnnotationInstanceRes);

			logger.debug("annotation taken");

			return servletUtilities.createReplyResponse(
					Req.addAnnotationRequest, RepliesStatus.ok);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		}
	}

	@Override
	protected Logger getLogger() {
		return logger;
	}
}
