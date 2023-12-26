import type Plate from './Plate'

export interface History {
  from: Tower
  to: Tower
  plate: Plate
}

export interface Tower {
  plates: Plate[]
  index: number
  count: number
}

export type GameId = ReturnType<Window['crypto']['randomUUID']>
