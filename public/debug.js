(function () {
    window.__errs = [];
    window.addEventListener('error', e => {
        window.__errs.push({
            type: 'error',
            msg: e.message,
            src: e.filename,
            line: e.lineno
        });
    });
    window.addEventListener('unhandledrejection', e => {
        window.__errs.push({
            type: 'promise',
            msg: String(e.reason)
        });
    });
    setInterval(() => {
        if (window.__errs.length && !document.getElementById('errBadge')) {
            const b = document.createElement('div');
            b.id = 'errBadge';
            b.style = 'position:fixed;right:10px;bottom:10px;background:#111;color:#fff;padding:8px 10px;border-radius:8px;font:12px system-ui;z-index:99999';
            b.textContent = `Errors: ${window.__errs.length}`;
            b.onclick = () => alert(JSON.stringify(window.__errs, null, 2));
            document.body.appendChild(b);
        }
    }, 1000);
})();
