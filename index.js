var clas = require('clas');

var CoreObj = require('ripeto-coreobj');
var Store = require('ripeto-store');

var View = CoreObj.extend({
  constructor: function(el, opts) {
    this.el = el.nodeType ? el : document.querySelector(el);
    this.options = opts || {};

    if (this.ui) this.setupUI(this.ui);
    if (this.events) this.setupEvents(this.events);
    if (this.store) this.setupStore(this.store);

    CoreObj.apply(this, arguments);
  }
});

View.prototype.setupUI = function(ui) {
  var cache = {};
  this._ui = ui;
  for (var name in ui) {
    var els = this.el.querySelectorAll(ui[name]);
    cache[name] = els.length > 1 ? els : els[0];

    if (cache[name] === undefined && clas.has(this.el, ui[name].replace(/\./g, ''))) {
      cache[name] = this.el;
    }
  }

  this.ui = cache;
};

function parseProperty(self, prop) {
  var keys = prop.split('.');
  return self[keys[0]][keys[1]];
}

function parseEvent(self, evStr) {
  var split = evStr.split('@').map(function(s) { return s.replace(/^\s+|\s+$/g, ''); });
  return {
    ev: split[0],
    dom: parseProperty(self, split[1])
  };
}

View.prototype.setupEvents = function(events) {
  for (var ev in events) {
    var evObj = parseEvent(this, ev),
      evCallback = this[events[ev]].bind(this);

    evObj.dom.addEventListener(evObj.ev, evCallback, false);
  }
};

View.prototype.cleanupEvents = function(events) {
  for (var ev in events) {
    var evObj = parseEvent(ev),
      evCallback = this[events[ev]].bind(this);

    evObj.dom.removeEventListener(evObj.ev, evCallback, false);
  }
};

View.prototype.setupStore = function(store) {
  if (store === undefined) {
    this.store = new Store(this.storeDefaults);
  } else if (!(store instanceof Store)) {
    this.store = new store(this.storeDefaults);
  }
};

View.prototype.cleanupStore = function() {
  this.store.destroy();
};

View.prototype.cleanup = function() {};

View.prototype.destroy = function() {
  this.cleanup();

  if (this.events) this.cleanupEvents(this.events);
  if (this.store) this.cleanupStore(this.store);
  // if (this.bindings) this.cleanupBindings(this.bindings);
};


module.exports = View;