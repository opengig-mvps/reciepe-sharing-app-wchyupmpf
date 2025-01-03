"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoaderCircleIcon, X, Plus } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

const PersonalCollection = () => {
  const { data: session } = useSession();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!session) return;
    const fetchSavedRecipes = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/users/${session?.user.id}/saved-recipes`);
        setRecipes(res.data.data);
        setTotalPages(Math.ceil(res.data.data.length / 10)); // assuming 10 recipes per page
      } catch (error: any) {
        if (isAxiosError(error)) {
          console.error(error.response?.data.message ?? "Something went wrong");
        } else {
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSavedRecipes();
  }, [session]);

  const handleRemoveRecipe = async (recipeId: string) => {
    try {
      const res = await api.delete(`/api/users/${session?.user.id}/saved-recipes/${recipeId}`);
      if (res.data.success) {
        toast.success("Recipe removed from collection successfully");
        setRecipes(recipes.filter((recipe) => recipe.id !== recipeId));
      }
    } catch (error: any) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleSaveRecipe = async (recipeId: string) => {
    try {
      const res = await api.post(`/api/users/${session?.user.id}/saved-recipes`, { recipeId });
      if (res.data.success) {
        toast.success("Recipe saved successfully");
        setRecipes([...recipes, res.data.data]);
      }
    } catch (error: any) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">My Recipe Collection</h2>
      {loading ? (
        <div className="flex justify-center items-center">
          <LoaderCircleIcon className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {recipes?.slice((currentPage - 1) * 10, currentPage * 10)?.map((recipe) => (
            <Card key={recipe?.id}>
              <CardHeader>
                <CardTitle>{recipe?.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{recipe?.category}</p>
                <p>{recipe?.tags?.join(", ")}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => handleRemoveRecipe(recipe?.id)}>
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </CardFooter>
            </Card>
          ))}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default PersonalCollection;