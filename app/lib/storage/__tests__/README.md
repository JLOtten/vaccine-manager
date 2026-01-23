# Automerge Storage Tests

This directory contains tests for the AutomergeStorageAdapter implementation.

## Running Tests

```bash
# Run tests once
pnpm test:run

# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## Test Structure

The tests cover the following areas:

### Initialization

- Document initialization
- Default vaccines setup

### Family Members

- Adding family members
- Retrieving all family members
- Retrieving a specific family member by ID
- Updating family members
- Deleting family members
- Cascade deletion of vaccine records when deleting a family member

### Vaccines

- Retrieving all vaccines
- Retrieving a specific vaccine by ID
- Handling non-existent vaccines

### Vaccine Records

- Adding vaccine records
- Retrieving all vaccine records
- Filtering vaccine records by family member
- Retrieving a specific vaccine record by ID
- Updating vaccine records
- Deleting vaccine records

### Utility Operations

- Clearing all data
- Exporting data as binary (CRDT format)
- Exporting data as JSON
- Importing binary data

### Error Handling

- Handling updates to non-existent family members
- Handling updates to non-existent vaccine records

## Test Implementation Notes

The tests use Vitest with mocked Automerge Repo dependencies. The mock implementation:

1. Creates a mock Repo class that simulates document creation and retrieval
2. Mocks the IndexedDBStorageAdapter (since tests don't have access to a real IndexedDB)
3. Mocks Automerge core functions like `save()`, `load()`, and `merge()`
4. Uses a shared mock document data object that all tests operate on

### Mocking Strategy

The tests use a functional mock approach where:

- The Repo mock returns DocHandle-like objects with `doc()`, `docSync()`, and `change()` methods
- Changes are applied directly to a shared mock data object
- The mock simulates async behavior where appropriate

## Adding New Tests

When adding new tests:

1. Reset mock data in `beforeEach` to ensure test isolation
2. Use the `storage` instance created in `beforeEach`
3. Mock any new Automerge functions as needed
4. Verify both success cases and error cases
5. Use `await` for async operations

Example:

```typescript
it("should do something new", async () => {
  // Arrange
  const input = {
    /* test data */
  };

  // Act
  const result = await storage.someNewMethod(input);

  // Assert
  expect(result).toBeDefined();
  expect(result.someProperty).toBe(expectedValue);
});
```
