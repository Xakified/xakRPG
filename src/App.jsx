import { useEffect, useRef, useState } from 'react'
import { supabaseConfigured } from './lib/supabase'
import { MAX_PLAYERS, joinRoom, makePlayerId, makeRoomCode } from './lib/room'

export default function App() {
  const [name, setName] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [room, setRoom] = useState(null)
  const [players, setPlayers] = useState([])
  const [log, setLog] = useState([])
  const [error, setError] = useState('')
  const roomRef = useRef(null)
  const playerRef = useRef({ id: makePlayerId() })

  useEffect(() => () => roomRef.current?.leave(), [])

  function enter(code) {
    if (!name.trim()) return setError('Pick a name first.')
    setError('')
    const player = { ...playerRef.current, name: name.trim(), joinedAt: Date.now(), ready: false }
    playerRef.current = player
    roomRef.current = joinRoom({
      code,
      player,
      onPlayers: setPlayers,
      onEvent: (e) => setLog((l) => [...l, e]),
      onFull: () => {
        setRoom(null)
        setError(`Room ${code} is full (${MAX_PLAYERS} players max).`)
      },
    })
    setRoom(code)
  }

  function leave() {
    roomRef.current?.leave()
    roomRef.current = null
    setRoom(null)
    setPlayers([])
    setLog([])
  }

  function toggleReady() {
    playerRef.current = { ...playerRef.current, ready: !playerRef.current.ready }
    roomRef.current.update(playerRef.current)
  }

  if (!supabaseConfigured) {
    return (
      <main className="card">
        <h1>xakRPG</h1>
        <p>Supabase isn't configured. Copy <code>.env.example</code> to <code>.env</code> and fill in your project URL and anon key.</p>
      </main>
    )
  }

  if (!room) {
    return (
      <main className="card">
        <h1>xakRPG</h1>
        <input placeholder="Your name" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} />
        <button onClick={() => enter(makeRoomCode())}>Create room</button>
        <div className="row">
          <input
            placeholder="Room code"
            value={codeInput}
            maxLength={4}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
          />
          <button disabled={codeInput.length !== 4} onClick={() => enter(codeInput)}>Join</button>
        </div>
        {error && <p className="error">{error}</p>}
      </main>
    )
  }

  const me = playerRef.current
  const isHost = players[0]?.id === me.id
  const allReady = players.length > 0 && players.every((p) => p.ready)

  return (
    <main className="card">
      <h1>Room <span className="code">{room}</span></h1>
      <p className="muted">Share this code with up to {MAX_PLAYERS - 1} friends.</p>
      <ul className="players">
        {players.map((p, i) => (
          <li key={p.id}>
            {p.name}{i === 0 && ' 👑'}{p.id === me.id && ' (you)'}
            <span className={p.ready ? 'ready' : 'muted'}>{p.ready ? 'ready' : 'waiting'}</span>
          </li>
        ))}
      </ul>
      <button onClick={toggleReady}>{me.ready ? 'Not ready' : 'Ready'}</button>
      {isHost && (
        <button disabled={!allReady} onClick={() => roomRef.current.send({ type: 'start', by: me.name })}>
          Start character creation
        </button>
      )}
      {log.map((e, i) => <p key={i} className="muted">{e.by} started the game. (Character creation goes here.)</p>)}
      <button className="link" onClick={leave}>Leave room</button>
    </main>
  )
}
