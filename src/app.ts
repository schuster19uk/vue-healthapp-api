// src/app.ts
import express from 'express';
import dotenv from 'dotenv';
import { connectToMongo, getRecipeModel } from './models/recipeModel';

dotenv.config();

const app = express();

// Middleware setup (body-parser, cors, etc.)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});




// Connect to MongoDB
connectToMongo()
  .then(() => {
    // Initialize RecipeModel after connecting to MongoDB
    getRecipeModel();

    // Import and use your routes
    const recipeRoutes = require('./routes/recipeRoutes');
    app.use('/api/recipes', recipeRoutes);



    // Start the Express server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });