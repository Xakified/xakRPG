import icons from './icons.json'

// A game-icons.net icon as a nested <svg>, usable inside other SVGs or HTML.
export default function Icon({ name, color, size, x, y, className, style }) {
  return (
    <svg
      className={className}
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      style={{ color, ...style }}
      dangerouslySetInnerHTML={{ __html: icons[name] }}
    />
  )
}
