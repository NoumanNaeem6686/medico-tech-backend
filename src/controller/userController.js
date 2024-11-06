const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("../../prisma/generated/client");
const { generateToken04 } = require("../utils/TokenGenerator");

const prisma = new PrismaClient();
require("dotenv").config();
const doSignup = async (req, res) => {
  try {
    const { email, password, userName, userType, mobileNo } = req.body;
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
        success: false,
      });
    }
    if (
      !password.match(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)
    ) {
      return res.status(400).json({
        message:
          "Password must include uppercase, lowercase, number, and special character.",
        success: false,
      });
    }

    // Check the userType and select the correct model
    let model;
    if (userType === "admin") {
      model = prisma.adminUser;
    } else {
      model = prisma.user;
    }

    // Check if the user already exists in the specific collection
    const existingUser = await model.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
        success: false,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await model.create({
      data: {
        email,
        password: passwordHash,
        userName,
        userType,
        mobileNo,
      },
    });

    console.log("New user created:", newUser);
    res
      .status(201)
      .json({ message: "Signup successful!", result: newUser, success: true });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      error: error.message,
      message: "Signup Failed",
      success: false,
    });
  } finally {
    await prisma.$disconnect();
  }
};

const doLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🚀 ~ doLogin ~ email:", email);
    console.log("🚀 ~ doLogin ~ password:", password);

    // Attempt to find the user in the User collection
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "Wrong Email",
        success: false,
      });
    }
    console.log("user in login ", user);

    // Log the password for debugging purposes (in production, you should avoid logging sensitive information)
    console.log("User's password in DB:", user.password);

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    console.log("🚀 ~ doLogin ~ isPasswordMatch:", isPasswordMatch);
    if (!isPasswordMatch) {
      return res.status(401).json({
        error: "Invalid password",
        message: "Invalid password",
        success: false,
      });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "5 days",
    });
    console.log("🚀 ~ doLogin ~ token:", token);

    // Exclude the password from the response
    const { password: pass, ...rest } = user;

    res
      .status(200)
      .cookie("access_token", token, { httpOnly: true })
      .json({ message: "user login successfully", user: rest, token: token });
  } catch (error) {
    console.log("error", error.message);
    return res.status(500).json({
      error: error.message,
      message: "Login unsuccessful",
      success: false,
    });
  } finally {
    await prisma.$disconnect();
  }
};

const getAllAudits = async (req, res) => {
  try {
    // Fetch all audits from the database
    const audits = await prisma.audit.findMany();

    // Respond with success message and data
    res.status(200).json({
      message: "Audits retrieved successfully",
      data: audits,
      success: true,
    });
  } catch (error) {
    console.error("Error retrieving audits:", error);
    res.status(500).json({
      message: "Failed to retrieve audits",
      error: error.message,
      success: false,
    });
  } finally {
    await prisma.$disconnect();
  }
};

const doFetchCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("user id", userId);
    console.log("user id", userId);

    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    console.log("user in login ", user);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "User not found",
        success: false,
      });
    }

    console.log("user in login ", user);
    const response = {
      message: "successfull",
      user,
    };
    console.log("🚀 ~ doFetchCurrentUser ~ response:", response);
    return res.status(200).json(response);
  } catch (error) {
    console.log("error in fetching current user", error.message);
    const response = {
      error,
      success: false,
      message: "unsuccessfull",
    };
    return res.status(500).json(response);
  } finally {
    await prisma.$disconnect();
  }
};

