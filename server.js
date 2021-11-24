const app = require('./app')
const connectDatabase = require('./configs/dataBase')

app.listen(process.env.PORT , _=> {
    connectDatabase()
    console.log(`server started at port ${process.env.PORT}`)
})