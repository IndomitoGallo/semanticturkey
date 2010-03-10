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
 */
package it.uniroma2.art.semanticturkey.servlet.main;

import it.uniroma2.art.owlart.utilities.ModelUtilities;
import it.uniroma2.art.semanticturkey.exceptions.ProjectCreationException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectInconsistentException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectInexistentException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectUpdateException;
import it.uniroma2.art.semanticturkey.ontology.STOntologyManager;
import it.uniroma2.art.semanticturkey.plugin.PluginManager;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.Project;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.util.ArrayList;
import java.util.Iterator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Element;

public class SystemStart extends ServiceAdapter {
	protected static Logger logger = LoggerFactory.getLogger(SystemStart.class);
	ServletUtilities servletUtilities = new ServletUtilities();

	// requests
	public final static String startRequest = "start";
	public final static String openProjectRequest = "openProject";
	public final static String listTripleStoresRequest = "listTripleStores";

	// parameters
	public final static String baseuriPar = "baseuri";
	public final static String ontmanagerPar = "ontmanager";
	public final static String projectNamePar = "name";

	// response tags
	public final static String baseuriTag = "baseuri";

	public SystemStart(String id) {
		super(id);
	}


	// TODO COSTRUIRE LA RISPOSTA XML NEI CASI DI START E FIRST START, non dare errore se nn tutto è segnato,
	// ma dire cosa manca di modo che il client può fare ulteriri richieste all'utente
	public Response getResponse() {
		String request = setHttpPar("request");

		if (request.equals(startRequest)) {		
			String baseuri = setHttpPar(baseuriPar);
			String ontModelImpl = setHttpPar(ontmanagerPar);
			return startSystem(baseuri, ontModelImpl);
		}

		if (request.equals(listTripleStoresRequest))
			return listAvailableOntManagerImplementations();

		else
			return servletUtilities.createExceptionResponse(request, "no handler for such a request!");
	}

