package it.uniroma2.art.semanticturkey.ontology.model;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.model.ARTStatement;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.navigation.RDFIterator;
import it.uniroma2.art.owlart.utilities.RDFIterators;
import it.uniroma2.art.owlart.vocabulary.RDFResourceRolesEnum;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFNode;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFNodeFactory;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFResource;

import java.util.HashMap;
import java.util.Set;

import com.google.common.collect.HashMultimap;

public class PredicateObjectsListFactory {

	// TODO instead of passing series of arguments for deciding if to infer roles, or force them etc...
	// just define some generator object

	/**
	 * this method, given a collection of statements centered on one subject, will create bags of objects
	 * grouped by common predicates. The result is a collection of structures, each one containing one
	 * predicate and a collection of RDF nodes which are objects of that predicate in a statement from the
	 * input collection<br/>
	 * this method takes care of closing the input iterators
	 * 
	 * @param model
	 * @param role
	 * @param inferredStats
	 * @param explicitStatementsIterator
	 * @return
	 * @throws ModelAccessException
	 */
	public static PredicateObjectsList createPredicateObjectsList(RDFModel model, RDFResourceRolesEnum role,
			RDFIterator<ARTStatement> inferredStats, RDFIterator<ARTStatement> explicitStatementsIterator)
			throws ModelAccessException {

		Set<ARTStatement> explicitStatements = RDFIterators.getSetFromIterator(explicitStatementsIterator);

		HashMap<ARTURIResource, STRDFResource> art2STRDFPredicates = new HashMap<ARTURIResource, STRDFResource>();
		HashMultimap<ARTURIResource, STRDFNode> resultPredicateObjectValues = HashMultimap.create();

		while (inferredStats.streamOpen()) {

			ARTStatement st = inferredStats.getNext();

			ARTURIResource predicate = st.getPredicate();
			boolean explicit = false;

			System.out.println("explicit statements:\n" + explicitStatements);

			if (explicitStatements.contains(st))
				explicit = true;
			resultPredicateObjectValues.put(predicate,
					STRDFNodeFactory.createSTRDFNode(model, st.getObject(), true, explicit, true));

			art2STRDFPredicates.put(predicate, STRDFNodeFactory.createSTRDFURI(predicate, role, true,
					model.getQName(predicate.getURI())));
		}

		inferredStats.close();
		explicitStatementsIterator.close();

		for (ARTURIResource prop : resultPredicateObjectValues.keySet()) {
			System.out.println("prop: " + prop);
			for (STRDFNode value : resultPredicateObjectValues.get(prop))
				System.out.println("\t\tvalue: " + value + " explicit: " + value.isExplicit());
		}

		return new PredicateObjectsListImpl(art2STRDFPredicates, resultPredicateObjectValues);
	}
}
