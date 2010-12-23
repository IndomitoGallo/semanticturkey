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
import it.uniroma2.art.owlart.exceptions.ModelCreationException;
import it.uniroma2.art.owlart.exceptions.ModelUpdateException;
import it.uniroma2.art.owlart.exceptions.UnsupportedRDFFormatException;
import it.uniroma2.art.owlart.io.RDFFormat;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.w3c.dom.Element;

/**
 * This service allows for ontology save/load/clean functionalities for Semantic Turkey
 * 
 * @author Armando Stellato <stellato@info.uniroma2.it>
 */
public class InputOutput extends ServiceAdapter {
	protected static Logger logger = LoggerFactory.getLogger(InputOutput.class);

	public Logger getLogger() {
		return logger;
	}

	public static String saveRDFRequest = "saveRDF";
	public static String loadRDFRequest = "loadRDF";
	public static String clearDataRequest = "clearData";

	public static String filePar = "file";
	public static String allNGsPar = "allNGs";
	public static String baseUriPar = "baseUri";
	public static String formatPar = "format";

	public InputOutput(String id) {
		super(id);
	}

	public Response getPreCheckedResponse(String request) throws HTTPParameterUnspecifiedException {
		ServletUtilities servletUtilities = new ServletUtilities();
		this.fireServletEvent();
		if (request.equals(saveRDFRequest)) {
			String outPutFile = setHttpPar(filePar);
			String allNGs = setHttpPar(allNGsPar);
			checkRequestParametersAllNotNull(filePar);
			return saveRDF(new File(outPutFile), allNGs);
		}
		if (request.equals(loadRDFRequest)) {
			String inputFile = setHttpPar(filePar);
			String baseUri = setHttpPar(baseUriPar);
			String format = setHttpPar(formatPar);
			checkRequestParametersAllNotNull(filePar, baseUriPar);
			return loadRDF(new File(inputFile), baseUri, format);
		}
		if (request.equals(clearDataRequest)) {
			return clearData();
		}

		else
			return servletUtilities.createNoSuchHandlerExceptionResponse(request);

	}

	/**
	 * answers with an ack on the result of saving the ontModel to a local file.
	 * 
	 * <Tree type="save_ontModel"> <result level="ok"/> //oppure "failed" <msg content="bla bla bla"/> </Tree>
	 * 
	 * 
	 * HINT for CLIENT: always launch a getNamespaceMappings, getOntologyImports after a setOntologyImports
	 * because an imported ontology may contain other prefix mappings to be imported
	 * 
	 */
	public Response saveRDF(File outPutFile, String allNGs) {

		String request = saveRDFRequest;
		ServletUtilities servletUtilities = new ServletUtilities();
		try {
			boolean multigraph = false;
			if (allNGs != null)
				multigraph = Boolean.parseBoolean(allNGs);
			RDFFormat format = RDFFormat.guessRDFFormatFromFile(outPutFile);
			if (format != null)
				ProjectManager.getCurrentProject().getOntologyManager().writeRDFOnFile(outPutFile, format,
						multigraph);
			else
				ProjectManager.getCurrentProject().getOntologyManager().writeRDFOnFile(outPutFile,
						RDFFormat.RDFXML, multigraph);
			// TODO we could leave the choice for the format to the user
		} catch (Exception e) {
			e.printStackTrace();
			logger.error("problems in saving the ontModel: " + e.getMessage(), e);
			return servletUtilities.createExceptionResponse(request, "problems in saving the ontModel\n"
					+ e.getMessage());
		}

		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request,
				RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		Element element = XMLHelp.newElement(dataElement, "result");
		element.setAttribute("level", "ok");
		element = XMLHelp.newElement(dataElement, "msg");
		element.setAttribute("content", "ontModel saved");
		return response;
	}

