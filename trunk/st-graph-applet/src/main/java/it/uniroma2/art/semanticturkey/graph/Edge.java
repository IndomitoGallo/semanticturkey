package it.uniroma2.art.semanticturkey.graph;

//import org.apache.commons.collections15.Transformer;

//import edu.uci.ics.jung.visualization.decorators.ToStringLabeller;

public class Edge 
{
	private String label;

	public Edge(String label)
	{
		this.label = label;
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

	public void setLabel(String label) {
		this.label = label;
	}
	
	public String toString()
	{
		return label;
	}
}
