import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, FileText, Edit, Trash2, Eye } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { useAuth } from './AuthProvider';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface Policy {
  id: string;
  title: string;
  category: string;
  content: string;
  effectiveDate: string;
  status: string;
  version: number;
  createdAt: string;
  createdBy: string;
}

export function PoliciesManagement() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingPolicy, setViewingPolicy] = useState<Policy | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'general',
    content: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/policies`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setPolicies(data.policies);
      }
    } catch (error) {
      console.error('Failed to fetch policies:', error);
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('Only admins can manage policies');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const url = editingPolicy
        ? `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/policies/${editingPolicy.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/policies`;
      
      const response = await fetch(url, {
        method: editingPolicy ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(`Policy ${editingPolicy ? 'updated' : 'created'} successfully`);
        setDialogOpen(false);
        setEditingPolicy(null);
        setFormData({
          title: '',
          category: 'general',
          content: '',
          effectiveDate: new Date().toISOString().split('T')[0],
          status: 'active'
        });
        fetchPolicies();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save policy');
      }
    } catch (error) {
      console.error('Failed to save policy:', error);
      toast.error('Failed to save policy');
    }
  };

  const handleEdit = (policy: Policy) => {
    if (!isAdmin) {
      toast.error('Only admins can edit policies');
      return;
    }
    
    setEditingPolicy(policy);
    setFormData({
      title: policy.title,
      category: policy.category,
      content: policy.content,
      effectiveDate: policy.effectiveDate.split('T')[0],
      status: policy.status
    });
    setDialogOpen(true);
  };

  const handleDelete = async (policyId: string) => {
    if (!isAdmin) {
      toast.error('Only admins can delete policies');
      return;
    }

    if (!confirm('Are you sure you want to delete this policy?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/policies/${policyId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        toast.success('Policy deleted successfully');
        fetchPolicies();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete policy');
      }
    } catch (error) {
      console.error('Failed to delete policy:', error);
      toast.error('Failed to delete policy');
    }
  };

  const handleView = (policy: Policy) => {
    setViewingPolicy(policy);
    setViewDialogOpen(true);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'general': 'bg-gray-500',
      'hr': 'bg-blue-500',
      'it': 'bg-green-500',
      'security': 'bg-red-500',
      'compliance': 'bg-yellow-500',
      'benefits': 'bg-purple-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-500' : 'bg-gray-400';
  };

  if (loading) {
    return <div className="p-6">Loading policies...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl">Company Policies</h1>
          <p className="text-muted-foreground mt-2">
            View and manage company policies
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingPolicy(null);
              setFormData({
                title: '',
                category: 'general',
                content: '',
                effectiveDate: new Date().toISOString().split('T')[0],
                status: 'active'
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                Add Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPolicy ? 'Edit Policy' : 'Create New Policy'}</DialogTitle>
                <DialogDescription>
                  {editingPolicy ? 'Update policy details' : 'Add a new company policy'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Policy Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Remote Work Policy"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="benefits">Benefits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content">Policy Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter policy details..."
                    rows={10}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="effectiveDate">Effective Date</Label>
                    <Input
                      id="effectiveDate"
                      type="date"
                      value={formData.effectiveDate}
                      onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPolicy ? 'Update Policy' : 'Create Policy'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {policies.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="size-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No policies found</p>
              {isAdmin && (
                <p className="text-sm text-muted-foreground mt-2">
                  Click "Add Policy" to create your first policy
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          policies.map((policy) => (
            <Card key={policy.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{policy.title}</CardTitle>
                      <Badge className={`${getCategoryColor(policy.category)} text-white`}>
                        {policy.category}
                      </Badge>
                      <Badge className={`${getStatusColor(policy.status)} text-white`}>
                        {policy.status}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Effective: {new Date(policy.effectiveDate).toLocaleDateString()}</span>
                      <span>Version: {policy.version}</span>
                      <span>Updated: {new Date(policy.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(policy)}>
                      <Eye className="size-4 mr-2" />
                      View
                    </Button>
                    {isAdmin && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(policy)}>
                          <Edit className="size-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(policy.id)}>
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2">
                  {policy.content.substring(0, 200)}...
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Policy Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {viewingPolicy && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingPolicy.title}</DialogTitle>
                <div className="flex gap-2 mt-2">
                  <Badge className={`${getCategoryColor(viewingPolicy.category)} text-white`}>
                    {viewingPolicy.category}
                  </Badge>
                  <Badge className={`${getStatusColor(viewingPolicy.status)} text-white`}>
                    {viewingPolicy.status}
                  </Badge>
                  <Badge variant="outline">Version {viewingPolicy.version}</Badge>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm">
                    <strong>Effective Date:</strong> {new Date(viewingPolicy.effectiveDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <strong>Last Updated:</strong> {new Date(viewingPolicy.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <div className="whitespace-pre-wrap">{viewingPolicy.content}</div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
