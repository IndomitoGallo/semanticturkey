/*
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License");  you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
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
 * Contributor(s): Armando Stellato stellato@info.uniroma2.it,
 * 				Andrea Turbati
 */
package it.uniroma2.art.semanticturkey.plugin.extpts;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.io.RDFNodeSerializer;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.navigation.ARTResourceIterator;
import it.uniroma2.art.semanticturkey.exceptions.DuplicatedResourceException;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.exceptions.NonExistingRDFResourceException;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceRequest;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.SerializationType;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import org.slf4j.Logger;

/**
 * @author Armando Stellato
 * @author Andrea Turbati
 * 
 */
public abstract class ServiceAdapter implements ServiceInterface {
	protected String id;
	protected ServiceRequest _oReq = null;
	protected List<ServletListener> listeners = new ArrayList<ServletListener>();
	protected ServletUtilities servletUtilities;

	protected ARTResource[] userGraphs;

	protected HashMap<String, String> httpParameters;

	public ServiceAdapter(String id) {
		servletUtilities = ServletUtilities.getService();
		httpParameters = new HashMap<String, String>();
		this.id = id;

		userGraphs = new ARTResource[1];
		userGraphs[0] = NodeFilters.ANY;
	}

	/**
	 * this method performs the following operations:
	 * <ul>
	 * <li>given the argument <code>parameterName</code>, retrieves the value for this parameter from the http
	 * GET request</li>
	 * <li>fills an internal map containing parameter name/value pairs, which can be lately accessed to get
	 * parameter values</li>
	 * <li>return the value obtained from the GET request</li>
	 * </ul>
	 * 
	 * @param parameterName
	 * @return
	 */
	public String setHttpPar(String parameterName) {
		String value = _oReq.getParameter(parameterName);
		httpParameters.put(parameterName, value);
		return value;
	}

	/**
	 * as for {@link ServiceAdapter#setHttpPar(String) but invokes {@link Boolean#parseBoolean(String)} on
	 * the string value of the parameter}
	 * 
	 * @param parameterName
	 * @return
	 */
	public boolean setHttpBooleanPar(String parameterName) {
		String strvalue = setHttpPar(parameterName);
		return (strvalue == null) ? false : (Boolean.parseBoolean(strvalue));
	}

