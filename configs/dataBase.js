const mongoose = require('mongoose');
const connectDatabase = () => {
    mongoose.connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true, //this is the code I added that solved it all
      
    }).then(async(con) => {
       // new Department({title:'sdfsd'}).save()
        console.log(`MongoDB Database connected with HOST: ${con.connection.host}`)
    })
}

module.exports = connectDatabase