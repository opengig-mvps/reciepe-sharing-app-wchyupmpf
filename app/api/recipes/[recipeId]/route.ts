import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/authOptions';

export async function DELETE(
  request: Request,
  { params }: { params: { recipeId: string } },
) {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const recipeId = params.recipeId;
    const recipe = await prisma.recipe.findFirst({
      where: { id: recipeId, userId: userId },
    });

    if (!recipe) {
      return NextResponse.json(
        { success: false, message: 'Recipe not found or not authorized' },
        { status: 404 },
      );
    }

    await prisma.recipe.delete({
      where: { id: recipeId },
    });

    return NextResponse.json(
      { success: true, message: 'Recipe deleted successfully' },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}

type RecipeRequestBody = {
  title: string;
  ingredients: string;
  preparation: string;
  category: string;
  tags: string[];
};

export async function PUT(
  request: Request,
  { params }: { params: { recipeId: string } },
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    const recipeId = params.recipeId;
    if (!recipeId) {
      return NextResponse.json(
        { success: false, message: 'Recipe ID not provided' },
        { status: 400 },
      );
    }

    const body: RecipeRequestBody = await request.json();
    const { title, ingredients, preparation, category, tags } = body;

    if (!title || !ingredients || !preparation || !category || !Array.isArray(tags)) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields or incorrect format' },
        { status: 400 },
      );
    }

    const updatedRecipe = await prisma.recipe.updateMany({
      where: {
        id: recipeId,
        userId: userId,
      },
      data: {
        title,
        ingredients,
        preparation,
        category,
        tags,
        updatedAt: new Date().toISOString(),
      },
    });

    if (updatedRecipe.count === 0) {
      return NextResponse.json(
        { success: false, message: 'Recipe not found or not authorized' },
        { status: 404 },
      );
    }

    const recipe = await prisma.recipe.findFirst({
      where: {
        id: recipeId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Recipe updated successfully',
        data: {
          id: recipe?.id,
          title: recipe?.title,
          ingredients: recipe?.ingredients,
          preparation: recipe?.preparation,
          category: recipe?.category,
          tags: recipe?.tags,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}