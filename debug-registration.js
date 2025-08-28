// Debug Registration Errors
// Open browser DevTools (F12) and paste this in the Console tab
// Run this BEFORE attempting registration

console.log('🔍 Registration Debug Helper Loaded');

// Override console.error to catch all errors
const originalError = console.error;
console.error = function(...args) {
    console.log('🚨 ERROR CAUGHT:', ...args);
    originalError.apply(console, args);
};

// Override console.log to highlight registration logs
const originalLog = console.log;
console.log = function(...args) {
    if (args.some(arg => typeof arg === 'string' && (
        arg.includes('Registration') || 
        arg.includes('Firebase') || 
        arg.includes('Auth')
    ))) {
        console.group('🔥 Firebase/Auth Log');
        originalLog.apply(console, args);
        console.groupEnd();
    } else {
        originalLog.apply(console, args);
    }
};

// Monitor network requests
if (window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        console.log('📡 Network Request:', args[0]);
        return originalFetch.apply(this, args).then(response => {
            console.log('📡 Network Response:', response.status, response.url);
            if (!response.ok) {
                console.error('❌ Network Error:', response.status, response.statusText);
            }
            return response;
        }).catch(error => {
            console.error('❌ Network Failure:', error);
            throw error;
        });
    };
}

// Check Firebase configuration
setTimeout(() => {
    console.group('🔥 Firebase Configuration Check');
    
    if (window.firebase) {
        console.log('✅ Firebase SDK loaded');
        try {
            const app = window.firebase.apps[0];
            if (app) {
                console.log('✅ Firebase app initialized');
                console.log('   Project ID:', app.options.projectId);
                console.log('   Auth Domain:', app.options.authDomain);
            } else {
                console.log('❌ Firebase app not initialized');
            }
        } catch (e) {
            console.error('❌ Firebase app check failed:', e);
        }
    } else {
        console.log('❌ Firebase SDK not detected on window object');
        console.log('   This is normal for Vite builds - check Network tab instead');
    }
    
    // Check environment variables (these won't be visible in browser for security)
    console.log('ℹ️ Environment variables are loaded at build time');
    console.log('   Check Network tab for Firebase API calls to verify config');
    
    console.groupEnd();
}, 1000);

console.log('✅ Debug helper ready! Now try to register and watch the console.');
console.log('📝 Steps:');
console.log('   1. Fill out registration form');
console.log('   2. Click "Create Account"');
console.log('   3. Watch this console for detailed error info');
console.log('   4. Also check Network tab for failed requests');