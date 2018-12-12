const express = require('express')
const app = express()
const helmet = require('helmet')

const getAcc = require('./genAccount.js')

app.use(helmet())
app.listen(10000,() => {console.log('Connection Successfully: 10000')})
console.log('Start!!!')

app.get('/Test/Stellar/:pMail', (req, res) => {
    let {pMail} = req.params
    getAcc.generateAccount(pMail, function(r)  
    {
        res.write('Success')
        res.end()
    })
})
