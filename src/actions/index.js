import Maker from '@makerdao/dai';

// maximum debt is calculated based on this minimum collaterization ratio
const MIN_RATIO = 250;

export const started = () => ({
  type: 'STARTED'
});

export const makerCreated = () => ({
  type: 'MAKER_CREATED'
});

export const makerAuthenticated = () => ({
  type: 'MAKER_AUTHENTICATED'
});

export const cdpOpened = () => ({
  type: 'CDP_OPENED'
});

export const ethLocked = () => ({
  type: 'ETH_LOCKED'
});

export const daiDrawn = () => ({
  type: 'DAI_DRAWN'
});

export const daiWiped = () => ({
  type: 'DAI_WIPED'
});

export const cdpShut = () => ({
  type: 'CDP_SHUT'
});

const drawDaiAsync = (maker, cdp) => async dispatch => {
  const defaultAccount = maker
    .service('token')
    .get('web3')
    .currentAccount();
  const dai = maker.service('token').getToken('DAI');
  const txn = await cdp.drawDai(0.1);
  const balance = await dai.balanceOf(defaultAccount);
  console.log('Transaction from drawing Dai:', txn);
  console.log('Dai balance after drawing:', balance.toString());
  dispatch(daiDrawn());
};

/** calculates the maximum debt that may be extracted from the current CDP */
export async function calcMaxDebtInCDP(maker, cdp) {
  const price = maker.service('price');
  const ethPrice = await price.getEthPrice();
  const pethCollateral = await cdp.getCollateralValue(Maker.PETH);
  const wethPethRatio = await price.getWethToPethRatio();
  const debtValue = await cdp.getDebtValue(Maker.DAI);
  let maxDebt = (ethPrice.toNumber() * pethCollateral.toNumber() * wethPethRatio * 100) / MIN_RATIO;

  // console.log("collateral PETH = " + pethCollateral);
  // console.log("WETH/PETH ratio = " + wethPethRatio);
  // console.log("debt value = " + debtValue);
  //
  // console.log('max debt from CDP = ' + maxDebt + ' DAI');
  return maxDebt;
}

/** calculates the maximum debt that may be extracted from the Metamask wallet */
export async function calcMaxDebtFromWallet(maker, cdp) {
  const dai = maker.service('token').getToken('ETH');
  const defaultAccount = maker.service('token').get('web3').currentAccount();
  const ethBalance = await dai.balanceOf(defaultAccount);

  const price = maker.service('price');
  const ethPrice = await price.getEthPrice();

  // console.log("eth price = " + ethPrice);
  // console.log("eth balance in wallet = " + ethBalance);

  let maxDebt = (ethPrice.toNumber() * ethBalance * 100) / MIN_RATIO;
  // console.log('max debt from Wallet = ' + maxDebt + ' ETH');
  return maxDebt;
}

const wipeDebtAsync = (maker, cdp) => async dispatch => {
  const defaultAccount = maker
    .service('token')
    .get('web3')
    .currentAccount();
  const dai = maker.service('token').getToken('DAI');
  const txn = await cdp.wipeDai(0.1);
  const balance = await dai.balanceOf(defaultAccount);

  console.log('Transaction from wiping Dai:', txn);
  console.log('Dai balance after wiping:', balance.toString());
  dispatch(daiWiped());
};

const shutCdpAsync = cdp => async dispatch => {
  const txn = await cdp.shut();
  console.log('Transaction from shutting the CDP:', txn);
  dispatch(cdpShut());
};


export const startAsync = () => async dispatch => {
  dispatch(started());
  const maker = Maker.create("kovan", {
    privateKey: "C87509A1C067BBDE78BEB793E6FA76530B6382A4C0241E5E4A9EC0A0F44DC0D3",
    overrideMetamask: true
  });
  console.log('maker:', maker);
  dispatch(makerCreated());

  await maker.authenticate();
  dispatch(makerAuthenticated());

  // get the CDP
  const cdp = await maker.getCdp(2824);
  console.dir(cdp);

  // total amount of possible debt is the sum of the two below
  await calcMaxDebtInCDP(maker, cdp);
  await calcMaxDebtFromWallet(maker, cdp);

  //const tokenService = maker.service('token').getToken('ETH');
  //console.dir(tokenService);

  //const balance = await dai.balanceOf(defaultAccount);
  //console.log("current eth balance: " + balance);



/*
  const cdp = await maker.openCdp();
  console.log('cdp:', cdp);
  dispatch(cdpOpened());
  const lockEthTx = await cdp.lockEth(0.01);
  console.log('transaction to lock eth:', lockEthTx);
  dispatch(ethLocked());
  await dispatch(drawDaiAsync(maker, cdp));
  await dispatch(wipeDebtAsync(maker, cdp));
  await dispatch(shutCdpAsync(cdp));
  */
};
