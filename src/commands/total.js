const fs = require('fs')
const config = require('../../config.json')
const c = require('../consts')
const argv = require('../argv') 
const { saveFile } = require('../helpers')

const { TotalPlayer } = require('../classes/Player')
const Map = require('../classes/Map')
const Rounds = require('../classes/Rounds')
const Matches = require('../classes/Matches')
const { TotalStats } = require('../classes/Stats')

const findById = a1 => a2 => a2.find(v => v.steamID === a1.steamID)

module.exports = () => {
  const matchesPath = `${argv.c && config.outputDir ? config.outputDir : c.OUTPUT_PATH}/matches`
  const matchesFiles = fs.readdirSync(matchesPath).filter(f => f.match(/match_\d+\.json/g))
  const matchesArray = []
  const players = []
  const stats = []
  const maps = []
  const rounds = new Rounds()
  const matches = new Matches()

  if (!matchesFiles) {
    console.error(`There aren't any matches files.`)
    return
  }

  matchesFiles.map((f) => {
    matchesArray.push(JSON.parse(fs.readFileSync(`${matchesPath}/${f}`)))
  })

  matchesArray.map(({ info, teams }) => {
    let myTeam = teams.map(({ members }) => members.map(({ steamID }) => steamID)).findIndex(a => a.some(i => i === config.myID))
    
    rounds.addTotal(info.rounds)

    if (!maps.some(m => m.name === info.map)) {
      maps.push(new Map(info.map))
    }

    maps.map(map => {
      if (map.name === info.map) {
        let scores = myTeam === 0 ? [teams[0].score, teams[1].score] : [teams[1].score, teams[0].score]
        map.setPoint(scores)
        rounds.addWonLost(scores)
        matches.addPoint(scores)
      }
    })

    teams.map(team => {
      if (team.members.length !== 0) {
        team.members.map(member => {
          if (players.some(o => o.steamID === member.steamID)) return
          players.push(new TotalPlayer(member.steamID, member.name))
          stats.push(new TotalStats(member.steamID))
        })
      }
    })
  })

  matchesArray.map(({ teams, info }) => {
    teams.map(({ members }) => {
      if (members.length !== 0) {
        members.map(member => {
          const findInArray = findById(member)

          const _player = findInArray(players)
          if (_player.name !== member.name) _player.setLatestName(member.name)

          const _stats = findInArray(stats)
          _stats.reduce(member.stats)
          _stats.addRounds(info.rounds)
        })
      }
    })
  })

  stats.map(s => s.countAvg())

  stats.map(s => {
    const player = players.find(p => p.steamID === s.steamID)
    player.setStats(s.getStats())
  })

  const data = {
    matches: matches.getMatches(),
    maps: maps.map(m => m.getMap()),
    rounds: rounds.getRounds(),
    players: players.map(p => p.getPlayer())
  }

  console.log(data)

  if (argv.j) {
    saveFile(data, 'totals', 'total')
  }
}