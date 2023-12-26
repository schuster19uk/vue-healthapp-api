// src/routes/recipeRoutes.ts
import express, { Request, Response } from 'express';
import { getRecipeModel } from '../models/recipeModel';

const router = express.Router();
const recipeModel = getRecipeModel();

// Route to create a new recipe with sample data (dev only)
router.post('/sample-recipe', async (req: Request, res: Response) => {
  try {
    // Sample recipe data
    const sampleRecipe = {
      recipe_name: 'Spaghetti Bolognese',
      recipe_image:'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBhc3RhJTIwYm9sb2duZXNlJTIwc2hvcnQlMjB1cmx8ZW58MHx8MHx8fDA%3D',
      instructions: 'Boil spaghetti and prepare Bolognese sauce...',
      ingredients: [
        { name: 'Spaghetti', quantity: '200g', category: 'Pasta' },
        { name: 'Ground beef', quantity: '500g', category: 'Meat' },
        // ... other ingredients
      ],
      allergies:[],
      times:{},
      recipe_links: [
        { source_name: 'Food Network', link: 'https://www.foodnetwork.com/recipes/spaghetti-bolognese' },
        // ... other recipe links
      ],
    };

    // Call the createRecipe method from the recipeModel
    const createdRecipe = await recipeModel.createRecipe(sampleRecipe);

    // Respond with the created recipe
    res.status(201).json(createdRecipe);
  } catch (error) {
    console.error('Error creating sample recipe:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to create multiple sample recipes (dev only)
router.post('/sample-recipes', async (req: Request, res: Response) => {
  try {
    // Sample recipe data for three recipes
    const sampleRecipes = [
      {
        recipe_name: 'Egg Sandwich',
        recipe_image:'https://media.istockphoto.com/id/1138854044/photo/egg-salad-sandwich-with-crispy-bacon.jpg?s=612x612&w=0&k=20&c=A2BjXsNB2c8FQPcU9TKMXU0BoWFyahdrib5C83RQAOc=',
        instructions: 'Make Sandwich...',
        ingredients: [
          { name: 'Bread', quantity: '2 Slices', category: 'Bread' },
          { name: 'Egg', quantity: '1', category: 'Dairy' },
          // ... other ingredients
        ],
        allergies:[          
        {nut: true,
        gluten: false,
        dairy: false}
        ],
        nutritional:{
          calories: 750,
          sugar:5,
          fat:50
        },

        times:
          {preparation: 5,
          resting: 10,
          cooking:5,
          total: 5,}
        ,
        recipe_links: [
          { 
            source_name: 'Food Network', 
            link: 'https://www.foodnetwork.com/recipes/spaghetti-bolognese' 
          },
          // ... other recipe links
        ],
      },
      {
        recipe_name: 'Spaghetti Bolognese',
        recipe_image:'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBhc3RhJTIwYm9sb2duZXNlJTIwc2hvcnQlMjB1cmx8ZW58MHx8MHx8fDA%3D',
        instructions: 'Boil spaghetti and prepare Bolognese sauce...',
        ingredients: [
          { name: 'Spaghetti', quantity: '200g', category: 'Pasta' },
          { name: 'Ground beef', quantity: '500g', category: 'Meat' },
          // ... other ingredients
        ],
        allergies:[        
          {
          nut: true,
          gluten: true,
          dairy: false
        }
        ],
        nutritional:{
          calories: 750,
          sugar:5,
          fat:50
        },
        times:
          {preparation: 5,
          resting: 10,
          cooking:5,
          total: 5,}
        ,
        recipe_links: [
          { source_name: 'Food Network', link: 'https://www.foodnetwork.com/recipes/spaghetti-bolognese' },
          // ... other recipe links
        ],
      },
      {
        recipe_name: 'Potato Omelette',
        recipe_image:'https://media.istockphoto.com/id/1443171956/photo/typical-spanish-potato-omelet-with-a-portion-cut-on-top-of-it.jpg?s=612x612&w=0&k=20&c=obXmoE1MaUKG-pmwPob34JlRgem6NAaVSiXaZSlG_-o=',
        instructions: 'Make Potato Omelette...',
        ingredients: [
          { name: 'Potato', quantity: '500g', category: 'Potatoes' },
          { name: 'Egg', quantity: '5', category: 'Dairy' },
          // ... other ingredients
        ],
        allergies:[        
          {
            nut: true,
            gluten: true,
            dairy: true
          }
        ],
        times:
          {preparation: 5,
          resting: 10,
          cooking:5,
          total: 5,}
        ,
        nutritional:{
          calories: 751,
          sugar:4,
          fat:40
        },
        recipe_links: [
          { source_name: 'Food Network', link: 'https://www.foodnetwork.com/recipes/spaghetti-bolognese' },
          // ... other recipe links
        ],
      },
    ];

    // Array to store created recipes
    const createdRecipes = [];

    // Loop through sample recipes and create each one
    for (const sampleRecipe of sampleRecipes) {
      const createdRecipe = await recipeModel.createRecipe(sampleRecipe);
      createdRecipes.push(createdRecipe);
    }

    // Respond with the created recipes
    res.status(201).json(createdRecipes);
  } catch (error) {
    console.error('Error creating sample recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to create a new recipe by passing the recipe object in the request body (unchanged)
router.post('/recipes', async (req: Request, res: Response) => {
  try {
    // Extract recipe data from the request body
    const recipeData = req.body;

    // Validate that essential fields are provided
    if (!recipeData || !recipeData.recipe_name || !recipeData.instructions || !recipeData.ingredients ||
        !recipeData.preparation_time || !recipeData.cooking_time || !recipeData.total_time || !recipeData.recipe_links) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Call the createRecipe method from the recipeModel
    const createdRecipe = await recipeModel.createRecipe(recipeData);

    // Respond with the created recipe
    res.status(201).json(createdRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get recipes by ingredients (unchanged)
router.get('/recipes', async (req: Request, res: Response) => {
  try {
    const ingredients = req.query.ingredients as string[];
    const recipes = await recipeModel.getRecipesByIngredients(ingredients);
    res.json(recipes);
  } catch (error) {
    console.error('Error retrieving recipes by ingredients:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// call like this :  http://localhost:3000/api/recipes/top-recipes?limit=5
router.get('/top-recipes', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10; // Default limit to 10 if not provided

    // Call the getTopRecipes method from the recipeModel
    const topRecipes = await recipeModel.getTopRecipes(limit);

    // Respond with the top recipes
    res.status(200).json(topRecipes);
  } catch (error) {
    console.error('Error retrieving top recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/matching-recipes', async (req: Request, res: Response) => {
  try {
    //const ingredients = req.query.ingredients as string[];
    const ingredients = req.query.ingredients as string;

    const ingredientsArray = ingredients.split(',');
    
    // Call the getRecipesByMatchingIngredientsCount method from the recipeModel
    const matchingRecipes = await recipeModel.getRecipesByMatchingIngredientsCount(ingredientsArray);

    // Respond with the matching recipes
    res.status(200).json(matchingRecipes);
  } catch (error) {
    console.error('Error retrieving matching recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/matching-recipes-include-non-matching', async (req: Request, res: Response) => {
  try {
    //const ingredients = req.query.ingredients as string[];
    const ingredients = req.query.ingredients as string;

    const ingredientsArray = ingredients.split(',');
    
    // Call the getRecipesByMatchingIngredientsCount method from the recipeModel
    const matchingRecipes = await recipeModel.getRecipesByMatchingIngredientsCountIncludesMissingIngredients(ingredientsArray);

    // Respond with the matching recipes
    res.status(200).json(matchingRecipes);
  } catch (error) {
    console.error('Error retrieving matching recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/matching-recipes-include-non-matching-at-least', async (req: Request, res: Response) => {
  try {
    const ingredients = req.query.ingredients as string[];
    // const ingredients = req.query.ingredients as string;
     const minMatchingCount = parseInt(req.query.minMatchingCount as string) || 2; // Default to 2 if not provided
    // console.error('Matching at least: ', minMatchingCount.toString());
    // const ingredientsArray = ingredients.split(',');
    
    // Call the getRecipesByMatchingIngredientsCount method from the recipeModel
    const matchingRecipes = await recipeModel.getRecipesByMatchingIngredientsIncludesMissingIngredientsMatchAtLeast(ingredients , minMatchingCount);

    // Respond with the matching recipes
    res.status(200).json(matchingRecipes);
  } catch (error) {
    console.error('Error retrieving matching recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export = router;
