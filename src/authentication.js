const HEADER_REGEX = /bearer token-(.*)$/;

module.exports.authenticate = async ({ headers: { authorization } }, Users) => {
  const email = authorization && HEADER_REGEX.exec(authorization)[1];
  const user = await Users.findOne({ email });
  return email && user;
};
