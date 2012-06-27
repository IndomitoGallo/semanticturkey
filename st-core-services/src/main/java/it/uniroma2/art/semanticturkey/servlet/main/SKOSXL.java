package it.uniroma2.art.semanticturkey.servlet.main;

import java.util.ArrayList;
import java.util.Collection;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.exceptions.ModelUpdateException;
import it.uniroma2.art.owlart.io.RDFNodeSerializer;
import it.uniroma2.art.owlart.model.ARTLiteral;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.models.SKOSXLModel;
import it.uniroma2.art.owlart.navigation.ARTResourceIterator;
import it.uniroma2.art.owlart.vocabulary.RDFResourceRolesEnum;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.exceptions.NonExistingRDFResourceException;
import it.uniroma2.art.semanticturkey.ontology.utilities.RDFXMLHelp;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFNodeFactory;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFResource;
import it.uniroma2.art.semanticturkey.project.Project;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

public class SKOSXL extends SKOS {

	protected static Logger logger = LoggerFactory.getLogger(SKOSXL.class);

	protected static enum XLabelCreationMode {
		bnode, uri
	};

	// REQUESTS
	public static class Req {
		// GET REQUESTS
		// public static final String getTopConceptsRequest = "getTopConcepts";
		// public static final String getBroaderConceptsRequest = "getBroaderConcepts";
		// public static final String getNarrowerConceptsRequest = "getNarrowerConcepts";
		// public static final String getAllSchemesListRequest = "getAllSchemesList";
		public static final String getLabelsRequest = "getLabels";
		public static final String getPrefLabelRequest = "getPrefLabel";
		public static final String getAltLabelsRequest = "getAltLabels";
		public static final String getHiddenLabelsRequest = "getHiddenLabels";
		// public static final String getSchemesMatrixPerConceptRequest = "getSchemesMatrixPerConceptRequest";

		// IS REQUESTS
		public static final String isTopConceptRequest = "isTopConcept";

		// ADD REQUESTS
		// public static final String addTopConceptRequest = "addTopConcept";
		// public static final String addBroaderConceptRequest = "addBroaderConcept";
		// public static final String addConceptToSchemeRequest = "addConceptToScheme";
		public static final String setPrefLabelRequest = "setPrefLabel";
		public static final String addAltLabelRequest = "addAltLabel";
		public static final String addHiddenLabelRequest = "addHiddenLabel";

		// CREATE REQUESTS
		// public static final String createConceptRequest = "createConcept";
		// public static final String createSchemeRequest = "createScheme";

		// REMOVE REQUESTS
		// public static final String removeTopConceptRequest = "removeTopConcept";
		// public static final String deleteConceptRequest = "deleteConcept";
		// public static final String deleteSchemeRequest = "deleteScheme";
		public static final String removePrefLabelRequest = "removePrefLabel";
		public static final String removeAltLabelRequest = "removeAltLabel";
		// public static final String removeConceptFromSchemeRequest = "removeConceptFromScheme";
		// public static final String removeBroaderConcept = "removeBroaderConcept";

		// MODIFY REQUESTS
		// public static final String assignHierarchyToSchemeRequest = "assignHierarchyToScheme";

		// TREE (ONLY FOR DEBUGGING)
		// public static final String showSKOSConceptsTreeRequest = "showSKOSConceptsTree";
	}

	// PARS

	public static class Par {
		// final static public String broaderConcept = "broaderConcept";
		final static public String concept = "concept";
		// final static public String conceptFrom = "conceptFrom";
		// final static public String conceptTo = "conceptTo";
		// final static public String forceDeleteDanglingConcepts = "forceDeleteDanglingConcepts";
		// final static public String setForceDeleteDanglingConcepts = "setForceDeleteDanglingConcepts";
		final static public String label = "label";
		final static public String langTag = "lang";
		// final static public String newConcept = "newConcept";
		// final static public String prefLabel = "prefLabel";
		// final static public String relatedConcept = "relatedConcept";
		// final static public String semanticRelation = "semanticRelation";
		final static public String scheme = "scheme";
		// final static public String sourceScheme = "sourceScheme";
		// final static public String targetScheme = "targetScheme";
		// final static public String treeView = "treeView";
		final static public String mode = "mode";
	}

