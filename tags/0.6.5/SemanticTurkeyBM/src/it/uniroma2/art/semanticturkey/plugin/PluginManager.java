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
  
 /**
 * @author Andrea Turbati
 *
 */
 
package it.uniroma2.art.semanticturkey.plugin;

import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.plugin.extpts.InterfaceServiceServlet;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServletListener;
import it.uniroma2.art.semanticturkey.repository.STRepositoryManager;
import it.uniroma2.art.semanticturkey.resources.Resources;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.felix.framework.Felix;
import org.apache.felix.framework.cache.BundleCache;
import org.apache.felix.framework.util.FelixConstants;
import org.apache.log4j.Logger;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleException;
import org.osgi.framework.Constants;
import org.osgi.util.tracker.ServiceTracker;



/**
 * @author Andrea Turbati
 * Contributor: Armando Stellato
 *
 */
public class PluginManager {
    
    final private static Logger s_logger = Logger.getLogger(SemanticTurkey.class);
	private  static Felix m_felix = null;
	
	private static ArrayList <String>jarPresent = new ArrayList<String>();
	
	private static boolean felixStarted = false;
	
	private static final String stExtensionsDirName = "extensions";
	private static final String servletExtensionsDirName = stExtensionsDirName+"/servlets";
	private static final String repositoryExtensionsDirName = stExtensionsDirName+"/repository";
	
	
	/**
	 * Funzione che carica in Felix i bundle relativi alle implementazioni delle API 
	 * per il Repository
	 * 
	 */
	public static void loadRepImpl(){
		String fireFoxExtensionDir = Resources.getExtensionPath(); //initially initialized with the SemanticTurkey extension folder
		// starts the felix platform
		startFelix();  
		
		File dir = new File(fireFoxExtensionDir);
        // goes up from the ST extension folder to the Firefox extension folder. There should be no need for this while-loop, since the position of the extension folder is stable one folder up in the tree
		while(!(dir.getAbsoluteFile().toString().endsWith("extensions"))){
			dir = dir.getAbsoluteFile().getParentFile();
		}
		
		// problema con gli spazi, converto %20 in spazio
		dir = new File(dir.getAbsolutePath().replace("%20", " "));		
		String []filesPath = dir.list();
		if(filesPath != null){
			//Analizzo tutte le directory contenenti le estensioni per firefox
			for(int i=0; i<filesPath.length; ++i){
				findPlugin(dir.getAbsolutePath()+"/"+filesPath[i]+"/"+repositoryExtensionsDirName, jarPresent);  
			}
		}
	}
	
	/**
	 * Funzione per avere l'id di tutte le possibili implementazioni delle API 
	 * per il repository
	 * 
	 * @return Arraylist con gli id delle implementazioni delle API
	 */
	public static ArrayList<String> getRepImplId(){
		ArrayList <String>repImplIdList = new ArrayList<String>();
		
		ServiceTracker m_tracker = null;
		m_tracker = new ServiceTracker(m_felix.getBundleContext(), 
				STRepositoryManager.class.getName(), null);
		m_tracker.open();
    
		Object [] services = m_tracker.getServices();
		for(int i=0; (services != null) && i<services.length; ++i ){
			repImplIdList.add(((STRepositoryManager)services[i]).getId());
	    }
		m_tracker.close();
		
		return repImplIdList;
	}
	
	 
	/**
	 * Funzione per avere una particolare implemementazione delle API per 
	 * gestire il repository
	 * 
	 * @param idRepImpl id dell'implementazione desiderata
	 * @return handler dell'implementazione desiderata
	 */
	public static STRepositoryManager getRepImpl(String idRepImpl){
		ServiceTracker m_tracker = null;
		STRepositoryManager repImpl = null;
		
		m_tracker = new ServiceTracker(m_felix.getBundleContext(), 
				STRepositoryManager.class.getName(), null);
		m_tracker.open();
    
		Object [] services = m_tracker.getServices();
		for(int i=0; (services != null) && i<services.length; ++i ){
			if(idRepImpl.equals("")){
				repImpl = (STRepositoryManager)services[i];
				break;
			}
			else if( ((STRepositoryManager)services[i]).getId().equals(idRepImpl)){
				repImpl = (STRepositoryManager)services[i];
				break;
			}
	    }
		m_tracker.close();
		return repImpl;
	}
	
