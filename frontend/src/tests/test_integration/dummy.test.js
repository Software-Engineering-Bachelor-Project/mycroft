/*
 * In this map integration tests should be written
 * TODO: Remove this file once any other file with integration tests has been written
 */

/*
 * In this file there are some example tests,
 * A test file need to be named *.test.js inorder to be run by JEST (The testing framework)
 *
 * The naming convention is: (name of file/ component that is being tested).test.js
 * The test files should be located in either the map test_integraton (integration test) or test_unit (unittest)
 * depending on what type of test it is
 */

test("two plus two is four", () => {
  expect(2 + 2).toBe(4);
});

test("object assignment", () => {
  const data = { one: 1 };
  data["two"] = 2;
  expect(data).toEqual({ one: 1, two: 2 });
});

test("adding positive numbers is not zero", () => {
  for (let a = 1; a < 10; a++) {
    for (let b = 1; b < 10; b++) {
      expect(a + b).not.toBe(0);
    }
  }
});
