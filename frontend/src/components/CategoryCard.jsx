import React from "react";
import { Link } from "react-router-dom";

const CategoryCard = ({ category }) => (
  <Link to={`/category/${category.slug}`} className="category-card">
    <span className="category-name">{category.name}</span>
  </Link>
);

export default CategoryCard;
