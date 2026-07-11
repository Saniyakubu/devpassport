type WebkitAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export function playPageFlipSound() {
  try {
    const AudioContextConstructor =
      window.AudioContext ?? (window as WebkitAudioWindow).webkitAudioContext;

    if (!AudioContextConstructor) return;

    const audioContext = new AudioContextConstructor();
    const duration = 0.25;
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < bufferSize; index += 1) {
      const decay = Math.pow(1 - index / bufferSize, 3);
      data[index] = (Math.random() * 2 - 1) * decay * 0.08;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1100;
    filter.Q.value = 1;

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    noise.start();
  } catch {
    // Audio feedback is optional and should never interrupt book interaction.
  }
}
