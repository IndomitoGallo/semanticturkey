package it.uniroma2.art.semanticturkey.services;

import it.uniroma2.art.semanticturkey.graph.Vertex;

public class SKOSConceptSchemeVertex extends SKOSVertex {

	public SKOSConceptSchemeVertex(String name, Vertex vertexParent, boolean isRootVertex) {
		super(name, vertexParent, isRootVertex, name);
	}
	
}
