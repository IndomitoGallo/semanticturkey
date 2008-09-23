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

import java.util.HashSet;
import java.util.Set;

import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.plugin.extpts.InterfaceServiceServlet;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;
import it.uniroma2.art.ontapi.ARTNode;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.ARTStatement;
import it.uniroma2.art.ontapi.ARTStatementIterator;
import it.uniroma2.art.ontapi.RepositoryUtilities;
import it.uniroma2.art.ontapi.exceptions.RepositoryUpdateException;
import it.uniroma2.art.ontapi.utilities.DeletePropagationPropertyTree;


import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**Classe che si occupa della cancellazione di classi o istanze dell'ontologia
 * si possono cancellare solo classi e istanze che non appartengono alla Domain ontology*/
/**
 * @author Donato Griesi, Armando Stellato
 * Contributor(s): Andrea Turbati
 */
public class Delete extends InterfaceServiceServlet{
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	
	private static DeletePropagationPropertyTree deletePropertyPropagationTree;

	public Delete(String id){
		this.id = id;
	}
	
	private void initializeDeletePropertyPropagationTree() {
		deletePropertyPropagationTree = new DeletePropagationPropertyTree();
		deletePropertyPropagationTree.addChild(SemAnnotVocab.Res.annotation).addChild(SemAnnotVocab.Res.location);
	}
	
	/**Metodo che si occupa della creazione dell'elemento xml relativo alla cancellazione di classi o istanze dell'ontologia
	 * si possono cancellare solo classi e istanze che non appartengono alla Domain ontology
	 *@return Document xml */
	public Document XMLData() {				
		String name = _oReq.getParameter("name");
		String type = _oReq.getParameter("type");
		this.fireServletEvent();
		return deleteResource(name, type);
	}

    
	public Document deleteResource(String qname, String type) {
		ServletUtilities servletUtilities = new ServletUtilities();
        String encodedQName = servletUtilities.encodeLabel(qname);
        ARTRepository repository = Resources.getRepository();
        ARTResource resource = repository.getSTResource(repository.expandQName(encodedQName));
        if (resource==null)
            return servletUtilities.documentError("client/server inconsistency error: there is no resource corresponding to: " + qname + " in the repository!");
        s_logger.debug("deleting " + type + ": " + qname);
        
        try {
	        if ( type.equals("Class") )				//for class the previous instruction implies that the class has no subclasses nor direct instances (otherwise, a rewire of lost ISA connections is necessary)
				deleteClass(resource, repository);
			if ( type.equals("Instance") )
				deleteInstance(resource, repository);
			if ( type.equals("Property") )	{		//for property the removal of incoming edges instruction implies that it has no subproperties (otherwise, a rewire of lost ISA connections is necessary)
				if (checkPropertyDeleatability(resource, repository))
					deleteProperty(resource, repository);
				else return servletUtilities.documentError("cannot delete property, there are triples in the ontology using this property!");
			}
			else servletUtilities.documentError("client declared an unknown type: " + type + "for the resource to be deleted!");
        } catch (RepositoryUpdateException e) {
        	return servletUtilities.documentError("problems in deleting resource " + qname + " from the repository.\n" + Utilities.printStackTrace(e));
        }
		
        //XML RESPONSE PREPARATION
        Document xml = new DocumentImpl();
        Element treeElement = xml.createElement("Tree");
        treeElement.setAttribute("type", "update_delete");
        Element element = XMLHelp.newElement(treeElement,"Resource");                                   
        element.setAttribute("name", qname);
        element.setAttribute("type", type);
        xml.appendChild(treeElement);
        return xml;
		
	}
	
    
    public void deleteClass(ARTResource cls, ARTRepository repository) throws RepositoryUpdateException {

   		repository.deleteSTStatements(null, null, cls);						// 1) removes all the incoming edges  //beware! only applicable if the application has already checked that the class has no subclasses nor instances!, otherwise some rewiring of lost semantic connections (ISA and instanceof) is necessary!
    	//TODO there should be no need of traversal propagation, otherwise report cases where it is needed
    	//in the meanwhile, i just delete outcoming edges from class
    	repository.deleteSTStatements(cls, null, null);						
    }
    
     
    /**
     * 
     * @param resource
     * @param repository
     * @throws RepositoryUpdateException 
     */
    public void deleteInstance(ARTResource resource, ARTRepository repository) throws RepositoryUpdateException {
    	if (deletePropertyPropagationTree==null)
    		initializeDeletePropertyPropagationTree();
    	RepositoryUtilities.deepDeleteIndividual(resource, repository, deletePropertyPropagationTree);
    }

    
    /**
     * a property is deletable only if there are no direct statements which bind resources through it
     * @param property
     * @param repository
     * @return
     */
    public boolean checkPropertyDeleatability(ARTResource property, ARTRepository repository) {
   		ARTStatementIterator stit = repository.getStatements(null, property, null);
   		return !stit.hasNext();
    }
    
    public void deleteProperty(ARTResource property, ARTRepository repository) throws RepositoryUpdateException {
    	repository.deleteSTStatements(null, null, property);						// 1) removes all the incoming edges  //beware! only applicable if the application has already checked that the class has no subclasses nor instances!, otherwise some rewiring of lost semantic connections (ISA and instanceof) is necessary!
    	repository.deleteSTStatements(null, property, null);						
    	//TODO there should be no need of traversal propagation, otherwise report cases where it is needed
    	//in the meanwhile, i just delete outcoming edges from class
    	repository.deleteSTStatements(property, null, null);		 
    }



	@Override
	public CXSL CXSLFactory() {
		// TODO Auto-generated method stub
		return null;
	}

	/**
	 * @return the deletePropertyPropagationTree
	 */
	static DeletePropagationPropertyTree getDeletePropertyPropagationTree() {
		return deletePropertyPropagationTree;
	}

	/**
	 * @param deletePropertyPropagationTree the deletePropertyPropagationTree to set
	 */
	static void setDeletePropertyPropagationTree(DeletePropagationPropertyTree deletePropertyPropagationTree) {
		Delete.deletePropertyPropagationTree = deletePropertyPropagationTree;
	}
    


}
