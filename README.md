# AURUM — Personal Wealth & Asset Management System

> **ÖZEL VE GİZLİ MÜLKİYET / PROPRIETARY & CONFIDENTIAL**  
> **Telif Hakkı © 2026 Melih KOÇHAN. Tüm Hakları Saklıdır.**  
> *Bu proje ve kaynak kodları Melih KOÇHAN'a aittir. İzinsiz kopyalanması, çoğaltılması, üçüncü şahıslarla paylaşılması, dağıtılması veya ticari amaçla kullanılması kesinlikle yasaktır.*

---

## 🏛️ Proje Hakkında

**AURUM**, lüks koyu tasarım standartları ve hassas finans matematiği ile geliştirilmiş, yeni nesil bir **Kişisel Varlık ve Servet Yönetimi (Wealth Operating System)** platformudur.

Kullanıcının nakit, döviz, altın, banka mevduatları, düzenli gelir/giderleri ve birikim hedeflerini tek bir merkezden, TCMB ve serbest piyasa (Kapalıçarşı) canlı fiyat beslemeleriyle takip etmesini sağlar.

---

## ✨ Temel Yetenekler ve Mimari

- **Merkezi Finans ve Muhasebe Motoru:**
  - Gerçekleşen ve beklenen nakit akışını ayrıştıran kesin bakiye matematiği.
  - Vade günü otomasyonu (maaş, taksit ve düzenli ödemelerin günü geldiğinde otomatik hesaba yansıması).
  - Ağırlıklı ortalama maliyet (WAC) yöntemiyle canlı kâr/zarar ve portföy getiri hesaplamaları.

- **Varlık ve Portföy Yönetimi:**
  - Gram Altın, Çeyrek Altın, Yarım Altın, Tam Altın, USD, EUR ve TL nakit varlıkları.
  - Münferit alış ve satış işlem geçmişi, işlem anı ve sistem kayıt saati ayrımı.
  - Evrensel, bağımsız onay penceresi (`ConfirmDialog`) ile güvenli kayıt yönetimi.

- **Kasa & Hesap Takibi:**
  - Farklı banka mevduatları, kredi kartları ve nakit kasaları arasında çift taraflı fon transferleri.
  - Güncel hesap bakiyelerinin ve aylık akışların anlık senkronizasyonu.

- **Görsel ve Atmosferik Tasarım Standartları:**
  - Obsidian & Gold lüks koyu tema mimarisi.
  - Yumuşak ışık geçişleri ve akıcı mikro-etkileşimler.
  - Gizlilik modu (toplu ortamlarda bakiyeleri tek tuşla maskeleme).

---

## 🚀 Sıradaki Geliştirmeler (Roadmap)

1. **Supabase Veritabanı Mimarisi:**
   - İlişkisel tabloların (`users`, `accounts`, `transactions`, `holdings`, `goals`, `notes`) Supabase üzerinde yapılandırılması.
   - Row Level Security (RLS) politikaları ile uçtan uca veri güvenliği.
2. **Bulut Veri Senkronizasyonu:**
   - Yerel depolamadan Supabase gerçek zamanlı veri akışına (Realtime subscriptions) geçiş.
   - Çoklu cihaz desteği ve anlık veri güncelleme mekanizması.
3. **Gelişmiş Varlık ve Kategori Analitikleri:**
   - Yapay zeka destekli harcama ve portföy dağılım projeksiyonları.

---

## 🔒 Yasal Uyarı / Legal Notice

Bu depo içerisindeki tüm tasarım unsurları, algoritmalar, arayüz bileşenleri ve finansal motor mantığı **Melih KOÇHAN** mülkiyetindedir. Proje açık kaynaklı bir kütüphane veya şablon **değildir**. Kodların herhangi bir parçasının izinsiz kullanımı fikri mülkiyet haklarının ihlali teşkil eder.
