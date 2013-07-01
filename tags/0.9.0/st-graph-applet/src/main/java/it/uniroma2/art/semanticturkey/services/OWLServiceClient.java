package it.uniroma2.art.semanticturkey.services;

import it.uniroma2.art.semanticturkey.graph.Edge;
import it.uniroma2.art.semanticturkey.graph.Pair;
import it.uniroma2.art.semanticturkey.graph.Vertex;
import it.uniroma2.art.semanticturkey.services.OWLVertex.OWL_NODE_TYPE;
import it.uniroma2.art.semanticturkey.servlet.XMLResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * @author Carlo Ieva
 * @author Armando Stellato <stellato@info.uniroma2.it>
 * @author Andrea Turbati <turbati@info.uniroma2.it>
 *
 */
public class OWLServiceClient extends HttpServiceClient implements RepositoryServiceClient {
	//private static final String CMD_GET_SUBCLASSESOF = "service=cls&request=getSubClasses&clsName=%s&method=templateandvalued";
	private static final String CMD_GET_SUBCLASSESOF = "service=cls&request=getSubClasses&clsName=%s&tree=true";
	private static final String CMD_GET_INSTANCESOF = "service=cls&request=getClassAndInstancesInfo&clsName=%s";
	private static final String CMD_GET_CLASSDESCRIPTION = "service=cls&request=getClsDescription&clsName=%s&method=templateandvalued&bnodeFilter=true";
	//private static final String SUBCLASS_LABEL = "subclass-of";
	//private static final String INSTANCE_LABEL = "instance-of";
	//private static final String SUBCLASS_LABEL = "hasSubclass";
	//private static final String INSTANCE_LABEL = "hasInstance";
	private static final String SUBCLASS_LABEL = "subclassOf";
	private static final String INSTANCE_LABEL = "instanceOf";
	// private static final String NODE_TYPE_LITERAL = "literal";
	private static final String NODE_TYPE_CLS = "cls";
	private static final String NODE_TYPE_INDIVIDUAL = "individual";
	
	private Map<String, Vertex>completeVertexMap;

	public OWLServiceClient(Map<String, Vertex> completeVertexMap){
		this.completeVertexMap = completeVertexMap;
	}
	
	public Vertex getRootVertex() {
		OWLVertex owlVertex = new OWLVertex("owl:Thing", null, true, OWLVertex.OWL_NODE_TYPE.CLASS);
		completeVertexMap.put(owlVertex.getName(), owlVertex);
		return owlVertex;
	}

	public List<Edge> getChildrenOf(Vertex parent) {
		OWLVertex owlVertex = (OWLVertex) parent;
		if (!owlVertex.getType().equals(OWL_NODE_TYPE.CLASS) && !owlVertex.getType().equals(OWL_NODE_TYPE.INDIVIDUAL))
			return null;

		List<Edge> edgeList = new ArrayList<Edge>();
		List<Edge> tempEdgeList = null;
		tempEdgeList = getSubClassesOf(owlVertex);
		if (tempEdgeList != null)
			edgeList.addAll(tempEdgeList);
		if(owlVertex.getName().compareTo("owl:Thing")!=0){ // to ignore the instances of owl:Thing
			tempEdgeList = getIndividualsOf(owlVertex);
			if (tempEdgeList != null)
				edgeList.addAll(tempEdgeList);
		}

		tempEdgeList = getClassDescription(owlVertex);
		if (tempEdgeList != null)
			edgeList.addAll(tempEdgeList);
		return edgeList;
	}

	private List<Edge> getSubClassesOf(OWLVertex vertex) {
		String cmd;
		if(vertex.getName().compareTo("owl:Thing") == 0)
			cmd = String.format(CMD_GET_SUBCLASSESOF, encodeURIComponent("http://www.w3.org/2002/07/owl#Thing"));
		else
			cmd = String.format(CMD_GET_SUBCLASSESOF, encodeURIComponent(vertex.getName()));
		XMLResponse response = doHttpGet(SERVLET_URL, cmd);
		if (response == null)
			return null;

		List<Edge> edgeList = new ArrayList<Edge>();
		Document doc = response.getResponseObject();
		NodeList nl = doc.getElementsByTagName("uri");
		for (int i = 0; i < nl.getLength(); ++i) {
			Node n = nl.item(i);
			Node attr = n.getAttributes().getNamedItem("show");
			Vertex subClassVertex = completeVertexMap.get(attr.getNodeValue());
			if(subClassVertex == null){
				subClassVertex = new OWLVertex(attr.getNodeValue(), vertex, false, OWLVertex.OWL_NODE_TYPE.CLASS);
				completeVertexMap.put(subClassVertex.getName(), subClassVertex);
			}
			Edge edge = new Edge(SUBCLASS_LABEL, subClassVertex, vertex, false);
			edgeList.add(edge);
		}

		return edgeList;
	}

