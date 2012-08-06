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

package it.uniroma2.art.semanticturkey.servlet;

/**  Proxy Servlet.  
  *
  *  Author:  Victor Volle  victor.volle@artive.de                                   
  *  Version: 1.00
  */


import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;




/**
 * A most simple proxy, or perhaps better a "redirector". It gets an
 * URL as parameter, reads the data from this URL and writes them
 * into the response. This servlet can be used to load a file
 * from an applet, that is not allowed to open a connection
 * to another location.
 */
/**
 * @author Donato Griesi
 *
 */
@SuppressWarnings("serial")
public class Proxy extends HttpServlet {
   // private static final String CONTENT_TYPE = "text/html";
   static final int BUFFER_SIZE = 4096;
   protected static Logger logger = LoggerFactory.getLogger(Proxy.class);

   /** */
   public void init(ServletConfig config) throws ServletException
   {
      super.init(config);
   }


   /**
    *  Write the content of the URL (given in the parameter "URL") to the
    *  response
    */
   public void doGet(HttpServletRequest request, HttpServletResponse response) 
      throws ServletException, IOException
   {
      	   
	   // get the URL from the request
      String load_url = "";
      try {
         load_url = request.getParameter("URL");
      }
      catch(Exception e) {
         logger.error(""+e);
    	  e.printStackTrace();
      }

      // open a connection using the given URL
      URL url = new URL(load_url);
      URLConnection connection = url.openConnection();
      connection.connect();


      // important: set the correct conetent type in the request
      response.setContentType(connection.getContentType());


      InputStream in = connection.getInputStream();
      OutputStream out = response.getOutputStream();
      byte[] buffer = new byte[BUFFER_SIZE];
      int read;


      // standard copying scheme
   READ:
      while ( true )
      {
         read = in.read( buffer ) ;
         if ( read > 0 )
         {
            out.write( buffer, 0, read );
         }
         else
         {
            break READ;
         }
      }
   }


   /**
    * Does the same as doGet
    */
   protected void doPost(HttpServletRequest req, HttpServletResponse
resp) 
      throws javax.servlet.ServletException, java.io.IOException
   {
      doGet( req,  resp);
   }




   /**Ressourcen bereinigen*/
   public void destroy() {
   }


}
