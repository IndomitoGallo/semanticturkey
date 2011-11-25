/*
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License");  you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 *
 * The Original Code is SemanticTurkey.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2007.
 * All Rights Reserved.
 *
 * SemanticTurkey was developed by the Artificial Intelligence Research Group
 * (art.uniroma2.it) at the University of Roma Tor Vergata (ART)
 * Current information about SemanticTurkey can be obtained at 
 * http://semanticturkey.uniroma2.it
 *
 */

package it.uniroma2.art.semanticturkey.utilities;

import org.w3c.dom.*;
import org.w3c.dom.bootstrap.DOMImplementationRegistry;
import org.w3c.dom.ls.DOMImplementationLS;
import org.w3c.dom.ls.LSOutput;
import org.w3c.dom.ls.LSSerializer;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import java.io.*;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Properties;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

/**
 * @author Donato Griesi, Armando Stellato
 * 
 */
public class XMLHelp {

	static DOMImplementationRegistry registry;
	static DOMImplementation _DOMImpl;
	static Transformer _IdentityTransformer;
	static DocumentBuilder builder;

	public static void initialize() throws ClassCastException, ClassNotFoundException,
			InstantiationException, IllegalAccessException, ParserConfigurationException,
			TransformerConfigurationException {
		registry = DOMImplementationRegistry.newInstance();
		DocumentBuilderFactory domBuilderFactory = DocumentBuilderFactory.newInstance();
		builder = domBuilderFactory.newDocumentBuilder();
		_DOMImpl = builder.getDOMImplementation();

		TransformerFactory transformerFactory = TransformerFactory.newInstance();
		_IdentityTransformer = transformerFactory.newTransformer();
	}

	/**
	 * as for {@link #XML2String(Document, false)}
	 * 
	 * @param xml
	 * @return
	 */
	public static String XML2String(Document xml) {
		return XML2String(xml.getDocumentElement(), false);
	}

	/**
	 * as for {@link #XML2String(Element, false)}
	 * 
	 * @param xml
	 * @return
	 */
	public static String XML2String(Element xml) {
		return XML2String(xml, false);
	}

	/**
	 * given an xml {@link Document} this method returns its {@link String} representation
	 * 
	 * @param xml
	 *            the {@link Document} which is serialized to a {@link String}
	 * @param indent
	 *            specifies whether to indent or not the xml code in the produced String
	 */
	public static String XML2String(Document xml, boolean indent) {
		return XML2String(xml.getDocumentElement(), indent);
	}

	/**
	 * given an xml {@link Document} this method writes it to {@link String} representation
	 * 
	 * @param xml
	 *            the {@link Document} which is serialized to a {@link String}
	 * @param indent
	 *            specifies whether to indent or not the xml code in the output stream
	 */
	public static void XML2OutputStream(Document xml, boolean indent, OutputStream out) {
		XML2OutputStream(xml.getDocumentElement(), indent, out);
	}

	/**
	 * given an xml {@link Element} this method returns its {@link String} representation
	 * 
	 * @param xml
	 *            the {@link Element} which is serialized to a {@link String}
	 * @param indent
	 *            specifies whether to indent or not the xml code in the produced String
	 * @return
	 */
	/*
	 * public static String XML2String2(Element xml, boolean indent) { if (xml == null) { return null; } else
	 * { ByteArrayOutputStream stringOut = new ByteArrayOutputStream(); try { OutputFormat format = new
	 * OutputFormat(xml.getOwnerDocument()); // Serialize // DOM format.setOmitXMLDeclaration(true);
	 * format.setIndenting(indent); format.setEncoding("UTF-8"); XMLSerializer serial = new
	 * XMLSerializer(stringOut, format); serial.asDOMSerializer(); // As a DOM Serializer
	 * serial.serialize(xml); } catch (IOException e) { } return stringOut.toString(); } }
	 */

	/**
	 * given an xml {@link Element} this method returns its {@link String} representation
	 * 
	 * @param xml
	 *            the {@link Element} which is serialized to a {@link String}
	 * @param indent
	 *            specifies whether to indent or not the xml code in the produced String
	 * @return
	 */
	public static String XML2String(Element xml, boolean indent) {
		if (xml == null) {
			return null;
		} else {
			ByteArrayOutputStream stringOut = new ByteArrayOutputStream();

			if (indent) {

				Properties outputProps = new Properties();
				outputProps.setProperty("encoding", "UTF-8");
				outputProps.setProperty("indent", "yes");
				outputProps.setProperty("{http://xml.apache.org/xslt}indent-amount", "2");
				_IdentityTransformer.setOutputProperties(outputProps);

				DOMSource domSource = new DOMSource(xml);
				StreamResult streamResult = new StreamResult(stringOut);
				try {
					_IdentityTransformer.transform(domSource, streamResult);
				} catch (TransformerException e) {
					// don't want to have this method throw an exception, so, considering that exception
					// should never happen...
					// ...at least I hope...
					e.printStackTrace();
				}
				return stringOut.toString();
			} else {
				DOMImplementationLS impl = (DOMImplementationLS) registry.getDOMImplementation("LS");
				LSSerializer writer = impl.createLSSerializer();
				LSOutput output = impl.createLSOutput();
				output.setByteStream(stringOut);
				writer.write(xml, output);

			}

			return stringOut.toString();

		}

	}

