function classifyTearState(tear) {
  const source = tear.sourceType || ''
  const emotion = tear.emotion || ''
  const contamination = tear.corrupted || source === 'corruption'

  if (contamination) return 'stained'
  if (source === 'error' || source === 'degradation' || emotion === 'anxiety') return 'fractured'
  if (source === 'echo' || source === 'surveillance' || tear.isFamiliar) return 'echo'
  if (source === 'blank' || emotion === 'void') return 'clear'
  return 'heavy'
}

function LiquidTearNode({
  tear,
  active = false,
  onClick,
  children,
  className = '',
  style,
  ...rest
}) {
  const state = classifyTearState(tear)

  return (
    <div
      className={[
        'tear-liquid',
        `tear-liquid-${state}`,
        active ? 'is-active' : '',
        tear.systemGenerated ? 'is-system' : '',
        tear.isFamiliar ? 'is-familiar' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      onClick={onClick}
      {...rest}
    >
      <div className="tear-liquid-shadow" />
      <div className="tear-liquid-body" />
      <div className="tear-liquid-core" />
      <div className="tear-liquid-sheen" />
      <div className="tear-liquid-aura" />

      {state === 'fractured' ? (
        <>
          <div className="tear-liquid-crack crack-a" />
          <div className="tear-liquid-crack crack-b" />
        </>
      ) : null}

      {state === 'stained' ? (
        <>
          <div className="tear-liquid-stain stain-a" />
          <div className="tear-liquid-stain stain-b" />
        </>
      ) : null}

      {state === 'echo' ? (
        <>
          <div className="tear-liquid-ring ring-a" />
          <div className="tear-liquid-ring ring-b" />
        </>
      ) : null}

      {children}
    </div>
  )
}

export default LiquidTearNode
