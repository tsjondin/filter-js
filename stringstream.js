"use strict";

class StringStream {

	constructor (string) {

		this.string = string.split('');
		this.size = string.length;

	}

	until (matcher, pushback = false) {

		let next;
		let string = '';

		while (next = this.next()) {
			if (next.match(matcher)) {
				if (pushback) this.push(next);
				return string;
			}
			string += next;
		}

		return string;

	}

	next () {

		let next = this.string.shift();
		return (next) ? next : false;

	}

	position () {
		return (this.size - this.string.length);
	}

	/**
	 * Return character back into the stream
	 */
	push (character) {

		this.string.unshift(character);

	}

}

module.exports = StringStream;
