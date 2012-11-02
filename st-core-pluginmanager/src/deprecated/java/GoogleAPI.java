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

package it.uniroma2.art.semanticturkey.google;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import com.google.soap.search.*;
import org.w3c.dom.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.xerces.dom.DocumentImpl;

/**
 * @author Donato Griesi
 * 
 * this class has been retained in the source code but is currently not used
 *
 */
public class GoogleAPI {
	
	protected static Logger logger = LoggerFactory.getLogger(GoogleAPI.class);
	/** Trasforma il risultato della ricerca su web in formato xml da restituire come risposta alla servlet WebSearch
	 *@param GoogleSearchResult r 
	 *@return Document*/
	public static Document google2XML(GoogleSearchResult r) {
      Document xml = new DocumentImpl();
      Element results = xml.createElement("Results");
      XMLHelp.newElement(results,"DocumentFiltering",""+r.getDocumentFiltering());
      XMLHelp.newElement(results,"EndIndex",""+r.getEndIndex());
      XMLHelp.newElement(results,"EstimatedTotalResultsCount",""+r.getEstimatedTotalResultsCount());
      XMLHelp.newElement(results,"EstimateIsExact",""+r.getEstimateIsExact());
      XMLHelp.newElement(results,"SearchComments",r.getSearchComments());
      XMLHelp.newElement(results,"SearchQuery",r.getSearchQuery());
      XMLHelp.newElement(results,"SearchTime",""+r.getSearchTime());
      XMLHelp.newElement(results,"SearchTips",r.getSearchTips());
      XMLHelp.newElement(results,"StartIndex",""+r.getStartIndex());
      GoogleSearchDirectoryCategory [] adircats = r.getDirectoryCategories();
      if (adircats != null) {
        Element dircats = XMLHelp.newElement(results, "DirectoryCategories");
        int i = 0; while (i < adircats.length) {
          Element dircat = XMLHelp.newElement(dircats,"DirectoryCategory");
          XMLHelp.newElement(dircat, "FullViewableName", adircats[i].getFullViewableName());
          XMLHelp.newElement(dircat, "SpecialEncoding", adircats[i].getSpecialEncoding());
          i++;
        }
      }
      GoogleSearchResultElement [] aresults = r.getResultElements();
      if (aresults != null) {
        Element resultelements = XMLHelp.newElement(results, "ResultElements");
        int i=0; while (i<aresults.length) {
          Element resultelement = XMLHelp.newElement(resultelements,"ResultElement");
          XMLHelp.newElement(resultelement,"CachedSize",""+aresults[i].getCachedSize());
          XMLHelp.newElement(resultelement,"DirectoryTitle",aresults[i].getDirectoryTitle());
          XMLHelp.newElement(resultelement,"HostName",aresults[i].getHostName());
          XMLHelp.newElement(resultelement,"RelatedInformationPresent",""+aresults[i].getRelatedInformationPresent());
          XMLHelp.newElement(resultelement,"Snippet",aresults[i].getSnippet());
          XMLHelp.newElement(resultelement,"Summary",aresults[i].getSummary());
          XMLHelp.newElement(resultelement,"Title",aresults[i].getTitle());
          XMLHelp.newElement(resultelement,"URL",aresults[i].getURL());
          GoogleSearchDirectoryCategory dircat = aresults[i].getDirectoryCategory();
          if (dircat != null) {
            Element edircat = XMLHelp.newElement(resultelement,"DirectoryCategory");
            XMLHelp.newElement(edircat,"FullViewableName",dircat.getFullViewableName());
            XMLHelp.newElement(edircat,"SpecialEncoding",dircat.getSpecialEncoding());
          }
          i++;
        }
      }
      xml.appendChild(results);
      return xml;
  }
}