	/**
	 * Funzione per avere il numero di implementazioni delle API per 
	 * gestire il repository
	 * @return numero di implementazioni
	 */
	public static int getNumRepIml(){
		ServiceTracker m_tracker = null;
		int num=0;
	
		m_tracker = new ServiceTracker(m_felix.getBundleContext(), 
				STRepositoryManager.class.getName(), null);
		m_tracker.open();
    
		Object [] services = m_tracker.getServices();
		num = services.length;
		m_tracker.close();
		
		return num;
	}
	
	
	/**
	 * Funzione per caricare in felix e quindi nella mappa le classi che devono 
	 * rispondere alle richieste dei client
	 * 
	 * @param map HashMap che conterrà le classi che gestiscono le richieste del client
	 */
	public static void loadServletExtensionsIntoMap(HashMap<String, InterfaceServiceServlet> map){
		String dirExtension = Resources.getExtensionPath();
		
		// faccio partire la piattaforma felix
		startFelix();  
		File dir = new File(dirExtension);
		
		while(!(dir.getAbsoluteFile().toString().endsWith("extensions"))){
			dir = dir.getAbsoluteFile().getParentFile();
			// risalgo le cartelle fino a quando non arrivo alla directory 
			// che contiene le estensioni di firefox
		}
		
		// problema con gli spazi, converto %20 in spazio
		dir = new File(dir.getAbsolutePath().replace("%20", " "));
		
		String []filesPath = dir.list();
		if(filesPath != null) {
			//Analizzo tutte le directory contenenti le estensioni per firefox
			for(int i=0; i<filesPath.length; ++i){
				findPlugin(dir.getAbsolutePath()+"/"+filesPath[i]+"/"+ servletExtensionsDirName, jarPresent);  
			}
		}
		
		// Rimuovo i vecchi bundle installati ad un avvio precedente
		removeOldBundle(jarPresent);
		
		// Riempio la HashMap con le classi presenti nei bundle giusti
		installPluginServlet(map);
		
		// Associo i listeners alle classi corrispondenti
		installPluginListener(map);
				
	}
	
	
	/**
	 * Funzione che fa partire Felix, nel caso non sia già stato fatto partire
	 * 
	 */
	private static void startFelix(){
		
		if(!felixStarted) {
			felixStarted = true;
		
			// Create a case-insensitive configuration property map.
	        Map<String, String> configMap = new HashMap<String, String>();
	        
	        // Configure the Felix instance to be embedded.
	        configMap.put(FelixConstants.EMBEDDED_EXECUTION_PROP, "true");
	        // Add core OSGi packages to be exported from the class path
	        // via the system bundle.
	        configMap.put(Constants.FRAMEWORK_SYSTEMPACKAGES,
	        		"org.osgi.framework; version=1.3.0," +
		            "org.osgi.service.packageadmin; version=1.2.0," +
		            "org.osgi.service.startlevel; version=1.0.0," +
		            "org.osgi.service.url; version=1.0.0," +
		            "org.w3c.dom," +
		            "org.xml.sax," +
		            "it.uniroma2.art.semanticturkey," +
		            "it.uniroma2.art.semanticturkey.exceptions," +
		            "it.uniroma2.art.semanticturkey.filter," +
		            "it.uniroma2.art.semanticturkey.plugin," +
		            "it.uniroma2.art.semanticturkey.plugin.extpts," +
		            "it.uniroma2.art.semanticturkey.repository," +
	                "it.uniroma2.art.semanticturkey.repository.utilities," +
	                "it.uniroma2.art.semanticturkey.resources," +
	                "it.uniroma2.art.semanticturkey.servlet," +
	                "it.uniroma2.art.semanticturkey.utilities," +
	                "it.uniroma2.art.semanticturkey.vocabulary," +
		            "it.uniroma2.art.ontapi," +
		            "it.uniroma2.art.ontapi.exceptions," +
		            "it.uniroma2.art.ontapi.filter," +
		            "it.uniroma2.art.ontapi.resources," +
		            "it.uniroma2.art.ontapi.vocabulary," +
		            "it.uniroma2.art.ontapi.utilities," +
		            "javax.servlet.http," +
		            "javax.xml.parsers," +
		            "javax.xml.transform," +
		            "org.apache.log4j," +
		            "org.apache.xerces," +
		            "org.apache.xerces.dom," +
		            "org.apache.commons.collections," + 
		            "org.apache.commons.collections.bidimap," +
		            "org.apache.commons.collections.iterators," +
		            "org.apache.commons.collections.functors," +
		            "org.apache.commons.collections.map," +
		            "com.sun.org.apache.xerces.internal.dom");
		    //aggiungere i package che vanno esportati per i bundle
	        
	        // Explicitly specify the directory to use for caching bundles.
	        System.out.println("felix dir: " + (new File(Resources.getOntologyDir(),"felix")).getPath() );
	        configMap.put(BundleCache.CACHE_PROFILE_DIR_PROP, (new File(Resources.getOntologyDir(),"felix")).getPath() );
	        
	        try
	        {
	            // Create host activator;
	            List list = new ArrayList();
	
	            // Now create an instance of the framework with
	            // our configuration properties and activator.
	            m_felix = new Felix(configMap, list);
	
	            
	            // Now start Felix instance.
	            m_felix.start();
	            System.out.println("Felix è partito"); // da cancellare
	        }
	        catch (Exception ex)
	        {
	            System.err.println("Could not create framework : " + ex);
	            ex.printStackTrace();
	        }
		}
	}
	
	
	/**
	 * Funzione per cercare i bundle da caricare in una directory data
	 * 
	 * @param dirName directory dentro cui cercare i bundle
	 * @param jarPresent ArrayList contenente i bundle (jar) fino ad ora caricati a cui va 
	 * aggiunto quello che si sta per caricare
	 */
	//private static void findPlugin(String dirExst, String dirName, ArrayList <String>jarPresent){
	private static void findPlugin(String dirName, ArrayList <String>jarPresent){
		//File dir = new File(dirExst+"/"+dirName); 
		File dir = new File(dirName); 
		String[] children;
		if(dir.isDirectory()){
			// è una estensione per Semantic Turkey
			children = dir.list();
			for (int i=0; i<children.length; i++) {
				if(children[i].endsWith(".jar")){
					loadPlugin(dir.getAbsolutePath()+"/"+children[i], jarPresent);
				}
			}
			
		}
		
	}

/*	
	private static String getDoubleSystemSeparator() {
	    String sep=System.getProperty("file.separator");
	    return sep+sep;
	}
*/	
	/**
	 * Funzione per caricare un bundle
	 * @param locationJar percorso del bundle (jar) da caricare
	 * @param jarPresent ArrayList contenente i bundle (jar) fino ad ora caricati a cui va 
	 * aggiunto quello che si sta per caricare
	 */
	private static void loadPlugin(String locationJar, ArrayList <String>jarPresent){
		Bundle bundle = null;
		File bundleJarFile = new File(locationJar);	
		String bundleJarFileURIString = bundleJarFile.toURI().toString();
		
		bundle = getBundleByLocation(bundleJarFileURIString);
		
		
		if(bundle == null){ // il bundle non è installato, quindi lo installo
			try {
			    s_logger.info("bundle: " + bundleJarFile + " is not present");
				bundle = m_felix.getBundleContext().installBundle(bundleJarFileURIString);
				s_logger.info("bundle: " + bundleJarFile + " is being loaded"); 
				bundle.start();
				jarPresent.add(bundle.getLocation());
				s_logger.info("bundle: " + bundleJarFile + " started");
			} catch (BundleException e) {
				e.printStackTrace();
			}
		}
		else {
			// Il bundle è installato, ora controllo se non è stato aggiornato
			jarPresent.add(bundle.getLocation());
			s_logger.info("bundle: " + bundleJarFile + " is present"); 
			if(bundle.getLastModified() < bundleJarFile.lastModified()){ // il bundle è stato modificato
			    s_logger.info("bundle: " + bundleJarFile + " has been modified"); 
				try {
					bundle.stop();
					bundle.uninstall();
					bundle = m_felix.getBundleContext().installBundle(bundleJarFileURIString);
					bundle.start();
				} catch (BundleException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				}
			}
			// Il bandle non è stato modicato, quindi non faccio niente
		}
		
	}
	
