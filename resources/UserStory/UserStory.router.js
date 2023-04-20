const passport = require("passport");
const {
  updateUserStory,
  deleteUserStory,
  createUserStory,
} = require("./UserStory.controller");
module.exports = function (app) {
  app.post(
    "/userstories/",
    passport.authenticate("jwt", { session: false }),
    createUserStory
  );
  app.put(
    "/userstories/:id",
    passport.authenticate("jwt", { session: false }),
    updateUserStory
  );
  app.delete(
    "/userstories/:id",
    passport.authenticate("jwt", { session: false }),
    deleteUserStory
  );
};
