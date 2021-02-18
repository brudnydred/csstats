const fs = require('fs')
const fsp = require('fs/promises')
const demofile = require('demofile')
const c = require('../consts')
const argv = require('../argv')
const config = require('../../config.json')
const { saveFile } = require('../helpers')

const Team = require('../classes/Team')
const { MatchPlayer } = require('../classes/Player')
const { MatchStats } = require('../classes/Stats')

let players = []
let stats = []
let teams = [new Team('Team 1', [c.T, c.CT]), new Team('Team 2', [c.CT, c.T])]

const reduceData = (prev, next) => {
  return {
    kills: prev.kills += next.kills,
    assists: prev.assists += next.assists,
    deaths: prev.deaths += next.deaths,
    headShotKills: prev.headShotKills += next.headShotKills,
    damage: prev.damage += next.damage,
    threeK: next.kills === 3 ? prev.threeK += 1 : prev.threeK += 0,
    fourK: next.kills === 4 ? prev.fourK += 1 : prev.fourK += 0,
    fiveK: next.kills === 5 ? prev.fiveK += 1 : prev.fiveK += 0,
  }
}

const roundEnd = rN => team => {
  team.members.map(p => {
    stats.map(s => {
      if (p.steamId === s.steamID) {
        const stats = p.matchStats.reduce((prev, curr) => reduceData(prev, curr), { ...c.INIT_STATS })
        const flashedPlayers = Object.values(p.props.m_iMatchStats_EnemiesFlashed).reduce((p, c) => p + c, 0)
        const utilityDamage = Object.values(p.props.m_iMatchStats_UtilityDamage).reduce((p, c) => p + c, 0) 
        const score = p.score
        const mvps = p.mvps
        s.update({ ...stats, flashedPlayers, utilityDamage, score, mvps })
      }
    })

    players.map(o => {
      if (p.steamId === o.steamID) {
        if (rN === 15 || rN === 16) o.pushSide(p.teamNumber === c.CT ? c.CT : c.T)
      }
    })
  })
}

const logProgress = demoFile => {
  console.clear()
  console.log('Reading demo...')
  console.log(Math.ceil(demoFile.currentTime / demoFile.header.playbackTime * 100) + '%')
}

module.exports = async () => {
  const demoFilePath = `${argv._[1]}`

  if (!fs.existsSync(demoFilePath) || !demoFilePath.endsWith('.dem')) {
    console.error('Wrong demofile')
    return
  }

  if (argv.s && argv.s.length === 0) {
    console.error(`You did not set any SteamIDs`)
    return
  }

  const buffer = new Buffer.from(await fsp.readFile(demoFilePath))

  const demoFile = new demofile.DemoFile()

  // START
  demoFile.on('start', () => {
    console.clear()
    console.log('Start')
  })

  // CREATE
  demoFile.entities.on('create', e => {
    if (!(e.entity instanceof demofile.Player)) return
    if (e.entity.isFakePlayer || players.some(o => o.steamID === e.entity.steamId)) return
    players.push(new MatchPlayer(e.entity.steamId, e.entity.name))
    stats.push(new MatchStats(e.entity.steamId))
  })

  // PLAYER DEATH
  demoFile.gameEvents.on('player_death', e => {
    stats.map(s => {
      if (s.steamID === demoFile.entities.getByUserId(e.attacker)?.steamId && !demoFile.gameRules.isWarmup) {
        s.pushWeapon(e.weapon)
      }
    })
  })

  // ROUND MVP
  // error: function adds more MVPs than it should
  // demoFile.gameEvents.on('round_mvp', e => {
  //   const teamT = demoFile.teams[c.T]
  //   const teamCT = demoFile.teams[c.CT]

  //   if (teamT.members !== undefined && teamCT.members !== undefined) {
  //     players.find(o => o.steamID === demoFile.entities.getByUserId(e.userid).steamId).pushMVP(c.MVPS_REASONS[e.reason - 1])
  //   }
  // })

  // ROUND END
  demoFile.gameEvents.on('round_end', (e) => {
    const teamT = demoFile.teams[c.T]
    const teamCT = demoFile.teams[c.CT]
    const rounds = demoFile.gameRules.roundsPlayed
    const curryRoundEnd = roundEnd(rounds)

    curryRoundEnd(teamT)
    curryRoundEnd(teamCT)

    logProgress(demoFile)
  })

  // END
  demoFile.on('end', () => {
    const steamIDs = argv.s && argv.c && config.steamIDs? 
      [...argv.s, ...config.steamIDs] : argv.c && config.steamIDs? 
      [...config.steamIDs] : argv.s ? 
      [...argv.s] : null

    if (steamIDs !== null) {
      players = players.filter(o => steamIDs.includes(o.steamID))
    }

    teams.map(t => {
      const i = t.getSideIndex(1) === c.T ? c.T : c.CT
        
      t.setSides()
      t.update({
        score: demoFile.teams[i].score,
        firstHalf: demoFile.teams[i].scoreFirstHalf,
        secondHalf: demoFile.teams[i].scoreSecondHalf
      })
    })

    stats.map(s => {
      s.setRounds(demoFile.gameRules.roundsPlayed)
      s.countAvg()
    })

    stats.map(s => {
      const player = players.find(p => p.steamID === s.steamID)
      if (player === undefined) return
      player.setStats(s.getStats())
    })

    players.map(p => {
      p.getSide(0) === teams[0].getSideIndex(0) ? teams[0].addMember(p.getPlayer()) : teams[1].addMember(p.getPlayer())
    })

    const data = {
      info: {
        map: demoFile.header.mapName,
        rounds: demoFile.gameRules.roundsPlayed,
      },
      teams: [...teams.map(t => t.geTeams())]
    }

    console.clear()
    console.log('End')
    console.log(data)

    // SAVE
    if (argv.j) {
      saveFile(data, 'matches', 'match')
    }
  })

  demoFile.parse(buffer)
}