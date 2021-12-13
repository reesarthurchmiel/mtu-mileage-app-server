const { MongoClient } = require("mongodb");
const connectionString = process.env.DB_URL;
const client = new MongoClient(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let dbConnection;

module.exports = {
    connectToServer: function () {
        client.connect(function (err, db) {
            if (err || !db) {
                console.error("Couldn't connect to MongoDB. Have you run mongod and specified the connection url in $DB_URL?")
            }

            dbConnection = db.db("mtu");
            console.log("Successfully connected to MongoDB.");
        });
    },

    getDb: function () {
        return dbConnection;
    },
};