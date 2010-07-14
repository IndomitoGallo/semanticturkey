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
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2010.
 * All Rights Reserved.
 *
 * Semantic Turkey was developed by the Artificial Intelligence Research Group
 * (art.uniroma2.it) at the University of Roma Tor Vergata
 * Current information about Semantic Turkey can be obtained at 
 * http://semanticturkey.uniroma2.it
 *
 */

package it.uniroma2.art.semanticturkey.resources;

import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.semanticturkey.project.Project;
import it.uniroma2.art.semanticturkey.project.ProjectManager;

import java.io.File;
import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This class contains various integrity checks which are launched when Semantic Turkey is being started and
 * the SemanticTurkeyData directory is found in the user directory. Since previous versions of Semantic Turkey
 * may use a different folder structure for SemanticTurkeyData, this set of routines is in charge of aligning
 * a potential older version of the directory with the one which is being used.
 * 
 * @author Armando Stellato
 * 
 */
public class UpdateRoutines {

	protected static Logger logger = LoggerFactory.getLogger(UpdateRoutines.class);
	
	static void startUpdatesCheckAndRepair() {
		// from version 0.6.x to version 0.7.x
		align_from_06x_to_07x();
		align_from_071_to_072();
	}
	
	
	/**
	 * upgrade from version 0.6.x of SemanticTurkeyData
	 * 
	 * this limits to check that the Projects Folder exists and, in negative case, create it 
	 * @throws IOException 
	 */
	private static void align_from_06x_to_07x() {
		File projDir = Resources.getProjectsDir();
		if (!projDir.exists())
			projDir.mkdir();
	}
	
	/**
	 * upgrade from version 0.7.1 of SemanticTurkeyData to 0.7.2
	 * 
	 * this checks that the main-project exists, and, in case 
	 * @throws IOException 
	 */
	private static void align_from_071_to_072() {
		File mainProjDir = Resources.getMainProjectDir();
		if (mainProjDir.exists()) {
			try {
				String modelType = ProjectManager.getProjectProperty(ProjectManager.mainProjectName, Project.PROJECT_MODEL_TYPE);
				if (modelType==null) {
					logger.info("main project is present, though it shows no modeltype. Since it is a project previous to version 0.7.2, its model type is being set to OWLModel");
					ProjectManager.setProjectProperty(ProjectManager.mainProjectName, Project.PROJECT_MODEL_TYPE, OWLModel.class.getName());
					
				}
			} catch (IOException e) {
				logger.error("unable to access property file for main project (which seems however to exist)");
				e.printStackTrace();
			}
		}
	}

}
