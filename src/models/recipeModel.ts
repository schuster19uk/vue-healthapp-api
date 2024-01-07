// src/models/recipeModel.ts
const { MongoClient, ObjectId } = require('mongodb');

interface ILink {
  source_name: string;
  link: string;
}

interface ICookingTime {
  preparation?: number;
  resting?: number;
  cooking?: number;
  total?: number;
}

interface IAllergies {
  nut?: boolean;
  gluten?: boolean;
  dairy?: boolean;
  other?: boolean;
}

interface INutritional {
  calories?: number;
  sugar?: number;
  fat?: number;
}

interface IIngredient {
  name: string;
  measure: string;
  quantity: string;
  category: string;
}

interface IOptionalIngredient {
  name?: string;
  unit?: string;
  quantity?: string;
  category?: string;
}

export interface IRecipe {
  _id?: typeof ObjectId;
  recipe_name: string;
  recipe_image?: string;
  instructions?: string;
  ingredients: IIngredient[];
  optional?: IOptionalIngredient[];
  allergies?:IAllergies[];
  times?: ICookingTime;
  nutritional?:INutritional;
  recipe_links?: ILink[];
}

class RecipeModel {
  private recipeCollection: any;
  private edamamCollection: any;

  constructor(collection: ReturnType<typeof MongoClient['db']>) {
    this.recipeCollection = collection.collection('recipes');
    this.edamamCollection = collection.collection('edamam_recipes');
  }

  async createRecipe(recipe: IRecipe): Promise<IRecipe> {
    const result = await this.recipeCollection.insertOne(recipe);
    if (!result.insertedId) {
      throw new Error('Failed to insert recipe');
    }
    const insertedRecipe = await this.recipeCollection.findOne({ _id: result.insertedId });
    if (!insertedRecipe) {
      throw new Error('Failed to retrieve inserted recipe');
    }
    return insertedRecipe;
  }

  async createEdamamBatchRecipe(data: any): Promise<any> {
    const options = { ordered: true };
    const result = await this.edamamCollection.insertMany(data , options);
    if (result.insertedCount <= 0) {
      throw new Error('Failed to insert recipe');
    }

    return result;
  }

  //this is only for dev purposes
  async deleteEdamamAllRecords(): Promise<any> {
    const options = { ordered: true };
    const result = await this.edamamCollection.deleteMany({});
    if (result.deletedCount <= 0) {
      throw new Error('Failed to delete recipes');
    }

    return result;
  }

  //delete recipes records (dev only)
  async deleteAllRecipeRecords(): Promise<any> {
    const options = { ordered: true };
    const result = await this.recipeCollection.deleteMany({});
    if (result.deletedCount <= 0) {
      throw new Error('Failed to delete recipes');
    }

    return result;
  }

  async getRecipesByIngredients(ingredients: string[]): Promise<IRecipe[]> {
    return this.recipeCollection.find({
      'ingredients.name': { $in: ingredients },
    }).toArray();
  }

  async getRecipesByMatchingIngredientsCount(ingredientNames: string[]): Promise<any[]> {
    console.log('Match Recipes to ingredients: ', ingredientNames);
    const result = await this.recipeCollection.aggregate([
      {
        $unwind: '$ingredients',
      },
      {
        $match: {
          'ingredients.name': { $in: ingredientNames },
        },
      },
      {
        $group: {
          _id: {
            recipe_id: '$_id',
            recipe_name: '$recipe_name',
            recipe_image: '$recipe_image',
          },
          matching_count: { $sum: 1 },
        },
      },
      {
        $match: {
          matching_count: {
            $lte: ingredientNames.length + await this.recipeCollection.countDocuments({
              'ingredients.name': { $in: ingredientNames },
            }),
          },
        },
      },
      {
        $sort: { matching_count: -1 },
      },
    ]).toArray();

    return result;
  }

  async getRecipesByMatchingIngredientsCountIncludesMissingIngredients(ingredientNames: string[]): Promise<any[]> {
    console.log('Match Recipes to ingredients full: ', ingredientNames);
    const result = await this.recipeCollection.aggregate([
        {
            $unwind: '$ingredients',
        },
        {
            $group: {
                _id: '$_id',
                recipe_name: { $first: '$recipe_name' },
                recipe_image: { $first: '$recipe_image' },
                allIngredients: { $push: '$ingredients.name' },
                matchingIngredients: {
                    $addToSet: {
                        $cond: {
                            if: { $in: ['$ingredients.name', ingredientNames] },
                            then: '$ingredients.name',
                            else: null,
                        },
                    },
                },
            },
        },
        {
            $addFields: {
                matchingIngredients: {
                    $filter: {
                        input: '$matchingIngredients',
                        as: 'ingredient',
                        cond: { $ne: ['$$ingredient', null] },
                    },
                },
                nonMatchingIngredients: {
                    $setDifference: ['$allIngredients', '$matchingIngredients'],
                },
                matching_count: {
                    $size: {
                        $filter: {
                            input: '$matchingIngredients',
                            as: 'ingredient',
                            cond: { $ne: ['$$ingredient', null] },
                        },
                    },
                },
            },
        },
        {
            $match: {
                matching_count: {
                    $lte: ingredientNames.length,
                },
            },
        },
        {
            $sort: { matching_count: -1 },
        },
    ]).toArray();

    return result;
  }

