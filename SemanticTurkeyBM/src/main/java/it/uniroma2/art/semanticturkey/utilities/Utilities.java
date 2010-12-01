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

/*
 * Contributor(s): Armando Stellato stellato@info.uniroma2.it
 */
package it.uniroma2.art.semanticturkey.utilities;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.RandomAccessFile;
import java.net.HttpURLConnection;
import java.net.Proxy;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

/**
 * @author Armando Stellato
 * 
 */
public class Utilities {

	/**
	 * downloads data from <code>url</code> to the file denoted by <code>destinationFile</code> through an
	 * {@link HttpURLConnection}
	 * <p>
	 * the proxy may be set to override standard java settings
	 * </p>
	 * 
	 * @param url
	 * @param proxy
	 * @param destinationFile
	 * @throws IOException
	 */
	public static void download(URL url, Proxy proxy, String destinationFile) throws IOException {
		HttpURLConnection connection = (HttpURLConnection) url.openConnection(proxy);
		connection.setRequestProperty("Range", "bytes=0-");
		connection.connect();

		// check if server response is positive: in this case, the response value
		// should be in the interval between 200 and 299 (thus the result of a division by 100 is 2)
		// if the response is negative, throws an exception
		if (connection.getResponseCode() / 100 != 2)
			throw new IOException(connection.getResponseMessage());

		// used to check contentLength
		/*
		 * int contentLength = connection.getContentLength(); // se il numero di byte e' zero o negativo c'e'
		 * qualcosa che non va... if (contentLength < 1) {
		 * System.err.println("Errore, c'e' qualcosa che non va!"); return; }
		 */

		RandomAccessFile file = new RandomAccessFile(destinationFile, "rw");
		file.seek(0);

		InputStream inStream = connection.getInputStream();
		BufferedInputStream bufStream = new BufferedInputStream(inStream);

		byte[] buffer = new byte[1024];

		// download cycle
		while (true) {
			int bytesRead = bufStream.read(buffer, 0, 1024);
			if (bytesRead == -1)
				break;
			file.write(buffer, 0, bytesRead);
		}

	}

	/**
	 * as for {@link #download(InputStream, String)} by getting the stream of of <code>url</code> with
	 * {@link URL#openStream()}
	 * 
	 * @param url
	 * @param destinationFile
	 * @throws IOException
	 */
	public static void download(URL url, String destinationFile) throws IOException {
		InputStream is = (InputStream) url.openStream();
		download(is, destinationFile);
	}

	/**
	 * downloads data from {@link InputStream} <code>instream</code> to a file determined by
	 * <code>destinationFile</code>
	 * 
	 * @param instream
	 * @param destinationFile
	 * @throws IOException
	 */
	public static void download(InputStream instream, String destinationFile) throws IOException {

		BufferedInputStream buf = new BufferedInputStream(instream);// for better performance
		FileOutputStream fout = null;

		fout = new FileOutputStream(destinationFile);

		byte[] buffer = new byte[1024];// byte buffer
		int bytesRead = 0;
		while (true) {
			bytesRead = buf.read(buffer, 0, 1024);
			// bytesRead returns the actual number of bytes read from
			// the stream. returns -1 when end of stream is detected
			if (bytesRead == -1)
				break;
			fout.write(buffer, 0, bytesRead);
		}

		if (buf != null)
			buf.close();
		if (fout != null)
			fout.close();
		buf = null;
		fout = null;

	}

	/**
	 * as for {@link #copy(File, File)}
	 * 
	 * @param src
	 * @param dst
	 * @throws IOException
	 */
	public static void copy(String src, String dst) throws IOException {
		copy(new File(src), new File(dst));
	}

