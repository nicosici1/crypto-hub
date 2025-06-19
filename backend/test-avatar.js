const fetch = require('node-fetch');

async function testAvatarEndpoint() {
  try {
    // Primero crear un usuario
    const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    });

    console.log('Status del registro:', registerResponse.status);
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('Usuario creado:', registerData.message);
    } else {
      console.log('Error en registro:', await registerResponse.text());
    }

    // Ahora hacer login
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('Error en login:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    console.log('Token obtenido:', token);

    // Probar el endpoint de avatar
    const avatarResponse = await fetch('http://localhost:3000/api/auth/users/avatar', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        avatar_type: 'emoji',
        avatar_emoji: '🚀'
      })
    });

    console.log('Status del avatar:', avatarResponse.status);
    console.log('Respuesta del avatar:', await avatarResponse.text());

  } catch (error) {
    console.error('Error:', error);
  }
}

testAvatarEndpoint(); 