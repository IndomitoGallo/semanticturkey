package it.uniroma2.art.semanticturkey.launcher;

import it.uniroma2.art.semanticturkey.launcher.utils.Utils;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Properties;

import org.apache.felix.framework.Felix;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SemanticTurkeyLauncher {	
	// Sort the bundles to be installed and loaded with respect to their locations. This should guarantee
	// comparability among different test environments in case of failures during the booststrap process
	public static final boolean SORT_BUNDLES = true;
		
	public static void main(String[] args) {
		initialize("dummy");
	}

	public static void initialize(String dummy) {
		Felix m_felix = null;

		System.out.println("Starting Semantic Turkey");
		
		URL stPopertiesURL = SemanticTurkeyLauncher.class.getResource("st-osgi.properties");
		Properties stProperties = Utils.loadProperties(stPopertiesURL);

		Map<String, String> configMap = new HashMap<String, String>();

		configMap.put("felix.bootdelegation.implicit", "false");
		configMap.put("org.ops4j.pax.logging.DefaultServiceLog.level", "ERROR");
		// configMap.put("org.osgi.service.http.port", "1979");

		String cwd = System.getProperty("user.dir");
		Utils.treeOperations();
		configMap.put("felix.fileinstall.dir", cwd + File.separator + "extensions" + File.separator + "core,"
				+ cwd + File.separator + "extensions" + File.separator + "ontmanager" + Utils.listToConfig());
		System.out.println("test: " + cwd + File.separator + "extensions" + File.separator + "core," + cwd
				+ File.separator + "extensions" + File.separator + "ontmanager" + Utils.listToConfig());

		
		configMap.put("org.osgi.framework.bootdelegation", "com.sun.*,sun.*,org.hibernate.validator.*");
		configMap.put("org.osgi.framework.system.packages.extra",
				stProperties.getProperty("it.uniroma2.art.semanticturkey.osgi.packages"));

		// configMap.put("felix.cm.dir", new
		// File(System.getProperty("user.dir"),
		// "config").getAbsolutePath());

		configMap.put("org.ops4j.pax.logging.DefaultServiceLog.level", "ERROR");

		try {

			m_felix = new Felix(configMap);

			// Now start Felix instance.
			m_felix.start();
		} catch (Exception ex) {
			// TODO remove this catch, throw and catch appropriately
			System.err.println("Could not create framework : " + ex);
			ex.printStackTrace();
		}

		try {
			loadAndStart(m_felix);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		System.out.println("Semantic Turkey started");
	}

	public static void loadAndStart(Felix m_felix) throws URISyntaxException, IOException, BundleException {
		System.out.println("loadAndStart....");
		String cwd = System.getProperty("user.dir");
		System.out.println(cwd);
		ArrayList<Bundle> bundleToBeStarted = new ArrayList<Bundle>();
		String[] depBundlePaths = Utils.getResourceListing(cwd + File.separator + "container" + File.separator
				+ "Dependency");
		String[] startBundlePaths = Utils
				.getResourceListing(cwd + File.separator + "container" + File.separator + "Start");
		
		if (SORT_BUNDLES) {
			Arrays.sort(depBundlePaths);
			Arrays.sort(startBundlePaths);
		}

		System.out.println("Loading deps..." + depBundlePaths.length);
		for (int i = 0; i < depBundlePaths.length; i++) {
			if (depBundlePaths[i].endsWith(".war") || depBundlePaths[i].endsWith(".jar")) {
				System.out.println("file:" + cwd + File.separator + "container" + File.separator
						+ "Dependency" + File.separator + depBundlePaths[i]);

				String toLoad = "file:" + cwd + File.separator + "container" + File.separator + "Dependency"
						+ File.separator + depBundlePaths[i];
				m_felix.getBundleContext().installBundle(toLoad);
			}
		}

		System.out.println("Loading start..." + startBundlePaths.length);
		for (int k = 0; k < startBundlePaths.length; k++) {
			if (startBundlePaths[k].endsWith(".war") || startBundlePaths[k].endsWith(".jar")) {
				System.out.println("file:" + cwd + File.separator + "container" + File.separator + "Start"
						+ File.separator + startBundlePaths[k]);
				bundleToBeStarted.add(m_felix.getBundleContext().installBundle(
						"file:" + cwd + File.separator + "container" + File.separator + "Start"
								+ File.separator + startBundlePaths[k]));
			}
		}
		
		System.out.println("Starting bundles...");
		Iterator<Bundle> itr = bundleToBeStarted.iterator();
		while (itr.hasNext()) {
			Bundle b = itr.next();

			System.out.println("Starting bundle " + b.getSymbolicName() + " Bundle state: " + b.getState());
			b.start();
			System.out.println("After activation " + b.getState());
		}

		System.out.println("loadAndStart....DONE");
	}
}
