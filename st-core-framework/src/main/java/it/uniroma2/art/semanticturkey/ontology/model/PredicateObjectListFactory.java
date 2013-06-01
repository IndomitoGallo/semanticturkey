package it.uniroma2.art.semanticturkey.ontology.model;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.model.ARTNode;
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

public class PredicateObjectListFactory {

	// TODO instead of passing series of arguments for deciding if to infer roles, or force them etc...
	// just define some generator object

	/**
	 * @param model
	 * @param role
	 * @param inferredStats
	 * @param explicitStatementsIterator
	 * @return
	 * @throws ModelAccessException
	 */
	public static PredicateObjectList createPredicateObjectList(RDFModel model, RDFResourceRolesEnum role,
			RDFIterator<ARTStatement> inferredStats, RDFIterator<ARTStatement> explicitStatementsIterator)
			throws ModelAccessException {

		Set<ARTStatement> explicitStatements = RDFIterators.getSetFromIterator(explicitStatementsIterator);

		HashMap<ARTURIResource, STRDFResource> art2STRDFPredicates = new HashMap<ARTURIResource, STRDFResource>();
		HashMultimap<ARTURIResource, STRDFNode> resultPredicateObjectValues = HashMultimap.create();

		while (inferredStats.hasNext()) {

			ARTStatement st = inferredStats.next();

			ARTURIResource predicate = st.getPredicate();
			// TODO replace with false as soon as the equals on the statement works
			boolean explicit = true;

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

		return new PredicateObjectListImpl(art2STRDFPredicates, resultPredicateObjectValues);
	}
}
