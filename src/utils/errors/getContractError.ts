import type { Abi } from 'abitype'

import {
  ContractFunctionRevertedError,
  ContractFunctionZeroDataError,
} from '../../errors/contract.js'
import { BaseError } from '../../errors/index.js'
import {
  AbiDecodingZeroDataError,
  ContractFunctionExecutionError,
  RawContractError,
} from '../../errors/index.js'
import type { Address } from '../../types/index.js'

const EXECUTION_REVERTED_ERROR_CODE = 3

export function getContractError(
  err: BaseError,
  {
    abi,
    address,
    args,
    docsPath,
    functionName,
    sender,
  }: {
    abi: Abi
    args: any
    address?: Address
    docsPath?: string
    functionName: string
    sender?: Address
  },
) {
  const { code, data, message, shortMessage } = (
    err instanceof RawContractError
      ? err
      : err instanceof BaseError
      ? err.walk((err) => 'data' in (err as Error))
      : {}
  ) as RawContractError

  let cause = err
  if (err instanceof AbiDecodingZeroDataError) {
    cause = new ContractFunctionZeroDataError({ functionName })
  } else if (
    code === EXECUTION_REVERTED_ERROR_CODE &&
    (data || message || shortMessage)
  ) {
    cause = new ContractFunctionRevertedError({
      abi,
      data,
      functionName,
      message: shortMessage ?? message,
    })
  }

  return new ContractFunctionExecutionError(cause, {
    abi,
    args,
    contractAddress: address,
    docsPath,
    functionName,
    sender,
  })
}
