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
 * The Original Code is ART Ontology API.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2007.
 * All Rights Reserved.
 *
 * ART Ontology API was developed by the Artificial Intelligence Research Group
 * (art.uniroma2.it) at the University of Roma Tor Vergata
 * Current information about the ART Ontology API can be obtained at 
 * http//art.uniroma2.it/owlart
 *
 */

/*
 * Contributor(s): Armando Stellato stellato@info.uniroma2.it
 */
package it.uniroma2.art.semanticturkey.filter;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.model.ARTStatement;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.models.OWLModel;

import com.google.common.base.Predicate;

/**
 * a predicate accepting statements which have a given property (or any of its subproperties) as predicate
 * 
 * @author Armando Stellato
 * 
 */
public class StatementWithAProperty_Predicate implements Predicate<ARTStatement> {

	OWLModel model;
	ARTURIResource property;

	public static StatementWithAProperty_Predicate getFilter(OWLModel model, ARTURIResource property) {
		return new StatementWithAProperty_Predicate(model, property);
	}

	protected StatementWithAProperty_Predicate(OWLModel model, ARTURIResource property) {
		this.model = model;
		this.property = property;
	}

	public boolean apply(ARTStatement res) {
		try {
			if (model.hasSuperProperty(res.getPredicate(), property, true))
				return true;
		} catch (ModelAccessException e) {
			return false;
		}
		return false;
	}
}
