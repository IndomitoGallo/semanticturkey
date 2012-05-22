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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import it.uniroma2.art.owlart.models.ModelFactory;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.models.UnloadableModelConfigurationException;
import it.uniroma2.art.owlart.models.UnsupportedModelConfigurationException;
import it.uniroma2.art.owlart.sesame2impl.factory.ARTModelFactorySesame2Impl;
import it.uniroma2.art.owlart.sesame2impl.models.conf.Sesame2ModelConfiguration;
import it.uniroma2.art.semanticturkey.ontology.OntologyManagerFactoryImpl;
import it.uniroma2.art.semanticturkey.ontology.STOntologyManager;
import it.uniroma2.art.semanticturkey.project.Project;

public class OntologyManagerFactorySesame2Impl extends OntologyManagerFactoryImpl<Sesame2ModelConfiguration> {

	protected static Logger logger = LoggerFactory.getLogger(OntologyManagerFactorySesame2Impl.class);
	
	protected ModelFactory<Sesame2ModelConfiguration> createModelFactory() {
		return new ARTModelFactorySesame2Impl();
	}

	public <MODELTYPE extends RDFModel> STOntologyManager<MODELTYPE> createOntologyManager(
			Project<MODELTYPE> project) {
		return new STOntologyManagerSesame2Impl<MODELTYPE>(project);
	}

	@SuppressWarnings("unchecked")
	public Sesame2ModelConfiguration createModelConfigurationObject(String mcTypeString)
			throws UnsupportedModelConfigurationException, UnloadableModelConfigurationException,
			ClassNotFoundException {

		Class<? extends Sesame2ModelConfiguration> mcType = (Class<? extends Sesame2ModelConfiguration>) Class.forName(mcTypeString);

		logger.debug("class loader of static: " + ARTModelFactorySesame2Impl.class.getSimpleName() + " : " + ARTModelFactorySesame2Impl.class.getClassLoader());
		logger.debug("class loader of static: " + OntologyManagerFactorySesame2Impl.class.getSimpleName() + " : " + OntologyManagerFactorySesame2Impl.class.getClassLoader());
		logger.debug("class loader of: " + this.getClass().getSimpleName() + " instance: " + this.getClass().getClassLoader());
		logger.debug("class loader of resolved model configuration class: " + mcType.getClass().getSimpleName() + "inside: " + this.getClass().getSimpleName() + " = " + mcType.getClassLoader());
		
		return createModelFactory().createModelConfigurationObject(mcType);
	}

}
