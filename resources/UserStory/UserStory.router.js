const passport = require("passport");
const { updateUserStory, deleteUserStory } = require("./UserStory.controller");
module.exports = function (app) {
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
