 /*
  * The contents of this file are subject to the Mozilla Public License
  * Version 1.1 (the "License");  you may not use this file except in compliance
  * with the License.  You may obtain a copy of the License at
  * http://www.mozilla.org/MPL/
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

package it.uniroma2.art.semanticturkey.servlet;

import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.repository.STRepositoryManager;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;
import it.uniroma2.art.ontapi.ARTNode;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.ARTStatement;
import it.uniroma2.art.ontapi.ARTStatementIterator;
import it.uniroma2.art.ontapi.vocabulary.RDF;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.UUID;


import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;

import org.w3c.dom.Document;
import org.w3c.dom.Element;


/**Classe che contiene le utilities per le servlet, oltre ad alcuni metodi di supporto la maggior parte dei metodi
 * dichiarati aggiungono elementi xml al documento che costituiscono le risposte alle servlet invocate da client*/
/**
 * @author Donato Griesi
 * Contributor(s): Andrea Turbati
 */
public class ServletUtilities {	
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);
  	static final private ServletUtilities service;
	
	static {
	    service = new ServletUtilities();
	}
   
	public static ServletUtilities getService() {
	    return service;
	}
	
    /**Crea la lista delle Istanze
	 * TODO storage independent
	 * @param SesameARTRepositoryImpl repository 
	 * @param String clsName
	 * @param Element element: elemento xml padre delle istanze*/
	void createInstancesXMLList(ARTRepository repository, ARTResource cls, Element element) {		
        Iterator<ARTResource> IteratorInstances = repository.getDirectInstances(cls).iterator();				
		Element instances = XMLHelp.newElement(element, "Instances");
		while (IteratorInstances.hasNext()) { 
			ARTResource instance = (ARTResource)IteratorInstances.next();									
			Element instanceElement = XMLHelp.newElement(instances, "Instance");			
			if (instance.isNamedResource()){
				instanceElement.setAttribute("name", this.decodeLabel(instance.getLocalName()));
			}			
		}
	}	
    
	/**Crea il grafico inserendo ricorsivamente la lista di archi e nodi in due strutture Element 
	 * @param SesameARTRepositoryImpl repository
	 * @param String id
	 * @param Map map
	 * @param Set set
	 * @param Resource resource
	 * @param Element nodeset: lista dei nodi del grafo
	 * @param Element edgeset: lista degli archi del grafo*/
    public void createXMLGraph(ARTRepository repository, ARTResource cls,Map<String, String> map, String id,Set<String> set, Element nodeset, Element edgeset) {      
    	Iterator<ARTResource> subClassesIterator = repository.getDirectSubclasses(cls).iterator(); 
 	    Iterator<ARTResource> instancesIterator = repository.getDirectInstances(cls).iterator();	
 	    

        while (subClassesIterator.hasNext()) { 
        	ARTResource subClass = subClassesIterator.next();    
        	String classID = createXMLElementClassGraph(repository.getQName(subClass.getURI()),id,set,nodeset,edgeset);    
        	createXMLGraph(repository, subClass,map, classID,set,nodeset,edgeset);   
        }
		while (instancesIterator.hasNext()) { 
			ARTResource instance = instancesIterator.next();		

			createXMLElementIstanceGraph(repository,instance, map, set,id,nodeset,edgeset);
			/*//FRA repository.getQName(istance.getURI()) Francesca Fallucchi
			 STStatementIterator stit = repository.getStatements(instance, null, null);
 	        while (stit.hasNext()) {
 	        	STStatement st = stit.next();
 	        	STResource valuedProperty = st.getPredicate();

 	        	if(repository.isObjectProperty(valuedProperty)){
	    	        //FRA propertyName WorksInCompany    
 	        	String propertyName = repository.getQName( valuedProperty.getURI());
 	        	//FRA ranges Organization
 	        	Iterator<STResource> ranges = repository.getPropertyRanges(valuedProperty);
 	        	//FRA valueProperty Univertity
 	        	String valueProperty = repository.getQName( st.getObject().toString() );
 	 	        	}
 	        	}*/
 			}     
    }	
    
    public void createXMLRootElementGraph(String id, Element nodeset){
    	Element node  = XMLHelp.newElement(nodeset, "NODE");
		node.setAttribute("nodeID", "AutoID " + id);

		Element node_location = XMLHelp.newElement(node, "NODE_LOCATION");
		node_location.setAttribute("x", "384");
		node_location.setAttribute("y", "70");
		node_location.setAttribute("visible", "true");
		
		
		Element node_label = XMLHelp.newElement(node, "NODE_LABEL");
		node_label.setAttribute("label", null);			
		node_label.setAttribute("classIcon","http://127.0.0.1:1979/semantic_turkey/resources/applet/turkeyCircle.gif");

    }
   
    public String createXMLElementClassGraph(String cls, String id,Set<String> set, Element nodeset, Element edgeset){

    	Element node = XMLHelp.newElement(nodeset, "NODE");
		UUID uuid = null;
		do {
			uuid = UUID.randomUUID();
		}
		while (set.add(uuid.toString()) == false);
		
		String classID = uuid.toString();
		
		node.setAttribute("nodeID", "AutoID " + uuid.toString());
		
		Element node_location = XMLHelp.newElement(node, "NODE_LOCATION");
		node_location.setAttribute("x", "384");
		node_location.setAttribute("y", "70");
		node_location.setAttribute("visible", "true");
		
		
		Element node_label = XMLHelp.newElement(node, "NODE_LABEL");
		node_label.setAttribute("label", cls);			
		node_label.setAttribute("shape", "4");
		node_label.setAttribute("backColor", "cc9f2a");
		node_label.setAttribute("textColor", "000000");
		node_label.setAttribute("fontSize", "15");
		node_label.setAttribute("font", "Times");
		node_label.setAttribute("fontStyle", "1");
		node_label.setAttribute("imageURL",null);
		node_label.setAttribute("classIcon","http://127.0.0.1:1979/semantic_turkey/resources/applet/turkeyCircle.gif");
	
		Element node_url = XMLHelp.newElement(node, "NODE_URL");			
		node_url.setAttribute("url", "");
		node_url.setAttribute("urlIsLocal", "false");
		node_url.setAttribute("urlIsXML", "false"); 
		
		Element node_hint = XMLHelp.newElement(node, "NODE_HINT");
		node_hint.setAttribute("hint", "");
		node_hint.setAttribute("width", "150");
		node_hint.setAttribute("height", "-1");
		node_hint.setAttribute("isHTML", "true");
					
		Element edge = XMLHelp.newElement(edgeset, "EDGE");
		edge.setAttribute("fromID", "AutoID " + id);						
		edge.setAttribute("toID",  "AutoID " + classID );			
		edge.setAttribute("type",  "1");
		edge.setAttribute("length",  "30");
		edge.setAttribute("visible",  "true");
		edge.setAttribute("color",  "A0A0A0"); 

		return classID;
	}
    void createXMLElementIstanceGraph(ARTRepository repository,ARTResource instance, Map<String, String> map, Set<String> set, String id,Element nodeset,Element edgeset){
		Element node = XMLHelp.newElement(nodeset, "NODE");
		UUID uuid = null;
		do {
			uuid = UUID.randomUUID();
		}
		while (set.add(uuid.toString()) == false);
		
		map.put(repository.getQName(instance.getURI()), uuid.toString());
		
		node.setAttribute("nodeID", "AutoID " + uuid.toString());
		Element node_location = XMLHelp.newElement(node, "NODE_LOCATION");
		node_location.setAttribute("x", "384");
		node_location.setAttribute("y", "70");
		node_location.setAttribute("visible", "true");
		
		
		Element node_label = XMLHelp.newElement(node, "NODE_LABEL");
		node_label.setAttribute("label", repository.getQName(instance.getURI()));			
		node_label.setAttribute("shape", "2");
		node_label.setAttribute("backColor", "531852");
		node_label.setAttribute("textColor", "FFFFFF");
		node_label.setAttribute("fontSize", "14");
		node_label.setAttribute("font", "Comics");
		node_label.setAttribute("fontStyle", "2");
		node_label.setAttribute("imageURL",null);
	//	node_label.setAttribute("iconPath",null);
		
		Element node_url = XMLHelp.newElement(node, "NODE_URL");			
		node_url.setAttribute("url", "");
		node_url.setAttribute("urlIsLocal", "false");
		node_url.setAttribute("urlIsXML", "false"); 
		
		Element node_hint = XMLHelp.newElement(node, "NODE_HINT");
					
		Collection collection = this.getUrlPageTitle(repository, instance);
		Iterator it = collection.iterator();
		String hintDescription = new String("Urls:\n");
		while (it.hasNext()) {
			String[] strings = (String[])it.next();								
			hintDescription = hintDescription.concat("<a href=\"" + strings[0] +"\">" + strings[1] + "</a>\n");
		}			
		node_hint.setAttribute("hint", hintDescription);
		node_hint.setAttribute("width", "200");
		node_hint.setAttribute("height", "-1");
		node_hint.setAttribute("isHTML", "true");
		
		Element edge = XMLHelp.newElement(edgeset, "EDGE");
		edge.setAttribute("fromID", "AutoID " + id);						
		edge.setAttribute("toID",  "AutoID " + uuid.toString());			
		edge.setAttribute("type",  "1");
		edge.setAttribute("length",  "50");
		edge.setAttribute("visible",  "true");
		edge.setAttribute("color",  "A0A0A0");	
		
	}
   
	public void createXMLElementPropertyGraph(ARTRepository repository, Map<String, String> map, Set<String> set, Element nodeset, Element edgeset) {				
		Set<String> entrySet = map.keySet();
		Iterator<String> it = entrySet.iterator();		
		while (it.hasNext()) {
			String instanceQName = (String)it.next();									
			String id = (String) map.get(instanceQName);						
			Map propertyMap = this.getInstanceProperties(repository, repository.getSTResource(repository.expandQName(instanceQName))); 
			Set propertyMapEntrySet = propertyMap.keySet();
			Iterator it2 = propertyMapEntrySet.iterator();			
			while (it2.hasNext()) {								
				String propertyName = (String) it2.next();
				s_logger.debug("propertyName = "+propertyName);
				UUID uuid = null;
				do {
					uuid = UUID.randomUUID();
				}
				while (set.add(uuid.toString()) == false);
												
				Collection collection = (Collection)propertyMap.get(propertyName);
				Iterator it3 = collection.iterator();
				String id2 = null;
				int i = 0;
				while (it3.hasNext()) {
					id2 = (String) map.get(it3.next());		
					s_logger.debug("id2 = "+id2);
					if (id2 != null)
						break;
					i++;
				}
				if (i == collection.size()) {					
					continue;
				}
																	
				Element node = XMLHelp.newElement(nodeset, "NODE");
				node.setAttribute("nodeID", "AutoID " + uuid.toString());
			
				Element node_location = XMLHelp.newElement(node, "NODE_LOCATION");
				node_location.setAttribute("x", "384");
				node_location.setAttribute("y", "70");
				node_location.setAttribute("visible", "true");
			
			
				Element node_label = XMLHelp.newElement(node, "NODE_LABEL");
				node_label.setAttribute("label", propertyName);			
				node_label.setAttribute("shape", "1");
				node_label.setAttribute("backColor", "2977a7");
				node_label.setAttribute("textColor", "FFFFFF");
				node_label.setAttribute("fontSize", "14");
				node_label.setAttribute("font", "Arial");
				node_label.setAttribute("fontStyle", "2");
				node_label.setAttribute("imageURL",null);
			//	node_label.setAttribute("iconPath",null);

			
				Element node_url = XMLHelp.newElement(node, "NODE_URL");			
				node_url.setAttribute("url", "");
				node_url.setAttribute("urlIsLocal", "false");
				node_url.setAttribute("urlIsXML", "false"); 
			
				Element node_hint = XMLHelp.newElement(node, "NODE_HINT");
				node_hint.setAttribute("hint", "");
				node_hint.setAttribute("width", "150");
				node_hint.setAttribute("height", "-1");
				node_hint.setAttribute("isHTML", "true");
								
				for (;;)  {																											
					Element edge = XMLHelp.newElement(edgeset, "EDGE");
					edge.setAttribute("fromID", "AutoID " + id);						
					edge.setAttribute("toID",  "AutoID " + uuid.toString());			
					edge.setAttribute("type",  "1");
					edge.setAttribute("length",  "30");
					edge.setAttribute("visible",  "true");
					edge.setAttribute("color",  "A0A0A0");
				
					edge = XMLHelp.newElement(edgeset, "EDGE");
					edge.setAttribute("fromID", "AutoID " + uuid.toString());						
					edge.setAttribute("toID",  "AutoID " + id2);			
					edge.setAttribute("type",  "1");
					edge.setAttribute("length",  "30");
					edge.setAttribute("visible",  "true");
					edge.setAttribute("color",  "A0A0A0");
					if (it3.hasNext()) {
						id2 = (String) map.get(it3.next());
						if (id2 == null)
							continue;
					}
					else break;
				}				
			}						
		}
	}
	
    public void setXMLParametersGraph(Element touchgraph){
    	Element parameters  = XMLHelp.newElement(touchgraph, "PARAMETERS");
		Element param  = XMLHelp.newElement(parameters, "PARAM");
		param.setAttribute("name", "offsetX");
		param.setAttribute("value", "627");
		
		param  = XMLHelp.newElement(parameters, "PARAM");
		param.setAttribute("name", "rotateSB");
		param.setAttribute("value", "0");
		
		param  = XMLHelp.newElement(parameters, "PARAM");
		param.setAttribute("name", "zoomSB");
		param.setAttribute("value", "-7");
		
		param  = XMLHelp.newElement(parameters, "PARAM");
		param.setAttribute("name", "offsetY");
		param.setAttribute("value", "19");
										
    }
    
	/**Prende il link associato all'istanza
	 *@param SesameARTRepositoryImpl repository
	 *@param Resource instanceRes */
	Collection<String[]> getUrlPageTitle(ARTRepository repository, ARTResource instanceRes) {					
		ArrayList<String[]> list = new ArrayList<String[]>();
		Iterator<ARTNode> semanticAnnotationInstancesIterator = repository.listSTObjectPropertyValues(instanceRes, SemAnnotVocab.Res.annotation); //TODO put in specific object all application ontology objects!!!						
        Set<String> set = new HashSet<String>();
		while (semanticAnnotationInstancesIterator.hasNext()) {			
			ARTResource semanticAnnotationRes = semanticAnnotationInstancesIterator.next().asResource();			
			Iterator<ARTNode> webPageInstancesIterator = repository.listSTObjectPropertyValues(semanticAnnotationRes, SemAnnotVocab.Res.location);			
			while (webPageInstancesIterator.hasNext()) {
				String[] strings = new String[2];
				ARTResource webPageInstance = webPageInstancesIterator.next().asResource();			
				Iterator<ARTNode> urlPageIterator = repository.getSTObjectDatatype(webPageInstance, SemAnnotVocab.Res.url).iterator();
                ARTNode urlPageValue = null;
				while (urlPageIterator.hasNext()) { //TODO che fa? lo esaurisce e poi prende solo l'ultimo valore? mica avrà pensato che sono sempre nello stesso ordine?
					urlPageValue = urlPageIterator.next();
				}				
				String  urlPage = urlPageValue.toString();								
				if (!set.add(urlPage))
					continue;				
                Iterator<ARTNode> titleIterator = repository.getSTObjectDatatype(webPageInstance, SemAnnotVocab.Res.title).iterator();
                ARTNode titleValue = null;
				while (titleIterator.hasNext()) {
					titleValue = titleIterator.next();
				}												
				String  title = titleValue.toString();																				
				urlPage = urlPage.replace("%3A", ":");
				urlPage = urlPage.replace("%2F", "/");								
				strings[0] = urlPage;
				strings[1] = title;
				list.add(strings);
			}			
		}
		return list;
	}

    /*
     * TODO rifare: alla fine è molto simile alle stesse selezioni che faccio su ALE (Linguistic Enrichment Of Ontologies)
     * devo stare attento perchè credo che anche qui, con una ontologia "reale", possano crearsi dei problemi (lui esclude solamente type e annotation e 
     * mappa sempre tutti in URI, ma cosa succede se escono fuori delle Intersection o altre strutture più complesse che non sono URI? teoricamente potrebbe succedere
     * devo mettere dei filtri migliori
     **/
	/**Carica le proprieta' relative all'istanza in una Map
	 *@param SesameARTRepositoryImpl repository
	 *@param Resource instance 
	 *@return Map map*/
	
	//FRA Deve essere ricontrollata
	Map getInstanceProperties(ARTRepository repository, ARTResource instance) {								
		Map<String, ArrayList<String>> map = new HashMap<String, ArrayList<String>>();
		ARTStatementIterator it = repository.getStatements(instance, null, null);
		
		while (it.hasNext()) {
			ARTStatement statement = it.next();
            ARTResource predicate = statement.getPredicate(); 
            s_logger.debug(repository.getQName(predicate.getURI()));
			if (repository.getQName(predicate.getURI()).equals(RDF.Res.TYPE) || repository.getQName(predicate.getURI()).equals(SemAnnotVocab.Res.annotation)) {				
				continue;
			}
			if (statement.getObject().isNamedResource()) {
				ArrayList<String> list = map.get(predicate.getURI()); //TODO qui ci va l'uri completa! questa è tutta da rifare come tutte le assertions fatte sulla base dei localname!
				if (list == null) {
					list = new ArrayList<String>();				
				}
				s_logger.debug("***"+statement.getObject().asResource().getLocalName());
				list.add(statement.getObject().asResource().getLocalName()); //TODO qui ci va l'uri completa! questa è tutta da rifare come tutte le assertions fatte sulla base dei localname!
				map.put(repository.getQName(predicate.getURI()), list);								
			}
			//FRA chissà perchè???
			//else {			
			//}			
		}
				
		return map;		
	}
    
	/**Ritorna una copia della stringa dopo aver tolto gli spazi bianchi
	 *!!!!perchÃ¨ non usa la funzione trim della classe String?!!!! 
	 *@param String s
	 *@return String t*/
	String trim(String s) {
        // pre: s!=null
        int ls;            // lunghezza di s
        int primo;         // indice del primo carattere non spazio di s
                           // (ls se s contiene solo spazi)
        int ultimo;        // indice dell'ultimo carattere non spazio di s
        String t;          // la stringa s senza spazi alle estremita'
        int i;             // indice per la scansione di s
        final char SPAZIO = ' ';   // il carattere spazio

        /* calcola la lunghezza di s */
        ls = s.length();

        /* calcola l'indice del primo carattere non spazio di s,
         * oppure ls se s contiene solo spazi bianchi */
        primo = 0;
        while (primo<ls && s.charAt(primo)<=SPAZIO)
            primo++;

        /* calcola l'indice dell'ultimo carattere non spazio di s,
         * oppure 0 se s contiene solo spazi bianchi */
        ultimo = ls-1;
        while (ultimo>=0 && s.charAt(ultimo)<=SPAZIO)
            ultimo--;

        /* calcola t */
        if (ls==0 || (primo==0 && ultimo==ls-1))
            /* se s e' la stringa vuota, o se non inizia ne' termina
             * per spazi bianchi, va restituita s */
            t = s;
        else /* s non e' vuota e inizia e/o termina per spazi bianchi */
             if (primo==ls)
             /* se e' non vuota ma composta solo da spazi bianchi */
            t = "";
        else {
            /* s non e' vuota e inizia e/o termina per spazi bianchi,
             * ma non e' composta solo da spazi bianchi,
             * va calcolata la sottostringa di s che contiene
             * i caratteri dalla posizione primo a ultimo (comprese) */
            t = "";
            for (i=primo; i<=ultimo; i++)
                t += s.charAt(i);
        }

        return t;
    }
	/**Sostituisce i caratteri : e / con i rispettivi codici ascii
	 *@param String label
	 *@return String label */
	public String encodeLabel(String label) {		
		label = trim(label);
		label = label.replace(":", "%3A");		
		label = label.replace("/", "%2F");
		return label;
	}
	/**Sostituisce i codici %3A %2F rispettivamente con : e /
	 *@param String label
	 *@return String label */
	public String decodeLabel(String label) {
		label = label.replace("%3A", ":");	
		label = label.replace("%2F", "/");
		return label;
	}
	

    /**Sostituisce i codici %3A %2F rispettivamente con : e /
     *@param String label
     *@return String label */
    public String removeInstNumberParentheses(String label) {
        int indexOfParenthesis = label.indexOf("(");
        if (indexOfParenthesis == -1)
            return label;
        else return label.substring(0, indexOfParenthesis);
    }

    
	/**Elimina il carattere % dalla stringa
	 *@param String string
	 *@return String string */
	String normalize(String string) {
		int index = string.lastIndexOf("%");
		if (index == -1)
			return string;
		else {			
			return string.substring(0, index-1);
		}
	}
	/**Restituisce l'elemento xml che contiene il messaggio di errore passato come parametro nel caso in cui le servlet non possano
	 * ritornare valori validi
	 *@param String value
	 *@return Document xml */
	public Document documentError(String value) {
		Document xml = new DocumentImpl();
		Element treeElement = xml.createElement("Tree");
		treeElement.setAttribute("type", "error");
		Element root = XMLHelp.newElement(treeElement,"Error");									
		root.setAttribute("value", value);				
		xml.appendChild(treeElement);					
		return xml;
	}	
    
    public boolean checkWriteOnly(ARTResource res) {
        return !(res.getNamespace().equals(Resources.getWorkingOntologyURI() +"#"));
    }
    
}