	/**
	 * checks that the http parameters identified by <code>pars</code> have been properly initialized
	 * 
	 * @param pars
	 * @throws HTTPParameterUnspecifiedException
	 */
	public void checkRequestParametersAllNotNull(String... pars) throws HTTPParameterUnspecifiedException {
		for (int i = 0; i < pars.length; i++) {
			if (httpParameters.get(pars[i]) == null)
				throw new HTTPParameterUnspecifiedException(pars[i]);
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see it.uniroma2.art.semanticturkey.plugin.extpts.ServiceInterface#getId()
	 */
	public String getId() {
		return id;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * it.uniroma2.art.semanticturkey.plugin.extpts.ServiceInterface#setHttpServletRequest(javax.servlet.http
	 * .HttpServletRequest)
	 */
	public void setServiceRequest(ServiceRequest oReq) {
		_oReq = oReq;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * it.uniroma2.art.semanticturkey.plugin.extpts.ServiceInterface#addListener(it.uniroma2.art.semanticturkey
	 * .plugin.extpts.ServletListener)
	 */
	public synchronized void addListener(ServletListener l) {
		listeners.add(l);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * it.uniroma2.art.semanticturkey.plugin.extpts.ServiceInterface#removeListener(it.uniroma2.art.semanticturkey
	 * .plugin.extpts.ServletListener)
	 */
	public synchronized void removeListener(ServletListener l) {
		listeners.remove(l);
	}

	/**
	 * Funzione per chiamare avvertire tutti i listener che si erano registrati
	 */
	protected synchronized void fireServletEvent() {
		STEvent event = new STEvent(this, _oReq);
		Iterator<ServletListener> iterator = listeners.iterator();
		while (iterator.hasNext()) {
			iterator.next().EventRecived(event);
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see it.uniroma2.art.semanticturkey.plugin.extpts.ServiceInterface#XMLData()
	 */
	public Response getResponse() {
		Response resp;

		// RDFModel model = ProjectManager.getCurrentProject().getOntModel();
		// if (model instanceof TransactionBasedModel) { setAutoCommit(false);
		String request = setHttpPar("request");

		try {
			resp = getPreCheckedResponse(request);
		} catch (HTTPParameterUnspecifiedException e) {
			return servletUtilities.createUndefinedHttpParameterExceptionResponse(request, e);
		}

		// } final {
		// if (model instanceof TransactionBasedModel) {
		// setAutoCommit(true);

		return resp;
	}

	// RESPONSE PACKAGING

	protected XMLResponseREPLY createBooleanResponse(boolean resp) {
		return servletUtilities.createBooleanResponse(httpParameters.get("request"), resp);
	}
	
	protected XMLResponseREPLY createReplyResponse(RepliesStatus status) {
		return servletUtilities.createReplyResponse(httpParameters.get("request"), status);
	}

	protected XMLResponseREPLY createReplyFAIL(String message) {
		return servletUtilities.createReplyFAIL(httpParameters.get("request"), message);
	}

	protected ResponseREPLY createReplyResponse(RepliesStatus status, SerializationType ser_type) {
		return servletUtilities.createReplyResponse(httpParameters.get("request"), status, ser_type);
	}

	public ResponseREPLY createReplyFAIL(String message, SerializationType ser_type) {
		return servletUtilities.createReplyFAIL(_oReq.getParameter("request"), message, ser_type);
	}

	/**
	 * this is a method invoked by this class' implementation of {@link ServiceInterface#getResponse()},
	 * throwing specific exceptions for wrongly specific http parameters. Current implementation just throws
	 * an {@link HTTPParameterUnspecifiedException} whenever a mandatory parameter has not been specified in
	 * the request
	 * 
	 * @param request
	 * @return
	 * @throws HTTPParameterUnspecifiedException
	 */
	protected abstract Response getPreCheckedResponse(String request)
			throws HTTPParameterUnspecifiedException;

	protected abstract Logger getLogger();

	protected Response logAndSendException(Exception e) {
		return logAndSendException(httpParameters.get("request"), e);
	}

	protected Response logAndSendException(Exception e, String msg) {
		return logAndSendException(httpParameters.get("request"), e, msg);
	}

	protected Response logAndSendException(String msg) {
		return logAndSendException(httpParameters.get("request"), msg);
	}

	/**
	 * this convenience method prepares an exception response initialized with the given arguments, logs the
	 * occurred exception with level "error" and prints the stack trace
	 * 
	 * @param request
	 * @param e
	 * @return
	 */
	protected Response logAndSendException(String request, Exception e) {
		return logAndSendException(request, e.toString());
	}

	protected Response logAndSendException(String request, String msg) {
		getLogger().error(msg);
		return servletUtilities.createExceptionResponse(request, msg);
	}

	/**
	 * this convenience method prepares an exception response initialized with the given arguments and logs
	 * the occurred exception with level "error"
	 * 
	 * @param request
	 * @param e
	 * @param msg
	 * @return
	 */
	protected Response logAndSendException(String request, Exception e, String msg) {
		e.printStackTrace(System.err);
		getLogger().error(e.toString());
		return servletUtilities.createExceptionResponse(request, msg);
	}

	protected Response logAndSendException(String request, String msg, SerializationType sertype) {
		getLogger().error(msg);
		return servletUtilities.createExceptionResponse(request, msg, sertype);
	}

	protected ARTResource getWorkingGraph() throws ModelAccessException, NonExistingRDFResourceException {
		return NodeFilters.MAINGRAPH;
	}

	protected ARTResource[] getUserNamedGraphs() throws ModelAccessException, NonExistingRDFResourceException {
		return userGraphs;
	}

	protected ARTResourceIterator listNamedGraphs() throws ModelAccessException, NonExistingRDFResourceException {
		RDFModel model = ProjectManager.getCurrentProject().getOntModel();
		return model.listNamedGraphs();
	}

	protected OWLModel getOWLModel() {
		return ProjectManager.getCurrentProject().getOWLModel();
	}

	protected ARTResource retrieveExistingResource(RDFModel model, String qname, ARTResource... graphs)
			throws NonExistingRDFResourceException, ModelAccessException {		
		ARTResource res = RDFNodeSerializer.createResource(model, qname);
		if (model.existsResource(res, graphs))
			return res;
		throw new NonExistingRDFResourceException(res, graphs);
	}
	
	protected ARTURIResource retrieveExistingURIResource(RDFModel model, String qname, ARTResource... graphs)
			throws NonExistingRDFResourceException, ModelAccessException {
		ARTURIResource res = model.createURIResource(model.expandQName(qname));
		if (model.existsResource(res, graphs))
			return res;
		throw new NonExistingRDFResourceException(res, graphs);
	}

	/**
	 * actually this method should be incorporated inside the OWLART, so that all the addXXX which take a
	 * string as their element, should be able to check if the resource is at least existing on the checked
	 * graph. Note that here the resource is only checked against the graphs and then returned as a POJO. it
	 * is not written in the triple store.
	 * 
	 * @param model
	 * @param qname
	 * @param graphs these are the graphs to be checked for existence of the resource
	 * @return
	 * @throws NonExistingRDFResourceException
	 * @throws ModelAccessException
	 */
	protected ARTURIResource createNewResource(RDFModel model, String qname, ARTResource... graphs)
			throws DuplicatedResourceException, ModelAccessException {
		ARTURIResource res = model.createURIResource(model.expandQName(qname));
		if (model.existsResource(res, graphs))
			throw new DuplicatedResourceException("attempting to create resource: " + res
					+ " which is already existing in graphs: " + graphs);
		return res;
	}

}
