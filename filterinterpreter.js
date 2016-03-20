"use strict";

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

		if (typeof(expression) === 'boolean')
			return expression;

		/* Copies the current level of the expression tree */
		expression = expression.slice();

		while (expression.length > 0) {

			let result;
			let [left, operator, right] = expression.splice(this.associativity, 3);

			if (Operators[operator]) {
				let visitor = `visit_${Operators[operator]}`;
				result = this[visitor](object, left, right);
			} else {
				throw new Error(`Unknown operator '${operator}'`);
			}

			if (expression.length === 0)
				return result;
			else if (this.associativity === FilterInterpreter.RIGHT_ASSOCIATIVE)
				expression.push(result);
			else
				expression.unshift(result);

		}

	}

	visit_and (object, left, right) {
		return (this.visit(object, left) && this.visit(object, right));
	}

	visit_or (object, left, right) {
		return (this.visit(object, left) || this.visit(object, right));
	}

	visit_equals (object, left, right) {
		return (object[left] === right);
	}

	visit_not_equals (object, left, right) {
		return (object[left] !== right);
	}

	visit_greater_than	(object, left, right) {
		return (object[left] > right);
	}

	visit_greater_than_equals (object, left, right) {
		/* Greater than equals on list is subset operator */
		if (Array.isArray(object[left]))
			return right.every(value => (object[left].includes(right)));
		return (object[left] >= right);
	}

	visit_less_than (object, left, right) {
		return (object[left] < right);
	}

	visit_less_than_equals (object, left, right) {
		/* Less than equals on list is superset operator */
		if (Array.isArray(object[left]))
			return object[left].every(value => (right.includes(value)));
		return (object[left] <= right);
	}

}

module.exports = FilterInterpreter;
module.exports.RIGHT_ASSOCIATIVE = -3;
module.exports.LEFT_ASSOCIATIVE = 0;
