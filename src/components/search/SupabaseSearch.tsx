
import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Search as SearchIcon } from 'lucide-react';

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

type Profile = {
  id: string;
  username: string;
  email?: string;
  avatar?: string | null;
};

type Post = {
  id: string;
  content: string;
  image?: string | null;
  user_id: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar?: string | null;
  }
}

export const SupabaseSearch: React.FC = () => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [touched, setTouched] = useState(false);

  // Debounce search handler
  const searchRef = useRef(debounce(async (q: string) => {
    if (!q) {
      setPeople([]);
      setPosts([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    // Search people (username, email)
    const { data: peopleResults } = await supabase
      .from('profiles')
      .select('id,username,email,avatar')
      .or(`username.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(7);

    // Search posts (content)
    const { data: postResults } = await supabase
      .from('posts')
      .select(`id, content, image, user_id, created_at, profiles:profiles(username,avatar)`)
      .ilike('content', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(7);

    setPeople(peopleResults || []);
    setPosts(postResults || []);
    setLoading(false);
  }, 400));

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setTouched(true);
    searchRef.current(e.target.value.trim());
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 relative">
      <div className="flex items-center bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
        <SearchIcon className="mr-2 text-gray-400" size={20} />
        <Input
          placeholder="Search for people, posts, ..."
          value={search}
          onChange={onSearchChange}
          className="border-0 shadow-none focus:ring-0 bg-transparent"
        />
      </div>
      {(touched && (loading || people.length > 0 || posts.length > 0 || search)) && (
        <div className="absolute z-20 mt-2 w-full">
          <Card className="rounded-xl shadow-xl border bg-white">
            <CardContent className="p-0">
              <div className="max-h-96 overflow-auto">
                {loading && (
                  <div className="text-center p-4 text-gray-400">Searching...</div>
                )}
                {!loading && (people.length > 0 || posts.length > 0) && (
                  <div>
                    {people.length > 0 && (
                      <div>
                        <div className="px-4 pt-3 pb-1 text-xs text-gray-500 uppercase font-semibold tracking-widest">
                          People
                        </div>
                        <ul>
                          {people.map(user => (
                            <li key={user.id}>
                              <Link
                                to={`/profile/${user.id}`}
                                className="flex items-center px-4 py-2 hover:bg-gray-100 transition rounded"
                                onClick={() => setSearch("")}
                              >
                                <Avatar className="w-7 h-7 mr-2">
                                  <AvatarImage src={user.avatar ?? undefined} />
                                  <AvatarFallback>
                                    {user.username?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-gray-800">{user.username}</div>
                                  <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {posts.length > 0 && (
                      <div>
                        <div className="px-4 pt-3 pb-1 text-xs text-gray-500 uppercase font-semibold tracking-widest">
                          Posts
                        </div>
                        <ul>
                          {posts.map(post => (
                            <li key={post.id}>
                              <Link
                                to={`/profile/${post.user_id}`}
                                className="block px-4 py-2 hover:bg-gray-100 rounded transition"
                                onClick={() => setSearch("")}
                              >
                                <div className="flex items-center mb-1">
                                  <Avatar className="w-6 h-6 mr-2">
                                    <AvatarImage src={post.profiles?.avatar ?? undefined} />
                                    <AvatarFallback>
                                      {post.profiles?.username?.charAt(0).toUpperCase() ?? "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-sm text-gray-700">{post.profiles?.username ?? "User"}</span>
                                  <span className="ml-2 text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="text-gray-600 text-sm truncate">
                                  {post.content}
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {!loading && people.length === 0 && posts.length === 0 && search && (
                  <div className="text-gray-400 text-center p-4">No results found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
