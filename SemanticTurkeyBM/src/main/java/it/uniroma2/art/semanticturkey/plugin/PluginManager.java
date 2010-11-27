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

package it.uniroma2.art.semanticturkey.plugin;

import it.uniroma2.art.owlart.exceptions.UnavailableResourceException;
import it.uniroma2.art.owlart.models.conf.ModelConfiguration;
import it.uniroma2.art.semanticturkey.ontology.OntologyManagerFactory;
import it.uniroma2.art.semanticturkey.plugin.extpts.PluginInterface;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceInterface;
import it.uniroma2.art.semanticturkey.plugin.extpts.STOSGIExtension;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServletListener;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.STServer;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.felix.framework.Felix;
import org.apache.felix.framework.util.Util;
import org.apache.felix.main.Main;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleException;
import org.osgi.framework.Constants;
import org.osgi.util.tracker.ServiceTracker;

/**
 * @author Andrea Turbati
 * @author Armando Stellato
 * 
 */
public class PluginManager {

	protected static Logger logger = LoggerFactory.getLogger(PluginManager.class);
	private static Felix m_felix = null;

	private static ArrayList<String> jarPresent = new ArrayList<String>();

	private static boolean felixStarted = false;

	private static final String stExtensionsDirName = "extensions";
	private static final String servletExtensionsDirName = stExtensionsDirName + "/service";
	private static final String repositoryExtensionsDirName = stExtensionsDirName + "/ontmanager";

	private static boolean directAccessTest = false;
	private static Class<? extends OntologyManagerFactory<ModelConfiguration>> testOntManagerFactoryCls;

	private static ArrayList<Bundle> bundleToBeStarted = new ArrayList<Bundle>();

	public static boolean isDirectAccessTest() {
		return directAccessTest;
	}

	public static void setDirectAccessTest(boolean test) {
		PluginManager.directAccessTest = test;
	}

	public static void setTestOntManagerFactoryImpl(
			Class<? extends OntologyManagerFactory<ModelConfiguration>> ontmgrcls) {
		testOntManagerFactoryCls = ontmgrcls;
	}

	/**
	 * this method retrieves all OSGi bundles which are located in firefox extensions
	 */
	public static void loadOntManagersImpl() {
		String fireFoxExtensionDir = Resources.getExtensionPath(); // initially initialized with the
		// SemanticTurkey extension folder
		// starts the felix platform
		startFelix();

		File dir = new File(fireFoxExtensionDir);
		// goes up from the ST extension folder to the Firefox extension folder. There should be no need for
		// this while-loop, since the position of the extension folder is stable one folder up in the tree
		while (!(dir.getAbsoluteFile().toString().endsWith("extensions"))) {
			dir = dir.getAbsoluteFile().getParentFile();
		}

		// problema con gli spazi, converto %20 in spazio
		dir = new File(dir.getAbsolutePath().replace("%20", " "));
		String[] filesPath = dir.list();
		if (filesPath != null) {
			bundleToBeStarted.clear();
			// Analizzo tutte le directory contenenti le estensioni per firefox
			for (int i = 0; i < filesPath.length; ++i) {
				findAndInstallPlugin(dir.getAbsolutePath() + "/" + filesPath[i] + "/"
						+ repositoryExtensionsDirName, jarPresent);
			}
		}

		// Faccio la start dei bundle appena trovati
		startAllBundle();
	}

	/**
	 * this method retrieves all IDs of available {@link PluginInterface} implementations installed in the
	 * OSGi framework
	 * 
	 * @return Arraylist
	 */
	public static ArrayList<String> getPluginsIDs() {
		return getServletExtensionsIDForType(PluginInterface.class);
	}

	/**
	 * this method retrieves all available {@link PluginInterface} implementations installed in the OSGi
	 * framework
	 * 
	 * @return
	 */
	public static ArrayList<PluginInterface> getPlugins() {
		return getServletExtensionsForType(PluginInterface.class);
	}

	/**
	 * this method retrieves all IDs of available {@link OntologyManagerFactory} implementations installed in
	 * the OSGi framework
	 * 
	 * @return Arraylist
	 */
	public static ArrayList<String> getOntManagerImplIDs() {
		// test preamble
		if (isDirectAccessTest()) {
			ArrayList<String> repImplIdList = new ArrayList<String>();
			repImplIdList.add(testOntManagerFactoryCls.getName());
			return repImplIdList;
		} else {
			// real use section
			return getServletExtensionsIDForType(OntologyManagerFactory.class);
		}

	}

