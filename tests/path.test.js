// noinspection JSUnresolvedReference

import {join} from "../src/assets/scripts/http.js";

test("No separator", () =>
    expect(join("Test1", "Test2")).toBe("Test1/Test2"));

test("First separator", () =>
    expect(join("Test1/", "Test2")).toBe("Test1/Test2"));

test("Second separator", () =>
    expect(join("Test1", "/Test2")).toBe("Test1/Test2"));

test("Both separator", () =>
    expect(join("Test1/", "/Test2")).toBe("Test1/Test2"));

test("Empty first separator", () =>
    expect(join("/", "")).toBe("/"));

test("Empty second separator", () =>
    expect(join("", "/")).toBe("/"));

test("Empty both separator", () =>
    expect(join("/", "/")).toBe("/"));

test("Empty both", () =>
    expect(join("", "")).toBe(""));

test("Trailing separator", () =>
    expect(join("Test1", "Test2", "/")).toBe("Test1/Test2/"));

test("Question mark", () =>
    expect(join("Test1", "?Test2")).toBe("Test1?Test2"));

test("Question mark separator", () =>
    expect(join("Test1/", "?Test2")).toBe("Test1?Test2"));

test("No values provided", () =>
    expect(() => join()).toThrow("Less than two paths were provided "));

test("Only one value provided", () =>
    expect(() => join("value")).toThrow("Less than two paths were provided value"));