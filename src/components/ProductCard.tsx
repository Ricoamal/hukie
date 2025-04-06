import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-48 object-cover"
        />
        <Badge 
          className="absolute top-2 right-2 text-xs bg-hukie-primary"
        >
          {product.category}
        </Badge>
      </div>
      
      <CardHeader className="pt-4 pb-2">
        <CardTitle className="text-lg">{product.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">{product.description}</p>
        <p className="mt-2 text-lg font-semibold text-hukie-primary">
          ${product.price.toFixed(2)}
        </p>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 flex justify-between gap-2">
        <Button 
          className="w-3/4 btn-outline-teal"
          onClick={onAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
        
        <Button variant="outline" className="w-1/4 btn-outline-teal">
          <Heart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
