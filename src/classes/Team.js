module.exports = class Team {
  #sidesIndexes

  constructor(name, sidesIndexes) {
    this.name = name
    this.#sidesIndexes = sidesIndexes
    this.sides = []
    this.members = []
    this.score = 0
    this.firstHalf = 0
    this.secondHalf = 0
  }

  update(obj) {
    Object.entries(obj).map(([key, value]) => {
      this[key] = value
    })
  }

  addMember(m) {
    this.members.push(m)
  }

  getSideIndex(i) {
    return this.#sidesIndexes[i]
  }

  setSides() {
    this.sides = this.#sidesIndexes[0] === 2 ? ['T', 'CT'] : ['CT', 'T']
  }

  geTeams() {
    return { ...this }
  }
}