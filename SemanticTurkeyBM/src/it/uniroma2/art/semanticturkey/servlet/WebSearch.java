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
  * The Original Code is SemanticTurkey.
  *
  * The Initial Developer of the Original Code is University of Roma Tor Vergata.
  * Portions created by University of Roma Tor Vergata are Copyright (C) 2007.
  * All Rights Reserved.
  *
  * SemanticTurkey was developed by the Artificial Intelligence Research Group
  * (ai-nlp.info.uniroma2.it) at the University of Roma Tor Vergata
  * Current information about SemanticTurkey can be obtained at 
  * http//ai-nlp.info.uniroma2.it/software/...
  *
  */

package it.uniroma2.art.semanticturkey.servlet;

import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.google.GoogleAPI;
import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServletInterface;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.utilities.StringHelp;

import java.io.IOException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;

import org.apache.log4j.Logger;

import org.w3c.dom.Document;

import com.google.soap.search.GoogleSearch;
import com.google.soap.search.GoogleSearchFault;
import com.google.soap.search.GoogleSearchResult;


/**Classe che si occupa di effettuare la ricerca su web (google)*/
/**
 * @author Donato Griesi
 *
 */
@SuppressWarnings("serial")
public class WebSearch extends HttpServlet implements ServletInterface {
  @SuppressWarnings("unused")
final static private Logger s_logger = Logger.getLogger(SemanticTurkey.class);
  @SuppressWarnings("unused")
private ServletConfig oConfig;
  private String GoogleKey= "VYCC+5dQFHKdVjA31/keF+qOt3eDe8ta";
  private static String searchResultsXSL = Resources.getXSLDirectoryPath() + "results.xsl";
  
  public void init(ServletConfig config) throws ServletException {
    super.init(config);
    oConfig = config;    
  }
  /** Metodo che si occupa di effettuare la ricerca su web (google)*/
  public void service(HttpServletRequest oReq, HttpServletResponse oRes) throws ServletException, IOException {
    ServletOutputStream out = oRes.getOutputStream();
    String query = oReq.getParameter("query");
    try {
      if (query != null && query.length() > 0) {
    	GoogleSearch s = new GoogleSearch();
        String start = oReq.getParameter("start");
        int startrow = (start!=null && Integer.parseInt(start)>0)?Integer.parseInt(start):1;       
        s.setStartResult(startrow);
        s.setKey(GoogleKey);
        s.setSafeSearch(true);
        s.setFilter(true);
        s.setQueryString(query);
        GoogleSearchResult r = s.doSearch();
        int total = r.getEstimatedTotalResultsCount();
        int max = r.getEndIndex();
        Document rXML = GoogleAPI.google2XML(r);  
        CXSL XSL = new CXSL(searchResultsXSL, this);
        if (max < total) {
          XSL.setParam("more", "" + max);
          XSL.setParam("query", StringHelp.replace(query, "&", "%26"));
        }
        XSL.apply(rXML, out);
      }
      if (query == null || query.length() == 0) {
        String emptyResponse = "<Results/>"; 
        CXSL XSL = new CXSL(searchResultsXSL, this);
        XSL.apply(emptyResponse, out);
      }
    }
    catch (GoogleSearchFault f) {
      log(f.toString());
      query = null;
    }
    catch (TransformerConfigurationException e) {
      throw new ServletException(e.getMessage());
    }
    catch (TransformerException e) {
      throw new ServletException(e.getMessage());
    }
    catch (Exception e) {
      log(e.getMessage());
      query = null;
    }
  }
}
