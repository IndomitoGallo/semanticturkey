package it.uniroma2.art.semanticturkey.servlet.main;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.exceptions.QueryEvaluationException;
import it.uniroma2.art.owlart.exceptions.UnsupportedQueryLanguageException;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.navigation.ARTStatementIterator;
import it.uniroma2.art.owlart.query.BooleanQuery;
import it.uniroma2.art.owlart.query.GraphQuery;
import it.uniroma2.art.owlart.query.MalformedQueryException;
import it.uniroma2.art.owlart.query.Query;
import it.uniroma2.art.owlart.query.QueryLanguage;
import it.uniroma2.art.owlart.query.TupleQuery;
import it.uniroma2.art.owlart.query.io.TupleBindingsWriterException;
import it.uniroma2.art.owlart.query.io.TupleBindingsWritingFormat;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.ontology.STOntologyManager;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.JSONResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.SerializationType;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

/**
 * This service replies to SPARQL queries (or queries expressed in other query languages if supported by the
 * current {@link STOntologyManager} implementation)
 * 
 * @author Armando Stellato
 * 
 */
public class SPARQL extends ServiceAdapter {

	protected static Logger logger = LoggerFactory.getLogger(SPARQL.class);

	public final static String resolveQueryRequest = "resolveQuery";

	public final static String queryPar = "query";
	public final static String languagePar = "lang";
	public final static String inferPar = "infer";

	public final static String resultTypeAttr = "resulttype";

	public SPARQL(String id) {
		super(id);
	}

	/**
	 * 
	 * @return
	 */
	public Response getResponse() {
		SerializationType ser_type = _oReq.getAcceptContent(); 
		
		String request = setHttpPar("request");
		try {
			if (request.equals(resolveQueryRequest)) {
				String query = setHttpPar(queryPar);
				String lang = setHttpPar(languagePar);
				String infer = setHttpPar(inferPar);
				checkRequestParametersAllNotNull(queryPar);
				return resolveQuery(query, lang, infer,ser_type);
			} else {
				return servletUtilities.createNoSuchHandlerExceptionResponse(request);
			}
		} catch (HTTPParameterUnspecifiedException e) {
			return servletUtilities.createUndefinedHttpParameterExceptionResponse(request, e);
		}
	}

//	Ramon Orrù (2010): introduzione parametro ser_type, popolamento richiesta con serializzaione JSON
	public Response resolveQuery(String queryString, String lang, String inferString,SerializationType ser_type) {

		String request = resolveQueryRequest;

		logger.debug("resolving query:\n" + queryString);

		QueryLanguage ql;
		if (lang != null)
			ql = QueryLanguage.parseLanguage(lang);
		else
			ql = QueryLanguage.SPARQL;
		logger.debug("query language: " + ql);

		boolean infer;
		if (inferString != null)
			infer = Boolean.parseBoolean(inferString);
		else
			infer = false;
		logger.debug("inference set: " + ql);

		RDFModel owlModel = ProjectManager.getCurrentProject().getOntModel();

		try {
			ResponseREPLY response = ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok,ser_type);
			
			if(response instanceof XMLResponseREPLY){
				Element dataElement = ((XMLResponseREPLY)response).getDataElement();
				Query query = owlModel.createQuery(ql, queryString);
				if (query instanceof TupleQuery) {
					logger.debug("query is a tuple query");
					dataElement.setAttribute(resultTypeAttr, "tuple");
					ByteArrayOutputStream baos = new ByteArrayOutputStream();
					((TupleQuery) query).evaluate(infer, TupleBindingsWritingFormat.XML, baos);
					Document doc = XMLHelp.byteArrayOutputStream2XML(baos);
					Node importedSPARQLResult = ((Document)response.getResponseObject()).importNode(doc.getDocumentElement(), true);
					dataElement.appendChild(importedSPARQLResult);
					logger.debug(XMLHelp.XML2String(doc));
				} else if (query instanceof GraphQuery) {
					logger.debug("query is a graph query");
					dataElement.setAttribute(resultTypeAttr, "graph");
					ARTStatementIterator statIt = ((GraphQuery) query).evaluate(infer);
					Statement.createStatementsList(owlModel, statIt, dataElement);
				} else if (query instanceof BooleanQuery) {
					logger.debug("query is a boolean query");
					dataElement.setAttribute(resultTypeAttr, "boolean");
					boolean result = ((BooleanQuery) query).evaluate(infer);
					XMLHelp.newElement(dataElement, "result", Boolean.toString(result));
				}
			}
			else{
//				Ramon Orrù (2010): Serializzazione JSON
				if(response instanceof JSONResponseREPLY){
					JSONObject data=null;	
					data=((JSONResponseREPLY)response).getDataElement();
					Query query = owlModel.createQuery(ql, queryString);
					if (query instanceof TupleQuery) {
						logger.debug("query is a tuple query");
						data.put(resultTypeAttr,  "tuple");
						ByteArrayOutputStream baos = new ByteArrayOutputStream();
						((TupleQuery) query).evaluate(infer, TupleBindingsWritingFormat.JSON, baos);
						String sparql_result=baos.toString();
						data.put("sparql",new JSONObject(sparql_result));
					} else if (query instanceof GraphQuery) {
						logger.debug("query is a graph query");
						data.put(resultTypeAttr,  "graph");
						ARTStatementIterator statIt = ((GraphQuery) query).evaluate(infer);
						Statement.createStatementsList(owlModel, statIt, data); 
					} else if (query instanceof BooleanQuery) {
						logger.debug("query is a boolean query");					
						data.put(resultTypeAttr, "boolean");
						boolean result = ((BooleanQuery) query).evaluate(infer);
						data.put("result",Boolean.toString(result));
					}
					
//------------------  Ramon Orrù (2010): stampa per debug ----------------
						logger.debug("JSON data: \n"+data.toString(3));
//----------------------------------------------------------------------------------------------------
					
				}
			}
			return response;

		} catch (UnsupportedQueryLanguageException e) {
			logger.error(Utilities.printFullStackTrace(e));
			return servletUtilities.createExceptionResponse(request, e.toString(), ser_type);
		} catch (ModelAccessException e) {
			logger.error(Utilities.printFullStackTrace(e));
			return servletUtilities.createExceptionResponse(request, e.toString(), ser_type);
		} catch (MalformedQueryException e) {
			System.out.println("malformed query exception");
			logger.error(Utilities.printFullStackTrace(e));
			return servletUtilities.createExceptionResponse(request, e.toString(), ser_type);
		} catch (QueryEvaluationException e) {
			logger.error(Utilities.printFullStackTrace(e));
			return servletUtilities.createExceptionResponse(request, e.toString(), ser_type);
		} catch (TupleBindingsWriterException e) {
			logger.error(Utilities.printFullStackTrace(e));
			return servletUtilities.createExceptionResponse(request, e.toString(), ser_type);
		} catch (UnsupportedEncodingException e) {
			logger.error(Utilities.printFullStackTrace(e));
			return servletUtilities.createExceptionResponse(request, e.toString(), ser_type);
		} catch (SAXException e) {
			logger.error(Utilities.printFullStackTrace(e));
			return servletUtilities.createExceptionResponse(request, e.toString(), ser_type);
		} catch (IOException e) {
			logger.error(Utilities.printFullStackTrace(e));
			return servletUtilities.createExceptionResponse(request, e.toString(), ser_type);
//			Ramon Orrù (2010): aggiunta catching JSONException
		} catch (JSONException e) {
			logger.error(Utilities.printFullStackTrace(e));
			logger.error("******Errore JSON*****");
			return servletUtilities.createExceptionResponse(request, e.toString(), ser_type);
		}
	}		
}

