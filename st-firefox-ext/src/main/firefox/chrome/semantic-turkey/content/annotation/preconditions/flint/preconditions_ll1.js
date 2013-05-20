if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/AnnotationManager.jsm", art_semanticturkey);

CodeMirror.defineMode("preconditions", function(config, parserConfig) {
	const
	WS = '[\\x20\\x09\\x0D\\x0A]';
	const
	ATOM = '[A-Za-z\\.]+';

	const
	terminals = {
		terminal : [

		{
			name : "WS",
			regex : new RegExp("^" + WS + "+"),
			style : "sp-ws"
		},

		{
			name : "ATOM",
			regex : new RegExp("^" + ATOM),
			style : "sp-var"
		} ],

		punct : /^(\(|\)|&&|\|\||\!)/
	};

	function gatherAvailableAtoms() {
		var obj = art_semanticturkey.annotation.Preconditions;

		function expand(current) {
			var result = [];
			Object.getOwnPropertyNames(current).forEach(function(v) {
				var newCurrent = current[v];

				if (typeof newCurrent == "function") {
					result.push(v);
				} else {
					expand(newCurrent).forEach(function(v2) {
						result.push(v + "." + v2);
					});
				}
			});
			return result;
		}

		return expand(obj);
	}

	var atoms = gatherAvailableAtoms();
	atoms.sort();

//	var transition_table = {
//		'S0' : {
//			'ATOM' : 'S1',
//			'(' : {
//				postcondition : function(state) {
//					state.parentheses++
//				},
//				key : 'S0'
//			},
//			'!' : 'S2'
//		},
//		'S1' : {
//			'&&' : 'S0',
//			'||' : 'S0',
//			')' : {
//				precondition : function(state) {
//					return state.parentheses > 0;
//				},
//				postcondition : function(state) {
//					return state.parentheses--;
//				},
//				key : 'S1'
//			}
//		},
//		'S2' : {
//			'ATOM' : 'S1',
//			'(' : {
//				postcondition : function(state) {
//					state.parentheses++
//				},
//				key : 'S0'
//			},
//			'!' : 'S2'
//		}
//	};
	
	var transition_table = {
		'S0' : {
			'(' : {
				postcondition : function(state) {
					state.parentheses++;
				},
				key : 'S2'
			},
			'!' : 'S2',
			'ATOM' : 'S1'
		},
		'S1' : {
			')' : {
				precondition : function(state) {
					return state.parentheses > 0;
				},
				postcondition : function(state) {
					return state.parentheses--;
				},
				key : 'S1'
			},
			'&&' : 'S2',
			'||' : 'S2'
		},
		'S2' : {
			'ATOM' : 'S1',
			'!' : 'S2',
			'(' : {
				postcondition : function(state) {
					state.parentheses++;
				},
				key : 'S2'
			}
		}	
	};

	function nextToken(stream) {
		var consumed = null;

		// Tokens defined by individual regular expressions
		for ( var i = 0; i < terminals.terminal.length; ++i) {
			consumed = stream.match(terminals.terminal[i].regex, true, false);
			if (consumed)
				return {
					cat : terminals.terminal[i].name,
					style : terminals.terminal[i].style,
					text : consumed[0]
				};
		}

		// Punctuation
		consumed = stream.match(terminals.punct, true, false);
		if (consumed)
			return {
				cat : consumed[0],
				style : "sp-punc",
				text : consumed[0]
			};

		consumed = stream.match(/./, true, false);
		return {
			cat : "<invalid>",
			style : "sp-invalid",
			text : consumed[0]
		};
	}

	function tokenBase(stream, state) {
		var tokenObj = nextToken(stream, state);

		if (tokenObj.cat == "WS") {
			return tokenObj.style;
		}

		if (tokenObj.cat == "<invalid>") {
			markError(state, stream.column(), stream.column() + stream.current().length);
			state.error = true;
			return tokenObj.style;
		}

		if (state.error == true) {
			return tokenObj.style;
		}

		if (tokenObj.cat == "ATOM") {
			if (atoms.indexOf(tokenObj.text) == -1) {
				markError(state, stream.column(), stream.column() + stream.current().length);
			}
		}

		var row = transition_table[state.key];
		var el = row[tokenObj.cat];
		if (el && (typeof el.precondition == "undefined" || el.precondition(state, tokenObj))) {
			state.key = typeof el == "string" ? el : el.key;
			if (typeof el.postcondition != "undefined") {
				el.postcondition(state, tokenObj);
			}
		} else {
			markError(state, stream.column(), stream.column() + stream.current().length);
			state.error = true;
		}

		return tokenObj.style;
	}

	function markError(state, beginCh, endCh) {
		state.errorMarkers.push({
			begin : {
				line : state.line,
				ch : beginCh
			},
			end : {
				line : state.line,
				ch : endCh
			}
		});
	}

	return {
		token : tokenBase,
		startState : function(base) {
			return {
				key : "S0",
				line : 0,
				parentheses : 0,
				errorMarkers : [],
				error : false,
				getPossibles : function() {
					var row = transition_table[this.key];
					var filtered = Object.getOwnPropertyNames(row).filter(function(v) {
						var e = row[v];
						if (typeof e.precondition == "undefined") {
							return true;
						} else {
							return e.precondition(this);
						}
					}, this);
					var index = filtered.indexOf("ATOM");

					if (index != -1) {
						filtered.splice(index, 1);
						filtered = atoms.concat.apply(atoms, filtered);
					}

					return filtered;
				},
				isValid : function() {
					return this.key == "S0" || (!this.error && this.errorMarkers.length == 0 && this.key == "S1"
							&& this.parentheses == 0);
				}
			};
		},
	};
});
