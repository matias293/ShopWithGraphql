const mongoose = require('mongoose');
const dbConnection = async() => {

    try {

        await mongoose.connect('mongodb+srv://user_api:awDKstgdMaZBp9qv@apicluster.0rim0.mongodb.net/api');
        console.log('BASE DE DATOS ONLINE')
        

    } catch (error) {
        console.log(error);
        throw new Error('Error a la hora de iniciar la base de datos');
    }


}

module.exports = {
    dbConnection
}
    