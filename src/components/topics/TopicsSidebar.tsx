
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTopics } from '@/hooks/useTopics';
import { Plus, Hash } from 'lucide-react';
import { CreateTopicDialog } from './CreateTopicDialog';

interface TopicsSidebarProps {
  selectedTopicId?: string;
  onTopicSelect: (topicId: string) => void;
}

export const TopicsSidebar: React.FC<TopicsSidebarProps> = ({ selectedTopicId, onTopicSelect }) => {
  const { topics, loading } = useTopics();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (loading) {
    return (
      <Card className="w-80 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash size={20} />
            Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-80 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash size={20} />
              Topics
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus size={16} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {topics.map((topic) => (
                <Button
                  key={topic.id}
                  variant={selectedTopicId === topic.id ? "default" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => onTopicSelect(topic.id)}
                >
                  <Hash size={14} className="mr-2 flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-medium">{topic.title}</div>
                    {topic.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {topic.description}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <CreateTopicDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
};
