package it.uniroma2.art.semanticturkey.services;

import it.uniroma2.art.semanticturkey.graph.Vertex;

public class SKOSConceptVertex extends SKOSVertex{

	public SKOSConceptVertex(String name, Vertex vertexParent, boolean isRootVertex,String nodeFace) {
		super(name, vertexParent, isRootVertex, nodeFace);
		setIconName(SKOS_ICON_CONCEPT);
	}

}
