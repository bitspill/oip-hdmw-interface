import {
	setCoinBalance,
	setCoinBalances,
	setExchangeRates,
	setUsedPubAddresses,
	setTransactions,
	balancesError,
	balancesFetching,
	balancesSuccess,
	transactionsError,
	transactionsFetching,
	transactionsSuccess,
	sendPaymentError,
	sendPaymentFetching,
	sendPaymentSuccess,
	coinBalanceError,
	coinBalanceSuccess,
	coinBalanceFetching
} from "./creators";

export const updateCoinBalance = (coin, wallet, force = false) => async (dispatch) => {
	if (dispatch(shouldUpdate(coin)) || force) {
		dispatch(coinBalanceFetching(coin))
		
		let balance
		try {
			balance = await wallet.getCoinBalances({coins: [coin]})
		} catch (err) {
			dispatch(coinBalanceError(coin))
		}
		dispatch(setCoinBalance(coin, balance))
		dispatch(coinBalanceSuccess(coin))
	}
}

export const updateExchangeRates = (wallet, coins) => async dispatch => {
	if (dispatch(shouldUpdate('xr'))) {
		let options = {}
		if (coins)
			options.coins = coins
		let xr = await wallet.getExchangeRates(options)
		dispatch(setExchangeRates(xr))
	}
}

export const updateBalances = (wallet, coins) => async (dispatch) => {
	let _coins = coins ? coins : Object.keys(wallet.getCoins())
	if (typeof _coins === 'string') {
		_coins = [_coins]
	}
	let coinsToFetchBalances = []
	for (let coin of _coins) {
		if (dispatch(shouldUpdate(coin))) {
			coinsToFetchBalances.push(coin)
		}
	}
	dispatch(balancesFetching())
	let balances
	try {
		balances = await wallet.getCoinBalances({coins: coinsToFetchBalances})
	} catch (err) {
		dispatch(balancesError())
	}
	dispatch(setCoinBalances(balances))
	dispatch(balancesSuccess())
	
	_coins = _coins.filter(coin => !coin.includes('_testnet'))
	if (_coins.length !== 0) {
		dispatch(updateExchangeRates(wallet, _coins)) // toDo: move into new func?
	}
}

export const shouldUpdate = name => (undefined, getState) => {
	const {Settings, HDMW} = getState()
	if (!HDMW.lastUpdate[name]) {
		return true
	}
	return (Date.now() - Settings.refreshLimit) >= HDMW.lastUpdate[name];
}

export const getTransactions = (Wallet, explorer) => async (dispatch, getState) => {
	const {Interface} = getState()
	const activeCoin = Interface.activeCoin
	const coinState = Interface.coins[activeCoin]
	
	let COIN = Wallet.getCoin(activeCoin)
	
	if (!activeCoin || !coinState || !COIN) {
		dispatch(transactionsError())
		console.error('missing variable in getTransactions thunk', activeCoin, coinState, COIN)
		return
	}
	let ACCOUNT = COIN.getAccount(coinState.activeAccountIndex)
	
	try {
		ACCOUNT = await ACCOUNT.discoverChains()
	} catch (err) {
		dispatch(transactionsError())
		console.error(`Failed to discover chains on account in thunk`)
		return
	}
	
	let usedAddresses = await ACCOUNT.getUsedAddresses()
	
	let usedPubAddresses = []
	let transactionIds = []
	for (let addr of usedAddresses) {
		usedPubAddresses.push(addr.getPublicAddress())
		for (let tx of addr.transactions) {
			transactionIds.push(tx)
		}
	}
	
	dispatch(transactionsFetching())
	let transactions = []
	for (let id of transactionIds) {
		try {
			transactions.push(await explorer.getTransaction(id))
		} catch (err) {
			dispatch(transactionsError())
			console.error('failed to get transaction from explorer in getTransactions thunk', err, explorer)
			return
		}
	}
	
	dispatch(setUsedPubAddresses(usedPubAddresses, activeCoin, coinState.activeAccountIndex))
	dispatch(setTransactions(transactions, activeCoin, coinState.activeAccountIndex))
	
	dispatch(transactionsSuccess())
	return transactions
}
