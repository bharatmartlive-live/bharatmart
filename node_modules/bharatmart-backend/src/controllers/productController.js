import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct
} from '../services/productService.js';

export const listProducts = asyncHandler(async (req, res) => {
  const products = await getAllProducts();
  res.json({ data: products });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }
  res.json({ data: product });
});

export const createProductHandler = asyncHandler(async (req, res) => {
  const product = await createProduct({
    ...req.body,
    imageUrls: req.body.imageUrls || []
  });
  res.status(201).json({ data: product });
});

export const updateProductHandler = asyncHandler(async (req, res) => {
  const product = await updateProduct(req.params.id, req.body);
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }
  res.json({ data: product });
});

export const deleteProductHandler = asyncHandler(async (req, res) => {
  await deleteProduct(req.params.id);
  res.status(204).send();
});
