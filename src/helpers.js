const config = require('../config.json')
const c = require('./consts')
const argv = require('./argv')
const fs = require('fs')

const saveFile = (data, folder, name) => {
  let lastNum, number

  const path = `${argv.c && config.outputDir ? config.outputDir : c.OUTPUT_PATH}/${folder}`

  if (!fs.existsSync(`${path}`)) {
    fs.mkdirSync(`${path}`)
  }

  const files = fs.readdirSync(`${path}`).filter(f => f.endsWith('json'))

  if (!files.length) {
    number = '001'
  } else {
    lastNum = files[files.length - 1].match(/\d+/)[0]
    number = `${+lastNum + 1}`.padStart(lastNum.length, '0')
  }

  let fileName = `${name}_${number}.json`

  fs.writeFile(`${path}/${fileName}`, JSON.stringify(data, null, 2), err => {
    if (err) throw err
    console.log(`Data has been written to the file: ${fileName}`)
  })
}

module.exports = {
  saveFile
}