	/**
	 * Funzione per avere una particolare implemementazione delle API per gestire il repository
	 * 
	 * @param idRepImpl
	 *            id dell'implementazione desiderata
	 * @return handler dell'implementazione desiderata
	 * @throws UnavailableResourceException
	 */
	@SuppressWarnings("unchecked")
	public static OntologyManagerFactory<ModelConfiguration> getOntManagerImpl(String idRepImpl)
			throws UnavailableResourceException {

		OntologyManagerFactory<ModelConfiguration> ontMgrFactory = null;

		// test preamble
		if (isDirectAccessTest()) {
			try {
				ontMgrFactory = testOntManagerFactoryCls.newInstance();
			} catch (InstantiationException e) {
				e.printStackTrace(); // this will be caught by the test unit
			} catch (IllegalAccessException e) {
				e.printStackTrace(); // this will be caught by the test unit
			}
		} else
			// real use section
			ontMgrFactory = getServletExtensionByID(idRepImpl, OntologyManagerFactory.class);

		if (ontMgrFactory == null)
			throw new UnavailableResourceException("OntManagerFactory: " + idRepImpl
					+ " is not available among the registered OSGi Ont Manager factories");

		return ontMgrFactory;
	}

	/**
	 * Funzione per avere il numero di implementazioni delle API per gestire il repository
	 * 
	 * @return numero di implementazioni
	 */
	public static int getNumOntManagers() {
		ServiceTracker m_tracker = null;
		int num = 0;

		m_tracker = new ServiceTracker(m_felix.getBundleContext(), OntologyManagerFactory.class.getName(),
				null);
		m_tracker.open();

		Object[] services = m_tracker.getServices();
		num = services.length;
		m_tracker.close();

		return num;
	}

	/**
	 * Funzione per caricare in felix e quindi nella mappa le classi che devono rispondere alle richieste dei
	 * client
	 * 
	 * @param map
	 *            HashMap che conterr� le classi che gestiscono le richieste del client
	 */
	public static void loadExtensions(STServer stServer) {
		String dirExtension = Resources.getExtensionPath();

		// faccio partire la piattaforma felix
		startFelix();
		File dir = new File(dirExtension);

		while (!(dir.getAbsoluteFile().toString().endsWith("extensions"))) {
			dir = dir.getAbsoluteFile().getParentFile();
			// risalgo le cartelle fino a quando non arrivo alla directory
			// che contiene le estensioni di firefox
		}

		// problema con gli spazi, converto %20 in spazio
		dir = new File(dir.getAbsolutePath().replace("%20", " "));

		String[] filesPath = dir.list();
		if (filesPath != null) {
			bundleToBeStarted.clear();
			// Analizzo tutte le directory contenenti le estensioni per firefox
			for (int i = 0; i < filesPath.length; ++i) {
				findAndInstallPlugin(dir.getAbsolutePath() + "/" + filesPath[i] + "/"
						+ servletExtensionsDirName, jarPresent);
			}
		}

		// Rimuovo i vecchi bundle installati ad un avvio precedente
		removeOldBundle(jarPresent);

		// Faccio la start dei bundle appena trovati
		startAllBundle();

		// Riempio la HashMap con le classi presenti nei bundle giusti
		installPluginAndServices(stServer);

		// Associo i listeners alle classi corrispondenti
		installPluginListener(stServer);

	}

	private static void startAllBundle() {
		for (int i = 0; i < bundleToBeStarted.size(); ++i) {
			try {
				bundleToBeStarted.get(i).start();
			} catch (BundleException e) {
				// TODO REMOVE THIS AND THROW THE EXCEPTION!!!
				System.out.println("error during bundle installation: " + e.getMessage());
				logger.debug("error during bundle installation: " + e.getMessage());
				e.printStackTrace();
			}
		}
		;
	}

