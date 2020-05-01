const createBandFilter = (context, freq) => {
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

const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max))

// Main starts here
const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const EQ_FREQUENCIES = [32, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
const bandFilters = EQ_FREQUENCIES.map((freq) => createBandFilter(audioContext, freq))

const source = audioContext.createMediaElementSource(equalizedAudioPlayer)
connectEqualizerFilters(source, bandFilters, audioContext.destination)

const applyEqualization = (equalization) =>
  bandFilters.forEach((filter, i) => (filter.gain.value = equalization[i]))

const eqReset = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const resetEqualization = () => applyEqualization(eqReset)

const currentEqualization = [0, 0, 0, 0, 0, 12, 0, -12, 0, 0, 0]

// UI stuff
audioFileSelector.onchange = function(){
  // this needs to be written with function() syntax in order to have this
  const file = this.files[0]
  equalizedAudioPlayer.src = URL.createObjectURL(file)
  uiAudioSourceName.textContent = file.name
  audioFileSelector.classList.add("d-none")
}

const handleClickListenEQVersion = () => {
  applyEqualization(currentEqualization)
  buttonListenEq.classList.add("d-none")
  buttonListenOriginal.classList.remove("d-none")
}

const handleClickListenOriginal = () => {
  resetEqualization()
  buttonListenEq.classList.remove("d-none")
  buttonListenOriginal.classList.add("d-none")
}

const handleClickButtonChangeAudio = () => {
  audioFileSelector.classList.remove("d-none")
}
