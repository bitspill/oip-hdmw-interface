import React from 'react'
import ClipboardJS from 'clipboard'
import {withStyles} from "@material-ui/core";

import {FileCopy} from "@material-ui/icons";
import notifier from '../../../lib/notifier'

import styles from '../../../styles/views/dumb/Addresses'

const Addresses = (props) => {
	// console.log('Addresses()')
	const {classes, Interface, Wallet, increaseAddressCount} = props
	
	const activeCoin = Interface.activeCoin
	const coinProperties = Interface[activeCoin]
	
	//this is just to let the InterfaceContainer mount fully without breaking
	if (!coinProperties) {
		return null
	}
	
	let addresses = []
	let Coin = Wallet.getCoin(activeCoin)
	let Account = Coin.getAccount(coinProperties.activeAccount)
	for (let i = 0; i < coinProperties.addresses; i++) {
		addresses.push(Account.getAddress(coinProperties.activeChain, i))
	}
	
	new ClipboardJS('.copy-to-clipboard')
	console.log("Addresses.render()")
	return (
		<div className={classes.addressContainer}>
				{addresses.map((addr, i) => (
					<div key={i} className={classes.addressRow}>
						<div className={classes.addressInfo}>
							<span className={classes.addressIndex}>/{i}  </span>
							<span id={`id-${i}`} className={classes.publicAddress}>{addr.getPublicAddress()}</span>
						</div>
						<FileCopy
							className={`copy-to-clipboard ${classes.copyToClipBoard}`}
							data-clipboard-target={`#id-${i}`}
							onClick={() => {
								let sel = window.getSelection()
								sel.empty()
								notifier('copied to clipboard')
							}}/>
					</div>
				))}
				<div className={classes.showExtraAddressContainer}>
					<span
						className={classes.showExtraAddress}
						onClick={() => {increaseAddressCount()}}>
						+ Show new address
					</span>
				</div>
		</div>
	)
}

export default withStyles(styles)(Addresses)