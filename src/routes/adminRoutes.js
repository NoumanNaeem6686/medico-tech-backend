const express = require("express");
const routes = express.Router();
const {
  doAdminSignup,
  doAdminLogin,
  getAllUsers,
  createBlog,
  getAllBlogs,
  deleteBlog,
  updateBlog,

  getBlogById,
} = require("../controller/adminController");
// user routes..///
routes.post("/signUpAdmin", doAdminSignup);
routes.post("/signInAdmin", doAdminLogin);
routes.get("/getAllUsers", getAllUsers);
///Blogs../
routes.post("/create-blog", createBlog);
routes.get("/all-blogs", getAllBlogs);
routes.delete("/delete-blog/:id", deleteBlog);
routes.put("/update-blog/:id", updateBlog);
routes.get("/get-blog/:id", getBlogById);

module.exports = routes;
