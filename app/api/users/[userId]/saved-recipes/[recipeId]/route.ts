import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string; recipeId: string } },
) {
  try {
    const { userId, recipeId } = params;

    const savedRecipe = await prisma.savedRecipe.findFirst({
      where: {
        userId,
        recipeId,
      },
    });

    if (!savedRecipe) {
      return NextResponse.json(
        { success: false, message: 'Recipe not found in collection' },
        { status: 404 },
      );
    }

    await prisma.savedRecipe.delete({
      where: {
        id: savedRecipe.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Recipe removed from collection successfully',
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error removing recipe from collection:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}