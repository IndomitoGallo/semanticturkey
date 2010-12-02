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
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.utilities.ModelUtilities;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.models.TransactionBasedModel;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.w3c.dom.Element;

/**
 * This service provides the sole functionality for renaming resources in the ontology
 * 
 * @author Armando Stellato Contributor(s): Andrea Turbati
 */
public class ModifyName extends ServiceAdapter {
	protected static Logger logger = LoggerFactory.getLogger(ModifyName.class);
	public String XSLpath = Resources.getXSLDirectoryPath() + "createClassForm.xsl";

	public static class Pars {
		public static String oldName = "oldName";
		public static String newName = "newName";
	}

	public Logger getLogger() {
		return logger;
	}

	public static String renameRequest = "rename";

	public ModifyName(String id) {
		super(id);
	}

	public Response getResponse() {
		String request = renameRequest;
		ServletUtilities servletUtilities = ServletUtilities.getService();
		String qname = setHttpPar(Pars.oldName);
		String newQname = setHttpPar(Pars.newName);

		try {
			checkRequestParametersAllNotNull(Pars.oldName, Pars.newName);
			return changeResourceName(qname, newQname);
		} catch (HTTPParameterUnspecifiedException e) {
			return servletUtilities.createUndefinedHttpParameterExceptionResponse(request, e);
		}
	}

	/*
	 * catch (ModelUpdateException e) { return servletUtilities.createExceptionResponse(request, e); } catch
	 * (ModelAccessException e) { return servletUtilities.createExceptionResponse(request, e); } catch
	 * (DuplicatedResourceException e) { return servletUtilities.createExceptionResponse(request,
	 * e.getMessage()); } finally {
	 * 
	 * }
	 */

	public Response changeResourceName(String qName, String newQName) {
		RDFModel ontModel = ProjectManager.getCurrentProject().getOntModel();
		ARTURIResource res = null;
		try {
			res = ontModel.createURIResource(ontModel.expandQName(qName));
			if (!ModelUtilities.checkExistingResource(ontModel, res))
				return ServletUtilities.getService().createExceptionResponse(renameRequest,
						"inconsistency error: resource " + res + " is not present in the ontModel");
			if (ModelUtilities.checkExistingResource(ontModel, ontModel.createURIResource(ontModel
					.expandQName(newQName))))
				return ServletUtilities.getService().createExceptionResponse(
						renameRequest,
						"could not rename resource: " + res + " to: " + newQName
								+ " because a resource with this name already exists in the ontology");
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		}

		if (ontModel instanceof TransactionBasedModel)
			try {
				((TransactionBasedModel) ontModel).setAutoCommit(false);
			} catch (ModelUpdateException e1) {
				return logAndSendException(e1, "sorry, unable to commit changes to the data, try to close the project and open it again");
			}

		try {
			ontModel.renameIndividual(res, ontModel.expandQName(newQName));
		} catch (ModelUpdateException e1) {
			return logAndSendException(e1);
		} catch (ModelAccessException e1) {
			return logAndSendException(e1);
		}

		if (ontModel instanceof TransactionBasedModel) {
			try {
				((TransactionBasedModel) ontModel).setAutoCommit(true);
			} catch (ModelUpdateException e) {
				return ServletUtilities
						.getService()
						.createExceptionResponse(renameRequest,
								"sorry, unable to commit changes to the data, try to close the project and open it again");
			}
		}

		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(renameRequest,
				RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		Element element = XMLHelp.newElement(dataElement, "UpdateResource");
		element.setAttribute("name", qName);
		element.setAttribute("newname", newQName);
		this.fireServletEvent();
		return response;
	}

}
