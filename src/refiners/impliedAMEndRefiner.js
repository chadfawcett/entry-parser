/*
 * When specifying a PM meridiem for the start time and no meridiem for end, it
 * implies end is AM and the next day. If it looks like the end time could be a
 * PM value, it should be changed.
 *
 * If the end value (in PM form) is greater than start, we should assume it's
 * PM:
 *   '4pm-10' should parse as '4pm-10pm'
 *
 * If the end value (in PM form) is less than start, we should assume it's AM:
 *   '10pm-4' should parse as '10pm-4am'
 *   Note: This is how the parser works by default
 *
 * See https://github.com/tickbin/tickbin/issues/15
 */

import chrono from 'chrono-node'
import { add, subtract } from '../helpers/chronoDateManipulation'

function refine (text, results, opt) {
  results.forEach(result => {
    // only operate on ranges
    if (!result.start || !result.end)
      return result

    if (result.start.get('meridiem') === 1
        && result.end.get('meridiem') === 0
        && !result.end.isCertain('meridiem')
        && result.end.get('hour') + 12 > result.start.get('hour')) {
      add(12, 'hour', result.end)
      subtract(1, 'day', result.end)
    }
  })
  return results
}

const impliedAMEndRefiner = new chrono.Refiner()
impliedAMEndRefiner.refine = refine
export default impliedAMEndRefiner
