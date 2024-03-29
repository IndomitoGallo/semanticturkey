/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Observers.
 *
 * The Initial Developer of the Original Code is Daniel Aquino.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Daniel Aquino <mr.danielaquino@gmail.com>
 *   Myk Melez <myk@mozilla.org>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

let EXPORTED_SYMBOLS = ["Observers"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

/**
 * A service for adding, removing and notifying observers of notifications.
 * Wraps the nsIObserverService interface.
 *
 * @version 0.2
 */
let Observers = {
  /**
   * Register the given callback as an observer of the given topic.
   *
   * @param   topic       {String}
   *          the topic to observe
   *
   * @param   callback    {Object}
   *          the callback; an Object that implements nsIObserver or a Function
   *          that gets called when the notification occurs
   *
   * @param   thisObject  {Object}  [optional]
   *          the object to use as |this| when calling a Function callback
   *
   * @returns the observer
   */
  add: function(topic, callback, thisObject) {
    let observer = new Observer(topic, callback, thisObject);
    this._service.addObserver(observer, topic, true);
    cache.push(observer);

    return observer;
  },

  /**
   * Unregister the given callback as an observer of the given topic.
   *
   * @param   topic       {String}
   *          the topic being observed
   *
   * @param   callback    {Object}
   *          the callback doing the observing
   *
   * @param   thisObject  {Object}  [optional]
   *          the object being used as |this| when calling a Function callback
   */
  remove: function(topic, callback, thisObject) {
    // This seems fairly inefficient, but I'm not sure how much better
    // we can make it.  We could index by topic, but we can't index by callback
    // or thisObject, as far as I know, since the keys to JavaScript hashes
    // (a.k.a. objects) can apparently only be primitive values.
    let [observer] = cache.filter(function(v) v.topic      == topic    &&
                                              v.callback   == callback &&
                                              v.thisObject == thisObject);
    if (observer) {
      this._service.removeObserver(observer, topic);
      cache.splice(cache.indexOf(observer), 1);
    }
  },

  /**
   * Notify observers about something.
   *
   * @param topic   {String}
   *        the topic to notify observers about
   *
   * @param subject {Object}  [optional]
   *        some information about the topic; can be any JS object or primitive
   *
   * @param data    {String}  [optional] [deprecated]
   *        some more information about the topic; deprecated as the subject
   *        is sufficient to pass all needed information to the JS observers
   *        that this module targets; if you have multiple values to pass to
   *        the observer, wrap them in an object and pass them via the subject
   *        parameter (i.e.: { foo: 1, bar: "some string", baz: myObject })
   */
  notify: function(topic, subject, data) {
    subject = (typeof subject == "undefined") ? null : new Subject(subject);
       data = (typeof    data == "undefined") ? null : data;
    this._service.notifyObservers(subject, topic, data);
  },

  _service: Cc["@mozilla.org/observer-service;1"].
            getService(Ci.nsIObserverService)
};

/**
 * A cache of observers that have been added.
 *
 * We use this to remove observers when a caller calls |Observers.remove|.
 */
let cache = [];

function Observer(topic, callback, thisObject) {
  this.topic = topic;
  this.callback = callback;
  this.thisObject = thisObject;
}

Observer.prototype = {
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver, Ci.nsISupportsWeakReference]),
  observe: function(subject, topic, data) {
    // Extract the wrapped object for subjects that are one of our wrappers
    // around a JS object.  This way we support both wrapped subjects created
    // using this module and those that are real XPCOM components.
    if (subject && typeof subject == "object" &&
        ("wrappedJSObject" in subject) &&
        ("observersModuleSubjectWrapper" in subject.wrappedJSObject))
      subject = subject.wrappedJSObject.object;

    if (typeof this.callback == "function") {
      if (this.thisObject)
        this.callback.call(this.thisObject, subject, data);
      else
        this.callback(subject, data);
    }
    else // typeof this.callback == "object" (nsIObserver)
      this.callback.observe(subject, topic, data);
  }
}


function Subject(object) {
  // Double-wrap the object and set a property identifying the wrappedJSObject
  // as one of our wrappers to distinguish between subjects that are one of our
  // wrappers (which we should unwrap when notifying our observers) and those
  // that are real JS XPCOM components (which we should pass through unaltered).
  this.wrappedJSObject = { observersModuleSubjectWrapper: true, object: object };
}

Subject.prototype = {
  QueryInterface: XPCOMUtils.generateQI([]),
  getHelperForLanguage: function() {},
  getInterfaces: function() {}
};