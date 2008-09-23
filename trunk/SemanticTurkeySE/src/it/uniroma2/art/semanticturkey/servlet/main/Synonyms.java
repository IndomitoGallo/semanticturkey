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

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.Collection;
import java.util.Iterator;

import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.plugin.extpts.InterfaceServiceServlet;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.ontapi.ARTNode;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.vocabulary.RDFS;
import it.uniroma2.art.ontapi.vocabulary.XmlSchema;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
/**!!!!Questa classe non viene mai usata lavora sul repository per cui potrebbe essere la parte di codice 
 * che permette di gestire il sinonimo di una risorsa.Per esempio effettuare la ricerca
 * anche sui sinonimi!!!*/
/**
 * @author Donato Griesi
 * Contributor(s): Andrea Turbati
 */
public class Synonyms extends InterfaceServiceServlet{
	@SuppressWarnings("unused")
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	
	
	public Synonyms(String id){
		this.id = id;
	}
	
	public Document XMLData() {													
		String xml = new String("");
		ServletUtilities servletUtilities = new ServletUtilities();
		
		BufferedReader reader = null;
		try {	
			reader = _oReq.getReader();
		} catch (IOException e) {
			
			e.printStackTrace();
		}	//TODO never, never ignore exceptions in this way!!!
		
		String line = null;
		try {
			while ((line = reader.readLine()) != null) {
				xml = xml.concat(line);
			}
		} catch (IOException e) {
		
			e.printStackTrace();
		}	//TODO never, never ignore exceptions in this way!!!
		
		  DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		  Document doc = null;
		  try {
			doc = factory.newDocumentBuilder().parse(
			      new InputSource(new StringReader(xml)));
		} catch (SAXException e) {			
			e.printStackTrace();
		} catch (IOException e) {			
			e.printStackTrace();
		} catch (ParserConfigurationException e) {			
			e.printStackTrace();
		}	//TODO never, never ignore exceptions in this way!!!
		
		ARTRepository repository = Resources.getRepository();
		Document result = new DocumentImpl();
		String language = null;
		
		NodeList nodeList = doc.getElementsByTagName("OPTIONS");	
		if (nodeList.getLength() > 0) {
			Node node = nodeList.item(0);
			NamedNodeMap namedNodeMap = node.getAttributes();
			language =namedNodeMap.getNamedItem("language").getNodeValue();						
		}		
		
		Element root = result.createElement("Root");
		nodeList = doc.getElementsByTagName("TERM");		
		for (int i = 0; i < nodeList.getLength(); i++) {
			Node node = nodeList.item(i);
			NamedNodeMap namedNodeMap = node.getAttributes();
			String value =namedNodeMap.getNamedItem("value").getNodeValue();						
			ARTResource cls = repository.getSTClass(repository.expandQName(servletUtilities.encodeLabel(value)));
			if (cls != null) {				
				Element concept = XMLHelp.newElement(root,"Concept");				
				concept.setAttribute("name", value);
				Collection<ARTNode> collection = repository.getSTObjectDatatype(cls, repository.createURIResource(RDFS.LABEL + " " + XmlSchema.LANGUAGE + "=\""+ language + "\""));				
				Iterator<ARTNode> it = collection.iterator();
				while (it.hasNext()) {
					Element synonym  = XMLHelp.newElement(concept,"Synonym");
					synonym.setAttribute("name", it.next().toString());					
				}
				Collection<ARTResource> list = repository.getDirectSubclasses(cls);				
				for (ARTResource subCls : list ) {					
					Element subconcept = XMLHelp.newElement(concept,"SubConcept");
					subconcept.setAttribute("name", servletUtilities.decodeLabel(subCls.getLocalName()));				
					collection = repository.getSTObjectDatatype(subCls, repository.createURIResource(RDFS.LABEL + " " + XmlSchema.LANGUAGE + "=\""+ language + "\""));
					it = collection.iterator();
					while (it.hasNext()) {
						Element synonym  = XMLHelp.newElement(subconcept,"Synonym");
						synonym.setAttribute("name", it.next().toString());					
					}
				}
			}
		}
		result.appendChild(root);	
		this.fireServletEvent();
		return result;
	}


	@Override
	public CXSL CXSLFactory() {
		// TODO Auto-generated method stub
		return null;
	}	
}
