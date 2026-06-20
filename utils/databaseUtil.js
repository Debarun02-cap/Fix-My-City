//External Module
const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

// NOTE: connection string is currently hard-coded.
// In a real app you should move this to an environment variable.
const MONGO_URL = "mongodb+srv://root:debarun@debarundb.ue3zl4s.mongodb.net/";

let _db;

// Initialize MongoDB connection and cache the db instance
const dbConnect = (callback) => {
  MongoClient.connect(MONGO_URL)
    .then((client) => {
      // Explicitly use the FixMyCity database
      _db = client.db('FixMyCity');
      if (callback) callback(_db);
    })
    .catch((err) => {
      console.log('MongoDB connection error:', err);
      throw err;
    });
};

// Get the cached db instance after connection
const getDb = () => {
  if (!_db) {
    throw new Error('No database found! Have you called dbConnect()?');
  }
  return _db;
};

module.exports = {
  dbConnect,
  getDb
};