/*
 * if (query.contains("SELECT")) { Vector result = repository.getResultQuerySelect(query1); int i = 0;
 * treeElement.setAttribute("queryType", "select"); for (i = 0; i < result.size() - 1; i++) { Element
 * classElement = XMLHelp.newElement(treeElement, "Binding"); classElement.setAttribute("bindingName",
 * ((String) ((ArrayList) result .get(result.size() - 1)).get(i))); for (int j = 0; j < ((ArrayList)
 * result.get(i)).size(); j++) { Element elem = XMLHelp.newElement(classElement, "Value"); String aResURI =
 * ((ArrayList<String>) result.get(i)).get(j); ARTResource aRes = repository.getSTResource(aResURI);
 * elem.setAttribute("value", aRes.getLocalName()); if (repository.isClass(aRes)) elem.setAttribute("type",
 * "Class"); else if (repository.isDatatypeProperty(aRes)) elem.setAttribute("type", "DatatypeProperty"); else
 * if (repository.isAnnotationProperty(aRes)) elem.setAttribute("type", "AnnotationProperty"); else if
 * (repository.isProperty(aRes)) elem.setAttribute("type", "Property"); else if
 * (repository.isObjectProperty(aRes)) elem.setAttribute("type", "ObjectProperty"); else
 * elem.setAttribute("type", "Instance"); } }
 * 
 * tree.appendChild(treeElement);
 * 
 * } else if (query.contains("CONSTRUCT")) { String result = repository.getResultQueryConstruct(query1); //
 * result = result.replace("#", "$"); treeElement.setAttribute("queryType", "construct");
 * treeElement.setAttribute("value", result);
 * 
 * tree.appendChild(treeElement);
 * 
 * } else if (query.contains("ASK")) { String result = repository.getResultQueryAsk(query1);
 * treeElement.setAttribute("queryType", "ask"); treeElement.setAttribute("value", result);
 * tree.appendChild(treeElement); } else if (query.contains("DESCRIBE")) { String result =
 * repository.getResultQueryDescribe(query1); // result = result.replace("#", "$");
 * treeElement.setAttribute("queryType", "describe"); treeElement.setAttribute("value", result);
 * tree.appendChild(treeElement); } else { treeElement = tree.createElement("error");
 * treeElement.setAttribute("id_value", "SPARQLException"); System.out.println("Exception");
 * treeElement.setAttribute("sparqlexception",
 * "The query must contains one of SELECT, CONSTRUCT, ASK or DESCRIBE "); tree.appendChild(treeElement);
 * 
 * }
 * 
 * 
 * } catch (Exception e) { // TODO Auto-generated catch block e.printStackTrace(); Element treeElement =
 * tree.createElement("error"); treeElement.setAttribute("id_value", "SPARQLException");
 * System.out.println("Exception"); treeElement.setAttribute("sparqlexception", e.getMessage());
 * tree.appendChild(treeElement);
 * 
 * } return tree;
 */

