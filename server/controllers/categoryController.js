const db = require('../config/db');

const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Categories ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories.', error: error.message });
  }
};

const createCategory = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required.' });
  }

  try {
    const [existing] = await db.query('SELECT name FROM Categories WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Category already exists.' });
    }

    const [result] = await db.query(
      'INSERT INTO Categories (name, description) VALUES (?, ?)',
      [name, description || '']
    );

    // Logging action
    await db.query(
      'INSERT INTO ActivityLogs (user_type, user_id, action, details) VALUES (?, ?, ?, ?)',
      ['admin', req.user.id, 'CATEGORY_CREATED', `Created category: ${name}`]
    );

    res.status(201).json({
      message: 'Category created successfully.',
      categoryId: result.insertId
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category.', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required.' });
  }

  try {
    const [existing] = await db.query('SELECT category_id FROM Categories WHERE name = ? AND category_id <> ?', [name, id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Another category with this name already exists.' });
    }

    const [result] = await db.query(
      'UPDATE Categories SET name = ?, description = ? WHERE category_id = ?',
      [name, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // Logging action
    await db.query(
      'INSERT INTO ActivityLogs (user_type, user_id, action, details) VALUES (?, ?, ?, ?)',
      ['admin', req.user.id, 'CATEGORY_UPDATED', `Updated category ID: ${id}`]
    );

    res.json({ message: 'Category updated successfully.' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category.', error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM Categories WHERE category_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // Logging action
    await db.query(
      'INSERT INTO ActivityLogs (user_type, user_id, action, details) VALUES (?, ?, ?, ?)',
      ['admin', req.user.id, 'CATEGORY_DELETED', `Deleted category ID: ${id}`]
    );

    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category.', error: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
