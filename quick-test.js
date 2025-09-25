const axios = require('axios');

async function quickTest() {
    console.log('🔍 Quick Backend Login Test\n');
    
    try {
        // Test login
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'test@example.com',
            password: 'password123'
        });
        
        console.log('✅ LOGIN SUCCESS!');
        console.log('📧 Email:', loginResponse.data.user.email);
        console.log('👤 Username:', loginResponse.data.user.username);
        console.log('🔑 Token received:', loginResponse.data.token ? 'YES' : 'NO');
        console.log('🎯 Role:', loginResponse.data.user.role);
        
        const token = loginResponse.data.token;
        
        // Test protected endpoint
        console.log('\n🔒 Testing protected endpoint...');
        const transResponse = await axios.get('http://localhost:3000/api/transactions?page=1&limit=3', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ PROTECTED ENDPOINT ACCESS SUCCESS!');
        console.log('📊 Total transactions:', transResponse.data.pagination.total_records);
        console.log('📋 Sample transactions:', transResponse.data.transactions.length);
        
        if (transResponse.data.transactions.length > 0) {
            const sample = transResponse.data.transactions[0];
            console.log('📄 Sample transaction:');
            console.log('  - Order ID:', sample.custom_order_id);
            console.log('  - Amount: ₹' + sample.order_amount);
            console.log('  - Status:', sample.status);
            console.log('  - Student:', sample.student_name);
        }
        
        console.log('\n🎉 ALL TESTS PASSED! Backend is working perfectly!');
        
    } catch (error) {
        console.log('❌ Test failed:', error.response?.data?.message || error.message);
    }
}

quickTest();