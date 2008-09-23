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
//import it.uniroma2.art.ontapi.exceptions.RepositoryUpdateException;
//import it.uniroma2.art.semanticturkey.resources.Resources;

//import java.util.logging.Logger;

//import org.apache.log4j.Logger;
//import org.apache.xerces.dom.DocumentImpl;
import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.plugin.extpts.InterfaceServiceServlet;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.exceptions.RepositoryUpdateException;

import org.apache.log4j.Logger;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.sun.org.apache.xerces.internal.dom.DocumentImpl;

/**Classe che permette di dare dei sinonimi ai nomi delle classi legati alla lingua (inglese italiano)
 * !!!!ma non sembra che questi siano poi coniderati nella ricerca su classi i sinonimi dovrebbero essere considerati nell'ontologySearch!!!!*/
/**
 * @author Donato Griesi
 * Contributor(s): Andrea Turbati
 */
public class AddSynonym extends InterfaceServiceServlet{
	@SuppressWarnings("unused")
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	
	public String XSLpath = Resources.getXSLDirectoryPath() + "createClassForm.xsl";

	/**Funzione che permette di dare dei sinonimi ai nomi delle classi legati alla lingua (inglese italiano)
	 * !!!!ma non sembra che questi siano poi coniderati nella ricerca su classi i sinonimi dovrebbero essere considerati nell'ontologySearch!!!!*/

	public AddSynonym(String id){
		this.id = id;
	}
	
	public Document XMLData() {	
		ServletUtilities servletUtilities = new ServletUtilities();
		String encodedName = servletUtilities.encodeLabel(_oReq.getParameter("name"));
		String synonym = servletUtilities.encodeLabel(_oReq.getParameter("synonym"));
		String language = _oReq.getParameter("language");
		addSynonym(encodedName, synonym, language);		
		Document xml = new DocumentImpl();
		Element tree = xml.createElement("Tree");
		tree.setAttribute("type","Ack");
		xml.appendChild(tree);
		s_logger.debug("AddSynonim "+xml.toString());
		fireServletEvent();
		return xml;
	}
    
	public void addSynonym(String classQName, String synonym, String language) {
        ARTRepository repository = Resources.getRepository();        
        ARTResource cls = repository.getSTClass(repository.expandQName(classQName));
        ServletUtilities servletUtilities = new ServletUtilities();
        try {
			repository.addLabel(cls, synonym, language);
		} catch (RepositoryUpdateException e) {
			e.printStackTrace();
			s_logger.error("problems in adding label: " + e.getMessage(), e);
			servletUtilities.documentError("problems in adding label: " + e.getMessage());
		}       
    }

	@Override
	public CXSL CXSLFactory() {
		// TODO Auto-generated method stub
		return null;
	}

	
    
    
}
