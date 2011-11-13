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
 * The Original Code is ST OntologyManager - Sesame Implementation.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2008.
 * All Rights Reserved.
 *
 * The ART Ontology API - Sesame Implementation were developed by the Artificial Intelligence Research Group
 * (art.uniroma2.it) at the University of Roma Tor Vergata
 * Current information about the ST OntologyManager - Sesame Implementation can be obtained at 
 * http//semanticturkey.uniroma2.it
 *
 */


package it.uniroma2.art.semanticturkey.ontology.sesame2;

import it.uniroma2.art.owlart.agraphimpl.factory.ARTModelFactoryAllegroGraphImpl;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.sesame2impl.vocabulary.SESAME;
import it.uniroma2.art.semanticturkey.ontology.STOntologyManager;
import it.uniroma2.art.semanticturkey.project.Project;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author Armando Stellato
 * 
 */
public class STOntologyManagerAllegroGraphImpl<MODELTYPE extends RDFModel> extends STOntologyManager<MODELTYPE> {

	protected static Logger logger = LoggerFactory.getLogger(STOntologyManagerAllegroGraphImpl.class);

	STOntologyManagerAllegroGraphImpl(Project<MODELTYPE> project) {
		super(project, new ARTModelFactoryAllegroGraphImpl());
	}


	@Override
	public String getId() {
		return "it.uniroma2.art.semanticturkey.ontology.sesame2.STOntologyManagerAllegroGraphImpl";
	}

	@Override
	protected void declareSupportOntologies() {
		declareSupportOntology(owlModel.createURIResource(SESAME.NAMESPACE), false, true);
	}

}
