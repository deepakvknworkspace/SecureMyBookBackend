const Book = require("../Models/Book");
const { randomUUID } = require('crypto');
const ExcelJS = require('exceljs');

// Generate numeric random serial
function generateNumericSerial(length = 10) {
  let digits = "0123456789";
  let serial = "";
  for (let i = 0; i < length; i++) {
    serial += digits[Math.floor(Math.random() * digits.length)];
  }
  return serial;
}

exports.generateBooks = async (req, res) => {
    try {
      const { bookName, count } = req.body;
  
      if (!bookName || !count) {
        return res.status(400).json({ message: "bookName and count are required." });
      }
  
      const numberOfBooks = parseInt(count);
      if (isNaN(numberOfBooks) || numberOfBooks <= 0) {
        return res.status(400).json({ message: "count must be a positive number." });
      }
  
      const booksToInsert = [];
  
      for (let i = 0; i < numberOfBooks; i++) {
        let serialNumber;
        let isUnique = false;
  
        // ensure unique serial number
        while (!isUnique) {
          serialNumber = randomUUID(); // generates a random unique ID
          const exists = await Book.findOne({ serialNumber });
          if (!exists) isUnique = true;
        }
  
        booksToInsert.push({
          bookName,
          serialNumber,
        });
      }
  
      const createdBooks = await Book.insertMany(booksToInsert);
  
      return res.status(201).json({
        message: `${createdBooks.length} books created successfully.`,
        books: createdBooks,
      });
    } catch (error) {
      console.error("Error generating books:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
  


exports.verifyBook = async (req, res) => {
    try {
      const { serialNumber, userName, phoneNumber } = req.body;
  
      if (!serialNumber || !userName || !phoneNumber) {
        return res.status(400).json({ message: "This copy of the book i a pirated version" });
      }
  
      // Find the book by serial
      const book = await Book.findOne({ serialNumber });
  
      if (!book) {
        return res.status(404).json({ message: "This copy of the book i a pirated version" ,success:false});
      }
  
      if (book.verified === true) {
        return res.status(400).json({ message: "This book is already verified" ,success:false});
      }
  
      // Update verification status and user details
      book.verified = true;
      book.userName = userName;
      book.phoneNumber = phoneNumber;
  
      await book.save();
  
      return res.status(200).json({
        message: "Book verified successfully",
        data: book,
        success:true
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server Error" ,success:false});
    }
  };


//   exports.getUnverifiedBookUrls = async (req, res) => {
//     try {
//         // 1️⃣ Fetch all unverified books
//         const unverifiedBooks = await Book.find({ verified: false }, 'serialNumber');
        
//         // 2️⃣ Prepare URLs
//         const domain = 'https://www.securemybook.com/';
//         const urls = unverifiedBooks.map(book => `${domain}${book.serialNumber}`);
    
//         // 3️⃣ Create a new workbook and worksheet
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet('Unverified Books');
    
//         // 4️⃣ Add header
//         worksheet.columns = [{ header: 'URLs', key: 'url', width: 50 }];
    
//         // 5️⃣ Add all URLs as rows
//         urls.forEach(url => worksheet.addRow({ url }));
    
//         // 6️⃣ Set response headers for Excel download
//         res.setHeader(
//           'Content-Type',
//           'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//         );
//         res.setHeader(
//           'Content-Disposition',
//           'attachment; filename="Unverified_Books.xlsx"'
//         );
    
//         // 7️⃣ Write Excel file to response
//         await workbook.xlsx.write(res);
//         res.status(200).end();
//       } catch (error) {
//         console.error('Error generating Excel file:', error);
//         res.status(500).json({
//           success: false,
//           message: 'Server error while generating Excel file',
//         });
//       }
//   };
exports.getUnverifiedBookUrls = async (req, res) => {
    try {
      // 1️⃣ Fetch latest 200 unverified books (sorted by newest first)
      const unverifiedBooks = await Book.find(
        { verified: false },
        'serialNumber'
      )
        .sort({ createdAt: -1 }) // newest first
        .limit(200);
  
      // 2️⃣ Prepare URLs
      const domain = 'https://www.securemybook.com/';
      const urls = unverifiedBooks.map(book => `${domain}${book.serialNumber}`);
  
      // 3️⃣ Create workbook and sheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Unverified Books');
  
      // 4️⃣ Add header
      worksheet.columns = [{ header: 'URLs', key: 'url', width: 50 }];
  
      // 5️⃣ Add rows
      urls.forEach(url => worksheet.addRow({ url }));
  
      // 6️⃣ Excel response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="Latest_200_Unverified_Books.xlsx"'
      );
  
      // 7️⃣ Send Excel file
      await workbook.xlsx.write(res);
      res.status(200).end();
  
    } catch (error) {
      console.error('Error generating Excel file:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while generating Excel file',
      });
    }
  };
  