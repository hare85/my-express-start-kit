import { MongoClient, Logger } from 'mongodb';
import config from 'config';

module.exports = async () => {
  const db = await MongoClient.connect(config.get('mongodb'));

  let logCount = 0;
  Logger.setCurrentLogger((msg) => {
    logCount += 1;
    console.log(`MONGO DB REQUEST ${logCount}: ${msg}`);
  });
  Logger.setLevel('debug');
  Logger.filter('class', ['Cursor']);

  return {
    Links: db.collection('links'),
    Users: db.collection('users'),
    Votes: db.collection('votes'),
  };
};
