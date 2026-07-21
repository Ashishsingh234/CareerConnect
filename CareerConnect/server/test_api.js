const axios = require('axios');

async function testJobs() {
    try {
        const res = await axios.get('http://localhost:5000/jobs');
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Response Data:', err.response.data);
        }
    }
}

testJobs();
