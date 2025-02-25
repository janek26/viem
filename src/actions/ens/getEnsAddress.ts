import type { PublicClient, Transport } from '../../clients/index.js'
import {
  singleAddressResolverAbi,
  universalResolverAbi,
} from '../../constants/abis.js'
import type { Address, Chain, Prettify } from '../../types/index.js'
import { namehash, packetToBytes } from '../../utils/ens/index.js'
import {
  decodeFunctionResult,
  encodeFunctionData,
  getChainContractAddress,
  toHex,
  trim,
} from '../../utils/index.js'
import { readContract } from '../public/index.js'
import type { ReadContractParameters } from '../public/index.js'

export type GetEnsAddressParameters = Prettify<
  Pick<ReadContractParameters, 'blockNumber' | 'blockTag'> & {
    /** Name to get the address for. */
    name: string
    /** Address of ENS Universal Resolver Contract. */
    universalResolverAddress?: Address
  }
>

export type GetEnsAddressReturnType = Address | null

/**
 * Gets address for ENS name.
 *
 * - Docs: https://viem.sh/docs/ens/actions/getEnsAddress.html
 * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/ens
 *
 * Calls `resolve(bytes, bytes)` on ENS Universal Resolver Contract.
 *
 * Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize.html) function for this.
 *
 * @param client - Client to use
 * @param parameters - {@link GetEnsAddressParameters}
 * @returns Address for ENS name or `null` if not found. {@link GetEnsAddressReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getEnsAddress, normalize } from 'viem/ens'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const ensAddress = await getEnsAddress(client, {
 *   name: normalize('wagmi-dev.eth'),
 * })
 * // '0xd2135CfB216b74109775236E36d4b433F1DF507B'
 */
export async function getEnsAddress<TChain extends Chain | undefined,>(
  client: PublicClient<Transport, TChain>,
  {
    blockNumber,
    blockTag,
    name,
    universalResolverAddress: universalResolverAddress_,
  }: GetEnsAddressParameters,
): Promise<GetEnsAddressReturnType> {
  let universalResolverAddress = universalResolverAddress_
  if (!universalResolverAddress) {
    if (!client.chain)
      throw new Error(
        'client chain not configured. universalResolverAddress is required.',
      )

    universalResolverAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: 'ensUniversalResolver',
    })
  }

  const res = await readContract(client, {
    address: universalResolverAddress,
    abi: universalResolverAbi,
    functionName: 'resolve',
    args: [
      toHex(packetToBytes(name)),
      encodeFunctionData({
        abi: singleAddressResolverAbi,
        functionName: 'addr',
        args: [namehash(name)],
      }),
    ],
    blockNumber,
    blockTag,
  })

  if (res[0] === '0x') return null

  const address = decodeFunctionResult({
    abi: singleAddressResolverAbi,
    functionName: 'addr',
    data: res[0],
  })

  return trim(address) === '0x0' ? null : address
}
