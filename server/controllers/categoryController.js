const Category = require('../models/Category');

async function getCategories(req, res) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories.', error: error.message });
  }
};

async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required.' });

    const newCategory = await Category.create({ name, description });
    res.status(201).json({ message: 'Category created successfully.', categoryId: newCategory._id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category.', error: error.message });
  }
};

async function updateCategory(req, res) {
  try {
    const { name, description } = req.body;
    await Category.findByIdAndUpdate(req.params.id, { name, description });
    res.json({ message: 'Category updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category.', error: error.message });
  }
};

async function deleteCategory(req, res) {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category.', error: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
