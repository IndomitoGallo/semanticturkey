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

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.net.InetAddress;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;

import org.apache.log4j.FileAppender;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;
import org.apache.log4j.SimpleLayout;
import org.apache.log4j.WriterAppender;
import org.mortbay.http.HttpContext;
import org.mortbay.http.HttpServer;
import org.mortbay.http.SocketListener;
import org.mortbay.http.handler.ResourceHandler;
import org.mortbay.jetty.servlet.ServletHandler;

import it.uniroma2.art.semanticturkey.plugin.PluginManager;
import it.uniroma2.art.semanticturkey.repository.STRepositoryManager;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.OntologiesMirror;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.Proxy;
import it.uniroma2.art.semanticturkey.servlet.STServer;
import it.uniroma2.art.semanticturkey.servlet.WebSearch;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;
import it.uniroma2.art.ontapi.OntNamespaceLocationPair;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.exceptions.RepositoryCreationException;
import it.uniroma2.art.ontapi.exceptions.VocabularyInitializationException;
import it.uniroma2.art.ontapi.vocabulary.OWL;
import it.uniroma2.art.ontapi.vocabulary.RDF;
import it.uniroma2.art.ontapi.vocabulary.RDFS;


/**
 *  Classe che si occupa di inizializzare l'applicazione,attivare il file di log,caricare il profilo utente,
 * creare il WebServer associando le relative Servlet (WebSearch,STServer,Proxy) ed infine creare il SesameARTRepositoryImpl
 * relativo all'ontologia 
 *
 */
/**
 * @author Armando Stellato
 * Contributor(s): Andrea Turbati
 *
 */
public class SemanticTurkey {	
	static protected HttpServer     s_httpServer;
	final static private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	
	private final static int port = 1979;	
	private static WriterAppender fileAppender; 	 
	private static HttpServer server = null ;
	
	/**Funzione che attiva il file di log,carica il profilo utente,e richiama le funzioni per avviare 
	 * il WebServer e creare il SesameARTRepositoryImpl
	 * @param String extensionPath: path dell'applicazione
	 * @return String userDataPath: path dove viene installata l'applicazione dell'utente(../extensions di mozilla )*/
	
	public static String initialize(String extensionPath) {		
		URL log4jPropertiesFileURL = SemanticTurkey.class.getResource("log4j.properties");
	    PropertyConfigurator.configure(log4jPropertiesFileURL); 
	    File extensionDir = null;
	    try {
	            extensionDir = SemanticTurkeyOperations.uriToFile(extensionPath);
	        } catch (URISyntaxException e) {            
	            e.printStackTrace();
	    }
	    
	    File logFile = new File(extensionDir, "semanticturkey.log");
	    
	    try {
            Writer logFileWriter = new BufferedWriter(new FileWriter(logFile));
            fileAppender = new WriterAppender(new SimpleLayout(), logFileWriter);
        } catch (IOException e2) {
            e2.printStackTrace();
        }
	    		
		s_logger.addAppender(fileAppender); 		
	    
		s_logger.debug("initialize...");
		

		Resources.setExtensionPath(extensionDir.getAbsolutePath());	
		
		Resources.initializeUserResources();
		
		
	

		s_logger.debug("userDataPath: " + extensionDir.getAbsolutePath());
		

		
		
		createWebServer() ;		
		loadRepository();
		
									
		return log4jPropertiesFileURL.getPath();	
	}
	
	
	/**Questa funzione è (al  momento) inutilizzata*/
	public static void setTracing(boolean tracing) {
		
		Logger root = Logger.getRootLogger();
		if (tracing) {
			root.setLevel(Level.DEBUG);
		} else {
			root.setLevel(Level.ERROR);
		}
	}
	
	
	/**return the server instance
	 * 
	 * @return HttpServer*/
	public static HttpServer getHTTPServer() {
		return server;
	}
	
	
	/**Funzione che si occupa di creare il WebServer (di tipo HttpServer) associando ad esso 
	 * le Servlet e di attivare il socket di comunicazione*/
	public static void createWebServer() {
		server = new HttpServer();
		
		SocketListener listener = new SocketListener();		
		listener.setPort(port);
		try {
			listener.setInetAddress(InetAddress.getByName("localhost"));
		} catch (UnknownHostException e1) {			
			s_logger.error("UnknownHostException", e1);
			e1.printStackTrace();
		}
		server.addListener(listener);
				
		HttpContext context = new HttpContext();
		context.setContextPath("semantic_turkey/resources/*");
			
		context.setResourceBase(Resources.getExtensionPath() + "/components/lib/");
		context.addHandler(new ResourceHandler());		
		context.setClassLoader(WebSearch.class.getClassLoader());
		context.setClassLoader(STServer.class.getClassLoader());
		
		ServletHandler servlets = new ServletHandler();                
		servlets.addServlet("Websearch", "/*", WebSearch.class.getName());        
        servlets.addServlet("STServer", "/stserver/*", STServer.class.getName());
        servlets.addServlet("Proxy", "/graph/*", Proxy.class.getName());
        context.addHandler(servlets);
		server.addContext(context);
		
		try {
			server.start();
		} catch (Exception e) {			
			s_logger.error("Server error start", e);
			e.printStackTrace();
		}
		s_logger.debug("Server starting...");
	}
	
	//STARRED attenzione! bisogna fare qualcosa anche per questi metodi: devono poter scrivere qualcosa fuori nel tacchino se qualcosa non va!
	/**Funzione che crea il repository relativo all'ontologia specificata nel Profilo (Profile.UserDataPath) */
    public static void loadRepository() {	
    	// indica quale implementazione delle api si andrà ad utilizzare
    	String idRepImpl = "";
    	ArrayList <String> repImplIdList= new ArrayList<String>();
    	STRepositoryManager repFactory;
    	//STRepositoryManager repFactory = new SesameARTRepositoryManagerImpl(); //TODO remove this, and delegate to external class which chooses which factory implementation adopt
    	
    	
    	//Carico in Felix i bundle con le implementazioni delle API per il Repository
    	PluginManager.loadRepImpl();
    	
    	//Ottengo la lista degli id delle implementazioni delle API per il Repository
    	//repImplIdList = PluginManager.getRepImplId();
    	
    	/*
    	//Selezionio l'implementazione desiderata
    	// Per il momento se c'è solo una implementazione seleziono quella, 
    	// altrimenti prendo sesame
    	if(PluginManager.getNumRepIml() == 1){
    		repFactory = PluginManager.getRepImpl(idRepImpl);
        }
    	else {
	    	idRepImpl = "sesame"; 
	    	repFactory = PluginManager.getRepImpl(idRepImpl);
    	}
    	System.out.println("Gestore Repository caricato"); // da cancellare
    	    	
    	ARTRepository repository = null;
                
    	try {
			repository = repFactory.loadRepository("prova", Resources.getOntologyDir() + "/" + Config.getRepositoryFile(), Resources.getOntologyDir() + "/new-temp-triples.nt");
		} catch (RepositoryCreationException e) {
			e.printStackTrace();
		}
		Resources.setRepositoryManager(repFactory);
		Resources.setRepository(repository);
        try { initializeVocabularies(repository); } catch (VocabularyInitializationException e) { e.getMessage(); e.printStackTrace(); }
        */
    }
    
    
    
    public static void initializeVocabularies(ARTRepository repo) throws VocabularyInitializationException { 	
        RDF.Res.initialize(repo);
        RDFS.Res.initialize(repo);
        OWL.Res.initialize(repo);
        SemAnnotVocab.Res.initialize(repo);   
    }
  
}
