// Sentiment Analysis Function (runs on trigger)
function analyzeSentiment() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sentiment Analysis");
  var filteredSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Filtered Posts") || SpreadsheetApp.getActiveSpreadsheet().insertSheet("Filtered Posts");
  if (!sheet) {
    Logger.log("Sheet 'Sentiment Analysis' not found. Creating it.");
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Sentiment Analysis");
    sheet.appendRow(["Post ID", "Post Text", "Sentiment", "Source", "Author", "URL", "Date"]);
  }
  var data = sheet.getDataRange().getValues();
  var apiKey = "Your_gemeni_key"; // Replace with your Gemini API key
  
  for (var i = 1; i < data.length; i++) {
    var postId = data[i][0];
    var postText = data[i][1];
    var sentiment = data[i][2];
    var source = data[i][3] || "Reddit";
    var author = data[i][4] || "Unknown";
    var url = data[i][5] || "N/A";
    var date = data[i][6] || new Date().toISOString().split('T')[0];
    
    if (postText && !sentiment) {
      // Check for subreddit rule violations
      if (postText.toLowerCase().includes("complaint") || postText.toLowerCase().includes("issue") || postText.toLowerCase().includes("promo")) {
        filteredSheet.appendRow([postId, postText, "Filtered: Rule Violation", source, author, url, date]);
        sheet.deleteRow(i + 1);
        i--; // Adjust index after deletion
        continue;
      }
      
      var urlApi = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + apiKey;
      var payload = JSON.stringify({
        "contents": [{
          "parts": [{"text": "Classify the sentiment of: " + postText + " as positive, negative, or neutral. For negative, assign a score from -1 to 0; for positive, 0 to 1; for neutral, 0. Assign emotional tones (anger, confusion, delight) if present. Return only: Sentiment: [type] (Score: [0-1 or -1-0]), Tones: [tones]."}]
        }]
      });
      
      var options = {
        "method": "post",
        "contentType": "application/json",
        "payload": payload
      };
      
      try {
        var response = UrlFetchApp.fetch(urlApi, options);
        var result = JSON.parse(response.getContentText());
        var text = result.candidates[0].content.parts[0].text;
        var score = parseFloat(text.match(/Score: (-?\d*\.?\d+)/)[1]) || 0;
        sheet.getRange(i + 1, 3).setValue(text);
        
        // Trend analysis
        var cache = CacheService.getScriptCache();
        var scores = cache.get("lastScores") ? JSON.parse(cache.get("lastScores")) : [];
        scores.push(score);
        if (scores.length > 5) scores.shift(); // Keep last 5
        cache.put("lastScores", JSON.stringify(scores));
        var avgScore = scores.reduce((a, b) => a + b, 0) / scores.length || 0;
        
        if (score <= -0.5 || (avgScore < -0.5 && scores.length === 5)) { // Changed to <= -0.5
          Logger.log("Alert triggered for post ID: " + postId + ", Score: " + score + ", Avg: " + avgScore);
          MailApp.sendEmail("example@gmail.com", "Sentiment Alert", "Post ID: " + postId + " - Sentiment: " + text + "\nTrend Avg: " + avgScore);
          // Uncomment and replace with Slack webhook URL if desired
          // var slackUrl = "YOUR_SLACK_WEBHOOK_URL";
          // UrlFetchApp.fetch(slackUrl, {method: "post", contentType: "application/json", payload: JSON.stringify({text: "Sentiment alert: " + text + ", Trend: " + avgScore})});
        }
        updateNotion(postId, postText, author, source, text, url, date);
      } catch (e) {
        sheet.getRange(i + 1, 3).setValue("Pending");
        Logger.log("Exception for post '" + postText + "': " + e.toString());
      }
    }
  }
}

// Web App Function
function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sentiment Analysis");
  var cache = PropertiesService.getScriptProperties();
  var cachedData = cache.getProperty("lastData");
  var data = sheet ? sheet.getDataRange().getValues() : cachedData ? JSON.parse(cachedData) : [["N/A", "No posts yet", "Pending", "Unknown", "Unknown", "N/A", new Date().toISOString().split('T')[0]]];
  if (!data.length || data[0].length < 7) {
    data = [["N/A", "No posts yet", "Pending", "Unknown", "Unknown", "N/A", new Date().toISOString().split('T')[0]]];
  }
  cache.setProperty("lastData", JSON.stringify(data));
  var htmlOutput = HtmlService.createTemplateFromFile('Index');
  htmlOutput.data = data.slice(1); // Skip header
  return htmlOutput.evaluate().setTitle("Sentiment Watchdog Dashboard");
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Function to refresh data (called by client)
function getUpdatedData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sentiment Analysis");
  var data = sheet ? sheet.getDataRange().getValues() : [["N/A", "No posts yet", "Pending", "Unknown", "Unknown", "N/A", new Date().toISOString().split('T')[0]]];
  return data.slice(1); // Skip header
}

function getFilteredData(sentiment) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sentiment Analysis");
  var data = sheet ? sheet.getDataRange().getValues().slice(1) : [];
  if (sentiment !== "all") {
    data = data.filter(row => row[2] && row[2].toLowerCase().includes(sentiment.toLowerCase()));
  }
  return data;
}

// Function to update Notion
function updateNotion(postId, postText, author, source, sentiment, url, date) {
  var notionToken = "Your_Internal _Notion_API"; // Replace with your Notion API token
  var databaseId = "Your_Database_ID"; // Your Database ID
  var urlApi = "https://api.notion.com/v1/pages";
  
  var payload = JSON.stringify({
    "parent": { "database_id": databaseId },
    "properties": {
      "Title": { "title": [{ "text": { "content": postId } }] },
      "Post Text": { "rich_text": [{ "text": { "content": postText } }] },
      "Author": { "rich_text": [{ "text": { "content": author } }] },
      "Source": { "rich_text": [{ "text": { "content": source } }] },
      "Sentiment": { "rich_text": [{ "text": { "content": sentiment } }] },
      "URL": { "rich_text": [{ "text": { "content": url } }] },
      "Date": { "date": { "start": date } }
    }
  });
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "headers": {
      "Authorization": "Bearer " + notionToken,
      "Notion-Version": "2022-06-28"
    },
    "payload": payload
  };
  
  try {
    UrlFetchApp.fetch(urlApi, options);
  } catch (e) {
    Logger.log("Notion update failed: " + e.toString());
  }
}
