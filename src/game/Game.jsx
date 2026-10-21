import { useState } from 'react'
import { CARDS, ROUNDS, ROUND_INTROS, STATS, parseTemplate } from './cards'
import { heroStats, heroTitle, tally } from './engine'
import HeroModel from './HeroModel'
import Icon from './Icon'

const ROUND_ICONS = { Origin: 'castle', Weapon: 'crossed-swords', Trinket: 'swap-bag', Companion: 'wyvern', Secret: 'cloak-dagger' }

export default function Game({ state, me, isHost, dispatch, onRestart, onLeave }) {
  const playing = state.order.includes(me)
  const wide = state.phase !== 'naming'

  return (
    <main className={`card ${wide ? 'wide' : ''}`}>
      {!playing && <p className="muted center">A tale is already underway. You're watching, and you'll join the next one.</p>}
      {state.phase === 'naming' && <Naming state={state} me={me} playing={playing} dispatch={dispatch} />}
      {state.phase === 'creating' && <Creating key={state.round} state={state} me={me} playing={playing} dispatch={dispatch} />}
      {state.phase === 'reveal' && <Reveal state={state} isHost={isHost} dispatch={dispatch} />}
      {state.phase === 'voting' && <Voting state={state} me={me} playing={playing} dispatch={dispatch} />}
      {state.phase === 'results' && <Results state={state} isHost={isHost} onRestart={onRestart} />}
      <button className="link" onClick={onLeave}>Leave room</button>
    </main>
  )
}

