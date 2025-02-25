import { slice } from '../data/index.js'
import { hashFunction } from './hashFunction.js'

export const getFunctionSelector = (fn: string) => slice(hashFunction(fn), 0, 4)