  async getRecipesByMatchingIngredientsIncludesMissingIngredientsMatchAtLeastOld(ingredientNames: string[], minMatchingCount: number): Promise<any[]> {
    console.log('Match Recipes to ingredients Old: ', ingredientNames);
    const result = await this.recipeCollection.aggregate([
        {
            $unwind: '$ingredients',
        },
        {
            $group: {
                _id: '$_id',
                recipe_data: { $first: '$$ROOT' },
                recipe_name: { $first: '$recipe_name' },
                recipe_image: { $first: '$recipe_image' },
                instructions: {$first: '$instructions'},
                allIngredients: { $push: '$ingredients.name' },
                matchingIngredients: {
                    $addToSet: {
                        $cond: {
                            if: { $in: ['$ingredients.name', ingredientNames] },
                            then: '$ingredients.name',
                            else: null,
                        },
                    },
                },
            },
        },
        {
            $addFields: {
                matchingIngredients: {
                    $filter: {
                        input: '$matchingIngredients',
                        as: 'ingredient',
                        cond: { $ne: ['$$ingredient', null] },
                    },
                },
                nonMatchingIngredients: {
                    $setDifference: ['$allIngredients', '$matchingIngredients'],
                },
                matching_count: {
                    $size: {
                        $filter: {
                            input: '$matchingIngredients',
                            as: 'ingredient',
                            cond: { $ne: ['$$ingredient', null] },
                        },
                    },
                },
            },
        },
        {
            $match: {
                matching_count: {
                    $gte: minMatchingCount,
                },
            },
        },
        {
            $sort: { matching_count: -1 },
        },
    ]).toArray();

    return result;
  }


  async getRecipesByMatchingIngredientsIncludesMissingIngredientsMatchAtLeast(ingredientNames: string[], minMatchingCount: number): Promise<any[]> {
    console.log('Match Recipes to ingredients: ', ingredientNames);
    const result = await this.recipeCollection.aggregate([
        {
            $unwind: '$ingredients',
        },
        {
            $group: {
                _id: '$_id',
                recipe: { $first: '$$ROOT' },
                recipe_name: { $first: '$recipe_name' },
                recipe_image: { $first: '$recipe_image' },
                instructions: { $first: '$instructions' },
                allIngredients: { $push: '$ingredients' }, // Change this line
                matchingIngredients: {
                    $addToSet: {
                        $cond: {
                            if: { $in: ['$ingredients.name', ingredientNames] },
                            then: '$ingredients',
                            else: null,
                        },
                    },
                },
            },
        },
        {
            $addFields: {
                matchingIngredients: {
                    $filter: {
                        input: '$matchingIngredients',
                        as: 'ingredient',
                        cond: { $ne: ['$$ingredient', null] },
                    },
                },
                nonMatchingIngredients: {
                    $setDifference: ['$allIngredients', '$matchingIngredients'],
                },
                matching_count: {
                    $size: {
                        $filter: {
                            input: '$matchingIngredients',
                            as: 'ingredient',
                            cond: { $ne: ['$$ingredient', null] },
                        },
                    },
                },
            },
        },
        {
            $match: {
                matching_count: {
                    $gte: minMatchingCount,
                },
            },
        },
        {
            $sort: { matching_count: -1 },
        },
    ]).toArray();

    return result;
}

  async getTopRecipes(limit: number): Promise<IRecipe[]> {
    return this.recipeCollection.find().limit(limit).toArray();
  }

  async convertAllEdamamRecipesToOurRecipes(): Promise<any> {
    // get the necessary data from edam
    const result = await this.edamamCollection.find({},{ projection : { _id:0, "recipe.label": 1, "recipe.mealType": 1 , "recipe.dishType":1 , "recipe.ingredients":1 , "recipe.ingredientLines":1 , "recipe.calories" : 1 , "recipe.source":1,"recipe.url":1, "recipe.healthLabels" : 1,"recipe.cautions" : 1 }})
    .toArray((err: any, recipes: any) => {
      if (err) {
        console.error('Error querying MongoDB:', err);
        return;
      }
    });

    // convert edamam to our recipe here (TODO)



    return {status:'ok'};

  }

}

let mongoClient: ReturnType<typeof MongoClient['connect']> | null = null;
let recipeModel: RecipeModel | null = null;

export async function connectToMongo() {
  try {
    console.log('Connecting to MongoDB:', process.env.MONGODB_URI);
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    mongoClient = client;
    const db = client.db();
    recipeModel = new RecipeModel(db);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export function getRecipeModel() {
  if (!recipeModel) {
    throw new Error('RecipeModel is not initialized. Call connectToMongo first.');
  }
  return recipeModel;
}

// Close MongoDB connection on process termination
process.on('SIGINT', () => {
  if (mongoClient) {
    mongoClient.close();
    console.log('MongoDB connection closed due to application termination');
  }
  process.exit(0);
});

module.exports = { connectToMongo, getRecipeModel };
