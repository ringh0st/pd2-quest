# PD1 (Salesforce Certified Platform Developer) lesson outline

Exam guide: https://help.salesforce.com/s/articleView?id=005298965&type=1&language=en_US (read 2026-11-16).
60 scored questions + up to 5 unscored, 105 min, 68% to pass, aligned to the **Summer '25** release.

Objective codes below: `fund-1..4`, `auto-1..9`, `ui-1..4`, `test-1..4`, numbered in the order of `src/data/pd1/exam.json`.

Key-fact markers: **[read]** = I read this on the cited page on 2026-11-16 (docs are at Winter '27, API 68.0). **[check]** = standard fact, not re-read this session; open the URL before writing a question on it.

> **Version trap for question writers.** The exam is Summer '25 (API 64.0). The current Apex docs say that from **API 67.0** Apex runs database operations in **user mode by default** and an undeclared class runs **with sharing**. At **API 66.0 and earlier**, **system mode** is the default and an undeclared class runs **without sharing**, unless it's an Aura controller or an `@AuraEnabled` method called from LWC (those run with sharing), or it inherits a mode from its caller or parent class. Avoid questions that depend on the default, or state the API version in the stem. [read] apex_classes_enforce_usermode.htm, apex_classes_keywords_sharing.htm (Versioned Behavior Changes)

---

## Developer Fundamentals (27%): 9 lessons

| # | Lesson | Objectives |
|---|---|---|
| fund-1 | Multitenancy: why limits exist | fund-1, fund-2 |
| fund-2 | MVC on Salesforce | fund-1 |
| fund-3 | Lightning Component Framework: LWC and Aura | fund-1 |
| fund-4 | Clicks or code? Choosing the tool | fund-2 |
| fund-5 | Formula fields | fund-2 |
| fund-6 | Roll-up summary fields | fund-2, fund-3 |
| fund-7 | Objects, fields and relationships | fund-3 |
| fund-8 | External IDs and accessing related data | fund-3 |
| fund-9 | Agentforce for Developers: use cases and limits | fund-4 |

**Key facts**
- fund-1: The Apex runtime enforces limits because Apex runs in a multitenant environment. An exceeded limit throws a runtime exception **that can't be handled**. [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_gov_limits.htm
- fund-1: Per-transaction limits, sync / async: SOQL queries **100 / 200**; rows retrieved by SOQL **50,000**; `Database.getQueryLocator` rows **10,000**; SOSL queries **20**; rows per SOSL query **2,000**; DML statements **150**; rows processed by DML **10,000**; trigger recursion stack depth **16**; callouts **100**; total callout timeout **120 s**; `@future` calls **50** (0 in batch and future contexts, 50 in Queueable); `System.enqueueJob` **50 / 1**; `sendEmail` calls **10**; heap **10 MB / 25 MB** (the current Winter '27 page; older docs and most study material say 6 MB / 12 MB, so don't test the heap number, or check which value applied in Summer '25); CPU **10,000 ms / 60,000 ms**; max transaction time **10 min**. Scheduled Apex uses **synchronous** limits. For Batch Apex, the limits reset for each `execute` chunk. [read] same URL
- fund-1: Max characters per class and per trigger: **1 million**. [read] same URL
- fund-2: MVC mapping (Model = objects/fields; View = Visualforce pages, LWC/Aura markup; Controller = Apex controllers, JS controllers). [check] Visualforce Developer Guide https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/
- fund-5: Formula fields: up to **3,900 characters**; **1,300** displayed characters after evaluation; save size and compile size each at most **15,000 bytes**. [read] https://help.salesforce.com/s/articleView?id=platform.formula_field_limits.htm&type=5
- fund-6: A roll-up summary needs a **master-detail** relationship (not a lookup). It can COUNT, SUM, MIN or MAX detail fields. It's allowed on any custom master object, on a standard master object of a custom detail, on Opportunity from opportunity products, on Account from opportunities, and on Campaign from campaign members. [read] https://help.salesforce.com/s/articleView?id=platform.fields_about_roll_up_summary_fields.htm&type=5
- fund-6: Roll-up recalculation is step 16 of the order of execution; the parent then goes through its own save (see auto-7). [read] order-of-execution URL below
- fund-7: Each custom object can have **up to 2 master-detail** relationships and **40 relationships in total**. Deleting the master deletes its detail records. The detail's Owner is the master's owner, so a custom detail object can't have sharing rules, manual sharing or queues. The master-detail field is required on the detail layout. Reparenting is off by default ("Allow reparenting" option). Best practice: at most **10,000** child records per master. [read] https://help.salesforce.com/s/articleView?id=platform.overview_of_custom_object_relationships.htm&type=5
- fund-8: `upsert` matches on Id, a custom **External ID** field, or a standard field with `idLookup`. No match: insert. One match: update. Several matches: error, nothing saved. [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/langCon_apex_dml_examples_upsert.htm
- fund-9: Official topic: "use cases and limitations of Agentforce for Developers". The current overview page calls the tool **Agentforce Vibes** (a VS Code extension in the Salesforce Extension Pack, plus a cloud IDE). Teach: AI output must be reviewed and tested by the developer. [read] https://developer.salesforce.com/docs/platform/einstein-for-devs/guide/einstein-overview.html; module https://trailhead.salesforce.com/content/learn/modules/einstein-for-developers (not read; JS-rendered)

---

## Process Automation and Logic (28%): 11 lessons

| # | Lesson | Objectives |
|---|---|---|
| auto-1 | Declarative automation: Flow and approvals | auto-1 |
| auto-2 | Variables, constants and data types | auto-2 |
| auto-3 | Methods, access modifiers and interfaces | auto-2 |
| auto-4 | Control flow: if, loops, switch | auto-3 |
| auto-5 | SOQL and SOSL in Apex | auto-4 |
| auto-6 | DML statements and Database methods | auto-4, auto-6 |
| auto-7 | Save order of execution | auto-7 |
| auto-8 | Trigger basics and context variables | auto-5 |
| auto-9 | Bulkified, limit-safe triggers | auto-5, auto-6, auto-7 |
| auto-10 | Exceptions and custom exceptions | auto-8 |
| auto-11 | Apex plus Flow: invocable methods | auto-9, auto-1 |

**Key facts**
- auto-1: Workflow rules and Process Builder are legacy; the order of execution still lists them. Record-triggered flows can run **before save** or **after save** (see auto-7). [read] order-of-execution URL. Trailhead: https://trailhead.salesforce.com/content/learn/modules/record-triggered-flows
- auto-2: `static` and `final`, and constants as `static final`. [check] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_static.htm
- auto-3: Access modifiers: **private** is the default and means within the class only; **protected** means inner classes and subclasses, for instance members only; **public** means within the namespace/package (not like Java); **global** means anywhere, needed for SOAP API and outside the package. Interface methods take the interface's access (public or global). From API 65.0, an `abstract`/`override` method needs an explicit protected, public or global. [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_access_modifiers.htm
- auto-3: Interfaces: a class `implements` them and must define every method. [check] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_interfaces.htm (page did not render this session)
- auto-4: Syntax: `switch on expr { when v1 {...} when else {...} }`. [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/langCon_apex_switch.htm
- auto-5: Assigning a query that returns no rows (or more than one) to a single sObject throws **QueryException**; assigning it to a List gives an empty list. [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_exception_builtin.htm
- auto-5: SOSL: the `FIND` clause is required. Text search is case-insensitive and supports wildcards and AND/OR/AND NOT. A SOSL query returns at most **2,000** rows; a transaction can run **20** SOSL queries. [read] https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_sosl_find.htm and the governor limits page. SOSL in Apex returns `List<List<SObject>>`. [check] same reference
- auto-5: `WITH USER_MODE` / `WITH SYSTEM_MODE` on SOQL and SOSL; `insert as user` / `as system` on DML; `AccessLevel.USER_MODE` on Database methods. [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_enforce_usermode.htm
- auto-6: DML statements throw exceptions; `Database` methods can take `allOrNone=false` (partial success, returns SaveResult). [read in part] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/langCon_apex_dml_database.htm
- auto-7: Order of execution (server side), verbatim steps: 1 load the original record; 2 load the new values; 3 system validation; 4 **before-save record-triggered flows**; 5 **before triggers**; 6 system validation again plus **custom validation rules**; 7 **duplicate rules** (block stops everything); 8 save, not committed; 9 **after triggers**; 10 assignment rules; 11 auto-response rules; 12 workflow rules (on a field update: save again, system validation only, **before and after update triggers one more time, and only once**); 13 escalation rules; 14 Process Builder and workflow-launched flows (no guaranteed order); 15 **after-save record-triggered flows**; 16 entitlement rules; 17 roll-up summary on the parent (the parent goes through its own save), then the grandparent; 18 criteria-based sharing; 19 **commit**; 20 post-commit logic (email, enqueued async jobs, async flow paths). A recursive save skips steps 9 (assignment rules) to 17. Firing order between two triggers on the same object and event **isn't guaranteed**. After a workflow field update, `Trigger.old` still holds the values from before the original update. [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_order_of_execution.htm (count the steps on the page before using numbers; the page numbers them)
- auto-8: Context variables: `Trigger.new` is available in insert, update and undelete triggers and can be **modified only in before** triggers. `newMap` is available in before update, after insert, after update and after undelete. `old` and `oldMap` are available in update and delete triggers. `operationType` is a `System.TriggerOperation` enum. A DML of more than **200** records runs the trigger in chunks of 200, and `Trigger.size` counts the current chunk only. [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_context_variables.htm
- auto-8: Triggers can't declare a sharing keyword and run without sharing. In API 67.0+ their DML and queries run in user mode unless system mode is set (see the version trap above). [read] sharing keywords page
- auto-9: Bulk pattern: collect values from `Trigger.new` into a Set, run **one** query outside the loop, and do one DML on a list. [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_bestpract.htm
- auto-9: With partial-success DML, triggers fire again on retry in the same transaction, and static variables aren't reset. [read] order-of-execution page
- auto-10: Built-in exceptions: DmlException, ListException, NullPointerException, QueryException (and others). Custom exceptions `extends Exception` and the class name **must end in "Exception"**. Governor-limit exceptions can't be caught. [read] apex_exception_builtin.htm, https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_exception_custom.htm
- auto-11: `@InvocableMethod` exposes a method to Flow, REST, Apex and **Agentforce agents**. In the doc's samples, input and output are Lists. A flow that calls Apex needs the running user to have access to the Apex class. [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_annotation_InvocableMethod.htm (one invocable method per class, static, public or global: [check] same page)
- auto-11: Launching a flow from Apex uses `Flow.Interview`. [check] Help "Launch a Flow from Apex" (linked from the UI cert-prep unit) and https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_class_Flow_Interview.htm (didn't render)

---

## User Interface (25%): 9 lessons

| # | Lesson | Objectives |
|---|---|---|
| ui-1 | XSS and safe output | ui-1 |
| ui-2 | SOQL injection | ui-1 |
| ui-3 | Data access security: sharing, CRUD and FLS | ui-1 |
| ui-4 | Visualforce: standard and custom controllers, extensions | ui-2, ui-4 |
| ui-5 | LWC fundamentals: why LWC, files, decorators | ui-3 |
| ui-6 | LWC events: parent to child and child to parent | ui-3 |
| ui-7 | Calling Apex from LWC: @wire or imperative | ui-4 |
| ui-8 | Components in Flow and on pages (targets) | ui-2, ui-4 |
| ui-9 | Apex for Agentforce actions | ui-4 |

**Key facts**
- ui-1: Standard `<apex:...>` components escape XSS-dangerous characters by default; `escape="false"` turns this off and is vulnerable. Merge fields inside `<script>` or on* handlers are not protected. [read] https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_security_tips_xss.htm
- ui-2: Dynamic SOQL that concatenates user input into `Database.query` is injectable. The fixes are bind variables, `String.escapeSingleQuotes`, or allowlisting. [read in part] https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_security_tips_soql_injection.htm (confirm the exact fix list on the page)
- ui-3: `with sharing`, `without sharing` and `inherited sharing`. An inherited sharing class runs **with sharing** as an Aura controller, an `@AuraEnabled` method called from LWC, a Visualforce controller, an Apex REST service or async Apex. A method's sharing mode comes from where it's **defined**, not where it's called (except inherited sharing). [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_keywords_sharing.htm
- ui-3: `Security.stripInaccessible` and user mode for FLS/CRUD. [read in part] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_with_security_stripInaccessible.htm
- ui-4: A controller extension is a class whose constructor takes a single `ApexPages.StandardController` (or custom controller) argument. Used as `<apex:page standardController="Account" extensions="X">`. [read] https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_controller_extension.htm
- ui-5: `@api` makes a public property or method, used to pass data **down** from a parent. Since Spring '20 every field is reactive; `@track` is still needed only to watch inside objects and arrays. `@wire` reads data reactively. [read] https://developer.salesforce.com/docs/platform/lwc/guide/reference-decorators.html
- ui-6: Child to parent: `this.dispatchEvent(new CustomEvent('name'))`. Event names have no uppercase, no spaces, and no `on` prefix (the handler is `on<name>`). [read] https://developer.salesforce.com/docs/platform/lwc/guide/events-create-dispatch.html
- ui-7: `@wire` needs the Apex method to be **static**, **public or global**, and `@AuraEnabled(cacheable=true)`. Results arrive in `data` and `error`. Use `refreshApex()` for stale wired data. Call imperatively (it returns a Promise) for anything that does DML, i.e. any method that isn't cacheable. `cacheable=true` is only allowed on methods that don't modify data. Since API 55.0, `@AuraEnabled` methods can't be overloaded. [read] https://developer.salesforce.com/docs/platform/lwc/guide/apex-wire-method.html, https://developer.salesforce.com/docs/platform/lwc/guide/apex-call-imperative.html, https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_annotation_AuraEnabled.htm
- ui-8: To use an LWC in a flow screen, add the `lightning__FlowScreen` target and `targetConfig` properties; `role="inputOnly"` / `"outputOnly"` (default is both). [read] https://developer.salesforce.com/docs/platform/lwc/guide/use-config-for-flow-screens.html
- ui-9: Agentforce custom actions can be built from Apex (`@InvocableMethod`), flows or prompt templates. [read] https://developer.salesforce.com/docs/ai/agentforce/guide/agent-invocablemethod.html. Trailhead: https://trailhead.salesforce.com/content/learn/modules/agent-customization-with-apex

---

## Testing, Debugging, and Deployment (20%): 9 lessons

| # | Lesson | Objectives |
|---|---|---|
| test-1 | Test classes and the 75% rule | test-1, test-4 |
| test-2 | Test data: isolation, factories, @TestSetup, loadData | test-1 |
| test-3 | startTest/stopTest, limits and async in tests | test-1, test-3 |
| test-4 | Testing triggers, controllers and flows | test-1 |
| test-5 | Debug logs and log levels | test-3 |
| test-6 | Developer Console | test-2, test-3 |
| test-7 | Salesforce DX and the Salesforce CLI; scratch orgs | test-2, test-4 |
| test-8 | Environments: sandbox types | test-4 |
| test-9 | Deploying: change sets, metadata, tests on deploy; monitoring async jobs | test-4, test-3 |

**Key facts**
- test-1: Deploying to production or packaging for AppExchange needs **at least 75%** of Apex covered, all tests passing, **every trigger with some coverage**, and everything compiling. Test classes and `System.debug` lines don't count. Coverage = covered lines / (covered + uncovered). In a production deployment, all tests in the org namespace run by default. [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_best_practices.htm, https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_code_coverage_intro.htm
- test-2: Test data is never committed. From API 24.0, tests can't see org data (except setup and metadata objects) unless they use `@IsTest(SeeAllData=true)`, which isn't best practice. Records changed under `SeeAllData` are still rolled back. [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_data.htm, https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_seealldata_using.htm
- test-2: `@TestSetup static void m()` runs once before the test methods; each test method sees the original records, because changes roll back per method and statics reset. [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_testsetup_using.htm
- test-2: `Test.loadData(Account.sObjectType, 'staticResourceName')` loads a CSV **static resource** (first line = field names) and returns the inserted sObjects. [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_load_data.htm
- test-3: `Test.startTest()`/`stopTest()` each **once per test method**. Code between them gets a fresh set of limits, and async calls made after startTest run **synchronously at stopTest**. [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_tools_start_stop_test.htm
- test-5: Each debug log is at most **20 MB** (older lines are trimmed). System debug logs are kept **24 hours** and monitoring logs **7 days**. More than **1,000 MB** of logs in 15 minutes disables trace flags. `FINEST` on Apex Code logs every variable assignment. Class and trigger trace flags override levels but don't create logs on their own. [read] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_debugging_debug_log.htm
- test-6: Developer Console: run tests, view coverage on the Tests tab, Query Editor (with the Tooling API option), logs, checkpoints. [read in part] coverage page; Trailhead https://trailhead.salesforce.com/content/learn/modules/developer_console
- test-7: Scratch orgs: duration **1-30 days, default 7**; an expired scratch org can't be restored. [read] https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs.htm
- test-8: Sandbox refresh intervals and storage: Developer **1 day**, 200 MB data and 200 MB files, metadata only. Developer Pro **1 day**, 1 GB data and 1 GB files, metadata only. Partial Copy **5 days**, 5 GB data, files same as production, metadata plus sample data, **sandbox template required**. Full **29 days**, same storage as production, all data, template optional. [read] https://help.salesforce.com/s/articleView?id=platform.data_sandbox_environments.htm&type=5
- test-9: Change sets, Metadata API and CLI deployments; tests don't run in parallel in metadata deployments, package installs or change-set deployments. [read] testing best practices page. Org development model: https://trailhead.salesforce.com/content/learn/modules/org-development-model
- test-9: Monitoring async and batch jobs (Apex Jobs page, `AsyncApexJob`) and flows (paused/failed flow interviews, flow error emails). [check] Help docs for Apex Jobs and Flow troubleshooting; not read this session

---

## Lesson count
Developer Fundamentals 9 · Process Automation and Logic 11 · User Interface 9 · Testing, Debugging, and Deployment 9 · **total 38**.

Objective coverage check: fund-1 (L1-3), fund-2 (L1, 4-6), fund-3 (L6-8), fund-4 (L9); auto-1 (L1, 11), auto-2 (L2-3), auto-3 (L4), auto-4 (L5-6), auto-5 (L8-9), auto-6 (L6, 9), auto-7 (L7, 9), auto-8 (L10), auto-9 (L11); ui-1 (L1-3), ui-2 (L4, 8), ui-3 (L5-6), ui-4 (L4, 7-9); test-1 (L1-4), test-2 (L6-7), test-3 (L3, 5-6, 9), test-4 (L1, 7-9). Every objective is covered.
