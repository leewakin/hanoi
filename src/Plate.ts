export default class Plate {
  value: number
  x: number
  y: number
  width: number
  height: number
  color: string
  pillar: number

  constructor(
    value: number,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    pillar: number
  ) {
    this.value = value
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.color = color
    this.pillar = pillar
  }

  draw(ctx: CanvasRenderingContext2D) {
    const radius = this.height / 2
    ctx.beginPath()
    ctx.moveTo(this.x + radius, this.y)
    ctx.lineTo(this.x + this.width - radius, this.y)
    ctx.arcTo(
      this.x + this.width,
      this.y,
      this.x + this.width,
      this.y + radius,
      radius
    )
    ctx.lineTo(this.x + this.width, this.y + this.height - radius)
    ctx.arcTo(
      this.x + this.width,
      this.y + this.height,
      this.x + this.width - radius,
      this.y + this.height,
      radius
    )
    ctx.lineTo(this.x + radius, this.y + this.height)
    ctx.arcTo(
      this.x,
      this.y + this.height,
      this.x,
      this.y + this.height - radius,
      radius
    )
    ctx.lineTo(this.x, this.y + radius)
    ctx.arcTo(this.x, this.y, this.x + radius, this.y, radius)
    ctx.closePath()

    ctx.fillStyle = this.color
    ctx.fill()

    // 添加反光效果
    const gradient = ctx.createRadialGradient(
      this.x + this.width / 4,
      this.y + this.height / 4,
      0,
      this.x + this.width / 4,
      this.y + this.height / 4,
      this.width / 4
    )
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.ellipse(
      this.x + this.width / 4,
      this.y + this.height / 4,
      this.width / 4,
      this.height / 4,
      0,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }

  moveTo(x: number, y: number) {
    this.x = x
    this.y = y
  }
}
