module.exports = class Matches {
  constructor() {
    this.total = 0
    this.wins = 0
    this.loses = 0
    this.ties = 0
  }

  addPoint(scores) {
    this.total += 1
    scores[0] > scores[1] ? this.wins += 1 : scores[0] === scores[1] ? this.ties += 1 : this.loses += 1
  }

  getMatches() {
    return { ...this }
  }
}