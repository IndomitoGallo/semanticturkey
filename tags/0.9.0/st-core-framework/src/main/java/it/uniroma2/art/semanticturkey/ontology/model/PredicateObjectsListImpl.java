package it.uniroma2.art.semanticturkey.ontology.model;

import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFNode;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFResource;

import java.util.Collection;
import java.util.HashMap;

import com.google.common.collect.HashMultimap;

public class PredicateObjectsListImpl implements PredicateObjectsList {

	HashMultimap<ARTURIResource, STRDFNode> valueMultiMap;
	HashMap<ARTURIResource, STRDFResource> propMap;

	PredicateObjectsListImpl(HashMap<ARTURIResource, STRDFResource> propMap,
			HashMultimap<ARTURIResource, STRDFNode> valueMultiMap) {
		this.propMap = propMap;
		this.valueMultiMap = valueMultiMap;
	}

	public Collection<STRDFResource> getPredicates() {
		return propMap.values();
	}

	public Collection<STRDFNode> getValues(ARTURIResource predicate) {
		return valueMultiMap.get(predicate);
	}

	public Collection<STRDFNode> getValues(STRDFResource predicate) {
		return valueMultiMap.get((ARTURIResource)predicate.getARTNode());
	}


}
