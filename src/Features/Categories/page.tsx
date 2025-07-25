"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import {
  useAddCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux/api/auth/categories/categoriesApi";
import Loading from "@/redux/Shared/Loading";
import ErrorState from "@/redux/Shared/ErrorState";

interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

const Categories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const { data, isLoading, isError, refetch } = useGetCategoriesQuery();
  const [addCategory, { isLoading: isCreating }] = useAddCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  // ✅ Extract array safely

  const categoriesData: Category[] = data?.data ?? [];

console.log(categoriesData)

  const filteredCategories = categoriesData.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleAddCategory = () => {
    setIsAddModalOpen(true);
  };

  const handleSave = async () => {
    if (newCategory.name && newCategory.description) {
      try {
       const cattegoryData= await addCategory(newCategory).unwrap();
    
        toast.success("Category added successfully!");
        setNewCategory({ name: "", description: "" });
        setIsAddModalOpen(false);
        refetch();
      } catch (error) {
        toast.error(
          "Failed to add category: " +
          (error instanceof Error ? error.message : "Unknown error")
        );
      }
    }
  };

  const handleCancel = () => {
    setNewCategory({ name: "", description: "" });
    setIsAddModalOpen(false);
    setIsUpdateModalOpen(false);
    setIsViewModalOpen(false);
    setIsDeleteConfirmOpen(false);
    setSelectedCategory(null);
  };

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleUpdate = (category: Category) => {
    setSelectedCategory(category);
    setNewCategory({ name: category.name, description: category.description });
    setIsUpdateModalOpen(true);
  };

  const handleSaveUpdate = async () => {
    if (selectedCategory && newCategory.name && newCategory.description) {
      try {
        await updateCategory({
          _id: selectedCategory._id,
          ...newCategory,
        }).unwrap();
        toast.success("Category updated successfully!");
        setNewCategory({ name: "", description: "" });
        setIsUpdateModalOpen(false);
        refetch();
      } catch (error) {
        toast.error(
          "Failed to update category: " +
          (error instanceof Error ? error.message : "Unknown error")
        );
      }
    }
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedCategory) {
      try {
        console.log("select category data",selectedCategory)
     const deleteCategorys=   await deleteCategory(selectedCategory._id).unwrap();
     console.log(deleteCategory)
        toast.success(`Deleted ${selectedCategory.name} successfully!`);
        setIsDeleteConfirmOpen(false);
        setSelectedCategory(null);
        refetch();
      } catch (error) {
        toast.error(
          "Failed to delete category: " +
          (error instanceof Error ? error.message : "Unknown error")
        );
      }
    }
  };

  const cancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setSelectedCategory(null);
  };

  if (isLoading) return <Loading title="Loading categories" message="all categories data fetched "/>;
  if (isError) return <ErrorState title="fetch error"message=" categories data fetch error" />;

  return (
    <div className="p-4 ">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search product..."
          className="p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddCategory}
              className="px-4 py-2 bg-red-600 text-white cursor-pointer hover:bg-red-700"
            >
              + Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
              <DialogDescription>
                Add a new category here. Click save when you are done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name-1">Name</Label>
                <Input
                  id="name-1"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="description-1">Description</Label>
                <Input
                  id="description-1"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={isCreating}>
                {isCreating ? "Adding..." : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-600">
            <th className="p-2">Name</th>
            <th className="p-2">Description</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentCategories.length > 0 ? (
            currentCategories.map((category) => (
              <tr key={category._id} className="border-t">
                <td className="p-2">{category.name}</td>
                <td className="p-2">{category.description}</td>
                <td className="p-2 flex space-x-2">
                  <Dialog
                    open={isViewModalOpen}
                    onOpenChange={setIsViewModalOpen}
                  >
                    <DialogTrigger asChild>
                      <button
                        onClick={() => handleView(category)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Image
                          src="/dashboardIcons/eye.png"
                          width={20}
                          height={20}
                          alt="View"
                          className="rounded-full cursor-pointer"
                        />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] ">
                      <DialogHeader>
                        <DialogTitle>View Details</DialogTitle>
                        <DialogDescription>
                          Details for {selectedCategory?.name}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div className="grid gap-3">
                          <Label htmlFor="view-name">Name</Label>
                          <Input
                            id="view-name"
                            value={selectedCategory?.name || ""}
                            readOnly
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="view-description">Description</Label>
                          <Input
                            id="view-description"
                            value={selectedCategory?.description || ""}
                            readOnly
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline" onClick={handleCancel}>
                            Close
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog
                    open={isUpdateModalOpen}
                    onOpenChange={setIsUpdateModalOpen}
                  >
                    <DialogTrigger asChild>
                      <button
                        onClick={() => handleUpdate(category)}
                        className="text-gray-600 cursor-pointer hover:text-gray-800"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Update Category</DialogTitle>
                        <DialogDescription>
                          Update the category details here. Click save when you are done.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div className="grid gap-3">
                          <Label htmlFor="name-2">Name</Label>
                          <Input
                            id="name-2"
                            value={newCategory.name}
                            onChange={(e) =>
                              setNewCategory({
                                ...newCategory,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="description-2">Description</Label>
                          <Input
                            id="description-2"
                            value={newCategory.description}
                            onChange={(e) =>
                              setNewCategory({
                                ...newCategory,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline" onClick={handleCancel}>
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          onClick={handleSaveUpdate}
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Updating..." : "Save changes"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog
                    open={isDeleteConfirmOpen}
                    onOpenChange={setIsDeleteConfirmOpen}
                  >
                    <DialogTrigger asChild>
                      <button
                        onClick={() => handleDelete(category)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Image
                          src="/dashboardIcons/delete.png"
                          width={20}
                          height={20}
                          alt="Delete"
                          className="rounded-full cursor-pointer"
                        />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete{" "}
                          {selectedCategory?.name}? This action cannot be
                          undone. All the products in this category will also be deleted!
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline" onClick={cancelDelete}>
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          onClick={confirmDelete}
                          disabled={isDeleting}
                          variant="destructive"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center text-gray-500 p-4">
                No categories found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between items-center">
        <p className="text-gray-600">
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, filteredCategories.length)} of{" "}
          {filteredCategories.length} categories
        </p>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              size="sm"
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          >
            Next
          </Button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Categories;
