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

const isEqualizationEqual = (eq1, eq2) => {
  if (eq1.length !== 10) {
    throw Error(`Equalization array 1 has incorrect length: ${eq1.length}`)
  }
  if (eq2.length !== 10) {
    throw Error(`Equalization array 2 has incorrect length: ${eq2.length}`)
  }
  for (let i = 0; i < 10; i++) {
    if (eq1[i] !== eq2[i]) return false
  }
  return true
}

const generateAlternative = (givenEq) => {
  const candidate = givenEq.slice()
  while (isEqualizationEqual(givenEq, candidate)) {
    candidate[getRandomInt(10)] = [-12, 0, 12][getRandomInt(3)]
    if (getRandomInt(5) === 0) {
      candidate[getRandomInt(10)] = [-12, 0, 12][getRandomInt(3)]
    }
    if (getRandomInt(6) === 0) {
      candidate[getRandomInt(10)] = [-12, 0, 12][getRandomInt(3)]
    }
    if (getRandomInt(16) === 0) {
      candidate[getRandomInt(10)] = [-12, 0, 12][getRandomInt(3)]
    }
  }
  return candidate
}

const generateAlternativeEqualizations = (givenEq) => {
  // here we generate three other equalizations a few edits distant of the given one
  let candidates = [
    generateAlternative(eqReset),
    generateAlternative(eqReset),
    generateAlternative(givenEq),
  ]
  const areAllCandidatesDifferent = () =>
    !(
      isEqualizationEqual(candidates[0], candidates[1]) ||
      isEqualizationEqual(candidates[0], candidates[2]) ||
      isEqualizationEqual(candidates[1], candidates[2]) ||
      isEqualizationEqual(candidates[0], givenEq) ||
      isEqualizationEqual(candidates[1], givenEq) ||
      isEqualizationEqual(candidates[2], givenEq)
    )
  while (!areAllCandidatesDifferent()) {
    candidates = [
      generateAlternative(eqReset),
      generateAlternative(eqReset),
      generateAlternative(givenEq),
    ]
  }
  return candidates
}

const displayEqualization = (svgDocument, equalization) => {
  const calcSliderPosition = (level) => {
    // these two constants come from the SVG file
    const positionY0 = 67
    const heightBandFilter = 90
    return positionY0 - level * (heightBandFilter / 2 / 12) - 5
  }
  Array.from(svgDocument.getElementsByClassName("band-filter")).forEach((sliderKnob, index) => {
    const level = equalization[index]
    sliderKnob.setAttribute("y", calcSliderPosition(level).toString())
    // here we add the level as data attribute to the slider, so that we can later recover
    sliderKnob.setAttribute("data-level", level)
  })
}
const getEqualizationFromSvgDocument = (svgDocument) =>
  Array.from(svgDocument.getElementsByClassName("band-filter")).map((x) =>
    parseInt(x.dataset.level),
  )

const GameStates = {
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
}

const generateNewGame = () => {
  const currentEQ = generateAlternative(eqReset)
  const alternatives = generateAlternativeEqualizations(currentEQ)
  alternatives.push(currentEQ)
  alternatives.sort(() => Math.random() - 0.5) // shuffle
  return {
    currentEqualization: currentEQ,
    quizEqualizationOptions: alternatives,
    answerIndex: alternatives.findIndex((x) => isEqualizationEqual(x, currentEQ)),
    state: GameStates.PLAYING,
  }
}

