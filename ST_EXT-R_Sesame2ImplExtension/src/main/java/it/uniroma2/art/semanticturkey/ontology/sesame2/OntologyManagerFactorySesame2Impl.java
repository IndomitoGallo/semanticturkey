package it.uniroma2.art.semanticturkey.ontology.sesame2;

import it.uniroma2.art.semanticturkey.ontology.OntologyManagerFactory;
import it.uniroma2.art.semanticturkey.ontology.STOntologyManager;
import it.uniroma2.art.semanticturkey.project.Project;

public class OntologyManagerFactorySesame2Impl extends OntologyManagerFactory {

	@Override
	public STOntologyManager createOntologyManager(Project project) {
		return new STOntologyManagerSesame2Impl(project);
	}

	public String getId() {
		return this.getClass().getName();
	}

}