	/**
	 * Funzione per avere Bundle a partire dal suo identificativo location
	 * 
	 * @param location location del bundle ricercato
	 * @return Bundle cercato o null nel caso nessu bundle corrisponda ai criteri desiderati
	 */
	private static Bundle getBundleByLocation(String location){
		Bundle bundles [] = m_felix.getBundleContext().getBundles();
		Bundle bundle = null;
		for(int i=0; i<bundles.length; ++i){
			if(bundles[i].getLocation().equals(location)){
				bundle = bundles[i];
				break;
			}
		}
		return bundle; 
	}
	
	/**
	 * Funzione che rimuove i Bundle caricati ad un avvio precedente e che l'untente ha rimosso
	 * tramite Fifefox, quindi che non hanno più ragione di esistere in Felix
	 * 
	 * @param jarPresent ArrayList dei Bundle caricati durante l'avvio dell'applicazione 
	 */
	private static void removeOldBundle(ArrayList <String>jarPresent){
		Bundle []bundles = m_felix.getBundleContext().getBundles();
		for(int i=0; i<bundles.length; ++i){
			if(!(jarPresent.contains(bundles[i].getLocation())) &&
					!(bundles[i].getLocation().equals("System Bundle"))){
				System.out.println("rimuovo: "+bundles[i].getLocation());
				try {
					bundles[i].stop();
					bundles[i].uninstall();
				} catch (BundleException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		}
	}
	
	
	
	/**
	 * Funzione per il riempimento della HashMap con le classi deputate alla risposta 
	 * delle richieste del client
	 * 
	 * @param map HashMap contenente le classi deputate alla risposta delle richieste del client
	 */
	private static void installPluginServlet(HashMap<String, InterfaceServiceServlet> map){
		ServiceTracker m_tracker = null;
		m_tracker = new ServiceTracker(m_felix.getBundleContext(), 
				InterfaceServiceServlet.class.getName(), null);
		m_tracker.open();
    
		Object [] services = m_tracker.getServices();
		for(int i=0; (services != null) && i<services.length; ++i ){
	    	map.put(((InterfaceServiceServlet) services[i]).getId(), 
	    			(InterfaceServiceServlet)services[i]);
	    }
		m_tracker.close();
	}
	
	
	/**
	 * Funzione per installare i Listeners alle classi utilizzati dalla servlet per 
	 * soddisfare le richieste del client
	 * 
	 * @param map HashMap contenente le classi sutilzzare dalla Servlet
	 */
	private static void installPluginListener(HashMap<String, InterfaceServiceServlet> map){
		ServiceTracker m_tracker = null;
		m_tracker = new ServiceTracker(m_felix.getBundleContext(), 
				ServletListener.class.getName(), null);
		m_tracker.open();
		InterfaceServiceServlet service;
		
		Object [] listeners = m_tracker.getServices();
		for(int i=0; (listeners != null) && i<listeners.length; ++i ){
			service = map.get(((ServletListener)listeners[i]).getId());
			if(service != null) {
				service.addListener((ServletListener)listeners[i]);
			}
	    }
		m_tracker.close();
	}
	
	/**
	 * Funzione che ferma Felix
	 * Al momento non è utilizzata, in quanto felix andrebbe fermato solo alla chiusura 
	 * dell'applicazione e non durante la vita dell'applicazione stessa, altrimenti i 
	 * bundle diventano inutilizzabili
	 * 
	 */
	private void stopFelix(){
		try {
			m_felix.stop();
		} catch (BundleException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
}

