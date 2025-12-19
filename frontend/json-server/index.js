const fs = require('fs');
const jsonServer = require('json-server');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

const server = jsonServer.create();
const router = jsonServer.router(path.resolve(__dirname, 'db.json'));

// Middleware
server.use(cookieParser());
server.use(jsonServer.defaults({}));
server.use(jsonServer.bodyParser);
server.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
        preflightContinue: false,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    }),
);
server.options('*', cors());

// Имитация задержки
server.use(async (req, res, next) => {
    await new Promise((r) => setTimeout(r, 800));
    next();
});

// Простая проверка токена
const verifyToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    return token;
};

// Middleware: проверка авторизации
const requireAuth = (req, res, next) => {
    const token = verifyToken(req.headers.authorization);
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    req.userId = token;
    next();
};

// === AUTH ENDPOINTS ===

// Регистрация - по умолчанию создаем student
server.post('/auth/SignUp', (req, res) => {
    try {
        const {
            email, password, fullName, role = 'student',
        } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Валидация роли
        const allowedRoles = ['student', 'teacher', 'admin'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Allowed: student, teacher, admin' });
        }

        const dbPath = path.resolve(__dirname, 'db.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'UTF-8'));
        const { users = [] } = db;

        if (users.some((u) => u.email === email)) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const newUser = {
            id: Date.now().toString(),
            email,
            password,
            fullName,
            role,
            createdAt: new Date().toISOString(),
        };

        const accessToken = `access_${newUser.id}`;
        const refreshToken = `refresh_${newUser.id}`;

        db.users = [...users, newUser];
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        // Устанавливаем куку
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const { password: _, ...userWithoutPassword } = newUser;

        console.log(`✅ Register: ${role} user created - ${email}`);

        return res.status(201).json({
            user: userWithoutPassword,
            token: accessToken,
        });
    } catch (e) {
        console.error('Register error:', e);
        return res.status(500).json({ message: 'Registration failed' });
    }
});

// Логин
server.post('/auth/SignIn', (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'db.json'), 'UTF-8'));
        const { users = [] } = db;

        const user = users.find((u) => u.email === email && u.password === password);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const accessToken = `access_${user.id}`;
        const refreshToken = `refresh_${user.id}`;

        // Устанавливаем куку
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const { password: _, ...userWithoutPassword } = user;

        console.log(`✅ Login: ${user.role} user authenticated - ${email}`);

        return res.json({
            user: userWithoutPassword,
            token: accessToken,
        });
    } catch (e) {
        console.error('Login error:', e);
        return res.status(500).json({ message: 'Login failed' });
    }
});

// Refresh токен
server.post('/auth/refresh', (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        console.log('🔄 Refresh: Received refreshToken:', refreshToken);

        if (!refreshToken) {
            console.log('❌ Refresh: No refresh token in cookies');
            return res.status(401).json({ message: 'Refresh token required' });
        }

        if (!refreshToken.startsWith('refresh_')) {
            console.log('❌ Refresh: Invalid refresh token format');
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const userId = refreshToken.replace('refresh_', '');

        const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'db.json'), 'UTF-8'));
        const { users = [] } = db;

        const user = users.find((u) => u.id === userId);
        if (!user) {
            console.log('❌ Refresh: User not found for ID:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        const newAccessToken = `access_${user.id}`;
        const newRefreshToken = `refresh_${user.id}`;

        // Устанавливаем новую куку
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        console.log(`✅ Refresh: Tokens refreshed for ${user.role} - ${user.email}`);

        return res.json({
            token: newAccessToken,
        });
    } catch (e) {
        console.error('Refresh error:', e);
        return res.status(500).json({ message: 'Refresh failed' });
    }
});

// Logout
server.post('/auth/logout', (req, res) => {
    try {
        console.log('🚪 Logout: User logging out');

        // Очищаем refresh токен из кук
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
        });

        // Также очищаем другие возможные куки
        res.clearCookie('token', { path: '/' });
        res.clearCookie('jwt', { path: '/' });
        res.clearCookie('auth_token', { path: '/' });

        console.log('✅ Logout: Refresh token cleared from cookies');

        return res.json({
            message: 'Successfully logged out',
        });
    } catch (e) {
        console.error('Logout error:', e);
        return res.status(500).json({ message: 'Logout failed' });
    }
});

