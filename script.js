function checkURL() {
    const urlInput = document.getElementById('urlInput').value.trim();
    const resultCard = document.getElementById('resultCard');
    const riskScoreElement = document.getElementById('riskScore');
    const statusBadge = document.getElementById('statusBadge');
    const reasonsList = document.getElementById('reasonsList');
    const actionBox = document.getElementById('actionBox');

    if (!urlInput) {
        alert("Please enter a URL first!");
        return;
    }

    let score = 0;
    let reasons = [];

    let formattedURL = urlInput;
    if (!/^https?:\/\//i.test(formattedURL)) {
        formattedURL = 'http://' + formattedURL;
    }

    try {
        const urlObj = new URL(formattedURL);
        const hostname = urlObj.hostname;
        const protocol = urlObj.protocol;

        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (ipRegex.test(hostname)) {
            score += 35;
            reasons.push("Uses a raw IP address instead of a domain name.");
        }

        const suspiciousKeywords = ['login', 'bank', 'verify', 'update', 'account', 'secure', 'free', 'bonus', 'claim', 'prize'];
        let foundKeywords = suspiciousKeywords.filter(keyword => formattedURL.toLowerCase().includes(keyword));
        
        if (foundKeywords.length > 0) {
            score += 30;
            reasons.push(`Contains high-risk phishing keywords: (${foundKeywords.join(', ')})`);
        }

        const riskyTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.site'];
        if (riskyTLDs.some(tld => hostname.endsWith(tld))) {
            score += 25;
            reasons.push("Uses a free or high-risk domain extension (TLD).");
        }

        if (protocol === 'http:') {
            score += 20;
            reasons.push("Uses unencrypted HTTP instead of HTTPS.");
        }

        const domainParts = hostname.split('.');
        if (domainParts.length > 3) {
            score += 20;
            reasons.push("Contains excessive subdomains.");
        }

        if (formattedURL.length > 75) {
            score += 15;
            reasons.push("URL is unusually long.");
        }

    } catch (e) {
        score = 100;
        reasons.push("Invalid URL format.");
    }

    score = Math.min(score, 100);

    resultCard.classList.remove('hidden');
    riskScoreElement.innerText = `${score}/100`;
    reasonsList.innerHTML = '';

    if (reasons.length === 0) {
        reasonsList.innerHTML = '<li>No major risk indicators detected for this link.</li>';
    } else {
        reasons.forEach(reason => {
            let li = document.createElement('li');
            li.innerText = reason;
            reasonsList.appendChild(li);
        });
    }

    statusBadge.className = 'status-badge';
    
    if (score >= 80) {
        statusBadge.innerText = "HIGH RISK - LINK BLOCKED!";
        statusBadge.classList.add('status-danger');
        actionBox.innerHTML = `<div class="blocked-msg">🛑 Access to this link has been blocked because its risk score is in the high-risk range (80-100).</div>`;
    } else if (score >= 40) {
        statusBadge.innerText = "MEDIUM RISK - PROCEED WITH CAUTION";
        statusBadge.classList.add('status-warning');
        actionBox.innerHTML = `
            <p style="margin-bottom:12px; font-size:0.85rem; color:#666;">Exercise caution before navigating to this site.</p>
            <a href="${formattedURL}" target="_blank" rel="noopener noreferrer" class="btn-proceed btn-proceed-warning">Proceed Anyway</a>
        `;
    } else {
        statusBadge.innerText = "LOW RISK - SAFE";
        statusBadge.classList.add('status-safe');
        actionBox.innerHTML = `<a href="${formattedURL}" target="_blank" rel="noopener noreferrer" class="btn-proceed">Visit Link</a>`;
    }
}