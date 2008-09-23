 /*
  * The contents of this file are subject to the Mozilla Public License
  * Version 1.1 (the "License");  you may not use this file except in compliance
  * with the License.  You may obtain a copy of the License at
  * http//www.mozilla.org/MPL/
  *
  * Software distributed under the License is distributed on an "AS IS" basis,
  * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
  * the specific language governing rights and limitations under the License.
  *
  * The Original Code is Semantic Turkey.
  *
  * The Initial Developer of the Original Code is University of Roma Tor Vergata.
  * Portions created by University of Roma Tor Vergata are Copyright (C) 2008.
  * All Rights Reserved.
  *
  * Semantic Turkey was developed by the Artificial Intelligence Research Group
  * (ai-nlp.info.uniroma2.it) at the University of Roma Tor Vergata
  * Current information about Semantic Turkey can be obtained at 
  * http//ai-nlp.info.uniroma2.it/software/...
  *
  */

  /*
   * Contributor(s): Armando Stellato stellato@info.uniroma2.it,
   * 				Andrea Turbati
  */
package it.uniroma2.art.semanticturkey.plugin.extpts;


import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.w3c.dom.Document;

/**
 * @author Andrea Turbati
 *
 */
public abstract class InterfaceServiceServlet {
	protected String id;
	protected HttpServletRequest _oReq = null;
	protected List<ServletListener> listeners = new ArrayList<ServletListener>();
	
	/**
	 * Funzione per avere l'id del servizio della servlet
	 * @return id del servizio della servlet
	 */
	public String getId(){
		return id;
	}
	/**
	 * Funzione per settare la HttpServletRequest
	 * @param oReq HttpServletRequest
	 */
	public void setHttpServletRequest(HttpServletRequest oReq){
		_oReq = oReq;
	}
	
	/**
	 * Funzione per aggiungere un listener
	 * @param l listener da aggiungere al servizio
	 */
	public synchronized void addListener( ServletListener l){
		listeners.add(l);
	}
	
	/**
	 * Funzione per rimuovere un listener
	 * @param l listener da rimuovere
	 */
	public synchronized void removeListener( ServletListener l){
		listeners.remove(l);
	}
	
	/**
	 * Funzione per chiamare avvertire tutti i listener che si erano registrati
	 */
	protected synchronized void fireServletEvent(){
		STEvent event = new STEvent(this, _oReq);
		Iterator<ServletListener> iterator = listeners.iterator();
		while(iterator.hasNext()){
			iterator.next().EventRecived(event);
		}
	}
	
	
	public abstract Document XMLData();
	public abstract CXSL CXSLFactory();
}