	/**
	 * Copies src file to dst file. If the dst file does not exist, it is created
	 * 
	 * @param src
	 * @param dst
	 * @throws IOException
	 */
	public static void copy(File src, File dst) throws IOException {
		InputStream in = new FileInputStream(src);
		OutputStream out = new FileOutputStream(dst);

		// Transfer bytes from in to out
		byte[] buf = new byte[1024];
		int len;
		while ((len = in.read(buf)) > 0) {
			out.write(buf, 0, len);
		}
		in.close();
		out.close();
	}

	public static String printStackTrace(Throwable e) {
		StackTraceElement[] stack = e.getStackTrace();
		String printedStack = "exception: " + e.toString() + "\n";
		for (int i = 0; i < stack.length; i++) {
			printedStack += stack[i] + "\n";
		}
		return printedStack;
	}

	public static String printFullStackTrace(Throwable e) {
		return printFullStackTrace("", e);
	}

	public static String printFullStackTrace(String printedStack, Throwable e) {
		printedStack += e.getClass() + "\n";
		StackTraceElement[] stack = e.getStackTrace();
		for (int i = 0; i < stack.length; i++) {
			printedStack += stack[i] + "\n";
		}
		Throwable cause = e.getCause();
		if (cause != null) {
			printedStack += "** caused by: **\n";
			return printFullStackTrace(printedStack, cause);
		} else
			return printedStack;
	}

	/**
	 * This function will copy files or directories from one location to another. note that the source and the
	 * destination must be mutually exclusive. This function can not be used to copy a directory to a sub
	 * directory of itself. The function will also have problems if the destination files already exist. Note:
	 * this code has been grabbed from: {@link http://www.dreamincode.net/code/snippet1443.htm}
	 * 
	 * @param src
	 *            -- A File object that represents the source for the copy
	 * @param dest
	 *            -- A File object that represents the destination for the copy.
	 * @throws IOException
	 *             if unable to copy.
	 */
	public static void recursiveCopy(File src, File dest) throws IOException {
		// Check to ensure that the source is valid...
		if (!src.exists()) {
			throw new IOException("copyFiles: Can not find source: " + src.getAbsolutePath() + ".");
		} else if (!src.canRead()) { // check to ensure we have rights to the source...
			throw new IOException("copyFiles: No right to source: " + src.getAbsolutePath() + ".");
		}
		// is this a directory copy?
		if (src.isDirectory()) {
			if (!dest.exists()) { // does the destination already exist?
				// if not we need to make it exist if possible (note this is mkdirs not mkdir)
				if (!dest.mkdirs()) {
					throw new IOException("copyFiles: Could not create directory: " + dest.getAbsolutePath()
							+ ".");
				}
			}
			// get a listing of files...
			String list[] = src.list();
			// copy all the files in the list.
			for (int i = 0; i < list.length; i++) {
				File dest1 = new File(dest, list[i]);
				File src1 = new File(src, list[i]);
				recursiveCopy(src1, dest1);
			}
		} else {
			// This was not a directory, so lets just copy the file
			FileInputStream fin = null;
			FileOutputStream fout = null;
			byte[] buffer = new byte[4096]; // Buffer 4K at a time (you can change this).
			int bytesRead;
			try {
				// open the files for input and output
				fin = new FileInputStream(src);
				fout = new FileOutputStream(dest);
				// while bytesRead indicates a successful read, lets write...
				while ((bytesRead = fin.read(buffer)) >= 0) {
					fout.write(buffer, 0, bytesRead);
				}
			} catch (IOException e) { // Error copying file...
				IOException wrapper = new IOException("copyFiles: Unable to copy file: \"" + src.getName()
						+ "\" to " + dest.getAbsolutePath() + ".");
				wrapper.initCause(e);
				wrapper.setStackTrace(e.getStackTrace());
				throw wrapper;
			} finally { // Ensure that the files are closed (if they were open).
				if (fin != null) {
					fin.close();
				}
				if (fout != null) {
					fout.close();
				}
			}
		}
	}

