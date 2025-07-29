"use client";
import React, { useState, useEffect } from 'react';
import { 
  HiOutlineSearch, 
  HiChevronDown, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiX
} from 'react-icons/hi';
import axiosInstance from '@/helper/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';

// TypeScript interface for applicant data
interface Applicant {
  _id: string;
  name: string;
  position: string;
  status: string;
  jobType: string;
  location: string;
  applied: string;
  experience: string;
  email: string;
  phone: string;
}

// TypeScript interface for form errors
interface FormErrors {
  name?: string;
  position?: string;
  jobType?: string;
  location?: string;
  experience?: string;
  email?: string;
  phone?: string;
}

const Applicants: React.FC = () => {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newApplicant, setNewApplicant] = useState({
    name: '',
    position: '',
    status: 'Review',
    jobType: '',
    location: '',
    experience: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch applicants on component mount
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await axiosInstance.get('/applicants');
        setApplicants(response.data);
      } catch (error) {
        let message = 'Failed to fetch applicants';
        
        if (isAxiosError(error)) {
          message = error.response?.data?.message || message;
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            router.push('/login');
          }
        } else if (error instanceof Error) {
          message = error.message;
        }
        
        toast.error(message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    };
    fetchApplicants();
  }, [router]);

  // Filter applicants
  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch =
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || applicant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions = ['All', 'Review', 'Rejected', 'Offer'];

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewApplicant(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!newApplicant.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!newApplicant.position.trim()) {
      newErrors.position = 'Position is required';
    }
    if (!newApplicant.jobType.trim()) {
      newErrors.jobType = 'Job type is required';
    }
    if (!newApplicant.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!newApplicant.experience.trim()) {
      newErrors.experience = 'Experience is required';
    }
    if (newApplicant.email.trim() && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(newApplicant.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!newApplicant.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach(error => {
        toast.error(error, {
          position: 'top-right',
          autoClose: 3000,
        });
      });
    }

    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post('/applicants', newApplicant);
      setApplicants([...applicants, response.data.applicant]);
      setNewApplicant({
        name: '',
        position: '',
        status: 'Review',
        jobType: '',
        location: '',
        experience: '',
        email: '',
        phone: '',
      });
      setShowForm(false);
      toast.success('Applicant added successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      let message = 'Failed to add applicant';
      
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      toast.error(message, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const response = await axiosInstance.put(`/applicants/${id}/status`, { status });
      setApplicants(applicants.map(applicant =>
        applicant._id === id ? response.data.applicant : applicant
      ));
      toast.success(`Applicant status updated to ${status}!`, {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      let message = 'Failed to update status';
      
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      toast.error(message, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white relative rounded-xl shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Applicants</h1>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <HiChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer Name
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Position
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Experience
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Job Type
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Applied
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredApplicants.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-6 text-center text-sm text-gray-500">
                  No applicants found matching your criteria
                </td>
              </tr>
            ) : (
              filteredApplicants.map((applicant, index) => (
                <tr
                  key={applicant._id}
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-gray-100 transition-colors duration-200 h-20`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 flex items-center justify-center text-gray-500 text-sm">
                        {applicant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{applicant.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <HiOutlineMail className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{applicant.email || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <HiOutlinePhone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{applicant.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {applicant.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {applicant.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {applicant.experience}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {applicant.jobType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {applicant.applied}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium ${
                        applicant.status === 'Review'
                          ? 'bg-blue-100 text-blue-800'
                          : applicant.status === 'Interview'
                          ? 'bg-yellow-100 text-yellow-800'
                          : applicant.status === 'Offer'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {applicant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="group flex justify-end space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(applicant._id, 'Review')}
                        disabled={updatingId === applicant._id || applicant.status === 'Review'}
                        className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-sm ${
                          applicant.status === 'Review' || updatingId === applicant._id
                            ? 'bg-blue-200 text-white cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        title="Set to Review"
                        aria-label="Set applicant to Review status"
                      >
                        {updatingId === applicant._id ? 'Updating...' : 'Review'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(applicant._id, 'Rejected')}
                        disabled={updatingId === applicant._id || applicant.status === 'Rejected'}
                        className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 border border-red-200 shadow-sm ${
                          applicant.status === 'Rejected' || updatingId === applicant._id
                            ? 'bg-red-200 text-white cursor-not-allowed'
                            : 'bg-white text-red-600 hover:bg-red-50'
                        }`}
                        title="Reject Applicant"
                        aria-label="Reject applicant"
                      >
                        {updatingId === applicant._id ? 'Updating...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(applicant._id, 'Offer')}
                        disabled={updatingId === applicant._id || applicant.status === 'Offer'}
                        className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 border border-green-200 shadow-sm ${
                          applicant.status === 'Offer' || updatingId === applicant._id
                            ? 'bg-green-200 text-white cursor-not-allowed'
                            : 'bg-white text-green-600 hover:bg-green-50'
                        }`}
                        title="Make Offer"
                        aria-label="Offer position to applicant"
                      >
                        {updatingId === applicant._id ? 'Updating...' : 'Offer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <button 
        onClick={() => setShowForm(true)}
        disabled={isSubmitting}
        className={`fixed bottom-8 right-8 rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-colors ${
          isSubmitting 
            ? 'bg-gray-400 text-white cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <span className="text-3xl">+</span>
      </button>
      
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Add New Applicant</h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newApplicant.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={newApplicant.position}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.position ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.position && (
                    <p className="mt-1 text-sm text-red-600">{errors.position}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={newApplicant.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Review">Review</option>
                    <option value="Interview">Interview</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Offer">Offer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type
                  </label>
                  <input
                    type="text"
                    name="jobType"
                    value={newApplicant.jobType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.jobType ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.jobType && (
                    <p className="mt-1 text-sm text-red-600">{errors.jobType}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={newApplicant.location}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={newApplicant.experience}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.experience ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.experience && (
                    <p className="mt-1 text-sm text-red-600">{errors.experience}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newApplicant.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={newApplicant.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md text-white ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Applicant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default Applicants;