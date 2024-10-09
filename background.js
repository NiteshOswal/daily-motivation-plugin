const blockedSites = [
    "*://*.facebook.com/*",
    "*://*.twitter.com/*",
    "*://*.youtube.com/*",
    "*://*.tiktok.com/*",
    "*://*.instagram.com/*",
    "*://*.snapchat.com/*",
    "*://*.pinterest.com/*",
    "*://*.reddit.com/*",
    "*://*.linkedin.com/*",
    "*://*.tumblr.com/*",
    "*://*.vk.com/*",
    "*://*.flickr.com/*",
    "*://*.weibo.com/*",
    "*://*.quora.com/*",
    "*://*.discord.com/*"
];

// Add rules for blocking
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
    console.log("Blocked:", details);
});

// Register the blocking rules
chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
            {
                id: "blockSocialMedia",
                priority: 1,
                action: {
                    type: "redirect",
                    redirect: {
                        regex: ".*",
                        url: chrome.runtime.getURL("focusblocked.html")
                    }
                },
                condition: {
                    urlFilter: blockedSites.join(","),
                    resourceTypes: ["main_frame"]
                }
            }
        ],
        removeRuleIds: ["blockSocialMedia"]
    });
});