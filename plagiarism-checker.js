// Get all the elements we need
var textInput1 = document.getElementById('text-input-1');
var textInput2 = document.getElementById('text-input-2');
var highlight1 = document.getElementById('highlight-1');
var highlight2 = document.getElementById('highlight-2');

// Update highlights when typing
textInput1.addEventListener('input', updateHighlights);
textInput2.addEventListener('input', updateHighlights);

function updateHighlights() {
    // Get the words from both texts
    var words1 = getWords(textInput1.value.toLowerCase());
    var words2 = getWords(textInput2.value.toLowerCase());
    
    // Show the highlights
    highlight1.innerHTML = makeHighlights(textInput1.value, words1, words2);
    highlight2.innerHTML = makeHighlights(textInput2.value, words2, words1);
}

function makeHighlights(text, words1, words2) {
    // Find matching words
    var matchingWords = words1.filter(word => words2.includes(word));
    var highlightedText = '';
    var lastIndex = 0;

    // Go through the text and highlight matching words
    for (var i = 0; i < text.length; i++) {
        var word = text.slice(i).match(/\w+/);
        if (word) {
            var currentWord = word[0].toLowerCase();
            if (matchingWords.includes(currentWord)) {
                highlightedText += escapeHtml(text.slice(lastIndex, i));
                highlightedText += '<span class="yellow-highlight">' + escapeHtml(word[0]) + '</span>';
                lastIndex = i + word[0].length;
                i = lastIndex - 1;
            }
        }
    }
    highlightedText += escapeHtml(text.slice(lastIndex));
    return highlightedText;
}

// Helper function to escape HTML special characters
function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function checkForPlagiarism() {
    var text1 = textInput1.value.toLowerCase();
    var text2 = textInput2.value.toLowerCase();
    var results = document.getElementById('results');

    var words1 = getWords(text1);
    var words2 = getWords(text2);

    // Calculate different types of similarity
    var jaccardSimilarity = calculateJaccardSimilarity(words1, words2);
    var longestCommonPart = findLongestCommonPart(text1, text2);
    var cosineSimilarity = calculateCosineSimilarity(words1, words2);
    var copyPercentage = calculateCopyPercentage(words1, words2);

    // Decide how similar the texts are
    var plagiarismLevel;
    if (jaccardSimilarity > 0.8 || longestCommonPart.length / Math.max(text1.length, text2.length) > 0.7 || cosineSimilarity > 0.9) {
        plagiarismLevel = "High";
    } else if (jaccardSimilarity > 0.6 || longestCommonPart.length / Math.max(text1.length, text2.length) > 0.5 || cosineSimilarity > 0.7) {
        plagiarismLevel = "Medium";
    } else if (jaccardSimilarity > 0.4 || longestCommonPart.length / Math.max(text1.length, text2.length) > 0.3 || cosineSimilarity > 0.5) {
        plagiarismLevel = "Low";
    } else {
        plagiarismLevel = "Very Low";
    }

    // Show the results
    results.innerHTML = `
        <h3>Plagiarism Level: ${plagiarismLevel}</h3>
        <p>Copied Text: ${copyPercentage.toFixed(2)}%</p>
        <div class="result-bar"><div class="result-progress" style="width: ${copyPercentage}%;"></div></div>
        <p>Word Similarity: ${(jaccardSimilarity * 100).toFixed(2)}%</p>
        <div class="result-bar"><div class="result-progress" style="width: ${jaccardSimilarity * 100}%;"></div></div>
        <p>Longest Similar Part: ${(longestCommonPart.length / Math.max(text1.length, text2.length) * 100).toFixed(2)}%</p>
        <div class="result-bar"><div class="result-progress" style="width: ${(longestCommonPart.length / Math.max(text1.length, text2.length) * 100)}%;"></div></div>
        <p>Overall Similarity: ${(cosineSimilarity * 100).toFixed(2)}%</p>
        <div class="result-bar"><div class="result-progress" style="width: ${cosineSimilarity * 100}%;"></div></div>
    `;
}

// Helper function to get words from text
function getWords(text) {
    return text.match(/\b\w+\b/g) || [];
}

// Calculate how similar the word sets are
function calculateJaccardSimilarity(words1, words2) {
    var set1 = new Set(words1);
    var set2 = new Set(words2);
    var intersectionSize = new Set([...set1].filter(x => set2.has(x))).size;
    var unionSize = new Set([...set1, ...set2]).size;
    return intersectionSize / unionSize;
}

// Find the longest part that's the same in both texts
function findLongestCommonPart(text1, text2) {
    var m = text1.length;
    var n = text2.length;
    var dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    var maxLength = 0;
    var endIndex = 0;

    for (var i = 1; i <= m; i++) {
        for (var j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                if (dp[i][j] > maxLength) {
                    maxLength = dp[i][j];
                    endIndex = i - 1;
                }
            }
        }
    }

    return text1.slice(endIndex - maxLength + 1, endIndex + 1);
}

// Calculate overall similarity
function calculateCosineSimilarity(words1, words2) {
    var freqMap1 = getWordFrequency(words1);
    var freqMap2 = getWordFrequency(words2);
    var allWords = new Set([...Object.keys(freqMap1), ...Object.keys(freqMap2)]);

    var dotProduct = 0;
    var magnitude1 = 0;
    var magnitude2 = 0;

    for (var word of allWords) {
        var freq1 = freqMap1[word] || 0;
        var freq2 = freqMap2[word] || 0;
        dotProduct += freq1 * freq2;
        magnitude1 += freq1 * freq1;
        magnitude2 += freq2 * freq2;
    }

    return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

// Helper function to count words
function getWordFrequency(words) {
    var freqMap = {};
    for (var word of words) {
        freqMap[word] = (freqMap[word] || 0) + 1;
    }
    return freqMap;
}

// Calculate how much text is copied
function calculateCopyPercentage(words1, words2) {
    var set1 = new Set(words1);
    var set2 = new Set(words2);
    var commonWords = new Set([...set1].filter(x => set2.has(x)));
    var totalWords = Math.max(words1.length, words2.length);
    return (commonWords.size / totalWords) * 100;
}