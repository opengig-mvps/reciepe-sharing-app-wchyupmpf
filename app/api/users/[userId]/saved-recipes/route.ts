import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type SaveRecipeRequestBody = {
  recipeId: string;
};

export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const userId = params.userId;

    const body: SaveRecipeRequestBody = await request.json();
    const { recipeId } = body;

    if (!recipeId) {
      return NextResponse.json(
        { success: false, message: 'Recipe ID is required' },
        { status: 400 },
      );
    }

    const recipe = await prisma.recipe.findFirst({
      where: { id: recipeId },
    });

    if (!recipe) {
      return NextResponse.json(
        { success: false, message: 'Recipe not found' },
        { status: 404 },
      );
    }

    await prisma.savedRecipe.create({
      data: {
        userId,
        recipeId,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Recipe saved successfully' },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error saving recipe:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}