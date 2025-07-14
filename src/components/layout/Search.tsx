import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useSearch } from '@/hooks/useSearch';
import { Link } from 'react-router-dom';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const { results, loading } = useSearch(query);

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />
      {query && (
        <div className="absolute top-full left-0 right-0 bg-white border shadow-lg rounded-b-lg z-10">
          {loading ? (
            <div className="p-4">Loading...</div>
          ) : (
            <div>
              {results.posts.length > 0 && (
                <div className="p-4">
                  <h4 className="font-bold">Posts</h4>
                  <ul>
                    {results.posts.map((post) => (
                      <li key={post.id}>
                        <Link to={`/posts/${post.id}`}>{post.title}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {results.topics.length > 0 && (
                <div className="p-4">
                  <h4 className="font-bold">Topics</h4>
                  <ul>
                    {results.topics.map((topic) => (
                      <li key={topic.id}>
                        <Link to={`/topics/${topic.id}`}>{topic.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {results.users.length > 0 && (
                <div className="p-4">
                  <h4 className="font-bold">Users</h4>
                  <ul>
                    {results.users.map((user) => (
                      <li key={user.id}>
                        <Link to={`/profile/${user.id}`}>{user.username}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
