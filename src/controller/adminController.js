const { PrismaClient } = require("../../prisma/generated/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();
const jwtExpirySeconds = 86400;
const doAdminSignup = async (req, res) => {
  try {
    const { email, password, userName, userType } = req.body;
    console.log("email", email);
    console.log("password", password);
    console.log("userName", userName);
    console.log("userType", userType);

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

    const existingUser = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
        success: false,
      });
    }

    // Generate password hash
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user in the specific collection
    const admin = await prisma.adminUser.create({
      data: {
        email,
        password: passwordHash,
        userName, // Ensure you're passing userName correctly
        userType,
      },
    });

    console.log("New admin signed up:", admin);
    res.status(201).json({
      message: "Admin registered successfully!",
      result: admin,
      success: true,
    });
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

const doAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🚀 ~ doAdminLogin ~ email:", email);
    console.log("🚀 ~ doAdminLogin ~  email, password:", password);

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    // Retrieve user from the database
    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: jwtExpirySeconds }
    );

    // Destructure the admin object and omit the password field
    const { password: adminPassword, ...adminDataWithoutPassword } = admin;

    res.status(200).cookie("token", token, { httpOnly: false }).json({
      message: "Login Successful",
      success: true,
      admin: adminDataWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: error.message,
      message: "Login failed",
      success: false,
    });
  } finally {
    await prisma.$disconnect();
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Fetch all psychics from the database
    const users = await prisma.user.findMany({});

    res.status(200).json({
      message: "Users retrieved successfully",
      data: users,
      success: true,
    });
  } catch (error) {
    console.error("Error retrieving Users:", error);
    res.status(500).json({
      message: "Failed to retrieve Users",
      error,
      success: false,
    });
  }
};

const createBlog = async (req, res) => {
  const { title, doctorName, blogImageUrl, blogImageId, description, tags } =
    req.body;

  try {
    if (
      !title ||
      !blogImageUrl ||
      !blogImageId ||
      !description ||
      !doctorName
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create a new blog entry
    const newBlog = await prisma.blog.create({
      data: {
        title,
        blogImageUrl,
        blogImageId,
        description,
        doctorName,
        tags,
      },
    });

    return res
      .status(201)
      .json({ newBlog, success: true, message: "Blog created successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the blog" });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    // Fetch all psychics from the database
    const blogs = await prisma.blog.findMany({});
    console.log("blog", blogs);
    res.status(200).json({
      message: "Blogs retrieved successfully",
      data: blogs,
      success: true,
    });
  } catch (error) {
    console.error("Error retrieving Blogs:", error);
    res.status(500).json({
      message: "Failed to retrieve Blogs",
      error,
      success: false,
    });
  }
};

const deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await prisma.blog.delete({
      where: {
        id: id,
      },
    });

    res.status(200).json({ message: "Blog deleted successfully", blog });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the blog" });
  }
};

const updateBlog = async (req, res) => {
  const { id } = req.params;
  const inputData = req.body;

  // Initialize the updateData object
  const updateData = {};

  // Conditionally add fields to the updateData object
  if (inputData.doctorName !== undefined)
    updateData.doctorName = inputData.doctorName;
  if (inputData.title !== undefined) updateData.title = inputData.title;
  if (inputData.blogImageUrl !== undefined)
    updateData.blogImageUrl = inputData.blogImageUrl;
  if (inputData.blogImageId !== undefined)
    updateData.blogImageId = inputData.blogImageId;
  if (inputData.description !== undefined)
    updateData.description = inputData.description;

  // Ensure that tags are handled as an array
  if (Array.isArray(inputData.tags)) updateData.tags = inputData.tags;

  try {
    // Perform the update using Prisma
    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: updateData,
    });

    // Return success response
    res.status(200).json({
      message: "Blog Updated successfully",
      success: true,
      updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);

    // Handle blog not found error
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Handle internal server error
    res.status(500).json({ message: "Internal server error" });
  }
};

const getBlogById = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found", success: false });
    }

    res
      .status(200)
      .json({ blog, success: true, message: "Blog fetched successfully" });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

module.exports = {
  doAdminSignup,
  doAdminLogin,
  getAllUsers,
  createBlog,
  getAllBlogs,
  deleteBlog,
  updateBlog,
  getBlogById,
};
