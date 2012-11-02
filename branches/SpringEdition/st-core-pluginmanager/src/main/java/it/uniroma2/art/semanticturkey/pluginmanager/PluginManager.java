package it.uniroma2.art.semanticturkey.pluginmanager;
import it.uniroma2.art.semanticturkey.pluginmanager.utils.utils;
import java.io.File;

import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.net.URL;

import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;

import java.util.Iterator;
import java.util.Map;
import java.util.Properties;


import org.apache.felix.framework.Felix;
import org.apache.felix.framework.util.Util;

import org.osgi.framework.Bundle;
import org.osgi.framework.BundleException;

public class PluginManager {
	
	public static void initialize(String dummy)
	{

		Felix m_felix = null;
		
		URL stPopertiesURL = PluginManager.class.getResource("st-osgi.properties");
		Properties stProperties = utils.loadProperties(stPopertiesURL);

		Map<String, String> configMap = new HashMap<String, String>();

		configMap.put("felix.bootdelegation.implicit", "false");
		configMap.put("org.osgi.service.http.port", "1979");

		String cwd = System.getProperty("user.dir");
		utils.treeOperations();
		configMap.put("felix.fileinstall.dir", cwd + "\\extensions\\core,"
				+ cwd + "\\extensions\\ontmanager"+utils.listToConfig());
		System.out.println("test: "+cwd + "\\extensions\\core,"
				+ cwd + "\\extensions\\ontmanager"+utils.listToConfig());

		
		configMap.put("org.osgi.framework.bootdelegation",
				"com.sun.*,sun.*,org.hibernate.validator.*");
		configMap
				.put("org.osgi.framework.system.packages.extra",stProperties.getProperty("it.uniroma2.art.semanticturkey.osgi.packages"));
		
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
		} catch (BundleException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (URISyntaxException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	public static void main(String[] args) {

		initialize("dummy");
	}

	

	

	public static void loadAndStart(Felix m_felix) throws URISyntaxException,
			IOException, BundleException {
		String cwd = System.getProperty("user.dir");
		System.out.println(cwd);
		ArrayList<Bundle> StartList = new ArrayList<Bundle>();
		String[] Dep = utils.getResourceListing(cwd + "\\container\\Dependency");
		String[] Str = utils.getResourceListing(cwd + "\\container\\Start");
		
		
		for (int i = 0; i < Dep.length; i++) {
			if (Dep[i].endsWith(".war") || Dep[i].endsWith(".jar")) {
				System.out.println(Dep[i]);

				String toLoad = "file:" + cwd + "\\container\\Dependency\\"
						+ Dep[i];

				m_felix.getBundleContext().installBundle(toLoad);

			}

		}
		for (int k = 0; k < Str.length; k++) {
			if (Str[k].endsWith(".war") || Str[k].endsWith(".jar")) {
				System.out.println(Str[k]);
				StartList.add(m_felix.getBundleContext().installBundle(
						"file:" + cwd + "\\container\\Start\\" + Str[k]));

			}
		}

		Iterator<Bundle> itr = StartList.iterator();
		while (itr.hasNext()) {

			itr.next().start();
		}
	}


}
