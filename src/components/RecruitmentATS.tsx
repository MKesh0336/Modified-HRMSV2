import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Briefcase, User, Mail, Phone, Trash2, UserPlus } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { useAuth } from './AuthProvider';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: string;
}

interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  stage: string;
  appliedAt: string;
}

export function RecruitmentATS() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertingCandidate, setConvertingCandidate] = useState<Candidate | null>(null);
  
  const [jobFormData, setJobFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    description: '',
    requirements: '',
    salary: ''
  });

  const [candidateFormData, setCandidateFormData] = useState({
    jobId: '',
    name: '',
    email: '',
    phone: '',
    linkedIn: ''
  });

  const [convertFormData, setConvertFormData] = useState({
    department: '',
    jobTitle: '',
    joiningDate: new Date().toISOString().split('T')[0],
    monthlySalary: '',
    shiftType: 'morning',
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    managerId: '',
    password: ''
  });

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch jobs
      const jobsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/jobs`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs);
      }

      // Fetch candidates
      const candidatesRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/candidates`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (candidatesRes.ok) {
        const candidatesData = await candidatesRes.json();
        setCandidates(candidatesData.candidates);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/jobs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(jobFormData)
        }
      );

      if (response.ok) {
        setJobDialogOpen(false);
        setJobFormData({
          title: '',
          department: '',
          location: '',
          type: 'full-time',
          description: '',
          requirements: '',
          salary: ''
        });
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/candidates`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(candidateFormData)
        }
      );

      if (response.ok) {
        setCandidateDialogOpen(false);
        setCandidateFormData({
          jobId: '',
          name: '',
          email: '',
          phone: '',
          linkedIn: ''
        });
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to add candidate:', error);
    }
  };

  const handleUpdateStage = async (candidateId: string, newStage: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/candidates/status/${candidateId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ stage: newStage })
        }
      );
      await fetchData();
    } catch (error) {
      console.error('Failed to update candidate stage:', error);
    }
  };

  const handleConvertToEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!convertingCandidate) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/candidates/${convertingCandidate.id}/convert`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(convertFormData)
        }
      );

      if (response.ok) {
        toast.success('Candidate converted to employee successfully!');
        setConvertDialogOpen(false);
        setConvertingCandidate(null);
        setConvertFormData({
          department: '',
          jobTitle: '',
          joiningDate: new Date().toISOString().split('T')[0],
          monthlySalary: '',
          shiftType: 'morning',
          shiftStartTime: '09:00',
          shiftEndTime: '17:00',
          managerId: '',
          password: ''
        });
        await fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to convert candidate');
      }
    } catch (error) {
      console.error('Failed to convert candidate:', error);
      toast.error('Failed to convert candidate');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/jobs/${jobId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        toast.success('Job deleted successfully');
        await fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast.error('Failed to delete job');
    }
  };

  const openConvertDialog = (candidate: Candidate) => {
    setConvertingCandidate(candidate);
    setConvertDialogOpen(true);
  };

  const stages = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

  const getStageBadgeColor = (stage: string) => {
    const colors: Record<string, string> = {
      applied: 'bg-blue-100 text-blue-800',
      screening: 'bg-yellow-100 text-yellow-800',
      interview: 'bg-purple-100 text-purple-800',
      offer: 'bg-green-100 text-green-800',
      hired: 'bg-green-600 text-white',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const isManager = user?.role === 'admin' || user?.role === 'manager';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredCandidates = selectedJob 
    ? candidates.filter(c => c.jobId === selectedJob)
    : candidates;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900">Recruitment</h1>
          <p className="text-gray-500">{candidates.length} active candidates</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All positions" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Open Positions</p>
                <p className="text-gray-900">{jobs.filter(j => j.status === 'open').length}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Candidates</p>
                <p className="text-gray-900">{candidates.length}</p>
              </div>
              <User className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">In Interview</p>
                <p className="text-gray-900">{candidates.filter(c => c.stage === 'interview').length}</p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Offers Made</p>
                <p className="text-gray-900">{candidates.filter(c => c.stage === 'offer').length}</p>
              </div>
              <User className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Open Positions & Candidates</CardTitle>
            {isManager && (
              <div className="flex items-center space-x-2">
                <Dialog open={candidateDialogOpen} onOpenChange={setCandidateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Candidate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Candidate</DialogTitle>
                      <DialogDescription>
                        Add a candidate to the recruitment pipeline
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddCandidate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="jobId">Position</Label>
                        <Select
                          value={candidateFormData.jobId}
                          onValueChange={(value) =>
                            setCandidateFormData({ ...candidateFormData, jobId: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent>
                            {jobs.map((job) => (
                              <SelectItem key={job.id} value={job.id}>
                                {job.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={candidateFormData.name}
                          onChange={(e) =>
                            setCandidateFormData({ ...candidateFormData, name: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={candidateFormData.email}
                          onChange={(e) =>
                            setCandidateFormData({ ...candidateFormData, email: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={candidateFormData.phone}
                          onChange={(e) =>
                            setCandidateFormData({ ...candidateFormData, phone: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedIn">LinkedIn (Optional)</Label>
                        <Input
                          id="linkedIn"
                          value={candidateFormData.linkedIn}
                          onChange={(e) =>
                            setCandidateFormData({ ...candidateFormData, linkedIn: e.target.value })
                          }
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Add Candidate
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Post Job
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Post New Job</DialogTitle>
                      <DialogDescription>
                        Create a new job posting
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateJob} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Job Title</Label>
                          <Input
                            id="title"
                            value={jobFormData.title}
                            onChange={(e) =>
                              setJobFormData({ ...jobFormData, title: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            value={jobFormData.department}
                            onChange={(e) =>
                              setJobFormData({ ...jobFormData, department: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={jobFormData.location}
                            onChange={(e) =>
                              setJobFormData({ ...jobFormData, location: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type">Job Type</Label>
                          <Select
                            value={jobFormData.type}
                            onValueChange={(value) =>
                              setJobFormData({ ...jobFormData, type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">Full Time</SelectItem>
                              <SelectItem value="part-time">Part Time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={jobFormData.description}
                          onChange={(e) =>
                            setJobFormData({ ...jobFormData, description: e.target.value })
                          }
                          rows={4}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="requirements">Requirements</Label>
                        <Textarea
                          id="requirements"
                          value={jobFormData.requirements}
                          onChange={(e) =>
                            setJobFormData({ ...jobFormData, requirements: e.target.value })
                          }
                          rows={4}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="salary">Salary Range</Label>
                        <Input
                          id="salary"
                          value={jobFormData.salary}
                          onChange={(e) =>
                            setJobFormData({ ...jobFormData, salary: e.target.value })
                          }
                          placeholder="e.g., $50,000 - $70,000"
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Post Job
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {jobs.filter(j => j.status === 'open').map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-gray-900">{job.title}</h3>
                    {user?.role === 'admin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <p>{job.department}</p>
                    <p>{job.location}</p>
                    <Badge variant="secondary">{job.type}</Badge>
                  </div>
                  <p className="text-indigo-600 mt-4">
                    {candidates.filter(c => c.jobId === job.id).length} candidates
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <h3 className="text-gray-900 mb-4">Candidate Pipeline</h3>
          <div className="space-y-6">
            {stages.map((stage) => (
              <div key={stage}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-gray-700 capitalize">{stage}</h4>
                  <Badge className={getStageBadgeColor(stage)}>
                    {filteredCandidates.filter(c => c.stage === stage).length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredCandidates
                    .filter(c => c.stage === stage)
                    .map((candidate) => {
                      const job = jobs.find(j => j.id === candidate.jobId);
                      return (
                        <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-gray-900">{candidate.name}</p>
                                <p className="text-gray-500">{job?.title}</p>
                              </div>
                            </div>
                            <div className="space-y-1 text-gray-600 mb-3">
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{candidate.email}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4" />
                                <span>{candidate.phone}</span>
                              </div>
                            </div>
                            {isManager && (
                              <div className="space-y-2">
                                <Select
                                  value={candidate.stage}
                                  onValueChange={(value) => handleUpdateStage(candidate.id, value)}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {stages.map((s) => (
                                      <SelectItem key={s} value={s}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {user?.role === 'admin' && (candidate.stage === 'offer' || candidate.stage === 'hired') && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => openConvertDialog(candidate)}
                                  >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Convert to Employee
                                  </Button>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Convert Candidate to Employee</DialogTitle>
            <DialogDescription>
              Convert a candidate to a full-time employee
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConvertToEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={convertFormData.department}
                  onChange={(e) =>
                    setConvertFormData({ ...convertFormData, department: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={convertFormData.jobTitle}
                  onChange={(e) =>
                    setConvertFormData({ ...convertFormData, jobTitle: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="joiningDate">Joining Date</Label>
                <Input
                  id="joiningDate"
                  type="date"
                  value={convertFormData.joiningDate}
                  onChange={(e) =>
                    setConvertFormData({ ...convertFormData, joiningDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlySalary">Monthly Salary</Label>
                <Input
                  id="monthlySalary"
                  value={convertFormData.monthlySalary}
                  onChange={(e) =>
                    setConvertFormData({ ...convertFormData, monthlySalary: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shiftType">Shift Type</Label>
                <Select
                  value={convertFormData.shiftType}
                  onValueChange={(value) =>
                    setConvertFormData({ ...convertFormData, shiftType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shiftStartTime">Shift Start Time</Label>
                <Input
                  id="shiftStartTime"
                  type="time"
                  value={convertFormData.shiftStartTime}
                  onChange={(e) =>
                    setConvertFormData({ ...convertFormData, shiftStartTime: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shiftEndTime">Shift End Time</Label>
                <Input
                  id="shiftEndTime"
                  type="time"
                  value={convertFormData.shiftEndTime}
                  onChange={(e) =>
                    setConvertFormData({ ...convertFormData, shiftEndTime: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerId">Manager ID</Label>
                <Input
                  id="managerId"
                  value={convertFormData.managerId}
                  onChange={(e) =>
                    setConvertFormData({ ...convertFormData, managerId: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={convertFormData.password}
                  onChange={(e) =>
                    setConvertFormData({ ...convertFormData, password: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Convert to Employee
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}