package it.uniroma2.art.semanticturkey.services;

import it.uniroma2.art.semanticturkey.graph.Edge;
import it.uniroma2.art.semanticturkey.graph.Pair;
import it.uniroma2.art.semanticturkey.graph.Vertex;
import it.uniroma2.art.semanticturkey.services.OWLVertex.OWL_NODE_TYPE;
import it.uniroma2.art.semanticturkey.servlet.XMLResponse;

import java.util.Vector;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * @author Carlo Ieva
 * @author Armando Stellato <stellato@info.uniroma2.it>
 *
 */
public class OWLServiceClient extends HttpServiceClient implements RepositoryServiceClient {
	private static final String CMD_GET_SUBCLASSESOF = "service=cls&request=getSubClasses&clsName=%s&method=templateandvalued";
	private static final String CMD_GET_INSTANCESOF = "service=cls&request=getClassAndInstancesInfo&clsName=%s";
	private static final String CMD_GET_CLASSDESCRIPTION = "service=cls&request=getClsDescription&clsName=%s&method=templateandvalued&bnodeFilter=true";
	private static final String SUBCLASS_LABEL = "subclass-of";
	private static final String INSTANCE_LABEL = "instance-of";
	// private static final String NODE_TYPE_LITERAL = "literal";
	private static final String NODE_TYPE_CLS = "cls";
	private static final String NODE_TYPE_INDIVIDUAL = "individual";

	public Vertex getRootVertex() {
		return new OWLVertex("owl:Thing", OWLVertex.OWL_NODE_TYPE.CLASS);
	}

	public Vector<Pair<Vertex, Edge>> getChildrenOf(Vertex parent) {
		OWLVertex ov = (OWLVertex) parent;
		if (!ov.getType().equals(OWL_NODE_TYPE.CLASS) && !ov.getType().equals(OWL_NODE_TYPE.INDIVIDUAL))
			return null;

		String parentNodeName = parent.getName();
		Vector<Pair<Vertex, Edge>> v = new Vector<Pair<Vertex, Edge>>();
		Vector<Pair<Vertex, Edge>> t = null;
		t = getSubClassesOf(parentNodeName);
		if (t != null)
			v.addAll(t);
		t = getIndividualsOf(parentNodeName);
		if (t != null)
			v.addAll(t);

		t = getClassDescription(parentNodeName);
		if (t != null)
			v.addAll(t);
		return v;
	}

	private Vector<Pair<Vertex, Edge>> getSubClassesOf(String parentNodeName) {
		String cmd = String.format(CMD_GET_SUBCLASSESOF, encodeURIComponent(parentNodeName));
		XMLResponse response = doHttpGet(SERVLET_URL, cmd);
		if (response == null)
			return null;

		Vector<Pair<Vertex, Edge>> v = new Vector<Pair<Vertex, Edge>>();
		Document doc = response.getResponseObject();
		NodeList nl = doc.getElementsByTagName("uri");
		for (int i = 0; i < nl.getLength(); ++i) {
			Node n = nl.item(i);
			Node attr = n.getAttributes().getNamedItem("show");
			v.add(new Pair<Vertex, Edge>(new OWLVertex(attr.getNodeValue(), OWLVertex.OWL_NODE_TYPE.CLASS),
					new Edge(SUBCLASS_LABEL)));
		}

		return v;
	}

	private Vector<Pair<Vertex, Edge>> getClassDescription(String parentNodeName) {
		String cmd = String.format(CMD_GET_CLASSDESCRIPTION, encodeURIComponent(parentNodeName));
		XMLResponse response = doHttpGet(SERVLET_URL, cmd);
		if (response == null)
			return null;

		Vector<Pair<Vertex, Edge>> v = new Vector<Pair<Vertex, Edge>>();
		Document doc = response.getResponseObject();
		NodeList nl = doc.getElementsByTagName("Property");
		for (int i = 0; i < nl.getLength(); ++i) {
			Node n = nl.item(i);
			String propName = ((Element)n).getAttribute("name");

			// OLD PARSER for nodes called "Value", using an XPath expression
			// XPath xpath = XPathFactory.newInstance().newXPath();
			// NodeList values = (NodeList) xpath.evaluate("//Property[@name=\"" + attr.getNodeValue() +
			// "\"]/Value[@type!=\"bnode\" and @type!=\"cls_bnode\"]", n, XPathConstants.NODESET);

			NodeList values = n.getChildNodes();

			for (int j = 0; j < values.getLength(); ++j) {
				Node x = values.item(j);
				if (x instanceof Element) {
					Element xElem = ((Element) x);
					String label = xElem.getAttribute("show");					
					label = label.length() > 30 ? label.substring(0, 29) + "..." : label;

					//TODO use enums in OWL ART API instead
					OWLVertex ov;
					String role = xElem.getAttribute("role");
					if (role.equals(NODE_TYPE_CLS))
						ov = new OWLVertex(label, OWLVertex.OWL_NODE_TYPE.CLASS);
					else if (role.equals(NODE_TYPE_INDIVIDUAL))
						ov = new OWLVertex(label, OWLVertex.OWL_NODE_TYPE.INDIVIDUAL);
					else
						ov = new OWLVertex(label, OWLVertex.OWL_NODE_TYPE.GENERIC);

					ov.setTooltip(label);
					v.add(new Pair<Vertex, Edge>(ov, new Edge(propName)));
				}
			}
		}
		return v;
	}

	private Vector<Pair<Vertex, Edge>> getIndividualsOf(String parentNodeName) {
		String cmd = String.format(CMD_GET_INSTANCESOF, encodeURIComponent(parentNodeName));
		XMLResponse response = doHttpGet(SERVLET_URL, cmd);
		if (response == null)
			return null;

		Vector<Pair<Vertex, Edge>> v = new Vector<Pair<Vertex, Edge>>();
		Document doc = response.getResponseObject();
		NodeList nl = doc.getElementsByTagName("Instance");
		for (int i = 0; i < nl.getLength(); ++i) {
			Node n = nl.item(i);
			Node attr = n.getAttributes().getNamedItem("name");
			v.add(new Pair<Vertex, Edge>(new OWLVertex(attr.getNodeValue(),
					OWLVertex.OWL_NODE_TYPE.INDIVIDUAL), new Edge(INSTANCE_LABEL)));
		}

		return v;
	}
}
