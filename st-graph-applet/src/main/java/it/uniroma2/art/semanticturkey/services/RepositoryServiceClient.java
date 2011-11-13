package it.uniroma2.art.semanticturkey.services;

import it.uniroma2.art.semanticturkey.graph.Edge;
import it.uniroma2.art.semanticturkey.graph.Pair;
import it.uniroma2.art.semanticturkey.graph.Vertex;

import java.util.Vector;

public interface RepositoryServiceClient 
{
	public Vertex getRootVertex();
	public Vector<Pair<Vertex, Edge>> getChildrenOf(Vertex v);
}