	/**
	 * Recursively deletes a directory and all its sub directories.
	 */
	public static boolean deleteDir(File dir) {
		// If it is a directory get the children
		if (dir.isDirectory()) {
			// List all the contents of the directory
			File fileList[] = dir.listFiles();

			// Loop through the list of files/directories
			for (int index = 0; index < fileList.length; index++) {
				// Get the current file object.
				File file = fileList[index];

				// Call deleteDir function once again for deleting all the directory contents or
				// sub directories if any present.
				deleteDir(file);
			}
		}

		// Delete the current directory or file.
		return dir.delete();
	}

	public static void createZipFile(File srcDir, File out, boolean includeBase, boolean verbose,
			String comment) throws IOException {
		createZipFile(srcDir, new FileOutputStream(out), includeBase, verbose, comment);
	}

	/**
	 * creates a zip on the given {@link OutputStream} <code>out</code>, with comment <code>comment</code>.
	 * <p>
	 * the zip contains the directory structure starting from the considered directory <code>srcDir</code>
	 * </p>
	 * 
	 * @param srcDir
	 * @param out
	 * @param includeBase
	 *            tells whether to include the <code>srcDir</code> in the zip or not
	 * @param verbose
	 *            prints to std output some info on the zip creation
	 * @param comment
	 *            a comment to be put inside the zip file
	 * @throws IOException
	 */
	public static void createZipFile(File srcDir, OutputStream out, boolean includeBase, boolean verbose,
			String comment) throws IOException {
		ZipUtilities.createZipFile(srcDir, out, includeBase, verbose, comment);
	}

	public static void unZip(String fileName, File baseDir) throws IOException {
		ZipUtilities.unZip(fileName, baseDir);
	}

	public static List<String> listDirectory(File directory) throws IOException {

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

	public static List<String> listDirectoryContentAsStrings(File directory, boolean includeFiles, boolean includeDirs, boolean recursive) throws IOException {

		Stack<String> stack = new Stack<String>();
		List<String> list = new ArrayList<String>();

		// If it's a file, just return itself
		if (directory.isFile()) {
			throw new IOException("please specify a directory for listing its content; " + directory
					+ " is not a directory");
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
					if (f.isFile() && includeFiles) {
						if (f.canRead()) {
							list.add(current + File.separator + entry);
						} else {
							System.err.println("File " + f.getPath() + " is unreadable");
							throw new IOException("Can't read file: " + f.getPath());
						}
					} else if (f.isDirectory()) {
						if (includeDirs)
							list.add(current + File.separator + entry); 
							//list.add(current + File.separator + entry);
						if (recursive)
							stack.push(current + File.separator + f.getName());		
					} else {
						throw new IOException("Unknown entry: " + f.getPath());
					}
				}
			}
		}
		return list;
	}
	
	
	public static List<File> listDirectoryContentAsFiles(File directory, boolean includeFiles, boolean includeDirs, boolean recursive) throws IOException {

		Stack<File> stack = new Stack<File>();
		List<File> list = new ArrayList<File>();

		// If it's a file, just return itself
		if (directory.isFile()) {
			throw new IOException("please specify a directory for listing its content; " + directory
					+ " is not a directory");
		}

		// Traverse the directory in width-first manner, no-recursively
		//String root = directory.getParent();
		stack.push(directory);
		while (!stack.empty()) {
			File current = stack.pop();
			File[] fileList = current.listFiles();
			if (fileList != null) {
				for (File entry : fileList) {
					if (entry.isFile() && includeFiles) {
						if (entry.canRead()) {
							list.add(entry);
						} else {
							System.err.println("File " + entry.getPath() + " is unreadable");
							throw new IOException("Can't read file: " + entry.getPath());
						}
					} else if (entry.isDirectory()) {
						if (includeDirs)
							list.add(entry); 
							//list.add(current + File.separator + entry);
						if (recursive)
							stack.push(entry);		
					} else {
						throw new IOException("Unknown entry: " + entry.getPath());
					}
				}
			}
		}
		return list;
	}

}
