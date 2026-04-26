const fs = require('fs');
const jsonServer = require('json-server');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

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

// ==================== НАСТРОЙКА MULTER ДЛЯ ЗАГРУЗКИ ФАЙЛОВ ====================

// Создаем папку для загруженных файлов, если ее нет
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('📁 Создана папка для загрузок:', uploadsDir);
}

// Конфигурация хранения файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Генерируем уникальное имя файла
        const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

// Фильтрация файлов по типу (опционально)
const fileFilter = (req, file, cb) => {
    // Разрешаем все типы файлов для тестирования
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/zip',
        'application/x-rar-compressed',
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Неподдерживаемый тип файла: ${file.mimetype}`), false);
    }
};

// Настройка multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB максимальный размер
    },
});

// ==================== ФУНКЦИИ ДЛЯ АВТОРИЗАЦИИ ====================

// Простая проверка токена
const verifyToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    return token;
};

// Middleware: проверка авторизации
const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('🔐 Проверка авторизации:');
        console.log('   Headers:', authHeader ? 'Authorization присутствует' : 'нет Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Ошибка: нет заголовка Authorization или неверный формат');
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        console.log('🔑 Токен:', token ? `${token.substring(0, 30)}...` : 'null');

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        // ИЗВЛЕКАЕМ USER_ID ИЗ ТОКЕНА
        // Токен имеет формат "access_1762381432321"
        if (token.startsWith('access_')) {
            req.userId = token.replace('access_', '');
            console.log('✅ userId извлечен из токена (startsWith):', req.userId);
        }
        // Проверяем другие возможные форматы
        else if (token.includes('_')) {
            const parts = token.split('_');
            if (parts.length > 1) {
                req.userId = parts[1];
                console.log('✅ userId извлечен из токена (split):', req.userId);
            }
        }
        // Если токен это просто число (userId)
        else if (/^\d+$/.test(token)) {
            req.userId = token;
            console.log('✅ userId извлечен из токена (числовой):', req.userId);
        } else {
            // Если ничего не подошло, возможно токен уже является userId
            req.userId = token;
            console.log('⚠️ Используем токен как userId:', req.userId);
        }

        if (!req.userId) {
            console.log('❌ Не удалось извлечь userId из токена');
            return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
        }

        next();
    } catch (error) {
        console.error('❌ Ошибка в requireAuth:', error);
        return res.status(401).json({ message: 'Unauthorized: Error processing token' });
    }
};

/** Доступ только пользователям с role === true (как на фронте в RequireUser / Header). */
const requireAdmin = (req, res, next) => {
    try {
        const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'db.json'), 'UTF-8'));
        const { users = [] } = db;
        const user = users.find((u) => String(u.id) === String(req.userId));
        if (!user || user.role !== true) {
            return res.status(403).json({ message: 'Forbidden: admin access required' });
        }
        next();
    } catch (e) {
        console.error('requireAdmin:', e);
        return res.status(500).json({ message: 'Authorization check failed' });
    }
};

// ==================== ЭНДПОИНТЫ ДЛЯ РАБОТЫ С ОТЧЕТАМИ ПО ЛАБАМ ====================

/**
 * ПОЛУЧИТЬ ОТЧЕТ СТУДЕНТА ПО КОНКРЕТНОЙ ЛАБЕ
 * GET /lab-templates/:labId/reports/:userId
 */
server.get('/lab-templates/:labId/reports/:userId', requireAuth, (req, res) => {
    try {
        const { labId, userId } = req.params;

        console.log(`📋 Запрос отчета для лабы ${labId}, пользователь ${userId}`);

        const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'db.json'), 'UTF-8'));
        const { labReports = [] } = db;

        // Ищем отчет по labId и userId
        const report = labReports.find((r) => r.labId === labId && r.userId === userId);

        if (!report) {
            console.log(`📭 Отчет не найден для лабы ${labId}, пользователь ${userId}`);
            return res.status(200).json(null); // Возвращаем null, если отчета нет
        }

        // Проверяем существует ли файл физически
        const filePath = path.join(uploadsDir, report.savedAs);
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️ Файл отчета не найден на диске: ${report.savedAs}`);
            // Возвращаем отчет, но с пометкой, что файл отсутствует
            return res.json({
                ...report,
                fileExists: false,
                message: 'Файл отчета не найден на сервере',
            });
        }

        console.log(`✅ Отчет найден: ${report.fileName}`);
        return res.json(report);
    } catch (error) {
        console.error('❌ Ошибка при получении отчета:', error);
        return res.status(500).json({
            message: 'Ошибка при получении отчета',
            error: error.message,
        });
    }
});

