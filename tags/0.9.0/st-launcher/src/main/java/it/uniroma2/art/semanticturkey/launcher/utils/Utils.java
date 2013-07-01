package it.uniroma2.art.semanticturkey.launcher.utils;


import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.Properties;

import org.apache.felix.framework.util.Util;

public class Utils {
	private static ArrayList<String> newlist = new ArrayList<String>();
	private static ArrayList<String> oldlist = new ArrayList<String>();
	private static ArrayList<String> difflist= new ArrayList<String>();
	public static String[] getResourceListing(String path) {

		String files;
		File folder = new File(path);
		File[] listOfFiles = folder.listFiles();
		String[] toReturn = new String[listOfFiles.length];
		int j = 0;
		for (int i = 0; i < listOfFiles.length; i++) {

			if (listOfFiles[i].isFile()) {
				files = listOfFiles[i].getName();
				toReturn[j] = files;
				j++;
			}
		}
		return toReturn;
	}
	public static void treeOperations()
	{
		deleteDummyDirs();
		String cwd = System.getProperty("user.dir");
		buildExtensionTree();
		
		loadToList(oldlist, cwd + File.separator + "extensions" + File.separator + "oldtree.bak");
		eraseFile(cwd + File.separator + "extensions" + File.separator + "oldtree.bak");
		saveToFile(newlist,cwd + File.separator + "extensions" + File.separator + "oldtree.bak");
		buildDiff();
		eraseFile(cwd + File.separator + "extensions" + File.separator + "toDelete.bak");
		saveToFile(difflist, cwd + File.separator + "extensions" + File.separator + "toDelete.bak");
		createDummyDirs();
		
	}
	public static String listToConfig()
	{
		String toReturn="";
		java.util.Iterator<String> newIterator=newlist.iterator();
		java.util.Iterator<String> difIterator=difflist.iterator();
		while(newIterator.hasNext())
		{
			toReturn=toReturn+","+newIterator.next();
		}
		while(difIterator.hasNext())
		{
			toReturn=toReturn+","+difIterator.next();
		}
		return toReturn;
	}
	public static void buildDiff()
	{
		java.util.Iterator<String> olditer=oldlist.iterator();
		while(olditer.hasNext())
		{
			Boolean finded=false;
			String old=olditer.next();
			java.util.Iterator<String> newiter=newlist.iterator();
			while(newiter.hasNext())
			{
				if(old.equals(newiter.next()))finded=true;
			}
			if (finded==false)difflist.add(old);
		}
	}
	public static void buildExtensionTree() {

		File dir = new File(System.getProperty("user.dir"));
		dir = dir.getParentFile();
		String[] filesPath = dir.list();
		File extdir;
		if (filesPath != null) {
			for (String Paths : filesPath) {
				extdir = new File(dir.getAbsolutePath() + File.separator + Paths + File.separator
						+ "extensions" + File.separator + "service");
				if (extdir.exists()) {
					newlist.add(dir.getAbsolutePath() + File.separator + Paths + File.separator
							+ "extensions" + File.separator+ "service");
				}
			}

		}

	}
	public static void createDummyDirs()
	{
		java.util.Iterator<String> difIterator=difflist.iterator();
		while(difIterator.hasNext())
		{
			(new File(difIterator.next())).mkdirs();
		}
	}
	public static void deleteDummyDirs()
	{
		String cwd = System.getProperty("user.dir");
		ArrayList<String> toDelete=new ArrayList<String>();
		loadToList(toDelete, cwd + File.separator + "extensions" + File.separator + "toDelete.bak");
		java.util.Iterator<String> delIterator=toDelete.iterator();
		while(delIterator.hasNext())
		{
			File toDeleteFile=new File(delIterator.next());
			while(toDeleteFile.delete())
			{
				toDeleteFile=toDeleteFile.getParentFile();
			}
		}
	}
	public static void loadToList(ArrayList<String> dest,String file) {


		try {
			// Open the file that is the first
			// command line parameter
			FileInputStream fstream = new FileInputStream(file);
			// Get the object of DataInputStream
			DataInputStream in = new DataInputStream(fstream);
			BufferedReader br = new BufferedReader(new InputStreamReader(in));
			String strLine;
			// Read File Line By Line
			while ((strLine = br.readLine()) != null) {
				// Print the content on the console
				dest.add(strLine);
			}
			// Close the input stream
			in.close();
		} catch (Exception e) {// Catch exception if any
			System.err.println("Error: " + e.getMessage());
		}

	}

	public static void eraseFile(String file) 
	{
		String cwd = System.getProperty("user.dir");
		File yourFile = new File(file);
		yourFile.delete();
		File yourNewFile = new File(file);
		try {
			yourNewFile.createNewFile();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public static void saveToFile(ArrayList<String> src,String dst) {

		try {
			BufferedWriter bw = new BufferedWriter(new FileWriter(new File(dst), true));
			java.util.Iterator<String> iter= src.iterator();
			while(iter.hasNext())
			{
				bw.write(iter.next());
				bw.newLine();
					
			}
			bw.close();
		} catch (Exception e) {
		}
	}

	
	public static Properties loadProperties(URL propURL) {
		// this portion of code (try-catch block) is borrowed from
		// ExtensionManager in felix jar
		Properties props = new Properties();
		InputStream is = null;

		try {
			is = propURL.openConnection().getInputStream();
			props.load(is);
			is.close();
			// Perform variable substitution for system properties.
			for (Enumeration<?> e = props.propertyNames(); e.hasMoreElements();) {
				String name = (String) e.nextElement();
				props.setProperty(name, Util.substVars(props.getProperty(name),
						name, null, props));
			}
		} catch (Exception ex2) {
			// Try to close input stream if we have one.
			try {
				if (is != null)
					is.close();
			} catch (IOException ex3) {
				// Nothing we can do.
			}

		}
		return props;
	}

}
