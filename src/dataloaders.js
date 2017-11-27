import DataLoader from 'dataloader';

async function batchUsers(Users, keys) {
  const users = await Users.find({ _id: { $in: keys } }).toArray();
  return users;
}

module.exports = ({ Users }) => ({
  userLoader: new DataLoader(
    keys => batchUsers(Users, keys),
    { cacheKeyFn: key => key.toString() }
  ),
});

