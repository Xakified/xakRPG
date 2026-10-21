import { CARDS, ROUNDS, cardsIn } from './cards'

// The host owns the authoritative game state. Everyone else sends actions to
// the host, which runs them through reduce() and broadcasts the new state.

const HAND_SIZE = 3

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function deal(state) {
  const deck = shuffle(cardsIn(ROUNDS[state.round]).map((c) => c.id))
  const hands = {}
  state.order.forEach((id, i) => {
    hands[id] = deck.slice(i * HAND_SIZE, (i + 1) * HAND_SIZE)
  })
  return { ...state, phase: 'creating', hands, submitted: {} }
}

export function newGame(players) {
  const heroes = {}
  for (const p of players) heroes[p.id] = { player: p.name, heroName: '', picks: [] }
  return {
    phase: 'naming',
    order: players.map((p) => p.id),
    heroes,
    round: 0,
    hands: {},
    submitted: {},
    revealIndex: 0,
    votes: {},
  }
}

export function heroStats(hero) {
  const stats = { M: 1, W: 1, C: 1, L: 1 }
  for (const pick of hero.picks) {
    for (const [k, v] of Object.entries(CARDS[pick.cardId].stats)) stats[k] += v
  }
  return stats
}

export function heroTitle(hero) {
  const origin = hero.picks[0] && CARDS[hero.picks[0].cardId]
  return origin ? `${hero.heroName} the ${origin.name}` : hero.heroName
}

const everyone = (state, done) => state.order.every((id) => done[id])

export function reduce(state, from, action, isHost) {
  if (!state.order.includes(from)) return state

  switch (action.type) {
    case 'name': {
      if (state.phase !== 'naming') return state
      const heroName = String(action.heroName).trim().slice(0, 30)
      if (!heroName) return state
      const heroes = { ...state.heroes, [from]: { ...state.heroes[from], heroName } }
      const next = { ...state, heroes, submitted: { ...state.submitted, [from]: true } }
      return everyone(next, next.submitted) ? deal(next) : next
    }

    case 'pick': {
      if (state.phase !== 'creating' || state.submitted[from]) return state
      if (!state.hands[from]?.includes(action.cardId)) return state
      const answers = action.answers.map((a) => String(a).trim().slice(0, 60))
      if (answers.some((a) => !a)) return state
      const hero = state.heroes[from]
      const heroes = {
        ...state.heroes,
        [from]: { ...hero, picks: [...hero.picks, { cardId: action.cardId, answers }] },
      }
      const next = { ...state, heroes, submitted: { ...state.submitted, [from]: true } }
      if (!everyone(next, next.submitted)) return next
      if (next.round + 1 < ROUNDS.length) return deal({ ...next, round: next.round + 1 })
      return { ...next, phase: 'reveal', revealIndex: 0 }
    }

    case 'next': {
      if (!isHost || state.phase !== 'reveal') return state
      if (state.revealIndex + 1 < state.order.length) return { ...state, revealIndex: state.revealIndex + 1 }
      return { ...state, phase: state.order.length > 1 ? 'voting' : 'results' }
    }

    case 'vote': {
      if (state.phase !== 'voting' || state.votes[from]) return state
      if (action.target === from || !state.order.includes(action.target)) return state
      const votes = { ...state.votes, [from]: action.target }
      return { ...state, votes, phase: everyone(state, votes) ? 'results' : 'voting' }
    }

    default:
      return state
  }
}

// Drops players who left mid-game so the round can still finish.
export function prune(state, presentIds) {
  const order = state.order.filter((id) => presentIds.includes(id))
  if (order.length === state.order.length) return state
  if (order.length === 0) return null
  const next = {
    ...state,
    order,
    revealIndex: Math.min(state.revealIndex, order.length - 1),
    votes: Object.fromEntries(Object.entries(state.votes).filter(([k, v]) => order.includes(k) && order.includes(v))),
  }
  const done = state.phase === 'voting' ? next.votes : next.submitted
  if (!everyone(next, done)) return next
  if (state.phase === 'naming') return deal(next)
  if (state.phase === 'creating') {
    return next.round + 1 < ROUNDS.length ? deal({ ...next, round: next.round + 1 }) : { ...next, phase: 'reveal', revealIndex: 0 }
  }
  if (state.phase === 'voting') return { ...next, phase: 'results' }
  return next
}

export function tally(state) {
  const counts = Object.fromEntries(state.order.map((id) => [id, 0]))
  for (const target of Object.values(state.votes)) if (target in counts) counts[target]++
  const top = Math.max(...Object.values(counts))
  return { counts, winners: state.order.filter((id) => counts[id] === top && top > 0) }
}