const audioLibrary = [
  {
    file: "library/NiGiD_-_Funk_to_Blame.mp3",
    title:
      '<a href="http://dig.ccmixter.org/files/NiGiD/58126">Funk to Blame</a> by <a href="http://beta.ccmixter.org/people/NiGiD">Martijn de Boer (NiGiD)</a> <small>(c) 2018 Licensed under a Creative Commons (CC BY-NC 3.0) license. Ft: unreal_dm</small>',
  },
  {
    file: "library/magnatune_-_zargon_-_It_s_Alive_Below.mp3",
    title:
      '<strong>It\'s Alive Below</strong>, by <a href="http://beta.ccmixter.org/people/zargon">SoLaRiS</a>',
    title: `<a href="http://dig.ccmixter.org/files/zargon/1875">It's Alive Below</a> by <a href="http://beta.ccmixter.org/people/zargon">SoLaRiS</a> <small>(c) 2005 Licensed under a Creative Commons (CC BY-NC 2.5) license.</small>`,
  },
  {
    file: "library/white_noise.wav",
    title:
      "<a href='https://en.wikipedia.org/wiki/White_noise'>White noise</a>, a good place to begin because you hear all frequencies ;-)",
  },
]

// EVENT ADDING/REMOVING HELPERS (adapted from: https://stackoverflow.com/a/4386514/149872)
const _eventHandlers = {}

const addListener = (node, event, handler, capture = false) => {
  if (!(event in _eventHandlers)) {
    _eventHandlers[event] = []
  }
  _eventHandlers[event].push({ node: node, handler: handler, capture: capture })
  node.addEventListener(event, handler, capture)
}

const removeAllListeners = (targetNode, event) => {
  _eventHandlers[event]
    .filter(({ node }) => node === targetNode)
    .forEach(({ node, handler, capture }) => node.removeEventListener(event, handler, capture))

  _eventHandlers[event] = _eventHandlers[event].filter(({ node }) => node !== targetNode)
}

