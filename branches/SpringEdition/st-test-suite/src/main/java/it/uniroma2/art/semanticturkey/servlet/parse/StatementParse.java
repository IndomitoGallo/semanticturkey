package it.uniroma2.art.semanticturkey.servlet.parse;

import it.uniroma2.art.owlart.model.ARTNode;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTStatement;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.semanticturkey.model.test.ARTBNodeTestImpl;
import it.uniroma2.art.semanticturkey.model.test.ARTLiteralTestImpl;
import it.uniroma2.art.semanticturkey.model.test.ARTStatementTestImpl;
import it.uniroma2.art.semanticturkey.model.test.ARTURIResourceTestImpl;
import it.uniroma2.art.semanticturkey.servlet.ResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.main.Statement;

import java.util.ArrayList;
import java.util.Collection;

import org.w3c.dom.Element;
import org.w3c.dom.NodeList;


/**
 * @author Armando Stellato <a href="mailto:stellato@info.uniroma2.it">stellato@info.uniroma2.it</a>
 *
 */
public class StatementParse {

	public static Collection<ARTStatement> parseStatements(ResponseREPLY resp) {
		ArrayList<ARTStatement> result = new ArrayList<ARTStatement>(); 
		
		Element dataElem = ((XMLResponseREPLY)resp).getDataElement();
		NodeList statTags = dataElem.getElementsByTagName(Statement.statementTag);
		for (int i = 0; i < statTags.getLength(); i++) {
			Element statElem = (Element) statTags.item(i);
			Element subjElem = (Element) statElem.getElementsByTagName(Statement.subjTag).item(0);
			Element predElem = (Element) statElem.getElementsByTagName(Statement.predTag).item(0);
			Element objElem = (Element) statElem.getElementsByTagName(Statement.objTag).item(0);

			ARTResource subj;
			ARTURIResource pred;
			ARTNode obj;

			String type = subjElem.getAttribute(Statement.typeAttr);
			String content = subjElem.getTextContent();

			// subj can be an URI or a BNode
			if (type.equals(Statement.uriXMLValue))
				subj = new ARTURIResourceTestImpl(content);
			else
				subj = new ARTBNodeTestImpl(content);

			// pred is surely an URI
			pred = new ARTURIResourceTestImpl(predElem.getTextContent());

			type = objElem.getAttribute(Statement.typeAttr);
			content = objElem.getTextContent();
			// obj can be anything
			if (type.equals(Statement.uriXMLValue))
				obj = new ARTURIResourceTestImpl(content);
			else if (type.equals(Statement.literalXMLValue))
				obj = new ARTLiteralTestImpl(content);
			else
				obj = new ARTBNodeTestImpl(content);
			
			result.add(new ARTStatementTestImpl(subj, pred, obj));
		}
		return result;
	}

}
