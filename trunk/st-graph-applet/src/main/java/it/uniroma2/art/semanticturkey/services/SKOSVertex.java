package it.uniroma2.art.semanticturkey.services;

import it.uniroma2.art.semanticturkey.graph.Vertex;

public abstract class SKOSVertex extends Vertex{

	public static final String SKOS_ICON_CONCEPT = "SKOS_CONCEPT";

	private String nodeFace;
	
	public SKOSVertex(String name, String nodeFace) {
		super(name);
		this.nodeFace = nodeFace;
	}
	
	@Override
	public String toString() {
		return this.nodeFace;
	}
	
	@Override
	public boolean equals(Object o) {
		boolean base = super.equals(o);
		
		if (base) {
			SKOSVertex oV = (SKOSVertex)o;
			
			return this.nodeFace.equals(oV.nodeFace);
		}
		
		return false;
	}
}
