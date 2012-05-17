package it.uniroma2.art.semanticturkey.services;

import it.uniroma2.art.semanticturkey.graph.Vertex;

public abstract class SKOSVertex extends Vertex{

	public static final String SKOS_ICON_CONCEPT = "SKOS_CONCEPT";

	public SKOSVertex(String name) {
		super(name);
	}

}
