function classifyTearForm(tear) {
  const source = tear.sourceType || ''
  const emotion = tear.emotion || ''

  if (source === 'corruption' || emotion === 'corrupted' || emotion === 'despair') {
    return 'parasite'
  }
  if (source === 'error' || source === 'degradation' || emotion === 'anxiety') {
    return 'shard'
  }
  if (source === 'blank' || emotion === 'void' || emotion === 'neutral') {
    return 'veil'
  }
  if (source === 'echo' || source === 'surveillance' || tear.isFamiliar) {
    return 'halo'
  }
  return 'embryo'
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
  const form = classifyTearForm(tear)
  const isCorrupted = tear.corrupted || tear.sourceType === 'corruption'

  return (
    <div
      className={[
        'tear-form',
        'liquid-node-shell',
        `tear-form-${form}`,
        isCorrupted ? 'is-corrupted' : '',
        tear.systemGenerated ? 'is-system' : '',
        tear.isFamiliar ? 'is-familiar' : '',
        active ? 'is-active' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      onClick={onClick}
      {...rest}
    >
      <div className="tear-form-shadow" />
      <div className="tear-form-body" />
      <div className="tear-form-core" />
      <div className="tear-form-aura" />
      <div className="tear-form-sheen" />

      {form === 'parasite' ? (
        <>
          <div className="tear-form-tendril tendril-a" />
          <div className="tear-form-tendril tendril-b" />
          <div className="tear-form-tendril tendril-c" />
        </>
      ) : null}

      {form === 'halo' ? (
        <>
          <div className="tear-form-ring ring-a" />
          <div className="tear-form-ring ring-b" />
        </>
      ) : null}

      {form === 'shard' ? (
        <>
          <div className="tear-form-fracture fracture-a" />
          <div className="tear-form-fracture fracture-b" />
        </>
      ) : null}

      {form === 'veil' ? (
        <>
          <div className="tear-form-membrane membrane-a" />
          <div className="tear-form-membrane membrane-b" />
        </>
      ) : null}

      {children}
    </div>
  )
}

export default LiquidTearNode
