import Entity from './Classes/Entity.js'
import Vector from './Classes/Vector.js'

const WORLD_TIME_SPEED = 1

const canvas = document.querySelector('canvas')
if(!canvas)
	throw new Error('No canvas found')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const ctx = canvas.getContext('2d')
if(!ctx)
	throw new Error('No context found')

/**
 * @param {CanvasRenderingContext2D} ctx
 */
void function (ctx) {
	const entity = new Entity(ctx)
	const mousePos = new Vector(0, 0)
	update(ctx, mousePos, entity)
	draw(ctx, mousePos, entity)
}(ctx)

function update(ctx, mousePos, entity) {
	window.addEventListener('pointermove', event => {
		mousePos.x = event.clientX
		mousePos.y = event.clientY
	})
	function loop(lastTime) {
		requestAnimationFrame((time) => {
			const modifiedTime = time * WORLD_TIME_SPEED
			const delta = lastTime ? modifiedTime - lastTime : 0
			entity.update(ctx, mousePos, delta, modifiedTime)
			loop(modifiedTime)
		})
	}
	loop(0)
}

function draw(ctx, mousePos, entity) {
	function loop() {
		requestAnimationFrame(() => {
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
			entity.draw(ctx, mousePos)
			loop()
		})
	}
	loop()
}
