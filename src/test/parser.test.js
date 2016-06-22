import test from 'tape'
import moment from 'moment'
import parser from '../parser'

test('simple am times: 8am-10am', t => {
  let {start, end} = parser('8am-10am')
  t.equals(start.getHours(), 8, 'start is 8am')
  t.equals(end.getHours(), 10, 'end is 10am')

  t.end()
})

test('simple am to pm times: 9am-2pm', t => {
  let {start, end} = parser('9am-2pm')
  t.equals(start.getHours(), 9, 'start is 9am')
  t.equals(end.getHours(), 14, 'end is 2pm (14)')

  t.end()
})

test('simple pm times: 1pm-4pm', t => {
  let {start, end} = parser('1pm-4pm')
  t.equals(start.getHours(), 13, 'start is 1pm (13)')
  t.equals(end.getHours(), 16, 'end is 4pm (16)')

  t.end()
})

test('infer meridiem: 1-3pm', t => {
  let {start, end} = parser('1-3pm')
  t.equals(start.getHours(), 13, 'infer start is 1pm (13)')
  t.equals(end.getHours(), 15, 'end is 3pm (15)')

  t.end()
})

test('infer meridiem: 1pm-3', t => {
  let today = new Date()
  let {start, end} = parser('1pm-3')
  t.equals(start.getHours(), 13, 'start is 1pm (13)')
  t.equals(end.getHours(), 15, 'infer end is 3pm (15)')
  t.ok(moment(start).isSame(today, 'day'), 'start is same as today')
  t.ok(moment(end).isSame(today, 'day'), 'end is same as today')

  t.end()
})

test('infer meridiem: 11pm-2', t => {
  let today = new Date()
  let {start, end} = parser('11pm-2')

  t.equals(start.getHours(), 23, 'start is 11pm (23)')
  t.equals(end.getHours(), 2, 'end is 2am')
  t.ok(moment(start).isSame(moment(today).subtract(1, 'day'), 'day'), 'start is same as yesterday')
  t.ok(moment(end).isSame(today, 'day'), 'end is same as today')

  t.end()
})

test('minutes: 9:15am-2:30pm', t => {
  let {start, end} = parser('9:15am-2:30pm')
  t.equals(start.getHours(), 9, 'start is 9am')
  t.equals(start.getMinutes(), 15, 'start is 9:15am')
  t.equals(end.getHours(), 14, 'end is 2pm (14)')
  t.equals(end.getMinutes(), 30, 'end is 2:30pm')

  t.end()
})

test('colon segmented 24 times: 08:00-13:00', t => {
  let {start, end} = parser('0800-1330')
  t.equals(start.getHours(), 8, 'start is 8am')
  t.equals(end.getHours(), 13, 'end is 1pm (13)')
  t.equals(end.getMinutes(), 30, 'end is 1:30pm')

  t.end()
})

test('proper 24h times: 0800-1330', t => {
  let {start, end} = parser('0800-1330')
  t.equals(start.getHours(), 8, 'start is 8am')
  t.equals(end.getHours(), 13, 'end is 1pm (13)')
  t.equals(end.getMinutes(), 30, 'end is 1:30pm')

  t.end()
})

//TODO: I believe this should fail, and we should require leading zero
test('no leading zero 24h times: 800-1300', t => {
  let {start, end} = parser('800-1300')
  t.equals(start.getHours(), 8, 'start is 8am')
  t.equals(end.getHours(), 13, 'end is 1pm (13)')

  t.end()
})

const anchor  = new Date('Jan 25, 2015 0:00:00')
const anchor2 = new Date('April 2, 2015 0:00:00')

test('anchored: dates relative to anchor', t => {
  let {start, end} = parser('8am-1pm', anchor)

  t.ok(moment(start).isSame(anchor, 'day'), 'start is same day as anchor')
  t.ok(moment(end).isSame(anchor, 'day'), 'end is same day as anchor')

  t.end()
})