	/**
	 * this method returns the list of available (and OSGi-plugged) {@link STOntologyManager} implementations
	 * 
	 * @return an xml serialization of the returned information
	 */
	public Response listAvailableOntManagerImplementations() {
		logger.info("getting the list of available OntologyManager Implementations");
		ArrayList<String> ontModelList = PluginManager.getOntManagerImplIDs();
		ResponseREPLY response = ServletUtilities.getService().createReplyResponse(listTripleStoresRequest,
				RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		Element repElement = null;
		Iterator<String> iter = ontModelList.iterator();
		while (iter.hasNext()) {
			repElement = XMLHelp.newElement(dataElement, "Repository");
			repElement.setAttribute("repName", iter.next());
		}
		return response;
	}

	/**
	 * @param baseuri
	 *            the baseuri used to awake the system. If it is null, then the baseURI is retrieved from
	 *            current ontology project
	 * @param ontModelImplID
	 *            the {@link STOntologyManager} implmentation used to awake the system. If it is null, then it
	 *            is is retrieved from current ontology project
	 * @return this is an XML example of the response. for the negative case, see description of the
	 *         {@link #sendStartUnavailable(String, String)}.
	 * 
	 *         <Tree type="startResponse"> <response state="affirmative"> <baseuri
	 *         uri="http://art.uniroma2.it/ontologies/rtv"> <ontModelImplementation id="sesame"> <response/>
	 *         </Tree>
	 */
	public Response startSystem(String baseuri, String ontModelImplID) {

		String request = startRequest;
		logger.info("requested to start system with the following parameters:\nbaseuri=" + baseuri
				+ "\nontModelImplID=" + ontModelImplID);

		try {
			Project mainProj = ProjectManager.openMainProject();
			baseuri = mainProj.getBaseURI();
			ontModelImplID = mainProj.getOntologyManagerImplID();
			logger.info("main project had already been initialized with these parameters:\nbaseuri="
					+ baseuri + "\nontModelImplID=" + ontModelImplID + ".\nUsing this configuration");
		} catch (ProjectInexistentException e) {
			logger.info("main project has never been initialized; initializing it now");

			// if ontModelImplID has not been specified, we guess it in case it is unique
			if (ontModelImplID == null) {				
				ArrayList<String> IDs = PluginManager.getOntManagerImplIDs();
				if (IDs.size() == 1)
					ontModelImplID = IDs.get(0);
				logger.info("OntologyManager Id not specified, the sole available one:\n" + ontModelImplID + ", has been chosen");
			}

			// after retrieving the parameters, if any of them is still null, then the startUnavailable method
			// is thrown, replying with a negative response to the client
			if (baseuri == null || ontModelImplID == null)
				return sendStartUnavailable(baseuri, ontModelImplID);

			String defaultNamespace = ModelUtilities.createDefaultNamespaceFromBaseURI(baseuri);
			try {
				ProjectManager.createMainProject(baseuri, defaultNamespace, ontModelImplID);
			} catch (ProjectInconsistentException e1) {
				return ServletUtilities.getService().createExceptionResponse(request, e1.getMessage());
			} catch (ProjectUpdateException e1) {
				return ServletUtilities.getService().createExceptionResponse(request, e1.getMessage());
			}
		} catch (ProjectCreationException e) {
			logger.info("problems in project creation", e);
			return ServletUtilities.getService().createExceptionResponse(request, e.toString());
		}

		logger.info("system loaded with the following parameters:\nbaseuri=" + baseuri + "\nontModelImplID="
				+ ontModelImplID);
		return sendStartOk(baseuri, ontModelImplID);
	}

	/**
	 * @param baseuri
	 * @param ontModelImplID
	 * @return this is an XML example of the response. Notice that one of baseuri or ontModelImplementation
	 *         must be in state="unavailable" otherwise the response would have been in "affirmative" state
	 *         Example <Tree type="startResponse"> <response state="negative"> <baseuri state="unavailable"/>
	 *         (or, if available: <baseuri state="available"
	 *         uri="http://ai-nlp.info.uniroma2.it/ontologies/rtv"> ) <ontModelImplementation
	 *         state="unavailable"/> (or, if available: <ontModelImplementation id="sesame" state="available">
	 *         ) <response/> </Tree>
	 */
	private Response sendStartUnavailable(String baseuri, String ontModelImplID) {
		ResponseREPLY response = ServletUtilities.getService().createReplyResponse(startRequest,
				RepliesStatus.fail);
		Element dataElement = response.getDataElement();

		Element baseuriElement = XMLHelp.newElement(dataElement, baseuriTag);
		if (baseuri != null) {
			baseuriElement.setAttribute("uri", baseuri);
			baseuriElement.setAttribute("state", "available");
		} else
			baseuriElement.setAttribute("state", "unavailable");

		Element ontModelImplementationElement = XMLHelp.newElement(dataElement, ontmanagerPar);
		if (ontModelImplID != null) {
			ontModelImplementationElement.setAttribute("id", ontModelImplID);
			ontModelImplementationElement.setAttribute("state", "available");
		} else
			ontModelImplementationElement.setAttribute("state", "unavailable");

		return response;
	}

	private Response sendStartOk(String baseuri, String ontModelImplID) {
		ResponseREPLY response = ServletUtilities.getService()
				.createReplyResponse(startRequest, RepliesStatus.ok);
		Element dataElement = response.getDataElement();

		Element baseuriElement = XMLHelp.newElement(dataElement, baseuriTag);
		baseuriElement.setAttribute("uri", baseuri);
		baseuriElement.setAttribute("state", "available");

		Element ontModelImplementationElement = XMLHelp.newElement(dataElement, "ontModelImplementation");
		ontModelImplementationElement.setAttribute("id", ontModelImplID);
		ontModelImplementationElement.setAttribute("state", "available");

		return response;
	}

	public static void main(String[] args) {

	}
}
