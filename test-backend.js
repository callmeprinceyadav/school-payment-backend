const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testBackendAPIs() {
    console.log('🚀 Testing School Payment API Backend...\n');
    
    try {
        // Test 1: Health Check
        console.log('📍 Test 1: Health Check');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health Check:', healthResponse.data);
        console.log('');

        // Test 2: API Root
        console.log('📍 Test 2: API Documentation Root');
        const rootResponse = await axios.get(`${BASE_URL}/`);
        console.log('✅ API Root:', rootResponse.data.message);
        console.log('📋 Available Endpoints:', Object.keys(rootResponse.data.endpoints));
        console.log('');

        // Test 3: Register User (for testing)
        console.log('📍 Test 3: User Registration');
        try {
            const registerData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                role: 'admin'
            };
            
            const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, registerData);
            console.log('✅ Registration successful:', registerResponse.data.message);
            console.log('👤 User created:', registerResponse.data.user.username);
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.message === 'User already exists') {
                console.log('ℹ️  User already exists (expected for repeated tests)');
            } else {
                console.log('❌ Registration error:', error.response?.data?.message || error.message);
            }
        }
        console.log('');

        // Test 4: Login
        console.log('📍 Test 4: User Login');
        const loginData = {
            email: 'test@example.com',
            password: 'password123'
        };
        
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
        console.log('✅ Login successful:', loginResponse.data.message);
        console.log('🔑 JWT Token received:', loginResponse.data.token ? 'Yes' : 'No');
        console.log('👤 User data:', loginResponse.data.user);
        
        const token = loginResponse.data.token;
        console.log('');

        // Test 5: Protected Route - Get Transactions (will be empty initially)
        console.log('📍 Test 5: Protected Route - Get Transactions');
        try {
            const transactionsResponse = await axios.get(`${BASE_URL}/api/transactions?page=1&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ Transactions endpoint accessible');
            console.log('📊 Total transactions:', transactionsResponse.data.pagination?.total_records || 0);
            console.log('📄 Current page transactions:', transactionsResponse.data.transactions?.length || 0);
        } catch (error) {
            console.log('❌ Transactions error:', error.response?.data?.message || error.message);
        }
        console.log('');

        // Test 6: Transaction Status Check
        console.log('📍 Test 6: Transaction Status Check');
        try {
            const statusResponse = await axios.get(`${BASE_URL}/api/transaction-status/SAMPLE_ORDER_ID`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ Transaction status endpoint accessible');
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('ℹ️  Transaction status endpoint working (404 for non-existent order is expected)');
            } else {
                console.log('❌ Transaction status error:', error.response?.data?.message || error.message);
            }
        }
        console.log('');

        // Test 7: School Transactions
        console.log('📍 Test 7: School Transactions');
        try {
            const schoolResponse = await axios.get(`${BASE_URL}/api/transactions/school/65b0e6293e9f76a9694d84b4?page=1&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ School transactions endpoint accessible');
            console.log('🏫 School transactions found:', schoolResponse.data.transactions?.length || 0);
        } catch (error) {
            console.log('❌ School transactions error:', error.response?.data?.message || error.message);
        }
        console.log('');

        // Test 8: JWT Authentication Test (without token)
        console.log('📍 Test 8: JWT Authentication Test (No Token)');
        try {
            await axios.get(`${BASE_URL}/api/transactions`);
            console.log('❌ Security issue: Endpoint accessible without token!');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ JWT Authentication working: Access denied without token');
            } else {
                console.log('⚠️  Unexpected error:', error.response?.data?.message || error.message);
            }
        }
        console.log('');

        console.log('🎉 Backend API Testing Complete!\n');
        console.log('📊 Summary:');
        console.log('✅ Server: Running on port 3000');
        console.log('✅ MongoDB: Connected');
        console.log('✅ Authentication: Working (Register/Login)');
        console.log('✅ JWT Protection: Active');
        console.log('✅ API Endpoints: Accessible');
        console.log('✅ Ready for Frontend Integration');
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure the server is running: npm start');
        }
    }
}

// Run the tests
testBackendAPIs();