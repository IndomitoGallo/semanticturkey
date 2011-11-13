package it.uniroma2.art.semanticturkey.model.test;

import it.uniroma2.art.owlart.model.ARTNode;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTStatement;
import it.uniroma2.art.owlart.model.ARTURIResource;

public class ARTStatementTestImpl implements ARTStatement {

	ARTResource subj;
	ARTURIResource pred;
	ARTNode obj;
	
	public ARTStatementTestImpl(ARTResource subj, ARTURIResource pred, ARTNode obj) {
		this.subj = subj;
		this.pred = pred;
		this.obj = obj;
	}
	
	public ARTResource getNamedGraph() {
		throw new IllegalAccessError("not implemented");
	}

	public ARTNode getObject() {
		return obj;
	}

	public ARTURIResource getPredicate() {
		return pred;
	}

	public ARTResource getSubject() {
		return subj;
	}

	public String toString() {
		return "stat(" + subj + "," + pred + "," + obj + ")";
	}
	
	public int hashCode() {
		return toString().hashCode();
	}
	
	public boolean equals(Object obj) {
		return (this.hashCode() == obj.hashCode()); 
	}
}
