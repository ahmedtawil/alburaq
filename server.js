const app = require('./app')
const connectDatabase = require('./configs/dataBase')
const host = 'localhost'
app.listen(process.env.PORT , _=> {
    connectDatabase()
    console.log(`server started at port ${process.env.PORT} : host: http://${host}:${process.env.PORT}`)
})