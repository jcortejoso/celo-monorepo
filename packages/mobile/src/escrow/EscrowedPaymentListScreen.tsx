import SectionHeader from '@celo/react-components/components/SectionHead'
import colors from '@celo/react-components/styles/colors'
import { componentStyles } from '@celo/react-components/styles/styles'
import variables from '@celo/react-components/styles/variables'
import * as React from 'react'
import { WithNamespaces, withNamespaces } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { connect } from 'react-redux'
import { EscrowedPayment } from 'src/escrow/actions'
import EscrowedPaymentListItem from 'src/escrow/EscrowedPaymentListItem'
import { getReclaimableEscrowPayments } from 'src/escrow/saga'
import { updatePaymentRequestStatus } from 'src/firebase/actions'
import i18n, { Namespaces } from 'src/i18n'
import { fetchPhoneAddresses } from 'src/identity/actions'
import { e164NumberToAddressSelector, E164NumberToAddressType } from 'src/identity/reducer'
import { headerWithBackButton } from 'src/navigator/Headers'
import PaymentRequestBalance from 'src/paymentRequest/PaymentRequestBalance'
import PaymentRequestListEmpty from 'src/paymentRequest/PaymentRequestListEmpty'
import { NumberToRecipient } from 'src/recipients/recipient'
import { recipientCacheSelector } from 'src/recipients/reducer'
import { RootState } from 'src/redux/reducers'
import DisconnectBanner from 'src/shared/DisconnectBanner'

const { contentPadding } = variables

interface StateProps {
  dollarBalance: string | null
  sentEscrowedPayments: EscrowedPayment[]
  e164PhoneNumberAddressMapping: E164NumberToAddressType
  recipientCache: NumberToRecipient
}

interface DispatchProps {
  updatePaymentRequestStatus: typeof updatePaymentRequestStatus
  fetchPhoneAddresses: typeof fetchPhoneAddresses
}

const mapStateToProps = (state: RootState): StateProps => ({
  dollarBalance: state.stableToken.balance,
  sentEscrowedPayments: getReclaimableEscrowPayments(state.escrow.sentEscrowedPayments),
  e164PhoneNumberAddressMapping: e164NumberToAddressSelector(state),
  recipientCache: recipientCacheSelector(state),
})

type Props = WithNamespaces & StateProps & DispatchProps

export class EscrowedPaymentListScreen extends React.Component<Props> {
  static navigationOptions = () => ({
    ...headerWithBackButton,
    headerTitle: i18n.t('inviteFlow11:pedningInvitations'),
  })

  renderRequest = (payment: EscrowedPayment, key: number, allPayments: EscrowedPayment[]) => {
    return (
      <View key={key}>
        <EscrowedPaymentListItem payment={payment} />
        {key < allPayments.length - 1 && <View style={styles.separator} />}
      </View>
    )
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <DisconnectBanner />
        <PaymentRequestBalance dollarBalance={this.props.dollarBalance} />
        <SectionHeader text={this.props.t('payments')} />
        {this.props.sentEscrowedPayments.length > 0 ? (
          <ScrollView>
            <View style={[componentStyles.roundedBorder, styles.scrollArea]}>
              {this.props.sentEscrowedPayments.map(this.renderRequest)}
            </View>
          </ScrollView>
        ) : (
          <PaymentRequestListEmpty />
        )}
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  separator: {
    borderBottomColor: colors.darkLightest,
    borderBottomWidth: 1,
    marginLeft: 50,
  },
  scrollArea: {
    margin: contentPadding,
  },
})

export default connect<StateProps, DispatchProps, {}, RootState>(
  mapStateToProps,
  {
    updatePaymentRequestStatus,
    fetchPhoneAddresses,
  }
)(withNamespaces(Namespaces.global)(EscrowedPaymentListScreen))
