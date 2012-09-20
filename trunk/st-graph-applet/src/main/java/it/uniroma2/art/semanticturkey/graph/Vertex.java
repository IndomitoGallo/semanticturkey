package it.uniroma2.art.semanticturkey.graph;

import java.util.ArrayList;
import java.util.List;

public class Vertex 
{
	private String name;
	private boolean expanded;
	private String iconName = null;
	private String tooltip = null;
	List <Edge> outgoingEdge;
	List <Edge> incomingEdge;
	private Vertex vertexParent = null;
	private boolean rootVertex = false;
	
	/**
	 * Creates a Vertex object named 'name'
	 * 
	 * @param name
	 * @return Newly created Vertex object
	 */
	public Vertex(String name, Vertex vertexParent, boolean isRootVertex)	{
		this.name = name;
		this.vertexParent = vertexParent;
		this.rootVertex = isRootVertex;
		outgoingEdge = new ArrayList<Edge>();
		incomingEdge = new ArrayList<Edge>();
	}
	
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public boolean isExpanded() {
		return expanded;
	}
	public void setExpanded(boolean expanded) {
		this.expanded = expanded;
	}

	public String toString() {
		return name;
	}

	public boolean equals(Object o) {
		//TODO add the incoming/outgoing compare
		Vertex v = (Vertex) o;
		if (v.getName().equals(name))
			return true;
		
		return false;
	}

	public String getTooltip() {
		return tooltip;
	}

	public void setTooltip(String tooltip) {
		this.tooltip = tooltip;
	}

	public String getIconName() {
		return iconName;
	}

	public void setIconName(String iconName) {
		this.iconName = iconName;
	}
	
	public void addEdge(Edge edge, boolean isOutgoing){
		if(isOutgoing)
			outgoingEdge.add(edge);
		else
			incomingEdge.add(edge);
	}
	
	public List<Edge> getOutgoingEdgeList() {
		return outgoingEdge;
	}
	
	public List<Edge> getIncomingEdgeList() {
		return incomingEdge;
	}

	public Vertex getVertexParent() {
		return vertexParent;
	}

	public boolean isRootVertex() {
		return rootVertex;
	}
}
