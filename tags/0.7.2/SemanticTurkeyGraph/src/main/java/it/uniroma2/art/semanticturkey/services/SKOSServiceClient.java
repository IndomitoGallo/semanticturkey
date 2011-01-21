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
	private static final String CMD_GET_SUBCLASSESOF = "service=cls&request=getSubClasses&clsName=%s&method=templateandvalued";
	private static final String SUBCLASS_LABEL = "subclass-of";

	public Vertex getRootVertex() 
	{
		return new OWLVertex("owl:Thing", OWLVertex.OWL_NODE_TYPE.CLASS);
	}

	public Vector<Pair<Vertex, Edge>> getChildrenOf(Vertex v) 
	{
		return getSubClassesOf(v.getName());
	}

	private Vector<Pair<Vertex, Edge>> getSubClassesOf(String parentNodeName)
	{
		String cmd = String.format(CMD_GET_SUBCLASSESOF, parentNodeName);
		XMLResponse response = doHttpGet(SERVLET_URL, cmd);
		if (response == null)
			return null;
		
		//System.out.print(response); 
		Vector<Pair<Vertex, Edge>> v = new Vector<Pair<Vertex, Edge>>();
		Document doc = response.getResponseObject();
		NodeList nl = doc.getElementsByTagName("class");
		for (int i = 0; i < nl.getLength(); ++i)
		{
			Node n = nl.item(i);
			Node attr = n.getAttributes().getNamedItem("name");
			v.add(new Pair<Vertex, Edge>(new OWLVertex(attr.getNodeValue(), OWLVertex.OWL_NODE_TYPE.CLASS), new Edge(SUBCLASS_LABEL)));
		}
		
		return v;
	}
}
