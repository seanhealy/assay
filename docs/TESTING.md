# Testing

- [Describe your Files](#describe-your-files)
  - [When The filename Doesn't Match the Exports / Multiple Exports](#when-the-filename-doesnt-match-the-exports--multiple-exports)
- [Nest Describes to add Context](#nest-describes-to-add-context)
- [Use it to Describe the Expected Behaviour](#use-it-to-describe-the-expected-behaviour)
- [Single Expectation Tests](#single-expectation-tests)
- [Use Subjects](#use-subjects)
- [Before/After Hooks should be Single Concern](#beforeafter-hooks-should-be-single-concern)
- [Don't use 'should'](#dont-use-should)
- [Describe the Expected Behaviour / What the User Will See](#describe-the-expected-behaviour--what-the-user-will-see)
- [Use Factories](#use-factories)
- [When to Mock](#when-to-mock)
- [Inspiration](#inspiration)

## Describe your Files

Usually a file should have a single named export that is named the same as the
containing file. In this case your root describe should be the exported object.

#### Bad

```ts
describe("a Hamburger Menu component", () => {});
describe("a function that describes sandwiches", () => {});
describe("a constant holding our ingredients", () => {});
```

#### Good

```ts
describe("<HamburgerMenu />", () => {});
describe("describeSandwiches()", () => {});
describe("ingredients", () => {});
```

### When The filename Doesn't Match the Exports / Multiple Exports

If you have multiple exports in a file or if your file name doesn't match name
of the export then we should have a root level export for the file that is as
short as possible while still being descriptive. That then contains nested
describe blocks for each export following the rules above.

This can happen for Next.js pages / routes or for rare files that have multiple
exports.

#### Bad

```ts
describe("addPickles()", () => {});
describe("removePickles()", () => {});
```

```ts
describe("route", () => {});
describe("POST()", () => {});
```

```ts
describe("page", () => {});
```

#### Good

```ts
describe("pickleManager", () => {
	describe("addPickles()", () => {});
	describe("removePickles()", () => {});
});
```

```ts
describe("sandwich/route", () => {
	describe("POST()", () => {});
});
```

```ts
describe("sandwich/page", () => {
	describe("<SandwichPage />", () => {});
});
```

## Nest Describes to add Context

Use nested describes to add context to your tests. Contexts are a powerful
method to make your tests clear and well organised (they keep tests easy to
read). When describing a context, start its description with 'when', 'as',
'with' or 'without'.

Nested describes can also be used to group tests that share a common setup or
mock requirements. When doing this `beforeEach` is preferred for improved
isolation however for more expensive operations `beforeAll` is also an option.

#### Bad

```ts
it("shows order details when logged in", () => {});
it("redirects to login when logged out", () => {});
```

#### Good

```ts
describe("when logged in", () => {
	beforeEach(setupValidSession);

	it("shows order details", () => {});
});

describe("when logged out", () => {
	beforeEach(setupInvalidSession);

	it("redirects to login", () => {});
});
```

## Use `it` to Describe the Expected Behaviour

#### Bad

```ts
test("constructs a sandwich", () => {});
```

#### Good

```ts
it("constructs a sandwich", () => {});
```

## Single Expectation Tests

Each test should specify one (and only one) behaviour. Multiple expectations in
the same test are a signal that you may be specifying multiple behaviours
however there are cases where multiple expectations do support the testing of a
single behaviour.

When a test fails, it should be immediately clear what behaviour is not working.

#### Bad

```ts
it("should render", () => {
	expect(screen.getByText("Clubhouse")).toBeInTheDocument();
	expect(
		screen.getByText("A delicious sandwich featuring bread and a tomato!"),
	).toBeInTheDocument();
});
```

```ts
it("builds the sandwich", () => {
	const result = buildSandwich(mockSandwich);

	expect(db.contains(mockSandwich)).toBe(true);
	expect(result).toEqual({
		bread: "white",
		tomato: true,
		lettuce: false,
	});
});
```

#### Good

```ts
describe("content", () => {
	it("shows the title", () => {
		expect(screen.getByText("Clubhouse")).toBeInTheDocument();
	});

	it("shows the description", () => {
		expect(
			screen.getByText("A delicious sandwich featuring bread and a tomato!"),
		).toBeInTheDocument();
	});
});
```

```ts
it("formats discounts", () => {
	// In this case while we do have multiple expectations they are all directly
	// related the same single behaviour of the discount being properly formatted.
	expect(screen.getByText("Button")).toHaveClass("discount");
	expect(screen.getByText("Button")).not.toHaveClass("full-price");
});
```

```ts
describe("when it builds a sandwich", () => {
	const result = buildSandwich(mockSandwich);

	it("saves the sandwich to the db", () => {
		expect(db.contains(mockSandwich)).toBe(true);
	});

	it("returns the correct sandwich", () => {
		expect(result).toEqual({
			bread: "white",
			tomato: true,
			lettuce: false,
		});
	});
});
```

## Use Subjects

If you have several tests related to the same subject use a `describe` block to
DRY them up.

#### Bad

```ts
it("shows the title", () => {
	render(<Sandwich title="Clubhouse" />);
	expect(screen.getByText("Clubhouse")).toBeInTheDocument();
});

it("shows the description", () => {
	render(<Sandwich title="Clubhouse" />);
	expect(
		screen.getByText("A delicious sandwich featuring bread and a tomato!"),
	).toBeInTheDocument();
});
```

#### Good

```ts
describe("content", () => {
	beforeEach(() => render(<Sandwich title="Clubhouse" />));

	it("shows the title", () => {
		expect(screen.getByText("Clubhouse")).toBeInTheDocument();
	});

	it("shows the description", () => {
		expect(
			screen.getByText("A delicious sandwich featuring bread and a tomato!"),
		).toBeInTheDocument();
	});
});
```

## Before/After Hooks should be Single Concern

Lifecycle hooks should relate to a single concern.

#### Bad

```ts
describe("with lettuce", () => {
	beforeEach(() => {
		sandwich.addLettuce();
		restaurant.build(sandwich);
	});
});
```

#### Good

```ts
describe("with lettuce", () => {
	beforeEach(() => sandwich.addLettuce());
	beforeEach(() => restaurant.build(sandwich));
});
```

## Don't use 'should'

Do not use should when describing your tests. Use the third person in the
present tense.

#### Bad

```ts
it("should return a sandwich", () => {});
```

#### Good

```ts
it("returns a sandwich", () => {});
```

## Describe the Expected Behaviour / What the User Will See

Describe and test the expected behaviour of the unit you are testing not the
implementation details.

https://testing-library.com/docs/guiding-principles

This is true for both backend and frontend code. We should be testing the
behaviour based on how things will be used and their expected responses.

#### Bad

```ts
it("fetches order from the DB", () => {});
it("calls 'showToast'", () => {});
```

#### Good

```ts
it("returns the order's details", () => {});
it("shows a success message", () => {});
```

## Use Factories

Do not use fixtures because they are difficult to control, use factories
instead. Use them to reduce the verbosity on creating new data.

## When to Mock

Don't overuse mocks however they are useful when you need to isolate the
interface of a dependency. Given that we are also in a strongly typed language
we can rely more on these interfaces however when it is cheap to do calling
through to the true implementation is also fine.

However it can still be beneficial to ensure that we have correctly called our
dependency rather than leaning on its side effects as that couples your
implementation to its implementation.

> Mock-based tests are more coupled to the interfaces in your system, while
> classical tests are more coupled to the implementation of an object's
> collaborators.
>
> –
> [Thoughts on Mocking](https://web.archive.org/web/20220612005103/http://myronmars.to/n/dev-blog/2012/06/thoughts-on-mocking)

## Inspiration

Most of our inspiration for test guidance comes from
https://www.betterspecs.org/ while this is written for RSpec it is still a good
guide for writing tests in general.

We're also taking some guidance from https://bettertests.js.org/.
