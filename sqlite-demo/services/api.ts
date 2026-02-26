// services/api.ts
import { 
  Beneficiary, 
  Application,
  Donation, 
  Project, 
  ImpactRecord, 
  DonationStats, 
  ImpactSummary,
  BeneficiaryDashboardData,
  DonorImpactData,
  ApiResponse 
} from './types';
import { API_BASE_URL, printConfig } from './config';

// Print configuration on load
printConfig();

// Auth types
export interface SignupData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
  };
  token: string;
}

class ApiService {
  private async fetchWithErrorHandling<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      // Parse response data
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP error! status: ${response.status}` };
      }

      if (!response.ok) {
        // Extract error message from response
        const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      return errorData as ApiResponse<T>;
    } catch (error: any) {
      console.error('API Error:', error);
      
      // Check for network errors
      if (error.message === 'Failed to fetch' || error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
      }
      
      // Re-throw the error so it can be caught by the calling code
      throw error;
    }
  }

  // Authentication endpoints
  async signup(signupData: SignupData): Promise<ApiResponse<AuthResponse>> {
    return this.fetchWithErrorHandling<AuthResponse>('/users/signup', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });
  }

  async login(loginData: LoginData): Promise<ApiResponse<AuthResponse>> {
    return this.fetchWithErrorHandling<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async getProfile(token: string): Promise<ApiResponse<{ user: any }>> {
    return this.fetchWithErrorHandling<{ user: any }>('/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Beneficiary endpoints
  async createBeneficiary(beneficiaryData: Omit<Beneficiary, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<ApiResponse<Beneficiary>> {
    return this.fetchWithErrorHandling<Beneficiary>('/beneficiaries', {
      method: 'POST',
      body: JSON.stringify(beneficiaryData),
    });
  }

  async getBeneficiaries(): Promise<ApiResponse<Beneficiary[]>> {
    return this.fetchWithErrorHandling<Beneficiary[]>('/beneficiaries');
  }

  async getBeneficiariesByEmail(email: string): Promise<ApiResponse<Beneficiary[]>> {
    return this.fetchWithErrorHandling<Beneficiary[]>(`/beneficiaries/email/${email}`);
  }

  async updateBeneficiaryStatus(id: number, status: string): Promise<ApiResponse<void>> {
    return this.fetchWithErrorHandling<void>(`/beneficiaries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Donation endpoints
  async createDonation(donationData: Omit<Donation, 'id' | 'created_at' | 'updated_at' | 'status' | 'donor_name' | 'donor_email' | 'project_title' | 'project_category'>): Promise<ApiResponse<Donation>> {
    return this.fetchWithErrorHandling<Donation>('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  async getDonations(): Promise<ApiResponse<Donation[]>> {
    return this.fetchWithErrorHandling<Donation[]>('/donations');
  }

  async getDonationsByDonor(donorId: number): Promise<ApiResponse<Donation[]>> {
    return this.fetchWithErrorHandling<Donation[]>(`/donations/donor/${donorId}`);
  }

  async getDonationStats(): Promise<ApiResponse<DonationStats>> {
    return this.fetchWithErrorHandling<DonationStats>('/donations/stats');
  }

  // Project endpoints
  async getProjects(): Promise<ApiResponse<Project[]>> {
    return this.fetchWithErrorHandling<Project[]>('/projects');
  }

  async getTrendingProjects(limit: number = 5): Promise<ApiResponse<Project[]>> {
    return this.fetchWithErrorHandling<Project[]>(`/projects/trending?limit=${limit}`);
  }

  async getProjectProgress(): Promise<ApiResponse<Project[]>> {
    return this.fetchWithErrorHandling<Project[]>('/projects/progress');
  }

  async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'collected_amount' | 'status'>): Promise<ApiResponse<Project>> {
    return this.fetchWithErrorHandling<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: number, projectData: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at' | 'collected_amount' | 'status'>>): Promise<ApiResponse<Project>> {
    return this.fetchWithErrorHandling<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: number): Promise<ApiResponse<void>> {
    return this.fetchWithErrorHandling<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Impact endpoints
  async getImpactRecords(): Promise<ApiResponse<ImpactRecord[]>> {
    return this.fetchWithErrorHandling<ImpactRecord[]>('/impact');
  }

  async getImpactSummary(): Promise<ApiResponse<ImpactSummary>> {
    return this.fetchWithErrorHandling<ImpactSummary>('/impact/summary');
  }

  async getDonorImpact(donorId: number): Promise<ApiResponse<DonorImpactData>> {
    return this.fetchWithErrorHandling<DonorImpactData>(`/impact/donor/${donorId}`);
  }

  async createImpactRecord(impactData: Omit<ImpactRecord, 'id' | 'created_at'>): Promise<ApiResponse<ImpactRecord>> {
    return this.fetchWithErrorHandling<ImpactRecord>('/impact', {
      method: 'POST',
      body: JSON.stringify(impactData),
    });
  }

  // Beneficiary dashboard endpoint
  async getBeneficiaryDashboard(email: string): Promise<ApiResponse<BeneficiaryDashboardData>> {
    return this.fetchWithErrorHandling<BeneficiaryDashboardData>(`/beneficiaries/dashboard/${email}`);
  }

  // Application endpoints
  async getApplications(): Promise<ApiResponse<Application[]>> {
    return this.fetchWithErrorHandling<Application[]>('/applications');
  }

  async getApplicationById(id: number): Promise<ApiResponse<Application>> {
    return this.fetchWithErrorHandling<Application>(`/applications/${id}`);
  }

  async getApplicationsByBeneficiary(beneficiaryId: number): Promise<ApiResponse<Application[]>> {
    return this.fetchWithErrorHandling<Application[]>(`/applications/beneficiary/${beneficiaryId}`);
  }

  async getApplicationsByStatus(status: string): Promise<ApiResponse<Application[]>> {
    return this.fetchWithErrorHandling<Application[]>(`/applications/status/${status}`);
  }

  async createApplication(applicationData: Omit<Application, 'id' | 'created_at' | 'updated_at' | 'status' | 'reviewed_by' | 'review_notes' | 'reviewed_at' | 'beneficiary_name' | 'beneficiary_email' | 'beneficiary_phone' | 'beneficiary_location' | 'reviewed_by_name'>): Promise<ApiResponse<Application>> {
    return this.fetchWithErrorHandling<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async updateApplicationStatus(id: number, status: string, reviewed_by?: number, review_notes?: string): Promise<ApiResponse<void>> {
    return this.fetchWithErrorHandling<void>(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reviewed_by, review_notes }),
    });
  }

  async updateApplication(id: number, applicationData: Partial<Omit<Application, 'id' | 'created_at' | 'updated_at' | 'status' | 'reviewed_by' | 'review_notes' | 'reviewed_at' | 'beneficiary_name' | 'beneficiary_email' | 'beneficiary_phone' | 'beneficiary_location' | 'reviewed_by_name'>>): Promise<ApiResponse<Application>> {
    return this.fetchWithErrorHandling<Application>(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(applicationData),
    });
  }

  async deleteApplication(id: number): Promise<ApiResponse<void>> {
    return this.fetchWithErrorHandling<void>(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  async getApplicationStats(): Promise<ApiResponse<any>> {
    return this.fetchWithErrorHandling<any>('/applications/stats');
  }

  // Debug endpoint
  async getDebugInfo(): Promise<ApiResponse<any>> {
    return this.fetchWithErrorHandling<any>('/impact/debug');
  }
}

export const apiService = new ApiService();