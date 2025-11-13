import express from 'express';
import { connect } from "puppeteer-real-browser";
import pluginStealth from "puppeteer-extra-plugin-stealth";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// بيانات المواقع المدعومة مع تحديد المواقع التي تستخدم Cloudflare
const sites = {
    "yorurl": {
        baseUrl: "https://go.yorurl.com/",
        referer: "https://earnbox.in/",
        needsCloudflareWait: false // هذا يستخدم Cloudflare


    },
    
    "linkjust": {
        baseUrl: "https://linkjust.com/",
        referer: "https://yjiur.xyz/",
        needsCloudflareWait: false
    },
    "shr2link": {
        baseUrl: "https://shr2.link/",
        referer: "https://bigcarinsurance.com/",
        needsCloudflareWait: false
    },
    "nitro-link": {
        baseUrl: "https://nitro-link.com/",
        referer: "https://finestart.online/",
        needsCloudflareWait: false
    }
};

// دالة استخراج الرابط محسنة مع محاولة ثانية
async function extractDownloadLink(fullUrl, referer, needsCloudflareWait = false) {
    console.log('🚀 Starting bypass for:', fullUrl);
    
    const { browser, page } = await connect({
        headless: false,
        args: [],
        customConfig: {},
        turnstile: true,
        connectOption: {
            disableXvfb: false,
            ignoreAllFlags: false,
            proxy: {
                host: 'gate.nodemaven.com',
                port: 8080,
                username: 'mixaliskitas_gmail_com-country-us-region-alabama',
                password: '5pygsmquyy'
            },
            plugins: [pluginStealth()]
        }
    });

    try {
        // تفعيل اعتراض الطلبات بنفس الطريقة بالضبط
        await page.setRequestInterception(true);
        
        page.on('request', (request) => {
            // إضافة Referer لجميع الطلبات بنفس الطريقة بالضبط
            const headers = {
                ...request.headers(),
                'Referer': referer
            };
            request.continue({ headers });
        });

        console.log('🌐 Navigating to:', fullUrl);
        
        // نفس طريقة الـ navigation بالضبط
        await page.goto(fullUrl);

        // انتظار ذكي بناءً على نوع الموقع
        if (needsCloudflareWait) {
            console.log('⏳ Waiting for Cloudflare bypass (15 seconds)...');
            await new Promise(resolve => setTimeout(resolve, 15000));
        } else {
             console.log('⚡ No Cloudflare - proceeding immediately');
        }

        console.log('⏳ Waiting for page to load completely...');
        
        // انتظار إضافي للتأكد من تحميل الصفحة - مخفض للمواقع العادية
        await new Promise(resolve => setTimeout(resolve, 6000));

        // استخراج الرابط مباشرة - نفس المنطق تماماً
        console.log('🔍 Extracting download link...');
        const downloadUrl = await page.evaluate(() => {
            const elements = document.querySelectorAll('button, a, div, span');
            
            for (let element of elements) {
                const text = element.textContent?.trim().toLowerCase();
                
                if (text && (text.includes('get link') || 
                             text.includes('getlink') || 
                             text.includes('download') ||
                             text.includes('getting link') ||
                             text.includes('Get Link') ||
                             text.includes('تحميل'))) {
                    
                    // إذا كان رابط مباشر
                    if (element.href && element.href.includes('http')) {
                        return element.href;
                    }
                    // إذا كان لديه onclick
                    if (element.getAttribute('onclick')) {
                        const onclick = element.getAttribute('onclick');
                        const urlMatch = onclick.match(/window\.open\('([^']+)'\)/) || 
                                       onclick.match(/location\.href='([^']+)'/);
                        if (urlMatch) return urlMatch[1];
                    }
                    // إذا كان لديه data-url
                    if (element.getAttribute('data-url')) {
                        return element.getAttribute('data-url');
                    }
                }
            }
            return null;
        });

        if (downloadUrl) {
            console.log('✅ Download URL found:', downloadUrl);
            return downloadUrl;
        } else {
            console.log('❌ Download URL not found - trying second attempt...');
            
            // 🔄 المحاولة الثانية مع انتظار 6 ثواني إضافية
            console.log('⏳ Second attempt - waiting 6 seconds...');
            await new Promise(resolve => setTimeout(resolve, 6000));
            
            // استخراج الرابط مرة أخرى بعد الانتظار
            console.log('🔍 Second attempt - extracting download link...');
            const secondAttemptUrl = await page.evaluate(() => {
                const elements = document.querySelectorAll('button, a, div, span');
                
                for (let element of elements) {
                    const text = element.textContent?.trim().toLowerCase();
                    
                    if (text && (text.includes('get link') || 
                                 text.includes('getlink') || 
                                 text.includes('download') ||
                                 text.includes('getting link') ||
                                 text.includes('Get Link') ||
                                 text.includes('تحميل'))) {
                        
                        // إذا كان رابط مباشر
                        if (element.href && element.href.includes('http')) {
                            return element.href;
                        }
                        // إذا كان لديه onclick
                        if (element.getAttribute('onclick')) {
                            const onclick = element.getAttribute('onclick');
                            const urlMatch = onclick.match(/window\.open\('([^']+)'\)/) || 
                                           onclick.match(/location\.href='([^']+)'/);
                            if (urlMatch) return urlMatch[1];
                        }
                        // إذا كان لديه data-url
                        if (element.getAttribute('data-url')) {
                            return element.getAttribute('data-url');
                        }
                    }
                }
                return null;
            });

            if (secondAttemptUrl) {
                console.log('✅ Download URL found in second attempt:', secondAttemptUrl);
                return secondAttemptUrl;
            } else {
                console.log('❌ Download URL not found in second attempt');
                return null;
            }
        }

    } catch (error) {
        console.error(' Error:', error.message);
        return null;
    } finally {
        await browser.close();
    }
}

// API endpoint - نفس الـ project القديم
app.post('/api/bypass', async (req, res) => {
    const { site, urlPath } = req.body;

    console.log('📥 Received request - Site:', site, 'Path:', urlPath);

    if (!site || !urlPath) {
        return res.json({ 
            success: false, 
            error: 'Missing site or urlPath' 
        });
    }

    const siteInfo = sites[site];
    if (!siteInfo) {
        return res.json({ 
            success: false, 
            error: `Unsupported site: ${site}` 
        });
    }

    try {
        // بناء الرابط الكامل - نفس المنطق
        const cleanPath = urlPath.replace(/^https?:\/\/[^\/]+\//, '').replace(/^\//, '');
        const fullUrl = siteInfo.baseUrl + cleanPath;

        console.log('🔗 Full URL:', fullUrl);
        
        const downloadUrl = await extractDownloadLink(
            fullUrl, 
            siteInfo.referer, 
            siteInfo.needsCloudflareWait
        );
        
        if (downloadUrl) {
            res.json({
                success: true,
                originalUrl: fullUrl,
                downloadUrl: downloadUrl,
                site: site,
                message: '✅ تم العثور على الرابط المباشر'
            });
        } else {
            res.json({ 
                success: false, 
                error: 'Download link is currently unavailable, try again'
            });
        }
    } catch (error) {
        console.error('💥 Error in API:', error.message);
        res.json({ 
            success: false, 
            error: ` Error : ${error.message} , please try again`
        });
    }
});

// صفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🌐 Supported sites: ${Object.keys(sites).join(', ')}`);
    console.log(`⚡ Cloudflare sites: yorurl, linkvertise`);
    console.log(`🚀 Normal sites: all others (faster processing)`);
});