	/**
	 * given an xml {@link Element} this method returns its {@link String} representation
	 * 
	 * @param xml
	 *            the {@link Element} which is serialized to a {@link String}
	 * @param indent
	 *            specifies whether to indent or not the xml code in the produced String
	 * @return
	 */
	public static void XML2OutputStream(Element xml, boolean indent, OutputStream os) {
		Properties outputProps = new Properties();
		outputProps.setProperty("encoding", "UTF-8");
		outputProps.setProperty("indent", indent ? "yes" : "no");
		outputProps.setProperty("{http://xml.apache.org/xslt}indent-amount", "2");
		_IdentityTransformer.setOutputProperties(outputProps);

		DOMSource domSource = new DOMSource(xml);
		StreamResult streamResult = new StreamResult(os);
		try {
			_IdentityTransformer.transform(domSource, streamResult);
		} catch (TransformerException e) {
			// don't want to have this method throw an exception, so, considering that exception
			// should never happen...
			// ...at least I hope...
			e.printStackTrace();
		}
	}

	/**
	 * this method adds a new textual {@link Element} to an existing {@link Element}
	 * 
	 * @param parent
	 *            the parent {@link Element} to which the new one is added
	 * @param nm
	 *            the name of the new Element
	 * @param val
	 *            the text value of the Element
	 * @return the created {@link Element}
	 */
	public static Element newElement(Element parent, String nm, String val) {
		Element oNode = null;
		if (val != null && val.trim().length() > 0 && parent != null) {
			oNode = parent.getOwnerDocument().createElement(nm);
			oNode.appendChild(parent.getOwnerDocument().createTextNode(val));
			parent.appendChild(oNode);
		}
		return oNode;
	}

	/**
	 * this method adds a new {@link Element} to an existing {@link Element}
	 * 
	 * @param parent
	 *            the parent {@link Element} to which the new one is added
	 * @param nm
	 *            the name of the new Element
	 * @return the created {@link Element}
	 */
	public static Element newElement(Element parent, String nm) {
		Element oNode = null;
		if (parent != null) {
			oNode = parent.getOwnerDocument().createElement(nm);
			parent.appendChild(oNode);
		}
		return oNode;
	}

	public static Document createNewDoc() {
		return _DOMImpl.createDocument(null, null, null);
	}

	public static Document inputStream2XML(InputStream streamedXml) throws SAXException, IOException {
		return builder.parse(streamedXml);
	}

	public static Document byteArrayOutputStream2XML(ByteArrayOutputStream streamedXml) throws SAXException,
			IOException {
		ByteArrayInputStream bais = new ByteArrayInputStream(streamedXml.toByteArray());
		Document doc = (Document) builder.parse(bais);
		return doc;
	}

	public static Document string2XML(String stringedXml) throws SAXException, IOException {
		InputSource inStream = new InputSource();
		inStream.setCharacterStream(new StringReader(stringedXml));
		return builder.parse(inStream);
	}

	/**
	 * simplifies XML querying/casting/etc.. by returning a collection of all Elements which are child of
	 * <code>parent</code> and have their name equal to <code>tagName</code>
	 * 
	 * @param parent
	 * @return
	 */
	public static Collection<Element> getChildElements(Element parent, String tagName) {
		ArrayList<Element> children = new ArrayList<Element>();
		NodeList nl = parent.getElementsByTagName(tagName);
		int length = nl.getLength();
		for (int i = 0; i < length; i++) {
			children.add((Element) nl.item(i));
		}
		return children;
	}

	/**
	 * as for {@link #getChildElements(Element, String)} but returns all children no matter their tag name
	 * 
	 * @param parent
	 * @return
	 */
	public static Collection<Element> getChildElements(Element parent) {
		return getChildElements(parent, "*");
	}

	/**
	 * returns <code>true</code> if node <code>parent</code> has a child Element with tagname equal to
	 * <code>tagName</code> and with value of attribute <code>attrName</code> equal to <code>attrValue</code>
	 * 
	 * @param parent
	 * @param tagName
	 * @param attrName
	 * @param attrValue
	 * @return
	 */
	public static boolean hasChildWithAttributeValue(Element parent, String tagName, String attrName,
			String attrValue) {
		NodeList nl = parent.getElementsByTagName(tagName);
		int length = nl.getLength();
		for (int i = 0; i < length; i++) {
			String value = ((Element) nl.item(i)).getAttribute(attrName);
			if (value != null && value.equals(attrValue))
				return true;
		}
		return false;
	}

	/**
	 * as for {@link #hasChildWithAttributeValue(Element, String, String, String)} but examining all children
	 * of Element <code>parent</code> no matter their tag name
	 * 
	 * 
	 * @param parent
	 * @param attrName
	 * @param attrValue
	 * @return
	 */
	public static boolean hasChildWithAttributeValue(Element parent, String attrName, String attrValue) {
		return hasChildWithAttributeValue(parent, "*", attrName, attrValue);
	}

}