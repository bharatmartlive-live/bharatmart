export const fallbackAnnouncements = [
  'SUMMER FLASH: Up to 55% off cooling essentials',
  'Use code HEATWAVE10 for extra savings',
  'Free shipping on orders above Rs 999'
];

export const fallbackCoupons = [
  { id: 1, code: 'HEATWAVE10', discount: 10, active: true },
  { id: 2, code: 'SUMMER20', discount: 20, active: true }
];

export const fallbackProducts = [
  {
    id: 1,
    title: 'Portable Neck Cooling Fan',
    slug: 'portable-neck-cooling-fan',
    description:
      'Hands-free cooling with three-speed airflow, silent motor, and USB-C charging for all-day summer comfort.',
    price: 1899,
    discount: 26,
    stock: 32,
    category: 'Trending Summer Products',
    featured: true,
    image_urls: JSON.stringify([
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=900&q=80'
    ]),
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    specifications: JSON.stringify([
      { label: 'Cooler Type', value: 'Desert' },
      { label: 'Tank Capacity', value: '5 L' },
      { label: 'Material', value: 'Plastic' },
      { label: 'Air Throw Coverage', value: '20 - 40 ft' },
      { label: 'Works on Battery', value: 'Yes' },
      { label: 'Brand', value: 'BharatMart' },
      { label: 'Model Name/Number', value: 'MINI COOLER' },
      { label: 'Power Consumption', value: 'Battery' },
      { label: 'Availability', value: 'In Stock' }
    ])
  },
  {
    id: 2,
    title: 'Insulated Water Bottle 1L',
    slug: 'insulated-water-bottle-1l',
    description:
      'Double-wall stainless steel bottle that keeps drinks chilled for 24 hours during peak summer travel.',
    price: 1199,
    discount: 18,
    stock: 64,
    category: 'Hot Deals',
    featured: true,
    image_urls: JSON.stringify([
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80'
    ]),
    video_url: '',
    specifications: JSON.stringify([
      { label: 'Capacity', value: '1 L' },
      { label: 'Material', value: 'Stainless Steel' },
      { label: 'Insulation', value: '24 Hours Cold' },
      { label: 'Lid Type', value: 'Leak Proof' },
      { label: 'Availability', value: 'In Stock' }
    ])
  },
  {
    id: 3,
    title: 'Mini Air Cooler for Desk',
    slug: 'mini-air-cooler-for-desk',
    description:
      'Compact personal air cooler with humidifier mode, ambient glow, and efficient bedside cooling.',
    price: 3499,
    discount: 31,
    stock: 21,
    category: 'Recommended for You',
    featured: true,
    image_urls: JSON.stringify([
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80'
    ]),
    video_url: '',
    specifications: JSON.stringify([
      { label: 'Cooler Type', value: 'Personal Desk Cooler' },
      { label: 'Power Source', value: 'USB' },
      { label: 'Coverage', value: 'Small Room / Desk' },
      { label: 'Water Tank', value: '700 ml' },
      { label: 'Availability', value: 'In Stock' }
    ])
  },
  {
    id: 4,
    title: 'Sunscreen SPF 50+ Combo Pack',
    slug: 'sunscreen-spf-50-combo-pack',
    description:
      'Lightweight matte sunscreen duo with sweat resistance and broad-spectrum protection.',
    price: 899,
    discount: 22,
    stock: 87,
    category: 'Trending Summer Products',
    featured: true,
    image_urls: JSON.stringify([
      'https://images.unsplash.com/photo-1556229010-aa3f7ff66b24?auto=format&fit=crop&w=900&q=80'
    ]),
    video_url: '',
    specifications: JSON.stringify([
      { label: 'SPF', value: '50+' },
      { label: 'Skin Type', value: 'All Skin Types' },
      { label: 'Finish', value: 'Matte' },
      { label: 'Water Resistant', value: 'Yes' },
      { label: 'Availability', value: 'In Stock' }
    ])
  }
];
