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
  * (ai-nlp.info.uniroma2.it) at the University of Roma Tor Vergata
  * Current information about SemanticTurkey can be obtained at 
  * http//ai-nlp.info.uniroma2.it/software/...
  *
  */

  /*
   * Contributor(s): Armando Stellato stellato@info.uniroma2.it
  */
package it.uniroma2.art.semanticturkey.servlet.main;

import java.io.File;
import java.io.IOException;
import java.util.Enumeration;
import java.util.Hashtable;

import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.plugin.extpts.InterfaceServiceServlet;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.MirroredOntologyFile;
import it.uniroma2.art.semanticturkey.resources.OntologiesMirror;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * @author Armando Stellato
 * Contributor(s): Andrea Turbati
 */
public class Administration extends InterfaceServiceServlet{
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	

	public Administration(String id){
		this.id = id;
	}
		
	public Document XMLData() {
		String request = _oReq.getParameter("request");
		fireServletEvent();
		if ( request.equals("setAdminLevel") )
			return setAdminLevel(_oReq.getParameter("adminLevel"));
		if ( request.equals("getOntologyMirror") )
			return getOntologyMirrorTable();		
		if ( request.equals("deleteOntMirrorEntry")) {
            String baseURI = _oReq.getParameter("ns");
            String cacheFileName = _oReq.getParameter("file");
		    return deleteOntologyMirrorEntry(baseURI, cacheFileName);
		}
	    if ( request.equals("updateOntMirrorEntry")) {
            String baseURI = _oReq.getParameter("ns");
            String oldCacheFileName = _oReq.getParameter("oldMirrorFileName");
            String newCacheFilePath = _oReq.getParameter("newMirrorFilePath");
            return updateOntologyMirrorEntry(baseURI, oldCacheFileName, newCacheFilePath);
	    }
		else return ServletUtilities.getService().documentError("no handler for such a request!");  
		
	}
	

    public Document setAdminLevel(String adminLevel) {
		ServletUtilities servletUtilities = new ServletUtilities();
		if (adminLevel.equals("on")) Config.setAdminStatus(true);
		else if (adminLevel.equals("off")) Config.setAdminStatus(false);
			 else return servletUtilities.documentError(adminLevel + " is not a recognized administration level; choose \"on\" or \"off\"");
		
		Document xml = new DocumentImpl();
		Element treeElement = xml.createElement("Tree");
		treeElement.setAttribute("type","AckMsg");
		Element element = XMLHelp.newElement(treeElement,"Msg");
		element.setAttribute("content","Administration set to: " + adminLevel);
		//element.setTextContent("Administration set to: " + adminLevel);
		xml.appendChild(treeElement);		
		
		s_logger.info("Administration set to: " + adminLevel);
		
		return xml;
	}
	
	
	/**
	 * gets the namespace mapping for the loaded ontology
     * 
     * <Tree type="getMirrorTable">
     *      <Mirror  uri="http://xmlns.com/foaf/spec/20070524.rdf" file="foaf.rdf"/>
     *      <Mirror  uri="http://sweet.jpl.nasa.gov/ontology/earthrealm.owl" file="earthrealm.owl"/>
     * </Tree>
     * 
	 */
	public Document getOntologyMirrorTable() {
		Hashtable<Object, Object> mirror = OntologiesMirror.getFullMirror();
		Enumeration<Object> uris = mirror.keys();
		Document xml = new DocumentImpl();
		Element treeElement = xml.createElement("Tree");
			treeElement.setAttribute("type","getMirrorTable");		
		while (uris.hasMoreElements()) {
			String uri = (String)uris.nextElement();
			Element mirrorElem = XMLHelp.newElement(treeElement, "Mirror");
				mirrorElem.setAttribute("ns",uri);
				mirrorElem.setAttribute("file",(String)mirror.get(uri));
		}
		xml.appendChild(treeElement);
		return xml;
	}

	
	/**
	 * deletes an entry (and its associated physical file) from the Ontology Mirror
     * 
     * <Tree type="AckMsg">
     *      <Msg  content="mirror entry removed"/>
     * </Tree>
	 * 
	 * @return
	 */
	public Document deleteOntologyMirrorEntry(String baseURI, String cacheFileName) {
	    Document xml = new DocumentImpl();
	    
	    OntologiesMirror.removeCachedOntologyEntry(baseURI);
	    File cacheFile = new File(Resources.getOntologiesMirrorDir(), cacheFileName);
	    cacheFile.delete();
	    Element treeElement = xml.createElement("Tree");
        treeElement.setAttribute("type","AckMsg");
        Element ackElem = XMLHelp.newElement(treeElement, "Msg");
        ackElem.setAttribute("content","mirror entry removed");
	    xml.appendChild(treeElement);
	    return xml;
	}
	
	//TODO transform MirroredOntologyFile into an extended class for java.io.File
    /**
     * updates an entry (and its associated physical file) from the Ontology Mirror
     * 
     * <Tree type="AckMsg">
     *      <Msg  content="mirror entry updated"/>
     * </Tree>
     * 
     * @return
     */
    public Document updateOntologyMirrorEntry(String baseURI, String oldFileLocalName, String newFilePath) {
            
        boolean overwrite=false;
        
        File newCacheFileFromSourcePosition = new File(newFilePath);
        File newCacheFileMirrorPosition = new File(Resources.getOntologiesMirrorDir(), newCacheFileFromSourcePosition.getName());
        String newCacheFileLocalName = newCacheFileFromSourcePosition.getName(); 
        
        if (newCacheFileLocalName.equals(oldFileLocalName))
            overwrite=true;
        
        //check if it is not overwriting a file which is already in the mirror, the only allowed case is when the user wants to overwrite the old file associated to this uri
        if (!overwrite && newCacheFileMirrorPosition.exists())        
            return ServletUtilities.getService().documentError("sorry there's another mirrored file with the same name, change the name of your file to be imported in the mirror");
        
        try {
            Utilities.copy(newCacheFileFromSourcePosition, newCacheFileMirrorPosition);
        
            if (!overwrite) { //if it has not already been overwritten by the new mirror file, remove the old one
                MirroredOntologyFile oldMOFile = new MirroredOntologyFile(oldFileLocalName);
                File oldFile = new File(oldMOFile.getAbsolutePath());
                oldFile.delete();
            }

            OntologiesMirror.addCachedOntologyEntry(baseURI, new MirroredOntologyFile(newCacheFileLocalName));
            
        } catch (IOException e) {
            e.printStackTrace();
            return ServletUtilities.getService().documentError("problems in updating file name for mirrored ontology file:\n" + e.getMessage());
        }
                
        Document xml = new DocumentImpl();
        Element treeElement = xml.createElement("Tree");
        treeElement.setAttribute("type","AckMsg");
        Element ackElem = XMLHelp.newElement(treeElement, "Msg");
        ackElem.setAttribute("content","mirror entry updated");
        xml.appendChild(treeElement);
        return xml;
    }
	
	@Override
	public CXSL CXSLFactory() {
		// TODO Auto-generated method stub
		return null;
	}
	
}


