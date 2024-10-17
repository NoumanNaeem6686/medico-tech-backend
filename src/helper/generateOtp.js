const otpGenerator = require("otp-generator");

const generateOTP = (length) => {
  return otpGenerator.generate(length, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
    digits: true,
  });
};

module.exports = { generateOTP };
