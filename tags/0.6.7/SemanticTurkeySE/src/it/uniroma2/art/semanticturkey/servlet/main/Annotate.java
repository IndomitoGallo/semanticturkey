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

import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.plugin.extpts.InterfaceServiceServlet;
import it.uniroma2.art.semanticturkey.repository.utilities.STResourceComparator;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Iterator;

import javax.xml.transform.TransformerConfigurationException;

import org.apache.xerces.dom.DocumentImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**!!!!Questa classe non è utilizzata una chiamata si trova in BrowserOverlay ma è commentata (matita)!!!!*/
/**
 * @author Donato Griesi
 * Contributor(s): Andrea Turbati
 */
public class Annotate extends InterfaceServiceServlet{
	public String XSLpath = Resources.getXSLDirectoryPath() + "annotation.xsl";
	
	public Annotate(String id){
		this.id = id;
	}
	
	public CXSL CXSLFactory() {
		CXSL XSL = null;
		try {
			XSL = new CXSL(XSLpath);
		} catch (TransformerConfigurationException e) {				
			e.printStackTrace();
		}		
		XSL.setParam("document" , _oReq.getParameter("document"));
		XSL.setParam("selection" , _oReq.getParameter("selection"));
		return XSL;
	}
    
    
    public Document XMLData() {
        Collection<ARTResource> list = getSortedClasses();
        Document xml = new DocumentImpl();
        Element data = xml.createElement("Data");
        Element classes = XMLHelp.newElement(data,"Classes");            
        Iterator<ARTResource> it = list.iterator();      
        while (it.hasNext()) {          
            Element classElement = XMLHelp.newElement(classes,"Class");
            ARTResource res = it.next();           
            Element URIElement = XMLHelp.newElement(classElement,"URI");
            XMLHelp.newElement(URIElement,"Value", res.getURI());           
            XMLHelp.newElement(URIElement,"LocalName", res.getLocalName());
        }   
        xml.appendChild(data);
        this.fireServletEvent();
        return xml;
    }
    
    public Collection<ARTResource> getSortedClasses() {
        ARTRepository repository = Resources.getRepository();
        Collection<ARTResource> resources = repository.getSTNamedClasses();
        ArrayList<ARTResource> list = new ArrayList<ARTResource>(resources);
        Collections.sort(list, new STResourceComparator());
        return list;
    }
}
