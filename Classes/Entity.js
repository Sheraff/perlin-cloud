import Vector from './Vector.js'
import Perlin from './Perlin.js'

/**
 * @param {ImageData} imageData 
 * @param {number} x
 * @param {number} y
 */
function xyToLinear(imageData, x, y) {
	const linearX = 4 * x
	const singleLine = 4 * imageData.width
	const linearXY = singleLine * y + linearX
	return linearXY
}

/**
 * @param {ImageData} imageData 
 * @param {number} x
 * @param {number} y
 * @param {[number, number, number, number]} values
 */
function setPoint(imageData, x, y, values) {
	const linearXY = xyToLinear(imageData, x, y)
	imageData.data[linearXY + 0] = values[0]
	imageData.data[linearXY + 1] = values[1]
	imageData.data[linearXY + 2] = values[2]
	imageData.data[linearXY + 3] = values[3]
}

/**
 * @param {ImageData} imageData 
 * @param {number} x
 * @param {number} y
 */
function getPoint(imageData, x, y) {
	const linearXY = xyToLinear(imageData, x, y)
	return [
		imageData.data[linearXY + 0],
		imageData.data[linearXY + 1],
		imageData.data[linearXY + 2],
		imageData.data[linearXY + 3],
	]
}

export default class Cloud {
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	constructor(ctx) {
		const {width, height} = ctx.canvas
		this.image = new ImageData(width, height)
		this.perlin = new Perlin({cell: 50})

		{
			for (let x = 0; x < width; x += 1) {
				for (let y = 0; y < height; y += 1) {
					const value = this.perlin.noise(x, y)
					setPoint(this.image, x, y, [255, 255, 255, value * 255])
				}
			}
		}
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Vector} mousePos
	 * @param {number} dt
	 * @param {number} time
	 */
	update(ctx, mousePos, dt, time){
		const {width, height} = ctx.canvas

		const xOrigin = this.image.width / 2
		const yOrigin = this.image.height / 2

		this.values = []
		for (let x = 0; x < width; x+=10) {
			const pointA = getPoint(
				this.image,
				Math.round(xOrigin + 30 * Math.cos(time / 1000 + x / width * Math.PI * 2)),
				Math.round(yOrigin + 30 * Math.sin(time / 1000 + x / width * Math.PI * 2)),
			)
			const pointB = getPoint(
				this.image,
				Math.round(xOrigin + 300 * Math.cos(-time / 1000 + x / width * Math.PI * 2)),
				Math.round(yOrigin + 300 * Math.sin(-time / 1000 + x / width * Math.PI * 2)),
			)
			const y = pointA[3] + pointB[3] / 4
			this.values.push(y)
		}
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Vector} mousePos
	 */
	draw(ctx, mousePos){
		// ctx.putImageData(this.image, 0, 0)
		const {width, height} = ctx.canvas
		ctx.beginPath()
		ctx.moveTo(
			width / 2 + this.values[0] * Math.cos(0),
			height / 2 + this.values[0] * Math.sin(0),
		)
		const fractionalAngle = Math.PI * 2 / this.values.length
		for (let i = 1; i < this.values.length; i++) {
			const value = this.values[i]
			ctx.lineTo(
				width / 2 + value * Math.cos(fractionalAngle * i),
				height / 2 + value * Math.sin(fractionalAngle * i),
			)
		}
		ctx.closePath()
		ctx.stroke()
	}
}