const mongoUser = process.env.MONGO_USER;
const mongoUserPassword = process.env.MONGO_USER_PASSWORD;
const mongoDatabase = process.env.MONGO_DATABASE;
console.log(
  '[mongo-init.js] connecting user ' +
    mongoUser +
    ' to mongo database ' +
    mongoDatabase,
);

const db = new Mongo().getDB(mongoDatabase);
db.createUser({
  user: mongoUser,
  pwd: mongoUserPassword,
  roles: [{ role: 'readWrite', db: mongoDatabase }],
});
