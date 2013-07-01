EXPORTED_SYMBOLS = ["MessageInterpolator"];

var MessageInterpolator = {};
MessageInterpolator.interpolate = function(messageTemplate, bindings) {
	const scanner = /\{([^\{\}]*)\}/g;
	return messageTemplate.replace(scanner, function(match, p1) {
		var replacement = bindings[p1];
		if (typeof replacement == "string") {
			return replacement;
		} else {
			return p1;
		}
	});
};