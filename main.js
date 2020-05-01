const createBandFilter = (freq) => {
  const filter = context.createBiquadFilter()
  filter.type = "peaking"
  filter.frequency.value = freq
  return filter
}

const connectEqualizerFilters = (source, bandFilters, destination) => {
  // here we connect the audio source and output to the filter chain
  source.connect(bandFilters[0])
  for (let i = 1; i < bandFilters.length; i++) {
    bandFilters[i - 1].connect(bandFilters[i])
  }
  bandFilters[bandFilters.length - 1].connect(destination)
}

// main
audio_file.onchange = function() {
  audio_player.src = URL.createObjectURL(this.files[0])
}

const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const source = context.createMediaElementSource(document.querySelector("audio"))

const eqFrequencies = [32, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
const bandFilters = eqFrequencies.map(createBandFilter)

connectEqualizerFilters(source, bandFilters, audioContext.destination)

bandFilters[5].gain.value = 12
bandFilters[7].gain.value = -12
