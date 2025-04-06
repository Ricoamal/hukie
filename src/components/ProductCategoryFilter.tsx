import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CategoryProps {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface ProductCategoryFilterProps {
  categories: CategoryProps[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const ProductCategoryFilter: React.FC<ProductCategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollArea className="w-full py-2">
      <div className="flex space-x-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          className={cn(
            "text-sm btn-outline-teal",
            selectedCategory === null ? "bg-hukie-primary" : ""
          )}
          onClick={() => onSelectCategory(null)}
        >
          All Products
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className={cn(
              "text-sm btn-outline-teal",
              selectedCategory === category.id ? "bg-hukie-primary" : ""
            )}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.icon}
            <span className="ml-2">{category.name}</span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ProductCategoryFilter;
