package it.uniroma2.art.semanticturkey.model.test;

import it.uniroma2.art.owlart.model.ARTBNode;
import it.uniroma2.art.owlart.model.ARTLiteral;
import it.uniroma2.art.owlart.model.ARTNode;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;

public class ARTNodeTestImpl implements ARTNode {

	protected String content;
	
	ARTNodeTestImpl(String content) {
		this.content = content;
	}

	public ARTLiteral asLiteral() {
		return (ARTLiteral)this;
	}

	public ARTResource asResource() {
		return (ARTResource)this;
	}

	public ARTURIResource asURIResource() {
		return (ARTURIResource)this;
	}

	public boolean isBlank() {
		return false;
	}

	public boolean isLiteral() {
		// TODO Auto-generated method stub
		return false;
	}

	public boolean isResource() {
		// TODO Auto-generated method stub
		return false;
	}

	public boolean isURIResource() {
		// TODO Auto-generated method stub
		return false;
	}
	
	public String toString() {
		return content;
	}
	
	public int hashCode() {
		return content.hashCode();
	}
	
	public boolean equals(ARTNodeTestImpl other) {
		return content.equals(other.content);
	}

	public ARTBNode asBNode() {
		return (ARTBNode)this;
	}
}
