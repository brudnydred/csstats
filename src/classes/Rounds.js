module.exports = class Rounds {
  constructor() {
    this.total = 0
    this.won = 0
    this.lost = 0
  }

  addTotal(rounds) {
    this.total += rounds
  }

  addWonLost(scores) {
    this.won += scores[0]
    this.lost += scores[1]
  }

  getRounds() {
    return { ...this }
  }
}