import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

export function useShop() {
  return useContext(ShopContext);
}
