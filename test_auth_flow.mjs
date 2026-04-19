async function run() {
    const email = `testuser_${Date.now()}@example.com`;
    // 1. Register
    const regRes = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Valid User', email, password: 'securepassword', role: 'STUDENT' })
    });
    console.log("Register Status:", regRes.status, await regRes.text());

    // 2. Login
    const logRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'securepassword' })
    });
    console.log("Login Status:", logRes.status, await logRes.text());
}
run();
