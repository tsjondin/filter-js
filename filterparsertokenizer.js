"use strict";

const Operators = Object.keys(
	require('./filteroperators.json')
);

class FilterParserToken {

  constructor (type, value) {

		this.token = true;
    this.type = type;
    this.value = value;

  }

	toString () {
		return `FilterParserToken<${this.type}>[${this.value}]`;
	}

}

class FilterParserTokenizer {

	constructor (parser) {

		this.parser = parser;

	}

	tokenizers () {

		return [
			this.scope,
			this.operator,
			this.string,
			this.number,
			this.list,
			this.keyword
		];

	}

	scope (stream, character) {

		const LPAREN = '(';
		const RPAREN = ')';

		if (character === LPAREN) {

			let scope = "";
			let depth = 1;
			let next;

			while (next = stream.next()) {
				if (next === LPAREN) depth++;
				else if (next === RPAREN) depth--;
				if (depth === 0) break;
				scope += next;
			}

			return new FilterParserToken(
				'scope', this.parser.parse(scope)
			);

		}

		return false;

	}


	operator (stream, character) {

		if (Operators.includes(character)) {

			let operator = character;
			let next;

			while (next = stream.next()) {
				if (Operators.includes(next)) {
					operator += next;
				} else {
					stream.push(next);
					break;
				}
			}

			return new FilterParserToken('operator', operator);

		}

		return false;

	}

	string (stream, character) {

		if (character === '"' || character === "'") {
			let string = stream.until(character);
			return new FilterParserToken('string', string);
		}

		return false;

	}

	number (stream, character) {

		if (character.match(/\d|\./)) {
			let number = character + stream.until(/\s/);
			if (number.match(/\d*\.\d*/)) {
				return new FilterParserToken('number', number);
			} else {
				return new FilterParserToken('integer', number);
			}
		}

		return false;

	}

	list (stream, character) {

		const LIST_START = '[';
		const LIST_END = ']';

		if (character === LIST_START) {

			let list = "";
			let next;
			let depth = 1;

			while (next = stream.next()) {
				if (next === LIST_START) depth++;
				else if (next === LIST_END) depth--;
				if (depth === 0) break;
				list += next;
			}

			return new FilterParserToken(
				'list', this.parser.parse(list)
			);

		}

		return false;

	}

	keyword (stream, character) {

		if (character.match(/[a-zA-Z0-9_]/)) {
			let word = character + stream.until(/[^a-zA-Z0-9_]/, true);
			if (word === 'true' || word === 'false') {
				return new FilterParserToken('bool', word);
			} else {
				return new FilterParserToken('keyword', word);
			}
		}

		return false;

	}

}


module.exports = FilterParserTokenizer;
module.exports.FilterParserToken = FilterParserToken;