	/**
	 * Funzione che fa partire Felix, nel caso non sia gi� stato fatto partire
	 * 
	 */
	private static void startFelix() {

		if (!felixStarted) {
			felixStarted = true;

			URL defaultPropertiesURL = Main.class.getClassLoader().getResource("default.properties");
			Properties defaultProperties = loadProperties(defaultPropertiesURL);

			URL stPopertiesURL = PluginManager.class.getResource("st-osgi.properties");
			Properties stProperties = loadProperties(stPopertiesURL);

			// System.out.println(defaultProperties.getProperty("org.osgi.framework.system.packages"));

			// Create a case-insensitive configuration property map.
			Map<String, String> configMap = new HashMap<String, String>();

			// this removal is from Felix 1.4.0 on: felix.embedded.execution is no more needed since
			// system.exit is never called by the framework (now in charge of the developer
			// configMap.put(FelixConstants.EMBEDDED_EXECUTION_PROP, "true");

			// Updates the org.osgi.framework.system.packages with Semantic Turkey specific packages
			// via the system bundle.
			configMap.put(Constants.FRAMEWORK_SYSTEMPACKAGES, defaultProperties
					.getProperty("org.osgi.framework.system.packages")
					+ ", " + stProperties.getProperty("it.uniroma2.art.semanticturkey.osgi.packages"));

			// System.out.println(configMap.get(Constants.FRAMEWORK_SYSTEMPACKAGES));

			// Explicitly specify the directory to use for caching bundles.
			System.out
					.println("felix dir: " + (new File(Resources.getSemTurkeyDataDir(), "felix")).getPath());
			// TODO check if this change is correct
			// configMap.put(BundleCache.CACHE_PROFILE_DIR_PROP, (new File(Resources.getOntologyDir(),
			// "felix")).getPath() );
			configMap.put("org.osgi.framework.storage", (new File(Resources.getSemTurkeyDataDir(), "felix"))
					.getPath());

			try {

				m_felix = new Felix(configMap);

				// Now start Felix instance.
				m_felix.start();
				logger.info("Felix started"); // da cancellare
			} catch (Exception ex) {
				// TODO remove this catch, throw and catch appropriately
				System.err.println("Could not create framework : " + ex);
				ex.printStackTrace();
			}
		}
	}

	// never invoked explicitly by Semantic Turkey, it is useful when debugging, to stop felix, release
	// control over SemanticTurkeyData dir and delete it
	public static void stopFelix() {
		try {
			m_felix.stop();
			logger.info("Felix stopped");
		} catch (BundleException e) {
			e.printStackTrace();
			logger.info("unable to stop Felix");
		}

	}

	/**
	 * this method searches for existing bundles in a given directory
	 * 
	 * @param dirName
	 *            directory dentro cui cercare i bundle
	 * @param jarPresent
	 *            ArrayList contenente i bundle (jar) fino ad ora caricati a cui va aggiunto quello che si sta
	 *            per caricare
	 */
	// private static void findPlugin(String dirExst, String dirName, ArrayList <String>jarPresent){
	private static void findAndInstallPlugin(String dirName, ArrayList<String> jarPresent) {
		// File dir = new File(dirExst+"/"+dirName);
		File dir = new File(dirName);
		String[] children;
		if (dir.isDirectory()) {
			// è una estensione per Semantic Turkey
			children = dir.list();
			for (int i = 0; i < children.length; i++) {
				if (children[i].endsWith(".jar")) {
					installPlugin(dir.getAbsolutePath() + "/" + children[i], jarPresent);
				}
			}

		}
	}

