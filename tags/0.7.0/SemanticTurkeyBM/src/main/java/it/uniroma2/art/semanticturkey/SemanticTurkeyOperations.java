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

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.exceptions.ModelUpdateException;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.navigation.ARTResourceIterator;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;

import java.io.File;
import java.net.URISyntaxException;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author Donato Griesi, Armando Stellato
 * 
 */
public class SemanticTurkeyOperations {
	protected static Logger logger = LoggerFactory.getLogger(SemanticTurkeyOperations.class);

	/**
	 * Metodo che crea una lessicalizzazione di instanceName e gli associa un'istanza di WebPage con valore
	 * urlPage e invoca createSemanticAnnotation
	 * 
	 * @param SesameARTRepositoryImpl
	 *            repository
	 *@param String
	 *            instanceQName
	 *@param String
	 *            lexicalization
	 *@param String
	 *            pageURL
	 *@param String
	 *            title
	 * @throws ModelUpdateException
	 * @throws ModelAccessException 
	 */
	public static void createLexicalization(OWLModel repository, String instanceQName, String lexicalization,
			String pageURL, String title) throws ModelUpdateException, ModelAccessException {
		logger.debug("creating lexicalization: " + lexicalization + " for instance: " + instanceQName
				+ " on url: " + pageURL + " with title: " + title);
		ARTResource webPageInstance = createWebPage(repository, pageURL, title);
		logger.debug("creating Semantic Annotation for: instQName: " + instanceQName + " lexicalization: "
				+ lexicalization + " webPageInstance " + webPageInstance);
		createSemanticAnnotation(repository, instanceQName, lexicalization, webPageInstance);
	}

	// per queste servirebbe il concetto di uncommitted creation nelle API, di modo da poter fare una sola
	// openconnection, fare tutte le create, e solo dopo fare la commit finale
	/**
	 * Metodo che crea una istanza di WebPage con valore urlPage
	 * 
	 * @param SesameOWLModelImpl
	 *            repository
	 *@param String
	 *            urlPage
	 *@param String
	 *            title
	 *@return String webPageInstanceName: uri della instance
	 * @throws ModelUpdateException
	 * @throws ModelAccessException 
	 */
	public static ARTResource createWebPage(OWLModel repository, String urlPage, String title)
			throws ModelUpdateException, ModelAccessException {
		logger.debug("creating Web Page Instance for page: " + urlPage + " with title: " + title);
		ARTURIResource webPageInstanceRes = null;

		ARTResourceIterator collectionIterator;
		try {
			collectionIterator = repository.listSubjectsOfPredObjPair(SemAnnotVocab.Res.url, repository
					.createLiteral(urlPage), true);
			// iterator();
			if (collectionIterator.streamOpen()) {
				webPageInstanceRes = collectionIterator.getNext().asURIResource();
				logger.debug("found web page: "
						+ webPageInstanceRes.getLocalName()
						+ repository.listValuesOfSubjDTypePropertyPair(webPageInstanceRes,
								SemAnnotVocab.Res.url, true).getNext());
			}
		} catch (ModelAccessException e) {
			throw new ModelUpdateException(e);
		}

		if (webPageInstanceRes == null) {
			logger.debug("web page not found;");
			String webPageInstanceID = generateNewSemanticAnnotationUUID(repository);

			logger.debug("creating WebPage. webPageInstanceId: " + webPageInstanceID + " webPageRes: "
					+ SemAnnotVocab.Res.WebPage);
			repository.addInstance(repository.getDefaultNamespace() + webPageInstanceID,
					SemAnnotVocab.Res.WebPage);

			webPageInstanceRes = repository.createURIResource(repository.getDefaultNamespace()
					+ webPageInstanceID);
			repository.instantiateDatatypeProperty(webPageInstanceRes, SemAnnotVocab.Res.url, urlPage);
			if (!title.equals("")) {
				repository.instantiateDatatypeProperty(webPageInstanceRes, SemAnnotVocab.Res.title, title);
			}
		}

		return webPageInstanceRes;

	}

	/**
	 * Metodo che crea una istanza di SemanticAnnotation associando una lexicalization all'istanza della
	 * classe
	 * 
	 * @param SesameOWLModelImpl
	 *            repository
	 *@param String
	 *            instanceName
	 *@param String
	 *            lexicalization
	 *@param String
	 *            webPageInstanceName
	 * @throws ModelUpdateException
	 * @throws ModelAccessException 
	 **/
	private static void createSemanticAnnotation(OWLModel repository, String individualQName,
			String lexicalization, ARTResource webPageInstanceRes) throws ModelUpdateException, ModelAccessException {

		String semanticAnnotationID = generateNewSemanticAnnotationUUID(repository);

		repository.addInstance(repository.getDefaultNamespace() + semanticAnnotationID,
				SemAnnotVocab.Res.SemanticAnnotation);

		ARTResource semanticAnnotationInstanceRes = repository.createURIResource(repository
				.getDefaultNamespace()
				+ semanticAnnotationID);
		logger.debug("creating lexicalization: semAnnotInstanceRes: " + semanticAnnotationInstanceRes + "");
		repository.instantiateDatatypeProperty(semanticAnnotationInstanceRes, SemAnnotVocab.Res.text,
				lexicalization);

		repository.instantiateObjectProperty(semanticAnnotationInstanceRes, SemAnnotVocab.Res.location,
				webPageInstanceRes);

		ARTResource instanceRes;
		try {
			instanceRes = repository.createURIResource(repository.expandQName(individualQName));
		} catch (ModelAccessException e) {
			throw new ModelUpdateException(e);
		}
		repository.instantiateObjectProperty(instanceRes, SemAnnotVocab.Res.annotation,
				semanticAnnotationInstanceRes);
	}

	public static String generateNewSemanticAnnotationUUID(OWLModel repository) throws ModelAccessException {
		UUID semanticAnnotationInstanceID;
		ARTResource semanticAnnotationInstance;
		String defNameSpace;
		do {
			semanticAnnotationInstanceID = UUID.randomUUID();
			defNameSpace = repository.getDefaultNamespace();
			logger.debug("trying to create random name for URIResource with namespace: " + defNameSpace
					+ " and UUID: " + semanticAnnotationInstanceID);
			semanticAnnotationInstance = repository.retrieveURIResource(repository.getDefaultNamespace()
					+ semanticAnnotationInstanceID.toString());
		} while (semanticAnnotationInstance != null);
		return semanticAnnotationInstanceID.toString();
	}

	/**
	 * Funzion che restituisce il File relativo a URI
	 * 
	 * @param uri
	 *            String
	 * @return File
	 */
	static public File uriToFile(String uri) throws URISyntaxException {
		int percentU = uri.indexOf("%u");
		if (percentU >= 0) {
			StringBuffer sb = new StringBuffer(uri.length());

			int start = 0;
			while (percentU > 0) {
				sb.append(uri.substring(start, percentU));

				char c = (char) Integer.parseInt(uri.substring(percentU + 2, percentU + 6), 16);

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
