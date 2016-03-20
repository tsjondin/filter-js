"use strict";

const FilterParserToken = require('./filterparsertokenizer').FilterParserToken;
const Operators = require('./filteroperators.json');

class FilterInterpreter {

	/**
	 * Constructs a new FilterInterpreter
	 *
	 * @param associativity Global associativity for the language
	 */
	constructor (associativity = FilterInterpreter.RIGHT_ASSOCIATIVE) {
		this.associativity = associativity;
	}

	/**
	 * Check if an object matches an expression parsed from the
	 * FilterParser
	 *
	 * @param object      An object supporting array-access
	 * @param expression  An expression tree
	 */
	visit (object, expression) {

		if (typeof(expression) === 'boolean') {
			return expression;
		} else if (expression instanceof FilterParserToken)
			return this.visit_token(object, expression);

		/* Copies the current level of the expression tree */
		expression = expression.slice();

		while (expression.length > 0) {

			let result;
			let [left, operator, right] = expression.splice(this.associativity, 3);

			if (Operators[operator.value]) {
				let visitor = `visit_${Operators[operator.value]}`;
				result = this[visitor](object, left, right);
			} else {
				throw new Error(`Unknown operator '${operator.value}'`);
			}

			if (expression.length === 0)
				return result;
			else if (this.associativity === FilterInterpreter.RIGHT_ASSOCIATIVE)
				expression.push(result);
			else
				expression.unshift(result);

		}

	}

	visit_token (object, token) {
		if (token.type === 'scope')
			return this.visit(object, token.value);
		else if (token.type === 'keyword') {
			return token.value.split(/\./g).reduce((point, space) => {
				if (typeof(point[space]) !== 'undefined') return point[space];
				else throw new Error(`Cannot find ${space} in object`);
			}, object);
		} else return token.value;
	}

	visit_and (object, left, right) {
		return (this.visit(object, left) && this.visit(object, right));
	}

	visit_or (object, left, right) {
		return (this.visit(object, left) || this.visit(object, right));
	}

	visit_equals (object, left, right) {
		return (this.visit(object, left) === this.visit(object, right));
	}

	visit_not_equals (object, left, right) {
		return (this.visit(object, left) !== this.visit(object, right));
	}

	visit_greater_than	(object, left, right) {
		return (this.visit(object, left) > this.visit(object, right));
	}

	visit_greater_than_equals (object, left, right) {
		/* Greater than equals on list is subset operator */
		left = this.visit(object, left);
		right = this.visit(object, right);
		if (Array.isArray(left))
			return right.every(value => (left.includes(right)));
		return (left >= right);
	}

	visit_less_than (object, left, right) {
		return (this.visit(object, left) < this.visit(object, right));
	}

	visit_less_than_equals (object, left, right) {
		/* Less than equals on list is superset operator */
		left = this.visit(object, left);
		right = this.visit(object, right);
		if (Array.isArray(left))
			return left.every(value => (right.includes(value)));
		return (left <= right);
	}

	visit_addition (object, left, right) {
		return (this.visit(object, left) < this.visit(object, right));
	}

	visit_subtraction (object, left, right) {
		return (this.visit(object, left) < this.visit(object, right));
	}

	visit_division (object, left, right) {
		return (this.visit(object, left) < this.visit(object, right));
	}

	visit_multiplication (object, left, right) {
		return (this.visit(object, left) < this.visit(object, right));
	}

	visit_modulus (object, left, right) {
		return (this.visit(object, left) % this.visit(object, right));
	}

}

module.exports = FilterInterpreter;
module.exports.RIGHT_ASSOCIATIVE = -3;
module.exports.LEFT_ASSOCIATIVE = 0;
