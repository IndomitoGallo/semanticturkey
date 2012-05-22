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

package it.uniroma2.art.semanticturkey.resources;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Properties;

/**
 * Generic PropertyFile Manager. This includes:
 * 
 * @author Armando Stellato
 * 
 */
public class PropertyFileManager {

	private Properties stProperties = null;
	private File propFile = null;
	private String comment;

	/**
	 * as for {@link #PropertyFileManager(File, String)} with the <code>filePath</code> converted to a file
	 * 
	 * @param filePath
	 * @param comment
	 * @throws FileNotFoundException
	 * @throws IOException
	 */
	public PropertyFileManager(String filePath, String comment) throws FileNotFoundException, IOException {
		this(new File(filePath), comment);
	}

	/**
	 * as for {@link #PropertyFileManager(File)} with the <code>filePath</code> converted to a file
	 * 
	 * @param filePath
	 * @throws FileNotFoundException
	 * @throws IOException
	 */
	public PropertyFileManager(String filePath) throws FileNotFoundException, IOException {
		this(new File(filePath));
	}

	/**
	 * loads a property file. Comments will be preserved on subsequent stores, though the order of these
	 * comments is not guaranteed (so useful only for opening remarks and not for "per-property" comments
	 * 
	 * @param file
	 * @throws FileNotFoundException
	 * @throws IOException
	 */
	public PropertyFileManager(File file) throws FileNotFoundException, IOException {
		this(file, loadComments(file));
	}

	public PropertyFileManager(File file, String comment) throws FileNotFoundException, IOException {
		propFile = file;
		stProperties = new Properties();
		this.comment = comment;
		FileInputStream fis = new FileInputStream(propFile);
		stProperties.load(fis);
		fis.close();
	}

	/**
	 * this only preserves all comments but their position in the file is not guaranteed
	 * 
	 * @param propFile
	 * @return
	 * @throws IOException
	 */
	private static String loadComments(File propFile) throws IOException {
		FileInputStream fis = new FileInputStream(propFile);
		StringBuffer comments = new StringBuffer();
		BufferedReader reader = new BufferedReader(new InputStreamReader(fis, "UTF-8"));
		String line;
		while ((line = reader.readLine()) != null) {
			if (line.startsWith("#"))
				comments.append(line);
		}
		fis.close();
		return comments.toString();
	}

	protected void updatePropertyFile() throws ConfigurationUpdateException {
		FileOutputStream os;
		try {
			os = new FileOutputStream(propFile);
			// properties.storeToXML(os, "local cache references for mirroring remote ontologies");
			stProperties.store(os, comment);
			os.close();
		} catch (FileNotFoundException e) {
			throw new ConfigurationUpdateException(propFile, e);
		} catch (IOException e) {
			throw new ConfigurationUpdateException(propFile, e);
		}
	}

	public String getPropertyValue(String propName) {
		return stProperties.getProperty(propName);
	}

	public void setPropertyValue(String propName, String propValue) throws ConfigurationUpdateException {
		stProperties.setProperty(propName, propValue);
		updatePropertyFile();
	}

}
