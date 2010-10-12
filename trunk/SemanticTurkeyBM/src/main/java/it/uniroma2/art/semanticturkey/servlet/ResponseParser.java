package it.uniroma2.art.semanticturkey.servlet;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;

public class ResponseParser {

	public static Response getResponseFromXML(Document doc) {
		ServletUtilities su = ServletUtilities.getService();
		Element stResponse = (Element) doc.getElementsByTagName(ServiceVocabulary.responseRoot).item(0);
		String request = stResponse.getAttributes().getNamedItem(ServiceVocabulary.request).getNodeValue();
		String type = stResponse.getAttributes().getNamedItem(ServiceVocabulary.responseType).getNodeValue();

		if (type.equals(ServiceVocabulary.type_reply)) {
			String status = getStatus(stResponse);
			String msg = getMessageFromReply(stResponse);
			ResponseREPLY actionResp = su.createReplyResponse(request, ServiceVocabulary.RepliesStatus
					.valueOf(status), msg);
			Element importedData = (Element)((XMLResponseREPLY)actionResp).getResponseObject().importNode(getDataElement(stResponse), true);
			((XMLResponseREPLY)actionResp).getResponseElement().replaceChild(importedData,((XMLResponseREPLY)actionResp).getDataElement());
			return actionResp;

		} else {
			String msg = getMessageFromErrorException(stResponse);
			if (type.equals(ServiceVocabulary.type_exception)) {
				return su.createExceptionResponse(request, msg);
			} else { // error
				return su.createErrorResponse(request, msg);
			}
		}
	}

	private static String getStatus(Element stResponse) {
		return stResponse.getElementsByTagName(ServiceVocabulary.reply).item(0).getAttributes().getNamedItem(
				ServiceVocabulary.status).getNodeValue();
	}

	private static Element getDataElement(Element stResponse) {
		return (Element) stResponse.getElementsByTagName(ServiceVocabulary.data).item(0);
	}

	private static String getMessageFromReply(Element stResponse) {
		return stResponse.getElementsByTagName(ServiceVocabulary.reply).item(0).getTextContent();
	}

	private static String getMessageFromErrorException(Element stResponse) {
		return stResponse.getElementsByTagName(ServiceVocabulary.msg).item(0).getTextContent();
	}
}
