import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTopics } from '@/hooks/useTopics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Navbar } from '@/components/layout/Navbar';

const CreateTopicPage: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { createTopic } = useTopics();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createTopic(name, description);
    navigate('/topics');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Create a new Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button type="submit">Create Topic</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTopicPage;
