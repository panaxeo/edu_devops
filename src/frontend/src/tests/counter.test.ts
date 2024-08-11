import { expect, test } from 'vitest'
import { incrementValue, type ICounter } from '../stores/counter'

test('IncrementValue will increase the value by 1', () => {
  const initialValue = 1;
  const counter = { value: initialValue} as ICounter;
  incrementValue(counter);
  expect(counter.value).toBe(initialValue + 1);
})