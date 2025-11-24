const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:9090";

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserRegister {
  username: string;
  name: string;
  email?: string;
  password: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  birthdate: string;
  sex?: string;
  user_id: string;
}

export interface FamilyMemberCreate {
  name: string;
  birthdate: string;
  sex?: string;
}

export interface Vaccine {
  id: string;
  name: string;
  description?: string;
}

export interface VaccineRecord {
  id: string;
  family_member_id: string;
  vaccine_id: string;
  date: string;
  location: string;
  dosage?: string;
}

export interface VaccineRecordCreate {
  vaccine_id: string;
  date: string;
  location: string;
  dosage?: string;
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Include cookies in requests
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    throw new Error("Unauthorized - please login again");
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Authentication endpoints
  login: (credentials: UserLogin): Promise<Token> =>
    fetchAPI<Token>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData: UserRegister): Promise<Token> =>
    fetchAPI<Token>("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  logout: (): Promise<{ message: string }> =>
    fetchAPI<{ message: string }>("/logout", {
      method: "POST",
    }),

  // User endpoints
  getUser: (): Promise<User> => fetchAPI<User>("/user"),

  // Family member endpoints
  getFamilyMembers: (): Promise<FamilyMember[]> =>
    fetchAPI<FamilyMember[]>("/family_members"),
  createFamilyMember: (member: FamilyMemberCreate): Promise<FamilyMember> =>
    fetchAPI<FamilyMember>("/family_members", {
      method: "POST",
      body: JSON.stringify(member),
    }),

  // Vaccine endpoints
  getVaccines: (): Promise<Vaccine[]> => fetchAPI<Vaccine[]>("/vaccines"),

  // Vaccine record endpoints
  getVaccineRecords: (familyMemberId: string): Promise<VaccineRecord[]> =>
    fetchAPI<VaccineRecord[]>(
      `/family_members/${familyMemberId}/vaccine_records`,
    ),
  createVaccineRecord: (
    familyMemberId: string,
    record: VaccineRecordCreate,
  ): Promise<VaccineRecord> =>
    fetchAPI<VaccineRecord>(
      `/family_members/${familyMemberId}/vaccine_records`,
      {
        method: "POST",
        body: JSON.stringify(record),
      },
    ),
};
