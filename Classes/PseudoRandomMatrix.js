export default class PseudoRandomMatrix {
	constructor(dimensions) {
		if(dimensions === 1) {
			return new Proxy(this, {
				get(target, key) {
					if(!target[key])
						target[key] = Math.random()
					return target[key]
				}
			})
		}
		return new Proxy(this, {
			get(target, key) {
				if(!target[key])
					target[key] = new PseudoRandomMatrix(dimensions - 1)
				return target[key]
			}
		})
	}
}