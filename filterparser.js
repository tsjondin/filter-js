"use strict";

const StringStream = require('./stringstream');
const FilterParserVisitor = require('./filterparservisitor');
const FilterParserTokenizer = require('./filterparsertokenizer');

class FilterParser {

	constructor (visitor, tokenizer) {

		this.visitor = new visitor(this);
		this.tokenizer = new tokenizer(this);
		this.tokenizers = this.tokenizer.tokenizers();

	}

	continue (stream, expressions = []) {

		let next;
		while (next = stream.next()) {

			if (next.match(/\s/)) continue;

			let token = this.tokenizers.reduce((token, tokenizer) => {
				return token ? token : tokenizer.call(this.tokenizer, stream, next);
			}, null);

			if (!token) throw new Error('No token');
			else this.visitor.visit(token, stream, expressions);

		}

	}

	parse (filter_string) {

		let stream = new StringStream(filter_string);
		let expressions = [];

		this.continue(stream, expressions);
		return expressions;

	}

}

module.exports = FilterParser;
