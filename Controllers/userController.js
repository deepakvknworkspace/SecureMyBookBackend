const Book = require("../Models/Book");
const ErrorBook = require("../Models/Error");
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

        await ErrorBook.create({
          serialNumber: serialNumber || "UNKNOWN",
          phoneNumber,
          verifiedBy:userName,
          bookName: "",
          errorMessage: "Missing required fields"
        });
        return res.status(400).json({ message: "This copy of the book i a pirated version" });
      }
  
      // Find the book by serial
      const book = await Book.findOne({ serialNumber });
  
      if (!book) {

        await ErrorBook.create({
          serialNumber,
          phoneNumber,
          verifiedBy:userName,
          bookName: "",
          errorMessage: "Serial number does not exist / pirated copy"
        });

        return res.status(404).json({ message: "This copy of the book i a pirated version" ,success:false});
      }
  
      if (book.verified === true) {


        if (book.phoneNumber === phoneNumber) {
        return res.status(200).json({
          message: "This book is already verified by you",
          verifiedBy: {
            name: book.userName,
            phone: book.phoneNumber
          },
          success: true
        });
      }

        await ErrorBook.create({
          serialNumber,
          phoneNumber,
          verifiedBy:userName,
          bookName: book.bookName,
          errorMessage: "Book already verified"
        });
        
        return res.status(400).json({ message: "This book is already verified" ,success:false});
      }
  
      // Update verification status and user details
      book.verified = true;
      book.userName = userName;
      book.phoneNumber = phoneNumber;
      book.verifiedAt = new Date();
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
        .limit(20500);
  
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
        'attachment; filename="Latest_2O500_Unverified_Books.xlsx"'
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
  

// exports.getAllErrorBooks = async (req, res) => {
//   try {
//     const result = await ErrorBook.aggregate([
//       {
//         $lookup: {
//           from: "books",                 // collection name in MongoDB
//           localField: "serialNumber",    // field in ErrorBook
//           foreignField: "serialNumber",  // field in Book
//           as: "originalBookData"
//         }
//       },
//       {
//         $addFields: {
//           originalBookData: { $arrayElemAt: ["$originalBookData", 0] }
//         }
//       }
//     ]);

//     return res.status(200).json({
//       success: true,
//       data: result
//     });

//   } catch (error) {
//     console.error("Error fetching data:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };


exports.getAllErrorBooks = async (req, res) => {
  try {
    // Fetch all errorBooks
    const errors = await ErrorBook.find().lean();

    const rows = [];

    for (const err of errors) {
      const book = await Book.findOne({ serialNumber: err.serialNumber }).lean();

      rows.push({
        serialNumber: err.serialNumber,
        verifiedByPhone: book ? book.phoneNumber : "Not Verified",
        verifiedByName: book ? book.userName : "Not Verified",
        errorPhoneNumber: err.phoneNumber,
        errorMessage: err.errorMessage,
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Error Books Report");

    worksheet.addRow([
      "Serial Number",
      "Verified By (Name)",
      "Verified By (Phone)",
      "Error Phone Number",
      "Error Message",
    ]);

    rows.forEach((row) => {
      worksheet.addRow([
        row.serialNumber,
        row.verifiedByName,
        row.verifiedByPhone,
        row.errorPhoneNumber,
        row.errorMessage,
      ]);
    });

    const fileName = "ErrorBooksReport.xlsx";

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Excel Generate Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error generating Excel",
    });
  }
};



exports.fillVerifiedAtForVerifiedBooks = async (req, res) => {
  try {
    // 1️⃣ Find verified books WITHOUT verifiedAt
    const verifiedBooks = await Book.find({
      verified: true,
      $or: [
        { verifiedAt: { $exists: false } },
        { verifiedAt: null }
      ]
    }).select('_id');

    const totalVerifiedBooks = verifiedBooks.length;

    if (totalVerifiedBooks === 0) {
      return res.status(200).json({
        message: 'No verified books found without verifiedAt',
        totalVerifiedBooks: 0
      });
    }

    // 2️⃣ Split into halves
    const half = Math.floor(totalVerifiedBooks / 2);

    const firstHalfIds = verifiedBooks
      .slice(0, half)
      .map(book => book._id);

    const secondHalfIds = verifiedBooks
      .slice(half)
      .map(book => book._id);

    // 3️⃣ Dates
    const novDate = new Date('2025-11-20T00:00:00Z');
    const decDate = new Date('2025-12-20T00:00:00Z');

    // 4️⃣ Update first half
    const novUpdate = await Book.updateMany(
      { _id: { $in: firstHalfIds } },
      { $set: { verifiedAt: novDate } }
    );

    // 5️⃣ Update second half
    const decUpdate = await Book.updateMany(
      { _id: { $in: secondHalfIds } },
      { $set: { verifiedAt: decDate } }
    );

    // 6️⃣ Response
    res.status(200).json({
      message: 'VerifiedAt field filled successfully',
      totalVerifiedBooks,
      nov20Updated: novUpdate.modifiedCount,
      dec20Updated: decUpdate.modifiedCount
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Migration failed',
      error: error.message
    });
  }
};
