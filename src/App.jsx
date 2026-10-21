import { useEffect, useRef, useState } from 'react'
import { supabaseConfigured, supabaseError } from './lib/supabase'
import { MAX_PLAYERS, joinRoom, makePlayerId, makeRoomCode } from './lib/room'
import { newGame, prune, reduce } from './game/engine'
import Game from './game/Game'

export default function App() {
  const [name, setName] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [room, setRoom] = useState(null)
  const [players, setPlayers] = useState([])
  const [game, setGame] = useState(null)
  const [error, setError] = useState('')
  const roomRef = useRef(null)
  const playerRef = useRef({ id: makePlayerId() })
  const gameRef = useRef(null)
  const isHostRef = useRef(false)

  useEffect(() => () => roomRef.current?.leave(), [])

  function applyState(next) {
    const wasPlaying = Boolean(gameRef.current)
    gameRef.current = next
    setGame(next)
    if (wasPlaying && !next && playerRef.current.ready) {
      playerRef.current = { ...playerRef.current, ready: false }
      roomRef.current?.update(playerRef.current)
    }
  }

  // Host only: change state locally and tell everyone else.
  function publish(next) {
    applyState(next)
    roomRef.current?.send('state', next)
  }

  function dispatch(action) {
    const me = playerRef.current.id
    if (isHostRef.current) publish(reduce(gameRef.current, me, action, true))
    else roomRef.current.send('action', { from: me, action })
  }

  function handlePlayers(list) {
    setPlayers(list)
    isHostRef.current = list[0]?.id === playerRef.current.id
    if (isHostRef.current) {
      // Catch up anyone who just joined, and drop anyone who left.
      const current = gameRef.current
      if (current) publish(prune(current, list.map((p) => p.id)))
    }
  }

  function handleMessage(event, payload) {
    if (event === 'state') applyState(payload)
    if (event === 'action' && isHostRef.current && gameRef.current) {
      publish(reduce(gameRef.current, payload.from, payload.action, false))
    }
  }

  function enter(code) {
    if (!name.trim()) return setError('Pick a name first.')
    setError('')
    const player = { ...playerRef.current, name: name.trim(), joinedAt: Date.now(), ready: false }
    playerRef.current = player
    roomRef.current = joinRoom({
      code,
      player,
      onPlayers: handlePlayers,
      onMessage: handleMessage,
      onError: (message) => {
        roomRef.current?.leave()
        roomRef.current = null
        setRoom(null)
        setError(message)
      },
      onFull: () => {
        roomRef.current = null
        setRoom(null)
        setError(`Room ${code} is full (${MAX_PLAYERS} players max).`)
      },
    })
    setRoom(code)
  }

  function leave() {
    roomRef.current?.leave()
    roomRef.current = null
    gameRef.current = null
    setRoom(null)
    setPlayers([])
    setGame(null)
  }

  function toggleReady() {
    playerRef.current = { ...playerRef.current, ready: !playerRef.current.ready }
    roomRef.current.update(playerRef.current)
  }

  if (!room) {
    return (
      <main className="card">
        <h1>xakRPG</h1>
        <p className="muted">Gather up to {MAX_PLAYERS} adventurers and write your legends together.</p>
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
        {supabaseError && <p className="error small">{supabaseError}</p>}
        {!supabaseConfigured && (
          <p className="muted small">Offline mode: rooms only work between tabs in this browser. Add Supabase keys to <code>.env</code> to play with friends.</p>
        )}
      </main>
    )
  }

  const me = playerRef.current
  const isHost = players[0]?.id === me.id

  if (game) {
    return (
      <Game
        state={game}
        me={me.id}
        isHost={isHost}
        dispatch={dispatch}
        onRestart={() => publish(null)}
        onLeave={leave}
      />
    )
  }

  const allReady = players.length > 0 && players.every((p) => p.ready)

  return (
    <main className="card">
      <h1>Room <span className="code">{room}</span></h1>
      <p className="muted">Share this code with up to {MAX_PLAYERS - 1} friends.</p>
      <ul className="players">
        {players.map((p, i) => (
          <li key={p.id}>
            <span>{p.name}{i === 0 && ' 👑'}{p.id === me.id && ' (you)'}</span>
            <span className={p.ready ? 'ready' : 'muted'}>{p.ready ? 'ready' : 'waiting'}</span>
          </li>
        ))}
      </ul>
      <button onClick={toggleReady}>{me.ready ? 'Not ready' : 'Ready'}</button>
      {isHost && (
        <button disabled={!allReady} onClick={() => publish(newGame(players))}>
          Begin the tale
        </button>
      )}
      <button className="link" onClick={leave}>Leave room</button>
    </main>
  )
}
