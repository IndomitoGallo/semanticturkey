package it.uniroma2.art.semanticturkey.ontology.model;

import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFNode;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFResource;

import java.util.Collection;

public interface PredicateObjectList {
	
	Collection<STRDFResource> getPredicates();
	
	Collection<STRDFNode> getValues(ARTURIResource predicate);
	
	Collection<STRDFNode> getValues(STRDFResource predicate);	
	
}
