# PromptCanvas Data Model

This document defines the Version 1 data model for PromptCanvas. It outlines the core entities, their attributes, and strict relational structures necessary for the application's foundational functionality.

## User

The `User` model represents the individuals accessing the PromptCanvas platform. It is managed in conjunction with our authentication provider.

- **id:** The primary identifier for the user. Maps directly to the authentication service UUID.
- **email:** The user's primary contact and authentication email address. Must be unique.
- **full_name:** The user's display name for personalization within the interface.
- **avatar_url:** A URL pointing to the user's profile image.
- **created_at:** The exact date and time the user registered.
- **updated_at:** The exact date and time the user record was last modified.

## Product

The `Product` model is the central entity in PromptCanvas, representing a software idea being architected by a user.

- **id:** The primary unique identifier for the product.
- **owner_id:** Foreign key referencing the `User` who created and owns the product.
- **name:** The working title or formal name of the software product.
- **description:** A high-level summary of what the product does.
- **problem:** The core problem or pain point the product aims to solve.
- **target_users:** A description of the primary audience and personas using the product.
- **goals:** The business or technical objectives defining the product's success.
- **status:** The current lifecycle stage of the product (see Product Status).
- **created_at:** The exact date and time the product was created.
- **updated_at:** The exact date and time the product was last modified.

## Product Status

The lifecycle of a Product is strictly tracked using an enumerated status field. Allowed statuses are:

- **Draft:** The product has been initialized but the planning process has barely begun.
- **Planning:** The product is currently being actively defined within the wizard workflow.
- **Completed:** The wizard is finished, and a formal blueprint has been successfully generated.
- **Archived:** The product is no longer active but is retained safely for historical reference.

## Wizard Progress

To support a seamless and forgiving user experience, we track the user's position within the multi-step Product Wizard. This prevents data loss during session interruptions.

- **current_step:** Identifies the exact step the user is currently interacting with in the sequence.
- **completed_steps:** An array of step identifiers that the user has successfully validated and finished.
- **last_edited:** The timestamp of the most recent interaction with the wizard flow.

## Blueprint

The Blueprint represents the compiled, structured output generated after completing the Product Wizard. It serves as the definitive architectural specification for the software idea, encapsulating the following structured sections:

- **Problem**
- **Target Users**
- **Goals**
- **Features**
- **MVP**
- **Success Metrics**
- **Future Ideas**

## Relationships

The data structure relies on a strict, hierarchical relational model:

**One User**  
↓  
**Many Products**

**Each Product**  
↓  
**One Blueprint**

## Version 1 Constraints

To ensure a robust, maintainable, and highly focused initial release, Version 1 intentionally restricts scope to guarantee engineering stability. The following capabilities are explicitly NOT supported in this version:

- **No collaboration:** Products are entirely private to their single owner.
- **No teams:** There are no shared workspaces, roles, or organizational structures.
- **No comments:** Users cannot annotate, debate, or discuss blueprints within the platform.
- **No AI editing:** Blueprints are not dynamically modified or interpreted by artificial intelligence.
- **No version history:** Changes to products or blueprints overwrite the existing state; historical diffing and rollbacks are not tracked.
