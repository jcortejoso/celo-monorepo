import { addLocalAccount as web3utilsAddLocalAccount, StaticNodeUtils } from '@celo/walletkit'
import { Platform } from 'react-native'
import { DocumentDirectoryPath } from 'react-native-fs'
import * as net from 'react-native-tcp'
import { isGethFreeMode } from 'src/geth/consts'
import Logger from 'src/utils/Logger'
import { DEFAULT_TESTNET, Testnets } from 'src/web3/testnets'
import Web3 from 'web3'
import { Provider } from 'web3/providers'

// Logging tag
const tag = 'web3/contracts'

function getIpcProvider(testnet: Testnets) {
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

// Use Http provider on iOS until we add support for local socket on iOS in react-native-tcp
function getWeb3HttpProviderForIos(): Provider {
  Logger.debug(tag, 'creating HttpProvider for iOS...')

  const httpProvider = new Web3.providers.HttpProvider('http://localhost:8545')
  Logger.debug(tag, 'created HttpProvider for iOS')

  return httpProvider
}

const getWebSocketProvider = (url: string) => {
  Logger.debug(tag, 'creating WebsocketProvider...')
  const wsProvider = new Web3.providers.WebsocketProvider(url)
  Logger.debug(tag, 'created WebsocketProvider')

  // In the future, we might decide to over-ride the error handler via the following code.
  // wsProvider.on('error', () => {
  //   Logger.showError('Error occurred')
  // })
  return wsProvider
}

let web3: Web3

export async function getWeb3() {
  if (web3 === undefined) {
    Logger.info(`Initializing web3, platform: ${Platform.OS}, geth free mode: ${isGethFreeMode()}`)
    if (Platform.OS === 'ios') {
      web3 = new Web3(getWeb3HttpProviderForIos())
    } else if (isGethFreeMode()) {  // Android + Geth free mode
      Logger.debug('contracts@getWeb3', `Default testnet is ${DEFAULT_TESTNET}`)
      const statipNodeIps: string = await StaticNodeUtils.getStaticNodesAsync(DEFAULT_TESTNET)
      Logger.debug('contracts@getWeb3', `Static node IPs are ${statipNodeIps}`)
      const enodeWithIp: string = JSON.parse(statipNodeIps)[0]
      // Extract IP from "enode://<enode>@<IP>:<port>"
      const staticNodeIp: string = enodeWithIp.split('@')[1].split(':')[0]
      Logger.debug('contracts@getWeb3', `Static node IP is ${staticNodeIp}`)
      if (staticNodeIp === undefined) {
        throw new Error('Static node IP is undefined')
      }
      if (staticNodeIp === null) {
        throw new Error('Static node IP is null')
      }
      const provider = getWebSocketProvider(`ws://${staticNodeIp}:8546`)
      web3 = new Web3(provider)
    } else {  // Android + local geth
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
