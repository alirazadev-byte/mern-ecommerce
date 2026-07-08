const  mongoose = require("mongoose")

const DBconfing = () => {
    
mongoose.connect(process.env.MONGODB_CLOUD)
.then(conn => console.log(`DB Connected With ${conn.connection.host}`))
.catch(err => console.log(`DB Connection Is Failed.... ${err.message}`));
}

module.exports = DBconfing 