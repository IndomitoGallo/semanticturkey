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
package it.uniroma2.art.semanticturkey.project;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.exceptions.ModelCreationException;
import it.uniroma2.art.owlart.exceptions.UnsupportedRDFFormatException;
import it.uniroma2.art.owlart.io.RDFFormat;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.semanticturkey.exceptions.ProjectCreationException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectUpdateException;
import it.uniroma2.art.semanticturkey.ontology.NSPrefixMappingUpdateException;
import it.uniroma2.art.semanticturkey.ontology.NSPrefixMappings;

import java.io.File;
import java.io.IOException;

public class SaveToStoreProject<MODELTYPE extends RDFModel> extends Project<MODELTYPE> {

	protected final static String triplesFileName = "triples.nt";
	File triplesFile;

	SaveToStoreProject(String projectName, File projectDir) throws ProjectCreationException {
		super(projectName, projectDir);		
		try {
			triplesFile = new File(projectDir, triplesFileName);
			if (!triplesFile.exists()) {
				if (!triplesFile.createNewFile())
					throw new ProjectCreationException("unable to create triple file inside project: " + projectName); 
			}
			nsPrefixMappingsPersistence = new NSPrefixMappings(projectDir, false);
		} catch (IOException e) {
			throw new ProjectCreationException(e);
		}
	}

	public void save() throws ProjectUpdateException {
		try {
			getOntModel().writeRDF(triplesFile, RDFFormat.NTRIPLES, NodeFilters.MAINGRAPH);
			nsPrefixMappingsPersistence.updatePrefixMappingRegistry();
		} catch (IOException e) {
			throw new ProjectUpdateException("unable to write to the project file");
		} catch (ModelAccessException e) {
			throw new ProjectUpdateException("unable to save the project; failing to access the triple store");
		} catch (UnsupportedRDFFormatException e) {
			throw new IllegalStateException(
					"ntriples format is not accepted, though it is obligatory for ST Ontology Managers");
		} catch (NSPrefixMappingUpdateException e) {
			throw new ProjectUpdateException(e);
		}
	}

	protected void loadTriples() throws ModelCreationException {
		try {			
			logger.debug("clearing RDF data");
			ontManager.clearData();
			logger.debug("starting the ont model");
			ontManager.startOntModel(getBaseURI(), getProjectStoreDir(), modelConfiguration);
			logger.debug("loading ontology data");
			ontManager.loadOntologyData(triplesFile, getBaseURI(), RDFFormat.NTRIPLES);
		} catch (UnsupportedRDFFormatException e) {
			throw new IllegalStateException(
					"ntriples format is not accepted, though it is obligatory for ST Ontology Managers");
		} catch (Exception e) {
			throw new ModelCreationException(e);
		}
	}

}
