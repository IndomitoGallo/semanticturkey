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

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.exceptions.ModelUpdateException;
import it.uniroma2.art.owlart.model.ARTNode;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTStatement;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.models.DirectReasoning;
import it.uniroma2.art.owlart.navigation.ARTLiteralIterator;
import it.uniroma2.art.owlart.navigation.ARTResourceIterator;
import it.uniroma2.art.owlart.navigation.ARTStatementIterator;
import it.uniroma2.art.owlart.vocabulary.RDF;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.SerializationType;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**Classe che contiene le utilities per le servlet, oltre ad alcuni metodi di supporto la maggior parte dei metodi
 * dichiarati aggiungono elementi xml al documento che costituiscono le risposte alle servlet invocate da client*/
/**
 * @author Donato Griesi Contributor(s): Andrea Turbati
 */
public class ServletUtilities {
	protected static Logger logger = LoggerFactory.getLogger(ServletUtilities.class);
	static final private ServletUtilities service;

	static {
		service = new ServletUtilities();
	}

	public static ServletUtilities getService() {
		return service;
	}

	/**
	 * @param repository
	 * @param cls
	 * @param element
	 * @throws ModelAccessException
	 */
	void createInstancesXMLList(DirectReasoning repository, ARTResource cls, Element element)
			throws ModelAccessException {
		ARTResourceIterator IteratorInstances = repository.listDirectInstances(cls);
		Element instances = XMLHelp.newElement(element, "Instances");
		while (IteratorInstances.streamOpen()) {
			ARTResource instance = (ARTResource) IteratorInstances.getNext();
			Element instanceElement = XMLHelp.newElement(instances, "Instance");
			if (instance.isURIResource()) {
				instanceElement.setAttribute("name", this
						.decodeLabel(instance.asURIResource().getLocalName()));
			}
		}
	}

	/**
	 * Crea il grafico inserendo ricorsivamente la lista di archi e nodi in due strutture Element
	 * 
	 * @param SesameOWLModelImpl
	 *            repository
	 * @param String
	 *            id
	 * @param Map
	 *            map
	 * @param Set
	 *            set
	 * @param Resource
	 *            resource
	 * @param Element
	 *            nodeset: lista dei nodi del grafo
	 * @param Element
	 *            edgeset: lista degli archi del grafo
	 * @throws ModelAccessException
	 */
	public void createXMLGraph(OWLModel repository, ARTResource cls, Map<String, String> map, String id,
			Set<String> set, Element nodeset, Element edgeset) throws ModelAccessException {
		ARTResourceIterator subClassesIterator = ((DirectReasoning) repository).listDirectSubClasses(cls);
		ARTResourceIterator instancesIterator = ((DirectReasoning) repository).listDirectInstances(cls);

		while (subClassesIterator.streamOpen()) {
			ARTResource subClass = subClassesIterator.getNext();
			if (subClass.isURIResource()) {
				String classID = createXMLElementClassGraph(repository.getQName(subClass.asURIResource()
						.getURI()), id, set, nodeset, edgeset);
				createXMLGraph(repository, subClass, map, classID, set, nodeset, edgeset);
			}
		}
		while (instancesIterator.streamOpen()) {
			ARTResource instance = instancesIterator.getNext();
			if (instance.isURIResource())
				createXMLElementIstanceGraph(repository, instance.asURIResource(), map, set, id, nodeset,
						edgeset);
			/*
			 * //FRA repository.getQName(istance.getURI()) Francesca Fallucchi STStatementIterator stit =
			 * repository.getStatements(instance, null, null); while (stit.hasNext()) { STStatement st =
			 * stit.next(); STResource valuedProperty = st.getPredicate();
			 * 
			 * if(repository.isObjectProperty(valuedProperty)){ //FRA propertyName WorksInCompany String
			 * propertyName = repository.getQName( valuedProperty.getURI()); //FRA ranges Organization
			 * Iterator<STResource> ranges = repository.getPropertyRanges(valuedProperty); //FRA valueProperty
			 * Univertity String valueProperty = repository.getQName( st.getObject().toString() ); } }
			 */
		}
	}

