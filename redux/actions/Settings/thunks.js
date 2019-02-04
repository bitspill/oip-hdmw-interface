import {loadFromLocalStorage, setCoinNetworkApis, setDefaultCoinNetworkApis, includeTestnetCoins} from "./creators";
import {addDisplayCoin, removeDisplayCoin} from '../Interface/creators'

export const toggleTestnetCoins = (bool, wallet) => dispatch => {
	dispatch(includeTestnetCoins(bool))
	if (bool) {
		wallet.addTestnetCoins(bool) //add testnet coins
		let coins = Object.keys(wallet.getCoins())
		for (let coin of coins) {
			if (coin.includes('_testnet')) {
				dispatch(displayCoin(coin))
			}
		}
	} else {
		let coins = Object.keys(wallet.getCoins())
		for (let coin of coins) {
			if (coin.includes('_testnet')) {
				dispatch(displayCoin(coin, false))
			}
		}
		wallet.addTestnetCoins(bool) //remove testnet coins
	}
	
	//if true
	//add coins to wallet
	
	//add coins to display array
	
	//if false, remove coins from wallet
	//remove coins from display array
	
	//set state variable
}

export const displayCoin = (coin, bool = true) => dispatch => {
	if (bool) {
		dispatch(addDisplayCoin(coin))
	} else {
		dispatch(removeDisplayCoin(coin))
	}
}

export const initializeCoinNetworkApiUrls = (wallet) => dispatch => {
	let networks = wallet.getNetworkApiUrls()
	dispatch(setCoinNetworkApis(networks))
	dispatch(setDefaultCoinNetworkApis(networks))
}

export const loadSettingsFromLocalStorage = () => dispatch => {
	let parsedSettings
	if (window && window.localStorage) {
		try {
			let hdmw_settings = localStorage.getItem('hdmw_settings')
			parsedSettings = JSON.parse(hdmw_settings)
		} catch (err) {
			return false
		}
 	}
	dispatch(loadFromLocalStorage(parsedSettings))
}