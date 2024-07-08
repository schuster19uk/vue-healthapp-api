// src/routes/recipeRoutes.ts
import express, { Request, Response } from 'express';
import { getRecipeModel } from '../models/recipeModel';
import axios, { Axios } from 'axios';

const router = express.Router();
const recipeModel = getRecipeModel();

interface ApiResult {
  shouldContinue: boolean;
  apiURL: string;
}

const requestData = {
  type:'public',
  apiKey: process.env.EDAMAM_APP_KEY,
  appId: process.env.EDAMAM_APP_ID
};

const maxEdamamRequestLimit = 1;
const minRequestDelay = 8000; // this is the minimum request limit once every 8 seconds (2 more than the minimum just in case)
const additionalDelay = 15000; // this is the additional maximum added 


// Route to create a new recipe with sample data (dev only)
router.post('/sample-recipe', async (req: Request, res: Response) => {
  try {
    // Sample recipe data
    const sampleRecipe = {
      recipe_name: 'Spaghetti Bolognese',
      recipe_image:'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBhc3RhJTIwYm9sb2duZXNlJTIwc2hvcnQlMjB1cmx8ZW58MHx8MHx8fDA%3D',
      instructions: 'Boil spaghetti and prepare Bolognese sauce...',
      ingredients: [
        { name: 'Spaghetti', measure:'grams', quantity: '200', category: 'Pasta' },
        { name: 'Ground beef',  measure:'grams', quantity: '500', category: 'Meat' },
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

//curl -X POST http://localhost:3000/api/recipes/sample-recipes
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
          { name: 'Bread', measure:'slices', quantity: '2', category: 'Bread' },
          { name: 'Egg', measure:'units', quantity: '1', category: 'Dairy' },
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
          { name: 'Spaghetti', measure:'grams', quantity: '200', category: 'Pasta' },
          { name: 'Ground beef', measure:'grams', quantity: '500', category: 'Meat' },
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
          { name: 'Potato',measure:'grams', quantity: '500', category: 'Potatoes' },
          { name: 'Egg',measure:'units', quantity: '5', category: 'Dairy' },
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

// Route to create multiple sample recipes (dev only)
router.get('/createRecipesFromEdam', async (req: Request, res: Response) => {
  try {

    const sampleRecipes = ['',''];

    const edamamRecipes = await recipeModel.convertAllEdamamRecipesToOurRecipes();

    // Respond with the created recipes
    res.status(200).json({status:'ok'});
  } catch (error) {
    console.error('Error converting edamam recipes to our recipes :', error);
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


// this is the recipe finder query used at present 
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

router.get('/deleteRecipe', async (req: Request, res: Response) => {
  try {

    const deleteRecipes = await recipeModel.deleteAllRecipeRecords();

    // Respond with the matching recipes
    res.status(200).json(deleteRecipes);
  } catch (error) {
    console.error('Error deleting recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/deleteEdam', async (req: Request, res: Response) => {
  try {

    const deleteRecipes = await recipeModel.deleteEdamamAllRecords();

    // Respond with the matching recipes
    res.status(200).json(deleteRecipes);
  } catch (error) {
    console.error('Error deleting edamam recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/get-edamam', async (req: Request, res: Response) => {
  try {


   //const result = await recursiveAsyncFunction(true , "url" , req)

   recursiveGetAllEdamamAsyncFunction(true, 'https://api.edamam.com/api/recipes/v2').then(() => {
    console.log('Recursive function completed');
    res.status(200).json({status:'all ok'});
  });


  } catch (error) {
    console.error('Error retrieving recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



//start of recursive and related edamam functions

async function recursiveGetAllEdamamAsyncFunction(shouldContinue: boolean, apiURL: string , counter: number = 0): Promise<void> {
  try {
    if (!shouldContinue || counter >= maxEdamamRequestLimit) {
      console.log('Base condition met. Stopping recursion.');
      return; // Base case: stop recursion
    }

    const result = await getEdamamRecipesFromAPI(apiURL , counter);

    // Check the result and decide whether to make the next recursive call
    if (result.shouldContinue) {
      //console.log('Continuing recursion.');
      await delay(minRequestDelay + Math.floor(Math.random() * additionalDelay)); // randomdelay
      console.log('function called at: ' + new Date().toString());
      await recursiveGetAllEdamamAsyncFunction(result.shouldContinue, result.apiURL , counter + 1);
    } else {
      console.log('Stopping recursion based on condition.');
    }
  } catch (error) {
    console.error('Error in recursiveAsyncFunction:', error);
    // Handle the error as needed
  }
}

async function getEdamamRecipesFromAPI(apiURL: string , counter: number): Promise<ApiResult> {
  try {
    const response = await axios.get(apiURL, {
      params: {
        type: requestData.type,
        app_key: requestData.apiKey,
        app_id: requestData.appId, 
        //cuisineType:['American', 'Asian', 'British', 'Caribbean', 'Central Europe', 'Chinese','Eastern Europe','French','Indian','Italian','Japanese','Kosher','Mediterranean','Mexican','Middle Eastern','Nordic','South American','South East Asian'], 
        // dishType:['Main Course','Desserts' , 'Salad' , 'Sandwiches' , 'Side dish' , 'Soup' , 'Starter'],
        cuisineType:['Asian', 'British', 'Caribbean', 'Central Europe', 'Chinese','Eastern Europe','French','Indian','Italian','Japanese','Kosher','Mediterranean','Mexican','Middle Eastern','Nordic','South American','South East Asian'], 
        dishType:['Main Course', 'Salad' , 'Sandwiches' , 'Soup' , 'Starter'],
        mealType:['Breakfast' , 'Lunch' , 'Dinner' , 'Teatime'] //excludes some mealTypes
      },
      paramsSerializer: {
        indexes: null, // use brackets with indexes
      }
    });
    console.log('API call completed:', JSON.stringify(response.data.hits[0]));

    // this inserts into the database (uncomment when ready)
    const createdBatchRecipe = await recipeModel.createEdamamBatchRecipe(response.data.hits);
    console.log('batch data created result: ' + JSON.stringify(createdBatchRecipe));

    let shouldContinue = true;
    let APIURL = '';

    if (response.data._links)
      {
        if(response.data._links.next.href){
          //console.log('from: ' +  data.from);
          console.log('record count: ' +  response.data.to);
          
          //console.log('next link: ' + response.data._links.next.href)
          APIURL = response.data._links.next.href;
          console.log('counter value is: ' +  counter);
          if(counter >= maxEdamamRequestLimit)
          {
            //console.log('stopping function testing ');
            APIURL = '';
            shouldContinue = false;
          }

        }
        else
        {
          //console.log('no more links found setting function to stop ');
          APIURL = '';
          shouldContinue = false;
        }
      }
      else
      {
        //console.log('no links found setting function to stop ');
        APIURL = '';
        shouldContinue = false;
      }

    const result: ApiResult = {
      shouldContinue: shouldContinue,
      apiURL: APIURL,
    };
    return result;
  } catch (error) {
    console.error('Error in someAsyncOperation:', error);
    // Handle the error as needed
    throw error; // Rethrow the error to propagate it up the call stack
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// end of recursive and related edamam functions


export = router;
