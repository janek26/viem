import { assertType, describe, expect, test } from 'vitest'

import { accounts } from '../../_test/index.js'
import type {
  TransactionSerializable,
  TransactionSerializableBase,
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableLegacy,
  TransactionSerializedEIP1559,
  TransactionSerializedEIP2930,
  TransactionSerializedLegacy,
} from '../../types/index.js'
import { parseGwei } from '../../utils/index.js'
import { signTransaction } from './signTransaction.js'

const base = {
  gas: 21000n,
  nonce: 785,
} satisfies TransactionSerializableBase

describe('eip1559', () => {
  const baseEip1559 = {
    ...base,
    chainId: 1,
    type: 'eip1559',
  } as const satisfies TransactionSerializable

  test('default', async () => {
    const signature = await signTransaction({
      transaction: baseEip1559,
      privateKey: accounts[0].privateKey,
    })
    assertType<TransactionSerializedEIP1559>(signature)
    expect(signature).toMatchInlineSnapshot(
      '"0x02f850018203118080825208808080c080a04012522854168b27e5dc3d5839bab5e6b39e1a0ffd343901ce1622e3d64b48f1a04e00902ae0502c4728cbf12156290df99c3ed7de85b1dbfe20b5c36931733a33"',
    )
  })

  test('minimal (w/ maxFeePerGas)', async () => {
    const args = {
      chainId: 1,
      maxFeePerGas: 1n,
    }
    expect(
      await signTransaction({
        transaction: args,
        privateKey: accounts[0].privateKey,
      }),
    ).toMatchInlineSnapshot(
      '"0x02f84c0180800180808080c080a0c95f157628e67a435b1b85584db1b8346cbccf9890d28466f6edfed07d097793a03bdfde4f59a340a4308b5b4d2c89da83838d691c8059b228d0667309f1d2e893"',
    )
  })

  test('minimal (w/ type)', async () => {
    const args = {
      chainId: 1,
      type: 'eip1559',
    } as const
    expect(
      await signTransaction({
        transaction: args,
        privateKey: accounts[0].privateKey,
      }),
    ).toMatchInlineSnapshot(
      '"0x02f84c0180808080808080c001a0db5b8a12b90b68aeb786379ac14219ac85934e833082dee6cf03fd912809224da06902cc208e3b14a056dca2005c96f59eae33118b899f642551a58cff09044c9a"',
    )
  })

  test('args: accessList', async () => {
    const args = {
      ...baseEip1559,
      accessList: [
        {
          address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          storageKeys: [
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          ],
        },
      ],
    } satisfies TransactionSerializableEIP1559

    expect(
      await signTransaction({
        transaction: args,
        privateKey: accounts[0].privateKey,
      }),
    ).toMatchInlineSnapshot(
      '"0x02f8ac018203118080825208808080f85bf85994f39fd6e51aad88f6f4ce6ab8827279cfffb92266f842a00000000000000000000000000000000000000000000000000000000000000001a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe80a0df4810a25d0e147163b03e392bf083dc852702715b9ba848eb9821c70ce2c92ea00b6d11209ef326abaf83aa2443ba61851c7c8ca0813e347a04b501f584b03024"',
    )
  })

  test('args: data', async () => {
    const args = {
      ...baseEip1559,
      data: '0x1234',
    } satisfies TransactionSerializableEIP1559

    expect(
      await signTransaction({
        transaction: args,
        privateKey: accounts[0].privateKey,
      }),
    ).toMatchInlineSnapshot(
      '"0x02f8520182031180808252088080821234c001a054d552c58a162c9003633c20871d8e381ef7a3c35d1c8a79c7c12d5cf09a0914a03c5d6241f8c4fcf8b35262de038d3ab1940feb1a70b934ae5d40ea6bce912e2d"',
    )
  })

  test('args: maxFeePerGas/maxPriorityFeePerGas', async () => {
    const args = {
      ...baseEip1559,
      maxFeePerGas: parseGwei('20'),
      maxPriorityFeePerGas: parseGwei('2'),
    } satisfies TransactionSerializableEIP1559

    expect(
      await signTransaction({
        transaction: args,
        privateKey: accounts[0].privateKey,
      }),
    ).toMatchInlineSnapshot(
      '"0x02f8590182031184773594008504a817c800825208808080c001a06ea33b188b30a5f5d0d1cec62b2bac7203ff428a49048766596727737689043fa0255b74c8e704e3692497a29cd246ffc4344b4107457ce1c914fe2b4e09993859"',
    )
  })
})

