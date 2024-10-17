const express = require("express");
const routes = express.Router();
const {
  doSignup,
  doLogin,
  doFetchCurrentUser,
  bookMeeting
 
} = require("../controller/userController");
const { verifyUser } = require("../utils/verifyUser");

routes.post("/signupUser", doSignup);
routes.post("/loginUser", doLogin);
routes.post("/book-meeting", bookMeeting);
// routes.put("/update-user/:id", doUpdateUser);
// routes.put("/updatePassword/:id", updatePassword);

routes.get("/fetchCurrentUser", verifyUser, doFetchCurrentUser);
// routes.get("/getAllUsers", getAllUsers);

// routes.get("/generate-token/:userId", generateToken);

module.exports = routes;
