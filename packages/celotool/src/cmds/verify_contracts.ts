import { switchToClusterFromEnv } from 'src/lib/cluster'
import { addCeloEnvMiddleware, CeloEnvArgv } from 'src/lib/env-utils'
import { verifyContract } from 'src/lib/verify_contract'
import { getBlockscoutUrl } from 'src/lib/endpoints'
import * as yargs from 'yargs'

export const command = 'verify-contract'
export const describe = 'command for verify a contract in BlockScout for a specific network'

interface verifyContractArgv extends CeloEnvArgv {
  contractAddress: string
  fileCode: string
  functionName: string
}

export const builder = (argv: yargs.Argv) => {
  return addCeloEnvMiddleware(argv)
    .option('contractAddress', {
      type: 'string',
      description: 'Contract Address to verify code',
    })
    .option('fileCode', {
      type: 'string',
      description: 'Solidity source code of the contract',
    })
    .option('functionName', {
      type: 'string',
      description: 'Solidity source code of the contract',
    })
}

export const handler = async (argv: verifyContractArgv) => {
  const blockscoutDomain = getBlockscoutUrl(argv)
  await switchToClusterFromEnv(false)
  await verifyContract(
    argv.celoEnv,
    blockscoutDomain,
    argv.contractAddress,
    argv.fileCode,
    argv.functionName
  )
}
