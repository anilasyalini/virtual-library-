const fs = require('fs');

async function testUpload() {
    try {
        const formData = new FormData();
        const fileContent = Buffer.from('test file content');
        const file = new File([fileContent], 'test.pdf', { type: 'application/pdf' });
        
        formData.append('file', file);
        formData.append('title', 'Test PDF Upload');
        formData.append('description', 'Test Description');
        formData.append('category', 'Test Category');
        formData.append('course', 'Test Course');
        formData.append('specialization', 'Test Specialization');

        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData,
        });

        console.log("Upload Status:", response.status);
        console.log("Upload Body:", await response.text());
    } catch (e) {
        console.error("Upload Error:", e);
    }
}

testUpload();
