import { useState } from 'react'
import { CARDS, ROUNDS, ROUND_INTROS, STATS, parseTemplate } from './cards'
import { heroStats, heroTitle, tally } from './engine'

export default function Game({ state, me, isHost, dispatch, onRestart, onLeave }) {
  const playing = state.order.includes(me)

  return (
    <main className="card wide">
      {!playing && <p className="muted">A tale is already underway. You're watching, and you'll join the next one.</p>}
      {state.phase === 'naming' && <Naming state={state} me={me} playing={playing} dispatch={dispatch} />}
      {state.phase === 'creating' && <Creating key={state.round} state={state} me={me} playing={playing} dispatch={dispatch} />}
      {state.phase === 'reveal' && <Reveal state={state} isHost={isHost} dispatch={dispatch} />}
      {state.phase === 'voting' && <Voting state={state} me={me} playing={playing} dispatch={dispatch} />}
      {state.phase === 'results' && <Results state={state} isHost={isHost} onRestart={onRestart} />}
      <button className="link" onClick={onLeave}>Leave room</button>
    </main>
  )
}

function Waiting({ state, done }) {
  return (
    <ul className="players">
      {state.order.map((id) => (
        <li key={id}>
          <span>{state.heroes[id].heroName || state.heroes[id].player}</span>
          <span className={done[id] ? 'ready' : 'muted'}>{done[id] ? '✓ done' : 'writing…'}</span>
        </li>
      ))}
    </ul>
  )
}

function Naming({ state, me, playing, dispatch }) {
  const [heroName, setHeroName] = useState('')
  const done = state.submitted[me]

  return (
    <>
      <h1>Prologue</h1>
      <p className="muted">Every legend needs a name. What will the bards call you?</p>
      {playing && !done && (
        <form className="row" onSubmit={(e) => { e.preventDefault(); dispatch({ type: 'name', heroName }) }}>
          <input autoFocus placeholder="Hero name" maxLength={30} value={heroName} onChange={(e) => setHeroName(e.target.value)} />
          <button disabled={!heroName.trim()}>Claim it</button>
        </form>
      )}
      <Waiting state={state} done={state.submitted} />
    </>
  )
}

function StatLine({ stats, bonus }) {
  return (
    <span className="stats">
      {Object.entries(stats).map(([k, v]) => (
        <span key={k} title={STATS[k]}>{bonus ? '+' : ''}{v} {STATS[k]}</span>
      ))}
    </span>
  )
}

function Creating({ state, me, playing, dispatch }) {
  const [chosen, setChosen] = useState(null)
  const [answers, setAnswers] = useState([])
  const category = ROUNDS[state.round]
  const hand = state.hands[me] || []
  const done = state.submitted[me]
  const card = chosen && CARDS[chosen]
  const parts = card ? parseTemplate(card.template) : []
  const blanks = parts.filter((p) => p.hint).length
  const complete = card && answers.filter((a) => a?.trim()).length === blanks

  function choose(id) {
    setChosen(id)
    setAnswers([])
  }

  return (
    <>
      <p className="muted">Chapter {state.round + 1} of {ROUNDS.length}</p>
      <h1>{category}</h1>
      <p className="intro">{ROUND_INTROS[category]}</p>

      {playing && !done && !card && (
        <div className="hand">
          {hand.map((id) => (
            <button key={id} className="draw" onClick={() => choose(id)}>
              <strong>{CARDS[id].name}</strong>
              <StatLine stats={CARDS[id].stats} bonus />
            </button>
          ))}
        </div>
      )}

      {playing && !done && card && (
        <form
          className="adlib"
          onSubmit={(e) => { e.preventDefault(); if (complete) dispatch({ type: 'pick', cardId: chosen, answers }) }}
        >
          <h2>{card.name}</h2>
          <StatLine stats={card.stats} bonus />
          <p className="story">
            {parts.map((p, i) =>
              p.text !== undefined ? (
                <span key={i}>{p.text}</span>
              ) : (
                <input
                  key={i}
                  autoFocus={p.index === 0}
                  className="blank"
                  placeholder={p.hint}
                  maxLength={60}
                  value={answers[p.index] || ''}
                  onChange={(e) => {
                    const next = [...answers]
                    next[p.index] = e.target.value
                    setAnswers(next)
                  }}
                />
              ),
            )}
          </p>
          <div className="row">
            <button type="button" className="secondary" onClick={() => setChosen(null)}>Back</button>
            <button disabled={!complete}>Write it into legend</button>
          </div>
        </form>
      )}

      {done && <p className="muted">Your page is written. Waiting for the others…</p>}
      <Waiting state={state} done={state.submitted} />
      {playing && state.heroes[me].picks.length > 0 && <HeroSheet hero={state.heroes[me]} />}
    </>
  )
}

function HeroSheet({ hero, highlight }) {
  return (
    <article className={`sheet ${highlight ? 'highlight' : ''}`}>
      <h2>{heroTitle(hero)}</h2>
      <p className="muted">played by {hero.player}</p>
      <StatLine stats={heroStats(hero)} />
      {hero.picks.map(({ cardId, answers }) => (
        <p key={cardId} className="story">
          <span className="tag">{CARDS[cardId].category}: {CARDS[cardId].name}</span>
          {parseTemplate(CARDS[cardId].template).map((p, i) =>
            p.text !== undefined ? <span key={i}>{p.text}</span> : <em key={i} className="filled">{answers[p.index]}</em>,
          )}
        </p>
      ))}
    </article>
  )
}

function Reveal({ state, isHost, dispatch }) {
  const hero = state.heroes[state.order[state.revealIndex]]
  const last = state.revealIndex === state.order.length - 1
  return (
    <>
      <p className="muted">The legends are told ({state.revealIndex + 1} of {state.order.length})</p>
      <HeroSheet hero={hero} highlight />
      {isHost ? (
        <button onClick={() => dispatch({ type: 'next' })}>{last ? 'To the vote' : 'Next legend'}</button>
      ) : (
        <p className="muted">The host turns the page…</p>
      )}
    </>
  )
}

function Voting({ state, me, playing, dispatch }) {
  const voted = state.votes[me]
  return (
    <>
      <h1>The Tavern Vote</h1>
      <p className="intro">Whose legend will the bards sing tonight?</p>
      {playing && !voted && (
        <div className="hand">
          {state.order.filter((id) => id !== me).map((id) => (
            <button key={id} className="draw" onClick={() => dispatch({ type: 'vote', target: id })}>
              <strong>{heroTitle(state.heroes[id])}</strong>
              <span className="muted">{state.heroes[id].player}</span>
            </button>
          ))}
        </div>
      )}
      <Waiting state={state} done={state.votes} />
    </>
  )
}

function Results({ state, isHost, onRestart }) {
  const { counts, winners } = tally(state)
  return (
    <>
      <h1>Legends of the Tavern</h1>
      {winners.length > 0 && (
        <p className="intro">
          🏆 {winners.map((id) => heroTitle(state.heroes[id])).join(' and ')} {winners.length > 1 ? 'share' : 'takes'} the crown!
        </p>
      )}
      {state.order.map((id) => (
        <div key={id}>
          {state.order.length > 1 && <p className="muted">{counts[id]} vote{counts[id] === 1 ? '' : 's'}</p>}
          <HeroSheet hero={state.heroes[id]} highlight={winners.includes(id)} />
        </div>
      ))}
      {isHost ? <button onClick={onRestart}>Back to the lobby</button> : <p className="muted">The host can start a new tale.</p>}
    </>
  )
}
