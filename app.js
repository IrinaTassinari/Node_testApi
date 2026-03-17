/**
 * Задача 1 - Реализация проверки уникальности email при регистрации
Создание маршрута регистрации:
Создайте маршрут `POST /register`, который будет принимать данные пользователя, включая email и пароль

Проверка уникальности email:
В этом маршруте перед регистрацией пользователя проверьте, существует ли уже в базе данных пользователь с таким email.

Возврат ошибки при повторном email:
Если такой email уже существует, верните ошибку, сообщив пользователю, что email уже зарегистрирован.

Регистрация нового пользователя:
Если email уникален, продолжайте регистрацию, хэшируя пароль с помощью `bcrypt`.


 * Задача 2 - Реализация принудительного обновления пароля

Добавление поля для проверки необходимости смены пароля:
В модель пользователя добавьте поле `mustChangePassword` (булевое значение), которое будет указывать, должен ли пользователь сменить пароль при следующем входе.

Создание middleware для проверки необходимости смены пароля:
Создайте middleware, которое будет проверять значение `mustChangePassword` при каждом входе пользователя. Если это значение равно `true`, перенаправляйте пользователя на страницу смены пароля.

Создание маршрута для смены пароля:
Создайте маршрут `POST /change-password`, который будет принимать новый пароль и обновлять его в базе данных, предварительно хэшируя с помощью `bcrypt`. После успешной смены пароля установите `mustChangePassword` в `false`.


 * Задача 3 - Реализация функции удаления аккаунта

Создание маршрута для удаления аккаунта:
Создайте маршрут `POST /delete-account`, который будет доступен только авторизованным пользователям.

Подтверждение пароля перед удалением аккаунта:
В этом маршруте попросите пользователя ввести текущий пароль. Проверьте введенный пароль с помощью `bcrypt.compare`.

Удаление аккаунта:
Если пароль подтвержден, удалите учетную запись пользователя из базы данных. Если пароль неверен, верните ошибку.


Задача 4 - Ограничение доступа к маршрутам на основе роли

Добавление роли пользователю:
В модель пользователя добавьте поле `role`, которое может быть, например, `user` или `admin`.

Создание маршрутов для администраторов:
Создайте маршрут `GET /admin`, который должен быть доступен только пользователям с ролью `admin`.

Проверка роли пользователя:
Создайте middleware, которое будет проверять роль пользователя перед доступом к маршруту. Если роль не соответствует `admin`, возвращайте ошибку доступа.


Задача 5 - Реализация функции изменения email

Создание маршрута для изменения email:
Создайте маршрут `POST /change-email`, который будет принимать новый email и текущий пароль.

Проверка пароля перед изменением email:
В этом маршруте запросите у пользователя текущий пароль и сравните его с сохраненным в базе данных с помощью `bcrypt.compare`.

Обновление email:
Если пароль введен верно, обновите email пользователя в базе данных, предварительно проверив его уникальность. Если пароль неверен, верните ошибку.



*/

import express from 'express'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv';

dotenv.config();

const app = express()
const PORT = process.env.PORT || 3000;

app.use(express.json())

const users = []

const findUserByEmail = (email) => {
    const normalizedEmail = email.trim().toLowerCase()
    return users.find(user => user.email === normalizedEmail)
}

//middleware
const checkAdmin = (req, res, next) => {
    const { email } = req.query

    if (!email) {
        return res.status(400).json({
            message: 'Email is required'
        })
    }

    const existingUser = findUserByEmail(email)

    if (!existingUser) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    if (existingUser.role !== 'admin') {
        return res.status(403).json({
            message: 'Access denied'
        })
    }

    next()
}

//task 1
app.post('/register', async (req,res) => {
    try {
        const {email, password, role} = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase()
        
        const existingUser = findUserByEmail(email)
        if(existingUser){
            return res.status(409).json({
                message: 'Email is already registered'
            })
        }

        const userRole = role === 'admin' ? 'admin' : 'user'

        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password,saltRounds)

        const newUser = {
            id: Date.now(),
            email: normalizedEmail,
            password: hashedPassword,
            mustChangePassword: true,
            role: userRole,
            createdAt: new Date()
        }

        users.push(newUser)

        res.status(201).json({
            message: 'User registered successfully'
        })
    }catch(error){
        return res.status(500).json({
            message: 'Error registering user'
        })
    }
})

