const stellarSDK = require('stellar-sdk')
//const YAML = require('node-yaml')
const admin = require('firebase-admin')
const serviceAccount = require('./badzbadtzdb-ce8ed1585b21.json')
//const conFile = 'config.yml'

//const accountName = 'BadzBadtz'
const startingBalance = '120'

var sourceSecretKey = 'SAKRB7EE6H23EF733WFU76RPIYOPEWVOMBBUXDQYQ3OF4NF6ZY6B6VLW'

var server = new stellarSDK.Server('https://horizon-testnet.stellar.org')
var masterKey = stellarSDK.Keypair.fromSecret(sourceSecretKey)
stellarSDK.Network.useTestNetwork()

//generateAccount(accountName)

async function generateAccount(accountName, callback) {
    let masterAccount
    try {
        masterAccount = await server.loadAccount(masterKey.publicKey())
    } catch (err) {
        console.log('Account Error: ', JSON.stringify(err, null, 4))
    }
    const acc = createAccount(accountName, masterAccount)
    try {
        console.log('Submit Account: ', accountName)
        console.log('account.pair.publicKey() = ', acc.pair.publicKey())
        await server.submitTransaction(acc.transaction)
    } catch (err) {
        console.log('Error: ', err.message, JSON.stringify(err.stack, null, 4))
    }

    saveToFirebase(accountName, acc.pair.publicKey(), acc.pair.secret())

    // config.accounts[accountName] = {
    //     public: acc.pair.publicKey(),
    //     secret: acc.pair.secret()
    // }
    
    // const config = {
    //     account: accountName,
    //     public: acc.pair.publicKey(),
    //     secret: acc.pair.secret()
    // }

    // YAML.writeSync(conFile, config)
     console.log('Success')
     callback(accountName)


}

function createAccount(name, masterAccount)
{
    const pair = stellarSDK.Keypair.random()

    const transaction = new stellarSDK.TransactionBuilder(masterAccount)
        .addOperation(stellarSDK.Operation.createAccount({
            destination: pair.publicKey(), asset: stellarSDK.Asset.native(), startingBalance
        })).build()
    transaction.sign(masterKey)
    
    return {
        transaction,
        pair
    }
}

function saveToFirebase(pAcc, pPub, pPriv)
{
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://badzbadtzdb.firebaseio.com'
    })

    const db = admin.database()
    const ref = db.ref('wallet')

    ref.push({
        accountName: pAcc,
        resKey: {
            private_key: pPriv,
            public_key: pPub
        }
    })
}

module.exports.generateAccount = generateAccount