import React, { useState, useEffect } from 'react';
import HukieHeader from '@/components/HukieHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, GiftIcon, Shirt, Calendar, Crown } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
// import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/ProductCard';
import ProductCategoryFilter from '@/components/ProductCategoryFilter';
import ShoppingCartDrawer from '@/components/ShoppingCartDrawer';

// Mock product data
const products = [
  {
    id: 1,
    name: "Premium Membership",
    description: "Unlock all HUkie features and get priority matching",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&h=300",
    category: "membership"
  },
  {
    id: 2,
    name: "Rose Bouquet",
    description: "Classic romantic gift for your special someone",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=300&h=300",
    category: "gifts"
  },
  {
    id: 3,
    name: "Date Night Planner",
    description: "Everything you need to plan the perfect date",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=300&h=300",
    category: "date-night"
  },
  {
    id: 4,
    name: "Stylish Casual Outfit",
    description: "Perfect outfit for a casual coffee date",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&h=300",
    category: "outfits"
  },
  {
    id: 5,
    name: "Chocolate Gift Set",
    description: "Assorted premium chocolates in an elegant box",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=300&h=300",
    category: "gifts"
  },
  {
    id: 6,
    name: "Private Dining Experience",
    description: "Book a private dining experience at a top restaurant",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=300&h=300",
    category: "date-night"
  }
];

// Mock function to fetch products
const fetchProducts = () => {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(products);
    }, 500);
  });
};

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Array<{product: any, quantity: number}>>([]);

  // Using useState instead of useQuery
  const [allProducts, setAllProducts] = useState<typeof products>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProducts() as typeof products;
        setAllProducts(data);
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = selectedCategory
    ? allProducts?.filter(product => product.category === selectedCategory)
    : allProducts;

  const addToCart = (product: any) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);

      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { product, quantity: 1 }];
      }
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const categories = [
    { id: "membership", name: "Memberships", icon: <Crown className="h-4 w-4" /> },
    { id: "gifts", name: "Gifts", icon: <GiftIcon className="h-4 w-4" /> },
    { id: "outfits", name: "Outfits", icon: <Shirt className="h-4 w-4" /> },
    { id: "date-night", name: "Date Night", icon: <Calendar className="h-4 w-4" /> },
  ];

  const cartTotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HukieHeader />

      <main className="flex-1 container py-6 px-4 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">HUkie Shop</h1>
          <Button
            variant="outline"
            className="relative btn-outline-teal"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItems.length > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-hukie-primary">
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </Badge>
            )}
          </Button>
        </div>

        <ProductCategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(category) => setSelectedCategory(category)}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Card key={n} className="opacity-50 animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="mt-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredProducts?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>
        )}
      </main>

      <ShoppingCartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        setCartItems={setCartItems}
        cartTotal={cartTotal}
      />

      <BottomNavigation />
    </div>
  );
};

export default Shop;
