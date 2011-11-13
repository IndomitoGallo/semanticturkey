package it.uniroma2.art.semanticturkey.services;

import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.servlet.ResponseParser;
import it.uniroma2.art.semanticturkey.servlet.XMLResponse;

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
import org.apache.http.client.utils.URIUtils;
import org.apache.http.impl.client.DefaultHttpClient;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

public abstract class HttpServiceClient
{
	private static final String URI_SCHEME = "http";
	private static final String URI_HOST = "127.0.0.1";
	private static final int URI_PORTNO = 1979;
	protected static Log log = LogFactory.getLog(HttpServiceClient.class);
	protected static final String SERVLET_URL = "semantic_turkey/resources/stserver/STServer";

	protected XMLResponse doHttpGet(String url, String query)
	{
		try 
		{
			HttpGet hg;
			HttpClient hc = new DefaultHttpClient();

			hg = prepareGet(url, query);
			
			HttpResponse response = hc.execute(hg);
			HttpEntity entity = response.getEntity();
			if (entity != null) 
			{
				InputStream instream = entity.getContent();
				BufferedInputStream in = new BufferedInputStream(instream);
				Document doc = XMLHelp.inputStream2XML(in);
				XMLResponse resp = ResponseParser.getResponseFromXML(doc);
				log.info("[GET response]: " + resp);
				//System.out.print(resp);
				return resp;
			}
		}
		catch (URISyntaxException e1)
		{
			e1.printStackTrace();
		}		
		catch (ClientProtocolException e) 
		{
			e.printStackTrace();
		} catch (IOException e) 
		{
			e.printStackTrace();
		} catch (SAXException e) 
		{
			e.printStackTrace();
		}
		return null;
	}

	private HttpGet prepareGet(String url, String query) throws URISyntaxException 
	{
		URI uri = URIUtils.createURI(URI_SCHEME, URI_HOST, URI_PORTNO, url, query, null);
		
		log.info("uri [GET]: " + uri);
		HttpGet httpget = new HttpGet(uri);
		return httpget;
	}
}
