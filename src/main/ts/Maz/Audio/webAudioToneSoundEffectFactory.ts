function webAudioToneSoundEffectFactory(
    audioContext: AudioContext,
    oscillatorType: string,
    startFrequency: number,
    endFrequency: number,
    frequencyRange: number,
    attackSeconds: number,
    decaySeconds: number,
    sustainSeconds: number,
    durationSeconds: number,
    volumeScale = 1.0
): ISoundEffect {

    return function (intensity: number) {

        if (audioContext) {

            var now = audioContext.currentTime;


            // base noise
            var oscillator = audioContext.createOscillator();
            oscillator.frequency.setValueAtTime(Math.max(1, startFrequency + frequencyRange * intensity), now);
            oscillator.frequency.linearRampToValueAtTime(Math.max(1, endFrequency + frequencyRange * intensity), now + durationSeconds);
            oscillator.type = oscillatorType;

            //decay
            var gain = audioContext.createGain();

            gain.gain.value = 0;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.2 * volumeScale, now + attackSeconds);
            gain.gain.linearRampToValueAtTime(0.1 * volumeScale, now + decaySeconds);
            if (sustainSeconds) {
                gain.gain.linearRampToValueAtTime(0.1 * volumeScale, now + sustainSeconds);
            }
            gain.gain.linearRampToValueAtTime(0, now + durationSeconds);

            // wire up
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.start();

            // kill
            setTimeout(function () {
                oscillator.stop();
            }, durationSeconds * 1000);

        }
    }
}

