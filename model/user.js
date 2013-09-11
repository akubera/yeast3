/*
 *  user.js.default
 *
 *  Dead simple model of a user.. They have a name.  Period.
 */

function User(name) {
  this.name = name;
  return this;
}

module.exports = User;


