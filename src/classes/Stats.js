class Stats {
  #roundsPlayed

  constructor() {
    this.kills = 0
    this.assists = 0
    this.deaths = 0
    this.headShotKills = 0
    this.damage = 0
    this.utilityDamage = 0
    this.threeK = 0
    this.fourK = 0
    this.fiveK = 0
    this.kd = 0
    this.adr = 0
    this.hsp = 0
    this.flashedPlayers = 0
    this.mvps = 0
    this.weapons = {},
    this.#roundsPlayed = 0
    // this.mvpsReasons = {}
  }

  countAvg() {
    this.kd = +(this.kills / this.deaths).toFixed(2)
    this.adr = +(this.damage / this.#roundsPlayed).toFixed(2)
    this.hsp = +(this.headShotKills / this.kills).toFixed(2)
  }

  addRounds(r) {
    this.#roundsPlayed += r
  }

  setRounds(r) {
    this.#roundsPlayed = r
  }

  getStats() {
    return { ...this }
  }
}

class MatchStats extends Stats {
  #steamID

  constructor(steamID) {
    super()
    this.#steamID = steamID
    this.score = 0
  }

  get steamID() {
    return this.#steamID
  }

  update(o) {
    Object.entries(o).map(([key, value]) => {
      this[key] = value
    })
  }

  pushWeapon(n) {
    this.weapons.hasOwnProperty(n) ? this.weapons[n] += 1 : this.weapons[n] = 1
  }
}

class TotalStats extends Stats {
  #steamID
  
  constructor(steamID) {
    super()
    this.#steamID = steamID
  }

  get steamID() {
    return this.#steamID
  }

  reduce(o) {
    Object.entries(o).map(([key, value]) => {
      if (['kd', 'adr', 'hsp', 'steamID', 'name', 'score'].includes(key) || this[key] === undefined) return
      if (typeof value === 'object') {
        Object.entries(value).map(([innerKey, innerValue]) => {
          this[key].hasOwnProperty(innerKey) && this[key] !== undefined ? this[key][innerKey] += innerValue : this[key][innerKey] = innerValue
        })
        return
      }
      this[key] += value
    })
  }
}

module.exports = {
  MatchStats,
  TotalStats
}