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

const isSameEqualization = (eq1, eq2) => {
  if (eq1.length !== 10) {
    throw Error(`Equalization array 1 has incorrect length: ${eq1.length}`)
  }
  if (eq2.length !== 10) {
    throw Error(`Equalization array 2 has incorrect length: ${eq2.length}`)
  }
  for(let i = 0; i < 10; i++){
    if (eq1[i] !== eq2[i]) return false
  }
  return true
}

const generateAlternative = (givenEq) => {
  const candidate = givenEq.slice()
  while (isSameEqualization(givenEq, candidate)) {
    candidate[getRandomInt(10)] = [-12, 0, 12][getRandomInt(3)]
    if (getRandomInt(5) === 0) {
      candidate[getRandomInt(10)] = [-12, 0, 12][getRandomInt(3)]
    }
    if (getRandomInt(6) === 0) {
      candidate[getRandomInt(10)] = [-12, 0, 12][getRandomInt(3)]
    }
  }
  return candidate
}

const generateAlternativeEqualizations = (givenEq) => {
  // here we generate three other equalizations a few edits distant of the given one
  let candidates = [
    generateAlternative(givenEq),
    generateAlternative(givenEq),
    generateAlternative(givenEq),
  ]
  const areAllCandidatesDifferent = () => !(isSameEqualization(candidates[0], candidates[1]) || isSameEqualization(candidates[0], candidates[2]))
  while(!areAllCandidatesDifferent()) {
    candidates = [
      generateAlternative(givenEq),
      generateAlternative(givenEq),
      generateAlternative(givenEq),
    ]
  }
  return candidates
}

const displayEqualization = (svgObject, equalization) => {
  const svgDocument = svgObject.getSVGDocument()
  const calcSliderPosition = (level) => {
    // these two constants come from the SVG file
    const positionY0 = 67
    const heightBandFilter = 90
    return positionY0 - level * (heightBandFilter / 2 / 12) - 5
  }
  equalization.forEach((level, index) => {
    const sliderKnob = svgDocument.getElementById(`band-filter-${index + 1}`)
    sliderKnob.setAttribute("y", calcSliderPosition(level).toString())
  },
  )
}

// Main starts here
const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const EQ_FREQUENCIES = [32, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
const bandFilters = EQ_FREQUENCIES.map((freq) => createBandFilter(audioContext, freq))

const source = audioContext.createMediaElementSource(equalizedAudioPlayer)
connectEqualizerFilters(source, bandFilters, audioContext.destination)

const applyEqualization = (equalization) =>
  bandFilters.forEach((filter, i) => (filter.gain.value = equalization[i]))

const eqReset = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

const currentEqualization = [0, 0, 0, 0, 0, 12, 0, -12, 0, 0]

const quizEqualizationOptions = generateAlternativeEqualizations(currentEqualization)
quizEqualizationOptions.push(currentEqualization)
quizEqualizationOptions.sort(() => Math.random() - 0.5) // shuffle

// UI stuff
audioFileSelector.onchange = function() {
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
  applyEqualization(eqReset)
  buttonListenEq.classList.remove("d-none")
  buttonListenOriginal.classList.add("d-none")
}

const handleClickButtonChangeAudio = () => {
  audioFileSelector.classList.remove("d-none")
}

const svgObjects = document.getElementsByTagName('object')
for(let i = 0; i < svgObjects.length ;i++) {
  const equalization = quizEqualizationOptions[i]
  svgObjects[i].addEventListener('load', function(){
    displayEqualization(this, equalization)
  })
}
