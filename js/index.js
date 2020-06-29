(function() {

	let SPEED = 60;

	let SPACE_SIZE = 6;
	let MEASURE_COUNT = 4;
	let MEASURE_SIZE = 100 / MEASURE_COUNT;

	let MEASURE_BEATS = 4;
	let BEAT_SIZES = MEASURE_SIZE / (MEASURE_BEATS + 1);

	let POSSIBLE_NOTES_COUNT = 15;
	let EXTRA_LINES_LIMITS = [1, 13];

	let START_Y_2 = 50 + (50 - SPACE_SIZE * 4) / 2;
	let START_Y_1 = (50 - SPACE_SIZE * 4) / 2;

	let LINE_STROKE_WIDTH = 2;
	let BAR_STROKE_WIDTH = 1;
	let NOTE_STROKE_WIDTH = 2;

	let METRO, CREATOR;
	let NOTES, EXTRA_LINES;

	function drawBars(startY) {
		let delta = SPACE_SIZE/4;
		let y1 = startY + SPACE_SIZE*0 - delta + '%';
		let y2 = startY + SPACE_SIZE*4 + delta + '%';
		for (let i = 0 ; i < MEASURE_COUNT ; i++) {
			let x = MEASURE_SIZE * (i + 1) + '%';
			CREATOR.create.svg('line', {x1: x, y1: y1, x2: x, y2: y2, stroke: 'gray', 'stroke-width': BAR_STROKE_WIDTH}, svg);
		}
	}

	function drawLines(startY) {
		for (let i = 0 ; i < 5 ; i++) {
			let y = startY + SPACE_SIZE*i + '%';
			CREATOR.create.svg('line', {x1: 0, y1: y, x2: '100%', y2: y, stroke: 'black', 'stroke-width': LINE_STROKE_WIDTH}, svg);
		}
		drawBars(startY);
	}

	function highlightFirstNote() {
		let note = NOTES[0];
		let filled = note.getAttribute('filled');
		note.setAttribute('stroke', 'orange');
		if (filled == 'true') {
			note.setAttribute('fill', '#FEFE08');
		} else {
			note.setAttribute('fill', '#FFFAF2');
		}
	}

	function highlightLastNote(beat) {
		let noteIndex;
		if (beat > 0) {
			noteIndex = Math.min(Math.floor(beat), NOTES.length) - 1;
		} else {
			noteIndex = 0;
		}
		let note = NOTES[noteIndex];
		let filled = note.getAttribute('filled');
		note.setAttribute('stroke', 'red');
		if (filled == 'true') {
			note.setAttribute('fill', '#FF3737');
		} else {
			note.setAttribute('fill', '#FFF7F7');
		}
	}

	function highlightNote(beat) {
		if (beat > 0) {
			if (beat % 1 == 0) {
				let note = NOTES[beat - 1];
				let filled = note.getAttribute('filled');
				note.setAttribute('stroke', 'green');
				if (filled == 'true') {
					note.setAttribute('fill', '#009300');
				} else {
					note.setAttribute('fill', '#DDF5DD');
				}
				if (beat > 1) {
					let previousNote = NOTES[beat - 2];
					let previousFilled = previousNote.getAttribute('filled');
					previousNote.setAttribute('stroke', 'black');
					if (previousFilled == 'true') {
						previousNote.setAttribute('fill', '#333');
					} else {
						previousNote.setAttribute('fill', '#FFF');
					}
				}
			}
		}
	}

	function init(event) {
		CREATOR = io.github.crisstanza.ElementsCreator;
		drawLines(START_Y_1);
		drawLines(START_Y_2);
		let callback = {
			willStart: function(beat) {
				drawNotes();
				highlightFirstNote();
			},
			justStarted: function(beat) {
			},
			willPlay: function(beat) {
				highlightNote(beat);
			},
			justPlayed: function(beat) {
			},
			willStop: function(beat) {
				highlightLastNote(beat);
			},
			justStopped: function(beat) {
			}
		};
		METRO = new io.github.crisstanza.Metro(callback, MEASURE_COUNT, MEASURE_BEATS, SPEED);
		METRO.gui(btStart, btStop, cbRepeat);
		io.github.crisstanza.Autos.initButtons(METRO);
	}

	function drawNotes() {
		if (NOTES) {
			NOTES.forEach(function(note) { note.remove(); });
		}
		if (EXTRA_LINES) {
			EXTRA_LINES.forEach(function(line) { line.remove(); });
		}
		for (let k = 0 ; k < MEASURE_COUNT ; k++) {
			let startX = BEAT_SIZES * k * (MEASURE_BEATS + 1);
			for (let i = 0 ; i < MEASURE_BEATS ; i++) {
				let j = Math.floor(Math.random() * POSSIBLE_NOTES_COUNT);
				let startY, fillColor, line, filled;
				if (i == 0) {
					startY = START_Y_2;
					fillColor = '#FFF';
					line = false;
					filled = false;
				} else {
					startY = START_Y_1;
					fillColor = '#333';
					line = true;
					filled = true;
				}
				let cx = startX + BEAT_SIZES*(i + 1) + '%';
				let cy = (startY - SPACE_SIZE*1.5) + (SPACE_SIZE/2)*j;
				let y1 = cy;
				let group = CREATOR.create.svg('g', {name: i + k * MEASURE_BEATS + 1, stroke: 'black', fill: fillColor, filled: filled}, svg);
				let circle = CREATOR.create.svg('ellipse', {cx: cx, cy: cy + '%', ry: SPACE_SIZE/2.5 + '%', 'stroke-width': NOTE_STROKE_WIDTH}, group);
				let circleRadius = circle.getBoundingClientRect().width / 2;
				let svgWidth = svg.getBoundingClientRect().width;
				let deltaX = (circleRadius * 100) / svgWidth;
				if (line) {
					let x, y2;
					if (j < POSSIBLE_NOTES_COUNT / 2) {
						x = startX - deltaX + BEAT_SIZES*(i + 1) + '%';
						y2 = (startY + SPACE_SIZE*3) + (SPACE_SIZE/2)*(j - 4) + '%';
					} else {
						x = startX + deltaX + BEAT_SIZES*(i + 1) + '%';
						y2 = (startY - SPACE_SIZE*4) + (SPACE_SIZE/2)*j + '%';
					}
					CREATOR.create.svg('line', {x1: x, y1: y1 + '%', x2: x, y2: y2, 'stroke-width': NOTE_STROKE_WIDTH}, group);
				}
				if (j <= EXTRA_LINES_LIMITS[0] || j >= EXTRA_LINES_LIMITS[1]) {
					let x1 = startX + BEAT_SIZES*(i + 1) - deltaX*2 + '%';
					let x2 = startX + BEAT_SIZES*(i + 1) + deltaX*2 + '%';
					let deltaY;
					if (j % 2 == 0) {
						deltaY = SPACE_SIZE/2 * (j < POSSIBLE_NOTES_COUNT / 2 ? 1 : -1);
					} else {
						deltaY = 0;
					}
					CREATOR.create.svg('line', {x1: x1, y1: y1 + deltaY + '%', x2: x2, y2: y1 + deltaY + '%', stroke: 'black', 'stroke-width': LINE_STROKE_WIDTH, name: 'extra'}, svg);
				}
				group.remove();
				svg.appendChild(group);
			}
		}
		NOTES = svg.querySelectorAll('g');
		EXTRA_LINES = svg.querySelectorAll('line[name="extra"]');
	}

	function window_HashChange(event) {
		var hash = document.location.hash;
		console.log(hash);
	}

	function window_Load(event) {
		init(event);
	}

	window.addEventListener('load', window_Load);
	window.addEventListener('hashchange', window_HashChange);

})();
