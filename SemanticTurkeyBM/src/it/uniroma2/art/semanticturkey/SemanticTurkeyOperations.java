 /*
  * The contents of this file are subject to the Mozilla Public License
  * Version 1.1 (the "License"); you may not use this file except in compliance
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

package it.uniroma2.art.semanticturkey;

import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.exceptions.RepositoryUpdateException;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.util.Iterator;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.log4j.Logger;


/**
 * @author Donato Griesi, Armando Stellato
 *
 */
public class SemanticTurkeyOperations {
	final static private Logger s_logger = Logger.getLogger(SemanticTurkey.class);
	
	/**Metodo che crea una lessicalizzazione di instanceName e gli associa un'istanza di WebPage con valore urlPage e invoca createSemanticAnnotation
	 *@param SesameARTRepositoryImpl repository
	 *@param String instanceQName
	 *@param String lexicalization
	 *@param String pageURL
	 *@param String title
	 * @throws RepositoryUpdateException */
	public static void createLexicalization(ARTRepository repository, String instanceQName, String lexicalization, String pageURL, String title) throws RepositoryUpdateException {		
        s_logger.debug("creating lexicalization: " + lexicalization + " for instance: " + instanceQName + "on url: " + pageURL + " with title: " + title);
        ARTResource webPageInstance = createWebPage(repository, pageURL, title);				
		s_logger.debug("creating Semantic Annotation for: instQName: " + instanceQName + " lexicalization: " +  lexicalization + " webPageInstance " + webPageInstance);
		createSemanticAnnotation(repository, instanceQName, lexicalization, webPageInstance);				
	}
	
	//per queste servirebbe il concetto di uncommitted creation nelle API, di modo da poter fare una sola openconnection, fare tutte le create, e solo dopo fare la commit finale
	/**Metodo che crea una istanza di WebPage  con valore urlPage 
	 *@param SesameARTRepositoryImpl repository
	 *@param String urlPage
	 *@param String title
	 *@return String webPageInstanceName: uri della instance
	 * @throws RepositoryUpdateException */
	public static ARTResource createWebPage(ARTRepository repository, String urlPage, String title) throws RepositoryUpdateException {
        s_logger.debug("creating Web Page Instance for page: " + urlPage + " with title: " + title);
        ARTResource webPageInstanceRes = null;
        
        Iterator<ARTResource> collectionIterator = repository.getSTSubjectFromDatatypeProperty(SemAnnotVocab.Res.url, repository.createLiteral(urlPage)).iterator();
        if (collectionIterator.hasNext()) {
            webPageInstanceRes = collectionIterator.next();		
            s_logger.debug("found web page: " + webPageInstanceRes.getLocalName() + repository.listSTDatatypePropertyValues(webPageInstanceRes, SemAnnotVocab.Res.url).next());
		}															
				
		if (webPageInstanceRes == null) {	
            s_logger.debug("web page not found;");
			String webPageInstanceID = generateNewSemanticAnnotationUUID(repository);
								
            s_logger.debug("creating WebPage. webPageInstanceId: " + webPageInstanceID + " webPageRes: " + SemAnnotVocab.Res.WebPage);
			repository.addSTIndividual(repository.getDefaultNamespace()+webPageInstanceID, SemAnnotVocab.Res.WebPage);							
			
			webPageInstanceRes = repository.getSTResource(repository.getDefaultNamespace()+webPageInstanceID);
			repository.instanciateDatatypeProperty(webPageInstanceRes, SemAnnotVocab.Res.url, urlPage);
			if (!title.equals("")) {
				repository.instanciateDatatypeProperty(webPageInstanceRes, SemAnnotVocab.Res.title, title);			
			}		
		}

		return webPageInstanceRes;						

	}
	
	
	/**Metodo che crea una istanza di SemanticAnnotation associando una lexicalization all'istanza della classe  
	 *@param SesameARTRepositoryImpl repository
	 *@param String instanceName
	 *@param String lexicalization
	 *@param String webPageInstanceName
	 * @throws RepositoryUpdateException 
	 **/
	private static void createSemanticAnnotation(ARTRepository repository, String individualQName, String lexicalization, ARTResource webPageInstanceRes) throws RepositoryUpdateException {		
				
		String semanticAnnotationID = generateNewSemanticAnnotationUUID(repository);
								
		repository.addSTIndividual(  repository.getDefaultNamespace() + semanticAnnotationID,  SemAnnotVocab.Res.SemanticAnnotation );			
			
		ARTResource semanticAnnotationInstanceRes = repository.getSTResource(repository.getDefaultNamespace() + semanticAnnotationID);		
		s_logger.debug("creating lexicalization: semAnnotInstanceRes: " + semanticAnnotationInstanceRes + "");
		repository.instanciateDatatypeProperty(semanticAnnotationInstanceRes, SemAnnotVocab.Res.text, lexicalization);								
					
		repository.instanciateObjectProperty(semanticAnnotationInstanceRes, SemAnnotVocab.Res.location, webPageInstanceRes);		
		
		ARTResource instanceRes = repository.getSTResource(repository.expandQName(individualQName));
		repository.instanciateObjectProperty(instanceRes, SemAnnotVocab.Res.annotation, semanticAnnotationInstanceRes);
	}
	
	public static String generateNewSemanticAnnotationUUID(ARTRepository repository) {
		UUID semanticAnnotationInstanceID;
		ARTResource semanticAnnotationInstance; 
		do {
			semanticAnnotationInstanceID = UUID.randomUUID();										
			semanticAnnotationInstance = repository.getSTResource(repository.getDefaultNamespace()+semanticAnnotationInstanceID.toString());
		}
		while  (semanticAnnotationInstance != null);
		return semanticAnnotationInstanceID.toString();
	}
	
	
	/**Funzion che restituisce il File relativo a URI
	 * @param uri String
	 * @return File*/
	static public File uriToFile(String uri) throws URISyntaxException {
        int percentU = uri.indexOf("%u");
        if (percentU >= 0) {
            StringBuffer sb = new StringBuffer(uri.length());

            int start = 0;
            while (percentU > 0) {
                sb.append(uri.substring(start, percentU));

                char c = (char) Integer.parseInt(
                    uri.substring(percentU + 2, percentU + 6), 16);

                sb.append(c);

                start = percentU + 6;
                percentU = uri.indexOf("%u", start);
            }

            sb.append(uri.substring(start));
            uri = sb.toString();
        }
        return new File(new java.net.URI(uri));
    }
	

	
}

