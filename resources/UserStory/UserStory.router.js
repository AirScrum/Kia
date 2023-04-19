const passport = require("passport");
const { updateUserStory } = require("./UserStory.controller");
module.exports = function (app) {
  app.put(
    "/userstories/:id",
    passport.authenticate("jwt", { session: false }),
    updateUserStory
  );
};
