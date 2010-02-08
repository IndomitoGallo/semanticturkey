package it.uniroma2.art.semanticturkey.test.servicewrappers;

import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ResponseParser;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIUtils;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

public class ServletExtensionHttpWrapper {

	protected static Log logger = LogFactory.getLog(ServletExtensionHttpWrapper.class);
	
	protected HttpClient httpclient;
	protected String id;

	public ServletExtensionHttpWrapper(String id, HttpClient httpclient) {
		this.httpclient = httpclient;
		this.id = id;
	}
	
	
	public String getId() {
		return id;
	}
	
	
	// HTTP SERVER METHODS

	protected Response askServer(String query) throws URISyntaxException {
		HttpGet httpget = prepareGet(query);
		//HttpPost httpget = preparePost(query);
		try {
			HttpResponse response = httpclient.execute(httpget);
			return handleResponse(response);
		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		
		return null;
	}

	protected Response askServer(String service, String request, String... parameters) {
		StringBuffer query = new StringBuffer();
		query.append("service=" + service + "&request=" + request);
		for (int i = 0; i < parameters.length; i++)
			query.append("&" + escape(parameters[i]));
		try {
			return askServer(query.toString());
		} catch (URISyntaxException e) {
			throw new IllegalArgumentException(e);
		}
	}

	protected HttpGet prepareGet(String query) throws URISyntaxException {
		URI uri = URIUtils.createURI("http", "127.0.0.1", 1979,
				"/semantic_turkey/resources/stserver/STServer", query, null);
		logger.debug("created uri for request: " + uri);
		HttpGet httpget = new HttpGet(uri);
		return httpget;
	}
	
	
	protected HttpPost preparePost(String query) throws URISyntaxException {
		URI uri = URIUtils.createURI("http", "127.0.0.1", 1979,
				"/semantic_turkey/resources/stserver/STServer", query, null);
		logger.debug("created uri for request: " + uri);
		HttpPost httpPost = new HttpPost(uri);
		return httpPost;
	}

	protected Response handleResponse(HttpResponse response) {
		try {			
			HttpEntity entity = response.getEntity();
			if (entity != null) {
				InputStream instream = entity.getContent();
				BufferedInputStream in = new BufferedInputStream(instream);
				Document doc = XMLHelp.inputStream2XML(in);
				return ResponseParser.getResponseFromXML(doc);
			}

		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SAXException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * TODO find a decent escape method somewhere in java
	 * 
	 * @param parameter
	 * @return
	 */
	protected String escape(String parameter) {
		return parameter.replace(" ", "%20");
	}

	
	// END OF HTTP SERVER METHODS
	
}
