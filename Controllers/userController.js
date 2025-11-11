const Book = require("../Models/Book");

// Generate numeric random serial
function generateNumericSerial(length = 10) {
  let digits = "0123456789";
  let serial = "";
  for (let i = 0; i < length; i++) {
    serial += digits[Math.floor(Math.random() * digits.length)];
  }
  return serial;
}

exports.createBooks = async (req, res) => {
  try {
    const { bookName, count } = req.body;

    if (!bookName || !count) {
      return res.status(400).json({ message: "bookName and count are required" });
    }

    const createdBooks = [];

    for (let i = 0; i < count; i++) {
      let serialNumber = generateNumericSerial(10);

      // Ensure uniqueness
      let exists = await Book.findOne({ serialNumber });
      while (exists) {
        serialNumber = generateNumericSerial(10);
        exists = await Book.findOne({ serialNumber });
      }

      const newBook = await Book.create({
        serialNumber,
        bookName,
      });

      createdBooks.push(newBook);
    }

    return res.status(201).json({
      message: "Serial Numbers Generated Successfully",
      data: createdBooks,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};


exports.verifyBook = async (req, res) => {
    try {
      const { serialNumber, userName, phoneNumber } = req.body;
  
      if (!serialNumber || !userName || !phoneNumber) {
        return res.status(400).json({ message: "serialNumber, userName, and phoneNumber are required" });
      }
  
      // Find the book by serial
      const book = await Book.findOne({ serialNumber });
  
      if (!book) {
        return res.status(404).json({ message: "Invalid Serial Number" });
      }
  
      if (book.verified === true) {
        return res.status(400).json({ message: "This book is already verified" });
      }
  
      // Update verification status and user details
      book.verified = true;
      book.userName = userName;
      book.phoneNumber = phoneNumber;
  
      await book.save();
  
      return res.status(200).json({
        message: "Book verified successfully",
        data: book
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server Error" });
    }
  };