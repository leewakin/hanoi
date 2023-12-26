import { usePillar } from './pillar.js'
import Plate from './Plate.js'
import { colors } from './utils.js'
import type { History, Tower, GameId } from './types.js'

// 获取节点
const canvas = document.querySelector('canvas')!
const stepEl = document.querySelector('#step')!
const plateEl = document.querySelector('#plate') as HTMLInputElement
const durationEl = document.querySelector('#duration') as HTMLInputElement

if (!canvas) throw new Error('canvas not found')

canvas.width = 500
canvas.height = 500
canvas.style.border = '1px solid #ddd'
const ctx = canvas.getContext('2d')!

const towerNum = 3,
  [currentStepEl, totalStepEl] = stepEl.children,
  restart = main

let plateNum = parseInt(plateEl.value),
  duration = parseInt(durationEl.value),
  activeGameId: GameId

plateEl.addEventListener('change', plateNumChanger)
durationEl.addEventListener('change', durationChanger)

main()

async function main() {
  const gameId = (activeGameId = window.crypto.randomUUID())

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  fillBackground()

  const historys: History[] = []

  // 初始化柱子
  const pillarWidth = parseInt(canvas.width * 0.03 + '') // 宽高没什么意义，瞎写的
  const pillarHeight = parseInt(canvas.height * 0.7 + '')
  const gapBetweenPillars =
    (canvas.width - pillarWidth * towerNum) / towerNum + 1
  const { startXs, draw: drawPillar } = usePillar(
    canvas,
    ctx,
    towerNum,
    pillarWidth,
    pillarHeight,
    gapBetweenPillars
  )
  drawPillar()

  // 初始化算法的参数
  const tower: Tower = {
    plates: [],
    index: 1,
    count: 0,
  }
  const initialTower: Tower = {
    plates: [],
    index: 0,
    count: 0,
  }
  const auxiliary: Tower = {
    plates: [],
    index: 2,
    count: 0,
  }
  initTower(initialTower)

  // 算法核心
  await move(plateNum, initialTower, tower, auxiliary)

  updateTotalStep(historys.length)

  replay(historys)

  function initTower(initialTower: Tower) {
    const plates = genPlates(plateNum)
    plates.forEach(plate => {
      const x = startXs[initialTower.index!] + (pillarWidth - plate.width) / 2
      const y = canvas.height - plate.height * (plateNum - plate.value)
      plate.pillar = initialTower.index
      plate.moveTo(x, y)
      plate.draw(ctx)
    })
    initialTower.plates = plates
    initialTower.count = plates.length
  }

  async function draw(step: History, index: number) {
    currentStepEl.textContent = index + 1 + ''
    const { from, to, plate } = step
    const top = parseInt(canvas.height * 0.15 + '')

    // 移动到顶部
    await new Promise(resolve => animate(plate, plate.x, top, resolve))

    // 横向移动到目标柱子
    const targetX = startXs[to.index] + (pillarWidth - plate.width) / 2
    await new Promise(resolve => animate(plate, targetX, top, resolve))

    // 放下
    const targetY = canvas.height - plate.height * (to.count! + 1)
    await new Promise(resolve => animate(plate, targetX, targetY, resolve))

    from.count!--
    to.count!++
  }

  async function replay(historys: History[]) {
    const length = historys.length
    for (let i = 0; i < length; i++) {
      if (gameId !== activeGameId) {
        return
      }

      await draw(historys[i], i)
    }
  }

  async function move(
    n: number,
    source: Tower,
    target: Tower,
    auxiliary: Tower
  ) {
    if (n === 1) {
      const plate = source.plates.pop()
      if (!plate) throw new Error('plate not found')
      target.plates.push(plate)
      recordStep(source, target, plate)
    } else {
      await move(n - 1, source, auxiliary, target)
      const plate = source.plates.pop()
      if (!plate) throw new Error('plate not found')
      target.plates.push(plate)
      recordStep(source, target, plate)
      await move(n - 1, auxiliary, target, source)
    }
  }

  function recordStep(source: Tower, target: Tower, plate: Plate) {
    historys.push({ from: source, to: target, plate })
  }

  function genPlates(count: number) {
    const minW = pillarWidth * 2
    const maxW = (canvas.width - minW * towerNum) / towerNum + 1

    const h = minW * 0.6

    return Array.from({ length: count }, (_, index) => {
      const value = count - index - 1
      const w = minW + ((maxW - minW) / plateNum) * value

      return new Plate(value, 0, 0, w, h, colors[index % count], 0)
    })
  }

  function fillBackground() {
    ctx.fillStyle = '#eee'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  function animate(
    plate: Plate,
    targetX: number,
    targetY: number,
    callback: (v: unknown) => void
  ) {
    // 一秒60帧
    const fps = 60
    const ratio = fps / (1000 / duration)
    const dx = (targetX - plate.x) / ratio
    const dy = (targetY - plate.y) / ratio

    function step() {
      redrawWithoutPlate(plate)
      if (
        Math.abs(targetX - plate.x) <= Math.abs(dx) &&
        Math.abs(targetY - plate.y) <= Math.abs(dy)
      ) {
        plate.moveTo(targetX, targetY)
        plate.draw(ctx)
        callback(undefined)
      } else {
        plate.moveTo(plate.x + dx, plate.y + dy)
        plate.draw(ctx)
        requestAnimationFrame(step)
      }
    }

    step()
  }

  function redrawWithoutPlate(excludedPlate: Plate) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    fillBackground()

    drawPillar()

    tower.plates.forEach(plate => {
      if (plate !== excludedPlate) {
        plate.draw(ctx)
      }
    })
  }
}

function updateTotalStep(step: number) {
  totalStepEl.textContent = step + ''
}

function plateNumChanger(e: Event) {
  const { value } = e.target as HTMLInputElement
  plateNum = parseInt(value)

  restart()
}

function durationChanger(e: Event) {
  const { value } = e.target as HTMLInputElement
  duration = parseInt(value)
}
