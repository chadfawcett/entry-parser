import chrono from 'chrono-node'
import parseTime from '../helpers/parseTime'

function pattern() {
  return /([0-9]{3,4}) *- *([0-9]{3,4})/
}

function extract(text, ref, match, opt) {
  let index = match.index
  let start = parseTime(match[1])
  let end = parseTime(match[2])
  const result = new chrono.ParsedResult({
    ref, text: match[0], index, start, end
  })
  result.tags['militaryParser'] = true
  result.start.assign('meridiem', result.start.get('hour') < 12 ? 0 : 1)
  result.end.assign('meridiem', result.end.get('hour') < 12 ? 0 : 1)

  return result
}

const militaryParser = new chrono.Parser()
militaryParser.pattern = pattern
militaryParser.extract = extract
export default militaryParser
