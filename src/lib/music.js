// A small generative fantasy tune built with the Web Audio API: a harp-like
// arpeggio, a low drone, a hand drum and a flute melody in D minor, 3/4 time.

const BPM = 84
const EIGHTH = 60 / BPM / 2

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12)

// Chords as [root, third, fifth] MIDI notes in octave 3: Dm C Bb C | Dm F Gm A
const CHORDS = [
  [50, 53, 57], [48, 52, 55], [46, 50, 53], [48, 52, 55],
  [50, 53, 57], [53, 57, 60], [55, 58, 62], [57, 61, 64],
]

// Melody per bar as [midi or null for rest, length in eighths]; 6 eighths a bar.
const MELODY = [
  [[69, 2], [74, 2], [76, 1], [77, 1]],
  [[76, 3], [74, 1], [72, 2]],
  [[74, 2], [77, 2], [74, 1], [70, 1]],
  [[72, 4], [67, 2]],
  [[69, 2], [74, 2], [77, 2]],
  [[81, 3], [79, 1], [77, 2]],
  [[79, 2], [77, 1], [76, 1], [74, 2]],
  [[73, 4], [null, 2]],
]
const ANSWER = [
  [[77, 2], [76, 1], [74, 1], [72, 2]],
  [[72, 2], [74, 1], [76, 1], [79, 2]],
  [[77, 4], [74, 2]],
  [[76, 3], [72, 1], [67, 2]],
  [[74, 2], [77, 1], [81, 1], [79, 2]],
  [[77, 2], [76, 2], [72, 2]],
  [[74, 3], [70, 1], [67, 2]],
  [[69, 4], [null, 2]],
]

export function createMusic() {
  let ctx, master, reverb, timer
  let bar = 0
  let nextBarTime = 0
  let loop = 0

  function setup() {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    // Simple reverb from a decaying noise impulse.
    reverb = ctx.createConvolver()
    const len = ctx.sampleRate * 2.5
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const data = impulse.getChannelData(c)
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
    }
    reverb.buffer = impulse
    const wet = ctx.createGain()
    wet.gain.value = 0.35
    reverb.connect(wet).connect(master)
  }

  function voice(type, freq, time, dur, gain, attack = 0.005, filter = 4000) {
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    const lp = ctx.createBiquadFilter()
    osc.type = type
    osc.frequency.value = freq
    lp.frequency.value = filter
    amp.gain.setValueAtTime(0, time)
    amp.gain.linearRampToValueAtTime(gain, time + attack)
    amp.gain.exponentialRampToValueAtTime(0.0001, time + dur)
    osc.connect(lp).connect(amp)
    amp.connect(master)
    amp.connect(reverb)
    osc.start(time)
    osc.stop(time + dur + 0.05)
    return osc
  }

  function harp(note, time) {
    voice('triangle', midi(note), time, 1.6, 0.09, 0.004, 2600)
    voice('sine', midi(note + 12), time, 0.6, 0.025)
  }

  function flute(note, time, dur) {
    const osc = voice('sine', midi(note), time, dur + 0.25, 0.07, 0.08, 3000)
    const vib = ctx.createOscillator()
    const depth = ctx.createGain()
    vib.frequency.value = 5
    depth.gain.value = midi(note) * 0.006
    vib.connect(depth).connect(osc.frequency)
    vib.start(time + 0.15)
    vib.stop(time + dur + 0.3)
  }

  function drone(chord, time) {
    for (const [n, detune] of [[chord[0] - 12, -6], [chord[0] - 12, 6], [chord[2] - 12, 0]]) {
      const osc = voice('sawtooth', midi(n), time, EIGHTH * 6 + 0.4, 0.018, 0.4, 500)
      osc.detune.value = detune
    }
  }

  function drum(time, gain, pitch) {
    const len = 0.25
    const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 6)
    const src = ctx.createBufferSource()
    const lp = ctx.createBiquadFilter()
    const amp = ctx.createGain()
    src.buffer = buf
    lp.frequency.value = pitch
    amp.gain.value = gain
    src.connect(lp).connect(amp).connect(master)
    src.start(time)
    voice('sine', pitch / 4, time, 0.2, gain * 0.5)
  }

  function scheduleBar(time) {
    const chord = CHORDS[bar]
    const [r, t, f] = chord
    const arp = [r, f, r + 12, t + 12, r + 12, f]
    arp.forEach((n, i) => harp(n, time + i * EIGHTH))
    voice('triangle', midi(r - 12), time, EIGHTH * 6, 0.1, 0.01, 600)
    drone(chord, time)
    drum(time, 0.5, 400)
    drum(time + EIGHTH * 3, 0.25, 900)
    drum(time + EIGHTH * 5, 0.15, 1200)

    // Melody on the 2nd and 3rd pass through the progression, then a rest.
    const phrase = [null, MELODY, ANSWER, MELODY][loop % 4]
    if (phrase) {
      let at = time
      for (const [n, len] of phrase[bar]) {
        if (n) flute(n, at, len * EIGHTH)
        at += len * EIGHTH
      }
    }

    bar = (bar + 1) % CHORDS.length
    if (bar === 0) loop++
  }

  function tick() {
    while (nextBarTime < ctx.currentTime + 0.3) {
      scheduleBar(nextBarTime)
      nextBarTime += EIGHTH * 6
    }
  }

  return {
    play() {
      if (!ctx) setup()
      ctx.resume()
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 1.5)
      if (!timer) {
        nextBarTime = ctx.currentTime + 0.1
        tick()
        timer = setInterval(tick, 100)
      }
    },
    stop() {
      if (!ctx) return
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
      clearInterval(timer)
      timer = null
    },
  }
}
