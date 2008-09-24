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

import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.plugin.extpts.InterfaceServiceServlet;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.ontapi.exceptions.RepositoryCreationException;
import it.uniroma2.art.ontapi.exceptions.RepositoryNotAccessibleException;
import it.uniroma2.art.ontapi.exceptions.RepositoryUpdateException;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**Classe che permette di dare dei sinonimi ai nomi delle classi legati alla lingua (inglese italiano)
 * !!!!ma non sembra che questi siano poi coniderati nella ricerca su classi i sinonimi dovrebbero essere considerati nell'ontologySearch!!!!*/
/**
 * @author Armando Stellato
 * Contributor(s): Andrea Turbati
 */
public class InputOutput extends InterfaceServiceServlet{
	@SuppressWarnings("unused")
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	

	
	public InputOutput(String id){
		this.id = id;
	}
	
	public Document XMLData() {
		ServletUtilities servletUtilities = new ServletUtilities();
        String request = _oReq.getParameter("request");
        this.fireServletEvent();
        if ( request.equals("save_repository") ) {
        	String outPutFile = _oReq.getParameter("file");
            return saveRepository(new File(outPutFile));
        }
        if ( request.equals("load_repository") ) {
        	String inputFile = _oReq.getParameter("file");
        	String baseUri =  _oReq.getParameter("baseUri");
            return loadRepository(new File(inputFile),baseUri);
        }
        if ( request.equals("clear_repository") ) {
        	return clearRepository();
        }
        
        else return servletUtilities.documentError("no handler for such a request!");    
	}
    
   
    /**
     * answers with an ack on the result of saving the repository to a local file.
	 *
     *  <Tree type="save_repository">  
     *      <result level="ok"/>            //oppure "failed"
     *      <msg content="bla bla bla"/>         
     *  </Tree>
	 *
     * 
     * HINT for CLIENT: always launch a getNamespaceMappings, getOntologyImports after a setOntologyImports because an imported ontology may contain other prefix mappings to be imported
     * 
     */
	public Document saveRepository(File outPutFile) {
		ServletUtilities servletUtilities = new ServletUtilities();
		try {
			Resources.getRepositoryManager().writeRDFOnFile(outPutFile);
		} catch (Exception e) {
			e.printStackTrace();
			s_logger.error("problems in saving the repository: " + e.getMessage(), e);
			return servletUtilities.documentError("problems in saving the repository\n" + e.getMessage());
		}
		
        Document xml = new DocumentImpl();
        Element treeElement = xml.createElement("Tree");        
        treeElement.setAttribute("type","save_repository");
        Element element = XMLHelp.newElement(treeElement,"result");
        	element.setAttribute("level","ok");
        element = XMLHelp.newElement(treeElement,"msg");
        	element.setAttribute("content","repository saved");
        xml.appendChild(treeElement);
        return xml;
    }
    
 
	
    /**
     * answers with an ack on the result of loading the repository from a local file.
	 *
     *  <Tree type="load_repository">  
     *      <result level="ok"/>            //oppure "failed"
     *      <msg content="bla bla bla"/>         
     *  </Tree>
	 *
     * 
     * HINT for CLIENT: always launch a getNamespaceMappings, getOntologyImports after a setOntologyImports because an imported ontology may contain other prefix mappings to be imported
     * 
     */
	public Document loadRepository(File inputFile, String baseURI) {
		ServletUtilities servletUtilities = new ServletUtilities();
		try {
			Resources.getRepositoryManager().loadOntologyData(inputFile, baseURI);
		} catch (FileNotFoundException e) {
			e.printStackTrace();
			s_logger.error("the file you chose is unavailable: " + e.getMessage(), e);
			return servletUtilities.documentError("the file you chose is unavailable: \n" + e.getMessage());
		} catch (IOException e) {
			e.printStackTrace();
			s_logger.error("io error: " + e.getMessage(), e);
			return servletUtilities.documentError("io error: \n" + e.getMessage());
		} catch (RepositoryNotAccessibleException e) {
			e.printStackTrace();
			s_logger.error("the file you chose is not accessible: " + e.getMessage(), e);
			return servletUtilities.documentError("the file you chose is not accessible: \n" + e.getMessage());
		} catch (RepositoryCreationException e) {
			e.printStackTrace();
			s_logger.error("problems in reloading the repository after the data addition: " + e.getMessage(), e);
			return servletUtilities.documentError("problems in reloading the repository after the data addition: \n" + e.getMessage());
		}
		
        Document xml = new DocumentImpl();
        Element treeElement = xml.createElement("Tree");        
        	treeElement.setAttribute("type","load_repository");
	        Element element = XMLHelp.newElement(treeElement,"result");
	        	element.setAttribute("level","ok");
	        element = XMLHelp.newElement(treeElement,"msg");
	        	element.setAttribute("content","repository saved");
        xml.appendChild(treeElement);
        return xml;
    }   
    
	
    /**
     * answers with an ack on the result of loading the repository from a local file.
	 *
     *  <Tree type="clear_repository">  
     *      <result level="ok"/>            //oppure "failed"
     *      <msg content="bla bla bla"/>         
     *  </Tree>
	 *
     * 
     * HINT for CLIENT: always launch a getNamespaceMappings, getOntologyImports after a setOntologyImports because an imported ontology may contain other prefix mappings to be imported
     * 
     */
	public Document clearRepository() {
		ServletUtilities servletUtilities = new ServletUtilities();
		try {			
			Resources.getRepositoryManager().clearRepository();
		} catch (RepositoryUpdateException e) {
			e.printStackTrace();
			s_logger.error("unable to clear the repository: " + e.getMessage(), e);
			return servletUtilities.documentError("unable to clear the repository: \n" + e.getMessage());
		} catch (RepositoryCreationException e) {
			e.printStackTrace();
			s_logger.error("problems in restarting a new empty repository: " + e.getMessage(), e);
			return servletUtilities.documentError("problems in restarting a new empty repository: \n" + e.getMessage());
		}
		
		Config.removeBaseURIAndDefaultNamespace();

		
        Document xml = new DocumentImpl();
        Element treeElement = xml.createElement("Tree");        
        	treeElement.setAttribute("type","clear_repository");
        	Element element = XMLHelp.newElement(treeElement,"result");
        		element.setAttribute("level","ok");
        	element = XMLHelp.newElement(treeElement,"msg");
        		element.setAttribute("content","repository cleared");
        xml.appendChild(treeElement);
        return xml;
    }

	@Override
	public CXSL CXSLFactory() {
		// TODO Auto-generated method stub
		return null;
	}   
	
    
}