	/**
	 * answers with an ack on the result of loading the ontModel from a local file.
	 * 
	 * <Tree type="load_ontModel"> <result level="ok"/> //oppure "failed" <msg content="bla bla bla"/> </Tree>
	 * 
	 * 
	 * HINT for CLIENT: always launch a getNamespaceMappings, getOntologyImports after a setOntologyImports
	 * because an imported ontology may contain other prefix mappings to be imported
	 * 
	 */
	public Response loadRDF(File inputFile, String baseURI, String formatName) {
		String request = loadRDFRequest;
		ServletUtilities servletUtilities = new ServletUtilities();
		try {
			RDFFormat rdfFormat = null;
			if (formatName != null) {
				logger.debug("name for rdf format to be used in loading RDF has been provided by the user: "
						+ formatName);
				rdfFormat = RDFFormat.parseFormat(formatName);
			}
			if (rdfFormat == null) {
				logger.debug("guessing format from extension of file to be loaded: " + formatName);
				rdfFormat = RDFFormat.guessRDFFormatFromFile(inputFile);
			}
			if (rdfFormat == null) {
				return servletUtilities
						.createExceptionResponse(
								request,
								"rdf file format cannot be established neither from file extension nor from user preference (if it has been provided)");
			}
			ProjectManager.getCurrentProject().getOntologyManager().loadOntologyData(inputFile, baseURI,
					rdfFormat);
		} catch (FileNotFoundException e) {
			e.printStackTrace();
			logger.error("the file you chose is unavailable: " + e.getMessage(), e);
			return servletUtilities.createExceptionResponse(request, "the file you chose is unavailable: \n"
					+ e.getMessage());
		} catch (IOException e) {
			e.printStackTrace();
			logger.error("io error: " + e.getMessage(), e);
			return servletUtilities.createExceptionResponse(request, "io error: \n" + e.getMessage());
		} catch (ModelAccessException e) {
			e.printStackTrace();
			logger.error("the file you chose is not accessible: " + e.getMessage(), e);
			return servletUtilities.createExceptionResponse(request,
					"the file you chose is not accessible: \n" + e.getMessage());
		} catch (ModelUpdateException e) {
			return servletUtilities.createExceptionResponse(request, e);
		} catch (UnsupportedRDFFormatException e) {
			return servletUtilities.createExceptionResponse(request, e.getMessage());
		}

		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request,
				RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		Element element = XMLHelp.newElement(dataElement, "result");
		element.setAttribute("level", "ok");
		element = XMLHelp.newElement(dataElement, "msg");
		element.setAttribute("content", "ontModel loaded");
		return response;
	}

	/**
	 * answers with an ack on the result of loading the ontModel from a local file.
	 * 
	 * <Tree type="clear_ontModel"> <result level="ok"/> //oppure "failed" <msg content="bla bla bla"/>
	 * </Tree>
	 * 
	 * 
	 * HINT for CLIENT: always launch a getNamespaceMappings, getOntologyImports after a setOntologyImports
	 * because an imported ontology may contain other prefix mappings to be imported
	 * 
	 */
	public Response clearData() {
		String request = clearDataRequest;
		ServletUtilities servletUtilities = new ServletUtilities();
		try {
			ProjectManager.getCurrentProject().getOntologyManager().clearData();
		} catch (ModelUpdateException e) {
			e.printStackTrace();
			logger.error("unable to clear the ontModel: " + e.getMessage(), e);
			return servletUtilities.createExceptionResponse(request, "unable to clear the ontModel: \n"
					+ e.getMessage());
		} catch (ModelCreationException e) {
			e.printStackTrace();
			logger.error("problems in restarting a new empty ontModel: " + e.getMessage(), e);
			return servletUtilities.createExceptionResponse(request,
					"problems in restarting a new empty ontModel: \n" + e.getMessage());
		}

		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request,
				RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		Element element = XMLHelp.newElement(dataElement, "result");
		element.setAttribute("level", "ok");
		element = XMLHelp.newElement(dataElement, "msg");
		element.setAttribute("content", "rdf data cleared");
		return response;
	}

}
