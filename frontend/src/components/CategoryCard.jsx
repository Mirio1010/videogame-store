import React from "react";
import { Link } from "react-router-dom";

const CategoryCard = ({ category }) => (
  <Link to={`/store?genre=${encodeURIComponent(category.name)}`} className="category-card">
    <span className="category-name">{category.name}</span>
  </Link>
);

export default CategoryCard;
