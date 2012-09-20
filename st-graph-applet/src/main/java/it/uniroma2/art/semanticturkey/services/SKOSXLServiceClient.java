package it.uniroma2.art.semanticturkey.services;

import it.uniroma2.art.semanticturkey.graph.Vertex;

import java.util.Map;

public class SKOSXLServiceClient extends SKOSServiceClient {
	
	public SKOSXLServiceClient(Map<String, Vertex> completeVertexMap, boolean humanReadable, String lang) {
		super(completeVertexMap, humanReadable, lang);
	}
	
}
