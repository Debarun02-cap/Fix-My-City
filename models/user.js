// Local Modules
const { getDb } = require('../utils/databaseUtil');

module.exports = class User {
  constructor(firstname, lastname, email, mobile, address, city, state, aadhar, password, role) {
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email;
    this.mobile = mobile;
    this.address = address;
    this.city = city;
    this.state = state;
    this.aadhar = aadhar;
    this.password = password; // NOTE: plain text for demo; hash in real apps
    this.role = role;
  }

  save() {
    const db = getDb();
    this.id = Math.random().toString();
    return db
      .collection('users')
      .insertOne(this)
      .then(() => {
        console.log('User saved to MongoDB');
      })
      .catch(err => {
        console.error('Error saving user:', err);
      });
  }

  // Find by email OR mobile + password + role
  static findByCredentials(identifier, password, role, callback) {
    const db = getDb();
    db.collection('users')
      .findOne({
        role,
        password,
        $or: [{ email: identifier }, { mobile: identifier }]
      })
      .then(user => {
        callback(user || null);
      })
      .catch(err => {
        console.error('Error finding user by credentials:', err);
        callback(null);
      });
  }
}


