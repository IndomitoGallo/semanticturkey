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
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public class SKOSServiceClient extends HttpServiceClient implements RepositoryServiceClient 
{
	//private static final String CMD_GET_NARROWERSOF = "service=skos&request=getNarrowerConcepts&conceptName=%s";
	//private static final String CMD_GET_ROOTS = "service=cls&request=getClassesInfoAsRootsForTree&clsesqnames=%s&instNum=true";
	private static final String CMD_GET_PROJECT_PROPERTY = "service=projects&request=getProjectProperty&propNames=%s";
	private static final String CMD_GET_ROOT_CONCEPTS = "service=skos&request=getTopConcepts&scheme=%s&lang=%s";
	private static final String CMD_GET_NARROWER_CONCEPTS = "service=skos&request=getNarrowerConcepts&concept=%s&scheme=%s&lang=%s";
	
	//private static final String CMD_GET_CONCEPTDESCRIPTION = "service=skos&request=getConceptDescription&concept=%s&scheme=%s&lang=%s";
	private static final String CMD_GET_CONCEPTDESCRIPTION = "service=skos&request=getConceptDescription&concept=%s&method=templateandvalued";

	private static final String NODE_TYPE_CONCEPT = "concept";
	
	private static final String SEMANTIC_RELATION = "skos:semanticRelation";
	
	
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
	
	public List<Edge> getChildrenOf(Vertex vertex) 
	{
		if (vertex instanceof SKOSConceptVertex) {
			List<Edge> edgeList = new ArrayList<Edge>();
			List<Edge> tempEdgeList = null;
			tempEdgeList = getNarrowerConceptsOf((SKOSConceptVertex)vertex);		
			if (tempEdgeList != null)
				edgeList.addAll(tempEdgeList);
			tempEdgeList = getConceptDescription((SKOSConceptVertex)vertex);
			if (tempEdgeList != null)
				edgeList.addAll(tempEdgeList);
			return edgeList;
		} else if (vertex instanceof SKOSConceptSchemeVertex) {
			return getTopConceptsOf((SKOSConceptSchemeVertex)vertex);
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
			Element node = (Element)nodes.item(i);

			String name = node.getTextContent().trim();
			String nodeFace = name;
			if (isHumanReadable()) {
				String label = node.getAttributes().getNamedItem("show").getNodeValue().trim();
				
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

	private List<Edge> getConceptDescription(SKOSVertex vertex) {
		 
		String cmd = String.format(CMD_GET_CONCEPTDESCRIPTION, encodeURIComponent(vertex.getName()), encodeURIComponent(selectedScheme), encodeURIComponent(getLang()));

		XMLResponse response = doHttpGet(SERVLET_URL, cmd);
		if (response == null)
			return null;
		
		List<Edge> edgeList = new ArrayList<Edge>();
		Document doc = response.getResponseObject();
		NodeList nodeList = doc.getElementsByTagName("Property");
		for (int i = 0; i < nodeList.getLength(); ++i) {
			Node node = nodeList.item(i);
			String propName = ((Element)node).getAttribute("name");

			if(propName.compareTo(SEMANTIC_RELATION) == 0)
				continue;
			
			NodeList values = node.getChildNodes();

			for (int j = 0; j < values.getLength(); ++j) {
				Node valueNode = values.item(j);
				if (valueNode instanceof Element) {
					String name = valueNode.getTextContent().trim();
					String nodeFace = name;
					Element valueElem = ((Element) valueNode);
					if (isHumanReadable()) {
						String label = valueElem.getAttributes().getNamedItem("show").getNodeValue().trim();
						
						if (!label.equals("")) {
							nodeFace = label;
						}
					}
					SKOSConceptVertex skosVertex;
					String role = valueNode.getAttributes().getNamedItem("role").getNodeValue().trim();
					if (!role.equals(NODE_TYPE_CONCEPT))
						continue;
					skosVertex = (SKOSConceptVertex) completeVertexMap.get(name);
					if(skosVertex == null){
						continue; // use only the vertex which are already present in the graph
						//skosVertex = new SKOSConceptVertex(name, vertex, false, name);
						//skosVertex.setTooltip(name);
					}
					Edge edge = new Edge(propName, vertex, skosVertex, true);
					edgeList.add(edge);
				}
				
				
			}
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
