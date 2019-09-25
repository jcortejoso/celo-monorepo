import { GethSyncMode } from 'src/geth/consts'

// import Config from 'react-native-config'

export enum Testnets {
  integration = 'integration',
  alfajoresstaging = 'alfajoresstaging',
  alfajores = 'alfajores',
  pilot = 'pilot',
  pilotstaging = 'pilotstaging',
}

// TODO(ashishb): testing only
export const DEFAULT_TESTNET: Testnets = Testnets.integration  // Config.DEFAULT_TESTNET
// TODO(ashishb): testing only
export const DEFAULT_SYNC_MODE: GethSyncMode = GethSyncMode.ZeroSync  // GethSyncMode.Ultralight
