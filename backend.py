import json
import sqlite3
import datetime
from flask import Flask, request, jsonify
from yookassa import Configuration, Payment

# Конфигурация ЮKassa (тестовые данные, на проде замени на реальные)
SHOP_ID = '448544'
SHOP_API_TOKEN = 'test_Wb2Tfgt1fCNqAtPH6_skmG02D9TqIOTgPwlZkLwEd4o'
RETURN_URL = 'https://t.me/Test_masha_test_bot'

# Настройка конфигурации ЮKassa
Configuration.account_id = SHOP_ID
Configuration.secret_key = SHOP_API_TOKEN

# Инициализация Flask
app = Flask(__name__)

# Подключение к базе данных
conn = sqlite3.connect('sleepapp1.db', check_same_thread=False)
cursor = conn.cursor()

# Создание таблицы users, если она не существует
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    has_subscription BOOLEAN NOT NULL DEFAULT 0,
    subscription_end DATE,
    subscription_canceled BOOLEAN NOT NULL DEFAULT 0,
    purchase_date DATE DEFAULT NULL,
    renewal_count INTEGER DEFAULT 0,
    purchased_days INTEGER DEFAULT 0
)
''')
conn.commit()

# Функция для создания платежа (переиспользуем твою)
def create_payment(value, description):
    try:
        payment = Payment.create({
            "amount": {
                "value": value,
                "currency": "RUB"
            },
            "payment_method_data": {
                "type": "bank_card"
            },
            "confirmation": {
                "type": "redirect",
                "return_url": RETURN_URL
            },
            "capture": True,
            "description": description,
            "receipt": {
                "customer": {
                    "email": "gowaone1@gmail.com"
                },
                "items": [
                    {
                        "description": description,
                        "quantity": "1.00",
                        "amount": {
                            "value": value,
                            "currency": "RUB"
                        },
                        "vat_code": "1",
                        "payment_mode": "full_payment",
                        "payment_subject": "service"
                    }
                ]
            }
        })
        return json.loads(payment.json())
    except Exception as e:
        print(f"Ошибка при создании платежа: {str(e)}")
        return None

# Функция для проверки статуса платежа (переиспользуем твою, но без asyncio)
def check_payment(payment_id, max_attempts=20, delay=10):
    try:
        attempts = 0
        while attempts < max_attempts:
            attempts += 1
            payment = Payment.find_one(payment_id)
            payment_data = json.loads(payment.json())

            if payment_data['status'] == 'succeeded':
                return True
            elif payment_data['status'] == 'canceled':
                return False

            import time
            time.sleep(delay)

        return False
    except Exception as e:
        print(f"Ошибка при проверке платежа: {str(e)}")
        return False

# Функция для обновления статуса подписки (переиспользуем твою)
def update_subscription_status(user_id, status, days=7, cancel=False):
    end_date = None
    purchase_date = None
    renewal_count = 0

    if status:
        end_date = (datetime.datetime.now() + datetime.timedelta(days=days)).date()
        purchase_date = datetime.datetime.now().date()

        cursor.execute('SELECT renewal_count, subscription_end FROM users WHERE user_id = ?', (user_id,))
        result = cursor.fetchone()

        if result:
            renewal_count = result[0] + 1
            existing_end_date_str = result[1]
            if existing_end_date_str:
                existing_end_date = datetime.datetime.strptime(existing_end_date_str, '%Y-%m-%d').date()
                new_end_date = max(existing_end_date, end_date)
            else:
                new_end_date = end_date

            cursor.execute('''
                UPDATE users 
                SET has_subscription = ?, 
                    subscription_end = ?, 
                    purchase_date = ?, 
                    renewal_count = ?, 
                    purchased_days = purchased_days + ? 
                WHERE user_id = ?
            ''', (status, new_end_date, purchase_date, renewal_count, days, user_id))
        else:
            cursor.execute('''
                INSERT INTO users (user_id, has_subscription, subscription_end, purchase_date, renewal_count, purchased_days)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (user_id, status, end_date, purchase_date, renewal_count, days))
    else:
        cursor.execute('''
            UPDATE users 
            SET subscription_canceled = 1
            WHERE user_id = ?
        ''', (user_id,))

    conn.commit()

# Функция для проверки статуса подписки (переиспользуем твою)
def get_subscription_status(user_id):
    cursor.execute('SELECT has_subscription, subscription_end, subscription_canceled FROM users WHERE user_id = ?',
                   (user_id,))
    result = cursor.fetchone()
    if result:
        has_subscription, end_date_str, canceled = result
        end_date = None
        if end_date_str:
            end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d').date()
        if canceled and end_date and datetime.datetime.now().date() > end_date:
            return False, None
        if has_subscription and end_date and datetime.datetime.now().date() <= end_date:
            return True, end_date
    return False, None

# Эндпоинт для создания платежа
@app.route('/create-payment', methods=['POST'])
def create_payment_endpoint():
    data = request.get_json()
    user_id = data.get('user_id')
    plan = data.get('plan')  # "30days" или "365days"

    if not user_id or not plan:
        return jsonify({"error": "Missing user_id or plan"}), 400

    # Определяем параметры платежа
    if plan == "30days":
        value = "450.00"
        description = "Премиум доступ на 30 дней"
        days = 30
    elif plan == "365days":
        value = "3600.00"
        description = "Премиум доступ на 365 дней + 30 дней бесплатно"
        days = 395
    else:
        return jsonify({"error": "Invalid plan"}), 400

    # Создаём платёж
    payment_data = create_payment(value, description)
    if payment_data:
        return jsonify({
            "payment_id": payment_data['id'],
            "confirmation_url": payment_data['confirmation']['confirmation_url']
        }), 200
    else:
        return jsonify({"error": "Failed to create payment"}), 500

# Эндпоинт для проверки статуса подписки
@app.route('/check-subscription', methods=['GET'])
def check_subscription():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    has_subscription, end_date = get_subscription_status(int(user_id))
    return jsonify({
        "has_subscription": has_subscription,
        "subscription_end": str(end_date) if end_date else None
    }), 200

# Эндпоинт для вебхука от ЮKassa
@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    event = data.get('event')
    payment_object = data.get('object')

    if event == 'payment.succeeded':
        payment_id = payment_object['id']
        metadata = payment_object.get('metadata', {})
        user_id = metadata.get('user_id')
        days = int(metadata.get('days', 30))  # По умолчанию 30 дней

        if user_id:
            update_subscription_status(int(user_id), True, days)
            print(f"Payment succeeded for user {user_id}, subscription updated for {days} days")
        else:
            print("User ID not found in metadata")

    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)