const bookMeeting = async (req, res) => {
  try {
    const {
      email,
      userName,
      bookingDate,
      contactNo,
      purpose,
      meetingTime,
      contactType,
    } = req.body;

    // Validate required fields
    if (
      !email ||
      !userName ||
      !bookingDate ||
      !contactNo ||
      !purpose ||
      !meetingTime ||
      !contactType
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Save the meeting details to the database
    const newMeeting = await prisma.meeting.create({
      data: {
        email,
        userName,
        bookingDate: new Date(bookingDate),
        contactNo,
        purpose,
        meetingTime,
        contactType,
      },
    });

    // Respond with success message
    res.status(201).json({
      message: "Meeting booked successfully!",
      meeting: newMeeting,
      success: true,
    });
  } catch (error) {
    console.error("Error booking meeting:", error);
    res.status(500).json({
      message: "Failed to book meeting",
      error: error.message,
      success: false,
    });
  } finally {
    await prisma.$disconnect();
  }
};

const bookAudit = async (req, res) => {
  try {
    const {
      email,
      userName,
      bookingDate,
      contactNo,
      purpose,
      meetingTime,
      contactType,
    } = req.body;

    // Validate required fields
    if (
      !email ||
      !userName ||
      !bookingDate ||
      !contactNo ||
      !purpose ||
      !meetingTime ||
      !contactType
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Save the audit booking details to the database
    const newAudit = await prisma.audit.create({
      data: {
        email,
        userName,
        bookingDate: new Date(bookingDate),
        contactNo,
        purpose,
        meetingTime,
        contactType,
      },
    });

    // Respond with success message
    res.status(201).json({
      message: "Audit booked successfully!",
      audit: newAudit,
      success: true,
    });
  } catch (error) {
    console.error("Error booking audit:", error);
    res.status(500).json({
      message: "Failed to book audit",
      error: error.message,
      success: false,
    });
  } finally {
    await prisma.$disconnect();
  }
};

const contactUs = async (req, res) => {
  try {
    const { name, email, contactNo, message, contactType } = req.body;

    // Validate required fields
    if (!name || !email || !contactNo || !message || !contactType) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Validate contact type (optional validation based on your requirements)
    if (contactType !== "audio" && contactType !== "video") {
      return res.status(400).json({
        message: "Invalid contact type. It must be 'audio' or 'video'.",
        success: false,
      });
    }

    // Save the contact request to the database
    const newContact = await prisma.contact.create({
      data: {
        name,
        email,
        contactNo,
        message,
        contactType,
      },
    });

    // Respond with success message
    res.status(201).json({
      message: "Contact request created successfully!",
      contact: newContact,
      success: true,
    });
  } catch (error) {
    console.error("Error creating contact request:", error);
    res.status(500).json({
      message: "Failed to create contact request",
      error: error.message,
      success: false,
    });
  } finally {
    await prisma.$disconnect();
  }
};

// const doUpdateUser = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const {
//       // email,
//       oldPassword,
//       password,
//       userName,
//       // userType,
//       // loginType,
//       languages,
//       country,
//       mobileNo,
//       cardHolderName,
//       cardNumber,
//       cardExpireDate,
//       cardCvv,
//     } = req.body;

//     // Fetch the user by ID from the database
//     const userToUpdate = await prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (!userToUpdate) {
//       return res
//         .status(404)
//         .json({ message: "User not found", success: false });
//     }

//     // Check if email is changed and already exists for another user
//     // if (email && email !== userToUpdate.email) {
//     //     const emailExists = await prisma.user.findUnique({
//     //         where: { email },
//     //     });
//     //     if (emailExists) {
//     //         return res.status(409).json({ message: "Email already in use", success: false });
//     //     }
//     // }
//     let newPassword;
//     if (password && oldPassword) {
//       if (password.length < 8) {
//         return res.status(400).json({
//           message: "Password must be at least 8 characters long.",
//           success: false,
//         });
//       }
//       if (
//         !password.match(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)
//       ) {
//         return res.status(400).json({
//           message:
//             "Password must include uppercase, lowercase, number, and special character.",
//           success: false,
//         });
//       }
//       // Compare password
//       const isPasswordMatch = await bcrypt.compare(
//         oldPassword,
//         userToUpdate.password
//       );
//       console.log("🚀 ~ doLogin ~ isPasswordMatch:", isPasswordMatch);
//       if (!isPasswordMatch) {
//         return res.status(401).json({
//           error: "Invalid password",
//           message: "Invalid password",
//           success: false,
//         });
//       } else {
//         const salt = await bcrypt.genSalt(10);
//         newPassword = await bcrypt.hash(password, salt);
//       }
//     }

//     // Update user information
//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: {
//         ...(userName && { userName }),
//         ...(newPassword && { password: newPassword }),
//         ...(mobileNo && { mobileNo }),
//         ...(country && { country }),
//         ...(languages?.length && { languages }),
//         ...(cardHolderName && { cardHolderName }),
//         ...(cardNumber && { cardNumber }),
//         ...(cardExpireDate && { cardExpireDate }),
//         ...(cardCvv && { cardCvv }),
//         // userName: userName || userToUpdate.userName,
//         // // email: email || userToUpdate.email,
//         // password: newPassword,
//         // mobileNo: mobileNo || userToUpdate.mobileNo,
//         // country: country || userToUpdate.country,
//         // languages: languages || userToUpdate.languages,
//       },
//     });
//     delete updatedUser.password;
//     res.status(200).json({
//       result: {
//         data: updatedUser,
//         message: "User Upaded successfully",
//       },
//       success: true,
//     });
//   } catch (error) {
//     console.error("Update error:", error);
//     res.status(500).json({
//       error: error.message,
//       message: "Update Failed",
//       success: false,
//     });
//   } finally {
//     await prisma.$disconnect();
//   }
// };

// const getAllUsers = async (req, res) => {
//   try {
//     // Fetch all psychics from the database
//     const users = await prisma.user.findMany({
//       include: {
//         // payment: true,
//         paymentHistory: true,
//         wallet: true,
//         history: {
//           select: {
//             id: true,
//             serviceType: true,
//             selectedTime: true,
//             selectedTimeType: true,
//             psychic: {
//               select: {
//                 blockedCustomers: true,
//                 id: true,
//                 name: true,
//                 email: true,
//                 price: true,
//                 reviews: true,
//                 notes: true,
//               },
//             },
//             createdAt: true,
//           },
//         },
//       },
//     });

//     res.status(200).json({
//       message: "Users retrieved successfully",
//       data: users,
//       success: true,
//     });
//   } catch (error) {
//     console.error("Error retrieving Users:", error);
//     res.status(500).json({
//       message: "Failed to retrieve Users",
//       error,
//       success: false,
//     });
//   }
// };

// const updatePassword = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const { currentPassword, newPassword } = req.body;

//     // Fetch the user by ID from the database
//     const userToUpdate = await prisma.psychics.findUnique({
//       where: { id: userId },
//     });

//     if (!userToUpdate) {
//       return res
//         .status(404)
//         .json({ message: "User not found", success: false });
//     }

//     // Compare current password
//     const isPasswordMatch = await bcrypt.compare(
//       currentPassword,
//       userToUpdate.password
//     );
//     if (!isPasswordMatch) {
//       return res.status(401).json({
//         message: "Current password is incorrect",
//         success: false,
//       });
//     }

//     // Validate new password
//     if (newPassword.length < 8) {
//       return res.status(400).json({
//         message: "Password must be at least 8 characters long.",
//         success: false,
//       });
//     }
//     if (
//       !newPassword.match(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)
//     ) {
//       return res.status(400).json({
//         message:
//           "Password must include uppercase, lowercase, number, and special character.",
//         success: false,
//       });
//     }

//     // Generate new password hash
//     const salt = await bcrypt.genSalt(10);
//     const newPasswordHash = await bcrypt.hash(newPassword, salt);

//     // Update password in the database
//     const updatedUser = await prisma.psychics.update({
//       where: { id: userId },
//       data: {
//         password: newPasswordHash,
//       },
//     });

//     res.status(200).json({
//       message: "Password updated successfully",
//       success: true,
//     });
//   } catch (error) {
//     console.error("Update password error:", error);
//     res.status(500).json({
//       error: error.message,
//       message: "Password update failed",
//       success: false,
//     });
//   } finally {
//     await prisma.$disconnect();
//   }
// };

module.exports = {
  doSignup,
  doLogin,
  doFetchCurrentUser,
  bookMeeting,
  bookAudit,
  getAllAudits,
  contactUs,
};
