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

package it.uniroma2.art.semanticturkey.servlet.main;

import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceInterface;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;

/**
 * @author Andrea Turbati
 * 
 */
public class ServletBundle implements BundleActivator {

	protected static Logger logger = LoggerFactory.getLogger(ServletBundle.class);

	public void start(BundleContext context) throws Exception {

		logger.info("registering services");

		context.registerService(ServiceInterface.class.getName(), new SystemStart("systemStart"), null);
		context.registerService(ServiceInterface.class.getName(), new Administration("administration"), null);
		context.registerService(ServiceInterface.class.getName(), new Annotate("annotate"), null);
		context.registerService(ServiceInterface.class.getName(), new Annotation("annotation"), null);
		context.registerService(ServiceInterface.class.getName(), new Cls("cls"), null);
		context.registerService(ServiceInterface.class.getName(), new Delete("delete"), null);
		context.registerService(ServiceInterface.class.getName(), new Graph("graph"), null);
		context.registerService(ServiceInterface.class.getName(), new Individual("individual"), null);
		context.registerService(ServiceInterface.class.getName(), new InputOutput("inputOutput"), null);
		context.registerService(ServiceInterface.class.getName(), new Metadata("metadata"), null);
		context.registerService(ServiceInterface.class.getName(), new ModifyName("modifyName"), null);
		context.registerService(ServiceInterface.class.getName(), new Page("page"), null);
		context.registerService(ServiceInterface.class.getName(), new Property("property"), null);
		context.registerService(ServiceInterface.class.getName(), new OntoSearch("ontologySearch"), null);
		context.registerService(ServiceInterface.class.getName(), new Synonyms("synonyms"), null);
		context.registerService(ServiceInterface.class.getName(), new Projects("projects"), null);
		context.registerService(ServiceInterface.class.getName(), new SPARQL("sparql"), null);
		context.registerService(ServiceInterface.class.getName(), new Statement("statement"), null);
		
		context.registerService(ServiceInterface.class.getName(), new Plugins("plugins"), null);
		
		logger.info("all services have been registered");
	}

	public void stop(BundleContext arg0) throws Exception {
		// TODO Auto-generated method stub

	}

}
