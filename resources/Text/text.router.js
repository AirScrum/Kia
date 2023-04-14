const passport = require("passport");
const { deleteMeeting } = require("./text.controller");
module.exports = function (app) {
  app.delete(
    "/history/:meetingID",
    passport.authenticate("jwt", { session: false }),
    deleteMeeting
  );
};
