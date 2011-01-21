package it.uniroma2.art.semanticturkey.services;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import it.uniroma2.art.semanticturkey.servlet.XMLResponse;

public class ProjectServiceClient extends HttpServiceClient 
{
	public static final String OWL_MODEL_TYPE = "it.uniroma2.art.owlart.models.OWLModel";
	public static final String SKOS_MODEL_TYPE = "it.uniroma2.art.owlart.models.SKOSModel";
	
	//private static final String CMD_GET_CURRENT = "service=projects&request=getCurrentProject";
	private static final String CMD_GET_PROPERTY = "service=projects&request=getProjectProperty&propNames=%s";
	
	public String getModelType()
	{
		String cmd = String.format(CMD_GET_PROPERTY, "ModelType");
		XMLResponse response = doHttpGet(SERVLET_URL, cmd);
		Document doc = response.getResponseObject();
		NodeList nl = doc.getElementsByTagName("property");
		Node n = nl.item(0);
		Node attr = n.getAttributes().getNamedItem("value");

		//System.out.print(response);
		return attr.getNodeValue();
	}
}
