import ApolloClient from 'apollo-boost'
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'
import { persistCache } from 'apollo-cache-persist'
import { AsyncStorage } from 'react-native'
import introspectionQueryResultData from 'src/apollo/fragmentTypes.json'
import { BLOCKCHAIN_API_URL } from 'src/config'
import Logger from 'src/utils/Logger'

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData,
})

const cache = new InMemoryCache({ fragmentMatcher })

persistCache({
  cache,
  // @ts-ignore https://github.com/apollographql/apollo-cache-persist/pull/58
  storage: AsyncStorage,
})

Logger.debug('apollo/init', `Init Apollo Client with url ${BLOCKCHAIN_API_URL}`)
export const apolloClient = new ApolloClient<InMemoryCache>({
  uri: BLOCKCHAIN_API_URL,
  cache,
})