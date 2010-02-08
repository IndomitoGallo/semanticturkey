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
 * The Original Code is ST_EXT-R_Sesame2ImplExtension.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2009.
 * All Rights Reserved.
 *
 * ST_EXT-R_Sesame2ImplExtension was developed by the Artificial Intelligence Research Group
 * (ai-nlp.info.uniroma2.it) at the University of Roma Tor Vergata
 * Current information about ST_EXT-R_Sesame2ImplExtension can be obtained at 
 * http//ai-nlp.info.uniroma2.it/software/...
 *
 */

/*
 * Contributor(s): Armando Stellato stellato@info.uniroma2.it
 */
package it.uniroma2.art.semanticturkey.ontology.sesame2;

import it.uniroma2.art.owlart.sesame2impl.factory.ARTModelFactorySesame2Impl;
import it.uniroma2.art.owlart.sesame2impl.vocabulary.SESAME;
import it.uniroma2.art.semanticturkey.ontology.STOntologyManager;
import it.uniroma2.art.semanticturkey.project.Project;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author Armando Stellato
 * @author Andrea Turbati
 * 
 */
public class STOntologyManagerSesame2Impl extends STOntologyManager {

	protected static Logger logger = LoggerFactory.getLogger(STOntologyManagerSesame2Impl.class);

	STOntologyManagerSesame2Impl(Project project) {
		super(project, new ARTModelFactorySesame2Impl());
	}


	@Override
	public String getId() {
		return "it.uniroma2.art.semanticturkey.ontology.sesame2.STOntologyManagerSesame2Impl";
	}

	@Override
	protected void declareSupportOntologies() {
		declareSupportOntology(owlModel.createURIResource(SESAME.NAMESPACE), false, true);
	}

}
