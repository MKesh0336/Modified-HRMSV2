import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Star, Plus, TrendingUp } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner@2.0.3';

interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  ratings: {
    quality: number;
    productivity: number;
    communication: number;
    teamwork: number;
    leadership: number;
  };
  strengths: string;
  improvements: string;
  goals: string;
  overallRating: number;
  createdAt: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
}

export function PerformanceReview() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    period: '',
    ratings: {
      quality: 5,
      productivity: 5,
      communication: 5,
      teamwork: 5,
      leadership: 5
    },
    strengths: '',
    improvements: '',
    goals: '',
    overallRating: 5
  });

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch employees
      const empRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/employees`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData.employees);
      }

      // Fetch reviews for current user
      const reviewRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/performance/${user?.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (reviewRes.ok) {
        const reviewData = await reviewRes.json();
        setReviews(reviewData.reviews);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/performance/review`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        setDialogOpen(false);
        setFormData({
          employeeId: '',
          period: '',
          ratings: {
            quality: 5,
            productivity: 5,
            communication: 5,
            teamwork: 5,
            leadership: 5
          },
          strengths: '',
          improvements: '',
          goals: '',
          overallRating: 5
        });
        await fetchData();
        toast.success('Review created successfully!');
      }
    } catch (error) {
      console.error('Failed to create review:', error);
      toast.error('Failed to create review. Please try again.');
    }
  };

  const updateRating = (category: keyof typeof formData.ratings, value: number) => {
    const newRatings = { ...formData.ratings, [category]: value };
    const average = Object.values(newRatings).reduce((sum, val) => sum + val, 0) / Object.values(newRatings).length;
    setFormData({
      ...formData,
      ratings: newRatings,
      overallRating: Math.round(average * 10) / 10
    });
  };

  const RatingStars = ({ rating, onRatingChange, editable = false }: any) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => editable && onRatingChange(star)}
          className={`${editable ? 'cursor-pointer' : 'cursor-default'} transition-colors`}
          disabled={!editable}
        >
          <Star
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-gray-600">{rating}/5</span>
    </div>
  );

  const isManager = user?.role === 'admin' || user?.role === 'manager';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const avgOverallRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Performance Reviews</h1>
          <p className="text-gray-500">Track employee performance and development</p>
        </div>
        {isManager && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Performance Review</DialogTitle>
                <DialogDescription>
                  Conduct a performance review for an employee
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.jobTitle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Review Period</Label>
                  <Input
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    placeholder="e.g., Q4 2024"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <Label>Performance Ratings</Label>
                  <div className="space-y-3">
                    {Object.keys(formData.ratings).map((category) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize">{category}</span>
                        <RatingStars
                          rating={formData.ratings[category as keyof typeof formData.ratings]}
                          onRatingChange={(value: number) => updateRating(category as keyof typeof formData.ratings, value)}
                          editable
                        />
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-900">Overall Rating</span>
                      <span className="text-indigo-600">{formData.overallRating}/5</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Key Strengths</Label>
                  <Textarea
                    value={formData.strengths}
                    onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Areas for Improvement</Label>
                  <Textarea
                    value={formData.improvements}
                    onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Goals for Next Period</Label>
                  <Textarea
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">Submit Review</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Reviews</p>
                <p className="text-gray-900">{reviews.length}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Average Rating</p>
                <p className="text-gray-900">{avgOverallRating.toFixed(1)}/5</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">This Year</p>
                <p className="text-gray-900">{reviews.length} reviews</p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {Object.keys(reviews[0].ratings).map((category) => {
                  const avg = reviews.reduce((sum, r) => sum + r.ratings[category as keyof typeof r.ratings], 0) / reviews.length;
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 capitalize">{category}</span>
                        <span className="text-gray-900">{avg.toFixed(1)}/5</span>
                      </div>
                      <Progress value={avg * 20} className="h-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No reviews yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => {
                  const employee = employees.find(e => e.id === review.employeeId);
                  return (
                    <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-gray-900">{employee?.name}</p>
                          <p className="text-gray-500">{review.period}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-gray-900">{review.overallRating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 line-clamp-2">{review.strengths}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {reviews.map((review) => {
              const employee = employees.find(e => e.id === review.employeeId);
              return (
                <div key={review.id} className="p-6 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-gray-900">{employee?.name}</h3>
                      <p className="text-gray-500">{review.period}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                        <span className="text-gray-900">{review.overallRating}/5</span>
                      </div>
                      <p className="text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    {Object.entries(review.ratings).map(([category, rating]) => (
                      <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 capitalize mb-1">{category}</p>
                        <p className="text-gray-900">{rating}/5</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-700">Strengths</Label>
                      <p className="text-gray-600 mt-1">{review.strengths}</p>
                    </div>
                    <div>
                      <Label className="text-gray-700">Areas for Improvement</Label>
                      <p className="text-gray-600 mt-1">{review.improvements}</p>
                    </div>
                    <div>
                      <Label className="text-gray-700">Goals</Label>
                      <p className="text-gray-600 mt-1">{review.goals}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}