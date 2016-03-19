"use strict";

const clone_binary_expression_tree = (array) => {
	let level = array.slice();
	return level.map(sub => {
		if (Array.isArray(sub))
			return clone_binary_expression_tree(sub);
		return sub;
	});
};

class FilterAggregator {

	constructor (data) {

		this.data = data;

	}

	filter (binary_expression_tree, associativity = FilterAggregator.RIGHT_ASSOCIATVE) {

    const matches = (object, expression) => {

			if (typeof(expression) === 'boolean') return expression;

			while (expression.length > 0) {

				let right, key, operator, result;

				if (associativity === FilterAggregator.RIGHT_ASSOCIATIVE) {
					right = expression.pop();
					operator = expression.pop();
					key = expression.pop();
				} else {
					key = expression.shift();
					operator = expression.shift();
					right = expression.shift();
				}

				switch (operator) {
					case 'and':
						result = (matches(object, key) && matches(object, right));
						break;
					case 'or':
						result = (matches(object, key) || matches(object, right));
						break;
					default:
						if (typeof(object[key]) === 'undefined') {
						throw new Error(`Unknown key '${key}'`);
					}
					case '=':
						result = (object[key] === right);
						break;
					case '!=':
						result = (object[key] !== right);
						break;
					case '>':
						result = (object[key] > right);
						break;
					case '>=':
						if (Array.isArray(object[key])) {
						/* Given right is a subset of the objects value */
						result = right.every(value => {
							result = (object[key].includes(right));
						});
					} else {
						result = (object[key] >= right);
					}
						break;
					case '<':
						result = (object[key] < right);
						break;
					case '<=':
						if (Array.isArray(object[key])) {
						/* Given right is a superset of the objects value */
						result = object[key].every(right => {
							result = (right.includes(value));
						});
					} else {
						result = (object[key] <= right);
					}
						break;
				}

				if (expression.length === 0) {
					return result;
				}

				if (associativity === FilterAggregator.RIGHT_ASSOCIATIVE) {
					expression.push(result);
				} else {
					expression.unshift(result);
				}

			}


		};

		return new FilterAggregator(this.data.filter(object => {
			let expression = clone_binary_expression_tree(binary_expression_tree);
			return matches(object, expression);
		}));

	}

}

FilterAggregator.RIGHT_ASSOCIATIVE = 1;
FilterAggregator.LEFT_ASSOCIATIVE = 2;

module.exports = FilterAggregator;