// Получение текущего пользователя
server.get('/auth/me', requireAuth, (req, res) => {
    try {
        const userId = req.userId.replace('access_', '');

        const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'db.json'), 'UTF-8'));
        const { users = [] } = db;

        const user = users.find((u) => u.id === userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
    } catch (e) {
        console.error('GetMe error:', e);
        return res.status(500).json({ message: 'Failed to fetch user' });
    }
});

// Эндпоинт для создания тестовых пользователей (для разработки)
server.post('/auth/create-test-users', (req, res) => {
    try {
        const dbPath = path.resolve(__dirname, 'db.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'UTF-8'));

        const testUsers = [
            {
                id: '1',
                email: 'student@test.com',
                password: '12345678',
                fullName: 'Тестовый Студент',
                role: 'student',
                createdAt: new Date().toISOString(),
            },
            {
                id: '2',
                email: 'teacher@test.com',
                password: '12345678',
                fullName: 'Тестовый Учитель',
                role: 'teacher',
                createdAt: new Date().toISOString(),
            },
            {
                id: '3',
                email: 'admin@test.com',
                password: '12345678',
                fullName: 'Тестовый Админ',
                role: 'admin',
                createdAt: new Date().toISOString(),
            },
        ];

        // Добавляем только если их еще нет
        testUsers.forEach((testUser) => {
            if (!db.users.some((u) => u.email === testUser.email)) {
                db.users.push(testUser);
            }
        });

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        console.log('✅ Test users created');
        return res.json({
            message: 'Test users created successfully',
            users: testUsers.map((u) => ({ email: u.email, password: u.password, role: u.role })),
        });
    } catch (e) {
        console.error('Create test users error:', e);
        return res.status(500).json({ message: 'Failed to create test users' });
    }
});

// === LAB TEMPLATES (защищены) ===

server.get('/lab-templates', requireAuth, (req, res) => {
    try {
        const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'db.json'), 'UTF-8'));
        const { labTemplates = [] } = db;

        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 20;
        const search = req.query.search || '';

        let filteredTemplates = labTemplates;

        // Поиск только по названию лабы
        if (search) {
            const searchLower = search.toLowerCase();
            filteredTemplates = labTemplates.filter((template) => template.name
                       && typeof template.name === 'string'
                       && template.name.toLowerCase().includes(searchLower));
        }

        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

        const response = {
            items: paginatedTemplates,
            meta: {
                page,
                perPage,
                total: filteredTemplates.length,
                totalPages: Math.ceil(filteredTemplates.length / perPage),
            },
        };

        console.log(`🔍 Lab templates search by name: "${search}", found ${filteredTemplates.length} results, page ${page}`);

        return res.json(response);
    } catch (e) {
        console.error('Lab templates error:', e);
        // Возвращаем пустой список при ошибке
        return res.json({
            items: [],
            meta: {
                page: 1,
                perPage: 20,
                total: 0,
                totalPages: 0,
            },
        });
    }
});
server.get('/lab-templates/:id', requireAuth, (req, res) => {
    try {
        const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'db.json'), 'UTF-8'));
        const { labTemplates = [] } = db;

        const template = labTemplates.find((t) => t.id === req.params.id);
        if (template) {
            return res.json(template);
        }
        return res.status(404).json({ message: 'Lab template not found' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: e.message });
    }
});

// Остальные эндпоинты
server.use(router);

server.listen(8080, () => {
    console.log('✅ JSON Server is running on http://localhost:8080');
    console.log('🎯 Frontend: http://localhost:3000');
    console.log('👥 Roles: student, teacher, admin');
    console.log('🔐 Register: POST /auth/register');
    console.log('🔐 Login: POST /auth/login');
    console.log('🚪 Logout: POST /auth/logout');
    console.log('🔄 Refresh: POST /auth/refresh');
    console.log('👤 Me: GET /users/me');
    console.log('🧪 Create test users: POST /auth/create-test-users');
    console.log('📚 Lab templates: GET /lab-templates');
    console.log('🔍 Search: GET /lab-templates?search=javascript&page=1&perPage=10');
});
