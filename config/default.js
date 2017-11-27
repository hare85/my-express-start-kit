
module.exports = {
  port: process.env.PORT || 5000,
  logLevel: process.env.LOGLEVEL || 'debug',

  mongodb: 'mongodb://0.0.0.0:27017/hackernews',
};
