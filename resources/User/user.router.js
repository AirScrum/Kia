const {
  createUser,
  getUser,
  removeUser,
  updateUser,
} = require("./user.controller");

module.exports = function (app) {
  /**
   *
   * User CRUD routes
   *
   */
  app.post("/users", createUser);
  app.get("/users", getUser);
  app.put("/users", updateUser);
  app.delete("/users", removeUser);
};