	public SKOSXL(String id) {
		super(id);
	}

	@Override
	public Response getPreCheckedResponse(String request) throws HTTPParameterUnspecifiedException {
		logger.debug("request to SKOS-XL");

		Response response = null;
		// all new fashioned requests are put inside these grace brackets
		if (request == null)
			return servletUtilities.createNoSuchHandlerExceptionResponse(request);

		// GET SKOS METHODS
		if (request.equals(Req.getPrefLabelRequest)) {
			System.err.println("inside SKOSXL");
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag);
			response = getPrefXLabel(skosConceptName, lang);
		} else if (request.equals(Req.getAltLabelsRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag);
			response = getAltXLabels(skosConceptName, lang);
		} else if (request.equals(Req.getHiddenLabelsRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag);
			response = getHiddenXLabels(skosConceptName, lang);
		} else if (request.equals(Req.getLabelsRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			checkRequestParametersAllNotNull(Par.concept, Par.langTag);
			response = getXLabels(skosConceptName, lang);
		}

		// ADD/CREATE/SET

		else if (request.equals(Req.setPrefLabelRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			String label = setHttpPar(Par.label);
			String modeString = setHttpPar(Par.mode);
			checkRequestParametersAllNotNull(Par.concept, Par.mode, Par.langTag, Par.label);
			XLabelCreationMode xLabelCreationMode = XLabelCreationMode.valueOf(modeString);
			response = setPrefXLabel(skosConceptName, xLabelCreationMode, label, lang);
		} else if (request.equals(Req.addAltLabelRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			String label = setHttpPar(Par.label);
			String modeString = setHttpPar(Par.mode);
			checkRequestParametersAllNotNull(Par.concept, Par.mode, Par.langTag, Par.label);
			XLabelCreationMode xLabelCreationMode = XLabelCreationMode.valueOf(modeString);
			response = addAltXLabel(skosConceptName, xLabelCreationMode, label, lang);
		} else if (request.equals(Req.addHiddenLabelRequest)) {
			String skosConceptName = setHttpPar(Par.concept);
			String lang = setHttpPar(Par.langTag);
			String label = setHttpPar(Par.label);
			String modeString = setHttpPar(Par.mode);
			checkRequestParametersAllNotNull(Par.concept, Par.mode, Par.langTag, Par.label);
			XLabelCreationMode xLabelCreationMode = XLabelCreationMode.valueOf(modeString);
			response = addHiddenXLabel(skosConceptName, xLabelCreationMode, label, lang);
		}

		else
			response = super.getPreCheckedResponse(request);

		this.fireServletEvent();
		return response;
	}

	@Override
	protected Logger getLogger() {
		return logger;
	}

	// SERVICE METHODS

	/**
	 * this service gets the preferred label for a given language
	 * 
	 * 
	 * @param skosConceptName
	 * @param label
	 * @param lang
	 * @return
	 */
	public Response getPrefXLabel(String skosConceptName, String lang) {

		SKOSXLModel model = getSKOSXLModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {
			ARTResource[] graphs = getUserNamedGraphs();
			ARTURIResource skosConcept = retrieveExistingURIResource(model, skosConceptName, graphs);

			if (!lang.equals("*")) {
				STRDFResource prefLabel = getPrefXLabel(model, skosConcept, lang, graphs);
				if (prefLabel != null)
					RDFXMLHelp.addRDFNode(response, prefLabel);
			} else {
				Collection<STRDFResource> prefLabels = listPrefXLabels(model, skosConcept, graphs);
				RDFXMLHelp.addRDFNodes(response, prefLabels);
			}

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	/**
	 * this service gets the alternative label for a given language
	 * 
	 * 
	 * @param skosConceptName
	 * @param lang
	 * @return
	 */
	public Response getAltXLabels(String skosConceptName, String lang) {

		SKOSXLModel model = getSKOSXLModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {
			ARTResource[] graphs = getUserNamedGraphs();
			ARTURIResource skosConcept = retrieveExistingURIResource(model, skosConceptName, graphs);

			Collection<STRDFResource> altLabels = listAltXLabels(model, skosConcept, lang, graphs);
			RDFXMLHelp.addRDFNodes(response, altLabels);

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	/**
	 * this service gets the hidden label for a given language
	 * 
	 * 
	 * @param skosConceptName
	 * @param lang
	 * @return
	 */
	public Response getHiddenXLabels(String skosConceptName, String lang) {

		SKOSXLModel model = getSKOSXLModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {
			ARTResource[] graphs = getUserNamedGraphs();
			ARTURIResource skosConcept = retrieveExistingURIResource(model, skosConceptName, graphs);

			Collection<STRDFResource> hiddenLabels = listHiddenXLabels(model, skosConcept, lang, graphs);
			RDFXMLHelp.addRDFNodes(response, hiddenLabels);

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	/**
	 * this service gets all the xlabels for a given language, ordered by type
	 * 
	 * 
	 * @param skosConceptName
	 * @param lang
	 * @return
	 */
	public Response getXLabels(String skosConceptName, String lang) {

		SKOSXLModel model = getSKOSXLModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		try {
			ARTResource[] graphs = getUserNamedGraphs();
			ARTURIResource skosConcept = retrieveExistingURIResource(model, skosConceptName, graphs);

			if (!lang.equals("*")) {
				STRDFResource prefLabel = getPrefXLabel(model, skosConcept, lang, graphs);
				if (prefLabel != null)
					RDFXMLHelp.addRDFNode(XMLHelp.newElement(response.getDataElement(), "prefLabel"),
							prefLabel);
			} else {
				Collection<STRDFResource> prefLabels = listPrefXLabels(model, skosConcept, graphs);
				RDFXMLHelp.addRDFNodes(response, "prefLabels", prefLabels);
			}

			Collection<STRDFResource> altLabels = listAltXLabels(model, skosConcept, lang, graphs);
			RDFXMLHelp.addRDFNodes(response, "altLabels", altLabels);

			Collection<STRDFResource> hiddenLabels = listHiddenXLabels(model, skosConcept, lang, graphs);
			RDFXMLHelp.addRDFNodes(response, "hiddenLabels", hiddenLabels);

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
	 * 
	 * @param skosConceptName
	 * @param mode
	 *            bnode or uri: if uri a URI generator is used to create the URI for the xlabel
	 * @param label
	 * @param lang
	 * @return
	 */
	public Response setPrefXLabel(String skosConceptName, XLabelCreationMode mode, String label, String lang) {

		SKOSXLModel model = getSKOSXLModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

		try {
			ARTURIResource skosConcept = retrieveExistingURIResource(model, skosConceptName,
					getUserNamedGraphs());
			if (mode == XLabelCreationMode.bnode)
				model.setPrefXLabel(skosConcept, label, lang, getWorkingGraph());
			else {
				ARTURIResource prefXLabel = model.addXLabel(createURIForXLabel(model), label, lang,
						getWorkingGraph());
				model.setPrefXLabel(skosConcept, prefXLabel, getWorkingGraph());
			}

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
	 * this service adds an alternative label to a concept for a given language
	 * 
	 * 
	 * @param skosConceptName
	 * @param mode
	 *            bnode or uri: if uri a URI generator is used to create the URI for the xlabel
	 * @param label
	 * @param lang
	 * @return
	 */
	public Response addAltXLabel(String skosConceptName, XLabelCreationMode mode, String label, String lang) {

		SKOSXLModel model = getSKOSXLModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

		try {
			ARTURIResource skosConcept = retrieveExistingURIResource(model, skosConceptName,
					getUserNamedGraphs());
			if (mode == XLabelCreationMode.bnode)
				model.addAltXLabel(skosConcept, label, lang, getWorkingGraph());
			else {
				ARTURIResource altXLabel = model.addXLabel(createURIForXLabel(model), label, lang,
						getWorkingGraph());
				model.addAltXLabel(skosConcept, altXLabel, getWorkingGraph());
			}

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
	 * this service adds an hidden label to a concept for a given language
	 * 
	 * 
	 * @param skosConceptName
	 * @param mode
	 *            bnode or uri: if uri a URI generator is used to create the URI for the xlabel
	 * @param label
	 * @param lang
	 * @return
	 */
	public Response addHiddenXLabel(String skosConceptName, XLabelCreationMode mode, String label, String lang) {

		SKOSXLModel model = getSKOSXLModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);

		try {
			ARTURIResource skosConcept = retrieveExistingURIResource(model, skosConceptName,
					getUserNamedGraphs());
			if (mode == XLabelCreationMode.bnode)
				model.addHiddenXLabel(skosConcept, label, lang, getWorkingGraph());
			else {
				ARTURIResource hiddenXLabel = model.addXLabel(createURIForXLabel(model), label, lang,
						getWorkingGraph());
				model.addHiddenXLabel(skosConcept, hiddenXLabel, getWorkingGraph());
			}

		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
		return response;
	}

	// **************
	// INNER METHODS
	// **************

	public STRDFResource getPrefXLabel(SKOSXLModel model, ARTURIResource skosConcept, String lang,
			ARTResource... graphs) throws ModelAccessException, NonExistingRDFResourceException {
		ARTResource prefLabel = model.getPrefXLabel(skosConcept, lang, graphs);
		if (prefLabel!=null)
			return createSTXLabel(model, prefLabel, true);
		return null;
	}

	public Collection<STRDFResource> listPrefXLabels(SKOSXLModel model, ARTURIResource skosConcept,
			ARTResource... graphs) throws ModelAccessException, NonExistingRDFResourceException {
		ARTResourceIterator prefLabels = model.listPrefXLabels(skosConcept, graphs);
		return createSTXLabelCollection(model, prefLabels, true);
	}

	public Collection<STRDFResource> listAltXLabels(SKOSXLModel model, ARTURIResource skosConcept,
			String lang, ARTResource... graphs) throws ModelAccessException, NonExistingRDFResourceException {
		ARTResourceIterator altLabels;
		if (lang.equals("*"))
			altLabels = model.listAltXLabels(skosConcept, graphs);

		else
			altLabels = model.listAltXLabels(skosConcept, lang, graphs);

		return createSTXLabelCollection(model, altLabels, true);
	}

	public Collection<STRDFResource> listHiddenXLabels(SKOSXLModel model, ARTURIResource skosConcept,
			String lang, ARTResource... graphs) throws ModelAccessException, NonExistingRDFResourceException {
		ARTResourceIterator altLabels;
		if (lang.equals("*"))
			altLabels = model.listHiddenXLabels(skosConcept, graphs);

		else
			altLabels = model.listHiddenXLabels(skosConcept, lang, graphs);

		return createSTXLabelCollection(model, altLabels, true);
	}

	// **************
	// FACILITY METHODS
	// **************

	public Collection<STRDFResource> createSTXLabelCollection(SKOSXLModel model, ARTResourceIterator it,
			boolean explicit) throws ModelAccessException, NonExistingRDFResourceException {
		Collection<STRDFResource> xLabels = new ArrayList<STRDFResource>();
		while (it.streamOpen()) {
			xLabels.add(createSTXLabel(model, it.getNext(), explicit));
		}
		it.close();
		return xLabels;
	}

	private STRDFResource createSTXLabel(SKOSXLModel skosModel, ARTResource xLabel, boolean explicit)
			throws ModelAccessException, NonExistingRDFResourceException {
		String show;
		ARTLiteral lbl = skosModel.getLiteralForm(xLabel, getUserNamedGraphs());
		if (lbl != null)
			show = lbl.getLabel();
		else
			show = skosModel.getQName(RDFNodeSerializer.toNT(xLabel));

		STRDFResource res = STRDFNodeFactory.createSTRDFResource(xLabel, RDFResourceRolesEnum.xLabel,
				explicit, show);
		if (lbl != null)
			res.setInfo("lang", lbl.getLanguage());

		return res;
	}

	private String createURIForXLabel(RDFModel model) {
		return model.getDefaultNamespace() + "xl-" + UUID.randomUUID().toString();
	}

	@SuppressWarnings("unchecked")
	public static SKOSXLModel getSKOSXLModel() {
		return ((Project<SKOSXLModel>) ProjectManager.getCurrentProject()).getOntModel();
	}

}