/**
 * ЗАГРУЗИТЬ ОТЧЕТ ДЛЯ ЛАБОРАТОРНОЙ РАБОТЫ
 * POST /lab-templates/:labId/reports
 */
server.post('/lab-templates/:labId/reports', requireAuth, upload.single('file'), (req, res) => {
    try {
        const { labId } = req.params;
        const { userId } = req;

        console.log(`📤 Загрузка отчета для лабы ${labId}, пользователь ${userId}:`, {
            originalname: req.file?.originalname,
            size: req.file?.size,
            mimetype: req.file?.mimetype,
        });

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Файл не был загружен',
                code: 'NO_FILE',
            });
        }

        // Сохраняем файл физически
        const filePath = path.join(uploadsDir, req.file.filename);

        // Проверяем что файл действительно сохранен
        const fileExists = fs.existsSync(filePath);
        if (!fileExists) {
            console.error('❌ Файл не был сохранен на диск!');
            return res.status(500).json({
                success: false,
                message: 'Ошибка при сохранении файла на сервере',
                code: 'FILE_SAVE_ERROR',
            });
        }

        // Получаем информацию о файле
        const stat = fs.statSync(filePath);

        // Создаем URL для доступа к файлу
        const fileUrl = `http://localhost:8080/uploads/${req.file.filename}`;

        // Создаем запись об отчете
        const reportData = {
            id: uuidv4(),
            labId,
            userId,
            url: fileUrl,
            fileName: req.file.originalname,
            fileSize: stat.size,
            fileType: req.file.mimetype,
            uploadedAt: new Date().toISOString(),
            savedAs: req.file.filename,
            status: 'uploaded', // uploaded, checked, rejected
            path: `/uploads/${req.file.filename}`,
        };

        // Читаем текущую базу данных
        const dbPath = path.resolve(__dirname, 'db.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'UTF-8'));

        // Инициализируем массив labReports если его нет
        if (!db.labReports) {
            db.labReports = [];
        }

        // Удаляем старый отчет, если он был
        db.labReports = db.labReports.filter((r) => !(r.labId === labId && r.userId === userId));

        // Добавляем новый отчет
        db.labReports.push(reportData);

        // Сохраняем в базу данных
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        console.log(`✅ Отчет для лабы ${labId} успешно сохранен:`);
        console.log(`   📄 Имя: ${req.file.originalname}`);
        console.log(`   📦 Размер: ${stat.size} bytes`);
        console.log(`   🔗 URL: ${fileUrl}`);

        return res.status(200).json(reportData);
    } catch (error) {
        console.error('❌ Ошибка при загрузке отчета:', error);
        return res.status(500).json({
            success: false,
            message: 'Ошибка при загрузке отчета',
            error: error.message,
        });
    }
});

/**
 * ПОЛУЧИТЬ ВСЕ ОТЧЕТЫ СТУДЕНТА
 * GET /users/:userId/reports
 */
server.get('/users/:userId/reports', requireAuth, (req, res) => {
    try {
        const { userId } = req.params;

        console.log(`📋 Запрос всех отчетов пользователя ${userId}`);

        const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'db.json'), 'UTF-8'));
        const { labReports = [] } = db;

        // Фильтруем отчеты по userId
        const userReports = labReports.filter((r) => r.userId === userId);

        console.log(`📊 Найдено отчетов: ${userReports.length}`);
        return res.json(userReports);
    } catch (error) {
        console.error('❌ Ошибка при получении отчетов пользователя:', error);
        return res.status(500).json({
            message: 'Ошибка при получении отчетов',
            error: error.message,
        });
    }
});

/**
 * УДАЛИТЬ ОТЧЕТ
 * DELETE /lab-templates/:labId/reports/:reportId
 */
