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
// player list whenever someone joins or leaves. The earliest joiner is host.
export function joinRoom({ code, player, onPlayers, onEvent, onFull }) {
  const channel = supabase.channel(`room:${code}`, {
    config: { presence: { key: player.id }, broadcast: { self: true } },
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
    .on('broadcast', { event: 'game' }, ({ payload }) => onEvent(payload))
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await channel.track(player)
    })

  return {
    send: (payload) => channel.send({ type: 'broadcast', event: 'game', payload }),
    update: (patch) => channel.track({ ...player, ...patch }),
    leave: () => channel.unsubscribe(),
  }
}
