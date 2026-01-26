// ==================================================
// Resume AI Platform - API Client Service Layer
// Source of truth: API_AND_DATA_CONTRACTS.md
// ==================================================

import {
    User,
    SignupRequest,
    VerifyRequest,
    LoginRequest,
    Profile,
    JobDescription,
    JobDescriptionRequest,
    ResumeGenerationRequest,
    TriggerGenerationRequest,
    ResumeSource,
    ApiError,
    AuthError,
    LegacyApiError,
    isApiError,
} from '../types/api';

// -------------------------------------------------
// Configuration
// -------------------------------------------------

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// -------------------------------------------------
// Custom Error Class
// -------------------------------------------------

export class ApiClientError extends Error {
    public readonly status: number;
    public readonly errorCode: string;
    public readonly details?: Record<string, string[]>;
    public readonly fieldErrors?: Array<{ field: string; code: string }>;

    constructor(status: number, apiError: ApiError | AuthError | LegacyApiError) {
        // Handle new auth error format
        if ('code' in apiError && 'errors' in apiError) {
            const authError = apiError as AuthError;
            super(authError.message);
            this.name = 'ApiClientError';
            this.status = status;
            this.errorCode = authError.code;
            this.fieldErrors = authError.errors;
            // Convert field errors to details format for backward compatibility
            if (authError.errors && authError.errors.length > 0) {
                this.details = {};
                authError.errors.forEach((err) => {
                    if (!this.details![err.field]) {
                        this.details![err.field] = [];
                    }
                    this.details![err.field].push(err.code);
                });
            }
        } else {
            // Handle legacy format
            const legacyError = apiError as LegacyApiError;
            super(legacyError.message);
            this.name = 'ApiClientError';
            this.status = status;
            this.errorCode = legacyError.error_code;
            this.details = legacyError.details;
        }
    }

    isTTLExpired(): boolean {
        return this.status === 410 && this.errorCode === 'TTL_EXPIRED';
    }

    isAuthRequired(): boolean {
        return this.status === 401 && this.errorCode === 'AUTH_REQUIRED';
    }

    isRateLimited(): boolean {
        return this.status === 429 && this.errorCode === 'RATE_LIMITED';
    }

    isValidationError(): boolean {
        return this.status === 400 && this.errorCode === 'INVALID_PAYLOAD';
    }

    isQuotaExceeded(): boolean {
        return this.errorCode === 'AI_SERVICE_QUOTA_EXCEEDED';
    }
}

// -------------------------------------------------
// Fetch Wrapper
// -------------------------------------------------

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: 'include', // Include cookies for session auth
    });

    // Handle no content response
    if (response.status === 204) {
        return undefined as T;
    }

    // Handle binary response (PDF download)
    // Check multiple indicators since Next.js proxy may strip headers
    const contentType = response.headers.get('Content-Type') || '';
    const contentDisposition = response.headers.get('Content-Disposition') || '';
    const isDownloadEndpoint = endpoint.includes('/download');
    const isPdfResponse = contentType.includes('application/pdf') ||
        contentType.includes('application/octet-stream') ||
        contentDisposition.includes('.pdf') ||
        isDownloadEndpoint;

    if (isPdfResponse && response.ok) {
        // Get the blob and ensure it has the correct MIME type
        const blob = await response.blob();
        // Extract filename from Content-Disposition header if available
        let filename: string | null = null;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }
        // If no filename from header, generate one from endpoint
        if (!filename && isDownloadEndpoint) {
            const generationId = endpoint.split('/').filter(Boolean).pop();
            filename = generationId ? `resume_${generationId}.pdf` : 'resume.pdf';
        }
        // Store filename as a property on the blob for later use
        if (filename) {
            (blob as any).filename = filename;
        }
        // Always create a new blob with explicit PDF type for downloads
        return new Blob([blob], { type: 'application/pdf' }) as T;
    }

    // For non-PDF responses, handle errors first
    if (!response.ok) {
        // Try to parse error as JSON
        try {
            const data = await response.json();
            // Check if it's the new auth error format (with 'code' and 'errors')
            if (data.code && typeof data.code === 'string') {
                throw new ApiClientError(response.status, data as AuthError);
            }
            // Check if it's the legacy format (with 'error_code')
            if (isApiError(data)) {
                throw new ApiClientError(response.status, data);
            }
        } catch (err) {
            // If it's already an ApiClientError, rethrow it
            if (err instanceof ApiClientError) {
                throw err;
            }
            // If JSON parsing fails, create a generic error
        }
        throw new ApiClientError(response.status, {
            error_code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
        });
    }

    // Parse JSON response for successful non-PDF responses
    const data = await response.json();
    return data as T;
}

