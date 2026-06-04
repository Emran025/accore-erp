# Numeration & Number Range System

## Overview
The Numeration System in accore is a core infrastructure component designed to emulate the professional-grade flexibility and robustness found in world-class ERP systems like **SAP (Transaction SNRO)**. It provides a unified mechanism for generating unique, sequential identification numbers for various system entities—such as employees, customers, suppliers, and invoices—ensuring data integrity, preventing overlaps, and maintaining a comprehensive audit trail.

## Design Philosophy
The system is built as a self-contained "Engine." Its responsibility extends beyond simple increments; it manages complex numbering policies including:
1. **Centralized Initialization:** No numbering can begin without defining a "Number Range Object" (NRO) that specifies technical parameters like number length and prefix.
2. **Separation of Groups and Intervals:** The system allows entities to be categorized into Groups, which are then linked to specific Number Intervals. This allows different types of employees or documents to have distinct or shared number ranges.
3. **Automatic vs. Manual Control:** Supports both Internal Intervals (automatic system generation) and External Intervals (manual user entry within valid range boundaries).
4. **Continuity & Scalability:** Provides built-in tools for expanding ranges as they fill up, complete with mandatory reasoning for audit purposes.

## Core Entities

### 1. Number Range Object (NRO)
The top-level container for a specific entity type (e.g., `EMPLOYEES`). It defines:
- **Number Length:** The number of digits (e.g., length of 8 allows ranges up to 99,999,999).
- **Prefix:** An optional string prepended to the number (e.g., `EMP-`).

### 2. Groups
Sub-categories within an NRO. For example, "Sales Staff" and "Management" can be different groups. Each group is assigned a unique code.

### 3. Intervals
The actual numeric durations (From - To). The system tracks the "Current Number" to know exactly where the next generation should start.

### 4. Assignments
The logical link that connects a Group to a specific Interval. Multiple groups can share a single interval, or each can have its own private range.

## Workflow
1. **Initialization:** The Administrator defines a new NR Object (e.g., for Customers).
2. **Interval Definition:** Adding a range (e.g., From 1000 To 5000) and setting its type to Internal.
3. **Group Creation:** Segmenting customers into (Regular, Wholesale, VIP).
4. **Linking:** Assigning the "Wholesale Customers" group to use the 1000-5000 interval.
5. **Generation:** When a new wholesale customer is created, the system automatically pulls the next available number (e.g., 1001), formats it, and returns it.
