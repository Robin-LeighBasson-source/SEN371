const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // ADD THIS LINE TO DEBUG:
    console.log("Currently trying to connect with:", process.env.MONGO_URI); 
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;