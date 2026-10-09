require("dotenv").config();
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const app = require("./src/app")
const connectToDB = require("./src/config/database")


connectToDB()

app.listen(3000, ()=>{
    console.log("Server is runing on port 3000")
})