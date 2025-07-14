import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Navbar } from '@/components/layout/Navbar';
import { Shield, Users, MessageSquare, Trash2, Settings, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminPage: React.FC = () => {
  const { isAdmin, loading, suspendUser, deletePost, sendSystemMessage } = useAdmin();
  const [adminEmail, setAdminEmail] = useState('');

  const makeUserAdmin = async () => {
    if (!adminEmail.trim()) return;
    try {
      await fetch('/api/admin/users/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ email: adminEmail }),
      });
      toast({ title: 'User promoted to admin successfully' });
      setAdminEmail('');
      fetchUsers();
    } catch (error) {
      console.error('Error making user admin:', error);
      toast({ title: 'Error', description: 'Failed to promote user to admin', variant: 'destructive' });
    }
  };
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [systemMessage, setSystemMessage] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'reports'>('dashboard');
  const [reportedPosts, setReportedPosts] = useState<any[]>([]);
  
  const defaultReasons = [
    'Violation of community guidelines',
    'Harassment or bullying',
    'Spam or inappropriate content',
    'Hate speech or discrimination',
    'Copyright infringement',
    'Impersonation',
    'Multiple policy violations'
  ];
  
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(selectedUsername.toLowerCase()) ||
    user.email.toLowerCase().includes(selectedUsername.toLowerCase())
  );

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
      return;
    }

    if (isAdmin) {
      fetchUsers();
      fetchPosts();
      fetchReportedPosts();
    }
  }, [isAdmin, loading, navigate]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers });
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.warn('[AdminPage] Failed to fetch users:', err);
      setUsers([]);
    }
  };

  const fetchPosts = async () => {
    const res = await fetch('/api/admin/posts', { headers });
    const data = await res.json();
    setPosts(data || []);
  };

  const fetchReportedPosts = async () => {
    try {
      const res = await fetch('/api/admin/reports', { headers });
      const data = await res.json();
      setReportedPosts(data || []);
    } catch (error) {
      console.error('Error fetching reported posts:', error);
      setReportedPosts([]);
    }
  };

  const handleIgnoreReport = async (reportId: string) => {
    try {
      await fetch(`/api/admin/reports/${reportId}`, {
        method: 'DELETE',
        headers,
      });
      setReportedPosts(prev => prev.filter(r => r.id !== reportId));
      toast({ title: 'Report ignored' });
    } catch (error) {
      console.warn('Could not delete from database:', error);
    }
  };

  const handleDeleteReportedPost = async (postId: string, reportId: string) => {
    try {
      await deletePost(postId);
      await handleIgnoreReport(reportId);
      toast({ title: 'Reported post deleted' });
    } catch (error) {
      console.error('Error deleting reported post:', error);
    }
  };

  const handleSuspendUser = async () => {
    if (!selectedUser || !suspensionReason) return;
    try {
      await suspendUser(selectedUser, suspensionReason);
      setSelectedUser('');
      setSuspensionReason('');
      fetchUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleSendSystemMessage = async () => {
    if (!systemMessage.trim()) return;
    try {
      await sendSystemMessage(systemMessage);
      setSystemMessage('');
    } catch (error) {
      console.error('Error sending system message:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="" onTabChange={(tab) => {
        if (tab === 'home') navigate('/');
        else navigate(`/?tab=${tab}`);
      }} />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={activeAdminTab === 'dashboard' ? 'default' : 'outline'}
                onClick={() => setActiveAdminTab('dashboard')}
              >
                Dashboard
              </Button>
              <Button 
                variant={activeAdminTab === 'reports' ? 'default' : 'outline'}
                onClick={() => setActiveAdminTab('reports')}
              >
                Reports ({reportedPosts.length})
              </Button>
            </div>
          </div>
          <Button onClick={() => navigate('/admin/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Site Settings
          </Button>
        </div>

        {activeAdminTab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Posts</p>
                    <p className="text-2xl font-bold">{posts.length}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Suspended Users</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* User Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2">Select User</label>
                    <Input
                      value={selectedUsername}
                      onChange={(e) => {
                        setSelectedUsername(e.target.value);
                        setShowUserDropdown(true);
                      } }
                      onFocus={() => setShowUserDropdown(true)}
                      placeholder="Type username or email..." />
                    {showUserDropdown && filteredUsers.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {filteredUsers.slice(0, 5).map(user => (
                          <div
                            key={user.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedUser(user.id);
                              setSelectedUsername(`${user.username} (${user.email})`);
                              setShowUserDropdown(false);
                            } }
                          >
                            {user.username} ({user.email}) {user.suspended ? '- SUSPENDED' : ''}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Suspension Reason</label>
                    <select
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                    >
                      <option value="">Select a reason...</option>
                      {defaultReasons.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                    <Input
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                      placeholder="Or enter custom reason..." />
                  </div>
                  <Button
                    onClick={handleSuspendUser}
                    disabled={!selectedUser || !suspensionReason}
                    variant="destructive"
                  >
                    Suspend User
                  </Button>
                </CardContent>
              </Card>

              {/* System Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    System Messages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Message to All Users</label>
                    <Textarea
                      value={systemMessage}
                      onChange={(e) => setSystemMessage(e.target.value)}
                      placeholder="Enter system message..."
                      rows={4} />
                  </div>
                  <Button
                    onClick={handleSendSystemMessage}
                    disabled={!systemMessage.trim()}
                  >
                    Send to All Users
                  </Button>
                </CardContent>
              </Card>

              {/* Admin Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Admin Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Promote User to Admin</label>
                    <Input
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="Enter user email..."
                      type="email" />
                  </div>
                  <Button
                    onClick={makeUserAdmin}
                    disabled={!adminEmail.trim()}
                  >
                    Make Admin
                  </Button>
                </CardContent>
              </Card>

              {/* Post Management */}
              {/* User Management Table */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    All Users ({users.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Username</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Joined</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{user.username}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                            <td className="p-2">
                              <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                ACTIVE
                              </span>
                            </td>
                            <td className="p-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedUser(user.id);
                                  setSuspensionReason('Violation of community guidelines');
                                } }
                              >
                                Suspend
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Posts Management */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Recent Posts ({posts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {posts.map(post => (
                      <div key={post.id} className="flex items-start justify-between p-3 border rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{post.profiles?.username}</p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                          {post.image && (
                            <img src={post.image} alt="Post" className="w-16 h-16 object-cover rounded mt-2" />
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(post.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeAdminTab === 'reports' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Reported Posts ({reportedPosts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportedPosts.map(report => (
                  <div key={report.id} className="border rounded p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                            {report.reason}
                          </span>
                          <span className="text-xs text-gray-500">
                            Reported by {report.reporter?.username}
                          </span>
                          {report.posts?.report_count > 1 && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                              {report.posts.report_count} reports
                            </span>
                          )}
                        </div>
                        {report.details && (
                          <p className="text-sm text-gray-600 mb-2">{report.details}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleIgnoreReport(report.id)}
                        >
                          Ignore
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteReportedPost(report.posts.id, report.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div 
                      className="cursor-pointer hover:bg-gray-50 p-3 rounded border"
                      onClick={() => navigate(`/post/${report.posts.id}?from=admin-reports&reason=${encodeURIComponent(report.reason)}&details=${encodeURIComponent(report.details || '')}`)}
                    >
                      <p className="text-sm font-medium">{report.posts.profiles?.username}</p>
                      <p className="text-sm text-gray-600 mt-1">{report.posts.content}</p>
                      {report.posts.image && (
                        <img src={report.posts.image} alt="Post" className="w-16 h-16 object-cover rounded mt-2" />
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(report.posts.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {reportedPosts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No reported posts
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPage;