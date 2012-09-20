package it.uniroma2.art.semanticturkey.services;

import it.uniroma2.art.semanticturkey.graph.Edge;
import it.uniroma2.art.semanticturkey.graph.Pair;
import it.uniroma2.art.semanticturkey.graph.Vertex;
import it.uniroma2.art.semanticturkey.servlet.XMLResponse;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
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
	private Map<String, Vertex> completeVertexMap;
	
	public SKOSServiceClient(Map<String, Vertex>completeVertexMap, boolean humanReadable, String lang) {
		this.completeVertexMap = completeVertexMap;
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

		SKOSConceptSchemeVertex vertex = new SKOSConceptSchemeVertex(selectedScheme, null, true);
		completeVertexMap.put(vertex.getName(), vertex);
		return vertex;
	}
	
	public List<Edge> getChildrenOf(Vertex v) 
	{
		if (v instanceof SKOSConceptVertex) {
			return getNarrowerConceptsOf((SKOSConceptVertex)v);		
		} else if (v instanceof SKOSConceptSchemeVertex) {
			return getTopConceptsOf((SKOSConceptSchemeVertex)v);
		}
		
		return null;
	}

	private List<Edge> getTopConceptsOf(SKOSVertex parentVertex) {
		String cmd = String.format(CMD_GET_ROOT_CONCEPTS, encodeURIComponent(parentVertex.getName()), encodeURIComponent(getLang()));
		XMLResponse response = doHttpGet(SERVLET_URL, cmd);
		if (response == null)
			return null;
		
		Document doc = response.getResponseObject();

		List<Edge> edgeList = new ArrayList<Edge>();
		
		NodeList nodes = doc.getElementsByTagName("uri");
		
		for (int i = 0 ; i < nodes.getLength() ; i++) {
			Element n = (Element)nodes.item(i);

			String name = n.getTextContent().trim();
			String nodeFace = name;
			if (isHumanReadable()) {
				String label = n.getAttributes().getNamedItem("show").getNodeValue().trim();
				
				if (!label.equals("")) {
					nodeFace = label;
				}
			}
			
			SKOSConceptVertex endVertex = (SKOSConceptVertex) completeVertexMap.get(name);
			if(endVertex == null){
				endVertex = new SKOSConceptVertex(name, parentVertex, false, nodeFace);
				completeVertexMap.put(endVertex.getName(), endVertex);	
			}
			Edge edge = new Edge("skos:hasTopConcept", parentVertex, endVertex, true);
			edgeList.add(edge);
		}

		
		return edgeList;
	}
	
	private List<Edge> getNarrowerConceptsOf(SKOSVertex parentVertex) {
		String cmd = String.format(CMD_GET_NARROWER_CONCEPTS, encodeURIComponent(parentVertex.getName()), encodeURIComponent(selectedScheme), encodeURIComponent(getLang()));
		XMLResponse response = doHttpGet(SERVLET_URL, cmd);
		if (response == null)
			return null;
		
		Document doc = response.getResponseObject();
		
		List<Edge> edgeList = new ArrayList<Edge>();
		
		NodeList nodes = doc.getElementsByTagName("uri");
		
		for (int i = 0 ; i < nodes.getLength() ; i++) {
			Element n = (Element)nodes.item(i);

			String name = n.getTextContent().trim();
			String nodeFace = name;
			if (isHumanReadable()) {
				String label = n.getAttributes().getNamedItem("show").getNodeValue().trim();
				
				if (!label.equals("")) {
					nodeFace = label;
				}
			}
			SKOSConceptVertex endVertex = (SKOSConceptVertex) completeVertexMap.get(name);
			if(endVertex == null){
				endVertex = new SKOSConceptVertex(name, parentVertex, false, nodeFace); 
				completeVertexMap.put(endVertex.getName(), endVertex);
			}
			Edge edge = new Edge("skos:narrower", parentVertex, endVertex, true);
			edgeList.add(edge);
		}

		
		return edgeList;
	}
	
	private String getLang() {
		return this.lang;
	}

	protected boolean isHumanReadable() {
		return this.humanReadable;
	}	
}
