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
 * The Original Code is Semantic Turkey.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2009.
 * All Rights Reserved.
 *
 * Semantic Turkey was developed by the Artificial Intelligence Research Group
 * (art.uniroma2.it) at the University of Roma Tor Vergata
 * Current information about Semantic Turkey can be obtained at 
 * http//ai-nlp.info.uniroma2.it/software/...
 *
 */

/*
 * Contributor(s): Armando Stellato stellato@info.uniroma2.it
 */
package it.uniroma2.art.semanticturkey.ontology;

import it.uniroma2.art.owlart.models.ModelFactory;
import it.uniroma2.art.owlart.models.UnloadableModelConfigurationException;
import it.uniroma2.art.owlart.models.UnsupportedModelConfigurationException;
import it.uniroma2.art.owlart.models.conf.ModelConfiguration;

import java.util.ArrayList;
import java.util.Collection;

public abstract class OntologyManagerFactoryImpl<MC extends ModelConfiguration> implements
		OntologyManagerFactory<MC> {

	public String getId() {
		return this.getClass().getName();
	}

	public abstract ModelFactory<MC> createModelFactory();

	public ArrayList<MC> getModelConfigurations() throws UnsupportedModelConfigurationException,
			UnloadableModelConfigurationException {

		ModelFactory<MC> mf = createModelFactory();
		Collection<Class<? extends MC>> mConfTypes = mf.getModelConfigurations();

		ArrayList<MC> mConfs = new ArrayList<MC>();

		for (Class<? extends MC> mConfType : mConfTypes) {
			mConfs.add(mf.createModelConfigurationObject(mConfType));
		}

		return mConfs;

	}

	/*
	public <MCImpl extends MC> MCImpl createModelConfigurationObject(String mcTypeString)
			throws UnsupportedModelConfigurationException, UnloadableModelConfigurationException,
			ClassNotFoundException {

		Class<MCImpl> mcType = (Class<MCImpl>) Class.forName(mcTypeString);

		return createModelFactory().createModelConfigurationObject(mcType);
	}
	*/
}
