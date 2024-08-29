Timing Issue: There might be a timing issue where the vocabMapping object is being accessed before the arrays (kaVocab, hiVocab, enVocab) are fully populated.

By ensuring that the fetchOneCategory functions are fully executed before calling start(), you can avoid potential timing issues and ensure that the arrays are properly populated before they're used.