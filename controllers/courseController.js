const Course = require('../models/Course');
const Category = require('../models/Category');

exports.createCourse = async (req, res, next) => {
  try {
    const { title, description, price, duration, instructor, category } = req.body;

    const errors = [];
    if (!title || !String(title).trim()) errors.push('title is required');
    if (price === undefined || price === '') errors.push('price is required');
    else if (isNaN(price)) errors.push('price must be a number');
    if (!category) errors.push('category is required');
    
    if (errors.length) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    // Check if category exists
    const cat = await Category.findById(category);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Course create karo
    const course = await Course.create({
      title, description, price, duration, instructor, category
    });
    

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCourses = async (req, res, next) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const courses = await Course.find(filter)
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  } catch (err) {
    next(err);
  }
};

// GET /api/courses/:id
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      'category',
      'name'
    );
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// PUT /api/courses/:id
exports.updateCourse = async (req, res, next) => {
  try {
    if (req.body.category) {
      const cat = await Category.findById(req.body.category);
      if (!cat) {
        return res
          .status(404)
          .json({ success: false, message: 'Category not found' });
      }
    }
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/courses/:id
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    next(err);
  }
};
