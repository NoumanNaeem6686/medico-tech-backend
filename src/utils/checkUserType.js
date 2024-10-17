const checkUserType = (userType) => {
  // Assuming you have defined mongoose schemas for each user type (Admin, Assistant, RegularUser)
  let userDB;
  if (userType.toLowerCase() === "admin") {
    userDB = "AdminUser";
  }
  return userDB;
};

module.exports = { checkUserType };
