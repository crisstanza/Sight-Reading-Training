"use strict";

if (!io) var io = {};
if (!io.github) io.github = {};
if (!io.github.crisstanza) io.github.crisstanza = {};

(function() {

	io.github.crisstanza.Metro = function(callback, measureCount, measureBeats, speed) {
		this.callback = callback;
		this.measureCount = measureCount;
		this.measureBeats = measureBeats;
		this.speed = speed;
		this.beat = 0;
		this.maxBeat = measureCount * measureBeats + 1;
	};

	io.github.crisstanza.Metro.prototype.gui = function(btStart, btStop, cbRepeat) {
		this.btStart = btStart;
		this.btStop = btStop;
		this.cbRepeat = cbRepeat;
	};

	io.github.crisstanza.Metro.prototype.init = function() {
		this.beat = -4;
		this.delay = (60 / this.speed) * 1000;
	};

	io.github.crisstanza.Metro.prototype.play = function() {
		if (this.beat != 0) {
			if (this.beat < this.maxBeat) {
				let audio = new Audio('audio/' + this.findCurrentAudio() + '.mp3');
				this.notifyCallback('willPlay');
				audio.play();
				this.notifyCallback('justPlayed');
				let _this = this;
				setTimeout(function() { _this.play() }, this.delay);
				this.incBeat();
			} else {
				this.btStop_OnClick();
				if (this.cbRepeat.checked) {
					this.btStart_OnClick();
				}
			}
		}
	};

	io.github.crisstanza.Metro.prototype.incBeat = function() {
		if (this.beat == -1) {
			this.beat += 2;
			this.delay /= 2;
		} else if (this.beat < 0) {
			this.beat++;
		} else if (this.beat > 0) {
			this.beat += 0.5;
		}
	};

	io.github.crisstanza.Metro.prototype.findCurrentAudio = function() {
		if (this.beat < 0 || this.beat % 1 == 0.5) {
			return '0.5';
		} if (this.beat % this.measureBeats == 1) {
			return '1';
		} else {
			return '234';
		}
	};

	io.github.crisstanza.Metro.prototype.notifyCallback = function(event) {
		if (this.callback) {
			if (event == 'willStart') {
				this.callback.willStart(this.beat);
			} else if (event == 'justStarted') {
				this.callback.justStarted(this.beat);
			} else if (event == 'willPlay') {
				this.callback.willPlay(this.beat);
			} else if (event == 'justPlayed') {
				this.callback.justPlayed(this.beat);
			} else if (event == 'willStop') {
				this.callback.willStop(this.beat);
			} else if (event == 'justStopped') {
				this.callback.justStopped(this.beat);
			}
		}
	};

	io.github.crisstanza.Metro.prototype.btStart_OnClick = function(event) {
		this.btStart.setAttribute('disabled', 'disabled');
		this.btStop.removeAttribute('disabled');
		this.start();
	};

	io.github.crisstanza.Metro.prototype.start = function() {
		if (this.beat == 0) {
			this.init();
			this.notifyCallback('willStart');
			this.play();
			this.notifyCallback('justStarted');
		}
	};

	io.github.crisstanza.Metro.prototype.btStop_OnClick = function(event) {
		this.btStart.removeAttribute('disabled');
		this.btStop.setAttribute('disabled', 'disabled');
		this.stop();
	};

	io.github.crisstanza.Metro.prototype.stop = function() {
		this.notifyCallback('willStop');
		this.beat = 0;
		this.notifyCallback('justStopped');
	};

})();
