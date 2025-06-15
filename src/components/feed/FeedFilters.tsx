
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export type FeedFilterType = "all" | "friends";
export type FeedSortType = "recent" | "oldest" | "popular" | "trending";

interface FeedFiltersProps {
  filter: FeedFilterType;
  onFilterChange: (filter: FeedFilterType) => void;
  sort: FeedSortType;
  onSortChange: (sort: FeedSortType) => void;
}

export const FeedFilters: React.FC<FeedFiltersProps> = ({
  filter,
  onFilterChange,
  sort,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2 mb-4 border rounded-lg bg-white">
      <div className="flex gap-2 items-center">
        <span className="font-medium">Show:</span>
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={val => val && onFilterChange(val as FeedFilterType)}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="friends">Friends</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex gap-2 items-center">
        <span className="font-medium">Sort by:</span>
        <Select value={sort} onValueChange={val => onSortChange(val as FeedSortType)}>
          <SelectTrigger className="w-36">
            <SelectValue>{{
              recent: "Most Recent",
              oldest: "Oldest",
              popular: "Most Popular",
              trending: "Trending Recently"
            }[sort]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="trending">Trending Recently</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
