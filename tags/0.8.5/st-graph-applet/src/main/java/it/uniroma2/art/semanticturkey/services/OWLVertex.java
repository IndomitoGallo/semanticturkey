package it.uniroma2.art.semanticturkey.services;

import it.uniroma2.art.semanticturkey.graph.Vertex;

public class OWLVertex extends Vertex 
{
	public static enum OWL_NODE_TYPE 
	{
		CLASS,
		INDIVIDUAL, 
		GENERIC
	}

	public static final String OWL_ICON_CLASS = "OWL_CLASS";
	public static final String OWL_ICON_INDIVIDUAL = "OWL_INDIVIDUAL";
	public static final String OWL_ICON_GENERIC = "OWL_GENERIC";
	
	private OWL_NODE_TYPE type;
	
	public OWLVertex(String name) 
	{
		super(name);
	}

	public OWLVertex(String name, OWL_NODE_TYPE type) 
	{
		super(name);
		this.type = type;

		if (type.equals(OWL_NODE_TYPE.CLASS))
			setIconName(OWL_ICON_CLASS);
		else if (type.equals(OWL_NODE_TYPE.INDIVIDUAL))
			setIconName(OWL_ICON_INDIVIDUAL);
		else if (type.equals(OWL_NODE_TYPE.GENERIC))
			setIconName(OWL_ICON_GENERIC);

		/*
		if (type.equals(OWL_NODE_TYPE.CLASS))
			setIconName("/images/turkeyCircle.gif");
		else if (type.equals(OWL_NODE_TYPE.INDIVIDUAL))
			setIconName("/images/individual20x20.png");
		else if (type.equals(OWL_NODE_TYPE.PROPERTY))
			setIconName("/images/prop20x20.png");
		*/
	}

	public OWL_NODE_TYPE getType() 
	{
		return type;
	}
}