	/*
	 * private static String getDoubleSystemSeparator() { String sep=System.getProperty("file.separator");
	 * return sep+sep; }
	 */
	/**
	 * Funzione per installare un bundle
	 * 
	 * @param locationJar
	 *            percorso del bundle (jar) da caricare
	 * @param jarPresent
	 *            ArrayList contenente i bundle (jar) fino ad ora caricati a cui va aggiunto quello che si sta
	 *            per caricare
	 */
	private static void installPlugin(String locationJar, ArrayList<String> jarPresent) {
		Bundle bundle = null;
		File bundleJarFile = new File(locationJar);
		String bundleJarFileURIString = bundleJarFile.toURI().toString();

		bundle = getBundleByLocation(bundleJarFileURIString);

		if (bundle == null) { // il bundle non � installato, quindi lo installo
			try {
				logger.info("bundle: " + bundleJarFile + " is not in the bundle cache, installing it now");
				bundle = m_felix.getBundleContext().installBundle(bundleJarFileURIString);
				logger.info("bundle: " + bundleJarFile + " loaded, now being activated");
				// bundle.start();
				bundleToBeStarted.add(bundle);
				jarPresent.add(bundle.getLocation());
				logger.info("bundle: " + bundleJarFile + " started");
			} catch (BundleException e) {
				// TODO REMOVE THIS AND THROW THE EXCEPTION!!!
				System.out.println("error during bundle installation: " + e.getMessage());
				logger.debug("error during bundle installation: " + e.getMessage());
				e.printStackTrace();
			}
		} else {
			// Il bundle � installato, ora controllo se non � stato aggiornato
			jarPresent.add(bundle.getLocation());
			logger.info("bundle: " + bundleJarFile + " is present");
			if (bundle.getLastModified() < bundleJarFile.lastModified()) { // il bundle � stato modificato
				logger.info("bundle: " + bundleJarFile + " has been modified");
				try {
					bundle.stop();
					bundle.uninstall();
					bundle = m_felix.getBundleContext().installBundle(bundleJarFileURIString);
					bundleToBeStarted.add(bundle);
					// bundle.start();
				} catch (BundleException e) {
					// TODO REMOVE THIS AND THROW THE EXCEPTION!!!
					e.printStackTrace();
				}
			}
			// Il bundle non � stato modicato, quindi non faccio niente
		}

	}

	/**
	 * retrieves bundles associated to a given location
	 * 
	 * @param location
	 *            location del bundle ricercato
	 * @return null if no bundle corresponds to the given location
	 */
	private static Bundle getBundleByLocation(String location) {
		Bundle bundles[] = m_felix.getBundleContext().getBundles();
		Bundle bundle = null;
		for (int i = 0; i < bundles.length; ++i) {
			if (bundles[i].getLocation().equals(location)) {
				bundle = bundles[i];
				break;
			}
		}
		return bundle;
	}

	/**
	 * this method is a sort of garbage collector, removing all previously installed bundles belonging to
	 * extensions which have been removed from Firefox
	 * 
	 * @param jarPresent
	 *            {@link ArrayList} containing all bundles loaded by the application
	 */
	private static void removeOldBundle(ArrayList<String> jarPresent) {
		Bundle[] bundles = m_felix.getBundleContext().getBundles();
		for (int i = 0; i < bundles.length; ++i) {
			if (!(jarPresent.contains(bundles[i].getLocation()))
					&& !(bundles[i].getLocation().equals("System Bundle"))) {
				logger.info("removing bundle: " + bundles[i].getLocation());
				try {
					bundles[i].stop();
					bundles[i].uninstall();
				} catch (BundleException e) {
					// TODO REMOVE THIS AND THROW THE EXCEPTION!!!
					e.printStackTrace();
				}
			}
		}
	}

	// TODO this one hs to be more robust, to take into accout runtime exception (class cast etc...)
	// an report failure on installing a given service
	/**
	 * This method adds services to Semantic Turkey HTTP server
	 * 
	 * @param map
	 *            HashMap contenente le classi deputate alla risposta delle richieste del client
	 */
	private static void installPluginAndServices(STServer stServer) {
		logger.debug("registering services on Semantic Turkey HTTP Server");

		ArrayList<ServiceInterface> services = getServletExtensionsForType(ServiceInterface.class);
		for (ServiceInterface service : services) {
			stServer.registerService(service.getId(), service);
		}

		ArrayList<PluginInterface> plugins = getServletExtensionsForType(PluginInterface.class);
		for (PluginInterface plugin : plugins) {
			stServer.registerPlugin(plugin.getId(), plugin);
		}

		/*
		 * ServiceTracker m_tracker = null; m_tracker = new ServiceTracker(m_felix.getBundleContext(),
		 * ServiceInterface.class.getName(), null); m_tracker.open(); Object[] services =
		 * m_tracker.getServices(); for (int i = 0; (services != null) && i < services.length; ++i) {
		 * logger.info("service: " + services[i]); stServer .registerService(((ServiceInterface)
		 * services[i]).getId(), (ServiceInterface) services[i]); logger.info("has been registered"); }
		 * m_tracker.close();
		 * 
		 * logger.debug("registering plugin services on Semantic Turkey HTTP Server"); m_tracker = new
		 * ServiceTracker(m_felix.getBundleContext(), PluginInterface.class.getName(), null);
		 * m_tracker.open(); Object[] plugins = m_tracker.getServices(); for (int i = 0; (plugins != null) &&
		 * i < plugins.length; ++i) { logger.info("plugin service: " + plugins[i]);
		 * stServer.registerPlugin(((PluginInterface) plugins[i]).getId(), (PluginInterface) plugins[i]);
		 * logger.info("has been registered"); } m_tracker.close();
		 * logger.debug("all services have been registered on Semantic Turkey HTTP Server");
		 */
	}

