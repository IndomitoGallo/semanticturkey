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

import it.uniroma2.art.semanticturkey.ontology.STOntologyManager;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.MirroredOntologyFile;
import it.uniroma2.art.semanticturkey.resources.OntTempFile;
import it.uniroma2.art.semanticturkey.resources.OntologiesMirror;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.XMLResponse;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.Enumeration;
import java.util.Hashtable;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Element;

/**
 * @author Armando Stellato Contributor(s): Andrea Turbati
 */
public class Administration extends ServiceAdapter {
	protected static Logger logger = LoggerFactory.getLogger(Administration.class);
	static int webUpdate = 0;
	static int localUpdate = 1;

	protected static String setAdminLevel = "setAdminLevel";
	protected static String getOntologyMirror = "getOntologyMirror";
	protected static String deleteOntMirrorEntry = "deleteOntMirrorEntry";
	protected static String updateOntMirrorEntry = "updateOntMirrorEntry";

	public Administration(String id) {
		super(id);
	}

	public Response getResponse() {
		String request = setHttpPar("request");
		fireServletEvent();
		if (request.equals(setAdminLevel))
			return setAdminLevel(setHttpPar("adminLevel"));
		if (request.equals(getOntologyMirror))
			return getOntologyMirrorTable();
		if (request.equals(deleteOntMirrorEntry)) {
			String baseURI = setHttpPar("ns");
			String cacheFileName = setHttpPar("file");
			return deleteOntologyMirrorEntry(baseURI, cacheFileName);
		}
		if (request.equals(updateOntMirrorEntry)) {
			String baseURI = setHttpPar("baseURI");
			String mirrorFileName = setHttpPar("mirrorFileName");
			String srcLoc = setHttpPar("srcLoc");
			String location = null;
			int updateType = 0;
			if (srcLoc.equals("wbu"))
				location = baseURI;
			else if (srcLoc.equals("walturl"))
				location = setHttpPar("altURL");
			else if (srcLoc.equals("lf")) {
				location = setHttpPar("updateFilePath");
				updateType = 1;
			} else
				return ServletUtilities.getService().createExceptionResponse(request,
						"uncorrect or unspecified srcLoc parameter in http request");

			return updateOntologyMirrorEntry(updateType, baseURI, mirrorFileName, location);

		} else
			return ServletUtilities.getService().createExceptionResponse(request,
					"no handler for such a request!");

	}

	public XMLResponse setAdminLevel(String adminLevel) {
		ServletUtilities servletUtilities = ServletUtilities.getService();
		if (adminLevel.equals("on"))
			Config.setAdminStatus(true);
		else if (adminLevel.equals("off"))
			Config.setAdminStatus(false);
		else
			return servletUtilities.createExceptionResponse(setAdminLevel, adminLevel
					+ " is not a recognized administration level; choose \"on\" or \"off\"");

		logger.info("Administration set to: " + adminLevel);

		return servletUtilities.createReplyResponse(setAdminLevel, ServiceVocabulary.RepliesStatus.ok,
				"Administration set to: " + adminLevel);
	}

	/**
	 * gets the namespace mapping for the loaded ontology
	 * 
	 * <streponse request="getOntologyMirror" type="data"> <Mirror
	 * uri="http://xmlns.com/foaf/spec/20070524.rdf" file="foaf.rdf"/> <Mirror
	 * uri="http://sweet.jpl.nasa.gov/ontology/earthrealm.owl" file="earthrealm.owl"/> </Tree>
	 * 
	 */
	public ResponseREPLY getOntologyMirrorTable() {
		Hashtable<Object, Object> mirror = OntologiesMirror.getFullMirror();
		Enumeration<Object> uris = mirror.keys();

		XMLResponseREPLY resp = ServletUtilities.getService().createReplyResponse(getOntologyMirror,
				RepliesStatus.ok);
		Element dataElement = resp.getDataElement();

		while (uris.hasMoreElements()) {
			String uri = (String) uris.nextElement();
			Element mirrorElem = XMLHelp.newElement(dataElement, "Mirror");
			mirrorElem.setAttribute("ns", uri);
			mirrorElem.setAttribute("file", (String) mirror.get(uri));
		}
		return resp;
	}

