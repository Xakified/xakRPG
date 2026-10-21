import { useEffect, useRef, useState } from 'react'
import { createMusic } from '../lib/music'
import Icon from './Icon'

function readPref() {
  try {
    return localStorage.getItem('xakrpg-music') !== 'off'
  } catch {
    return true
  }
}

// Browsers only allow audio after a click, so music starts on the first one.
export default function MusicToggle() {
  const [on, setOn] = useState(readPref)
  const music = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    music.current = createMusic()
    const start = () => {
      started.current = true
      if (readPref()) music.current.play()
    }
    window.addEventListener('pointerdown', start, { once: true })
    return () => {
      window.removeEventListener('pointerdown', start)
      music.current.stop()
    }
  }, [])

  function toggle(e) {
    e.stopPropagation()
    const next = !on
    setOn(next)
    try {
      localStorage.setItem('xakrpg-music', next ? 'on' : 'off')
    } catch {
      // Private mode: the choice just won't be remembered.
    }
    if (next) music.current.play()
    else music.current.stop()
  }

  return (
    <button className="music" onClick={toggle} aria-label={on ? 'Mute music' : 'Play music'} title={on ? 'Mute music' : 'Play music'}>
      <Icon name={on ? 'speaker' : 'speaker-off'} size={22} />
    </button>
  )
}
