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

package it.uniroma2.art.semanticturkey;

import it.uniroma2.art.owlart.exceptions.VocabularyInitializationException;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.semanticturkey.plugin.PluginManager;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.resources.VersionNumber;
import it.uniroma2.art.semanticturkey.servlet.Proxy;
import it.uniroma2.art.semanticturkey.servlet.STServer;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;

import java.io.File;
import java.net.InetAddress;
import java.net.URISyntaxException;
import java.net.UnknownHostException;

import org.mortbay.http.HttpContext;
import org.mortbay.http.HttpServer;
import org.mortbay.http.SocketListener;
import org.mortbay.http.handler.ResourceHandler;
import org.mortbay.jetty.servlet.ServletHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *  Classe che si occupa di inizializzare l'applicazione,attivare il file di log,caricare il profilo utente,
 * creare il WebServer associando le relative Servlet (WebSearch,STServer,Proxy) ed infine creare il SesameARTRepositoryImpl
 * relativo all'ontologia 
 *
 */
/**
 * @author Armando Stellato Contributor(s): Andrea Turbati
 * 
 */
public class SemanticTurkey {
	public final static VersionNumber versionNumber = new VersionNumber(0, 8, 0);
	static protected HttpServer s_httpServer;
	protected static Logger logger = LoggerFactory.getLogger(SemanticTurkey.class);
	private final static int port = 1979;
	private static HttpServer server = null;

	/**
	 * main initialization method which is invoked by the Semantic Turkey javascript client through
	 * Java/JavaScript XPCOM Bridge
	 * 
	 * @param extensionPath
	 *            path to the installed Semantic Turkey extension
	 * @return
	 */
	public static String initialize(String extensionPath) {
		// TODO pass also the port to the initialize method, so that user preferences can modify the
		// server port

		// URL log4jPropertiesFileURL = SemanticTurkey.class.getResource("log4j.properties");
		// PropertyConfigurator.configure(log4jPropertiesFileURL);
		File extensionDir = null;
		try {
			extensionDir = SemanticTurkeyOperations.uriToFile(extensionPath);
		} catch (URISyntaxException e) {
			// TODO catch this error and do something in the client which reports the error
			e.printStackTrace();
		}

		logger.debug("initialize...");

		Resources.setExtensionPath(extensionDir.getAbsolutePath());

		try {
			Resources.initializeUserResources();
			XMLHelp.initialize();
		} catch (Exception e) {
			// TODO catch this error and do something in the client which reports the error
			e.printStackTrace();
		}

		logger.debug("userDataPath: " + extensionDir.getAbsolutePath());

		createWebServer();
		PluginManager.loadOntManagersImpl();
		// SemanticTurkey.class.getResource("log4j.properties").toString();
		return null;
	}

	/**
	 * return the server instance
	 * 
	 * @return HttpServer
	 */
	public static HttpServer getHTTPServer() {
		return server;
	}

	/**
	 * this method builds up the HTTP Server in charge of replying to user requests
	 */
	public static void createWebServer() {
		server = new HttpServer();

		SocketListener listener = new SocketListener();
		listener.setPort(port);
		try {
			listener.setInetAddress(InetAddress.getByName("localhost"));
		} catch (UnknownHostException e1) {
			logger.error("UnknownHostException", e1);
			e1.printStackTrace();
		}
		server.addListener(listener);

		HttpContext context = new HttpContext();
		context.setContextPath("semantic_turkey/resources/*");

		context.setResourceBase(Resources.getExtensionPath() + "/components/lib/");
		context.addHandler(new ResourceHandler());
		// context.setClassLoader(WebSearch.class.getClassLoader());
		context.setClassLoader(STServer.class.getClassLoader());

		ServletHandler servlets = new ServletHandler();
		// servlets.addServlet("Websearch", "/*", WebSearch.class.getName());
		servlets.addServlet("STServer", "/stserver/*", STServer.class.getName());
		servlets.addServlet("Proxy", "/graph/*", Proxy.class.getName());
		/*
		 * try { System.out.println( "\n\n\nTEST RECUPERO SERVLET\n\n" + ( (STServer)
		 * servlets.getServletHolder("/stserver/*").getServlet()).getServices("systemStart").getId() ); }
		 * catch (ServletException e1) { // TODO Auto-generated catch block e1.printStackTrace(); }
		 */
		context.addHandler(servlets);
		server.addContext(context);

		try {
			server.start();
		} catch (Exception e) {
			logger.error("Server error start", e);
			e.printStackTrace();
		}
		logger.debug("Server starting...");
	}

	public static void initializeVocabularies(RDFModel repo) throws VocabularyInitializationException {
		// RDF.Res.initialize(repo);
		// RDFS.Res.initialize(repo);
		// OWL.Res.initialize(repo);
		SemAnnotVocab.Res.initialize(repo);
	}

}
