"use strict";

class FilterParserVisitor {

	constructor (parser) {
		this.parser = parser;
	}

	visit (token, stream, expressions = null) {
		return this[token.type](token, stream, expressions);
	}

	operator (token, stream, expressions) {


		if (token === ',')
			return this.parser.continue(stream, expressions);

		let operation = [
			expressions.pop(),
			token
		];

		expressions.push(operation);
		this.parser.continue(stream, expressions, operation);

		if (expressions.length === 2) {
			// That was it, no need to next the expressions,
			// nothing more is coming
			expressions.splice(0, 1, operation[0], operation[1], expressions.pop());
		} else {
			// Find next token following this incomplete operation
			// and move it to the operation.
			let index = expressions.indexOf(operation);
			let right_hand = expressions.splice(index + 1, 1)[0];
			operation.push(right_hand);
		}

	}

	string (token, stream, expressions) {
		expressions.push(token);
		this.parser.continue(stream, expressions);
	}

	number (token, stream, expressions) {
		token.value = parseFloat(token.value);
		expressions.push(token);
		this.parser.continue(stream, expressions);
	}

	integer (token, stream, expressions) {
		token.value = parseInt(token.value, 10);
		expressions.push(token);
		this.parser.continue(stream, expressions);
	}

	keyword (token, stream, expressions) {
		expressions.push(token);
		this.parser.continue(stream, expressions, token);
	}

	scope (token, stream, expressions) {
		expressions.push(token);
		this.parser.continue(stream, expressions, token);
	}

	list (token, stream, expressions) {
		expressions.push(token);
		this.parser.continue(stream, expressions, token);
	}

	bool (token, stream, expressions) {
		expressions.push(token.value);
		this.parser.continue(stream, expressions, token);
	}

}

module.exports = FilterParserVisitor;
