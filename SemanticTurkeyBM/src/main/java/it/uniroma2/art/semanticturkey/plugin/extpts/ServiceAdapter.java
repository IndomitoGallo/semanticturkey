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

import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServiceRequest;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import org.slf4j.Logger;

/**
 * @author Andrea Turbati
 * 
 */
public abstract class ServiceAdapter implements ServiceInterface {
	protected String id;
	protected ServiceRequest _oReq = null;
	protected List<ServletListener> listeners = new ArrayList<ServletListener>();
	protected ServletUtilities servletUtilities;

	protected HashMap<String, String> httpParameters;

	public ServiceAdapter(String id) {
		servletUtilities = ServletUtilities.getService();
		httpParameters = new HashMap<String, String>();
		this.id = id;
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

	protected Response getPreCheckedResponse(String request) throws HTTPParameterUnspecifiedException {
		return getResponse();
	};

	protected abstract Logger getLogger();

	/**
	 * this convenience method prepares an exception response initialized with the given arguments, logs
	 * the occurred exception with level "error" and prints the stack trace
	 * 
	 * @param request
	 * @param e
	 * @return
	 */
	protected Response logAndSendException(String request, Exception e) {
		getLogger().error(e.toString());
		e.printStackTrace(System.err);
		return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
	}

	/**
	 * this convenience method prepares an exception response initialized with the given arguments, logs
	 * the occurred exception with level "error" and prints the stack trace
	 * 
	 * @param request
	 * @param e
	 * @param msg
	 * @return
	 */
	protected Response logAndSendException(String request, Exception e, String msg) {
		getLogger().error(e.toString());
		e.printStackTrace(System.err);
		return ServletUtilities.getService().createExceptionResponse(request, msg);
	}

}
