
var gl;

function parseValue(type, value) {
	var val = value.value;
	switch(type) {
		case 'string': return String(val);
		case 'number': return Number(val);
		case 'boolean': return val ? true : false;
		case 'undefined': return void 0;
		case 'symbol': return Symbol(val);
		case 'regexp': return new RegExp(val, value.options);
		case 'error': if (val.type.substr(-5) === 'Error') return new (gl[val.type])(val.message); // Do not try it at home !
		case 'object':
		case 'function':
			break;
		default: throw new TypeError(`Undefined type: ${type}`);
	}
	// object/null/function
	if (type === 'object') {
		var res;
		if (val === null) return null;
		try {
			res = parseValue(val.type, val);
		} catch (e) { throw e; } // Rethrow in this stack
		return res;
	} else { // function
		var args = value.parameters,
			body = value.body, f;
		try {
			f = new Function(args.concat([body]));
		} catch (e) { throw new TypeError(`Invalid function structure:\n${JSON.stringify(value,null,2)}`); }
		return f;
	}
}

function powerParse(json) {
	var o;
	try {
		o = JSON.parse(json);
	} catch (e) { throw new SyntaxError(`executiveParse: Uncaught error when trying parse JSON!\n${e.message}`); }
	return parseValue(o.type, o);
}

if (typeof module !== 'undefined') {
	module.exports = powerParse;
	gl = global;
}
else if (typeof window !== 'undefined') {
	window.JSON.execParse = powerParse;
	gl = window;
}
