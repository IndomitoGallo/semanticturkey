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

import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.plugin.extpts.InterfaceServiceServlet;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.exceptions.RepositoryUpdateException;

import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**Classe che si occupa di rinominare le classi dell'ontologia*/
/**
 * @author Armando Stellato
 * Contributor(s): Andrea Turbati
 */
public class ModifyName extends InterfaceServiceServlet{
	@SuppressWarnings("unused")
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	
	public String XSLpath = Resources.getXSLDirectoryPath() + "createClassForm.xsl";

	public ModifyName(String id){
		this.id = id;
	}
	
	/**Metodo che si occupa di rinominare le classi dell'ontologia
	 *@return Document xml */
	public Document XMLData() {	
		ServletUtilities servletUtilities = new ServletUtilities();
		String qname = _oReq.getParameter("name");
		String newQname = _oReq.getParameter("newName");
        try {
            changeResourceName(qname, newQname);
        } catch (RepositoryUpdateException e) {
            return servletUtilities.documentError(e.getMessage());
        }
		
		Document xml = new DocumentImpl();
		Element treeElement = xml.createElement("Tree");
		treeElement.setAttribute("type", "update_modify");
		Element element = XMLHelp.newElement(treeElement,"UpdateResource");
		element.setAttribute("name", _oReq.getParameter("name"));
		element.setAttribute("newname", _oReq.getParameter("newName"));
		xml.appendChild(treeElement);
		this.fireServletEvent();
		return xml;		
	}
    
    
    public void changeResourceName(String qName, String newQName) throws /*DuplicatedResourceException,*/ RepositoryUpdateException {
        ARTRepository repository = Resources.getRepository();

        //CHECK OVER DUPLICATES, it should be already implemented in ontology api
/*      STResource resource = repository.getSTClass(newName);
        if (resource != null) {
            throw new DuplicatedResourceException("duplicate resource error: there is a resource with the same name!");
        }
*/       
        ARTResource res = repository.getSTClass(repository.expandQName(qName));
        if (res==null)
            res = repository.getSTResource(repository.expandQName(qName));
        repository.renameIndividual(res, repository.expandQName(newQName));
    }
	@Override
	public CXSL CXSLFactory() {
		// TODO Auto-generated method stub
		return null;
	}
    
}
