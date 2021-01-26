"use strict";

if (!io) var io = {};
if (!io.github) io.github = {};
if (!io.github.crisstanza) io.github.crisstanza = {};

(function() {

	let MIN_MEASURES = 1;
	let MAX_MEASURES = 8;

	function newAudio(name, audioFormat, audioQuality) {
		let audio = new Audio('audio/' + name + '-' + audioQuality + '.' + audioFormat);
		audio.preload = true;
		audio.addEventListener('ended', () => { AUDIO_POOL[audioFormat][audioQuality][name].push(audio); });
		return audio;
	}

	let POSSIBLE_AUDIO_FORMATS = [ 'aif', 'mp3', 'wav'];
	let POSSIBLE_AUDIO_QUALITIES = [ 'high', 'low'];

	let AUDIO_POOL = {};
	(function() {
		POSSIBLE_AUDIO_FORMATS.forEach(format => {
			AUDIO_POOL[format] = {};
			POSSIBLE_AUDIO_QUALITIES.forEach(quality => {
				AUDIO_POOL[format][quality] = {
					'0.5': [],
					'1': [],
					'234': [],
					'4': []
				};
			});
		});
	})();

	let AUDIO_MIX = {
		'0.5': ['0.5'],
		'1': ['1'],
		'234': ['234'],
		'4': ['1', '4']
	};

	io.github.crisstanza.Metro = function(callback, measureCount, measureBeats) {
		this.callback = callback;
		this.measureCount = measureCount;
		this.measureBeats = measureBeats;
		this.beat = 0;
		this.lastBeat = 0;
		this.audioFormat = 'mp3';
		this.audioQuality = 'low';
	};

	io.github.crisstanza.Metro.prototype.gui = function(inSpeed, btStart, btStop, rbBeats, cbIntro, cbRepeat, btDelMeasure, btAddMeasure) {
		this.inSpeed = inSpeed;
		this.btStart = btStart;
		this.btStop = btStop;
		this.rbBeats = rbBeats;
		this.cbIntro = cbIntro;
		this.cbRepeat = cbRepeat;
		this.btDelMeasure = btDelMeasure;
		this.btAddMeasure = btAddMeasure;
	};

	io.github.crisstanza.Metro.prototype.init = function() {
		this.beat = this.cbIntro.checked ? - this.measureBeats : 1;
		this.lastBeat = null;
		this.maxBeat = this.measureCount * this.measureBeats + 1;
		this.delay = (60 / this.inSpeed.value) * 1000 * (this.cbIntro.checked ? 1 : 0.5);
	};

	io.github.crisstanza.Metro.prototype.play = function() {
		if (this.beat != 0) {
			if (this.beat < this.maxBeat) {
				let audioMix = this.findCurrentAudioMix();
				this.notifyCallback('willPlay');
				audioMix.forEach(name => {
					let audio = this.findAudio(name);
					audio.play();
				});
				this.lastBeat = this.beat;
				this.notifyCallback('justPlayed');
				setTimeout(() => { this.play(); }, this.delay);
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

	io.github.crisstanza.Metro.prototype.findAudio = function(name) {
		return AUDIO_POOL[this.audioFormat][this.audioQuality][name].pop() || newAudio(name, this.audioFormat, this.audioQuality);
	};

	io.github.crisstanza.Metro.prototype.findCurrentAudioMix = function() {
		let name;
		if (this.beat < 0 || this.beat % 1 == 0.5) {
			name = '0.5';
		} else if (this.beat % this.measureBeats == 1) {
			name = '1';
		} else if (this.beat == this.maxBeat - 1) {
			name = '4';
		} else {
			name = '234';
		}
		return AUDIO_MIX[name];
	};

	io.github.crisstanza.Metro.prototype.notifyCallback = function(event, payload) {
		if (this.callback) {
			if (event == 'willStart') {
				this.callback.willStart(this.beat);
			} else if (event == 'justStarted') {
				this.callback.justStarted(this.lastBeat);

			} else if (event == 'willPlay') {
				this.callback.willPlay(this.beat);
			} else if (event == 'justPlayed') {
				this.callback.justPlayed(this.lastBeat);

			} else if (event == 'willStop') {
				this.callback.willStop(this.beat);
			} else if (event == 'justStopped') {
				this.callback.justStopped(this.lastBeat);

			} else if (event == 'justDeletedMeasure') {
				this.callback.justDeletedMeasure(this.measureCount);
			} else if (event == 'justAddedMeasure') {
				this.callback.justAddedMeasure(this.measureCount);

			} else if (event == 'justChangedMeasureBeats') {
				this.callback.justChangedMeasureBeats(this.measureBeats);

			} else if (event == 'justChangedExtraLines') {
				this.callback.justChangedExtraLines(payload);
			}
		}
	};

	io.github.crisstanza.Metro.prototype.rbExtraLines_OnChange = function(event) {
		let rbExtraLinesCurrent = event.target;
		this.notifyCallback('justChangedExtraLines', rbExtraLinesCurrent.value * 1);
	};

	io.github.crisstanza.Metro.prototype.rbAudioFormat_OnChange = function(event) {
		let rbAudioFormatCurrent = event.target;
		this.audioFormat = rbAudioFormatCurrent.value;
		this.notifyCallback('justChangedAudioFormat');
	};

	io.github.crisstanza.Metro.prototype.rbAudioQuality_OnChange = function(event) {
		let rbAudioQualityCurrent = event.target;
		this.audioQuality = rbAudioQualityCurrent.value;
		this.notifyCallback('justChangedAudioQuality');
	};

	io.github.crisstanza.Metro.prototype.rbBeats_OnChange = function(event) {
		let rbBeatsCurrent = event.target;
		this.measureBeats = rbBeatsCurrent.value * 1;
		this.notifyCallback('justChangedMeasureBeats');
	};

	io.github.crisstanza.Metro.prototype.btDelMeasure_OnClick = function(event) {
		if (this.measureCount > MIN_MEASURES) {
			this.measureCount--;
			this.notifyCallback('justDeletedMeasure');
			this.btAddMeasure.removeAttribute('disabled');
		}
		if (this.measureCount <= MIN_MEASURES) {
			this.btDelMeasure.setAttribute('disabled', 'disabled');
		}
	};

	io.github.crisstanza.Metro.prototype.btAddMeasure_OnClick = function(event) {
		if (this.measureCount < MAX_MEASURES) {
			this.measureCount++;
			this.notifyCallback('justAddedMeasure');
			this.btDelMeasure.removeAttribute('disabled');
		}
		if (this.measureCount >= MAX_MEASURES) {
			this.btAddMeasure.setAttribute('disabled', 'disabled');
		}
	};

	io.github.crisstanza.Metro.prototype.btStart_OnClick = function(event) {
		this.btDelMeasure.setAttribute('disabled', 'disabled');
		this.btAddMeasure.setAttribute('disabled', 'disabled');
		this.inSpeed.setAttribute('disabled', 'disabled');
		this.btStart.setAttribute('disabled', 'disabled');
		this.rbBeats.forEach(function(rbBeat) { rbBeat.setAttribute('disabled', 'disabled'); });
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
		if (this.measureCount > MIN_MEASURES) {
			this.btDelMeasure.removeAttribute('disabled');
		}
		if (this.measureCount < MAX_MEASURES) {
			this.btAddMeasure.removeAttribute('disabled');
		}
		this.inSpeed.removeAttribute('disabled');
		this.btStart.removeAttribute('disabled');
		this.rbBeats.forEach(function(rbBeat) { rbBeat.removeAttribute('disabled'); });
		this.btStop.setAttribute('disabled', 'disabled');
		this.stop();
	};

	io.github.crisstanza.Metro.prototype.stop = function() {
		this.notifyCallback('willStop');
		this.beat = 0;
		this.notifyCallback('justStopped');
	};

})();
