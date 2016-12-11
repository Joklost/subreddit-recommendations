/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        var tab = tabs[0];

        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        var url = tab.url;

        // tab.url is only available if the "activeTab" permission is declared.
        // If you want to see the URL of other tabs (e.g. after removing active:true
        // from |queryInfo|), then the "tabs" permission is required to see their
        // "url" properties.
        console.assert(typeof url == 'string', 'tab.url should be a string');

        callback(url);
    });
}

function registerFeedback(subreddit, feedback) {
    var address = "http://westmalle.grid.aau.dk/feedback.php?subreddit=" + subreddit + "&vote=" + feedback;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", address, false);
    xhr.send();
}

document.addEventListener('DOMContentLoaded', function() {
    getCurrentTabUrl(function(url) {
        var subreddit = String(url.match(/\/r\/([a-zA-Z0-9_]+)/g)).substring(3);
        if(subreddit == "l" || subreddit == "all") {
            $("#suggestions").text("No suggestions");
        } else {
            var leaddress = "http://chimay.grid.aau.dk:5000/predict/?TOKEN=FOOBAR1&subreddit=" + subreddit;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", leaddress, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    var resp = JSON.parse(xhr.responseText);
                    var show =
                        "<a href=\"" + String(resp[0].link) + "\" target=\"_blank\">" + String(resp[0].display_name) + "</a><br />" +
                        "<a href=\"" + String(resp[1].link) + "\" target=\"_blank\">" + String(resp[1].display_name) + "</a><br />" +
                        "<a href=\"" + String(resp[2].link) + "\" target=\"_blank\">" + String(resp[2].display_name) + "</a><br />" +
                        "<a href=\"" + String(resp[3].link) + "\" target=\"_blank\">" + String(resp[3].display_name) + "</a><br />" +
                        "<a href=\"" + String(resp[4].link) + "\" target=\"_blank\">" + String(resp[4].display_name) + "</a><br />" +
                        "<p id=\"suggestion-text\">If you find two or more suggestions that you like, please click the up-arrow.<br>Otherwise, click the down-arrow.</p>"

                    $("#up_img").click(function() {
                        registerFeedback(subreddit, 1);
                        $("#feedback").show();
                        $("#suggestion-text").hide();
                        $(this).hide();
                        $("#down_img").hide();
                    });
                    $("#down_img").click(function() {
                        registerFeedback(subreddit, 0);
                        $("#feedback").show();
                        $("#suggestion-text").hide();
                        $(this).hide();
                        $("#up_img").hide();
                    });
                    $("#suggestions").html(show);
                    $("#up_img").show();
                    $("#down_img").show();
                }
            }
            xhr.send();
        }
    });
});
