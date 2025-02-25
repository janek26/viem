import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Chain } from '../../types/index.js'
import { numberToHex } from '../../utils/index.js'

export type SetMinGasPriceParameters = {
  /** The gas price. */
  gasPrice: bigint
}

/**
 * Change the minimum gas price accepted by the network (in wei).
 *
 * - Docs: https://viem.sh/docs/actions/test/setMinGasPrice.html
 *
 * Note: `setMinGasPrice` can only be used on clients that do not have EIP-1559 enabled.
 *
 * @param client - Client to use
 * @param parameters – {@link SetBlockGasLimitParameters}
 *
 * @example
 * import { createTestClient, http, parseGwei } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { setMinGasPrice } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await setMinGasPrice(client, {
 *   gasPrice: parseGwei('20'),
 * })
 */
export async function setMinGasPrice<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { gasPrice }: SetMinGasPriceParameters,
) {
  await client.request({
    method: `${client.mode}_setMinGasPrice`,
    params: [numberToHex(gasPrice)],
  })
}
