
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TopicSortType } from '@/hooks/useTopics';

interface TopicsFiltersProps {
  sortBy: TopicSortType;
  onSortChange: (sort: TopicSortType) => void;
}

export const TopicsFilters: React.FC<TopicsFiltersProps> = ({ sortBy, onSortChange }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
      <Select value={sortBy} onValueChange={(value) => onSortChange(value as TopicSortType)}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Most Recent</SelectItem>
          <SelectItem value="trending">Trending</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
          <SelectItem value="alphabetical">A-Z</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
