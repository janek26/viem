import { InvalidAddressError } from '../../errors/index.js'
import type { Address } from '../../types/index.js'
import { isAddress } from './isAddress.js'

export function isAddressEqual(a: Address, b: Address) {
  if (!isAddress(a)) throw new InvalidAddressError({ address: a })
  if (!isAddress(b)) throw new InvalidAddressError({ address: b })
  return a.toLowerCase() === b.toLowerCase()
}
