import React from 'react';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface FilterSectionProps {
  className?: string;
  onApplyFilters: (filters: {
    ageRange: [number, number];
    distance: number;
    selectedInterests: string[];
  }) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ className, onApplyFilters }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [ageRange, setAgeRange] = React.useState<[number, number]>([18, 45]);
  const [distance, setDistance] = React.useState<number>(50);
  const [selectedInterests, setSelectedInterests] = React.useState<string[]>([]);
  
  const interests = [
    "Travel", "Music", "Food", "Movies", "Art", "Sports", 
    "Reading", "Gaming", "Fitness", "Technology", "Photography", "Fashion"
  ];
  
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };
  
  const handleApplyFilters = () => {
    onApplyFilters({
      ageRange,
      distance,
      selectedInterests
    });
    setIsOpen(false);
  };
  
  return (
    <div className={className}>
      <Button 
        variant="ghost" 
        className="flex items-center gap-2 text-sm font-medium text-gray-500 btn-outline-teal"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter size={16} />
        Filters
      </Button>
      
      {isOpen && (
        <div className="absolute z-50 top-20 left-4 right-4 bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          
          <div className="space-y-6">
            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Age Range: {ageRange[0]} - {ageRange[1]}
              </label>
              <Slider
                defaultValue={ageRange}
                min={18}
                max={70}
                step={1}
                onValueChange={(values) => setAgeRange(values as [number, number])}
                className="my-4"
              />
            </div>
            
            {/* Distance */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Maximum Distance: {distance} miles
              </label>
              <Slider
                defaultValue={[distance]}
                min={1}
                max={100}
                step={1}
                onValueChange={(values) => setDistance(values[0])}
                className="my-4"
              />
            </div>
            
            {/* Interests */}
            <div>
              <label className="block text-sm font-medium mb-2">Interests</label>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs border transition-colors",
                      selectedInterests.includes(interest)
                        ? "bg-hukie-primary text-white border-hukie-primary"
                        : "bg-transparent text-gray-600 border-gray-300 hover:border-hukie-primary"
                    )}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                className="btn-outline-teal"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="btn-outline-teal"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;
