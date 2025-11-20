# 🚀 Развертывание на Railway

Этот документ содержит пошаговые инструкции по развертыванию приложения Татьяна на платформе Railway с использованием PostgreSQL базы данных.

## ✅ Решенные проблемы безопасности

1. **Удалены утечки Telegram токенов** - 4 скомпрометированных токена удалены из истории репозитория
2. **Добавлена переменная окружения .env** - секретные данные больше не хранятся в коде
3. **Внедрена аутентификация архива** - использование ARCHIVE_TOKEN вместо простого пароля
4. **Миграция на PostgreSQL** - вместо хранения данных в памяти (теряются при перезагрузке)
5. **Правильное разделение API эндпоинтов** - регистрация → тест → архив (правильный поток данных)

## 🛠️ Предварительные требования

- [Railway аккаунт](https://railway.app)
- [GitHub аккаунт](https://github.com) (репозиторий уже связан)
- Node.js 18+ (для локального тестирования)

## 📋 Шаг 1: Подготовка Railway проекта

1. Перейди на railway.app и авторизуйся
2. Создай новый проект
3. Добавь PostgreSQL сервис:
   - Нажми "Add Service" → "Database" → "PostgreSQL"
   - Railway автоматически создаст DATABASE_URL

## 📋 Шаг 2: Развертывание бэкенда

1. В Railway: "Add Service" → "GitHub Repo"
2. Выбери репозиторий `makaka119911-oss/Tatiana`
3. Выбери ветку `main`
4. Railway автоматически обнаружит `package.json` и запустит `npm start`

## 🔐 Шаг 3: Установка переменных окружения

В Railway проекте перейди в "Variables" и добавь:

```
DATABASE_URL=<автоматически заполнится из PostgreSQL>
NODE_ENV=production
PORT=3000
ARCHIVE_TOKEN=<генерируй сильный токен, например: https://generate.randompassword.com>
ALLOWED_ORIGINS=https://yourdomain.com,https://makaka119911-oss.github.io
```

**ВАЖНО:** Никогда не коммитай реальные значения в репозиторий!

## 🔗 Шаг 4: Интеграция фронтенда

Обнови переменные на фронтенде (в `script.js`):

```javascript
const API_URL = 'https://YOUR_RAILWAY_DOMAIN.up.railway.app';
```

Получить домен Railway:
- Railway Dashboard → Settings → Domain
- Скопируй автоматически выданный домен

## 📝 Шаг 5: Тестирование API

### Тест 1: Регистрация
```bash
curl -X POST https://YOUR_DOMAIN/api/register \
  -H "Content-Type: application/json" \
  -d '{"lastName":"Тест","firstName":"Юзер","age":25,"phone":"+71234567890","telegram":"@testuser"}'
```

### Тест 2: Результаты теста
```bash
curl -X POST https://YOUR_DOMAIN/api/test-result \
  -H "Content-Type: application/json" \
  -d '{"registrationId":"12345","level":"High","score":85}'
```

### Тест 3: Получение архива
```bash
curl -X GET https://YOUR_DOMAIN/api/archive \
  -H "Authorization: Bearer YOUR_ARCHIVE_TOKEN"
```

## 🔍 Мониторинг

1. Railway Dashboard → Logs (смотреть логи сервера)
2. Railway Dashboard → Metrics (CPU, памяти, запросы)
3. Railway Database → Connect → VIEW → Query editor (прямой доступ к БД)

## 🚨 Решение проблем

### Ошибка: "Connection refused"
- Проверь, что PostgreSQL сервис запущен в Railway
- Проверь DATABASE_URL в Variables

### Ошибка: "CORS error"
- Обнови ALLOWED_ORIGINS в Variables
- Убедись, что фронтенд домен добавлен

### Ошибка: "401 Unauthorized" на архиве
- Проверь, что отправляешь правильный ARCHIVE_TOKEN
- Генерируй новый токен через generate.randompassword.com

## 🔄 Обновление после изменений в коде

Railway автоматически перестраивает и перезапускает приложение при пуше в GitHub:

```bash
git add .
git commit -m "Fix: Update something"
git push origin main
```

Railway перестроит контейнер и развернет новую версию (~2-3 минуты).

## 📊 Поток данных

```
1. Фронтенд: Пользователь регистрируется
   ↓
2. POST /api/register → Сервер сохраняет в PostgreSQL
   ↓
3. Фронтенд: Пользователь проходит тест
   ↓
4. POST /api/test-result → Сервер обновляет запись в БД
   ↓
5. GET /api/archive → Архив показывает только завершенные записи
   ↓
6. Поиск по фамилии или уровню либидо
```

## ✨ Дополнительные улучшения (рекомендуется)

- [ ] Добавить Rate Limiting для защиты от брутфорса
- [ ] Включить HTTPS только (secure cookies)
- [ ] Добавить логирование ошибок (Sentry, Rollbar)
- [ ] Настроить автоматические резервные копии PostgreSQL
- [ ] Добавить статус страницу (https://status.railway.com/)

## 📞 Поддержка

- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- Мой репозиторий: https://github.com/makaka119911-oss/Tatiana
