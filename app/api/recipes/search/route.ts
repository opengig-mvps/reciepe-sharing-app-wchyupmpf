import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const query = searchParams.get('query') || '';

    const recipes = await prisma.recipe.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            tags: {
              has: query,
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        category: true,
        tags: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Search results fetched successfully',
        data: recipes,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error fetching search results:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}