// -------------------------------------------------
// Auth API
// -------------------------------------------------

export const authApi = {
    /**
     * Register a new user
     * POST /auth/signup
     * Returns 202 Accepted on success
     */
    async signup(data: SignupRequest): Promise<void> {
        await request<void>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Verify email with token
     * POST /auth/verify
     */
    async verify(data: VerifyRequest): Promise<void> {
        await request<void>('/auth/verify', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Log in a user
     * POST /auth/login
     * Returns User object and sets session cookie
     */
    async login(data: LoginRequest): Promise<User> {
        return request<User>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Log out current user
     * POST /auth/logout
     */
    async logout(): Promise<void> {
        await request<void>('/auth/logout', {
            method: 'POST',
        });
    },

    /**
     * Get current authenticated user
     * GET /auth/me
     */
    async me(): Promise<User> {
        return request<User>('/auth/me');
    },
};

// -------------------------------------------------
// Profile API
// -------------------------------------------------

export const profileApi = {
    /**
     * Get the current user's profile
     * GET /profiles/me
     */
    async get(): Promise<Profile> {
        return request<Profile>('/profiles/me');
    },

    /**
     * Create or replace the user's profile
     * PUT /profiles/me
     */
    async create(profile: Profile): Promise<Profile> {
        return request<Profile>('/profiles/me', {
            method: 'PUT',
            body: JSON.stringify(profile),
        });
    },

    /**
     * Partially update the user's profile
     * PATCH /profiles/me
     */
    async update(profile: Partial<Profile>): Promise<Profile> {
        return request<Profile>('/profiles/me', {
            method: 'PATCH',
            body: JSON.stringify(profile),
        });
    },
};

// -------------------------------------------------
// Job Description API
// -------------------------------------------------

export const jobDescriptionApi = {
    /**
     * Submit a new job description
     * POST /jds
     */
    async submit(data: JobDescriptionRequest): Promise<JobDescription> {
        return request<JobDescription>('/jds', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Get a specific job description
     * GET /jds/{jd_id}
     * May return 410 if TTL expired
     */
    async get(jdId: string): Promise<JobDescription> {
        return request<JobDescription>(`/jds/${jdId}`);
    },

    /**
     * Delete a job description
     * DELETE /jds/{jd_id}
     */
    async delete(jdId: string): Promise<void> {
        await request<void>(`/jds/${jdId}`, {
            method: 'DELETE',
        });
    },
};

// -------------------------------------------------
// Resume Generation API
// -------------------------------------------------

export const resumeApi = {
    /**
     * Trigger a new resume generation
     * POST /resumes
     * Uses idempotency key to prevent duplicate generations
     */
    async trigger(
        data: TriggerGenerationRequest,
        idempotencyKey: string
    ): Promise<ResumeGenerationRequest> {
        return request<ResumeGenerationRequest>('/resumes', {
            method: 'POST',
            headers: {
                'Idempotency-Key': idempotencyKey,
            },
            body: JSON.stringify(data),
        });
    },

    /**
     * Get the status of a resume generation task
     * GET /resumes/{generation_id}/status
     * May return 410 if TTL expired
     */
    async getStatus(generationId: string): Promise<ResumeGenerationRequest> {
        return request<ResumeGenerationRequest>(`/resumes/${generationId}/status`);
    },

    /**
     * Download the generated PDF resume
     * GET /resumes/{generation_id}/download
     * Returns Blob for file download
     */
    async download(generationId: string): Promise<Blob> {
        return request<Blob>(`/resumes/${generationId}/download`);
    },

    /**
     * Get the AI-generated LaTeX source
     * GET /resumes/{generation_id}/source
     */
    async getSource(generationId: string): Promise<ResumeSource> {
        return request<ResumeSource>(`/resumes/${generationId}/source`);
    },
};

// -------------------------------------------------
// Unified Export
// -------------------------------------------------

export const apiClient = {
    auth: authApi,
    profile: profileApi,
    jobDescription: jobDescriptionApi,
    resume: resumeApi,
};
