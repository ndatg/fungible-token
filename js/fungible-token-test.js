const TonWeb = require("tonweb");
const TonWebMnemonic = require('tonweb-mnemonic');
const { Address, BN } = require("tonweb").utils;
const { Cell } = require('tonweb').boc;
const FTContract = require('./fungible-token');

// UQDgp9u4yZiKRmYKKYR3p4NhcZZv3CPTNE67JJiCwPY2oMtq
const mnemonic = [
    'enjoy',   'pattern', 'drum',
    'fatigue', 'firm',    'collect',
    'close',   'abuse',   'myth',
    'divide',  'warfare', 'various',
    'fire',    'wide',    'spend',
    'turn',    'eager',   'illegal',
    'scan',    'denial',  'width',
    'connect', 'ten',     'romance'
];

const provider = new TonWeb.HttpProvider(
    'https://testnet.toncenter.com/api/v2/jsonRPC',
    { apiKey: '' }
);

const tonweb = new TonWeb(provider);

async function transfer(contract, keyPair, params) {
    const wallet = new tonweb.wallet.all.v3R1(provider, { publicKey: keyPair.publicKey, wc: 0 });
    const walletAddress = await wallet.getAddress();
    console.log('wallet address=', walletAddress.toString(true, true, false, false));

    const seqno = (await wallet.methods.seqno().call()) || 0;
    console.log('seqno=', seqno);

    console.log(
        await wallet.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: (await contract.getAddress()).toString(true, true, false, false),
            amount: TonWeb.utils.toNano('1'),
            seqno: seqno,
            payload: await contract.createTransferBody({
                receiver: params.receiver,
                amount: params.amount,
            }),
            sendMode: 64
        }).send()
    );
}

async function transferCall(contract, keyPair, params) {
    const wallet = new tonweb.wallet.all.v3R1(provider, { publicKey: keyPair.publicKey, wc: 0 });
    const walletAddress = await wallet.getAddress();
    console.log('wallet address=', walletAddress.toString(true, true, false, false));

    const seqno = (await wallet.methods.seqno().call()) || 0;
    console.log('seqno=', seqno);

    console.log(
        await wallet.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: (await contract.getAddress()).toString(true, true, false, false),
            amount: TonWeb.utils.toNano('1'),
            seqno: seqno,
            payload: await contract.createTransferCallBody({
                receiver: params.receiver,
                amount: params.amount,
                payload: params.payload
            }),
            sendMode: 64
        }).send()
    );
}

async function deploy(contract, keyPair) {
    const wallet = new tonweb.wallet.all.v3R1(provider, { publicKey: keyPair.publicKey, wc: 0 });
    const walletAddress = await wallet.getAddress();
    console.log('wallet address=', walletAddress.toString(true, true, false, false));

    const seqno = (await wallet.methods.seqno().call()) || 0;
    console.log('seqno=', seqno);

    console.log(
        await wallet.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: (await contract.getAddress()).toString(true, true, false, false),
            amount: TonWeb.utils.toNano('1'),
            seqno: seqno,
            payload: null, // body
            sendMode: 3,
            stateInit: (await contract.createStateInit()).stateInit
        }).send()
    );
}

async function mint(contract, keyPair, params) {
    const wallet = new tonweb.wallet.all.v3R1(provider, { publicKey: keyPair.publicKey, wc: 0 });
    const walletAddress = await wallet.getAddress();
    console.log('wallet address=', walletAddress.toString(true, true, false, false));

    const seqno = (await wallet.methods.seqno().call()) || 0;
    console.log('seqno=', seqno);

    console.log(
        await wallet.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: (await contract.getAddress()).toString(true, true, false, false),
            amount: TonWeb.utils.toNano('1'),
            seqno: seqno,
            payload: await contract.createMintBody({
                account: params.account,
                amount: params.amount,
            }),
            sendMode: 3
        }).send()
    );
}

async function burn(contract, keyPair, params) {
    const wallet = new tonweb.wallet.all.v3R1(provider, { publicKey: keyPair.publicKey, wc: 0 });
    const walletAddress = await wallet.getAddress();
    console.log('wallet address=', walletAddress.toString(true, true, false, false));

    const seqno = (await wallet.methods.seqno().call()) || 0;
    console.log('seqno=', seqno);

    console.log(
        await wallet.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: (await contract.getAddress()).toString(true, true, false, false),
            amount: TonWeb.utils.toNano('1'),
            seqno: seqno,
            payload: await contract.createBurnBody({
                account: params.account,
                amount: params.amount,
            }),
            sendMode: 3
        }).send()
    );
}

async function init() {
    // console.log(await TonWebMnemonic.generateMnemonic(24));
    const keyPair = await TonWebMnemonic.mnemonicToKeyPair(mnemonic);
    const wallet = new tonweb.wallet.all.v3R1(provider, { publicKey: keyPair.publicKey, wc: 0 });

    const contract = new FTContract(provider, {
        name: 'My Token',
        symbol: 'MTKN',
        icon: './icon.svg',
        spec: 'v1.0.0',
        decimals: 9,
        totalSupply: TonWeb.utils.toNano('0'),
        ownerAddr: new BN((await wallet.getAddress()).toString(false, true, false, false).split(':')[1], 16),
        salt: 1656344980470 // salt for unique address (timestamp, only for creation)
    });
    const contractAddress = await contract.getAddress();
    console.log('contract address= ', contractAddress.toString(true, true, false, false));

    // await deploy(contract, keyPair);

    // await mint(contract, keyPair, {
    //     account: new Address('UQDgp9u4yZiKRmYKKYR3p4NhcZZv3CPTNE67JJiCwPY2oMtq'),
    //     amount: TonWeb.utils.toNano('10')
    // });

    // await burn(contract, keyPair, {
    //     account: new Address('UQDgp9u4yZiKRmYKKYR3p4NhcZZv3CPTNE67JJiCwPY2oMtq'),
    //     amount: TonWeb.utils.toNano('5')
    // });

    // await transfer(contract, keyPair, {
    //     receiver: new Address('UQDAXtXKn0MwAPUFavqktTZ1_BFzmAUBh1L7So7IHub-3HNT'),
    //     amount: TonWeb.utils.toNano('1')
    // });

    // await transferCall(contract, keyPair, {
    //     receiver: new Address('UQDAXtXKn0MwAPUFavqktTZ1_BFzmAUBh1L7So7IHub-3HNT'),
    //     amount: TonWeb.utils.toNano('2'),
    //     payload: new Cell()
    // });

    // console.log(await contract.getMetadata());
    // console.log(await contract.getTotalSupply());
    console.log(await contract.getBalanceOf(new Address('UQDgp9u4yZiKRmYKKYR3p4NhcZZv3CPTNE67JJiCwPY2oMtq')));
    console.log(await contract.getBalanceOf(new Address('UQDAXtXKn0MwAPUFavqktTZ1_BFzmAUBh1L7So7IHub-3HNT')));
    // console.log(await contract.getAllowance(
    //     new Address('UQDgp9u4yZiKRmYKKYR3p4NhcZZv3CPTNE67JJiCwPY2oMtq'),
    //     new Address('UQDAXtXKn0MwAPUFavqktTZ1_BFzmAUBh1L7So7IHub-3HNT')
    // ));
    console.log(await contract.getCallback(0));
}

init();
