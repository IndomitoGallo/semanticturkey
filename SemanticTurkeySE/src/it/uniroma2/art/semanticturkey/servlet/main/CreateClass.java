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

package it.uniroma2.art.semanticturkey.servlet.main;

//import it.uniroma2.art.semanticturkey.SemanticTurkey;
//import it.uniroma2.art.ontapi.ARTRepository;
//import it.uniroma2.art.ontapi.ARTResource;
//import it.uniroma2.art.semanticturkey.resources.Resources;
//import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.plugin.extpts.InterfaceServiceServlet;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;

import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**Classe che si occupa di creare di una nuova classe nell'ontologia di base*/
/**
 * @author Donato Griesi, Armando Stellato
 * Contributor(s): Andrea Turbati
 */
public class CreateClass extends InterfaceServiceServlet{
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);
	private static int ERROR = 0;
	
	public CreateClass(String id){
		this.id = id;
	}
	
	public int getErrorStatus() {
		return ERROR;
	}
	/**Metodo che si occupa di creare di una nuova classe nell'ontologia di base e restituisce l'elemento 
	 * xml relativo a questa operazione
	 *@return Document  */
	
	public Document XMLData() {													
		String superClassName = _oReq.getParameter("superClassName");
		//String superClassNameEncoded = ServletUtilities.encodeLabel(superClassName);
		String newClassName = _oReq.getParameter("newClassName");
        //String newClassNameEncoded = ServletUtilities.encodeLabel(newClassName);
		this.fireServletEvent();	
		return createClass(newClassName, superClassName);
	}

    
    /**Metodo che si occupa di creare di una nuova classe nell'ontologia di base e restituisce l'elemento 
     * xml relativo a questa operazione
     *@return Document  */
    public Document createClass(String newClassQName, String superClassQName) {
    	ServletUtilities servletUtilities = new ServletUtilities();
    	s_logger.debug("willing to create class: " + newClassQName + " as subClassOf: " + superClassQName);
    	ARTRepository repository = Resources.getRepository();
    	String superClassURI = repository.expandQName(superClassQName);
    	s_logger.debug("superClassQName: " + superClassQName + " expanded in: " + superClassURI);
    	String newClassURI = repository.expandQName(newClassQName);
        ARTResource res = repository.getSTClass(newClassURI);        
		if (res != null) {
			ERROR = 1;
			s_logger.error("there is a class with the same name!");
			return servletUtilities.documentError("there is a class with the same name!");
		}
        ARTResource superClassResource = repository.getSTClass(superClassURI);
		s_logger.debug("trying to create class: " + newClassURI + " as subClassOf: " + superClassResource);
        repository.addSTSubClass(newClassURI, superClassResource);
		
        /*
		try {
			repository.writeRDF();
		} catch (Exception e) {				
			s_logger.error(e);
		}
		*/
		
		int error = this.getErrorStatus();
		if (error == 1) {
			//TODO mi sembra che si possa rimuovere questo bislacco tentativo di gestione degli errori!
			s_logger.error("error status 1");
			return null;
		}
		String clsName = servletUtilities.decodeLabel(superClassQName); 
		String subClsName = servletUtilities.decodeLabel(newClassQName); 
		repository = Resources.getRepository();		
		Document xml = new DocumentImpl();
		Element treeElement = xml.createElement("Tree");
		treeElement.setAttribute("type", "create_cls");
		Element clsElement = XMLHelp.newElement(treeElement,"Class");									
		clsElement.setAttribute("clsName", clsName);				
		Element subClsElement = XMLHelp.newElement(treeElement,"SubClass");
		subClsElement.setAttribute("SubClassName", subClsName);
		xml.appendChild(treeElement);	
		return xml;				
	}

	@Override
	public CXSL CXSLFactory() {
		// TODO Auto-generated method stub
		return null;
	}
}
