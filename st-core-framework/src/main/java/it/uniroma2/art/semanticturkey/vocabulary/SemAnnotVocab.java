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

import it.uniroma2.art.owlart.exceptions.VocabularyInitializationException;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.models.RDFModel;

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

	/** http://art.uniroma2.it/ontologies/annotation#topic **/
	public static final String topic = NAMESPACE + "topic";

	public static class Res {
		public static ARTURIResource SemanticAnnotation;
		public static ARTURIResource RangeAnnotation;
		public static ARTURIResource annotation;
		public static ARTURIResource WebPage;
		public static ARTURIResource text;
		public static ARTURIResource url;
		public static ARTURIResource location;
		public static ARTURIResource title;
		public static ARTURIResource range;
		public static ARTURIResource topic;
		public static ARTURIResource TextualAnnotation;
		public static ARTURIResource ImageAnnotation;

		public static void initialize(RDFModel repo) throws VocabularyInitializationException {

			SemanticAnnotation = repo.createURIResource(SemAnnotVocab.SemanticAnnotation);
			RangeAnnotation = repo.createURIResource(SemAnnotVocab.RangeAnnotation);
			annotation = repo.createURIResource(SemAnnotVocab.annotation);
			WebPage = repo.createURIResource(SemAnnotVocab.WebPage);
			url = repo.createURIResource(SemAnnotVocab.url);
			location = repo.createURIResource(SemAnnotVocab.location);
			text = repo.createURIResource(SemAnnotVocab.text);
			title = repo.createURIResource(SemAnnotVocab.title);
			range = repo.createURIResource(SemAnnotVocab.range);
			TextualAnnotation = repo.createURIResource(SemAnnotVocab.TextualAnnotation);
			ImageAnnotation = repo.createURIResource(SemAnnotVocab.ImageAnnotation);
			topic = repo.createURIResource(SemAnnotVocab.topic);

			if (SemanticAnnotation == null || RangeAnnotation == null || annotation == null
					|| WebPage == null || url == null || location == null || text == null || title == null
					|| range == null || TextualAnnotation == null || ImageAnnotation == null || topic == null)
				throw new VocabularyInitializationException(
						"Problems occurred in initializing the Semantic Annotation ontology vocabulary");

		}

	}

}