server.delete('/lab-templates/:labId/reports/:reportId', requireAuth, (req, res) => {
    try {
        const { labId, reportId } = req.params;
        const { userId } = req;

        console.log('🗑️ Запрос на удаление отчета:');
        console.log('   labId:', labId);
        console.log('   reportId:', reportId);
        console.log('   userId:', userId);

        // Читаем базу данных
        const dbPath = path.resolve(__dirname, 'db.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'UTF-8'));

        // Инициализируем массив отчетов если его нет
        if (!db.labReports) {
            db.labReports = [];
        }

        // Ищем отчет по ID
        const reportIndex = db.labReports.findIndex((r) => r.id === reportId);

        console.log('🔍 Поиск отчета по ID:', reportId);
        console.log('📊 Найден индекс:', reportIndex);
        console.log('📋 Всего отчетов в БД:', db.labReports.length);

        if (reportIndex === -1) {
            console.log('❌ Отчет не найден в БД');
            return res.status(404).json({
                message: 'Отчет не найден',
                requestedId: reportId,
            });
        }

        const report = db.labReports[reportIndex];

        // Проверяем права доступа (опционально)
        if (report.userId !== userId) {
            console.log('❌ Нет прав на удаление этого отчета');
            return res.status(403).json({ message: 'Нет прав на удаление этого отчета' });
        }

        // Удаляем физический файл
        if (report.savedAs) {
            const filePath = path.join(uploadsDir, report.savedAs);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('✅ Физический файл удален:', report.savedAs);
            } else {
                console.log('⚠️ Физический файл не найден:', report.savedAs);
            }
        }

        // Удаляем запись из БД
        db.labReports.splice(reportIndex, 1);

        // Сохраняем БД
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        console.log('✅ Отчет успешно удален из БД');
        console.log('📊 Осталось отчетов в БД:', db.labReports.length);

        return res.status(200).json({
            message: 'Отчет успешно удален',
            deletedId: reportId,
        });
    } catch (error) {
        console.error('❌ Ошибка при удалении отчета:', error);
        return res.status(500).json({
            message: 'Ошибка при удалении отчета',
            error: error.message,
        });
    }
});
server.get('/news/publications', (req, res) => {
    try {
        const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'db.json'), 'UTF-8'));
        const news = db.news || [];

        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 6;

        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        const items = news.slice(start, end);

        return res.json({
            items,
            total: news.length,
            page,
            page_size: pageSize,
            total_pages: Math.ceil(news.length / pageSize),
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'error' });
    }
});
server.post('/news/publications/create', requireAuth, requireAdmin, (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: 'Title and content required',
            });
        }

        const dbPath = path.resolve(__dirname, 'db.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'UTF-8'));

        const newNews = {
            id: uuidv4(),
            title,
            content,
            images: [],
            createdAt: new Date().toISOString(),
        };

        if (!db.news) db.news = [];

        db.news.unshift(newNews);

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        return res.json(newNews);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Create failed' });
    }
});
server.post(
    '/news/publications/:id/images',
    requireAuth,
    requireAdmin,
    upload.array('images', 4),
    (req, res) => {
        try {
            const { id } = req.params;

            const dbPath = path.resolve(__dirname, 'db.json');
            const db = JSON.parse(fs.readFileSync(dbPath, 'UTF-8'));

            const newsItem = db.news.find((n) => n.id === id);

            if (!newsItem) {
                return res.status(404).json({ message: 'News not found' });
            }

            const newImages = (req.files || []).map((file) => ({
                url: `http://localhost:8080/uploads/${file.filename}`,
            }));

            newsItem.images = [...(newsItem.images || []), ...newImages];

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            return res.json(newsItem);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Upload images failed' });
        }
    },
);
server.delete('/news/publications/:id', requireAuth, requireAdmin, (req, res) => {
    try {
        const { id } = req.params;

        const dbPath = path.resolve(__dirname, 'db.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'UTF-8'));

        const newsItem = db.news.find((n) => n.id === id);

        if (!newsItem) {
            return res.status(404).json({ message: 'News not found' });
        }

        // удаляем файлы
        if (newsItem.images?.length) {
            newsItem.images.forEach((img) => {
                const filename = img.url.split('/uploads/')[1];
                const filePath = path.join(__dirname, 'uploads', filename);

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        db.news = db.news.filter((n) => n.id !== id);

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        return res.json({ success: true });
    } catch (e) {
        return res.status(500).json({ message: 'Delete failed' });
    }
});
server.put('/news/publications/:id', requireAuth, requireAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        const dbPath = path.resolve(__dirname, 'db.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'UTF-8'));

        const index = db.news.findIndex((n) => n.id === id);

        if (index === -1) {
            return res.status(404).json({ message: 'News not found' });
        }

        db.news[index] = {
            ...db.news[index],
            title: title || db.news[index].title,
            content: content || db.news[index].content,
        };

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        return res.json(db.news[index]);
    } catch (e) {
        return res.status(500).json({ message: 'Update failed' });
    }
});
server.get('/debug/reports', requireAuth, (req, res) => {
    try {
        const dbPath = path.resolve(__dirname, 'db.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'UTF-8'));

        const reports = db.labReports || [];

        console.log('📋 Все отчеты в БД:', reports.length);

        res.json({
            count: reports.length,
            reports: reports.map((r) => ({
                labId: r.labId,
                userId: r.userId,
                fileName: r.fileName,
            })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ЭНДПОИНТ ДЛЯ ПРОСТОЙ ЗАГРУЗКИ ФАЙЛА ====================

// Загрузка файла (без авторизации)
server.post('/upload/simple', upload.single('file'), (req, res) => {
    try {
        console.log('📤 Простая загрузка файла (без авторизации):', {
            originalname: req.file?.originalname,
            size: req.file?.size,
            mimetype: req.file?.mimetype,
            filename: req.file?.filename,
        });

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Файл не был загружен',
                code: 'NO_FILE',
            });
        }

        // Сохраняем файл физически
        const filePath = path.join(uploadsDir, req.file.filename);

        // Проверяем что файл действительно сохранен
        const fileExists = fs.existsSync(filePath);

        if (!fileExists) {
            console.error('❌ Файл не был сохранен на диск!');
            return res.status(500).json({
                success: false,
                message: 'Ошибка при сохранении файла на сервере',
                code: 'FILE_SAVE_ERROR',
            });
        }

        // Получаем информацию о файле
        const stat = fs.statSync(filePath);

        // Создаем URL для доступа к файлу
        const fileUrl = `http://localhost:8080/uploads/${req.file.filename}`;

        console.log(`✅ Файл успешно сохранен: ${req.file.originalname} (${stat.size} bytes)`);
        console.log(`📁 Путь к файлу: ${filePath}`);
        console.log(`🔗 URL файла: ${fileUrl}`);

        // Возвращаем успешный ответ с подробной информацией
        return res.status(200).json({
            success: true,
            message: 'Файл успешно загружен',
            file: {
                url: fileUrl,
                fileName: req.file.originalname,
                fileSize: stat.size,
                fileType: req.file.mimetype,
                uploadedAt: new Date().toISOString(),
                savedAs: req.file.filename,
                path: `/uploads/${req.file.filename}`,
                serverPath: filePath,
                exists: true,
                sizeOnDisk: stat.size,
            },
            server: {
                uploadsDir,
                totalFiles: fs.readdirSync(uploadsDir).length,
            },
        });
    } catch (error) {
        console.error('❌ Ошибка простой загрузки файла:', error);
        console.error('Stack:', error.stack);

        return res.status(500).json({
            success: false,
            message: 'Ошибка при загрузке файла',
            error: error.message,
            code: 'UPLOAD_ERROR',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
});

// ==================== СТАТИЧЕСКАЯ РАЗДАЧА ФАЙЛОВ ====================

// Статический сервер для файлов
server.get('/uploads/:filename', (req, res) => {
    const { filename } = req.params;
    const { expires } = req.query;

    // 🔥 проверка "временной ссылки"
    if (expires && Date.now() > Number(expires)) {
        return res.status(403).json({
            message: 'Ссылка истекла',
        });
    }

    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } else {
        res.status(404).json({ message: 'Файл не найден' });
    }
});

// Получение списка доступных файлов
server.get('/uploads', (req, res) => {
    try {
        const files = fs.readdirSync(uploadsDir);
        const fileList = files.map((filename) => {
            const filePath = path.join(uploadsDir, filename);
            const stat = fs.statSync(filePath);
            return {
                name: filename,
                url: `http://localhost:8080/uploads/${filename}`,
                size: stat.size,
                created: stat.birthtime,
                modified: stat.mtime,
            };
        });

        res.json({
            count: files.length,
            files: fileList,
        });
    } catch (error) {
        console.error('❌ Ошибка получения списка файлов:', error);
        res.status(500).json({
            message: 'Ошибка при получении списка файлов',
            error: error.message,
        });
    }
});

// ==================== AUTH ENDPOINTS (ИЗ ПЕРВОГО СЕРВЕРА) ====================

// Регистрация - по умолчанию создаем student
server.post('/auth/signup', (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ message: 'Missing required fields' });
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
            role: false, // 🔥 ВСЕГДА СТУДЕНТ
            avatar: null, // 🔥 ДОБАВЛЯЕМ ПОЛЕ ДЛЯ АВАТАРА
            createdAt: new Date().toISOString(),
        };

        const accessToken = `access_${newUser.id}`;
        const refreshToken = `refresh_${newUser.id}`;

        db.users.push(newUser);
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const { password: _, ...userWithoutPassword } = newUser;

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
server.post('/auth/signin', (req, res) => {
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

// Logout All Devices - выход со всех устройств
server.post('/auth/logout-all', (req, res) => {
    try {
        console.log('🚪🚪 Logout All: User logging out from all devices');

        // Очищаем refresh токен из кук
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
        });

        // Очищаем все возможные куки
        res.clearCookie('token', { path: '/' });
        res.clearCookie('jwt', { path: '/' });
        res.clearCookie('auth_token', { path: '/' });

        // В реальном приложении здесь нужно было бы инвалидировать все refresh токены пользователя
        // Для json-server просто очищаем куки на клиенте

        console.log('✅ Logout All: All sessions terminated');

        return res.json({
            message: 'Successfully logged out from all devices',
        });
    } catch (e) {
        console.error('Logout all error:', e);
        return res.status(500).json({ message: 'Logout from all devices failed' });
    }
});

// Получение текущего пользователя (с аватаром)
server.get('/auth/me', requireAuth, (req, res) => {
    try {
        const { userId } = req;

        const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'db.json'), 'UTF-8'));
        const { users = [] } = db;

        const user = users.find((u) => u.id === userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Если у пользователя есть аватар, добавляем полный URL
        let avatarUrl = user.avatar || null;
        if (avatarUrl) {
            // Проверяем, есть ли файл на диске
            const filePath = path.join(uploadsDir, avatarUrl);
            if (fs.existsSync(filePath)) {
                // Добавляем временную метку для обхода кэша
                avatarUrl = `http://localhost:8080/uploads/${avatarUrl}?t=${Date.now()}`;
            } else {
                avatarUrl = null;
                // Если файла нет, очищаем поле avatar
                user.avatar = null;
                fs.writeFileSync(path.resolve(__dirname, 'db.json'), JSON.stringify(db, null, 2));
            }
        }

        const { password: _, ...userWithoutPassword } = user;

        return res.json({
            ...userWithoutPassword,
            avatar: avatarUrl,
        });
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
                role: false,
                avatar: null,
                createdAt: new Date().toISOString(),
            },
            {
                id: '2',
                email: 'teacher@test.com',
                password: '12345678',
                fullName: 'Тестовый Учитель',
                role: true,
                avatar: null,
                createdAt: new Date().toISOString(),
            },
            {
                id: '3',
                email: 'admin@test.com',
                password: '12345678',
                fullName: 'Тестовый Админ',
                role: true,
                avatar: null,
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

server.get('/audit/logs/all', requireAuth, requireAdmin, (req, res) => {
    try {
        // Читаем базу данных
        const dbPath = path.resolve(__dirname, 'db.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'UTF-8'));

        // Получаем массив аудита или пустой массив
        const auditLogs = db.auditLogs || [];

        console.log(`📋 Запрос аудита: возвращено ${auditLogs.length} записей`);

        // Сортируем по дате (сначала новые)
        const sortedLogs = [...auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Возвращаем ответ
        res.json({
            items: sortedLogs,
            total: sortedLogs.length,
        });
    } catch (error) {
        console.error('❌ Ошибка при получении аудита:', error);
        res.status(500).json({
            message: 'Ошибка при получении данных аудита',
            error: error.message,
        });
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

// ==================== АВАТАРЫ ====================

// Загрузка аватара
server.post('/updateavatar', requireAuth, upload.single('avatar'), (req, res) => {
    try {
        const { userId } = req;

        if (!req.file) {
            return res.status(400).json({
                message: 'Файл не загружен',
            });
        }

        const dbPath = path.resolve(__dirname, 'db.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'UTF-8'));

        // Находим пользователя
        const userIndex = db.users.findIndex((u) => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        // Удаляем старый аватар, если он был
        if (db.users[userIndex].avatar) {
            const oldAvatarPath = path.join(uploadsDir, db.users[userIndex].avatar);
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
                console.log('🗑️ Удален старый аватар:', db.users[userIndex].avatar);
            }
        }

        // Сохраняем новое имя файла в объекте пользователя
        db.users[userIndex].avatar = req.file.filename;

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        console.log('✅ Avatar uploaded and saved to user:', req.file.filename);
        console.log('👤 User:', db.users[userIndex].email);

        return res.json({
            success: true,
            avatarUrl: `http://localhost:8080/uploads/${req.file.filename}`,
        });
    } catch (error) {
        console.error('❌ Upload avatar error:', error);
        return res.status(500).json({
            message: 'Ошибка загрузки аватара',
        });
    }
});

// Удаление старого эндпоинта GET /updateavatar, так как аватар теперь в /auth/me
// Оставляем для обратной совместимости, но с изменениями
server.get('/updateavatar', requireAuth, (req, res) => {
    try {
        const { userId } = req;

        const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'db.json'), 'UTF-8'));
        const user = db.users.find((u) => u.id === userId);

        if (!user || !user.avatar) {
            return res.json({ url: null });
        }

        // Проверяем, существует ли файл на диске
        const filePath = path.join(uploadsDir, user.avatar);
        if (!fs.existsSync(filePath)) {
            // Если файла нет, очищаем поле avatar
            user.avatar = null;
            fs.writeFileSync(path.resolve(__dirname, 'db.json'), JSON.stringify(db, null, 2));
            return res.json({ url: null });
        }

        // 🔥 имитация временной ссылки
        const expires = Date.now() + 15 * 60 * 1000;
        const url = `http://localhost:8080/uploads/${user.avatar}?expires=${expires}`;

        return res.json({ url });
    } catch (error) {
        console.error('❌ Get avatar error:', error);
        return res.status(500).json({
            message: 'Ошибка получения аватара',
        });
    }
});

server.use(router);

server.listen(8080, () => {
    console.log('✅ JSON Server с поддержкой загрузки файлов запущен на http://localhost:8080');
    console.log('🎯 Frontend: http://localhost:3000');
    console.log('📁 Папка загрузок:', uploadsDir);
    console.log('');
    console.log('👥 Аутентификация:');
    console.log('   🔐 Register: POST /auth/signup');
    console.log('   🔐 Login: POST /auth/signin');
    console.log('   🚪 Logout: POST /auth/logout');
    console.log('   🚪🚪 Logout All: POST /auth/logout-all');
    console.log('   🔄 Refresh: POST /auth/refresh');
    console.log('   👤 Me: GET /auth/me (возвращает пользователя с avatar URL)');
    console.log('   🧪 Create test users: POST /auth/create-test-users');
    console.log('');
    console.log('🖼️ Аватары:');
    console.log('   POST /updateavatar - Загрузить аватар (сохраняется в пользователе)');
    console.log('   GET /updateavatar - Получить временную ссылку (устаревший, используйте /auth/me)');
    console.log('');
    console.log('📤 Загрузка файлов:');
    console.log('   POST /upload/simple - Простая загрузка файла (БЕЗ авторизации)');
    console.log('   GET /uploads/:filename - Получить загруженный файл');
    console.log('   GET /uploads - Список всех загруженных файлов');
    console.log('');
    console.log('📚 Отчеты по лабораторным работам (ТРЕБУЕТ АВТОРИЗАЦИИ):');
    console.log('   GET    /lab-templates/:labId/reports/:userId - Получить отчет по лабе');
    console.log('   POST   /lab-templates/:labId/reports - Загрузить отчет');
    console.log('   GET    /users/:userId/reports - Все отчеты пользователя');
    console.log('   DELETE /lab-templates/:labId/reports/:reportId - Удалить отчет');
    console.log('');
    console.log('📚 Лабораторные шаблоны (ТРЕБУЕТ АВТОРИЗАЦИИ):');
    console.log('   GET /lab-templates - Список шаблонов');
    console.log('   GET /lab-templates/:id - Детали шаблона');
    console.log('');
    console.log('🔐 Пример использования:');
    console.log('   1. POST /auth/signin - получить токен');
    console.log('   2. Используйте токен в заголовке: Authorization: Bearer <token>');
    console.log('   3. GET /auth/me - получить данные пользователя (включая avatar)');
    console.log('   4. POST /updateavatar - загрузить новый аватар');
    console.log('   5. GET /auth/me - получить обновленные данные с новым аватаром');
});
