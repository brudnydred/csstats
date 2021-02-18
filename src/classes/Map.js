module.exports = class Map {
  constructor(name) {
    this.name = name
    this.total = 0
    this.wins = 0
    this.loses = 0
    this.ties = 0
  }

  setPoint(scores) {
    this.total += 1
    scores[0] > scores[1] ? this.wins += 1 : scores[0] === scores[1] ? this.ties += 1 : this.loses += 1
  }

  getMap() {
    return { ...this }
  }
}