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
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;

/**
 * @author Armando Stellato
 *
 */
public class Utilities {

	
	public static void download(URL url, String destinationFile) throws IOException {
		InputStream is = (InputStream)url.openStream();
		download(is, destinationFile);
	}
	
	public static void download(InputStream instream, String destinationFile) throws IOException {

		BufferedInputStream buf=new BufferedInputStream(instream);//for better performance
		FileOutputStream fout=null;

		fout=new FileOutputStream(destinationFile);

		byte[] buffer=new byte[1024];//byte buffer 
		int bytesRead=0;
		while (true){
		bytesRead=buf.read(buffer,0,1024);
//		bytesRead returns the actual number of bytes read from
//		the stream. returns -1 when end of stream is detected
		if (bytesRead == -1) break;
			fout.write(buffer,0,bytesRead);
		} 

		if(buf!=null)buf.close();
		if(fout!=null)fout.close();
		buf=null;
		fout=null;

	}

	
	public static void copy(String src, String dst) throws IOException {
		copy(new File(src), new File(dst));
	}
	
    // Copies src file to dst file.
    // If the dst file does not exist, it is created
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
    
    
	
	public static String printStackTrace(Exception e) {
	    StackTraceElement[] stack = e.getStackTrace();
	    String printedStack="";
	    for(int i=0;i<stack.length;i++) {
	        printedStack+=stack[i]+"\n";
	    }
	    return printedStack;
	}
	
	
	
}
