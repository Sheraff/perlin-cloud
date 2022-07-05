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
		const perlin = new Perlin({cell: 50})

		const canvas = document.createElement('canvas')
		canvas.width = width
		canvas.height = height
		this.ctx2 = canvas.getContext('2d')
		document.body.appendChild(canvas)

		{
			for (let x = 0; x < width; x += 1) {
				for (let y = 0; y < height; y += 1) {
					const value = perlin(x, y)
					setPoint(this.image, x, y, [255, 255, 255, value * 255])
				}
			}
		}

		createImageBitmap(this.image).then(bitmap => this.bitmap = bitmap)
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

		this.cress = []
		for (let x = 0; x < width; x+=10) {
			const pointA = getPoint(
				this.image,
				Math.round(xOrigin + 30 * Math.cos(time / 1000 + x / width * Math.PI * 2)),
				Math.round(yOrigin + 30 * Math.sin(time / 1000 + x / width * Math.PI * 2)),
			)
			const pointB = getPoint(
				this.image,
				Math.round(xOrigin + 20 * Math.cos(-time / 1500 + x / width * Math.PI * 2)),
				Math.round(yOrigin + 20 * Math.sin(-time / 1500 + x / width * Math.PI * 2)),
			)
			const y = pointA[3] + pointB[3] / 1.5
			this.cress.push(y)
		}
		
		this.splat = []
		for (let x = 0; x < width; x+=10) {
			const pointA = getPoint(
				this.image,
				Math.round(xOrigin + 30 * Math.cos(time / 1000 + x / width * Math.PI * 2)),
				Math.round(yOrigin + 30 * Math.sin(time / 1000 + x / width * Math.PI * 2)),
			)
			const pointB = getPoint(
				this.image,
				Math.round(xOrigin + 300 * Math.cos(-time / 1500 + x / width * Math.PI * 2)),
				Math.round(yOrigin + 300 * Math.sin(-time / 1500 + x / width * Math.PI * 2)),
			)
			const y = pointA[3] + pointB[3] / 4
			this.splat.push(y)
		}
		
		this.head = []
		for (let x = 0; x < width; x+=10) {
			const pointA = getPoint(
				this.image,
				Math.round(xOrigin - 50 + 30 * Math.cos(-time / 1000 + x / width * Math.PI * 2)),
				Math.round(yOrigin + 50 + 30 * Math.sin(-time / 1000 + x / width * Math.PI * 2)),
			)
			const pointB = getPoint(
				this.image,
				Math.round(xOrigin - 50 + 30 * Math.cos(time / 1000 + x / width * Math.PI * 2)),
				Math.round(yOrigin + 50 + 30 * Math.sin(time / 1000 + x / width * Math.PI * 2)),
			)
			const y = (pointA[3] + pointB[3] / 1.5) / 1.3
			this.head.push(y)
		}
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Vector} mousePos
	 */
	draw(ctx, mousePos){
		const {width, height} = ctx.canvas
		const cressPath = new Path2D()
		{
			cressPath.moveTo(
				width / 2 + this.cress[0] * Math.cos(0),
				height / 2 + this.cress[0] * Math.sin(0),
			)
			const fractionalAngle = Math.PI * 2 / this.cress.length
			for (let i = 1; i < this.cress.length; i++) {
				const value = this.cress[i]
				cressPath.lineTo(
					width / 2 + value * Math.cos(fractionalAngle * i),
					height / 2 + value * Math.sin(fractionalAngle * i),
				)
			}
			cressPath.closePath()
			ctx.save()
			ctx.filter = 'blur(10px)'
			ctx.fill(cressPath)
			ctx.filter = 'blur(0px)'
			ctx.restore()
		}
		
		{
			ctx.beginPath()
			ctx.moveTo(
				width / 2 + this.splat[0] * Math.cos(0),
				-200 + height / 2 + this.splat[0] * Math.sin(0),
			)
			const fractionalAngle = Math.PI * 2 / this.splat.length
			for (let i = 1; i < this.splat.length; i++) {
				const value = this.splat[i]
				ctx.lineTo(
					width / 2 + value * Math.cos(fractionalAngle * i),
					-200 + height / 2 + value * Math.sin(fractionalAngle * i) * 0.5,
				)
			}
			ctx.closePath()
			ctx.save()
			ctx.globalCompositeOperation = 'source-in'
			ctx.fillStyle = '#000'
			this.ctx2.filter = 'blur(2px)'
			ctx.fill()
			this.ctx2.filter = 'blur(0px)'
			ctx.restore()
		}
		
		{
			const headPath = new Path2D()
			headPath.moveTo(
				width / 2 + this.head[0] * Math.cos(0),
				-230 + height / 2 + this.head[0] * Math.sin(0),
			)
			const fractionalAngle = Math.PI * 2 / this.head.length
			for (let i = 1; i < this.head.length; i++) {
				const value = this.head[i]
				headPath.lineTo(
					width / 2 + value * Math.cos(fractionalAngle * i),
					-200 + height / 2 + value * Math.sin(fractionalAngle * i),
				)
			}
			headPath.closePath()
			this.ctx2.clearRect(0, 0, width, height)
			this.ctx2.filter = 'blur(10px)'
			this.ctx2.fill(cressPath)
			this.ctx2.filter = 'blur(0px)'
			this.ctx2.save()
			this.ctx2.globalCompositeOperation = 'source-out'
			this.ctx2.fillStyle = '#222'
			this.ctx2.filter = 'blur(5px)'
			this.ctx2.fill(headPath)
			this.ctx2.filter = 'blur(0px)'
			this.ctx2.restore()
			// const imageData = this.ctx2.getImageData(0, 0, width, height)
			// ctx.putImageData(imageData, 0, 0)
		}
	}
}