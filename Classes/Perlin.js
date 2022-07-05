import PseudoRandomMatrix from "./PseudoRandomMatrix.js"
import Vector from "./Vector.js"

export default class Perlin {
	matrix = new PseudoRandomMatrix(2)

	constructor({ cell = 100 } = {}) {
		this.cell = cell
	}

	noise(x, y) {
		// cell size
		const xCell = x / this.cell
		const yCell = y / this.cell

		// clamp
		const xInt = Math.floor(xCell)
		const yInt = Math.floor(yCell)
		const xFrac = xCell - xInt
		const yFrac = yCell - yInt

		// random
		const aa = Perlin.getGradientVector(this.matrix[xInt][yInt])
		const ab = Perlin.getGradientVector(this.matrix[xInt][yInt+1])
		const ba = Perlin.getGradientVector(this.matrix[xInt+1][yInt])
		const bb = Perlin.getGradientVector(this.matrix[xInt+1][yInt+1])

		// lerp
		const x1 = Perlin.lerp(
			aa.dot(new Vector(xFrac, yFrac)),
			ba.dot(new Vector(xFrac-1, yFrac)),
			Perlin.fade(xFrac)
		)
		const x2 = Perlin.lerp(
			ab.dot(new Vector(xFrac, yFrac-1)),
			bb.dot(new Vector(xFrac-1, yFrac-1)),
			Perlin.fade(xFrac)
		)
		const result = Perlin.lerp(x1, x2, Perlin.fade(yFrac))

		// Normalize
		return (result + 1) / 2
	}

	static fade(t){
		return ((6*t - 15)*t + 10) * (t**3)
	}

	static lerp(from, to, t) {
		return from + t * (to - from);
	}

	static getGradientVector(hash) {
		const vec = Perlin.gradientVectors[Math.floor(hash * 8)]
		return vec
	}

	static gradientVectors = [
		new Vector(-1, -1),
		new Vector(-1,  0),
		new Vector(-1,  1),
		new Vector( 0, -1),
		new Vector( 0,  1),
		new Vector( 1, -1),
		new Vector( 1,  0),
		new Vector( 1,  1),
	]
}