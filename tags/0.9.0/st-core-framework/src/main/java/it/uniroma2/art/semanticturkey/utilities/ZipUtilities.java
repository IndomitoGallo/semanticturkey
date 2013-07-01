/*
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License");  you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * http//www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 *
 * The Original Code is HOWTO.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2009.
 * All Rights Reserved.
 *
 * HOWTO was developed by the Artificial Intelligence Research Group
 * (ai-nlp.info.uniroma2.it) at the University of Roma Tor Vergata
 * Current information about HOWTO can be obtained at 
 * http//ai-nlp.info.uniroma2.it/software/...
 *
 */

/*
 * Contributor(s): Armando Stellato stellato@info.uniroma2.it
 */
package it.uniroma2.art.semanticturkey.utilities;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.SortedSet;
import java.util.Stack;
import java.util.TreeSet;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;

/**
 * Zip utility copied from various examples from the Web
 * 
 * UnZip utility copied from a UnZip sample class UnZip print or unzip a JAR or PKZIP file using
 * java.util.zip. Command-line version: extracts files.
 * 
 * @author Ian Darwin, Ian@DarwinSys.com $Id: UnZip.java,v 1.7 2004/03/07 17:40:35 ian Exp $
 */
public class ZipUtilities {

	static void createZipFile(File srcDir, File out, boolean includeBase, boolean verbose, String comment) throws IOException {
		createZipFile(srcDir, new FileOutputStream(out), includeBase, verbose, comment);
	}

	static void createZipFile(File srcDir, OutputStream out, boolean includeBase, boolean verbose, String comment)
			throws IOException {

		List<String> fileList = listDirectory(srcDir);
		ZipOutputStream zout = new ZipOutputStream(out);

		zout.setLevel(9);
		zout.setComment(comment);

		for (String fileName : fileList) {
			File file = new File(srcDir.getParent(), fileName);
						
			if (!includeBase)
				fileName = fileName.replaceAll(srcDir.getName() + "\\\\", "");
			
			if (verbose)
				System.out.println("  adding: " + fileName);

			// Zip always use / as separator
			String zipName = fileName;
			if (File.separatorChar != '/')
				zipName = fileName.replace(File.separatorChar, '/');
			ZipEntry ze;
			if (file.isFile()) {
				ze = new ZipEntry(zipName);
				ze.setTime(file.lastModified());
				zout.putNextEntry(ze);
				FileInputStream fin = new FileInputStream(file);
				byte[] buffer = new byte[4096];
				for (int n; (n = fin.read(buffer)) > 0;)
					zout.write(buffer, 0, n);
				fin.close();
			} else {
				ze = new ZipEntry(zipName + '/');
				ze.setTime(file.lastModified());
				zout.putNextEntry(ze);
			}
		}
		zout.close();
	}

	private static List<String> listDirectory(File directory) throws IOException {

		Stack<String> stack = new Stack<String>();
		List<String> list = new ArrayList<String>();

		// If it's a file, just return itself
		if (directory.isFile()) {
			if (directory.canRead())
				list.add(directory.getName());
			return list;
		}

		// Traverse the directory in width-first manner, no-recursively
		String root = directory.getParent();
		stack.push(directory.getName());
		while (!stack.empty()) {
			String current = (String) stack.pop();
			File curDir = new File(root, current);
			String[] fileList = curDir.list();
			if (fileList != null) {
				for (String entry : fileList) {
					File f = new File(curDir, entry);
					if (f.isFile()) {
						if (f.canRead()) {
							list.add(current + File.separator + entry);
						} else {
							System.err.println("File " + f.getPath() + " is unreadable");
							throw new IOException("Can't read file: " + f.getPath());
						}
					} else if (f.isDirectory()) {
						list.add(current + File.separator + entry);
						stack.push(current + File.separator + f.getName());
					} else {
						throw new IOException("Unknown entry: " + f.getPath());
					}
				}
			}
		}
		return list;
	}

	/** Constants for mode listing or mode extracting. */
	private static final int LIST = 0, EXTRACT = 1;
	/** Whether we are extracting or just printing TOC */
	private static int mode = EXTRACT;

	/** The ZipFile that is used to read an archive */
	private static ZipFile zippy;

	/** The buffer for reading/writing the ZipFile data */
	private static byte[] b = new byte[8092];

	/** Cache of paths we've mkdir()ed. */
	private static SortedSet<String> dirsMade;

	/**
	 * I was willing to put warnings inside this list, so that they could be inspected an decide what to do
	 * String is not the best choice, they should be a defined inner class, with specified subclasses, and
	 * then contain semantic references (like the folder which has not been produced), and a human-readable
	 * string msg for the user
	 */
	@SuppressWarnings("unused")
	private static ArrayList<String> warnings;

	/**
	 * For a given Zip file, process each entry.
	 * 
	 * @throws IOException
	 */
	static void unZip(String fileName, File baseDestDir) throws IOException {
		warnings = new ArrayList<String>();
		dirsMade = new TreeSet<String>();
		zippy = new ZipFile(fileName);
		Enumeration<? extends ZipEntry> all = zippy.entries();
		while (all.hasMoreElements()) {
			getFile((ZipEntry) all.nextElement(), baseDestDir);
		}
	}

	private static boolean warnedMkDir = false;

	/**
	 * Process one file from the zip, given its name. Either print the name, or create the file on disk.
	 */
	private static void getFile(ZipEntry e, File baseDestDir) throws IOException {
		String zipName = e.getName();
		switch (mode) {
		case EXTRACT:
			if (zipName.startsWith("/")) {
				if (!warnedMkDir)
					System.out.println("Ignoring absolute paths");
				warnedMkDir = true;
				zipName = zipName.substring(1);
			}

			// we modified this part wrt the original example to also output empty directories
			if (zipName.endsWith("/")) {
				int ix = zipName.lastIndexOf('/');
				String dirName = zipName.substring(0, ix);
				File d = new File(baseDestDir, dirName);
				if (!d.exists())
					System.out.println("Creating Directory: " + dirName);
				if (!d.mkdirs()) {
					System.err.println("Warning: unable to mkdir " + dirName);
				}
				return;
			}

			// Else must be a file; open the file for output
			// Get the directory part.
			int ix = zipName.lastIndexOf('/');
			if (ix > 0) {
				String dirName = zipName.substring(0, ix);
				if (!dirsMade.contains(dirName)) {
					File d = new File(baseDestDir, dirName);
					// If it already exists as a dir, don't do anything
					if (!(d.exists() && d.isDirectory())) {
						// Try to create the directory, warn if it fails
						System.out.println("Creating Directory: " + dirName);
						if (!d.mkdirs()) {
							System.err.println("Warning: unable to mkdir " + dirName);
						}
						dirsMade.add(dirName);
					}
				}
			}
			System.err.println("Creating " + zipName);
			File zipFile = new File(baseDestDir, zipName);
			FileOutputStream os = new FileOutputStream(zipFile);
			InputStream is = zippy.getInputStream(e);
			int n = 0;
			while ((n = is.read(b)) > 0)
				os.write(b, 0, n);
			is.close();
			os.close();
			break;
		case LIST:
			// Not extracting, just list
			if (e.isDirectory()) {
				System.out.println("Directory " + zipName);
			} else {
				System.out.println("File " + zipName);
			}
			break;
		default:
			throw new IllegalStateException("mode value (" + mode + ") bad");
		}
	}

}
