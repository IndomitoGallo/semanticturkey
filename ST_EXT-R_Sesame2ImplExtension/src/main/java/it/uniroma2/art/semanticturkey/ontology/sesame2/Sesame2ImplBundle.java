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
 * The Original Code is ART Ontology API - Sesame Implementation.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2008.
 * All Rights Reserved.
 *
 * The ART Ontology API - Sesame Implementation were developed by the Artificial Intelligence Research Group
 * (ai-nlp.info.uniroma2.it) at the University of Roma Tor Vergata
 * Current information about the ART Ontology API - Sesame Implementation can be obtained at 
 * http//ai-nlp.info.uniroma2.it/software/...
 *
 */
package it.uniroma2.art.semanticturkey.ontology.sesame2;

import it.uniroma2.art.semanticturkey.ontology.OntologyManagerFactory;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;

/**
 * @author Armando Stellato
 * @author Andrea Turbati
 * 
 */
public class Sesame2ImplBundle implements BundleActivator {

	public void start(BundleContext context) throws Exception {

		context.registerService(OntologyManagerFactory.class.getName(),
				new OntologyManagerFactorySesame2Impl(), null);

	}

	public void stop(BundleContext arg0) throws Exception {
		// TODO Auto-generated method stub

	}

}