test('anchored: dates relative to anchor2', t => {
  let {start, end} = parser('8am-1pm', anchor2)

  t.ok(moment(start).isSame(anchor2, 'day'), 'start is same day as anchor2')
  t.ok(moment(end).isSame(anchor2, 'day'), 'end is same day as anchor2')

  t.end()
})

test('overlapping times: 11pm-2am', t => {
  let {start, end} = parser('11pm-2am', anchor)

  t.ok(moment(start).isSame(anchor, 'day'), 'start is same day as anchor')
  t.ok(moment(end).isSame(moment(anchor).add(1, 'day'), 'day'), 'end is day after anchor')

  t.end()
})

// Please see this issue: https://github.com/tickbin/tickbin/issues/26
test('overlapping times for current day: 11pm-2am', t => {
  const today = new Date()
  let {start, end} = parser('11pm-2am')

  t.ok(moment(start).isSame(moment(today).subtract(1, 'day'), 'day'), 'start is day before today')
  t.ok(moment(end).isSame(today, 'day'), 'end is same as today')

  t.end()
})

test('overlapping time for specified day: 11pm-2am', t => {
  const refDate = new Date('January 15, 2016 0:00:00')
  let {start, end} = parser('11pm-2am', refDate)

  t.ok(moment(start).isSame(refDate, 'day'))
  t.ok(moment(end).isSame(moment(refDate).add(1, 'day'), 'day'))

  t.end()
})

test('matching text is returned', t => {
  let {text} = parser('1-3pm')
  let {text: only} = parser('1-3pm did some things')
  t.equals(text, '1-3pm', 'parser returns matching text')
  t.equals(only, '1-3pm', 'parser returns only matching text')

  t.end()
})

//  Test impliedPMStartRefiner
//  See https://github.com/tickbin/tickbin/issues/96
test('10-4pm should be implied as 10am-4pm', t => {
  const today = new Date()
  let {start, end} = parser('10-4pm')

  t.equals(start.getHours(), 10, 'start is 10am')
  t.equals(end.getHours(), 16, 'end is 4pm (16)')
  t.ok(moment(start).isSame(today, 'day'), 'start is same as today')
  t.ok(moment(end).isSame(today, 'day'), 'end is same as today')

  t.end()
})

//  See https://github.com/tickbin/tickbin/issues/42
test('9:30-12pm should be implied as 9:30am-12pm', t => {
  const today = new Date()
  let {start, end} = parser('9:30-12pm')

  t.equals(start.getHours(), 9, 'start is 9am')
  t.equals(start.getMinutes(), 30, 'start is 30 minutes')
  t.equals(end.getHours(), 12, 'end is 12pm')
  t.ok(moment(start).isSame(today, 'day'), 'start is same as today')
  t.ok(moment(end).isSame(today, 'day'), 'end is same as today')

  t.end()
})

test('proper holiday names', t => {
  const today = new Date(2016, 2, 26) // Sat, March 26
  let {start, end} = parser('8-4pm Good Friday #stat', today)

  t.ok(moment(start).isSame(today, 'day'), 'start is today')
  t.ok(moment(end).isSame(today, 'day'), 'end is today')

  t.end()
})

test('returns original message without time', t => {
  const { message } = parser('1-2pm did some #stuff')

  t.equal(message, 'did some #stuff', 'stripped out time')

  t.end()
})

test('no time needed', t => {
  let {text, message, isRange} = parser('did some #stuff')

  t.equal(text, '', 'there was no time')
  t.equal(message, 'did some #stuff', 'stripped out no time')
  t.notOk(isRange, 'isRange is false')

  t.end()
})

test('one time unit is set to start', t => {
  let {start, end} = parser('12pm did some #stuff')

  t.equal(start.getHours(), 12, 'start is 12pm')
  t.notOk(end, 'end is undefined')

  t.end()
})
