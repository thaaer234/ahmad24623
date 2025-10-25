// قاعدة بيانات محلية للتطبيقات مع دعم CSV
class AppDatabase {
    constructor() {
        this.dbName = 'aiAppsDB';
        this.csvFileName = 'database.csv';
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        console.log('🔄 بدء تهيئة قاعدة البيانات...');
        
        // مسح البيانات القديمة أولاً لإجبار إعادة التحميل
        localStorage.removeItem(this.dbName);
        
        console.log('📥 جاري تحميل البيانات من CSV...');
        await this.loadFromCSV();
    }

    async loadFromCSV() {
        try {
            console.log('📁 محاولة تحميل database.csv...');
            const response = await fetch(`./${this.csvFileName}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            console.log('✅ تم تحميل CSV بنجاح:', csvText.substring(0, 200) + '...');
            
            const apps = this.parseCSV(csvText);
            const dbData = { apps: apps };
            
            localStorage.setItem(this.dbName, JSON.stringify(dbData));
            this.initialized = true;
            console.log(`💾 تم تحميل ${apps.length} تطبيق من CSV`, apps);
            
        } catch (error) {
            console.error('❌ فشل تحميل database.csv:', error);
            console.log('⚠️ استخدام البيانات الافتراضية...');
            
            // استخدام بيانات افتراضية
            const defaultData = {
                apps: this.getDefaultApps()
            };
            
            localStorage.setItem(this.dbName, JSON.stringify(defaultData));
            this.initialized = true;
            console.log('✅ تم تحميل البيانات الافتراضية');
        }
    }

    getDefaultApps() {
        return [
            {
                id: 1,
                name: "ChatGPT",
                company: "OpenAI",
                website: "https://chat.openai.com",
                isFree: "نعم (نسخة مجانية)",
                field: "المساعدة والكتابة",
                description: "مساعد ذكي يمكنه الإجابة على الأسئلة وكتابة النصوص ومساعدة في مختلف المهام باستخدام الذكاء الاصطناعي المتقدم.",
                logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/240px-ChatGPT_logo.svg.png",
                dateAdded: "2024-01-15"
            },
            {
                id: 2,
                name: "Midjourney",
                company: "Midjourney Inc",
                website: "https://www.midjourney.com",
                isFree: "لا",
                field: "التصميم والفن",
                description: "أداة متقدمة لإنشاء الصور الفنية باستخدام الذكاء الاصطناعي بناءً على أوصاف نصية مع قدرات إبداعية مذهلة.",
                logo: "https://cdn.midjourney.com/22828b2c-8657-45cd-85a1-08b6e8050d8a/0_0.png",
                dateAdded: "2024-01-15"
            },
            {
                id: 3,
                name: "Grammarly",
                company: "Grammarly Inc",
                website: "https://www.grammarly.com",
                isFree: "نعم (نسخة مجانية)",
                field: "الكتابة والتحرير",
                description: "أداة ذكية لتحسين الكتابة والتدقيق اللغوي باستخدام الذكاء الاصطناعي مع اقتراحات لتحسين الأسلوب.",
                logo: "https://static.grammarly.com/assets/files/6d2a4cd4e8f92a0c4f5e5c5c6c2c7c3e/grammarly-logo.svg",
                dateAdded: "2024-01-15"
            },
            {
                id: 4,
                name: "OtterAI",
                company: "Otter AI",
                website: "https://otter.ai",
                isFree: "نعم (نسخة مجانية)",
                field: "الاجتماعات والتسجيلات",
                description: "أداة للنسخ الصوتي الذكي وتحويل الكلام إلى نص مع تحديد المتحدثين تلقائياً وتلخيص المحتوى.",
                logo: "https://otter.ai/_next/static/media/otter_logo.5a7a0c9a.svg",
                dateAdded: "2024-01-15"
            },
            {
                id: 5,
                name: "TensorFlow",
                company: "Google",
                website: "https://www.tensorflow.org",
                isFree: "نعم",
                field: "التطوير والبرمجة",
                description: "مكتبة مفتوحة المصدر للتعلم الآلي والذكاء الاصطناعي تم تطويرها بواسطة جوجل وتستخدم على نطاق واسع.",
                logo: "https://www.tensorflow.org/images/tf_logo_social.png",
                dateAdded: "2024-01-15"
            }
        ];
    }

    parseCSV(csvText) {
        console.log('🔍 تحليل CSV...');
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
            console.warn('⚠️ ملف CSV فارغ أو به سطر واحد فقط');
            return this.getDefaultApps();
        }
        
        const headers = lines[0].split(',').map(header => header.trim());
        console.log('📋 عناوين CSV:', headers);
        
        const apps = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = this.parseCSVLine(line);
            console.log(`📝 سطر ${i}:`, values);
            
            if (values.length !== headers.length) {
                console.warn(`⚠️ تخطي سطر ${i}: عدد الأعمدة غير متطابق`);
                continue;
            }
            
            const app = {};
            headers.forEach((header, index) => {
                let value = values[index] || '';
                // إزالة الاقتباسات إذا كانت موجودة
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1).replace(/""/g, '"');
                }
                app[header] = value;
            });
            
            // تحويل id إلى رقم
            app.id = parseInt(app.id) || Date.now() + i;
            
            // التأكد من وجود الحقول الأساسية
            if (app.name && app.company) {
                apps.push(app);
                console.log(`✅ تمت إضافة تطبيق: ${app.name}`);
            } else {
                console.warn(`⚠️ تخطي سطر ${i}: بيانات ناقصة`);
            }
        }
        
        console.log(`📊 تم تحليل ${apps.length} تطبيق من CSV`);
        return apps.length > 0 ? apps : this.getDefaultApps();
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current);
        return values;
    }

    getAllApps() {
        try {
            const db = localStorage.getItem(this.dbName);
            if (!db) {
                console.warn('⚠️ لا توجد بيانات في LocalStorage');
                return this.getDefaultApps();
            }
            
            const parsedData = JSON.parse(db);
            const apps = parsedData.apps || [];
            console.log(`📊 تم استرجاع ${apps.length} تطبيق من قاعدة البيانات`, apps);
            return apps;
            
        } catch (error) {
            console.error('❌ خطأ في قراءة البيانات:', error);
            return this.getDefaultApps();
        }
    }

    addApp(app) {
        try {
            const db = JSON.parse(localStorage.getItem(this.dbName) || '{"apps":[]}');
            app.id = Date.now();
            app.dateAdded = new Date().toISOString().split('T')[0];
            db.apps.push(app);
            localStorage.setItem(this.dbName, JSON.stringify(db));
            console.log('✅ تم إضافة التطبيق:', app.name);
            return app;
        } catch (error) {
            console.error('❌ خطأ في إضافة التطبيق:', error);
            return null;
        }
    }

    deleteApp(id) {
        try {
            const db = JSON.parse(localStorage.getItem(this.dbName));
            const initialLength = db.apps.length;
            db.apps = db.apps.filter(app => app.id !== id);
            localStorage.setItem(this.dbName, JSON.stringify(db));
            console.log(`✅ تم حذف التطبيق. كان ${initialLength} أصبح ${db.apps.length}`);
            return true;
        } catch (error) {
            console.error('❌ خطأ في حذف التطبيق:', error);
            return false;
        }
    }

    // تصدير البيانات إلى CSV
    exportToCSV() {
        try {
            const apps = this.getAllApps();
            
            if (apps.length === 0) {
                showNotification('لا توجد بيانات للتصدير', 'warning');
                return false;
            }
            
            // إنشاء رأس CSV
            const headers = ['id', 'name', 'company', 'website', 'isFree', 'field', 'description', 'logo', 'dateAdded'];
            let csvContent = headers.join(',') + '\n';
            
            // إضافة البيانات
            apps.forEach(app => {
                const row = headers.map(header => {
                    let value = app[header] || '';
                    // إذا كانت القيمة تحتوي على فواصل أو اقتباسات، نضعها بين اقتباسات
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                        value = '"' + value.replace(/"/g, '""') + '"';
                    }
                    return value;
                });
                csvContent += row.join(',') + '\n';
            });
            
            // إنشاء ملف وتنزيله
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', 'تطبيقات_الذكاء_الاصطناعي.csv');
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('✅ تم تصدير البيانات إلى CSV');
            showNotification(`تم تصدير ${apps.length} تطبيق إلى ملف CSV`, 'success');
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في تصدير البيانات إلى CSV:', error);
            showNotification('حدث خطأ أثناء تصدير البيانات', 'error');
            return false;
        }
    }

    // استيراد البيانات من ملف CSV
    async importFromCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const csvText = e.target.result;
                    const importedApps = this.parseCSV(csvText);
                    
                    if (importedApps.length === 0) {
                        reject(new Error('لم يتم العثور على بيانات صالحة في الملف'));
                        return;
                    }
                    
                    // حفظ البيانات المستوردة
                    const db = JSON.parse(localStorage.getItem(this.dbName) || '{"apps":[]}');
                    db.apps = importedApps; // استبدال البيانات القديمة
                    localStorage.setItem(this.dbName, JSON.stringify(db));
                    
                    console.log(`✅ تم استيراد ${importedApps.length} تطبيق من CSV`);
                    resolve(importedApps.length);
                    
                } catch (error) {
                    console.error('❌ خطأ في استيراد البيانات من CSV:', error);
                    reject(error);
                }
            };
            
            reader.onerror = (error) => {
                console.error('❌ خطأ في قراءة الملف:', error);
                reject(error);
            };
            
            reader.readAsText(file);
        });
    }

    // مسح جميع البيانات وإعادة التحميل
    async resetDatabase() {
        try {
            localStorage.removeItem(this.dbName);
            this.initialized = false;
            await this.loadFromCSV();
            console.log('✅ تم إعادة تعيين قاعدة البيانات');
            return true;
        } catch (error) {
            console.error('❌ خطأ في إعادة التعيين:', error);
            return false;
        }
    }
}

// إنشاء instance من قاعدة البيانات
const appDB = new AppDatabase();

// دوال التحقق من الصحة
function validateAppName(name) {
    const regex = /^[A-Za-z]+$/;
    return regex.test(name);
}

function validateCompanyName(company) {
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(company);
}

function validateWebsite(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

// دالة لعرض رسائل الإشعار
function showNotification(message, type = 'info') {
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;

    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 15px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
            .notification.success { background: #27ae60; }
            .notification.error { background: #e74c3c; }
            .notification.info { background: #3498db; }
            .notification.warning { background: #f39c12; }
            .notification button {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
            }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 بدء تحميل التطبيق...');
    await initializeApp();
});

async function initializeApp() {
    console.log('🔧 تهيئة التطبيق...');
    
    // إضافة زر إعادة التعيين في جميع الصفحات
    addResetButton();
    
    await appDB.initialize();
    
    const appForm = document.getElementById('app-form');
    if (appForm) {
        console.log('📝 تهيئة نموذج إضافة التطبيق');
        initializeAppForm(appForm);
    }

    if (window.location.pathname.includes('apps.html') || window.location.href.includes('apps.html')) {
        console.log('📱 تحميل صفحة التطبيقات');
        await loadAndDisplayApps();
    }

    if (window.location.pathname.includes('index.html') || window.location.href.includes('index.html')) {
        console.log('🏠 تحميل الصفحة الرئيسية');
        updateindexStats();
    }
}

function addResetButton() {
    // إضافة زر إعادة التعيين في أعلى الصفحة
    if (!document.getElementById('reset-db-btn')) {
        const resetBtn = document.createElement('button');
        resetBtn.id = 'reset-db-btn';
        resetBtn.textContent = '🔄 إعادة تعيين قاعدة البيانات';
        resetBtn.style.position = 'fixed';
        resetBtn.style.top = '10px';
        resetBtn.style.left = '10px';
        resetBtn.style.zIndex = '10000';
        resetBtn.style.padding = '10px 15px';
        resetBtn.style.background = '#e74c3c';
        resetBtn.style.color = 'white';
        resetBtn.style.border = 'none';
        resetBtn.style.borderRadius = '5px';
        resetBtn.style.cursor = 'pointer';
        resetBtn.style.fontSize = '12px';
        
        resetBtn.addEventListener('click', async function() {
            if (confirm('هل أنت متأكد من أنك تريد إعادة تعيين قاعدة البيانات؟ سيتم إعادة تحميل جميع البيانات من ملف CSV.')) {
                showNotification('جاري إعادة تعيين قاعدة البيانات...', 'info');
                const success = await appDB.resetDatabase();
                if (success) {
                    showNotification('تم إعادة تعيين قاعدة البيانات بنجاح!', 'success');
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                } else {
                    showNotification('حدث خطأ أثناء إعادة التعيين', 'error');
                }
            }
        });
        
        document.body.appendChild(resetBtn);
    }
}

function initializeAppForm(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmit(this);
    });

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            clearErrorMessages();
        });
    }
}

function handleFormSubmit(form) {
    console.log('🔄 معالجة إرسال النموذج...');

    const appName = document.getElementById('app-name').value.trim();
    const companyName = document.getElementById('company-name').value.trim();
    const website = document.getElementById('website').value.trim();
    const logo = document.getElementById('logo').value.trim();
    const isFree = document.querySelector('input[name="is-free"]:checked');
    const usageField = document.getElementById('usage-field').value;
    const description = document.getElementById('description').value.trim();

    let isValid = true;

    if (!appName) {
        showError('app-name-error', 'يرجى إدخال اسم التطبيق');
        isValid = false;
    } else if (!validateAppName(appName)) {
        showError('app-name-error', 'يجب أن يحتوي اسم التطبيق على أحرف هجائية إنجليزية فقط بدون فراغات');
        isValid = false;
    } else {
        clearError('app-name-error');
    }

    if (!companyName) {
        showError('company-name-error', 'يرجى إدخال اسم الشركة المطورة');
        isValid = false;
    } else if (!validateCompanyName(companyName)) {
        showError('company-name-error', 'يجب أن يحتوي اسم الشركة على أحرف هجائية إنجليزية فقط (يسمح بالمسافات)');
        isValid = false;
    } else {
        clearError('company-name-error');
    }

    if (!website) {
        showError('website-error', 'يرجى إدخال الموقع الإلكتروني');
        isValid = false;
    } else if (!validateWebsite(website)) {
        showError('website-error', 'يرجى إدخال رابط موقع إلكتروني صحيح');
        isValid = false;
    } else {
        clearError('website-error');
    }

    if (!isFree) {
        showNotification('يرجى اختيار whether the app is free or not', 'error');
        isValid = false;
    }

    if (!usageField) {
        showNotification('يرجى اختيار مجال الاستخدام', 'error');
        isValid = false;
    }

    if (!description) {
        showNotification('يرجى إدخال شرح مختصر عن التطبيق', 'error');
        isValid = false;
    }

    if (isValid) {
        console.log('✅ النموذج صالح، جاري إضافة التطبيق...');

        const newApp = {
            name: appName,
            company: companyName,
            website: website,
            logo: logo || 'https://via.placeholder.com/100?text=AI+App',
            isFree: isFree.value,
            field: usageField,
            description: description
        };

        const addedApp = appDB.addApp(newApp);
        
        if (addedApp) {
            showNotification('تم إضافة التطبيق بنجاح!', 'success');
            form.reset();
            clearErrorMessages();
            
            setTimeout(() => {
                window.location.href = 'apps.html';
            }, 2000);
        } else {
            showNotification('حدث خطأ أثناء إضافة التطبيق', 'error');
        }
    } else {
        showNotification('يرجى تصحيح الأخطاء في النموذج', 'error');
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
    }
}

function clearError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
    }
}

function clearErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.textContent = '';
    });
}

async function loadAndDisplayApps() {
    console.log('🔄 جاري تحميل التطبيقات...');
    
    await appDB.initialize();
    
    const apps = appDB.getAllApps();
    console.log('📊 التطبيقات المحملة:', apps);
    displayApps(apps);
    
    const fieldFilter = document.getElementById('field-filter');
    const priceFilter = document.getElementById('price-filter');
    const resetBtn = document.getElementById('reset-filters');
    
    if (fieldFilter) {
        fieldFilter.addEventListener('change', applyFilters);
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('change', applyFilters);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
}

function displayApps(apps) {
    const container = document.getElementById('apps-container');
    
    if (!container) {
        console.error('❌ عنصر apps-container غير موجود');
        return;
    }
    
    console.log('🎨 عرض التطبيقات:', apps);

    if (apps.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>❌ لا توجد تطبيقات</h3>
                <p>لم يتم العثور على أي تطبيقات في قاعدة البيانات.</p>
                <p>انقر على زر "إعادة تعيين قاعدة البيانات" في أعلى الصفحة</p>
                <a href="add_app.html" class="cta-button">أضف أول تطبيق</a>
            </div>
        `;
        return;
    }

    let html = '';
    apps.forEach(app => {
        const isFree = app.isFree.includes('نعم');
        html += `
            <div class="app-card" data-id="${app.id}" data-field="${app.field}" data-price="${isFree ? 'مجاني' : 'مدفوع'}">
                <div class="app-header">
                    <img src="${app.logo}" alt="${app.name} logo" class="app-logo" 
                         onerror="this.src='https://via.placeholder.com/60?text=AI+App'">
                    <div class="app-info">
                        <h3>${app.name}</h3>
                        <p class="company">${app.company}</p>
                        <span class="field-badge">${app.field}</span>
                        <span class="price-badge ${isFree ? 'free' : 'paid'}">
                            ${app.isFree}
                        </span>
                    </div>
                </div>
                
                <div class="app-details">
                    <p><strong>🕸️ الموقع:</strong> 
                       <a href="${app.website}" target="_blank" rel="noopener">${app.website}</a>
                    </p>
                    <p class="description">${app.description}</p>
                    
                    ${app.dateAdded ? `
                    <div class="app-meta">
                        <small>تم الإضافة: ${app.dateAdded}</small>
                    </div>
                    ` : ''}
                    
                    <div class="app-actions">
                        <button class="visit-btn" onclick="window.open('${app.website}', '_blank')">
                            🌐 زيارة الموقع
                        </button>
                        <button class="share-btn" onclick="shareApp('${app.name}', '${app.website}')">
                            📤 مشاركة
                        </button>
                        <button class="delete-btn" onclick="deleteApp(${app.id})" title="حذف التطبيق">
                            🗑️ حذف
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log('✅ تم عرض التطبيقات بنجاح');
}

function applyFilters() {
    const fieldFilter = document.getElementById('field-filter')?.value;
    const priceFilter = document.getElementById('price-filter')?.value;
    const apps = appDB.getAllApps();
    
    let filteredApps = apps;
    
    if (fieldFilter) {
        filteredApps = filteredApps.filter(app => app.field === fieldFilter);
    }
    
    if (priceFilter) {
        if (priceFilter === 'مجاني') {
            filteredApps = filteredApps.filter(app => app.isFree.includes('نعم'));
        } else {
            filteredApps = filteredApps.filter(app => !app.isFree.includes('نعم'));
        }
    }
    
    displayApps(filteredApps);
}

function resetFilters() {
    const fieldFilter = document.getElementById('field-filter');
    const priceFilter = document.getElementById('price-filter');
    
    if (fieldFilter) fieldFilter.value = '';
    if (priceFilter) priceFilter.value = '';
    
    const apps = appDB.getAllApps();
    displayApps(apps);
}

function shareApp(appName, appWebsite) {
    if (navigator.share) {
        navigator.share({
            title: appName,
            text: `اكتشف تطبيق ${appName} للذكاء الاصطناعي`,
            url: appWebsite
        });
    } else {
        navigator.clipboard.writeText(appWebsite).then(() => {
            showNotification('تم نسخ رابط التطبيق إلى الحافظة!', 'success');
        }).catch(() => {
            const tempInput = document.createElement('input');
            tempInput.value = appWebsite;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            showNotification('تم نسخ رابط التطبيق إلى الحافظة!', 'success');
        });
    }
}

function deleteApp(appId) {
    if (confirm('هل أنت متأكد من أنك تريد حذف هذا التطبيق؟')) {
        const success = appDB.deleteApp(appId);
        if (success) {
            showNotification('تم حذف التطبيق بنجاح!', 'success');
            setTimeout(() => {
                loadAndDisplayApps();
            }, 1000);
        } else {
            showNotification('حدث خطأ أثناء حذف التطبيق', 'error');
        }
    }
}

function updateindexStats() {
    const apps = appDB.getAllApps();
    const totalAppsElement = document.getElementById('total-apps');
    
    if (totalAppsElement) {
        totalAppsElement.textContent = apps.length;
        console.log('📊 عدد التطبيقات:', apps.length);
    }
}

// جعل الدوال متاحة globally
window.shareApp = shareApp;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.loadAndDisplayApps = loadAndDisplayApps;
window.deleteApp = deleteApp;