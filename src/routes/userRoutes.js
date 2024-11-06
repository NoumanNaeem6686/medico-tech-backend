const express = require("express");
const routes = express.Router();
const {
  doSignup,
  doLogin,
  doFetchCurrentUser,
  bookMeeting,
  bookAudit,
  getAllAudits,
  contactUs,
  getAllContacts,
} = require("../controller/userController");
const { verifyUser } = require("../utils/verifyUser");

routes.post("/signupUser", doSignup);
routes.post("/loginUser", doLogin);
routes.post("/book-meeting", bookMeeting);
routes.post("/book-audit", bookAudit);
routes.get("/get-all-audits", getAllAudits);
routes.post("/contact-us", contactUs);
routes.get("/get-all-contacts", getAllContacts);
// routes.put("/update-user/:id", doUpdateUser);
// routes.put("/updatePassword/:id", updatePassword);

routes.get("/fetchCurrentUser", verifyUser, doFetchCurrentUser);
// routes.get("/getAllUsers", getAllUsers);

// routes.get("/generate-token/:userId", generateToken);

module.exports = routes;
