
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin=require('../Models/Admin')
const Book = require("../Models/Book");
/* ================= USER REGISTRATION ================= */
exports.registerUser = async (req, res) => {

  try {

    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await Admin.create({
      name,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error" ,error});
  }
};

/* ================= USER LOGIN ================= */
exports.loginUser = async (req, res) => {

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await Admin.findOne({ name:username });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
      }
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error",error:error });
  }
};

exports.getBookStats = async (req, res) => {
  try {
    const stats = await Book.aggregate([
      {
        $facet: {
          // 🔹 Overall counts
          summary: [
            {
              $group: {
                _id: null,
                totalBooks: { $sum: 1 },
                verifiedBooks: {
                  $sum: { $cond: ["$verified", 1, 0] }
                },
                unverifiedBooks: {
                  $sum: { $cond: ["$verified", 0, 1] }
                }
              }
            }
          ],

          // 🔹 Month-wise verified count
          monthlyVerified: [
            {
              $match: {
                verified: true,
                verifiedAt: { $ne: null }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: "$verifiedAt" },
                  month: { $month: "$verifiedAt" }
                },
                count: { $sum: 1 }
              }
            },
            {
              $sort: {
                "_id.year": 1,
                "_id.month": 1
              }
            }
          ]
        }
      }
    ]);

    const summary = stats[0].summary[0] || {
      totalBooks: 0,
      verifiedBooks: 0,
      unverifiedBooks: 0
    };

    res.status(200).json({
      success: true,
      data: {
        ...summary,
        monthlyVerified: stats[0].monthlyVerified
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


