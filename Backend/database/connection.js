const mongoose = require('mongoose');
const dotenv = require('dotenv')
dotenv.config()
const dbConnection = async() => {

    try {

        await mongoose.connect(process.env.MONGO);
        console.log('BASE DE DATOS ONLINE')
        

    } catch (error) {
        console.log(error);
        throw new Error('Error a la hora de iniciar la base de datos');
    }


}

module.exports = {
    dbConnection
}
    