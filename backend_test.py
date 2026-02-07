import requests
import sys
import json
from datetime import datetime
import uuid

class PortfolioAPITester:
    def __init__(self, base_url="https://projecthub-266.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.test_project_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = f"{status} - {name}"
        if details:
            result += f" | {details}"
        
        print(result)
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })
        return success

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (Expected: {expected_status})"
                try:
                    error_data = response.json()
                    details += f" | Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f" | Response: {response.text[:100]}"

            self.log_test(name, success, details)
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "email": f"testuser{timestamp}@example.com",
            "password": "TestPass123!",
            "full_name": f"Test User {timestamp}",
            "username": f"testuser{timestamp}"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_data = response['user']
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        if not self.user_data:
            return False
            
        login_data = {
            "email": self.user_data['email'],
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user profile"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_update_user_profile(self):
        """Test updating user profile"""
        update_data = {
            "bio": "Test bio for portfolio",
            "location": "Test City",
            "skills": ["Python", "React", "FastAPI"]
        }
        
        success, response = self.run_test(
            "Update User Profile",
            "PUT",
            "auth/me",
            200,
            data=update_data
        )
        return success

    def test_create_project(self):
        """Test creating a new project"""
        project_data = {
            "title": "Test Portfolio Project",
            "description": "A test project for the portfolio platform",
            "tech_stack": ["React", "FastAPI", "MongoDB"],
            "category": "web",
            "status": "completed",
            "github_url": "https://github.com/test/project",
            "live_url": "https://test-project.com"
        }
        
        success, response = self.run_test(
            "Create Project",
            "POST",
            "projects",
            200,
            data=project_data
        )
        
        if success and 'project_id' in response:
            self.test_project_id = response['project_id']
            return True
        return False

    def test_get_my_projects(self):
        """Test getting user's projects"""
        success, response = self.run_test(
            "Get My Projects",
            "GET",
            "projects/my",
            200
        )
        return success

    def test_get_all_projects(self):
        """Test getting all projects"""
        success, response = self.run_test(
            "Get All Projects",
            "GET",
            "projects",
            200
        )
        return success

    def test_get_project_by_id(self):
        """Test getting specific project"""
        if not self.test_project_id:
            return False
            
        success, response = self.run_test(
            "Get Project by ID",
            "GET",
            f"projects/{self.test_project_id}",
            200
        )
        return success

    def test_update_project(self):
        """Test updating project"""
        if not self.test_project_id:
            return False
            
        update_data = {
            "title": "Updated Test Project",
            "description": "Updated description for test project",
            "status": "in_progress"
        }
        
        success, response = self.run_test(
            "Update Project",
            "PUT",
            f"projects/{self.test_project_id}",
            200,
            data=update_data
        )
        return success

    def test_get_user_by_username(self):
        """Test getting user by username"""
        if not self.user_data:
            return False
            
        success, response = self.run_test(
            "Get User by Username",
            "GET",
            f"users/{self.user_data['username']}",
            200
        )
        return success

    def test_get_user_projects(self):
        """Test getting projects by username"""
        if not self.user_data:
            return False
            
        success, response = self.run_test(
            "Get User Projects",
            "GET",
            f"projects/user/{self.user_data['username']}",
            200
        )
        return success

    def test_filter_projects_by_category(self):
        """Test filtering projects by category"""
        success, response = self.run_test(
            "Filter Projects by Category",
            "GET",
            "projects?category=web",
            200
        )
        return success

    def test_delete_project(self):
        """Test deleting project"""
        if not self.test_project_id:
            return False
            
        success, response = self.run_test(
            "Delete Project",
            "DELETE",
            f"projects/{self.test_project_id}",
            200
        )
        return success

    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access (should fail)",
            "GET",
            "projects/my",
            401
        )
        
        # Restore token
        self.token = original_token
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Portfolio Platform API Tests")
        print("=" * 50)
        
        # Authentication Tests
        print("\n📝 Authentication Tests")
        self.test_user_registration()
        self.test_user_login()
        self.test_get_current_user()
        self.test_update_user_profile()
        
        # Project Tests
        print("\n📁 Project Management Tests")
        self.test_create_project()
        self.test_get_my_projects()
        self.test_get_all_projects()
        self.test_get_project_by_id()
        self.test_update_project()
        self.test_filter_projects_by_category()
        
        # User Profile Tests
        print("\n👤 User Profile Tests")
        self.test_get_user_by_username()
        self.test_get_user_projects()
        
        # Security Tests
        print("\n🔒 Security Tests")
        self.test_unauthorized_access()
        
        # Cleanup
        print("\n🧹 Cleanup Tests")
        self.test_delete_project()
        
        # Print Results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed!")
            failed_tests = [t for t in self.test_results if not t['success']]
            print("\nFailed tests:")
            for test in failed_tests:
                print(f"  - {test['name']}: {test['details']}")
            return 1

def main():
    tester = PortfolioAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())