package it.uniroma2.art.semanticturkey.servlet.main.filters;

import java.util.Collection;

import org.w3c.dom.traversal.NodeFilter;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTStatement;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.navigation.ARTStatementIterator;
import it.uniroma2.art.owlart.vocabulary.RDFS;

import com.google.common.base.Predicate;

public class StatementWithSubPropertyPredicate_Predicate implements Predicate<ARTStatement> {

	OWLModel model;
	Collection<ARTURIResource> predicates;
	ARTResource[] graphs;
	boolean excludePropItSelf;

	
	public static StatementWithSubPropertyPredicate_Predicate getFilter(OWLModel model, 
			Collection<ARTURIResource> predicates, boolean excludePropItSelf, ARTResource... graphs) {
		return new StatementWithSubPropertyPredicate_Predicate(model, predicates, excludePropItSelf, graphs);
	}

	protected StatementWithSubPropertyPredicate_Predicate(OWLModel model, Collection<ARTURIResource> predicates, 
			boolean excludePropItSelf, ARTResource... graphs ) {
		this.model = model;
		this.predicates = predicates;
		this.graphs = graphs;
		this.excludePropItSelf = excludePropItSelf;
	}

	public boolean apply(ARTStatement res) {
		try {
			if(excludePropItSelf){
				String predURI = res.getPredicate().getURI();
				if(predicates.contains(res.getPredicate()))
					return false;
			}
			ARTStatementIterator stat = model.listStatements(res.getPredicate(), 
					model.createURIResource(model.expandQName(RDFS.SUBPROPERTYOF)), NodeFilters.ANY, 
					true, graphs);
			boolean subProp = false;
			while(stat.hasNext() && !subProp){
				ARTURIResource superProp = stat.next().getObject().asURIResource();
				if(predicates.contains(superProp))
					subProp = true;
			}
				
			stat.close();
			
			return subProp;
			
		} catch (ModelAccessException e) {
			return false;
		}
	}


}
