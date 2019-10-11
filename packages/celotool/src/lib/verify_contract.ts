import { readFileSync } from 'fs'
import fetch from 'node-fetch'

export async function getCompilerVersion() {
  // TODO: Add logic to return a dynamic string
  return 'v0.5.3+commit.10d17f24'
}

export async function verifyContract(
  blockscoutUrl: string,
  celoEnv: string,
  contractAddress: string,
  fileCode: string,
  contractName: string
) {
  try {
    const verifyContractUrl = `${blockscoutUrl}/api?module=contract&action=verify`
    const code = readFileSync(fileCode)

    console.log(`Verifying contract ${contractAddress} in "${celoEnv}" environment`)

    const resp = await fetch(verifyContractUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addressHash: contractAddress,
        compilerVersion: getCompilerVersion,
        contractSourceCode: code,
        name: contractName,
        optimization: true,
      }),
    })
  } catch (error) {
    console.error(`Unable to verify contract for address ${contractAddress} in ${celoEnv}`)
    console.error(error)
    process.exit(1)
  }
}
