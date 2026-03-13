Role: You are a Senior Software Architect and Laravel Expert specializing in Domain-Driven Design (DDD) and Legacy System Migration.
Objective: Analyze my current large-scale Laravel project, which is heavily reliant on "Fat Controllers" and "Fat Services," and design a "Safe-to-Execute" refactoring plan to transition into a 3-layered architecture:
Domain -> Capability -> Feature Group -> Screens/Actions.
Architectural Standard:

   1. Domain Layer: Core Business Entities (Models), Value Objects, and Domain Logic.
   2. Capability Layer: Cross-cutting concerns and shared business processes (e.g., NotificationEngine, PaymentGateway, StorageManager).
   3. Feature Group: Modular grouping of related features (e.g., OrderManagement, UserOnboarding).
   4. Screens/Actions: Decoupling Controller methods into Single Action Classes (SAC) for high granularity and testability.

Refactoring Strategy: (The Strangler Fig Pattern)
You must ensure the system remains functional during the transition. Do not suggest a "Big Bang" rewrite. Instead, provide a phased approach where legacy and new code coexist.
Required Documentation (To be generated in a /logs directory):
Please structure your output by creating/updating the following log files:

* logs/01_source_inventory.md: A comprehensive audit of every existing Controller/Service method, mapped to its complexity and its proposed new location in the 4-tier hierarchy.
* logs/02_dependency_analysis.md: Identification of "Hard Couplings" between services that must be broken or abstracted before moving.
* logs/03_migration_roadmap.md: A step-by-step execution guide (Sprint-based) for moving code without losing a single edge case or business rule.
* logs/04_data_integrity_checklist.md: A list of critical business rules found in the current code that must be preserved and verified after moving to the new structure.

Instructions for Code Analysis:

   1. Extract Logic: Move business logic from Controllers to Actions.
   2. DTO Implementation: Use Data Transfer Objects to pass data between layers instead of raw arrays or Request objects.
   3. Route Decoupling: Propose a new routing structure that mirrors the Feature Groups.
   4. Interface Abstraction: Suggest where Interfaces should be used in the Capability layer to ensure flexibility.

Immediate Task:
Start by providing the Strategic Framework for this refactoring and the template for logs/01_source_inventory.md. I will then provide the file structures or specific code snippets for you to analyze.