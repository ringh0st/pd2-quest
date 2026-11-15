# Code-marking pass: every piece of code shown in the code font

The app renders text wrapped in single backticks (`like this`) in a code font with syntax colors. Today many code fragments in the content are plain text: class declarations, annotations, method signatures, SOQL, LWC markup, keywords. The owner wants all code to look like code.

## The job (one section file per agent)

In EVERY text field of your file (question stems `q`, `options`, `explain`, `wrong[]`, lesson `cards[].body`, `cards[].items[]`, `cards[].title`, flashcard `front` and `back`), wrap code in single backticks. Code means:
- Apex or Java-like code: declarations (`public with sharing class RecordUtil`), signatures (`global static String create(String name, Integer qty)`), statements (`insert as user newAcc;`), expressions (`Trigger.new`, `recordId.getSObjectType()`), annotations with or without arguments (`@AuraEnabled(cacheable=true)`, `@IsTest(SeeAllData=false)`, `@future(callout=true)`).
- Apex keywords used as code, not as English: `with sharing`, `without sharing`, `inherited sharing`, `global`, `static`, `webservice`, `transient`, `virtual`, `abstract`, `override`, `final`. Example: "Class is **global**; methods are **global static**" becomes "Class is `global`; methods are `global static`". Leave ordinary English words alone ("a global setting", "static resources" as the Salesforce feature).
- SOQL and SOSL (`SELECT Id FROM Account WHERE …`, `WITH USER_MODE`, `FOR UPDATE`, `WITH SECURITY_ENFORCED`), API, field and object names (`Account.SObjectType`, `ObjectName__Share`, `UserOrGroupId`, `RowCause`, `Max_Discount__c`), enum values (`AccessLevel.USER_MODE`), exception class names (`QueryException`, `LimitException`).
- JS/LWC: decorators (`@api`, `@track`, `@wire(getRecord, …)`), lifecycle hooks (`connectedCallback`), markup (`<c-acct-editor record={acct}>`, `<template if:true={…}>`, `<apex:page>`), event names, JS expressions (`this.dispatchEvent(new CustomEvent('select'))`).
- Metadata/XML and CLI: `<isExposed>true</isExposed>`, `lightning__RecordPage`, `sf project deploy start --dry-run`, URL paths like `/services/apexrest/shipments/*`.
- An option that is entirely code becomes one backticked span: "`public inherited sharing class RecordUtil`". An option that mixes words and code backticks only the code parts.

## Rules

- ONLY add backticks (and remove `**…**` bold where it wrapped something that is now code: `**global static**` becomes `` `global static` ``; never nest bold and backticks). Do not change any word, punctuation, order, fact, id, `answer`, `code`, `lang` or anything else. A script that diffs your output against the original with backticks and the converted bold stripped must show zero other changes. Write that check and run it.
- Don't put backticks inside the `code` field (it is already a code block). Never split a word, and never backtick prose.
- Keep the JSON formatting (2-space indent; keep whether the file ends with a newline).
- Check with `cd /home/user/pd2-quest && npm run validate && npm test` (all must pass; the option-length tests ignore backticks). If a failure is in a file you don't own, re-run in a minute. Don't commit.
- Work in your own scratch subfolder: /tmp/claude-0/-home-user/5b8ecbda-753a-5014-8781-16f2f41efd69/scratchpad/codemark-<section>/.

## Report

How many fields you marked, a few before/after examples, and anything you weren't sure counted as code.