// Main starts here
const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const EQ_FREQUENCIES = [32, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
const bandFilters = EQ_FREQUENCIES.map((freq) => createBandFilter(audioContext, freq))

const source = audioContext.createMediaElementSource(equalizedAudioPlayer)
connectEqualizerFilters(source, bandFilters, audioContext.destination)

// needed to fix playback on Chrome/webkit
// https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
equalizedAudioPlayer.addEventListener("play", () => {
  audioContext.resume()
})
document.body.addEventListener("click", () => {
  audioContext.resume()
})

const applyEqualizationToAudio = (equalization) =>
  bandFilters.forEach((filter, i) => (filter.gain.value = equalization[i]))

const eqReset = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

let game = generateNewGame()
let scoreHistory = []

// UI stuff
const selectAudio = (audio) => {
  equalizedAudioPlayer.src = audio.file
  uiAudioSourceTitle.innerHTML = audio.title
  audioSelectionContainer.classList.add("d-none")
}

const playAudio = () => equalizedAudioPlayer.play()

audioLibrary.forEach((audio, index) => {
  const item = document.createElement("div")
  item.innerHTML = `<button class="btn btn-primary btn-sm" onclick="selectAudio(audioLibrary[${index}])">Select</button> ${audio.title}`
  uiLibraryContainer.appendChild(item)
})
selectAudio(audioLibrary[0])

audioFileSelector.onchange = () => {
  const file = audioFileSelector.files[0]
  selectAudio({
    file: URL.createObjectURL(file),
    title: file.name,
  })
}

const handleClickListenEQVersion = () => {
  applyEqualizationToAudio(game.currentEqualization)
  playAudio()
}

const handleClickListenOriginal = () => {
  applyEqualizationToAudio(eqReset)
  playAudio()
}

const handleClickButtonChangeAudio = () => {
  audioSelectionContainer.classList.remove("d-none")
}

const setUIMessage = (message) => (quizUIMessage.innerHTML = message)
const setUIMessageEq1 = (message) => (uiMessageEq1.innerHTML = message)
const setUIMessageEq2 = (message) => (uiMessageEq2.innerHTML = message)

const handleCorrectAnswer = (indexAnswer) => {
  setUIMessage('<strong class="text-success">You got it right!</strong>')
  svgObjects.forEach((obj, i) => {
    removeAllListeners(obj.getSVGDocument(), "click")
    removeClickableLook(i)

    if (i === indexAnswer) {
      obj.classList.add("svg-equalizer-correct")
    }
  })
}

// TODO: this is ugly, i should replace this by an EqualizerQuizOption class
// that encapsulates the functionality of displaying / clicking / etc
const setOptionMessageDiv = (svgObj, content) => {
  svgObj.parentNode.getElementsByClassName("option-message")[0].innerHTML = content
}

const handleIncorrectAnswer = (indexClicked, indexAnswer, guessedEqualization) => {
  setUIMessage("<span class='text-danger'>Oops! That's not it!</span>")
  svgObjects.forEach((obj, i) => {
    const svgDoc = obj.getSVGDocument()
    removeAllListeners(svgDoc, "click")
    removeClickableLook(i)

    if (i === indexClicked) {
      // we're handling the incorrect answer
      obj.classList.add("svg-equalizer-incorrect")
      setOptionMessageDiv(
        obj,
        `You answered: <button class="btn btn-sm btn-warning" onclick="applyEqualizationToAudio(${JSON.stringify(
          guessedEqualization,
        )}); playAudio()">Listen</button>`,
      )
    } else if (i === indexAnswer) {
      // this is the answer
      obj.classList.add("svg-equalizer-correct")
    }
  })

  buttonListenOriginal.classList.remove("d-none")
  buttonListenEq.classList.remove("d-none")
}

const handleClickAnswer = (svgDocument, index) => {
  const eqClicked = getEqualizationFromSvgDocument(svgDocument)
  const isCorrectAnswer = index === game.answerIndex
  scoreHistory.push(isCorrectAnswer)
  if (isCorrectAnswer) {
    handleCorrectAnswer(index)
  } else {
    handleIncorrectAnswer(index, game.answerIndex, eqClicked)
  }
  game.state = GameStates.PAUSED
  buttonNewGame.classList.remove("d-none")
  console.log(scoreHistory)
  displayScore(isCorrectAnswer)
}

const displayScore = (x) => {
  const uiScoreSpan = document.createElement("span")
  let uiScoreSpanColor = x ? "correct-answer" : "wrong-answer"
  document
    .querySelector("#uiScoreTracker")
    .appendChild(uiScoreSpan)
    .classList.add(uiScoreSpanColor)
}

// The equalizer is made to look clickable relying on CSS classes for the
// <object> element to add border and :hover,  and the cursor is made "pointer"
// with a CSS class for the <g /> element containing all elements
const addClickableLook = (index) => {
  svgObjects[index].classList.add("svg-equalizer-clickable")
  svgDocument = svgObjects[index].getSVGDocument()
  svgDocument.getElementById("eq-container").classList.add("clickable")
}
const removeClickableLook = (index) => {
  svgObjects[index].classList.remove("svg-equalizer-clickable")
  svgDocument = svgObjects[index].getSVGDocument()
  svgDocument.getElementById("eq-container").classList.remove("clickable")
}

const initSvgEqualizer = (svgDocument, index) => {
  const equalization = game.quizEqualizationOptions[index]
  displayEqualization(svgDocument, equalization)
  addClickableLook(index)
  addListener(svgDocument, "click", () => handleClickAnswer(svgDocument, index))
}

const newGame = () => {
  game = generateNewGame()
  handleClickListenOriginal()
  svgObjects.forEach((obj, i) => {
    initSvgEqualizer(obj.getSVGDocument(), i)
    // reset the UI
    obj.classList.remove("d-none")
    obj.classList.remove("svg-equalizer-incorrect")
    obj.classList.remove("svg-equalizer-correct")
    buttonNewGame.classList.add("d-none")
    setOptionMessageDiv(obj, "")
    setUIMessage("Can you tell which equalizer is being applied?")
  })
}

const svgObjects = Array.from(document.getElementsByTagName("object"))
window.addEventListener("load", () => {
  svgObjects.forEach((obj, i) => initSvgEqualizer(obj.getSVGDocument(), i))
})
