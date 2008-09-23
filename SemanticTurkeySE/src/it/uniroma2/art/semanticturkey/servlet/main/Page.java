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
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;
import it.uniroma2.art.ontapi.ARTNode;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;

import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;

import org.w3c.dom.Document;
import org.w3c.dom.Element;


/**Classe che si occupa di trovare tutte le WebPAge correlate con l'istanza*/
/**
 * @author Donato Griesi, Armando Stellato
 * Contributor(s): Andrea Turbati 
 */
public class Page extends InterfaceServiceServlet{
	private String instanceNameString = "instanceName";
	public String XSLpath = Resources.getXSLDirectoryPath() + "urlPage.xsl";
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class); 
	
	public Page(String id){
		this.id = id;
	}
	
	/**Metodo che si occupa di trovare tutte le WebPage correlate con l'istanza e fornisce il relativo elemento xml
	 *@return Document xml */
	public Document XMLData() {						
		String instanceQName = _oReq.getParameter(instanceNameString);
		this.fireServletEvent();
		return getAnnotatedPagesForInstance(instanceQName);
	}

	public Document getAnnotatedPagesForInstance(String instanceQName) {
		
		Document xml = new DocumentImpl();	
		Element urls = xml.createElement("Tree");
		urls.setAttribute("type", "webPage");
	
		ARTRepository repository = Resources.getRepository();		
		ARTResource instanceRes = repository.getSTResource(repository.expandQName(instanceQName));
		s_logger.debug("instanceRes: " + instanceRes);
		Iterator<ARTNode> semanticAnnotationInstancesIterator = repository.listSTObjectPropertyValues(instanceRes, SemAnnotVocab.Res.annotation);				
		Set<String> set = new HashSet<String>();
		while (semanticAnnotationInstancesIterator.hasNext()) {
			ARTResource semanticAnnotationRes = semanticAnnotationInstancesIterator.next().asResource();			
			Iterator<ARTNode> webPageInstancesIterator = repository.listSTObjectPropertyValues(semanticAnnotationRes, SemAnnotVocab.Res.location);			
			while (webPageInstancesIterator.hasNext()) {
				ARTResource webPageInstance = webPageInstancesIterator.next().asResource();			
								
				Collection<ARTNode> urlPageCollection = repository.getSTObjectDatatype(webPageInstance, SemAnnotVocab.Res.url);
				Iterator<ARTNode> urlPageIterator = urlPageCollection.iterator();
				ARTNode urlPageValue = null;
				while (urlPageIterator.hasNext()) {
					urlPageValue = urlPageIterator.next();
				}				
				String urlPage = urlPageValue.toString();				
				
				if (!set.add(urlPage))
					continue;				
				
				Collection<ARTNode> titleCollection = repository.getSTObjectDatatype(webPageInstance, SemAnnotVocab.Res.title);
				Iterator<ARTNode> titleIterator =  titleCollection .iterator();
				ARTNode titleValue = null;
				while (titleIterator.hasNext()) {
					titleValue = titleIterator.next();
				}												
				String  title = titleValue.toString();				
				//NScarpato
				//Element url = xml.createElement("URL");				
				Element url=XMLHelp.newElement(urls, "URL");
				urlPage = urlPage.replace("%3A", ":");
				urlPage = urlPage.replace("%2F", "/");
				url.setAttribute("value", urlPage);
				s_logger.debug("value "+urlPage);
				url.setAttribute("title", title);
				s_logger.debug("title "+title);																
			}			
		}
		xml.appendChild(urls);		
		s_logger.debug("xml urlPage "+XMLHelp.XML2String(xml, true));
		return xml;
	}


	@Override
	public CXSL CXSLFactory() {
		// TODO Auto-generated method stub
		return null;
	}
	
}
	