function Heading({ icon, kicker, title, intro }) {
  return (
    <header className="heading">
      <Icon name={icon} color="#e2b448" size={52} className="crest" />
      {kicker && <p className="kicker">{kicker}</p>}
      <h1>{title}</h1>
      {intro && <p className="intro">{intro}</p>}
      <div className="flourish" />
    </header>
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
      <Heading icon="scroll-quill" kicker="Prologue" title="Every legend needs a name" intro="What will the bards call you?" />
      {playing && (
        <HeroModel hero={{ heroName: heroName || state.heroes[me].heroName, picks: [] }} seed={me} className="model small-model" />
      )}
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

function CardArt({ card }) {
  return (
    <span className="card-art">
      <Icon name={card.icon} color={card.color} size={84} />
    </span>
  )
}

function Creating({ state, me, playing, dispatch }) {
  const [chosen, setChosen] = useState(null)
  const [hovered, setHovered] = useState(null)
  const [answers, setAnswers] = useState([])
  const category = ROUNDS[state.round]
  const hand = state.hands[me] || []
  const done = state.submitted[me]
  const card = chosen && CARDS[chosen]
  const parts = card ? parseTemplate(card.template) : []
  const blanks = parts.filter((p) => p.hint).length
  const complete = card && answers.filter((a) => a?.trim()).length === blanks
  const preview = !done && (card || (hovered && CARDS[hovered]))

  function choose(id) {
    setChosen(id)
    setAnswers([])
  }

  return (
    <>
      <Heading icon={ROUND_ICONS[category]} kicker={`Chapter ${state.round + 1} of ${ROUNDS.length}`} title={category} intro={ROUND_INTROS[category]} />

      <div className="split">
        {playing && (
          <div className="model-col">
            <HeroModel hero={state.heroes[me]} seed={me} preview={preview || null} className="model" />
            <p className="model-name">{heroTitle(state.heroes[me])}</p>
            <StatLine stats={heroStats(state.heroes[me])} />
          </div>
        )}

        <div className="play-col">
          {playing && !done && !card && (
            <div className="hand">
              {hand.map((id) => (
                <button
                  key={id}
                  className="draw"
                  onClick={() => choose(id)}
                  onPointerEnter={() => setHovered(id)}
                  onPointerLeave={() => setHovered(null)}
                >
                  <CardArt card={CARDS[id]} />
                  <strong>{CARDS[id].name}</strong>
                  <StatLine stats={CARDS[id].stats} bonus />
                </button>
              ))}
            </div>
          )}

          {playing && !done && card && (
            <form
              className="adlib parchment"
              onSubmit={(e) => { e.preventDefault(); if (complete) dispatch({ type: 'pick', cardId: chosen, answers }) }}
            >
              <div className="adlib-head">
                <CardArt card={card} />
                <div>
                  <h2>{card.name}</h2>
                  <StatLine stats={card.stats} bonus />
                </div>
              </div>
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

          {done && <p className="muted center">Your page is written. Waiting for the others…</p>}
          <Waiting state={state} done={state.submitted} />
        </div>
      </div>

      {playing && state.heroes[me].picks.length > 0 && <HeroSheet hero={state.heroes[me]} />}
    </>
  )
}

function HeroSheet({ hero, highlight, seed, withModel }) {
  return (
    <article className={`sheet parchment ${highlight ? 'highlight' : ''}`}>
      {withModel && <HeroModel hero={hero} seed={seed} className="model sheet-model" />}
      <h2>{heroTitle(hero)}</h2>
      <p className="byline">played by {hero.player}</p>
      <StatLine stats={heroStats(hero)} />
      {hero.picks.map(({ cardId, answers }) => (
        <div key={cardId} className="entry">
          <Icon name={CARDS[cardId].icon} color="#5a3a1a" size={30} className="entry-icon" />
          <p className="story">
            <span className="tag">{CARDS[cardId].category}: {CARDS[cardId].name}</span>
            {parseTemplate(CARDS[cardId].template).map((p, i) =>
              p.text !== undefined ? <span key={i}>{p.text}</span> : <em key={i} className="filled">{answers[p.index]}</em>,
            )}
          </p>
        </div>
      ))}
    </article>
  )
}

function Reveal({ state, isHost, dispatch }) {
  const id = state.order[state.revealIndex]
  const last = state.revealIndex === state.order.length - 1
  return (
    <>
      <Heading icon="scroll-quill" kicker={`Legend ${state.revealIndex + 1} of ${state.order.length}`} title="The legends are told" />
      <HeroSheet key={id} hero={state.heroes[id]} seed={id} highlight withModel />
      {isHost ? (
        <button onClick={() => dispatch({ type: 'next' })}>{last ? 'To the vote' : 'Next legend'}</button>
      ) : (
        <p className="muted center">The host turns the page…</p>
      )}
    </>
  )
}

function Voting({ state, me, playing, dispatch }) {
  const voted = state.votes[me]
  return (
    <>
      <Heading icon="tavern-sign" title="The Tavern Vote" intro="Whose legend will the bards sing tonight?" />
      {playing && !voted && (
        <div className="hand">
          {state.order.filter((id) => id !== me).map((id) => (
            <button key={id} className="draw" onClick={() => dispatch({ type: 'vote', target: id })}>
              <HeroModel hero={state.heroes[id]} seed={id} className="model vote-model" />
              <strong>{heroTitle(state.heroes[id])}</strong>
              <span className="byline">{state.heroes[id].player}</span>
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
      <Heading
        icon="laurel-crown"
        title="Legends of the Tavern"
        intro={winners.length > 0 && `${winners.map((id) => heroTitle(state.heroes[id])).join(' and ')} ${winners.length > 1 ? 'share' : 'takes'} the crown!`}
      />
      <div className="results">
        {state.order.map((id) => (
          <div key={id}>
            {state.order.length > 1 && <p className="votes">{winners.includes(id) && '🏆 '}{counts[id]} vote{counts[id] === 1 ? '' : 's'}</p>}
            <HeroSheet hero={state.heroes[id]} seed={id} highlight={winners.includes(id)} withModel />
          </div>
        ))}
      </div>
      {isHost ? <button onClick={onRestart}>Back to the tavern</button> : <p className="muted center">The host can start a new tale.</p>}
    </>
  )
}
