import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 3000
const API_BASE = `http://localhost:${PORT}`

//task1
async function registerUser(email, password, role = 'user') {
    try {
        const response = await axios.post(`${API_BASE}/register`, {
            email,
            password,
            role
        })

        console.log(`Registered ${role}:`, response.data)
    } catch (error) {
        console.error(`Register ${role} error:`, error.response?.data || error.message)
    }
}

//task2
async function loginUser(email, password) {
    try {
        const response = await axios.post(`${API_BASE}/login`, {
            email,
            password
        })

        console.log('Login result:', response.data)
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message)
    }
}

//task2
async function changePassword(email, newPassword) {
    try {
        const response = await axios.post(`${API_BASE}/change-password`, {
            email,
            newPassword
        })

        console.log('Change password result:', response.data)
    } catch (error) {
        console.error('Change password error:', error.response?.data || error.message)
    }
}

//task3
async function deleteAccount(email, password) {
    try {
        const response = await axios.post(`${API_BASE}/delete-account`, {
            email,
            password
        })

        console.log('Delete account result:', response.data)
    } catch (error) {
        console.error('Delete account error:', error.response?.data || error.message)
    }
}

//task4
async function getAdminPage(email) {
    try {
        const response = await axios.get(`${API_BASE}/admin`, {
            params: { email }
        })

        console.log('Admin route result:', response.data)
    } catch (error) {
        console.error('Admin route error:', error.response?.data || error.message)
    }
}

//task5
async function changeEmail(email, newEmail, password) {
    try {
        const response = await axios.post(`${API_BASE}/change-email`, {
            email,
            newEmail,
            password
        })

        console.log('Change email result:', response.data)
    } catch (error) {
        console.error('Change email error:', error.response?.data || error.message)
    }
}


async function runTest() {
    await registerUser('user@example.com', '12345', 'user')
    await registerUser('admin@example.com', '12345', 'admin')

    await loginUser('user@example.com', '12345')
    await changePassword('user@example.com', 'newpassword123')
    await loginUser('user@example.com', 'newpassword123')

    await changeEmail('user@example.com', 'newuser@example.com', 'newpassword123')
    await loginUser('newuser@example.com', 'newpassword123')

    await getAdminPage('user@example.com')
    await getAdminPage('admin@example.com')

    await deleteAccount('newuser@example.com', 'newpassword123')
}

runTest()
