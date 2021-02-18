class Player {
  constructor(steamID, name) {
    this.steamID = steamID
    this.name = name
    this.stats = {}
  }

  setStats(s) {
    this.stats = s
  }

  getPlayer() {
    return { ...this }
  }
}

class MatchPlayer extends Player {
  #sides

  constructor(steamID, name) {
    super(steamID, name)
    this.#sides = []
  }

  pushSide(n) {
    this.#sides.push(n)
  }

  getSide(i) {
    return this.#sides[i]
  }
}

class TotalPlayer extends Player {
  constructor(steamID, name) {
    super(steamID, name)
  }

  setLatestName(n) {
    this.name = n
  }
} 

module.exports = { 
  MatchPlayer,
  TotalPlayer, 
}