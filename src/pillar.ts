export function usePillar(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  count: number,
  width: number,
  height: number,
  gap: number
) {
  const /** 每根柱子的起始x坐标 */ startXs: number[] = []

  const startX = gap / 2
  const startY = canvas.height - height

  function draw() {
    for (let i = 0; i < count; i++) {
      const itemStartX =
        startXs[i] || (startXs[i] = parseInt(`${startX + i * gap}`))
      drawItem(itemStartX, startY, width, height)
    }
  }

  function drawItem(x: number, y: number, width: number, height: number) {
    ctx.fillStyle = '#A65E00'
    ctx.fillRect(x, y, width, height)
  }

  return {
    startXs,
    draw,
  }
}