describe('eip2930', () => {
  const baseEip2930 = {
    ...base,
    chainId: 1,
    type: 'eip2930',
  } as const satisfies TransactionSerializable

  test('default', async () => {
    const signature = await signTransaction({
      transaction: baseEip2930,
      privateKey: accounts[0].privateKey,
    })
    assertType<TransactionSerializedEIP2930>(signature)
    expect(signature).toMatchInlineSnapshot(
      '"0x01f84f0182031180825208808080c080a089cebce5c7f728febd1060b55837c894ec2a79dd7854350abce252fc2de96b5da039f2782c70b92f4b1916aa8db91453c7229f33458bd091b3e10a40f9a7e443d2"',
    )
  })

  test('minimal (w/ accessList & gasPrice)', async () => {
    const args = {
      chainId: 1,
      accessList: [
        {
          address: '0x0000000000000000000000000000000000000000',
          storageKeys: [
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
        },
      ],
      gasPrice: parseGwei('2'),
    } as TransactionSerializableEIP2930

    expect(
      await signTransaction({
        transaction: args,
        privateKey: accounts[0].privateKey,
      }),
    ).toMatchInlineSnapshot(
      '"0x01f8880180847735940080808080f838f7940000000000000000000000000000000000000000e1a0000000000000000000000000000000000000000000000000000000000000000080a0ddef1ec6e66b32535e9114cd7b3418560fc6bca2180e1adc8d295dc145cc5ac0a0636a1359bff1e30a2582429f33b68b532bd5d18e9f39ae0b637b3eae85ba6ad9"',
    )
  })

  test('minimal (w/ type)', async () => {
    const args = {
      chainId: 1,
      type: 'eip2930',
    } as const
    expect(
      await signTransaction({
        transaction: args,
        privateKey: accounts[0].privateKey,
      }),
    ).toMatchInlineSnapshot(
      '"0x01f84b01808080808080c080a0cfac15d0507fbcdff8c8b489a85704f856f0b0803cacbbe9aa2a0fd34fd9c260a0571039b719e1c24b410bd6407b22539817c385d99dd9e07858fc973704564d5c"',
    )
  })

  test('args: accessList', async () => {
    const args = {
      ...baseEip2930,
      accessList: [
        {
          address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          storageKeys: [
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          ],
        },
      ],
    } satisfies TransactionSerializableEIP2930

    expect(
      await signTransaction({
        transaction: args,
        privateKey: accounts[0].privateKey,
      }),
    ).toMatchInlineSnapshot(
      '"0x01f8ab0182031180825208808080f85bf85994f39fd6e51aad88f6f4ce6ab8827279cfffb92266f842a00000000000000000000000000000000000000000000000000000000000000001a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe01a041dbfa79cb11e5049b7c64e29c8484a2b43e664dcaea31ba1f2c9887c62f76b7a002964169f5c366e21a440c006a06f121eca1aafa2275d7c1f165891eb3d31e54"',
    )
  })

  test('args: data', async () => {
    const args = {
      ...baseEip2930,
      data: '0x1234',
    } satisfies TransactionSerializableEIP2930

    expect(
      await signTransaction({
        transaction: args,
        privateKey: accounts[0].privateKey,
      }),
    ).toMatchInlineSnapshot(
      '"0x01f85101820311808252088080821234c080a084fdcea5fe55ce8378aa94a8d4a9c01545d59922f1edcdd89a71ebf740dc0bf5a0539a4ab61a42509a6b4c35c85099d8b7b8e815967f0c832c868327caca6307cb"',
    )
  })

  test('args: gasPrice', async () => {
    const args = {
      ...baseEip2930,
      gasPrice: parseGwei('20'),
    } satisfies TransactionSerializableEIP2930

    expect(
      await signTransaction({
        transaction: args,
        privateKey: accounts[0].privateKey,
      }),
    ).toMatchInlineSnapshot(
      '"0x01f854018203118504a817c800825208808080c080a058e29913bc928a79e0536fc588e8fe372464d1ff4feff691c344c0163280c97ea037780b5c99301a67aaacfbe98c83139fd026e30925fc103b7898b53af9cb0658"',
    )
  })
})

describe('legacy', () => {
  const baseLegacy = {
    ...base,
    gasPrice: parseGwei('2'),
    type: 'legacy',
  } as const satisfies TransactionSerializable

  test('default', async () => {
    const signature = await signTransaction({
      transaction: baseLegacy,
      privateKey: accounts[0].privateKey,
    })
    assertType<TransactionSerializedLegacy>(signature)
    expect(signature).toMatchInlineSnapshot(
      '"0xf85182031184773594008252088080801ba0462e5dabe6d0e82ac9d2832d5ecc815e317669ae2eb018c2a07ae6f3a4763618a003214adcddee51ee1d46cb12a694f5520c851581fe53c543c8999d45fa18de07"',
    )
  })

  test('minimal (w/ gasPrice)', async () => {
    const args = {
      gasPrice: parseGwei('2'),
    } as TransactionSerializableEIP2930

    expect(
      await signTransaction({
        transaction: args,
        privateKey: accounts[0].privateKey,
      }),
    ).toMatchInlineSnapshot(
      '"0xf84d808477359400808080801ba07abf45a28c3ce5a1d79d5ab5362878be5411ac51b3c2316670e1263936ef869ea001ca38d1782880bff3e2056f4949e75418858195b06fa8b6b13910a789e51989"',
    )
  })

  test('minimal (w/ type)', async () => {
    const args = {
      type: 'legacy',
    } as const
    expect(
      await signTransaction({
        transaction: args,
        privateKey: accounts[0].privateKey,
      }),
    ).toMatchInlineSnapshot(
      '"0xf8498080808080801ba0ed0dde91ca0736a47cbd91b770cd7b43c9a749edd966dcb5205ba2e0298d22e0a07372cfcbf5319fda0b7c5eebbdde6582b80de24cf9c5f4475a537a39e4156166"',
    )
  })

  test('args: data', async () => {
    const args = {
      ...baseLegacy,
      data: '0x1234',
    } satisfies TransactionSerializableLegacy

    expect(
      await signTransaction({
        transaction: args,
        privateKey: accounts[0].privateKey,
      }),
    ).toMatchInlineSnapshot(
      '"0xf853820311847735940082520880808212341ba06aaba448432a7ea0749d6ad06dae0f7530cec5c7e184f82047a9435ff2436439a01caf56f78d2e755490c89780bd74fe74dcdbcc007184fcd93619f5d5a4c3ea3d"',
    )
  })

  test('args: gas', async () => {
    const args = {
      ...baseLegacy,
      gas: 21000n,
    } satisfies TransactionSerializableLegacy

    expect(
      await signTransaction({
        transaction: args,
        privateKey: accounts[0].privateKey,
      }),
    ).toMatchInlineSnapshot(
      '"0xf85182031184773594008252088080801ba0462e5dabe6d0e82ac9d2832d5ecc815e317669ae2eb018c2a07ae6f3a4763618a003214adcddee51ee1d46cb12a694f5520c851581fe53c543c8999d45fa18de07"',
    )
  })

  test('args: gasPrice', async () => {
    const args = {
      ...baseLegacy,
      gasPrice: parseGwei('20'),
    } satisfies TransactionSerializableLegacy

    expect(
      await signTransaction({
        transaction: args,
        privateKey: accounts[0].privateKey,
      }),
    ).toMatchInlineSnapshot(
      '"0xf8528203118504a817c8008252088080801ca0fce7d33cbd1d08fed4dca6dc53944d3b9338e39611bb7d4e3bb8dcc98f8e844ca05ed06c33b2cde7149d6f0795b274ec549554ff611cbea6e70eedba09e6905af0"',
    )
  })

  test('args: chainId', async () => {
    const args = {
      ...baseLegacy,
      chainId: 1,
    } satisfies TransactionSerializableLegacy

    expect(
      await signTransaction({
        transaction: args,
        privateKey: accounts[0].privateKey,
      }),
    ).toMatchInlineSnapshot(
      '"0xf851820311847735940082520880808025a0c1dc31893c8b13bc2dca5e650f68373ea0b8f3c182b516453faf217c53123527a0353f95bc1dab45198fde8cd20c597cb83ea7cf5a6d49586f0c2eaf150356aa49"',
    )
  })
})