	/**
	 * Funzione per installare i Listeners alle classi utilizzati dalla servlet per soddisfare le richieste
	 * del client
	 * 
	 * @param map
	 *            HashMap contenente le classi sutilzzare dalla Servlet
	 */
	private static void installPluginListener(STServer stServer) {
		ServiceTracker m_tracker = null;
		m_tracker = new ServiceTracker(m_felix.getBundleContext(), ServletListener.class.getName(), null);
		m_tracker.open();
		ServiceInterface service;

		Object[] listeners = m_tracker.getServices();
		for (int i = 0; (listeners != null) && i < listeners.length; ++i) {
			service = stServer.getServices(((ServletListener) listeners[i]).getId());
			if (service != null) {
				service.addListener((ServletListener) listeners[i]);
			}
		}
		m_tracker.close();
	}

	/**
	 * this method retrieves property files for adding standard java packages (javax etc..) to be exported
	 * from Semantic Turkey
	 * 
	 * @param propURL
	 * @return
	 */
	private static Properties loadProperties(URL propURL) {
		// this portion of code (try-catch block) is borrowed from ExtensionManager in felix jar
		Properties props = new Properties();
		InputStream is = null;

		try {
			is = propURL.openConnection().getInputStream();
			props.load(is);
			is.close();
			// Perform variable substitution for system properties.
			for (Enumeration<?> e = props.propertyNames(); e.hasMoreElements();) {
				String name = (String) e.nextElement();
				props.setProperty(name, Util.substVars(props.getProperty(name), name, null, props));
			}
			logger.info("Loading properties: " + propURL);
		} catch (Exception ex2) {
			// Try to close input stream if we have one.
			try {
				if (is != null)
					is.close();
			} catch (IOException ex3) {
				// Nothing we can do.
			}
			logger.error("Unable to load any configuration properties: " + propURL);
		}
		return props;
	}

	@SuppressWarnings("unchecked")
	private static <T extends STOSGIExtension> T getServletExtensionByID(String idRepImpl, Class<T> type) {
		ServiceTracker m_tracker = null;
		T repImpl = null;

		m_tracker = new ServiceTracker(m_felix.getBundleContext(), type.getName(), null);
		m_tracker.open();

		Object[] services = m_tracker.getServices();
		for (int i = 0; (services != null) && i < services.length; ++i) {
			if (((T) services[i]).getId().equals(idRepImpl)) {
				repImpl = (T) services[i];
				break;
			}
		}
		m_tracker.close();
		return repImpl;
	}

	private static ArrayList<String> getServletExtensionsIDForType(Class<? extends STOSGIExtension> type) {
		ArrayList<String> servletExtensionsList = new ArrayList<String>();

		ServiceTracker m_tracker = null;
		m_tracker = new ServiceTracker(m_felix.getBundleContext(), type.getName(), null);
		m_tracker.open();

		Object[] services = m_tracker.getServices();
		for (int i = 0; (services != null) && i < services.length; ++i) {
			servletExtensionsList.add(((STOSGIExtension) services[i]).getId());
		}
		m_tracker.close();

		return servletExtensionsList;
	}

	@SuppressWarnings("unchecked")
	private static <T extends STOSGIExtension> ArrayList<T> getServletExtensionsForType(Class<T> type) {
		ArrayList<T> servletExtensionsList = new ArrayList<T>();

		ServiceTracker m_tracker = null;
		m_tracker = new ServiceTracker(m_felix.getBundleContext(), type.getName(), null);
		m_tracker.open();

		Object[] services = m_tracker.getServices();
		for (int i = 0; (services != null) && i < services.length; ++i) {
			servletExtensionsList.add((T) services[i]);
		}
		m_tracker.close();

		return servletExtensionsList;
	}

}
