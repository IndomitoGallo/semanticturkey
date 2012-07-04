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
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.DirectReasoning;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.navigation.ARTLiteralIterator;
import it.uniroma2.art.owlart.navigation.ARTResourceIterator;
import it.uniroma2.art.owlart.navigation.ARTStatementIterator;
import it.uniroma2.art.owlart.vocabulary.RDF;
import it.uniroma2.art.owlart.vocabulary.XmlSchema;
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
import java.util.Map;
import java.util.Set;

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
				instanceElement.setAttribute("name",
						this.decodeLabel(instance.asURIResource().getLocalName()));
			}
		}
	}

	/**
	 * Prende il link associato all'istanza
	 * 
	 * @param SesameOWLModelImpl
	 *            repository
	 * @param Resource
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
					// valore? mica avr� pensato che sono sempre nello stesso
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
	 * TODO rifare: alla fine � molto simile alle stesse selezioni che faccio su ALE (Linguistic Enrichment Of
	 * Ontologies) devo stare attento perch� credo che anche qui, con una ontologia "reale", possano crearsi
	 * dei problemi (lui esclude solamente type e annotation e mappa sempre tutti in URI, ma cosa succede se
	 * escono fuori delle Intersection o altre strutture pi� complesse che non sono URI? teoricamente potrebbe
	 * succedere devo mettere dei filtri migliori
	 */
	/**
	 * Carica le proprieta' relative all'istanza in una Map
	 * 
	 * @param SesameOWLModelImpl
	 *            repository
	 * @param Resource
	 *            instance
	 * @return Map map
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
				// � tutta da rifare come tutte le
				// assertions fatte sulla base dei
				// localname!
				if (list == null) {
					list = new ArrayList<String>();
				}
				logger.debug("***" + statement.getObject().asURIResource().getLocalName());
				list.add(statement.getObject().asURIResource().getLocalName()); // TODO qui ci va l'uri
				// completa! questa � tutta da
				// rifare come tutte le
				// assertions fatte sulla base
				// dei localname!
				map.put(repository.getQName(predicate.getURI()), list);
			}
			// FRA chiss� perch�???
			// else {
			// }
		}

		return map;
	}

	/**
	 * Ritorna una copia della stringa dopo aver tolto gli spazi bianchi !!!!perchè non usa la funzione trim
	 * della classe String?!!!!
	 * 
	 * @param String
	 *            s
	 * @return String t
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
	 * @return String label
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
	 * @return String label
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
	 * @return String label
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
	 * @return String string
	 */
	String normalize(String string) {
		int index = string.lastIndexOf("%");
		if (index == -1)
			return string;
		else {
			return string.substring(0, index - 1);
		}
	}

	// Ramon Orrù (2010) : modifica per introduzione serializzazione JSON
	public ResponseREPLY createReplyResponse(String request, RepliesStatus status, SerializationType ser_type) {
		if (ser_type == SerializationType.xml) {
			Document xml = XMLHelp.createNewDoc();
			return new XMLResponseREPLY(xml, request, status);
		} else {
			JSONObject json_content = new JSONObject();
			try {
				return new JSONResponseREPLY(json_content, request, status);
			} catch (JSONException e) {
				logger.error("Error in Json response creation:" + e.getMessage());
				e.printStackTrace();
			}
		}
		return null;
	}

	public ResponseREPLY createReplyResponse(String request, RepliesStatus status, String message,
			SerializationType ser_type) {
		if (ser_type == SerializationType.xml) {
			Document xml = XMLHelp.createNewDoc();
			return new XMLResponseREPLY(xml, request, status, message);
		} else {
			JSONObject json_content = new JSONObject();
			try {
				return new JSONResponseREPLY(json_content, request, status, message);
			} catch (JSONException e) {
				logger.error("Error in Json response creation:" + e.getMessage());
				e.printStackTrace();
			}
		}
		return null;
	}

	public ResponseREPLY createReplyFAIL(String request, String message, SerializationType ser_type) {
		if (ser_type == SerializationType.xml) {
			Document xml = XMLHelp.createNewDoc();
			return new XMLResponseREPLY(xml, request, ServiceVocabulary.RepliesStatus.fail, message);
		} else {
			JSONObject json_content = new JSONObject();
			try {
				return new JSONResponseREPLY(json_content, request, RepliesStatus.fail, message);
			} catch (JSONException e) {
				logger.error("Error in Json response creation:" + e.getMessage());
				e.printStackTrace();
			}
		}
		return null;
	}

	/**
	 * creates a response with a single boolean value returned
	 * 
	 * @param request
	 * @param resp
	 * @return
	 */
	public XMLResponseREPLY createBooleanResponse(String request, boolean resp) {
		XMLResponseREPLY response = (XMLResponseREPLY) createReplyResponse(request, RepliesStatus.ok,
				SerializationType.xml);
		Element booleanValueElement = createValueElement(response, XmlSchema.BOOLEAN);
		booleanValueElement.setTextContent(Boolean.toString(resp));
		return response;
	}
	
	/**
	 * creates a response with a single integer value returned
	 * 
	 * @param request
	 * @param resp
	 * @return
	 */
	public XMLResponseREPLY createIntegerResponse(String request, int value) {
		XMLResponseREPLY response = (XMLResponseREPLY) createReplyResponse(request, RepliesStatus.ok,
				SerializationType.xml);
		Element integerValueElement = createValueElement(response, XmlSchema.INTEGER);
		integerValueElement.setTextContent(Integer.toString(value));
		return response;
	}

	/**
	 * creates an element to host a single typed value in a response
	 * 
	 * @param response
	 * @param type
	 * @return
	 */
	public Element createValueElement(XMLResponseREPLY response, String type) {
		Element dataElem = response.getDataElement();
		Element valueElem = XMLHelp.newElement(dataElem, ServiceVocabulary.value);
		valueElem.setAttribute(ServiceVocabulary.valueType, type);
		return valueElem;
	}

	public XMLResponseREPLY createReplyResponse(String request, RepliesStatus status) {
		return (XMLResponseREPLY) createReplyResponse(request, status, SerializationType.xml);
	}

	public XMLResponseREPLY createReplyResponse(String request, RepliesStatus status, String message) {
		return (XMLResponseREPLY) createReplyResponse(request, status, message, SerializationType.xml);
	}

	public XMLResponseREPLY createReplyFAIL(String request, String message) {
		return (XMLResponseREPLY) createReplyFAIL(request, message, SerializationType.xml);
	}

	/**
	 * produces an xml document telling the client that some exception has occurred
	 * 
	 * @param value
	 * @return
	 * @throws JSONException
	 */
	public XMLResponseEXCEPTION createExceptionResponse(String request, String msg) {
		return (XMLResponseEXCEPTION) createExceptionResponse(request, msg, SerializationType.xml);
	}

	/**
	 * produces a response (xml,json) telling the client that some exception has occurred
	 * 
	 * @param value
	 * @return
	 * @throws JSONException
	 */
	public ResponseProblem createExceptionResponse(String request, String msg, SerializationType ser_type) {
		if (ser_type == SerializationType.xml) {
			Document xml = XMLHelp.createNewDoc();
			return new XMLResponseEXCEPTION(xml, request, msg);
		} else {
			JSONObject json_content = new JSONObject();
			try {
				return new JSONResponseEXCEPTION(json_content, request, msg);
			} catch (JSONException e) {
				logger.error("Error in Json response creation:" + e.getMessage());
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
	public ResponseProblem createErrorResponse(String request, String msg, SerializationType ser_type) {
		if (ser_type == SerializationType.xml) {
			Document xml = XMLHelp.createNewDoc();
			return new XMLResponseERROR(xml, request, msg);
		} else {
			JSONObject json_content = new JSONObject();
			try {
				return new JSONResponseERROR(json_content, request, msg);
			} catch (JSONException e) {
				logger.error("Error in Json response creation:" + e.getMessage());
				e.printStackTrace();
			}
		}
		return null;
	}

	public XMLResponseERROR createErrorResponse(String request, String msg) {
		return (XMLResponseERROR) createErrorResponse(request, msg, SerializationType.xml);
	}

	public ResponseProblem createNoSuchHandlerExceptionResponse(String request, SerializationType ser_type) {
		if (ser_type == SerializationType.xml) {
			Document xml = XMLHelp.createNewDoc();
			return new XMLResponseEXCEPTION(xml, request, "no handler for such a request!");
		} else {
			JSONObject json_content = new JSONObject();
			try {
				return new JSONResponseEXCEPTION(json_content, request, "no handler for such a request!");
			} catch (JSONException e) {
				logger.error("Error in Json response creation:" + e.getMessage());
				e.printStackTrace();
			}
		}
		return null;
	}

	public XMLResponseEXCEPTION createNoSuchHandlerExceptionResponse(String request) {
		return (XMLResponseEXCEPTION) createNoSuchHandlerExceptionResponse(request, SerializationType.xml);
	}

	public XMLResponseEXCEPTION createUndefinedHttpParameterExceptionResponse(String request,
			HTTPParameterUnspecifiedException e) {
		return (XMLResponseEXCEPTION) createUndefinedHttpParameterExceptionResponse(request, e,
				SerializationType.xml);
	}

	public ResponseProblem createUndefinedHttpParameterExceptionResponse(String request,
			HTTPParameterUnspecifiedException e, SerializationType ser_type) {
		if (ser_type == SerializationType.xml) {
			Document xml = XMLHelp.createNewDoc();
			return new XMLResponseEXCEPTION(xml, request, e.getMessage());
		} else {
			JSONObject json_content = new JSONObject();
			try {
				return new JSONResponseEXCEPTION(json_content, request, e.getMessage());
			} catch (JSONException e1) {
				logger.error("Error in Json response creation:" + e1.getMessage());
				e1.printStackTrace();
			}
		}
		return null;
	}

	public static final String ontAccessProblem = "problems in accessing the ontology";

	static final String ontUpdateProblem = "problems in updating the ontology";

	public ResponseProblem createExceptionResponse(String request, ModelAccessException e, ARTResource subj,
			ARTURIResource pred, ARTNode obj) {
		return createExceptionResponse(request, ontAccessProblem + " when retrieving triple: <" + subj + ", "
				+ pred + ", " + obj + ">\n" + "Content of exception: " + e.getMessage());
	}

	public ResponseProblem createExceptionResponse(String request, ModelAccessException e, ARTResource subj,
			ARTURIResource pred, ARTNode obj, SerializationType ser_type) {
		return createExceptionResponse(request, ontAccessProblem + " when retrieving triple: <" + subj + ", "
				+ pred + ", " + obj + ">\n" + "Content of exception: " + e.getMessage(), ser_type);
	}

	public ResponseProblem createExceptionResponse(String request, ModelUpdateException e) {
		return createExceptionResponse(request, ontUpdateProblem + e.getMessage());
	}

	public ResponseProblem createExceptionResponse(String request, ModelUpdateException e,
			SerializationType ser_type) {
		return createExceptionResponse(request, ontUpdateProblem + e.getMessage(), ser_type);
	}

	public ResponseProblem createExceptionResponse(String request, ModelAccessException e) {
		return createExceptionResponse(request, ontAccessProblem + e.getMessage());
	}

	public ResponseProblem createExceptionResponse(String request, ModelAccessException e,
			SerializationType ser_type) {
		return createExceptionResponse(request, ontAccessProblem + e.getMessage(), ser_type);
	}

	// TODO I should change this!!!
	public boolean checkReadOnly(ARTURIResource res) {
		return (
		// if other namespace than default one, then it is imported, thus write only
		!(checkWritable(res)));
	}

	// TODO I should change this!!!
	public boolean checkWritable(ARTURIResource res) {
		return (
		// if other namespace than default one, then it is imported, thus write only
		res.getNamespace().equals(ProjectManager.getCurrentProject().getDefaultNamespace()));
	}
	
	public boolean checkWritable(RDFModel model, ARTResource res, ARTResource graph) throws ModelAccessException {
		return model.hasTriple(res, NodeFilters.ANY, NodeFilters.ANY, false, graph);
	}


}