	/**
	 * deletes an entry (and its associated physical file) from the Ontology Mirror
	 * 
	 * @return
	 */
	public XMLResponse deleteOntologyMirrorEntry(String baseURI, String cacheFileName) {
		OntologiesMirror.removeCachedOntologyEntry(baseURI);
		File cacheFile = new File(Resources.getOntologiesMirrorDir(), cacheFileName);
		cacheFile.delete();

		return ServletUtilities.getService().createReplyResponse(deleteOntMirrorEntry, RepliesStatus.ok,
				"mirror entry removed");
	}

	// TODO transform MirroredOntologyFile into an extended class for java.io.File
	/**
	 * updates an entry (and its associated physical file) from the Ontology Mirror
	 * 
	 * <Tree type="AckMsg"> <Msg content="mirror entry updated"/> </Tree>
	 * 
	 * @return
	 */
	public XMLResponse updateOntologyMirrorEntry(int updateType, String baseURI, String mirrorFileName,
			String location) {

		MirroredOntologyFile mirFile = new MirroredOntologyFile(mirrorFileName);
		try {
			if (updateType == webUpdate) { // use first a temporary file, just in case the download brokes in
				// the middle, then copies the temporary to the destination in the
				// mirror
				OntTempFile tempFile = STOntologyManager.getTempFileEntry();
				Utilities.download(new URL(location), tempFile.getAbsolutePath());
				Utilities.copy(tempFile.getAbsolutePath(), mirFile.getAbsolutePath());
			} else if (updateType == localUpdate) {
				Utilities.copy(location, mirFile.getAbsolutePath());
			}
		} catch (IOException e) {
			e.printStackTrace();
			return ServletUtilities.getService().createExceptionResponse(updateOntMirrorEntry,
					"problems in updating mirrored ontology file:\n" + e.getMessage());
		}

		return ServletUtilities.getService().createReplyResponse(updateOntMirrorEntry, RepliesStatus.ok,
				"mirror entry updated");
	}

	/*
	 * this is the old version of updateOntologyMirror which I i-do-not-know-why implemented as a rename. I
	 * keep it, in case i decide to implement a rename ontology mirror entry service
	 * 
	 * public Document updateOntologyMirrorEntry(int updateType, String baseURI, String mirrorFileName, String
	 * location) {
	 * 
	 * boolean overwrite=false;
	 * 
	 * File newCacheFileFromSourcePosition = new File(newFilePath); File newCacheFileMirrorPosition = new
	 * File(Resources.getOntologiesMirrorDir(), newCacheFileFromSourcePosition.getName()); String
	 * newCacheFileLocalName = newCacheFileFromSourcePosition.getName();
	 * 
	 * if (newCacheFileLocalName.equals(oldFileLocalName)) overwrite=true;
	 * 
	 * //check if it is not overwriting a file which is already in the mirror, the only allowed case is when
	 * the user wants to overwrite the old file associated to this uri if (!overwrite &&
	 * newCacheFileMirrorPosition.exists()) returnServletUtilities.getService().documentError(
	 * "sorry there's another mirrored file with the same name, change the name of your file to be imported in the mirror"
	 * );
	 * 
	 * try { Utilities.copy(newCacheFileFromSourcePosition, newCacheFileMirrorPosition);
	 * 
	 * if (!overwrite) { //if it has not already been overwritten by the new mirror file, remove the old one
	 * MirroredOntologyFile oldMOFile = new MirroredOntologyFile(oldFileLocalName); File oldFile = new
	 * File(oldMOFile.getAbsolutePath()); oldFile.delete(); }
	 * 
	 * OntologiesMirror.addCachedOntologyEntry(baseURI, new MirroredOntologyFile(newCacheFileLocalName));
	 * 
	 * } catch (IOException e) { e.printStackTrace(); return
	 * ServletUtilities.getService().documentError("problems in updating file name for mirrored ontology file:\n"
	 * + e.getMessage()); }
	 * 
	 * Document xml = new DocumentImpl(); Element treeElement = xml.createElement("Tree");
	 * treeElement.setAttribute("type","AckMsg"); Element ackElem = XMLHelp.newElement(treeElement, "Msg");
	 * ackElem.setAttribute("content","mirror entry updated"); xml.appendChild(treeElement); return response;
	 * }
	 */

}
