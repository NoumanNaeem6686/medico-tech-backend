const jwt = require("jsonwebtoken");
const verifyUser = async (req, res, next) => {
  try {
    console.log(
      "........................................................................"
    );
    const token = req.headers.authorization;
    console.log("token is ", token);

    // console.log("secret key", process.env.JWT_SECRET);
    // eslint-disable-next-line no-undef
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("decode", decode);
    if (decode) {
      //   if (req?.query?.value?.fetchCurrentUser) {
      req.userId = decode.userId;
      //   }
      next();
    } else {
      const response = {
        success: false,
        error: "user is not authorized",
        result: {
          message: "user is not authorized",
        },
      };
      res.status(400).json(response);
    }
  } catch (error) {
    console.log("error in verify user", error.message);
    const response = {
      success: false,
      error: "User is not authorized",
      result: {
        message: "User is not authorized",
      },
    };
    res.status(500).json(response);
  }
};

module.exports = { verifyUser };