	public void createXMLRootElementGraph(String id, Element nodeset) {
		Element node = XMLHelp.newElement(nodeset, "NODE");
		node.setAttribute("nodeID", "AutoID " + id);

		Element node_location = XMLHelp.newElement(node, "NODE_LOCATION");
		node_location.setAttribute("x", "384");
		node_location.setAttribute("y", "70");
		node_location.setAttribute("visible", "true");

		Element node_label = XMLHelp.newElement(node, "NODE_LABEL");
		node_label.setAttribute("label", null);
		node_label.setAttribute("classIcon",
				"http://127.0.0.1:1979/semantic_turkey/resources/applet/turkeyCircle.gif");

	}

	public String createXMLElementClassGraph(String cls, String id, Set<String> set, Element nodeset,
			Element edgeset) {

		Element node = XMLHelp.newElement(nodeset, "NODE");
		UUID uuid = null;
		do {
			uuid = UUID.randomUUID();
		} while (set.add(uuid.toString()) == false);

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
		node_label.setAttribute("imageURL", null);
		node_label.setAttribute("classIcon",
				"http://127.0.0.1:1979/semantic_turkey/resources/applet/turkeyCircle.gif");

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
		edge.setAttribute("toID", "AutoID " + classID);
		edge.setAttribute("type", "1");
		edge.setAttribute("length", "30");
		edge.setAttribute("visible", "true");
		edge.setAttribute("color", "A0A0A0");

		return classID;
	}

	void createXMLElementIstanceGraph(OWLModel repository, ARTURIResource instance, Map<String, String> map,
			Set<String> set, String id, Element nodeset, Element edgeset) throws ModelAccessException {
		Element node = XMLHelp.newElement(nodeset, "NODE");
		UUID uuid = null;
		do {
			uuid = UUID.randomUUID();
		} while (set.add(uuid.toString()) == false);

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
		node_label.setAttribute("imageURL", null);
		// node_label.setAttribute("iconPath",null);

		Element node_url = XMLHelp.newElement(node, "NODE_URL");
		node_url.setAttribute("url", "");
		node_url.setAttribute("urlIsLocal", "false");
		node_url.setAttribute("urlIsXML", "false");

		Element node_hint = XMLHelp.newElement(node, "NODE_HINT");

		Iterator<String[]> it = this.getUrlPageTitle(repository, instance).iterator();
		String hintDescription = new String("Urls:\n");
		while (it.hasNext()) {
			String[] strings = (String[]) it.next();
			hintDescription = hintDescription.concat("<a href=\"" + strings[0] + "\">" + strings[1]
					+ "</a>\n");
		}
		node_hint.setAttribute("hint", hintDescription);
		node_hint.setAttribute("width", "200");
		node_hint.setAttribute("height", "-1");
		node_hint.setAttribute("isHTML", "true");

		Element edge = XMLHelp.newElement(edgeset, "EDGE");
		edge.setAttribute("fromID", "AutoID " + id);
		edge.setAttribute("toID", "AutoID " + uuid.toString());
		edge.setAttribute("type", "1");
		edge.setAttribute("length", "50");
		edge.setAttribute("visible", "true");
		edge.setAttribute("color", "A0A0A0");

	}

