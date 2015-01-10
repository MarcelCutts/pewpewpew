var utilities = (function() {

	'use strict';

	/**
	 * Generates sensible integer randoms in a specific range
	 * @param  min - Minimum int to generate
	 * @param  max - Maximum int to generate
	 * @return {int} Random integer between 2 points
	 */
	function randomIntFromInterval(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	return {
		randomIntFromInterval: randomIntFromInterval
	};

})();