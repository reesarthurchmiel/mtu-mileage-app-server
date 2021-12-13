var express = require("express");
var path = require("path");
var ObjectId = require("mongodb").ObjectId;

var db = require("./conn.js")
db.connectToServer();

var app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/places", function (req, res, next) {
    const dbConnect = db.getDb();

    dbConnect
        .collection("places")
        .find({})
        .toArray(function (err, result) {
            if (err) {
                res.status(500).send("Error fetching places");
            } else {
                res.json(result);
            }
        });
});

app.post("/places", function (req, res, next) {
    const dbConnect = db.getDb();

    dbConnect
        .collection("places")
        .insertOne({
            "name": req.body.name,
            "distanceFromBase": req.body.distanceFromBase,
            "distanceFromHome": req.body.distanceFromHome,
        })
        .then(() => res.send("Success"))
        .catch(() => res.status(400).send("Error saving place"))
})

app.delete("/places/:placeId", function (req, res, next) {
    console.log("Deleting place " + req.params.placeId)
    const dbConnect = db.getDb();

    const deletePlacePromise = dbConnect
        .collection("places")
        .deleteOne(
            { "_id": ObjectId(req.params.placeId) }
        )

    const deleteLogsPromise = dbConnect
        .collection("logs")
        .deleteMany(
            { "placeId": req.params.placeId }
        )
    Promise.all([deletePlacePromise, deleteLogsPromise])
        .then(() => res.send("Success"))
        .catch(() => res.status(400).send("Error deleting place"))
})

app.get("/logs", function (req, res, next) {
    const dbConnect = db.getDb();

    dbConnect
        .collection("logs")
        .find({})
        .toArray(function (err, result) {
            if (err) {
                res.status(500).send("Error fetching logs");
            } else {
                res.json(result);
            }
        });
});

app.put("/logs/:date", function (req, res, next) {
    console.log("Updating log " + req.params.date + " to " + req.body.placeId)
    const dbConnect = db.getDb();

    dbConnect
        .collection("logs")
        .updateOne(
            { "date": req.params.date },
            {
                $set: {
                    "placeId": req.body.placeId,
                }
            },
            { upsert: true } //Creates the document if it doesn't exist
        )
        .then(() => res.send("Success"))
        .catch(() => res.status(400).send("Error updating log"))
})

app.delete("/logs/:date", function (req, res, next) {
    console.log("Deleting log " + req.params.date)
    const dbConnect = db.getDb();

    dbConnect
        .collection("logs")
        .deleteOne(
            { "date": req.params.date }
        )
        .then(() => res.send("Success"))
        .catch(() => res.status(400).send("Error deleting log"))
})

module.exports = app;
