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
package it.uniroma2.art.semanticturkey.vocabulary;

import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.exceptions.VocabularyInitializationException;

/**
 * @author Armando Stellato
 *
 */
public class SemAnnotVocab {

    /** http://art.uniroma2.it/ontologies/annotation# **/
    public static final String NAMESPACE = "http://art.uniroma2.it/ontologies/annotation#";

    
    
    /** http://art.uniroma2.it/ontologies/annotation#SemanticAnnotation **/
    public static final String SemanticAnnotation = NAMESPACE + "SemanticAnnotation";

    /** http://art.uniroma2.it/ontologies/annotation#RangeAnnotation **/
    public static final String RangeAnnotation = NAMESPACE + "RangeAnnotation";
    
    /** http://art.uniroma2.it/ontologies/annotation#annotation **/
    public static final String annotation = NAMESPACE + "annotation";
    
    /** http://art.uniroma2.it/ontologies/annotation#WebPage **/
    public static final String WebPage = NAMESPACE + "WebPage";
    
    /** http://art.uniroma2.it/ontologies/annotation#text **/
    public static final String text = NAMESPACE + "text";

    /** http://art.uniroma2.it/ontologies/annotation#url **/
    public static final String url = NAMESPACE + "url";
    
    /** http://art.uniroma2.it/ontologies/annotation#title **/
    public static final String title = NAMESPACE + "title";
    
    /** http://art.uniroma2.it/ontologies/annotation#range **/
    public static final String range = NAMESPACE + "range";
    
    /** http://art.uniroma2.it/ontologies/annotation#TextualAnnotation **/
    public static final String TextualAnnotation = NAMESPACE + "TextualAnnotation";

    /** http://art.uniroma2.it/ontologies/annotation#ImageAnnotation **/
    public static final String ImageAnnotation = NAMESPACE + "ImageAnnotation";

    /** http://art.uniroma2.it/ontologies/annotation#location **/
    public static final String location = NAMESPACE + "location";
    
    
    public static class Res {
        public static ARTResource SemanticAnnotation;
        public static ARTResource RangeAnnotation;
        public static ARTResource annotation;
        public static ARTResource WebPage;
        public static ARTResource text;
        public static ARTResource url;
        public static ARTResource location;
        public static ARTResource title;
        public static ARTResource range;
        public static ARTResource TextualAnnotation;
        public static ARTResource ImageAnnotation;
        
        public static void initialize(ARTRepository repo) throws VocabularyInitializationException {

            SemanticAnnotation = repo.getSTClass(SemAnnotVocab.SemanticAnnotation);
            RangeAnnotation = repo.getSTClass(SemAnnotVocab.RangeAnnotation);
            annotation = repo.getSTProperty(SemAnnotVocab.annotation);
            WebPage = repo.getSTClass(SemAnnotVocab.WebPage);
            url = repo.getSTProperty(SemAnnotVocab.url);
            location = repo.getSTProperty(SemAnnotVocab.location);
            text = repo.getSTProperty(SemAnnotVocab.text);
            title = repo.getSTProperty(SemAnnotVocab.title);
            range = repo.getSTProperty(SemAnnotVocab.range);
            TextualAnnotation = repo.getSTClass(SemAnnotVocab.TextualAnnotation);
            ImageAnnotation = repo.getSTClass(SemAnnotVocab.ImageAnnotation);
            
        if (SemanticAnnotation==null || RangeAnnotation==null || annotation==null || WebPage==null || url==null || location==null || text==null || title==null || range==null || TextualAnnotation==null || ImageAnnotation==null)
            	throw new VocabularyInitializationException("Problems occurred in initializing the Semantic Annotation ontology vocabulary");

        }

    }
    
   
    
}