	private List<Edge> getClassDescription(OWLVertex vertex) {
		//String cmd = String.format(CMD_GET_CLASSDESCRIPTION, encodeURIComponent(vertex.getName()));
		String cmd;
		if(vertex.getName().compareTo("owl:Thing") == 0)
			cmd = String.format(CMD_GET_CLASSDESCRIPTION, encodeURIComponent("http://www.w3.org/2002/07/owl#Thing"));
		else
			cmd = String.format(CMD_GET_CLASSDESCRIPTION, encodeURIComponent(vertex.getName()));
		XMLResponse response = doHttpGet(SERVLET_URL, cmd);
		if (response == null)
			return null;

		List<Edge> edgeList = new ArrayList<Edge>();
		Document doc = response.getResponseObject();
		NodeList nodeList = doc.getElementsByTagName("Property");
		for (int i = 0; i < nodeList.getLength(); ++i) {
			Node node = nodeList.item(i);
			String propName = ((Element)node).getAttribute("name");

			// OLD PARSER for nodes called "Value", using an XPath expression
			// XPath xpath = XPathFactory.newInstance().newXPath();
			// NodeList values = (NodeList) xpath.evaluate("//Property[@name=\"" + attr.getNodeValue() +
			// "\"]/Value[@type!=\"bnode\" and @type!=\"cls_bnode\"]", n, XPathConstants.NODESET);

			NodeList values = node.getChildNodes();

			for (int j = 0; j < values.getLength(); ++j) {
				Node x = values.item(j);
				if (x instanceof Element) {
					Element xElem = ((Element) x);
					String label = xElem.getAttribute("show");					
					//label = label.length() > 30 ? label.substring(0, 29) + "..." : label;

					//TODO use enums in OWL ART API instead
					OWLVertex owlVertex;
					//String role = xElem.getAttribute("role");
					owlVertex = (OWLVertex) completeVertexMap.get(label);
					if(owlVertex == null){
						continue; // use only the vertex which are already present in the graph
						/*if (role.equals(NODE_TYPE_CLS))
							owlVertex = new OWLVertex(label, vertex, false, OWLVertex.OWL_NODE_TYPE.CLASS);
						else if (role.equals(NODE_TYPE_INDIVIDUAL))
							owlVertex = new OWLVertex(label, vertex, false, OWLVertex.OWL_NODE_TYPE.INDIVIDUAL);
						else
							owlVertex = new OWLVertex(label, vertex, false, OWLVertex.OWL_NODE_TYPE.GENERIC);
						completeVertexMap.put(owlVertex.getName(), owlVertex);*/
					}
					owlVertex.setTooltip(label);
					Edge edge = new Edge(propName, vertex, owlVertex, true);
					edgeList.add(edge);
				}
			}
		}
		return edgeList;
	}

	private List<Edge> getIndividualsOf(OWLVertex vertex) {
		//String cmd = String.format(CMD_GET_INSTANCESOF, encodeURIComponent(vertex.getName()));
		String cmd;
		if(vertex.getName().compareTo("owl:Thing") == 0)
			cmd = String.format(CMD_GET_INSTANCESOF, encodeURIComponent("http://www.w3.org/2002/07/owl#Thing"));
		else
			cmd = String.format(CMD_GET_INSTANCESOF, encodeURIComponent(vertex.getName()));
		XMLResponse response = doHttpGet(SERVLET_URL, cmd);
		if (response == null)
			return null;

		List<Edge> edgeList = new ArrayList<Edge>();
		Document doc = response.getResponseObject();
		NodeList nl = ((Element)doc.getElementsByTagName("Instances").item(0)).getElementsByTagName("uri");
		for (int i = 0; i < nl.getLength(); ++i) {
			Node n = nl.item(i);
			Node attr = n.getAttributes().getNamedItem("show");
			OWLVertex startVertex = (OWLVertex) completeVertexMap.get(attr.getNodeValue());
			if (startVertex == null){
				startVertex = new OWLVertex(attr.getNodeValue(), vertex, false, OWLVertex.OWL_NODE_TYPE.INDIVIDUAL);
				completeVertexMap.put(startVertex.getName(), startVertex);
			}
			Edge edge = new Edge(INSTANCE_LABEL, startVertex, vertex, false);
			edgeList.add(edge);
		}

		return edgeList;
	}
}