	public void createXMLElementPropertyGraph(OWLModel repository, Map<String, String> map, Set<String> set,
			Element nodeset, Element edgeset) throws ModelAccessException {
		Set<String> entrySet = map.keySet();
		Iterator<String> it = entrySet.iterator();
		while (it.hasNext()) {
			String instanceQName = (String) it.next();
			String id = (String) map.get(instanceQName);
			Map<String, ArrayList<String>> propertyMap = this.getInstanceProperties(repository, repository
					.createURIResource(repository.expandQName(instanceQName)));
			Set<String> propertyMapEntrySet = propertyMap.keySet();
			Iterator<String> it2 = propertyMapEntrySet.iterator();
			while (it2.hasNext()) {
				String propertyName = (String) it2.next();
				logger.debug("propertyName = " + propertyName);
				UUID uuid = null;
				do {
					uuid = UUID.randomUUID();
				} while (set.add(uuid.toString()) == false);

				Collection<String> collection = propertyMap.get(propertyName);
				Iterator<String> it3 = collection.iterator();
				String id2 = null;
				int i = 0;
				while (it3.hasNext()) {
					id2 = (String) map.get(it3.next());
					logger.debug("id2 = " + id2);
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
				node_label.setAttribute("imageURL", null);
				// node_label.setAttribute("iconPath",null);

				Element node_url = XMLHelp.newElement(node, "NODE_URL");
				node_url.setAttribute("url", "");
				node_url.setAttribute("urlIsLocal", "false");
				node_url.setAttribute("urlIsXML", "false");

				Element node_hint = XMLHelp.newElement(node, "NODE_HINT");
				node_hint.setAttribute("hint", "");
				node_hint.setAttribute("width", "150");
				node_hint.setAttribute("height", "-1");
				node_hint.setAttribute("isHTML", "true");

				for (;;) {
					Element edge = XMLHelp.newElement(edgeset, "EDGE");
					edge.setAttribute("fromID", "AutoID " + id);
					edge.setAttribute("toID", "AutoID " + uuid.toString());
					edge.setAttribute("type", "1");
					edge.setAttribute("length", "30");
					edge.setAttribute("visible", "true");
					edge.setAttribute("color", "A0A0A0");

					edge = XMLHelp.newElement(edgeset, "EDGE");
					edge.setAttribute("fromID", "AutoID " + uuid.toString());
					edge.setAttribute("toID", "AutoID " + id2);
					edge.setAttribute("type", "1");
					edge.setAttribute("length", "30");
					edge.setAttribute("visible", "true");
					edge.setAttribute("color", "A0A0A0");
					if (it3.hasNext()) {
						id2 = (String) map.get(it3.next());
						if (id2 == null)
							continue;
					} else
						break;
				}
			}
		}
	}

	public void setXMLParametersGraph(Element touchgraph) {
		Element parameters = XMLHelp.newElement(touchgraph, "PARAMETERS");
		Element param = XMLHelp.newElement(parameters, "PARAM");
		param.setAttribute("name", "offsetX");
		param.setAttribute("value", "627");

		param = XMLHelp.newElement(parameters, "PARAM");
		param.setAttribute("name", "rotateSB");
		param.setAttribute("value", "0");

		param = XMLHelp.newElement(parameters, "PARAM");
		param.setAttribute("name", "zoomSB");
		param.setAttribute("value", "-7");

		param = XMLHelp.newElement(parameters, "PARAM");
		param.setAttribute("name", "offsetY");
		param.setAttribute("value", "19");

	}

	/**
	 * Prende il link associato all'istanza
	 * 
	 * @param SesameOWLModelImpl
	 *            repository
	 *@param Resource
	 *            instanceRes
	 * @throws ModelAccessException
	 */
	Collection<String[]> getUrlPageTitle(OWLModel repository, ARTResource instanceRes)
			throws ModelAccessException {
		ArrayList<String[]> list = new ArrayList<String[]>();
		ARTResourceIterator semanticAnnotationInstancesIterator = repository.listValuesOfSubjObjPropertyPair(
				instanceRes, SemAnnotVocab.Res.annotation, true); // TODO put in specific object all
		// application ontology objects!!!
		Set<String> set = new HashSet<String>();
		while (semanticAnnotationInstancesIterator.hasNext()) {
			ARTResource semanticAnnotationRes = semanticAnnotationInstancesIterator.next().asResource();
			ARTResourceIterator webPageInstancesIterator = repository.listValuesOfSubjObjPropertyPair(
					semanticAnnotationRes, SemAnnotVocab.Res.location, true);
			while (webPageInstancesIterator.hasNext()) {
				String[] strings = new String[2];
				ARTResource webPageInstance = webPageInstancesIterator.next().asResource();
				ARTLiteralIterator urlPageIterator = repository.listValuesOfSubjDTypePropertyPair(
						webPageInstance, SemAnnotVocab.Res.url, true);
				ARTNode urlPageValue = null;
				while (urlPageIterator.hasNext()) { // TODO che fa? lo esaurisce e poi prende solo l'ultimo
					// valore? mica avrà pensato che sono sempre nello stesso
					// ordine?
					urlPageValue = urlPageIterator.next();
				}
				String urlPage = urlPageValue.toString();
				if (!set.add(urlPage))
					continue;
				ARTLiteralIterator titleIterator = repository.listValuesOfSubjDTypePropertyPair(
						webPageInstance, SemAnnotVocab.Res.title, true);
				ARTNode titleValue = null;
				while (titleIterator.hasNext()) {
					titleValue = titleIterator.next();
				}
				String title = titleValue.toString();
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
	 * TODO rifare: alla fine è molto simile alle stesse selezioni che faccio su ALE (Linguistic Enrichment Of
	 * Ontologies) devo stare attento perchè credo che anche qui, con una ontologia "reale", possano crearsi
	 * dei problemi (lui esclude solamente type e annotation e mappa sempre tutti in URI, ma cosa succede se
	 * escono fuori delle Intersection o altre strutture più complesse che non sono URI? teoricamente potrebbe
	 * succedere devo mettere dei filtri migliori
	 */
	/**
	 * Carica le proprieta' relative all'istanza in una Map
	 * 
	 * @param SesameOWLModelImpl
	 *            repository
	 *@param Resource
	 *            instance
	 *@return Map map
	 * @throws ModelAccessException
	 */

	// FRA Deve essere ricontrollata
	Map<String, ArrayList<String>> getInstanceProperties(OWLModel repository, ARTResource instance)
			throws ModelAccessException {
		Map<String, ArrayList<String>> map = new HashMap<String, ArrayList<String>>();
		ARTStatementIterator it = repository.listStatements(instance, null, null, true);

		while (it.streamOpen()) {
			ARTStatement statement = it.getNext();
			ARTURIResource predicate = statement.getPredicate();
			logger.debug(repository.getQName(predicate.getURI()));
			if (repository.getQName(predicate.getURI()).equals(RDF.Res.TYPE)
					|| repository.getQName(predicate.getURI()).equals(SemAnnotVocab.Res.annotation)) {
				continue;
			}
			if (statement.getObject().isURIResource()) {
				ArrayList<String> list = map.get(predicate.getURI()); // TODO qui ci va l'uri completa! questa
				// è tutta da rifare come tutte le
				// assertions fatte sulla base dei
				// localname!
				if (list == null) {
					list = new ArrayList<String>();
				}
				logger.debug("***" + statement.getObject().asURIResource().getLocalName());
				list.add(statement.getObject().asURIResource().getLocalName()); // TODO qui ci va l'uri
				// completa! questa è tutta da
				// rifare come tutte le
				// assertions fatte sulla base
				// dei localname!
				map.put(repository.getQName(predicate.getURI()), list);
			}
			// FRA chissà perchè???
			// else {
			// }
		}

		return map;
	}

	/**
	 * Ritorna una copia della stringa dopo aver tolto gli spazi bianchi !!!!perchÃ¨ non usa la funzione trim
	 * della classe String?!!!!
	 * 
	 * @param String
	 *            s
	 *@return String t
	 */
	String trim(String s) {
		// pre: s!=null
		int ls; // lunghezza di s
		int primo; // indice del primo carattere non spazio di s
		// (ls se s contiene solo spazi)
		int ultimo; // indice dell'ultimo carattere non spazio di s
		String t; // la stringa s senza spazi alle estremita'
		int i; // indice per la scansione di s
		final char SPAZIO = ' '; // il carattere spazio

		/* calcola la lunghezza di s */
		ls = s.length();

		/*
		 * calcola l'indice del primo carattere non spazio di s, oppure ls se s contiene solo spazi bianchi
		 */
		primo = 0;
		while (primo < ls && s.charAt(primo) <= SPAZIO)
			primo++;

		/*
		 * calcola l'indice dell'ultimo carattere non spazio di s, oppure 0 se s contiene solo spazi bianchi
		 */
		ultimo = ls - 1;
		while (ultimo >= 0 && s.charAt(ultimo) <= SPAZIO)
			ultimo--;

		/* calcola t */
		if (ls == 0 || (primo == 0 && ultimo == ls - 1))
			/*
			 * se s e' la stringa vuota, o se non inizia ne' termina per spazi bianchi, va restituita s
			 */
			t = s;
		else /* s non e' vuota e inizia e/o termina per spazi bianchi */
		if (primo == ls)
			/* se e' non vuota ma composta solo da spazi bianchi */
			t = "";
		else {
			/*
			 * s non e' vuota e inizia e/o termina per spazi bianchi, ma non e' composta solo da spazi
			 * bianchi, va calcolata la sottostringa di s che contiene i caratteri dalla posizione primo a
			 * ultimo (comprese)
			 */
			t = "";
			for (i = primo; i <= ultimo; i++)
				t += s.charAt(i);
		}

		return t;
	}

	/**
	 * Sostituisce i caratteri : e / con i rispettivi codici ascii
	 * 
	 * @param String
	 *            label
	 *@return String label
	 */
	public String encodeLabel(String label) {
		label = trim(label);
		label = label.replace(":", "%3A");
		label = label.replace("/", "%2F");
		return label;
	}

	/**
	 * Sostituisce i codici %3A %2F rispettivamente con : e /
	 * 
	 * @param String
	 *            label
	 *@return String label
	 */
	public String decodeLabel(String label) {
		label = label.replace("%3A", ":");
		label = label.replace("%2F", "/");
		return label;
	}

	/**
	 * Sostituisce i codici %3A %2F rispettivamente con : e /
	 * 
	 * @param String
	 *            label
	 *@return String label
	 */
	public String removeInstNumberParentheses(String label) {
		int indexOfParenthesis = label.indexOf("(");
		if (indexOfParenthesis == -1)
			return label;
		else
			return label.substring(0, indexOfParenthesis);
	}

	/**
	 * Elimina il carattere % dalla stringa
	 * 
	 * @param String
	 *            string
	 *@return String string
	 */
	String normalize(String string) {
		int index = string.lastIndexOf("%");
		if (index == -1)
			return string;
		else {
			return string.substring(0, index - 1);
		}
	}


// 	Ramon Orrù (2010) : modifica per introduzione serializzazione JSON
	public ResponseREPLY createReplyResponse(String request, RepliesStatus status,SerializationType ser_type) {
		if(ser_type==SerializationType.xml){
			Document xml = XMLHelp.createNewDoc();
			return new XMLResponseREPLY(xml, request, status);
		}else{
			JSONObject json_content=new JSONObject();
			try {
				return new JSONResponseREPLY(json_content, request, status);
			} catch (JSONException e) {
				logger.error("Error in Json response creation:"+e.getMessage());
				e.printStackTrace();
			}
		}
		return null;
	}
	
// 	Ramon Orrù (2010) : modifica per introduzione serializzazione JSON
	public ResponseREPLY createReplyResponse(String request, RepliesStatus status,String message,SerializationType ser_type) {
		if(ser_type==SerializationType.xml){
			Document xml = XMLHelp.createNewDoc();
			return new XMLResponseREPLY(xml, request, status, message);
		}else{
			JSONObject json_content=new JSONObject();
			try {
				return new JSONResponseREPLY(json_content, request,status,message);
			} catch (JSONException e) {
				logger.error("Error in Json response creation:"+e.getMessage());
				e.printStackTrace();
			}
		}
		return null;
	}

// 	Ramon Orrù (2010) : modifica per introduzione serializzazione JSON
	public ResponseREPLY createReplyFAIL(String request, String message,SerializationType ser_type) {		
		if(ser_type==SerializationType.xml){
			Document xml = XMLHelp.createNewDoc();
			return new XMLResponseREPLY(xml, request, ServiceVocabulary.RepliesStatus.fail , message);
		}else{
			JSONObject json_content=new JSONObject();
			try {
				return new JSONResponseREPLY(json_content, request,RepliesStatus.fail,message);
			} catch (JSONException e) {
				logger.error("Error in Json response creation:"+e.getMessage());
				e.printStackTrace();
			}
		}
		return null;
	}
	
// 	Ramon Orrù (2010) : modifica per introduzione serializzazione JSON (retro-compatibilità)
	public XMLResponseREPLY createReplyResponse(String request, RepliesStatus status){
		return (XMLResponseREPLY)createReplyResponse(request,status,SerializationType.xml);
	}
	
//	Ramon Orrù (2010) : modifica per introduzione serializzazione JSON (retro-compatibilità)
	public XMLResponseREPLY createReplyResponse(String request, RepliesStatus status,String message)  {
		return (XMLResponseREPLY)createReplyResponse(request,status,message,SerializationType.xml);
	}

//	Ramon Orrù (2010) : modifica per introduzione serializzazione JSON (retro-compatibilità)
	public XMLResponseREPLY createReplyFAIL(String request, String message){
		return (XMLResponseREPLY)createReplyFAIL(request,message,SerializationType.xml);
	}

	/**
	 * produces an xml document telling the client that some exception has occurred
	 * 
	 * @param value
	 * @return
	 * @throws JSONException 
	 */
//	Ramon Orrù (2010) : modifica per introduzione serializzazione JSON (retro-compatibilità)
	public XMLResponseEXCEPTION createExceptionResponse(String request, String msg) {
		return (XMLResponseEXCEPTION)createExceptionResponse(request,msg,SerializationType.xml);
	}
	
	/**
	 * produces a response (xml,json)  telling the client that some exception has occurred 
	 * 
	 * @param value
	 * @return
	 * @throws JSONException 
	 */
// 	Ramon Orrù (2010) : modifica per introduzione serializzazione JSON
	public ResponseProblem createExceptionResponse(String request, String msg,SerializationType ser_type){
		if(ser_type==SerializationType.xml){
			Document xml = XMLHelp.createNewDoc();
			return new XMLResponseEXCEPTION(xml, request, msg);
		}else{
			JSONObject json_content=new JSONObject();
			try {
				return new JSONResponseEXCEPTION(json_content, request,msg);
			} catch (JSONException e) {
				logger.error("Error in Json response creation:"+e.getMessage());
				e.printStackTrace();
			}
		}
		return null;
	}
	
	/**
	 * produces an xml document telling the client that some error has occurred
	 * 
	 * @param value
	 * @return
	 * @throws JSONException 
	 */
// 	Ramon Orrù (2010) : modifica per introduzione serializzazione JSON
	public ResponseProblem createErrorResponse(String request, String msg,SerializationType ser_type){
		if(ser_type==SerializationType.xml){
			Document xml = XMLHelp.createNewDoc();
			return new XMLResponseERROR(xml, request, msg);
		}else{
			JSONObject json_content=new JSONObject();
			try {
				return new JSONResponseERROR(json_content, request,msg);
			} catch (JSONException e) {
				logger.error("Error in Json response creation:"+e.getMessage());
				e.printStackTrace();
			}
		}return null;
	}
	
//	Ramon Orrù (2010) : modifica per introduzione serializzazione JSON (retro-compatibilità)
	public XMLResponseERROR createErrorResponse(String request, String msg) {
		return (XMLResponseERROR)createErrorResponse(request, msg,SerializationType.xml);
	}
	
	
// 	Ramon Orrù (2010) : modifica per introduzione serializzazione JSON
	public ResponseProblem createNoSuchHandlerExceptionResponse(String request,SerializationType ser_type) {
		if(ser_type==SerializationType.xml){
			Document xml = XMLHelp.createNewDoc();
			return new XMLResponseEXCEPTION(xml, request, "no handler for such a request!");
		}else{
			JSONObject json_content=new JSONObject();
			try {
				return new JSONResponseEXCEPTION(json_content, request, "no handler for such a request!");
			} catch (JSONException e) {
				logger.error("Error in Json response creation:"+e.getMessage());
				e.printStackTrace();
			}
		}
		return null;
	}
	
//	Ramon Orrù (2010) : modifica per introduzione serializzazione JSON (retro-compatibilità)
	public XMLResponseEXCEPTION createNoSuchHandlerExceptionResponse(String request) {
		return (XMLResponseEXCEPTION)createNoSuchHandlerExceptionResponse(request,SerializationType.xml);
	}

//	Ramon Orrù (2010) : modifica per introduzione serializzazione JSON (retro-compatibilità)
	public XMLResponseEXCEPTION createUndefinedHttpParameterExceptionResponse(String request,HTTPParameterUnspecifiedException e) {	
		return (XMLResponseEXCEPTION)createUndefinedHttpParameterExceptionResponse(request, e,SerializationType.xml);
	}
	
// 	Ramon Orrù (2010) : modifica per introduzione serializzazione JSON
	public ResponseProblem createUndefinedHttpParameterExceptionResponse(String request,HTTPParameterUnspecifiedException e,SerializationType ser_type) {
		if(ser_type==SerializationType.xml){
			Document xml = XMLHelp.createNewDoc();
			return new XMLResponseEXCEPTION(xml, request, e.getMessage());
		}else{
			JSONObject json_content=new JSONObject();
			try {
				return new JSONResponseEXCEPTION(json_content, request,  e.getMessage());
			} catch (JSONException e1) {
				logger.error("Error in Json response creation:"+e1.getMessage());
				e1.printStackTrace();
			}
		}
		return null;
	}

	public static final String ontAccessProblem = "problems in accessing the ontology";

	static final String ontUpdateProblem = "problems in updating the ontology";

	public ResponseProblem createExceptionResponse(String request, ModelAccessException e,ARTResource subj, ARTURIResource pred, ARTNode obj) {
		return createExceptionResponse(request, ontAccessProblem + " when retrieving triple: <" + subj + ", "+ pred + ", " + obj + ">\n" + "Content of exception: " + e.getMessage());
	}
	
	public ResponseProblem createExceptionResponse(String request, ModelAccessException e,ARTResource subj, ARTURIResource pred, ARTNode obj,SerializationType ser_type){
		return createExceptionResponse(request, ontAccessProblem + " when retrieving triple: <" + subj + ", "+ pred + ", " + obj + ">\n" + "Content of exception: " + e.getMessage(),ser_type);
	}

	public ResponseProblem createExceptionResponse(String request, ModelUpdateException e)  {
		return createExceptionResponse(request, ontUpdateProblem + e.getMessage());
	}
	
	public ResponseProblem createExceptionResponse(String request, ModelUpdateException e,SerializationType ser_type) {
		return createExceptionResponse(request, ontUpdateProblem + e.getMessage(),ser_type);
	}

	public ResponseProblem createExceptionResponse(String request, ModelAccessException e) {
		return createExceptionResponse(request, ontAccessProblem + e.getMessage());
	}
	
	public ResponseProblem createExceptionResponse(String request, ModelAccessException e,SerializationType ser_type) {
		return createExceptionResponse(request, ontAccessProblem + e.getMessage(),ser_type);
	}


	//TODO I should change this!!!
	public boolean checkWriteOnly(ARTURIResource res) {
		return (
				//if other namespace than default one, then it is imported, thus write only
				!(res.getNamespace().equals(ProjectManager.getCurrentProject().getDefaultNamespace()))
		);
	}
	
}
