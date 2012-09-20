package it.uniroma2.art.semanticturkey.services;

import it.uniroma2.art.semanticturkey.graph.Edge;
import it.uniroma2.art.semanticturkey.graph.Vertex;

import java.util.List;
import java.util.Map;

public interface RepositoryServiceClient {
	
	public Vertex getRootVertex();
	public List<Edge> getChildrenOf(Vertex v);
}