//task 2
app.post('/login', async (req,res) => {
    try{
        const {email,password} = req.body

        if(!email || !password){
            return res.status(400).json({
                message: 'Insert email and password'
            })
        }
        const normalizedEmail = email.trim().toLowerCase()
        
        const existingUser = findUserByEmail(normalizedEmail)

        if(!existingUser){
            return res.status(404).json({
                message: 'User is not found'
            })
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password)

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Неверный логин или пароль'
            });
        }

        if(existingUser.mustChangePassword){
            return res.status(403).json({
                message: 'You must change your password'
            })
        }

        res.json({
            message: 'Successfull login'
        });
    } catch(error){
        res.status(500).json({
            message: 'Login error'
        })
    }
})

app.post('/change-password', async (req,res) => {
    try{
        const {email,newPassword} = req.body

        if(!email || !newPassword){
            return res.status(400).json({
                message: 'Email and new password are required'
            })
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = findUserByEmail(normalizedEmail);

        //Для учебного простого проекта: ищем пользователя заново 
        //Для настоящего приложения: нет, обычно не ищем по email из формы, берем пользователя из авторизации
        if(!existingUser){
            return res.status(404).json({
                message: 'User not found'
        })
        }

        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

        existingUser.password = hashedPassword;
        existingUser.mustChangePassword = false;

        return res.status(200).json({
            message: 'Password changed successfully'
        });
    }catch(error){
        return res.status(500).json({
            message: 'Error changing password'
        });
    }
})

//task 5
app.post('/change-email', async (req,res) => {
    try{
        const {email, newEmail,password} = req.body

        if(!newEmail || !password || !email){
            return res.status(400).json({
                message: 'Current email, new email and password are required'
            })
        }

        const existingUser = findUserByEmail(email);

        //Для учебного простого проекта: ищем пользователя заново 
        //Для настоящего приложения: нет, обычно не ищем по email из формы, берем пользователя из авторизации
        if(!existingUser){
            return res.status(404).json({
                message: 'User not found'
        })
        }
     
        const isPasswordValid = await bcrypt.compare(password, existingUser.password)
if (!isPasswordValid) {
    return res.status(401).json({ message: 'Incorrect password' })
}

        const normalizedNewEmail = newEmail.trim().toLowerCase();
const userWithNewEmail = findUserByEmail(normalizedNewEmail);

if (userWithNewEmail && userWithNewEmail.email !== existingUser.email) {
    return res.status(409).json({
        message: 'Email is already registered'
    });
}
        existingUser.email = normalizedNewEmail

        return res.status(200).json({
            message: 'Email changed successfully'
        });
    }catch(error){
        return res.status(500).json({
            message: 'Error changing email'
        });
    }
})


//task 3
app.post('/delete-account', async (req,res) => {
   try{
    const {email,password} = req.body

    if(!email || !password){
        return res.status(400).json({
            message: 'Email and password are required'
        })
    }

    //найти пользователя
    const normalizedEmail = email.trim().toLowerCase();
    const userIndex = users.findIndex(user => user.email === normalizedEmail) //Почему findIndex, а не find:потому что для удаления удобно знать индекс, чтобы потом удалить из массива.

    if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' })
}

//проверить пароль
const isPasswordValid = await bcrypt.compare(password, users[userIndex].password);


if(!isPasswordValid){
    return res.status(401).json({
                message: 'Incorrect password'
            });
}
    //удалить из массива
    users.splice(userIndex,1)
    return res.status(200).json({ message: 'Account deleted successfully' });
   } catch(error){
    return res.status(500).json({
            message: 'Error deleting account'
        });
   }
})

//task 4
app.get('/admin', checkAdmin, (_req, res) => {
    return res.status(200).json({
        message: 'Welcome, admin'
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
