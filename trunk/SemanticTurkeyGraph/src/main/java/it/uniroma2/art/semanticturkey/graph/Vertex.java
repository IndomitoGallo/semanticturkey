package it.uniroma2.art.semanticturkey.graph;

public class Vertex 
{
	private String name;
	private boolean expanded;
	private String iconName = null;
	private String tooltip = null;
	
	/**
	 * Creates a Vertex object named 'name'
	 * 
	 * @param name
	 * @return Newly created Vertex object
	 */
	public Vertex(String name)
	{
		this.name = name;
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

	public String toString()
	{
		return name;
	}

	public boolean equals(Object o)
	{
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
}
