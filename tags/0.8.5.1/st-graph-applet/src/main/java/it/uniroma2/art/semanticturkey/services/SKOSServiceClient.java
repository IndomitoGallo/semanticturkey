package it.uniroma2.art.semanticturkey.services;

import it.uniroma2.art.semanticturkey.graph.Edge;
import it.uniroma2.art.semanticturkey.graph.Pair;
import it.uniroma2.art.semanticturkey.graph.Vertex;
import it.uniroma2.art.semanticturkey.servlet.XMLResponse;

import java.util.Vector;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public class SKOSServiceClient extends HttpServiceClient implements RepositoryServiceClient 
{
	//private static final String CMD_GET_NARROWERSOF = "service=skos&request=getNarrowerConcepts&conceptName=%s";
	//private static final String CMD_GET_ROOTS = "service=cls&request=getClassesInfoAsRootsForTree&clsesqnames=%s&instNum=true";
	private static final String CMD_GET_PROJECT_PROPERTY = "service=projects&request=getProjectProperty&propNames=%s";
	private static final String CMD_GET_ROOT_CONCEPTS = "service=skos&request=getTopConcepts&scheme=%s&lang=%s";
	private static final String CMD_GET_NARROWER_CONCEPTS = "service=skos&request=getNarrowerConcepts&concept=%s&scheme=%s&lang=%s";

	private String selectedScheme;
	private boolean humanReadable;
	private String lang;
	
	public SKOSServiceClient(boolean humanReadable, String lang) {
		this.humanReadable = humanReadable;
		this.lang = lang;
	}
	
	public Vertex getRootVertex() 
	{
		String cmd = String.format(CMD_GET_PROJECT_PROPERTY, "skos.selected_scheme");
		XMLResponse response = doHttpGet(SERVLET_URL, cmd);
		if (response == null)
			return null;
		
		Document doc = response.getResponseObject();
		selectedScheme = doc.getElementsByTagName("property").item(0).getAttributes().getNamedItem("value").getNodeValue();

		return new SKOSConceptSchemeVertex(selectedScheme);
	}
	
	public Vector<Pair<Vertex, Edge>> getChildrenOf(Vertex v) 
	{
		if (v instanceof SKOSConceptVertex) {
			return getNarrowerConceptsOf((SKOSConceptVertex)v);		
		} else if (v instanceof SKOSConceptSchemeVertex) {
			return getTopConceptsOf((SKOSConceptSchemeVertex)v);
		}
		
		return null;
	}

	private Vector<Pair<Vertex, Edge>> getTopConceptsOf(SKOSVertex parentVertex) {
		String cmd = String.format(CMD_GET_ROOT_CONCEPTS, parentVertex.getName(), getLang());
		XMLResponse response = doHttpGet(SERVLET_URL, cmd);
		if (response == null)
			return null;
		
		Document doc = response.getResponseObject();
		
		Vector<Pair<Vertex, Edge>> result = new Vector<Pair<Vertex,Edge>>();
		
		NodeList nodes = doc.getElementsByTagName("concept");
		
		for (int i = 0 ; i < nodes.getLength() ; i++) {
			Node n = nodes.item(i);

			String name = n.getAttributes().getNamedItem("name").getNodeValue();;
			String nodeFace = name;
			if (isHumanReadable()) {
				String label = n.getAttributes().getNamedItem("label").getNodeValue().trim();
				
				if (!label.equals("")) {
					nodeFace = label;
				}
			}
			
			result.add(new Pair<Vertex, Edge>(new SKOSConceptVertex(name, nodeFace), new Edge("skos:hasTopConcept")));
		}

		
		return result;
	}
	
	private Vector<Pair<Vertex, Edge>> getNarrowerConceptsOf(SKOSVertex parentVertex) {
		String cmd = String.format(CMD_GET_NARROWER_CONCEPTS, parentVertex.getName(), selectedScheme, getLang());
		XMLResponse response = doHttpGet(SERVLET_URL, cmd);
		if (response == null)
			return null;
		
		Document doc = response.getResponseObject();
		
		Vector<Pair<Vertex, Edge>> result = new Vector<Pair<Vertex,Edge>>();
		
		NodeList nodes = doc.getElementsByTagName("concept");
		
		for (int i = 0 ; i < nodes.getLength() ; i++) {
			Node n = nodes.item(i);
			
			String name = n.getAttributes().getNamedItem("name").getNodeValue();;
			String nodeFace = name;
			if (isHumanReadable()) {
				String label = n.getAttributes().getNamedItem("label").getNodeValue().trim();
				
				if (!label.equals("")) {
					nodeFace = label;
				}
			}
			
			result.add(new Pair<Vertex, Edge>(new SKOSConceptVertex(name, nodeFace), new Edge("skos:narrower")));
		}

		
		return result;
	}
	
	private Object getLang() {
		return this.lang;
	}

	protected boolean isHumanReadable() {
		return this.humanReadable;
	}
}
