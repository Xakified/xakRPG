import { useState } from 'react'
import { CARDS, ROUNDS, ROUND_INTROS } from './cards'
import { heroSpec, heroStats, heroTitle, legend, tally } from './engine'
import Forge from './Forge'
import HeroViewer from './HeroViewer'
import Icon from './Icon'
import { AbilityBlock, Bonus } from './Stats'

const ROUND_ICONS = { Weapon: 'crossed-swords', Armor: 'breastplate', Companion: 'wyvern', Relic: 'crystal-ball', Secret: 'cloak-dagger' }

export default function Game({ state, me, isHost, dispatch, onRestart, onLeave }) {
  const playing = state.order.includes(me)

  return (
    <main className="card wide">
      {!playing && <p className="muted center">A tale is already underway. You're watching, and you'll join the next one.</p>}
      {state.phase === 'forge' && (
        <>
          <Heading icon="anvil-impact" kicker="Prologue" title="Forge your hero" intro="Every legend starts somewhere." />
          {playing && <Forge hero={state.heroes[me]} done={state.submitted[me]} onSubmit={(hero) => dispatch({ type: 'forge', ...hero })} />}
          <Waiting state={state} done={state.submitted} />
        </>
      )}
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
          <span className={done[id] ? 'ready' : 'muted'}>{done[id] ? '✓ ready' : 'choosing…'}</span>
        </li>
      ))}
    </ul>
  )
}

function CardArt({ card, size = 84 }) {
  return (
    <span className="card-art">
      <Icon name={card.icon} color={card.color} size={size} />
    </span>
  )
}

function Creating({ state, me, playing, dispatch }) {
  const [chosen, setChosen] = useState(null)
  const category = ROUNDS[state.round]
  const hand = state.hands[me] || []
  const done = state.submitted[me]
  const hero = state.heroes[me]
  const preview = !done && chosen ? CARDS[chosen] : null

  return (
    <>
      <Heading icon={ROUND_ICONS[category]} kicker={`Chapter ${state.round + 1} of ${ROUNDS.length}`} title={category} intro={ROUND_INTROS[category]} />
      <div className="split">
        {playing && (
          <div className="model-col">
            <HeroViewer spec={heroSpec(hero, preview)} className="viewer" />
            <p className="model-name">{heroTitle(hero)}</p>
            <AbilityBlock stats={heroStats({ ...hero, picks: preview ? [...hero.picks, { cardId: preview.id }] : hero.picks })} />
          </div>
        )}
        <div className="play-col">
          {playing && !done && (
            <>
              <p className="muted center small">Tap a card to try it on your hero, then claim it.</p>
              <div className="hand carousel">
                {hand.map((id) => (
                  <button key={id} className={`draw ${chosen === id ? 'on' : ''}`} onClick={() => setChosen(id)}>
                    <CardArt card={CARDS[id]} />
                    <strong>{CARDS[id].name}</strong>
                    <Bonus stats={CARDS[id].stats} />
                    <span className="flavor">…{CARDS[id].line}</span>
                  </button>
                ))}
              </div>
              <button disabled={!chosen} onClick={() => dispatch({ type: 'pick', cardId: chosen })}>
                {chosen ? `Claim the ${CARDS[chosen].name}` : 'Choose a card'}
              </button>
            </>
          )}
          {done && <p className="muted center">Chosen. Waiting for the others…</p>}
          <Waiting state={state} done={state.submitted} />
        </div>
      </div>
    </>
  )
}

function HeroSheet({ hero, highlight, viewer = true }) {
  return (
    <article className={`sheet parchment ${highlight ? 'highlight' : ''}`}>
      {viewer && <HeroViewer spec={heroSpec(hero)} className="viewer sheet-viewer" autoRotate />}
      <h2>{heroTitle(hero)}</h2>
      <p className="byline">played by {hero.player}</p>
      <AbilityBlock stats={heroStats(hero)} />
      {legend(hero).map((line, i) => (
        <div key={i} className="entry">
          {i > 0 && <Icon name={CARDS[hero.picks[i - 1].cardId].icon} color="#5a3a1a" size={28} className="entry-icon" />}
          <p className="story">
            {i > 0 && <span className="tag">{CARDS[hero.picks[i - 1].cardId].category}: {CARDS[hero.picks[i - 1].cardId].name}</span>}
            {line}
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
      <HeroSheet key={id} hero={state.heroes[id]} highlight />
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
        <div className="hand carousel">
          {state.order.filter((id) => id !== me).map((id) => (
            <button key={id} className="draw" onClick={() => dispatch({ type: 'vote', target: id })}>
              <HeroViewer spec={heroSpec(state.heroes[id])} className="viewer vote-viewer" interactive={false} autoRotate />
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
        intro={winners.length > 0 && `${winners.map((id) => state.heroes[id].heroName).join(' and ')} ${winners.length > 1 ? 'share' : 'takes'} the crown!`}
      />
      <div className="results">
        {state.order.map((id) => (
          <div key={id}>
            {state.order.length > 1 && <p className="votes">{winners.includes(id) && '🏆 '}{counts[id]} vote{counts[id] === 1 ? '' : 's'}</p>}
            <HeroSheet hero={state.heroes[id]} highlight={winners.includes(id)} />
          </div>
        ))}
      </div>
      {isHost ? <button onClick={onRestart}>Back to the tavern</button> : <p className="muted center">The host can start a new tale.</p>}
    </>
  )
}
