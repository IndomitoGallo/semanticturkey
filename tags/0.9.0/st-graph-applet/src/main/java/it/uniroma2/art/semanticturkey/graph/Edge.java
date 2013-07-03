package it.uniroma2.art.semanticturkey.graph;

//import org.apache.commons.collections15.Transformer;

//import edu.uci.ics.jung.visualization.decorators.ToStringLabeller;

public class Edge 
{
	private String label;
	private Vertex startVertex;
	private Vertex endVertex;
	private boolean generatedByStartVertex; // if true then the edge was generated by clicking on the endVertex
	
	/*public Edge(String label, Vertex startVertex, Vertex endVertex) {
		this.label = label;
		this.startVertex = startVertex;
		this.endVertex = endVertex;
		this.reverse = false;
	}*/
	
	public Edge(String label, Vertex startVertex, Vertex endVertex, boolean generatedByStartVertex) {
		this.label = label;
		this.startVertex = startVertex;
		this.endVertex = endVertex;
		this.generatedByStartVertex = generatedByStartVertex;
	}
	
	
	/*
	public static Transformer<Edge, String> getEdgeLabelTranformer()
	{
		return new ToStringLabeller<Edge>(); 
	}
	*/
	
	public String getLabel() {
		return label;
	}

	//public void setLabel(String label) {
	//	this.label = label;
	//}
	
	public String toString() {
		return label;
	}
	
	public Vertex getStartVertex() {
		return startVertex;
	}

	public Vertex getEndVertex() {
		return endVertex;
	}

	public boolean isGeneratedByStartVertex() {
		return generatedByStartVertex;
	}
}