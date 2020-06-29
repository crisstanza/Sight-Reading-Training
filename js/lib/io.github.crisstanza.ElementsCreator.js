"use strict";

if (!io) var io = {};
if (!io.github) io.github = {};
if (!io.github.crisstanza) io.github.crisstanza = {};
if (!io.github.crisstanza.ElementsCreator) io.github.crisstanza.ElementsCreator = {};

(function() {

	io.github.crisstanza.ElementsCreator.create = function(name, attributes, parent, innerHTML) {
		let element = document.createElement(name);
		if (attributes) {
			for (var key in attributes) {
				element.setAttribute(key, attributes[key]);
			}
		}
		if (parent) {
			parent.appendChild(element);
		}
		if (innerHTML) {
			element.innerHTML = innerHTML;
		}
		return element;
	};

	io.github.crisstanza.ElementsCreator.create.svg = function(name, attributes, parent) {
		let element = document.createElementNS('http://www.w3.org/2000/svg', name);
		if (attributes) {
			for (var key in attributes) {
				element.setAttributeNS(null, key, attributes[key]);
			}
		}
		if (parent) {
			parent.appendChild(element);
		}
		return element;
	};

})();
