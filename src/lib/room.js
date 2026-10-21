import { supabase } from './supabase'

export const MAX_PLAYERS = 5
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

export function makeRoomCode() {
  return Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')
}

export function makePlayerId() {
  return crypto.randomUUID()
}

// Joins a room channel and tracks presence. Calls onPlayers with the sorted
// player list whenever someone joins or leaves; the earliest joiner is host.
// onMessage receives (event, payload) for broadcasts from other players.
export function joinRoom({ code, player, onPlayers, onMessage, onFull, onError }) {
  if (!supabase) return joinLocalRoom({ code, player, onPlayers, onMessage, onFull })
  const channel = supabase.channel(`room:${code}`, {
    config: { presence: { key: player.id } },
  })

  const readPlayers = () =>
    Object.values(channel.presenceState())
      .map((metas) => metas[0])
      .sort((a, b) => a.joinedAt - b.joinedAt)

  channel
    .on('presence', { event: 'sync' }, () => {
      const players = readPlayers()
      const me = players.findIndex((p) => p.id === player.id)
      if (me >= MAX_PLAYERS) {
        onFull()
        channel.unsubscribe()
        return
      }
      onPlayers(players.slice(0, MAX_PLAYERS))
    })
    .on('broadcast', { event: '*' }, ({ event, payload }) => onMessage(event, payload))
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await channel.track(player)
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        onError(`Couldn't reach Supabase (${status}). Check the project URL and anon key.`)
      }
    })

  return {
    send: (event, payload) => channel.send({ type: 'broadcast', event, payload }),
    update: (patch) => channel.track(patch),
    leave: () => channel.unsubscribe(),
  }
}

// Offline stand-in for Supabase so the game can be tried in several tabs of
// one browser. Presence is a heartbeat; tabs silent for 3s count as gone.
function joinLocalRoom({ code, player, onPlayers, onMessage, onFull }) {
  const bus = new BroadcastChannel(`xakrpg:${code}`)
  const seen = new Map([[player.id, { meta: player, at: Date.now() }]])
  let me = player
  let last = ''

  const sync = () => {
    const now = Date.now()
    for (const [id, p] of seen) if (id !== me.id && now - p.at > 3000) seen.delete(id)
    const players = [...seen.values()].map((p) => p.meta).sort((a, b) => a.joinedAt - b.joinedAt)
    const key = JSON.stringify(players)
    if (key === last) return
    last = key
    if (players.findIndex((p) => p.id === me.id) >= MAX_PLAYERS) {
      onFull()
      stop()
      return
    }
    onPlayers(players.slice(0, MAX_PLAYERS))
  }
  const beat = () => bus.postMessage({ kind: 'presence', meta: me })

  bus.onmessage = ({ data }) => {
    if (data.kind === 'presence') {
      const isNew = !seen.has(data.meta.id)
      seen.set(data.meta.id, { meta: data.meta, at: Date.now() })
      if (isNew) beat()
      sync()
    } else if (data.kind === 'leave') {
      seen.delete(data.id)
      sync()
    } else {
      onMessage(data.event, data.payload)
    }
  }

  const timer = setInterval(() => { beat(); sync() }, 1000)
  const stop = () => {
    clearInterval(timer)
    bus.postMessage({ kind: 'leave', id: me.id })
    bus.close()
  }
  beat()
  setTimeout(sync, 0)

  return {
    send: (event, payload) => bus.postMessage({ kind: 'message', event, payload }),
    update: (patch) => {
      me = patch
      seen.set(me.id, { meta: me, at: Date.now() })
      beat()
      sync()
    },
    leave: stop,
  }
}
