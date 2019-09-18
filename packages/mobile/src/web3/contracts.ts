import { addLocalAccount as web3utilsAddLocalAccount } from '@celo/walletkit'
import { DocumentDirectoryPath } from 'react-native-fs'
import * as net from 'react-native-tcp'
import { isGethFreeMode } from 'src/geth/consts'
import Logger from 'src/utils/Logger'
import { DEFAULT_TESTNET, Testnets } from 'src/web3/testnets'
import Web3 from 'web3'

// Logging tag
const tag = 'web3/contracts'

const getIpcProvider = (testnet: Testnets) => {
  Logger.debug(tag, 'creating IPCProvider...')

  const ipcProvider = new Web3.providers.IpcProvider(
    `${DocumentDirectoryPath}/.${testnet}/geth.ipc`,
    net
  )
  Logger.debug(tag, 'created IPCProvider')

  // More details on the IPC objects can be seen via this
  // console.debug("Ipc connection object is " + Object.keys(ipcProvider.connection));
  // console.debug("Ipc data handle is " + ipcProvider.connection._events['data']);
  // @ts-ignore
  const ipcProviderConnection: any = ipcProvider.connection
  const dataResponseHandlerKey: string = 'data'
  const oldDataHandler = ipcProviderConnection._events[dataResponseHandlerKey]
  // Since we are modifying internal properties of IpcProvider, it is best to add this check to ensure that
  // any future changes to IpcProvider internals will cause an error instead of a silent failure.
  if (oldDataHandler === 'undefined') {
    throw new Error('Data handler is not defined')
  }
  ipcProviderConnection._events[dataResponseHandlerKey] = (data: any) => {
    if (data.toString().indexOf('"message":"no suitable peers available"') !== -1) {
      // This is Crude check which can be improved. What we are trying to match is
      // {"jsonrpc":"2.0","id":2,"error":{"code":-32000,"message":"no suitable peers available"}}
      Logger.debug(tag, `Error suppressed: ${data}`)
      return true
    } else {
      // Logger.debug(tag, `Received data over IPC: ${data}`)
      oldDataHandler(data)
    }
  }

  // In the future, we might decide to over-ride the error handler via the following code.
  // ipcProvider.on("error", () => {
  //   Logger.showError("Error occurred");
  // })
  return ipcProvider
}

const getWebSocketProvider = (url: string) => {
  Logger.debug(tag, 'creating HttpProvider...')
  const provider = new Web3.providers.HttpProvider(url)
  Logger.debug(tag, 'created HttpProvider')

  // In the future, we might decide to over-ride the error handler via the following code.
  // provider.on('error', () => {
  //   Logger.showError('Error occurred')
  // })
  return provider
}

let web3: Web3

export async function getWeb3() {
  if (web3 === undefined) {
    Logger.info(`Initializing web3, geth free mode: ${isGethFreeMode()}`)
    if (isGethFreeMode()) {
      // Warning: This hostname is not yet enabled for all the networks.
      // It is only enabled for "integration" and "alfajores" networks as of now.
      // It is being enabled here for all the networks
      // https://github.com/celo-org/celo-monorepo/pull/1034/
      const url = `https://${DEFAULT_TESTNET}-infura.celo-testnet.org/`
      Logger.debug('contracts@getWeb3', `Connecting to url ${url}`)
      const provider = getWebSocketProvider(url)
      web3 = new Web3(provider)
    } else {
      const provider = getIpcProvider(DEFAULT_TESTNET)
      web3 = new Web3(provider)
    }
  }
  return web3
}

export function addLocalAccount(web3Instance: Web3, privateKey: string): Web3 {
  if (web3Instance === null) {
    throw new Error('web3 instance is null')
  }
  if (web3Instance === undefined) {
    throw new Error('web3 instance is undefined')
  }
  if (privateKey === null) {
    throw new Error('privateKey is null')
  }
  if (privateKey === undefined) {
    throw new Error('privateKey is undefined')
  }
  return web3utilsAddLocalAccount(web3Instance, privateKey)
}
