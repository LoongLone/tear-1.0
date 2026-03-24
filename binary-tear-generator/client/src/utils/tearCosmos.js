export function hashString(input = '') {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function createCosmosCoords(tearId = '') {
  const seed = hashString(tearId)
  const angle = (seed % 360) * (Math.PI / 180)
  const radius = 120 + (seed % 900)

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  }
}

export function enrichTearForCosmos(tear) {
  const seed = hashString(tear.tearId || tear.id || '')
  const coords = createCosmosCoords(tear.tearId || tear.id || '')

  return {
    ...tear,
    cosmosX: tear.cosmosX ?? coords.x,
    cosmosY: tear.cosmosY ?? coords.y,
    energy: tear.energy ?? (44 + (seed % 34)),
    contamination: tear.contamination ?? (tear.corrupted ? 66 + (seed % 20) : 8 + (seed % 18)),
    resonance: tear.resonance ?? 0,
    resistance: tear.resistance ?? (seed % 12),
    dryness: tear.dryness ?? (seed % 16),
    state: tear.state ?? 'alive',
    luminosity: tear.luminosity ?? (0.42 + (seed % 42) / 100),
    mass: tear.mass ?? (0.4 + (seed % 35) / 100),
    deathProgress: tear.deathProgress ?? 0,
    justDried: tear.justDried ?? false,
  }
}

export function resonateTear(tear) {
  if (tear.state === 'dried') return tear

  const nextEnergy = Math.min(100, (tear.energy || 0) + 10)
  const nextDryness = Math.max(0, (tear.dryness || 0) - 12)
  const nextResistance = Math.min(100, (tear.resistance || 0) + 4)
  const nextResonance = (tear.resonance || 0) + 1

  return {
    ...tear,
    resonance: nextResonance,
    resistance: nextResistance,
    energy: nextEnergy,
    dryness: nextDryness,
    luminosity: Math.min(1, (tear.luminosity || 0.4) + 0.06),
    state: 'alive',
    justDried: false,
  }
}

export function cleanseTear(tear, actorTearId = '', ownerTearId = '') {
  if (tear.state === 'dried') return tear
  if (actorTearId && ownerTearId && actorTearId === ownerTearId) return tear

  return {
    ...tear,
    contamination: Math.max(0, (tear.contamination || 0) - 14),
    energy: Math.min(100, (tear.energy || 0) + 4),
    dryness: Math.max(0, (tear.dryness || 0) - 4),
    luminosity: Math.min(1, (tear.luminosity || 0.4) + 0.03),
    state: 'alive',
    justDried: false,
  }
}

export function tickTearState(tear) {
  if (tear.state === 'dried') {
    return {
      ...tear,
      justDried: false,
      deathProgress: 1,
    }
  }

  const resistance = tear.resistance || 0
  const contamination = tear.contamination || 0
  const energy = tear.energy || 0
  const dryness = tear.dryness || 0

  const ambientPollution = 3
  const pollutionGain = Math.max(0, ambientPollution - resistance * 0.035)
  const contaminationPressure = contamination > 55 ? 1 : contamination > 30 ? 0.5 : 0

  const nextContamination = Math.min(100, contamination + pollutionGain)
  const nextEnergy = Math.max(0, energy - 1 - contaminationPressure)
  const nextDryness = Math.min(100, dryness + 1 + contaminationPressure * 0.7)

  const dried =
    nextDryness >= 100 ||
    (nextEnergy <= 0 && nextContamination >= 60)

  return {
    ...tear,
    contamination: Number(nextContamination.toFixed(2)),
    energy: Number(nextEnergy.toFixed(2)),
    dryness: Number(nextDryness.toFixed(2)),
    state: dried ? 'dried' : 'alive',
    justDried: dried && tear.state !== 'dried',
    deathProgress: dried ? 1 : 0,
    luminosity: dried
      ? 0.08
      : Math.max(0.08, (tear.luminosity || 0.4) - 0.006 - contaminationPressure * 0.003),
  }
}

export function acknowledgeDryEvent(tear) {
  if (!tear.justDried) return tear
  return {
    ...tear,
    justDried: false,
  }
}

export function getTearVisualState(tear) {
  if (tear.state === 'dried') return 'dried'
  if ((tear.dryness || 0) > 78) return 'withering'
  if ((tear.contamination || 0) > 62) return 'stained'
  if ((tear.dryness || 0) > 52) return 'fragile'
  if ((tear.resonance || 0) > 8) return 'echo'
  if ((tear.energy || 0) > 72) return 'bright'
  return 'normal'
}

export function createResonanceShareText(tear, language = 'zh') {
  if (language === 'zh') {
    if (tear.state === 'dried') {
      return `你试图照亮一颗已经干涸的泪星 ${tear.tearId}`
    }
    if ((tear.dryness || 0) > 72) {
      return `你照亮了一颗即将干涸的泪星 ${tear.tearId}`
    }
    return `你在宇宙里共振了一颗泪星 ${tear.tearId}`
  }

  if (tear.state === 'dried') {
    return `You tried to reach a dried tear star ${tear.tearId}`
  }
  if ((tear.dryness || 0) > 72) {
    return `You resonated with a fading tear star ${tear.tearId}`
  }
  return `You resonated with a tear star ${tear.tearId}`
}
