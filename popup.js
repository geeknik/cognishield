document.addEventListener('DOMContentLoaded', function() {
    const resultDiv = document.getElementById('result');
    const detailsDiv = document.getElementById('details');
    const sensitivitySlider = document.getElementById('sensitivity');
    const sensitivityValue = document.getElementById('sensitivityValue');

    function updatePopup(result) {
        resultDiv.textContent = result.isHoneypot 
            ? `Warning: Potential Cognitive Honeypot Detected (Score: ${result.score})`
            : `No Cognitive Honeypot Detected (Score: ${result.score})`;

        resultDiv.style.color = result.isHoneypot ? 'red' : 'green';

        detailsDiv.innerHTML = '<h2>Detection Details:</h2>';
        for (const [key, value] of Object.entries(result.details)) {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            scoreItem.innerHTML = `<span>${key}:</span> <span>${value.toFixed(2)}</span>`;
            detailsDiv.appendChild(scoreItem);
        }
    }

    function getTabAndSendMessage() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {action: "getResults"}, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                        resultDiv.textContent = "Error communicating with the page. Please refresh and try again.";
                    } else if (response && response.score) {
                        updatePopup(response);
                    } else {
                        resultDiv.textContent = "No honeypot detection results available for this page.";
                    }
                });
            } else {
                resultDiv.textContent = "No active tab found.";
            }
        });
    }

    getTabAndSendMessage();

    sensitivitySlider.addEventListener('input', function() {
        sensitivityValue.textContent = this.value;
    });

    sensitivitySlider.addEventListener('change', function() {
        chrome.storage.sync.set({sensitivity: this.value}, function() {
            console.log('Sensitivity setting saved');
            getTabAndSendMessage(); // Refresh results after sensitivity change
        });
    });

    chrome.storage.sync.get('sensitivity', function(data) {
        if (data.sensitivity) {
            sensitivitySlider.value = data.sensitivity;
            sensitivityValue.textContent = data.sensitivity;
        }
    });
});
