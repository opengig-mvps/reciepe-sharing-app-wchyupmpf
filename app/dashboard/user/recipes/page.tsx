"use client";
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, X, LoaderCircleIcon } from "lucide-react";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Zod schema for recipe creation
const recipeSchema = z.object({
  title: z.string().min(1, "Recipe title is required"),
  ingredients: z.string().min(1, "Ingredients are required"),
  preparation: z.string().min(1, "Preparation steps are required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

const RecipeManagementPage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      tags: [""],
    },
  });

  const { fields, append, remove } = useFieldArray<any>({
    control,
    name: "tags",
  });

  const onSubmit = async (data: RecipeFormData) => {
    try {
      const payload = {
        title: data.title,
        ingredients: data.ingredients,
        preparation: data.preparation,
        category: data.category,
        tags: data.tags,
      };

      const response = await api.post(`/api/recipes`, payload);

      if (response.data.success) {
        toast.success("Recipe uploaded successfully!");
        router.push(`/dashboard/user/recipes`);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Something went wrong");
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Manage Your Recipes</h2>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Recipe Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Recipe Title</Label>
              <Input {...register("title")} placeholder="Enter recipe title" />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea
                {...register("ingredients")}
                placeholder="List the ingredients"
              />
              {errors.ingredients && (
                <p className="text-red-500 text-sm">
                  {errors.ingredients?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparation">Preparation Steps</Label>
              <Textarea
                {...register("preparation")}
                placeholder="Describe the preparation steps"
              />
              {errors.preparation && (
                <p className="text-red-500 text-sm">
                  {errors.preparation?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input {...register("category")} placeholder="Enter category" />
              {errors.category && (
                <p className="text-red-500 text-sm">{errors.category?.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Tags</Label>
                <Button
                  type="button"
                  onClick={() => append("")}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tag
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="space-y-2 p-2 border rounded-lg">
                  <Input
                    {...register(`tags.${index}` as const)}
                    placeholder="Enter tag"
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircleIcon className="w-4 h-4 mr-2 animate-spin" />
                  Uploading Recipe...
                </>
              ) : (
                "Upload Recipe"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RecipeManagementPage;