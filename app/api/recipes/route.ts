import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from "@/lib/authOptions";

type RecipeRequestBody = {
  title: string;
  ingredients: string;
  preparation: string;
  category: string;
  tags: string[];
};

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
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

    const recipe = await prisma.recipe.create({
      data: {
        title,
        ingredients,
        preparation,
        category,
        tags,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Recipe uploaded successfully',
        data: {
          id: recipe.id,
          title: recipe.title,
          ingredients: recipe.ingredients,
          preparation: recipe.preparation,
          category: recipe.category,
          tags: recipe.tags,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}